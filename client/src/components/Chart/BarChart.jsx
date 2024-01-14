import React from "react";
import { Bar } from "react-chartjs-2";
// eslint-disable-next-line

const BarChart = () => {
  return (
    <>
      <Bar
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
          datasets: [
            {
              label: "Sales",
              data: [1, 2, 3, 4, 5, 4, 3, 2, 3],
              borderColor: "none",
              backgroundColor: "#81d8d0",
            },
            {
              label: "Marketing",
              data: [2, 3, 4, 2, 1, 3, 2, 5, 4],
              borderColor: "none",
              backgroundColor: "#27413e",
            },
          ],
          options: {
            layout: {
              padding: {
                left: 50,
              },
            },
          },
        }}
      />
    </>
  );
};

export default BarChart;
