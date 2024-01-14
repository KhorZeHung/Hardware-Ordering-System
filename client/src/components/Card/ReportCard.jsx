import React, { useState } from "react";
import "./ReportCard.css";
import MarketingCard from "./MarketingCard";
import SalesCard from "./SalesCard";
import ProjectCard from "./ProjectCard";
import AccountCard from "./AccountCard";

const ReportCard = () => {
  const [subPages, setSubPages] = useState("marketing");
  return (
    <>
      <div id="reportSec">
        <hr />
        <h6>report</h6>
        <div className="body">
          <ul>
            {["marketing", "sales", "project", "account"].map((pages) => (
              <li
                className={subPages === pages ? "selected" : ""}
                key={pages}
                onClick={() => setSubPages(pages)}>
                {pages}
              </li>
            ))}
          </ul>
          <div className="content center">
            {(() => {
              switch (subPages) {
                case "marketing":
                  return <MarketingCard />;
                case "sales":
                  return <SalesCard />;
                case "project":
                  return <ProjectCard />;
                case "account":
                  return <AccountCard />;
                default:
                  break;
              }
            })()}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportCard;
