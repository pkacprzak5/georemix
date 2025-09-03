import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Map App Test</h1>
      <div className="card">
        <button onClick={() => setCount((prevCount) => prevCount + 1)}>count is {count}</button>
      </div>
    </>
  );
}

export default App;
