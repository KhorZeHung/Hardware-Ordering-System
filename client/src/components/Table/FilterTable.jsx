import React, { useState, useEffect, useRef } from "react";
import "./FilterTable.css";
import CircularProgress from "@mui/material-next/CircularProgress";
import axios from "axios";

const FilterTable = (props) => {
  const {
    checkBox = false,
    endPoint = "https://dummyjson.com/products",
    filterOption = null,
  } = props.datas;

  const [column, setColumn] = useState(null);
  const [asc, setAsc] = useState(false);
  const [tableData, setTableData] = useState(null);
  const searchTermRef = useRef(null);
  const [checkedBox, setCheckedBox] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endPoint);
        const datas = response.data;
        setTableData(datas.products);

        //need to change after back-end fully develop
        setColumn(Object.keys(datas.products[0]).slice(0, 4));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [endPoint]);

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

  const clearSearch = () => {
    searchTermRef.current.value = "";
  };

  const checkBoxHandler = (event) => {
    const checked = event.target.checked;
    const normalCheckBox = document.querySelectorAll(
      ".tableSec input[type='checkbox']:not(#mainCheckBox)"
    );

    let newCheckedBoxArray = [];
    normalCheckBox.forEach((checkbox) => {
      checkbox.checked = checked;
      checked && newCheckedBoxArray.push(checkbox.value);
    });

    setCheckedBox(newCheckedBoxArray);
  };

  const editCheckedBox = (event) => {
    const checked = event.target.checked;
    const value = event.target.value;

    !checked && (document.querySelector("#mainCheckBox").checked = false);

    setCheckedBox((prev) => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter((val) => val !== value);
      }
    });
  };

  return (
    <div>
      <div className="filterSec spaceBetween">
        <div className="searchBar">
          <input type="text" placeholder="Search..." ref={searchTermRef} />
          <div className="searchBarIcon center" onClick={clearSearch}>
            <span className="material-symbols-outlined">close</span>
            <span className="material-symbols-outlined">search</span>
          </div>
        </div>
        <div className="filterOpt center">
          {checkBox && checkedBox.length > 0 && (
            <>
              <p style={{ paddingRight: "1rem" }}>
                {checkedBox.length} SELECTED
              </p>
              {/* need to add onClick endpoint to delete selected rows */}
              <span className="material-symbols-outlined deleteRowIcon">
                delete
              </span>
            </>
          )}
          {filterOption && checkedBox.length === 0 && (
            <>
              <select name="tableFilter" style={{ minWidth: "50px" }}>
                {filterOption.map((value) => {
                  return <option value={value}>{value}</option>;
                })}
              </select>
            </>
          )}
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
                {checkBox && column.length && (
                  <th>
                    <input
                      type="checkbox"
                      onChange={checkBoxHandler}
                      id="mainCheckBox"
                    />
                  </th>
                )}
                {column &&
                  column.map((value, index) => (
                    <th key={index} onClick={() => sortTable(value)}>
                      {value}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {tableData &&
                tableData.map(({ id, title, description, price }) => (
                  <tr key={id}>
                    {checkBox && (
                      <th>
                        <input
                          type="checkbox"
                          value={id}
                          onClick={editCheckedBox}
                        />
                      </th>
                    )}
                    <td>{id}</td>
                    <td>{title}</td>
                    <td>{description}</td>
                    <td>{price}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FilterTable;
