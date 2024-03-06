import React from "react";
import "./ReportSmlCard.css";
import DonutChart from "../Chart/DonutChart";

const ReportSmlDonutChart = (props) => {
  const { title = null, description = null, datas = null } = props;
  return (
    <div className="contentBody donutChart">
      <div className="title">{title}</div>
      <div className="chartObj center">
        <DonutChart datas={datas} />
      </div>
      <div className="description">{description}</div>
    </div>
  );
};

export default ReportSmlDonutChart;
