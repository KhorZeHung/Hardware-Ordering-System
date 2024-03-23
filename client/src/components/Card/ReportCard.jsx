import React, { useContext, useState, useEffect } from "react";
import "./ReportCard.css";
import { APIGateway, dashBoardData } from "../../data";
import TableWithSmlCard from "../Table/TableWithSmlCard";
import axios from "axios";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../Snackbar/SnackBarProvidor";
import { CircularProgress, Dialog } from "@mui/material";
import { constructInput } from "../Form/FormBody";
import "../Form/FormBody.css";

const ReportCard = () => {
  const [subPages, setSubPages] = useState("marketing");
  const [dashBoardInfo, setDashBoardInfo] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [filterValue, setFilterValue] = useState({});
  const { setSnackbar } = useContext(SnackbarContext);

  useEffect(() => {
    fetchData();

    return () => {};
    // eslint-disable-next-line
  }, [setSnackbar]);

  const fetchData = () => {
    const token = getCookie("token");
    let url = APIGateway + "/dashboard";
    if (Object.keys(filterValue).length !== 0) {
      Object.entries(filterValue).forEach(([key, value], index) => {
        if (index === 0) {
          url += "?";
        } else {
          url += "&";
        }
        url += `${key}=${value}`;
      });
    }
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const { data } = res.data;
        console.log(data);
        setDashBoardInfo(data);
      })
      .catch((err) => {
        const message = err.message || "Something went wrong";
        console.log(err.message);
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };

  const inputHandler = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setFilterValue((prev) => ({ ...prev, [name]: value }));
  };

  const updateFilterValue = () => {
    setModalOpen(false);
    fetchData();
  };
  console.log(filterValue);
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
          <div className="filterSec">
            <button onClick={() => setModalOpen(true)}>filter</button>
          </div>
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
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        scroll="body"
        maxWidth={"xs"}>
        <div className="formBody">
          <div className={`formInputLists`}>
            {dashBoardData.filterForm.inputLists &&
              constructInput(
                dashBoardData.filterForm.inputLists,
                inputHandler,
                null
              )}
          </div>
          <div className="formAction">
            <button onClick={updateFilterValue}>filter</button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ReportCard;
