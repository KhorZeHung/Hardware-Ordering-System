import React from "react";
import Chart from "react-apexcharts";

const DonutChart = ({ datas }) => {
  const { labels, data } = datas;
  const chartInfo = {
    options: {
      dataLabels: {
        enabled: false,
      },
      colors: [
        "#99ccff",
        "#77aaff",
        "#0098f1",
        "#0098f1",
        "#067bd5",
        "#003083",
        "#002473",
        "#001d64",
      ],
      labels: labels,
      legend: {
        fontSize: "9px",
        horizontalAlign: "right",
        verticalAlign: "middle",
      },
    },
    series: data,
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
