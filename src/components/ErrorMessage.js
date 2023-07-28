import React from "react";

function ErrorMessage({ error }) {
  return error !== "" ? (
    <div className="alert alert-danger mt-3 mb-3">
      <strong>{error}</strong>
    </div>
  ) : null;
}

export default ErrorMessage;
