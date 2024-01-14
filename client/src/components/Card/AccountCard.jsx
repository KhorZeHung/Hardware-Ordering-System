import React from "react";
import "./ReportCard.css";
import FilterTable from "../Table/FilterTable";
import ReportSmlTxtCard from "./ReportSmlTxtCard";

const AccountCard = () => {
  const smlCardValue = [
    {
      value: "RM 314432.30",
      description: "per month",
      title: "new payment",
    },
    {
      value: "RM 214132.29",
      description: "per month",
      title: "avg payment",
    },
    {
      value: "RM 434300.00",
      description: "10 projects",
      title: "active outstanding",
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

export default AccountCard;
