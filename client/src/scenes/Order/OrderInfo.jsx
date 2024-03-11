import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { APIGateway, orderData } from "../../data";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { CustomModalContext } from "../../components/Modal/CustomModalProvider";
import useProductInfo from "../../utils/useProductInfo";
import axios from "axios";
import { CircularProgress, Tooltip } from "@mui/material";

const OrderInfo = () => {
  const { order_id } = useParams();
  const [tableData, setTableData] = useState({
    supplierData: {},
    ordersData: {},
    orderSummaryData: {},
  });
  const { setSnackBar } = useContext(SnackbarContext);
  const navigate = useNavigate();
  const { productInfo } = useProductInfo();
  const { openCustomModal } = useContext(CustomModalContext);
  const formatedOrderData = useRef();
  const formatedOrderStmtData = useRef(orderData.orderStatementForm);

  useEffect(() => {
    axios
      .get(APIGateway + "/order/" + order_id, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((res) => {
        const { data } = res.data;
        formatedOrderStmtData.current.inputLists[5].defaultValue =
          data.projectData["project id"];
        formatedOrderStmtData.current.inputLists[4].defaultValue += ` ${data.supplierData["supplier company name"]}`;
        setTableData(data);
      })
      .catch((err) => {
        const message = err.response.body.message || "Something went wrong";
        setSnackBar({ open: true, message: message, severity: "error" });
        setTimeout(() => {
          navigate("../");
        }, 2000);
      });

    return () => {};
  }, [order_id, navigate, setSnackBar]);

  useEffect(() => {
    if (tableData && order_id) {
      let newOrderDataForm = orderData.orderRecordForm;

      newOrderDataForm.inputLists[0].defaultValue =
        tableData.ordersData.project_order_status;
      newOrderDataForm.inputLists[1].defaultValue = order_id;
      formatedOrderData.current = newOrderDataForm;
    }
    return () => {};
  }, [order_id, tableData]);

  return (
    <div className="orderInfo">
      {tableData ? (
        <>
          <div>
            <table className="orderTable">
              <tbody>
                {tableData.supplierData &&
                  Object.entries(tableData.supplierData).map(([key, value]) => {
                    if (key.includes("contact")) {
                      return (
                        <tr key={key}>
                          <th>{key}</th>
                          <a
                            style={{
                              color: "blue",
                            }}
                            href={`https://wa.me/${value
                              .replace(/^(\+|6|\+6)?/g, "")
                              .replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            {value}
                          </a>
                        </tr>
                      );
                    }
                    if (key.includes("location") || key.includes("address")) {
                      return (
                        <tr key={key}>
                          <th>{key}</th>
                          <a
                            style={{
                              color: "blue",
                              textTransform: "underline",
                            }}
                            href={`https://www.google.com/maps/search/?api=1&query=${value.replace(
                              / /g,
                              "+"
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            {value}
                          </a>
                        </tr>
                      );
                    }
                    return (
                      <tr key={key}>
                        <th>{key}</th>
                        <td>{value}</td>
                      </tr>
                    );
                  })}
                {tableData.projectData &&
                  Object.entries(tableData.projectData).map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                <tr>
                  <th>status</th>
                  <td>
                    {tableData.ordersData &&
                      tableData.ordersData.project_order_status}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="orderTable">
              <thead>
                <tr>
                  <th>product name</th>
                  <th>quantity</th>
                  <th>unit price</th>
                  <th>sub-total</th>
                </tr>
              </thead>
              <tbody>
                {tableData.ordersData.project_order_product_lists &&
                  tableData.ordersData.project_order_product_lists.map(
                    (value) => (
                      <tr key={value.product_id}>
                        <td>{productInfo[value.product_id].name}</td>
                        <td>{value.total_quantity}</td>
                        <td>{value.unit_cost}</td>
                        <td>
                          {parseInt(value.total_quantity) *
                            parseFloat(value.unit_cost).toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
          <div>
            <table className="summaryTable">
              <tbody>
                <tr>
                  <th>subtotal (RM)</th>
                  <td>
                    {parseFloat(
                      tableData.ordersData.project_order_subtotal
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Tooltip title="add statement">
            <span
              className="addNewItem"
              style={{ bottom: "calc(5% + 50px)" }}
              onClick={() => openCustomModal(formatedOrderStmtData.current)}>
              <span className="material-symbols-outlined">contract</span>
            </span>
          </Tooltip>
          <Tooltip title="edit order status">
            <span
              className="addNewItem"
              onClick={() => openCustomModal(formatedOrderData.current)}>
              <span className="material-symbols-outlined">edit</span>
            </span>
          </Tooltip>
        </>
      ) : (
        <div style={{ height: "90vh", width: "100vw" }}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default OrderInfo;
