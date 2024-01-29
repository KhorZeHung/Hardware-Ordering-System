import React, { useState, useEffect, useRef } from "react";
import "./FilterTable.css";
import CircularProgress from "@mui/material-next/CircularProgress";
import axios from "axios";

const FilterTable = (props) => {
  const {
    checkBox = false,
    endPoint = "https://dummyjson.com/products",
    filter = null,
  } = props.datas;

  const [column, setColumn] = useState(null);
  const [asc, setAsc] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [oriData, setOriData] = useState(null);
  const [checkedBox, setCheckedBox] = useState([]);
  const [tableIsLoading, setTableIsLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const searchTermRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endPoint);
        const datas = response.data;
        setTableData(datas.products);
        setOriData(datas.products);
        setTableIsLoading(true);

        //need to change after back-end fully develop
        setColumn(Object.keys(datas.products[0]).slice(0, 5));
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
    setTableData(filter ? filterData(filterValue, oriData) : oriData);
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

  const searchHandler = (e) => {
    const checkValue = String(e.target.value).toLowerCase();
    setSearchTerm(checkValue);

    var newTableArray =
      filterValue === "all" ? oriData : filterData(filterValue, oriData);
    setTableData(searchData(checkValue, newTableArray));
  };

  const searchData = (searchTerm, referArray) => {
    if (searchTerm.length > 1) {
      return referArray.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }
    return referArray;
  };

  const filterOptionHandler = (e) => {
    e.preventDefault();
    const checkValue = String(e.target.value).toLowerCase();
    setFilterValue(checkValue);
    var newTableValue =
      searchTerm.length > 1 ? searchData(searchTerm, oriData) : oriData;

    setTableData(filterData(checkValue, newTableValue));
  };

  const filterData = (category, referArray) => {
    if (category === "all") {
      return referArray;
    }
    return referArray.filter((value) => {
      const rowValue = String(value[filter.column]).toLowerCase();
      return rowValue.includes(String(category).toLowerCase());
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
          {filter && checkedBox.length === 0 && (
            <>
              <select
                name="tableFilter"
                style={{ minWidth: "50px" }}
                onChange={filterOptionHandler}>
                <option value="all" defaultChecked>
                  all
                </option>
                {filter.options.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
      <hr />
      <div className="tableSec">
        {!tableIsLoading ? (
          <div className="center" style={{ height: "400px", width: "100%" }}>
            <CircularProgress />
          </div>
        ) : (
          <>
            {tableData.length > 0 ? (
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
                  {tableData.map(
                    ({ id, title, description, price, discountPercentage }) => (
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
                        <td>{discountPercentage}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <div
                className="center"
                style={{
                  height: "400px",
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
