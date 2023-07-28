import React from "react";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function ImagePreview({ imageUrls, setFiles, files }) {
  const removeFile = (index) => setFiles(files.filter((_, id) => id !== index));

  return (
    <div className="form-group multi-preview mt-5">
      <div className="ccontainer">
        {imageUrls.map((imageUrl, index) => (
          <div key={index} className="ccc">
            <LazyLoadImage
              effect="blur"
              src={imageUrl}
              width="150px"
              height="150px"
            />

            <a href="/#" onClick={() => removeFile(index)}>
              <i className="fas fa-window-close" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImagePreview;
