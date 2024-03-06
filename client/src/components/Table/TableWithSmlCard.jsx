import React from "react";
import ReportSmlDonutChart from "../Card/ReportSmlDonutChart";
import ReportSmlTxtCard from "../Card/ReportSmlTxtCard";
import FilterTable from "./FilterTable";
import BarChart from "../Chart/BarChart";
import "./TableWithSmlCard.css";

const TableWithSmlCard = (props) => {
  const {
    cardData = null,
    donutChartData = null,
    tableData = null,
    barChartData = null,
  } = props.datas;

  return (
    <div style={{ width: "100%" }}>
      {barChartData && <BarChart datas={barChartData} />}
      <div className="smallCardSec">
        {donutChartData && (
          <ReportSmlDonutChart
            description={donutChartData.description}
            title={donutChartData.title}
            datas={donutChartData.datas}
          />
        )}
        {cardData &&
          cardData.map(({ value, description, title }) => {
            return (
              <ReportSmlTxtCard
                key={title}
                value={value}
                description={description}
                title={title}
              />
            );
          })}
      </div>
      {tableData && <FilterTable datas={tableData} />}
    </div>
  );
};

export default TableWithSmlCard;
