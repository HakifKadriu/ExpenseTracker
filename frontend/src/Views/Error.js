import React from "react";
import { Link } from "react-router-dom";

const Error = () => {
  return (
    <div
      className="registerBody"
    >
      <h1>404</h1>
      <p style={{ fontSize: "1.5rem", textAlign: "center" }}>
        Page not found<br></br>Oops! The page you are looking for does not
        exist. It might have been moved or deleted.
      </p>
      <p>
        <Link to="/ExpenseTracker">Back to home</Link>
      </p>
    </div>
  );
};

export default Error;
