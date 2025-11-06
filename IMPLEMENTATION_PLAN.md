# TLC Image Analyzer — Browser-Based React Implementation Plan

This document describes how to implement the TLC Image Analyzer (originally written in MATLAB) entirely as a **browser-based React web application**, without any backend. All computations will run locally in the user’s browser using WebAssembly and JavaScript libraries.

---

## 0. Technology Stack

- **Frontend Framework:** React + Vite
- **State Management:** Zustand
- **Processing:** OpenCV.js (WASM), GPU.js (optional for acceleration)
- **File Parsing:**
  - TIFF: geotiff.js or UTIF.js
  - MAT (flat field): mat-file-parser
  - RAW/BIN: FileReader + DataView
- **Image Display & ROI Tools:** react-konva
- **Data Export:** JSZip + FileSaver
- **Hashing / Integrity:** Web Crypto API (SHA-256)
- **Performance:** Web Workers + Comlink for heavy computation

---

## 1. App Structure & Routing

**Main Pages**
1. Upload & Parameters
2. Processing & Preview
3. Background Selection
4. ROI Selection
5. Results & Export

Each page corresponds to one major step of the MATLAB workflow.

---

## 2. File Loaders

- Load TIFF or BIN images (uint16) and `.mat` flat field data.
- Validate all images have the same shape.
- Implement optional cropping for bin = 3 (e.g., 3006×3006).
- Store arrays in `Uint16Array` or `Float32Array` buffers.

---

## 3. Processing Pipeline (Web Worker)

Perform the full MATLAB-equivalent pipeline in a dedicated Web Worker thread:

1. **Binning** (`bin ∈ {1, 2, 3, 4}`)
   - Crop for `bin = 3`.
   - Sum across strides for `data`, `dark`, `flat`.
2. **Dark Subtraction**
   - `corrected = data2 - dark2 / dark_multiplier`, clamp ≥ 0.
3. **Convert to Double**
   - Cast to `Float32Array`.
4. **Flat Correction**
   - Element-wise multiply: `corrected2 = corrected * flat2`.
5. **Median Filtering**
   - 2D median filter using OpenCV.js (`ksize=3`).
6. **Rotate 180°**
   - To match MATLAB orientation.
7. **Background Subtraction**
   - Compute mean from selected polygon mask, subtract scalar.
8. **Preview Generation**
   - Normalize and convert to 8-bit PNG for display.

---

## 4. Background Selection (Freehand ROI)

- Display processed image preview.
- Allow user to draw a **freehand polygon** with react-konva.
- Compute mean pixel value within polygon mask.
- Subtract that mean from the entire image (handled by the Worker).

---

## 5. ROI Definition (Lanes & Bands)

- Prompt user for:
  - Number of lanes
  - Bands per lane
- For each band:
  - Draw a **freehand ROI polygon**
  - Label automatically (e.g., "Lane 1 Band 2")
- Compute:
  - ROI pixel sum
  - Lane total sum
  - ROI fraction = ROI_sum / Lane_sum
- Display a table dynamically.

---

## 6. Bright-Field Overlay

- Load bright-field TIFF.
- Resize to match processed dimensions.
- Apply same flips and orientation.
- Render both layers:
  - Cerenkov/scintillation → colormap “hot”
  - Bright-field → grayscale
- Blend with adjustable alpha slider.

---

## 7. Export & Reporting

- Export bundle as `.zip`:

- Include:
- ROI coordinates & values
- Fractions per lane
- Manifest with operations, parameters, and SHA-256 hashes.

---

## 8. Performance Optimization

- Run all heavy steps (binning, median, flat correction) in a **Web Worker**.
- Keep only one full-resolution image buffer in memory at a time.
- Throttle preview rendering.
- Optionally use GPU.js for matrix multiplications.

---

## 9. Determinism & Reproducibility

- Generate SHA-256 hashes for each input file.
- Record processing parameters:
- bin, dark_multiplier, median_ksize, rotation, background_mean
- Save library versions and browser info in manifest.
- “Reprocess” button re-runs the pipeline and compares hashes.

---

## 10. Deployment

- Build static files:
```bash

npm run build
