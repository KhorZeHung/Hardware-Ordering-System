import React from "react";
import "./ProgressBar.css";
import { Line } from "rc-progress";

const ProgressBar = ({ percent }) => {
  const scale = Math.round(percent / 20);
  return (
    <>
      <div className="progressBarWrapper center small">
        <Line
          percent={percent}
          strokeWidth={14}
          trailWidth={14}
          strokeColor={`var(--primary-color-${scale})`}
        />
        <span className="center percentageSml">{percent}%</span>
      </div>
    </>
  );
};

export default ProgressBar;
