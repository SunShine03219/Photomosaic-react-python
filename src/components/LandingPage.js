import React from "react";
import demo from "./demo.gif";
import { LazyLoadImage } from "react-lazy-load-image-component";

function LandingPage({ setCurrentStep }) {
  return (
    <div className="container text-center">
      <h5 className="mt-3">
        In the field of photographic imaging, a photographic mosaic, also known
        under the term Photomosaic, is a picture that has been divided into
        tiled sections, each of which is replaced with another photograph that
        matches the target photo. Here's an example
      </h5>

      <LazyLoadImage
        effect="blur"
        src={demo}
        id="landing-gif"
        className="mt-5"
      />

      <button
        onClick={() => setCurrentStep(2)}
        type="button"
        className="btn btn-primary btn-lg btn-block mt-5"
      >
        Make Mosaic with test Flower image set
      </button>
      <button
        onClick={() => setCurrentStep(1)}
        type="button"
        className="btn btn-primary btn-lg btn-block"
      >
        Make Mosaic with your own custom image set
      </button>
    </div>
  );
}

export default LandingPage;
