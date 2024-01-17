import React, { useState, useEffect } from "react";
import "./FilterTable.css";
import CircularProgress from "@mui/material-next/CircularProgress";
import axios from "axios";

const clearSearch = () => {
  document.getElementById("searchTerm").value = "";
};

const FilterTable = (props) => {
  const { checkBox = false } = props;

  const [column, setColumn] = useState(null);
  const [asc, setAsc] = useState(false);
  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://dummyjson.com/products");
        const datas = response.data;
        setTableData(datas.products);
        var columns = Object.keys(datas.products[0]).slice(0, 4);
        setColumn(columns);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const sortTable = (columnName) => {
    const sortedData = [...tableData].sort((a, b) => {
      if (a[columnName] < b[columnName]) {
        return asc ? 1 : -1;
      }
      if (a[columnName] > b[columnName]) {
        return asc ? -1 : 1;
      }
      return 0;
    });
    setAsc((prev) => !prev);
    setTableData(sortedData);
  };

  function checkBoxHandler(event) {
    const checked = event.target.checked;
    const checkBoxes = document.querySelectorAll("input[type='checkbox']");

    checkBoxes.forEach((checkbox) => {
      checkbox.checked = checked;
    });
  }

  return (
    <div>
      <div className="filterSec spaceBetween">
        <div className="searchBar">
          <input type="text" placeholder="Search..." id="searchTerm" />
          <div className="searchBarIcon center">
            <span className="material-symbols-outlined" onClick={clearSearch}>
              close
            </span>
            <span className="material-symbols-outlined">search</span>
          </div>
        </div>
        <div className="filterOpt center">
          <select name="tableFilter">
            <option value="1" defaultChecked>
              latest
            </option>
            <option value="1">oldest</option>
            <option value="1">last week</option>
            <option value="1">last month</option>
          </select>
        </div>
      </div>
      <hr />
      <div className="tableSec">
        {!column ? (
          <div className="center" style={{ height: "400px", width: "100%" }}>
            <CircularProgress />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {checkBox && column.length > 0 ? (
                  <th>
                    <input type="checkbox" onChange={checkBoxHandler} />
                  </th>
                ) : null}
                {column &&
                  column.map((value, index) => {
                    return (
                      <th key={index} onClick={() => sortTable(value)}>
                        {value}
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody>
              {tableData &&
                tableData.map(({ id, title, description, price }) => {
                  return (
                    <tr key={id}>
                      {checkBox && (
                        <th>
                          <input type="checkbox" value={id} name="id" />
                        </th>
                      )}
                      <td>{id}</td>
                      <td>{title}</td>
                      <td>{description}</td>
                      <td>{price}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FilterTable;
