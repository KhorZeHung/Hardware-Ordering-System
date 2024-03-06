import React, { useContext, useState, useEffect } from "react";
import "./ReportCard.css";
import { APIGateway } from "../../data";
import TableWithSmlCard from "../Table/TableWithSmlCard";
import axios from "axios";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../Snackbar/SnackBarProvidor";
import { CircularProgress } from "@mui/material";

const ReportCard = () => {
  const [subPages, setSubPages] = useState("marketing");
  const [dashBoardInfo, setDashBoardInfo] = useState({});
  const { setSnackbar } = useContext(SnackbarContext);
  useEffect(() => {
    const token = getCookie("token");
    const url = APIGateway + "/dashboard";
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const { data } = res.data;
        setDashBoardInfo(data);
      })
      .catch((err) => {
        const message = err.message || "Something went wrong";
        console.log(err.message);
        setSnackbar({ open: true, message: message, severity: "error" });
      });

    return () => {};
  }, [setSnackbar]);

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
          {/* <input type="date" name="start_date" id="start_date" />
          <select name="duration" id="duration">
            <option value="1">1 month</option>
            <option value="3">3 month</option>
            <option value="6">6 month</option>
            <option value="9">9 month</option>
            <option value="12">1 years</option>
          </select> */}
          <div className="content center">
            {!dashBoardInfo[subPages] ? (
              <div
                style={{ height: "50vh", width: "100vw" }}
                className="center">
                <CircularProgress />
              </div>
            ) : (
              <TableWithSmlCard datas={dashBoardInfo[subPages]} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportCard;
