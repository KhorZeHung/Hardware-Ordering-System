import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { APIGateway, orderData } from "../../data";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { CustomModalContext } from "../../components/Modal/CustomModalProvider";
import useProductInfo from "../../utils/useProductInfo";
import axios from "axios";
import {
  CircularProgress,
  Tooltip,
  SwipeableDrawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
} from "@mui/material";
import "../index.css";

const OrderInfo = () => {
  const { order_id } = useParams();
  const [tableData, setTableData] = useState({
    supplierData: {},
    ordersData: {},
    orderSummaryData: {},
  });
  const { setSnackbar } = useContext(SnackbarContext);
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
        formatedOrderStmtData.current.inputLists =
          formatedOrderStmtData.current.inputLists.map((inputList) => {
            if (inputList.name === "project_id") {
              inputList.defaultValue = data.projectData["project id"];
            }
            if (
              inputList.name === "account_status_description" &&
              inputList.defaultValue.slice(-1) === " "
            )
              inputList.defaultValue +=
                data.supplierData.supplier.split(",")[0];

            if (inputList.name === "order_id")
              inputList.defaultValue = order_id;

            return inputList;
          });
        setTableData(data);
      })
      .catch((err) => {
        const message = err.response.body.message || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
        setTimeout(() => {
          navigate("../");
        }, 2000);
      });

    return () => {};
  }, [order_id, navigate, setSnackbar]);

  useEffect(() => {
    if (tableData && order_id) {
      let newOrderDataForm = orderData.orderRecordForm;

      newOrderDataForm.inputLists[0].defaultValue =
        tableData.ordersData.project_order_status;

      if (newOrderDataForm.endPoint.slice(-1) === "/")
        newOrderDataForm.endPoint += order_id;

      formatedOrderData.current = newOrderDataForm;
    }
    return () => {};
  }, [order_id, tableData]);

  const getPurchaseOrder = (e) => {
    e.preventDefault();

    if (!order_id) return null;

    axios
      .get(APIGateway + "/order/purchase-order/" + order_id, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
        responseType: "blob",
      })
      .then((res) => {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "purchase-order.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSnackbar({
          open: true,
          message: "Download successful",
          severity: "success",
        });
      })
      .catch((err) => {
        const message = err.response || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };
  const getOrderSpreadSheet = (e) => {
    e.preventDefault();

    if (!order_id) return null;

    axios
      .get(APIGateway + "/order/order-spreadsheet/" + order_id, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
        responseType: "blob",
      })
      .then((res) => {
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "order-spreadsheet.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSnackbar({
          open: true,
          message: "Download successful",
          severity: "success",
        });
      })
      .catch((err) => {
        const message = err.response || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSwipe = (open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <div className="orderInfo">
      <div className="prevPageBtn">
        <span
          className="material-symbols-outlined"
          onClick={() => navigate(-1)}>
          arrow_back
        </span>
      </div>
      {tableData ? (
        <>
          <div>
            <table className="orderTable">
              <tbody>
                {tableData.supplierData &&
                  tableData.projectData &&
                  Object.entries({
                    ...tableData.supplierData,
                    ...tableData.projectData,
                  }).map(([key, value]) => {
                    if (key.includes("contact")) {
                      return (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>
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
                          </td>
                        </tr>
                      );
                    } else if (key.includes("address")) {
                      return (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>
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
                          </td>
                        </tr>
                      );
                    } else if (key === "project id") {
                      return (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>
                            <a
                              style={{
                                color: "blue",
                                textTransform: "underline",
                              }}
                              href={`../../project/${value}`}
                              target="_blank"
                              rel="noopener noreferrer">
                              {value}
                            </a>
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>{value}</td>
                        </tr>
                      );
                    }
                  })}
                <tr>
                  <th>status</th>
                  <td>
                    {tableData.ordersData &&
                      tableData.ordersData.project_order_status}
                  </td>
                </tr>
                <tr>
                  <th>total paid (RM)</th>
                  <td>
                    {tableData.ordersData &&
                      parseFloat(
                        tableData.ordersData.project_order_total_paid
                      ).toFixed(2)}
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
                <tr>
                  <td></td>
                  <td></td>
                  <td>
                    <b>subtotal (RM)</b>
                  </td>
                  <td>
                    <b>
                      {parseFloat(
                        tableData.ordersData.project_order_subtotal
                      ).toFixed(2)}
                    </b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Tooltip title="edit order">
            <span className="addNewItem" onClick={() => setDrawerOpen(true)}>
              <span className="material-symbols-outlined">edit</span>
            </span>
          </Tooltip>
          <SwipeableDrawer
            anchor="bottom"
            open={drawerOpen}
            onClose={toggleDrawer}
            onOpen={() => {}}
            swipeAreaWidth={20}
            disableBackdropTransition={true}
            disableDiscovery={true}>
            <div
              role="presentation"
              onClick={toggleDrawer}
              onKeyDown={handleSwipe(false)}>
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={getOrderSpreadSheet}>
                    <ListItemIcon>
                      <span className="material-symbols-outlined">
                        view_list
                      </span>
                    </ListItemIcon>
                    <ListItemText
                      primary={"generate .xlsx order spreadsheet"}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={getPurchaseOrder}>
                    <ListItemIcon>
                      <span className="material-symbols-outlined">
                        list_alt
                      </span>
                    </ListItemIcon>
                    <ListItemText primary={"generate purchase order (PO)"} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() =>
                      openCustomModal(formatedOrderStmtData.current)
                    }>
                    <ListItemIcon>
                      <span className="material-symbols-outlined">
                        import_contacts
                      </span>
                    </ListItemIcon>
                    <ListItemText primary={"input statement/account"} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => openCustomModal(formatedOrderData.current)}>
                    <ListItemIcon>
                      <span className="material-symbols-outlined">edit</span>
                    </ListItemIcon>
                    <ListItemText primary={"edit order status"} />
                  </ListItemButton>
                </ListItem>
              </List>
            </div>
          </SwipeableDrawer>
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
