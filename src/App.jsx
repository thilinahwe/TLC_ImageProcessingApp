import { useState } from "react";
import "./App.css";

export default function App() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;
  const sum = numA + numB;

  return (
    <div className="container">
      <h1>Two-Number Adder</h1>

      <div className="row">
        <label>
          First number
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="Enter first number"
          />
        </label>

        <label>
          Second number
          <input
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="Enter second number"
          />
        </label>
      </div>

      <div className="result">
        <strong>Sum: {sum}</strong>
      </div>
    </div>
  );
}
