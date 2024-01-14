import React from "react";
import "./ReportCard.css";
import FilterTable from "../Table/FilterTable";
import ReportSmlTxtCard from "./ReportSmlTxtCard";

const ProjectCard = () => {
  const smlCardValue = [
    {
      value: "15",
      description: "last month",
      title: "new project",
    },
    {
      value: "11.34",
      description: "per month",
      title: "avg new proj",
    },
    {
      value: "20",
      description: "currently",
      title: "active proj",
    },
    {
      value: "85.66%",
      description: "currently",
      title: "active progress",
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

export default ProjectCard;
