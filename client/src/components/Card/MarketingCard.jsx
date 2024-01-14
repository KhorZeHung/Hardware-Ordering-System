import React from "react";
import "./ReportCard.css";
import FilterTable from "../Table/FilterTable";
import ReportSmlTxtCard from "./ReportSmlTxtCard";

const MarketingCard = () => {
  const smlCardValue = [
    {
      value: "43",
      description: "last month",
      title: "new quote",
    },
    {
      value: "33.33%",
      description: "last month",
      title: "deal rate",
    },
    {
      value: "30.13%",
      description: "per month",
      title: "avg deal rate",
    },
    {
      value: "RM 268212.00",
      description: "per proj",
      title: "avg charge",
    },
  ];
  return (
    <div className="subBody">
      <div className="smallCardSec">
        {smlCardValue.map(({ value, description, title }) => {
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
      <FilterTable />
    </div>
  );
};

export default MarketingCard;
