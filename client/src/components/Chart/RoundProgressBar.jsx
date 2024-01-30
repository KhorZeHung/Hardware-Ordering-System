import React from "react";
import "./ProgressBar.css";
import { Circle } from "rc-progress";

const RoundProgressBar = ({ percent, title, large = true }) => {
  const scale = Math.round(percent / 20) + 1;
  return (
    <>
      <div className={`progressBarWrapper center ${large ? "large" : "small"}`}>
        <Circle
          percent={percent}
          strokeWidth={10}
          trailWidth={10}
          gapDegree={120}
          trailColor="var(--bckgrd-2)"
          strokeColor={`var(--primary-color-${scale})`}
        />
        <span className="center percentage">{percent}%</span>
        <span className="center title">{title}</span>
      </div>
    </>
  );
};

export default RoundProgressBar;
