import React, { useState } from "react";
import "./ReportCard.css";
import { dashBoardData } from "../../data";
import TableWithSmlCard from "../Table/TableWithSmlCard";

const ReportCard = () => {
  const [subPages, setSubPages] = useState("marketing");
  return (
    <>
      <div id="reportSec">
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
            {<TableWithSmlCard datas={dashBoardData[subPages]} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportCard;
