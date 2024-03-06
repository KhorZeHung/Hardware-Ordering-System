import React from "react";
import Chart from "react-apexcharts";

const DonutChart = ({ datas }) => {
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
      labels: ["< 100k", "100k - 200k", "200k - 400k", "> 400k"],
      legend: {
        fontSize: "9px",
        horizontalAlign: "right",
        verticalAlign: "middle",
      },
    },
    series: datas,
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
