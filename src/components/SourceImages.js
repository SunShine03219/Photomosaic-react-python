import React from "react";
import GrabFromInternet from "./GrabFromInternet";

import UploadMyOwn from "./UploadMyOwn";

import { useScrollPosition } from "@n8tb1t/use-scroll-position";

function SourceImages({ incrementStep, setDirname }) {
  useScrollPosition(({ prevPos, currPos }) => {
    if (prevPos.y < 0 && currPos.x === 0 && currPos.y === 0)
      window.scrollTo(prevPos.x, Math.abs(prevPos.y));
  });
  return (
    <>
      <ul className="nav nav-tabs list-inline">
        <li className="nav-item">
          <a className="nav-link" data-toggle="tab" href="#uploadMyOwn">
            Upload My Own
          </a>
        </li>
        <li className="nav-item">
          <a
            className="nav-link active"
            data-toggle="tab"
            href="#grabFromInternet"
          >
            Grab from the internet
          </a>
        </li>
      </ul>
      <div id="myTabContent" className="tab-content">
        <UploadMyOwn incrementStep={incrementStep} setDirname={setDirname} />
        <GrabFromInternet
          incrementStep={incrementStep}
          setDirname={setDirname}
        />
      </div>
    </>
  );
}

export default SourceImages;
