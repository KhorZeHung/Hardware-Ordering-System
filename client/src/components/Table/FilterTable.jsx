import React, { useState, useEffect, useRef, useContext } from "react";
import "./FilterTable.css";
import CircularProgress from "@mui/material-next/CircularProgress";
import axios from "axios";
import { APIGateway } from "../../data";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";

const FilterTable = (props) => {
  const {
    checkBox = {
      handlerArray: [],
    },
    endPoint,
    filter = null,
  } = props.datas;

  const [tableData, setTableData] = useState(null);
  const [tableIsLoading, setTableIsLoading] = useState(true);
  const [filterValue, setFilterValue] = useState({
    searchTerm: null,
    filterOption: null,
  });
  const searchTermRef = useRef();
  const { setSnackbar } = useContext(SnackbarContext);
  useEffect(() => {
    setTableIsLoading(true);
    const fetchData = async () => {
      try {
        var APIEndpoint = `${APIGateway}${endPoint}`;

        const { searchTerm, filterOption } = filterValue;

        if (searchTerm !== null && searchTerm.length > 1) {
          APIEndpoint += `?searchterm=${encodeURIComponent(searchTerm)}`;
        }

        if (filterOption !== null) {
          if (searchTerm !== null && searchTerm.length > 1) {
            APIEndpoint += "&";
          } else {
            APIEndpoint += "?";
          }
          APIEndpoint += `filteroption=${encodeURIComponent(filterOption)}`;
        }
        const token = getCookie("token");

        const response = await axios.get(APIEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const datas = response.data.data;
        setTableData(datas);
      } catch (error) {
        const message =
          error.response.data.message ||
          error.message ||
          "Something went wrong, please try later";
        setSnackbar({ open: true, message: message, severity: "error" });
      } finally {
        setTableIsLoading(false);
      }
    };

    fetchData();

    return () => {};
  }, [filterValue, setSnackbar, endPoint]);

  const clearSearch = () => {
    searchTermRef.current.value = "";
    setFilterValue((prev) => ({ ...prev, searchTerm: null }));
  };

  const searchHandler = (e) => {
    const checkValue = String(e.target.value).toLowerCase();
    setFilterValue((prev) => ({ ...prev, searchTerm: checkValue }));
  };

  const filterHander = (e) => {
    const value = String(e.target.value).toLowerCase();
    var selectedValue;
    if (value === "all") selectedValue = null;
    else selectedValue = value;

    setFilterValue((prev) => ({ ...prev, filterOption: selectedValue }));
  };

  return (
    <div>
      <div className="filterSec spaceBetween">
        <div className="searchBar">
          <input
            type="text"
            placeholder="Search..."
            ref={searchTermRef}
            onChange={searchHandler}
          />
          <div className="searchBarIcon center" onClick={clearSearch}>
            <span className="material-symbols-outlined">close</span>
            <span className="material-symbols-outlined">search</span>
          </div>
        </div>
        <div className="filterOpt center">
          {filter && (
            <>
              <select
                name="tableFilter"
                style={{ minWidth: "50px" }}
                onChange={filterHander}>
                <option value="all">all</option>
                {filter.options.map((value) => {
                  return (
                    <option
                      key={`option-${value.value}`}
                      value={value.value}
                      selected={
                        filterValue.filterOption === value.value
                          ? true
                          : undefined
                      }>
                      {value.name}
                    </option>
                  );
                })}
              </select>
            </>
          )}
        </div>
      </div>
      <hr />
      <div className="tableSec">
        {tableIsLoading ? (
          <div className="center" style={{ height: "400px", width: "100%" }}>
            <CircularProgress />
          </div>
        ) : (
          <>
            {tableData && tableData.tbody.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    {tableData.thead.map((value, index) => (
                      <th key={`thead-${value}`}>{value}</th>
                    ))}
                    {checkBox.handlerArray && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {tableData.tbody.map((rowData, rowIndex) => {
                    return (
                      <tr key={`row-${rowIndex}`}>
                        {Object.values(rowData).map((cellData, cellIndex) => {
                          const theadValue = tableData.thead[cellIndex];
                          if (theadValue.includes("contact")) {
                            const phoneNo = cellData
                              .replace(/^(\+|6|\+6)?/g, "")
                              .replace(/[^0-9]/g, "");
                            return (
                              <td key={`cell-${theadValue}-${cellIndex}`}>
                                <a
                                  style={{
                                    color: "blue",
                                    textTransform: "underline",
                                  }}
                                  href={`https://wa.me/${phoneNo}`}
                                  target="_blank"
                                  rel="noopener noreferrer">
                                  {cellData}
                                </a>
                              </td>
                            );
                          }
                          if (
                            theadValue.includes("address") ||
                            theadValue.includes("location")
                          ) {
                            const address = cellData.replace(/ /g, "+");
                            return (
                              <td key={`cell-${theadValue}-${cellIndex}`}>
                                <a
                                  style={{
                                    color: "blue",
                                    textTransform: "underline",
                                  }}
                                  href={`https://www.google.com/maps/search/?api=1&query=${address}`}
                                  target="_blank"
                                  rel="noopener noreferrer">
                                  {cellData}
                                </a>
                              </td>
                            );
                          }
                          return (
                            <td key={`cell-${theadValue}-${cellIndex}`}>
                              {cellData}
                            </td>
                          );
                        })}
                        {checkBox.handlerArray && (
                          <td className="tableAction">
                            {checkBox.handlerArray.map((value, index) => {
                              return (
                                <span
                                  key={index}
                                  onClick={() =>
                                    value.onClickHandler(rowData.id)
                                  }
                                  className={`${value.name || ""}`}>
                                  {value.name}
                                </span>
                              );
                            })}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div
                className="center"
                style={{
                  height: "200px",
                  width: "100%",
                  backgroundColor: "transparent",
                }}>
                No such data
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FilterTable;
