import React from "react";
import Chart from "react-apexcharts";

const DonutChart = () => {
  const chartInfo = {
    options: {
      dataLabels: {
        enabled: false,
      },
      colors: [
        "#81d8d0",
        "#74c2bb",
        "#67ada6",
        "#5a9792",
        "#416c68",
        "#345653",
        "#27413e",
        "#1a2b2a",
      ],
      labels: ["< 100k", "101k - 200k", "201k - 400k", "> 400k"],
      legend: {
        fontSize: "9px",
        horizontalAlign: "right",
        verticalAlign: "middle",
      },
    },
    series: [44, 55, 41, 17],
  };
  return (
    <Chart
      options={chartInfo.options}
      series={chartInfo.series}
      type="donut"
      height="200px"
      width="300px"
    />
  );
};

export default DonutChart;
