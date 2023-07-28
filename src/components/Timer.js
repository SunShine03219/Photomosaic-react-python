import React from "react";
import Countdown from "react-countdown";

function Timer({ dirname, setDirname, setCurrentStep }) {
  const renderer = ({ minutes, seconds, milliseconds, completed }) => {
    if (completed) {
      const data = new FormData();
      data.append("dirname", dirname);
      fetch("/api/delete", {
        method: "POST",
        body: data,
      }).then((_res) => {
        setDirname("test");
        setCurrentStep(1);
        sessionStorage.removeItem("dirname");
      });
      return <h1>Time Over!</h1>;
    } else {
      return (
        <div className="row text-center timer-row">
          <div className="col-md-12">
            <span className="timer ">
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}:
              {milliseconds.toString().substring(0, 2)}
            </span>
          </div>
        </div>
      );
    }
  };
  return (
    <Countdown
      date={Date.now() + 1000 * 60 * 15}
      intervalDelay={2}
      precision={2}
      renderer={renderer}
    />
  );
}

export default Timer;
