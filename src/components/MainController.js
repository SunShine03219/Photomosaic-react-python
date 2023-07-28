import React, { useState, useEffect } from "react";
import SourceImages from "./SourceImages";
import LandingPage from "./LandingPage";

import Timer from "./Timer";

import TileArt from "./TileArt";

function MainController() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dirname, setDirname] = useState("test");

  const callAbort = () => {
    const data = new FormData();
    data.append("dirname", sessionStorage.getItem("dirname"));
    navigator.sendBeacon("/api/delete", data);
    sessionStorage.removeItem("dirname");
  };

  const beforeAbort = (e) => {
    e.preventDefault();
    e.returnValue = "";
    return "Are you sure you want to leave?\nAll your progress will be lost";
  };

  useEffect(() => {
    window.addEventListener("beforeunload", beforeAbort);

    window.addEventListener("unload", callAbort, false);
  }, []);

  const incrementStep = () => setCurrentStep((prevStep) => prevStep + 1);

  let currentComponent;

  switch (currentStep) {
    case 0:
      currentComponent = <LandingPage setCurrentStep={setCurrentStep} />;
      break;
    case 1:
      currentComponent = (
        <SourceImages incrementStep={incrementStep} setDirname={setDirname} />
      );
      break;
    case 2:
      currentComponent = (
        <>
          <Timer
            dirname={dirname}
            setDirname={setDirname}
            setCurrentStep={setCurrentStep}
          />
          <TileArt
            dirname={dirname}
            setDirname={setDirname}
            setCurrentStep={setCurrentStep}
          />
        </>
      );
      break;
    default:
      currentComponent = <h1>404 Page Not found..., Please reload</h1>;
  }

  return <div className="container">{currentComponent}</div>;
}

export default MainController;
