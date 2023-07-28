import React from "react";

function ProgressBar({ filesUploaded, totalFiles }) {
  return (
    <>
      <h3 className="text-center">
        Files uploaded {filesUploaded}/{totalFiles}
      </h3>
      <div className="progress">
        <progress
          style={{ width: "100%" }}
          max="100"
          value={Math.round((filesUploaded / totalFiles) * 100) || 0}
        />
      </div>
    </>
  );
}

export default ProgressBar;
