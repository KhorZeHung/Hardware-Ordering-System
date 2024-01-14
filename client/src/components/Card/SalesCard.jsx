import React from "react";
import "./ReportCard.css";
import FilterTable from "../Table/FilterTable";
import ReportSmlTxtCard from "./ReportSmlTxtCard";

const SalesCard = () => {
  const smlCardValue = [
    {
      value: "RM 635432.30",
      description: "last month",
      title: "new sales",
    },
    {
      value: "RM 764132.29",
      description: "per month",
      title: "avg sales",
    },
    {
      value: "33.34%",
      description: "last month",
      title: "Conversation rate",
    },
    {
      value: "Mr James",
      description: "RM 132k last month",
      title: "top sales",
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

export default SalesCard;
