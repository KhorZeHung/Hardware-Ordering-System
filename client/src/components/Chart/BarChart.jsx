import React from "react";
import Chart from "react-apexcharts";

const BarChart = ({ datas }) => {
  
  const chartInfo = {
    options: {
      xaxis: datas.xaxis,
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
    series: datas.series,
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
