import React from "react";
import "./ReportSmlCard.css";

const ReportSmlCard = (props) => {
  const { title = null, description = null, value = null } = props;

  return (
    <div className="contentBody">
      <div className="title">{title}</div>
      <div className="value">{value}</div>
      <div className="description">{description}</div>
    </div>
  );
};

export default ReportSmlCard;
