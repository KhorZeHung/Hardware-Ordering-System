import React, { useState, useRef, useEffect } from "react";
import "./Modal.css";
import "../Table/FilterTable.css";
import CircularProgress from "@mui/material-next/CircularProgress";
import useProductInfo from "../../utils/useProductInfo";
import useSupplierInfo from "../../utils/useSupplierInfo";
import { Dialog } from "@mui/material";

const ProductListModal = (props) => {
  const { open, closeFunc, addProductHandler, defaultValue } = props;
  const [tableData, setTableData] = useState(null);
  const [checkedBox, setCheckedBox] = useState([]);
  const [filterValue, setFilterValue] = useState({
    searchTerm: null,
    filterOption: null,
  });
  const { productInfo, productByCategory, productDescription } =
    useProductInfo();
  const searchTermRef = useRef();
  const supplierInfo = useSupplierInfo();
  const oriTableData = useRef();
  const categoryInfo = JSON.parse(localStorage.getItem("categoryInfo"));

  useEffect(() => {
    if (defaultValue.length > 0) setCheckedBox(defaultValue);

    return () => {};
  }, [defaultValue]);

  useEffect(() => {
    if (supplierInfo && productInfo) {
      oriTableData.current = Object.entries(productInfo).map(([_, value]) => {
        value.supplier = supplierInfo[value.supplier].name;
        return value;
      });

      setTableData(oriTableData.current);
    }
    return () => {};
  }, [supplierInfo, productInfo]);

  const clearSearch = () => {
    searchTermRef.current.value = "";
    setTableData(oriTableData.current);
    setFilterValue((prev) => ({ searchTerm: null, filterOption: null }));
  };

  const editCheckedBox = (event, value) => {
    let newCheckedBoxArray = [...checkedBox];
    if (!newCheckedBoxArray.includes(value)) {
      newCheckedBoxArray.push(String(value));
    } else {
      newCheckedBoxArray = newCheckedBoxArray.filter((val) => val !== value);
    }

    setCheckedBox(newCheckedBoxArray);
    let subtotal = 0;
    const newProductListArray = Object.entries(productInfo)
      .filter(([_, product]) => newCheckedBoxArray.includes(String(product.id)))
      .map(([_, product]) => {
        subtotal += parseFloat(product.unit_price);
        return {
          product_id: product.id,
          product_quantity: 1,
          product_unit_price: product.unit_price,
          product_name: product.name,
          product_description: productDescription[String(product.id)].map(
            (_, index) => index
          ),
        };
      });
    addProductHandler(event, newProductListArray, subtotal);
  };

  const searchHandler = (e) => {
    const checkValue = String(e.target.value).toLowerCase();
    if (checkValue.length === 0) clearSearch();

    let filteredData = oriTableData.current.filter((item) => {
      let containFilterValue = true;
      if (
        filterValue.filterOption &&
        item.supplier.toLowerCase() !== filterValue.filterOption.toLowerCase()
      ) {
        containFilterValue = false;
      }

      return (
        containFilterValue &&
        (item.name.toLowerCase().includes(checkValue) ||
          item.supplier.toLowerCase().includes(checkValue))
      );
    });
    setTableData(filteredData);
    setFilterValue((prev) => ({ ...prev, searchTerm: checkValue }));
  };

  const filterHandler = (e) => {
    const value = e.target.value;
    if (value === "all") {
      setTableData(oriTableData.current);

      setFilterValue((prev) => ({ ...prev, filterOption: null }));
    } else {
      var newTableData = productByCategory[value].map((id) => {
        return productInfo[id];
      });
      if (filterValue.searchTerm) {
        newTableData = newTableData.filter((data) => {
          return (
            data.name.includes(filterValue.searchTerm) ||
            data.supplier.includes(filterValue.searchTerm)
          );
        });
      }
      setTableData(newTableData);
      setFilterValue((prev) => ({
        ...prev,
        filterOption: e.target.options[e.target.selectedIndex].textContent,
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={closeFunc}
      scroll="body"
      maxWidth="md"
      fullWidth={true}>
      <div className="modalContentContainer">
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
            {
              <>
                <select
                  name="tableFilter"
                  style={{ minWidth: "50px" }}
                  onChange={filterHandler}>
                  <option value="all">all</option>
                  {categoryInfo &&
                    Object.entries(categoryInfo).map(([key, value]) => {
                      return (
                        <option key={`option-${value.name}`} value={value.id}>
                          {value.name}
                        </option>
                      );
                    })}
                </select>
              </>
            }
          </div>
        </div>
        <hr />
        <div className="tableSec">
          {!tableData ? (
            <div className="center" style={{ height: "400px", width: "100%" }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              {tableData.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      {["name", "unit price", "supplier"].map((value) => {
                        return <th key={`thead-${value}`}>{value}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((rowData, rowIndex) => {
                      return (
                        <tr
                          key={`row-${rowIndex}`}
                          onClick={(e) =>
                            editCheckedBox(e, String(rowData.id))
                          }>
                          {
                            <td>
                              <input
                                type="checkbox"
                                value={rowData.id}
                                onChange={(e) =>
                                  editCheckedBox(e, String(rowData.id))
                                }
                                checked={checkedBox.includes(
                                  String(rowData.id)
                                )}
                              />
                            </td>
                          }
                          <td>{rowData.name}</td>
                          <td>{rowData.unit_price}</td>
                          <td>{rowData.supplier}</td>
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
    </Dialog>
  );
};

export default ProductListModal;
