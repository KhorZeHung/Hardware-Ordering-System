import React from "react";
import RoundProgressBar from "../Chart/RoundProgressBar";

const GridRoundProgressBarCard = ({ progressArrays = [] }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        gap: "1rem",
        flexWrap: "wrap",
      }}>
      {progressArrays.map(({ title, percent }, index) => (
        <RoundProgressBar
          title={title}
          percent={percent}
          key={`round_progress_${title}`}
        />
      ))}
    </div>
  );
};

export default GridRoundProgressBarCard;
