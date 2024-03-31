import React, { useState, useEffect, useRef, useContext } from "react";
import "./FilterTable.css";
import CircularProgress from "@mui/material-next/CircularProgress";
import axios from "axios";
import { APIGateway } from "../../data";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";

const FilterTable = ({ datas }) => {
  const {
    checkBox = {
      handlerArray: [],
    },
    endPoint,
    filter = null,
  } = datas;

  const [tableData, setTableData] = useState(null);
  const [tableHeader, setTableHeader] = useState(null);
  const [tableIsLoading, setTableIsLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [filterValue, setFilterValue] = useState({
    searchTerm: null,
    filterOption: null,
    page: 1,
    sort: {
      value: "id",
      isDesc: true,
    },
  });
  const searchTermRef = useRef();
  const { setSnackbar } = useContext(SnackbarContext);
  useEffect(() => {
    setTableIsLoading(true);
    const fetchData = async () => {
      try {
        var APIEndpoint = `${APIGateway}${endPoint}?`;

        const { searchTerm, filterOption, page, sort } = filterValue;
        const { value, isDesc } = sort;

        if (searchTerm !== null && searchTerm.length > 1) {
          APIEndpoint += `searchterm=${encodeURIComponent(searchTerm)}&`;
        }

        if (filterOption !== null) {
          APIEndpoint += `filteroption=${encodeURIComponent(filterOption)}&`;
        }
        if (page) {
          APIEndpoint += `page=${page || 1}&`;
        }
        if (value) {
          APIEndpoint += `sort=${value}&`;
        }
        if (isDesc) {
          APIEndpoint += `desc=${!isDesc}&`;
        }

        APIEndpoint = APIEndpoint.slice(0, -1);
        const token = getCookie("token");

        const response = await axios.get(APIEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { thead, tbody } = response.data.data;
        setTableData(tbody);
        setPages(1);
        if (!tableHeader || !thead.equals(tableHeader)) setTableHeader(thead);
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
    //eslint-disable-next-line
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

  const sortHandler = (value) => {
    setFilterValue((prev) => {
      const isDesc = prev.sort.value === value ? !prev.sort.isDesc : false;
      return {
        ...prev,
        sort: {
          value,
          isDesc,
        },
      };
    });
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
            {tableHeader && tableData && tableData.length > 0 ? (
              <>
                <table>
                  <thead>
                    <tr>
                      {tableHeader.map((value) => (
                        <th
                          key={`thead-${value}`}
                          onClick={() => sortHandler(value)}>
                          {value}
                          {filterValue.sort.value === value && (
                            <span
                              className={`material-symbols-outlined sortSign ${
                                filterValue.sort.value === value &&
                                filterValue.sort.isDesc &&
                                "desc"
                              }`}>
                              change_history
                            </span>
                          )}
                        </th>
                      ))}
                      {checkBox.handlerArray.length > 0 && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData
                      .slice(25 * (pages - 1), pages * 25 - 1)
                      .map((rowData, rowIndex) => {
                        return (
                          <tr key={`row-${rowIndex}`}>
                            {Object.values(rowData).map(
                              (cellData, cellIndex) => {
                                const theadValue = tableHeader[cellIndex];
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
                                        {String(cellData)}
                                      </a>
                                    </td>
                                  );
                                }
                                return (
                                  <td key={`cell-${theadValue}-${cellIndex}`}>
                                    {String(cellData)}
                                  </td>
                                );
                              }
                            )}
                            {checkBox.handlerArray.length > 0 && (
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
                {tableData.length / 25 > 1 && (
                  <div className="pageControl">
                    {pages > 1 && (
                      <span onClick={() => setPages(pages - 1)}>previous</span>
                    )}
                    <span id="pageNumber">{pages}</span>
                    {tableData.length / 25 > pages && (
                      <span
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          setPages(pages + 1);
                        }}>
                        next
                      </span>
                    )}
                  </div>
                )}
              </>
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
