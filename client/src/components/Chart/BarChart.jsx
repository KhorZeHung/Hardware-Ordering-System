import React from "react";
import Chart from "react-apexcharts";

const BarChart = () => {
  const chartInfo = {
    options: {
      xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
      },
      title: {
        text: "Marketing and sales comparison",
        margin: 20,
        align: "center",
        style: {
          fontSize: "15px",
          fontWeight: "200",
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "15px",
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#74c2bb", "#27413e"],
    },
    series: [
      {
        name: "marketing",
        data: [30, 40, 45, 50, 49, 60, 70, 91],
      },
      {
        name: "sales",
        data: [70, 66, 88, 100, 99, 80, 100, 121],
      },
    ],
  };

  return (
    <>
      <Chart
        options={chartInfo.options}
        series={chartInfo.series}
        type="bar"
        width="100%"
        height="300px"
      />
    </>
  );
};

export default BarChart;
