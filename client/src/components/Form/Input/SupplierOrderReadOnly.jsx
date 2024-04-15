import React, { useState, useEffect, useContext } from "react";
import useProductInfo from "../../../utils/useProductInfo";
import { decode } from "jsonwebtoken";
import { CustomModalContext } from "../../Modal/CustomModalProvider";
import { projectData } from "../../../data";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import "../FormBody.css";
import { getCookie } from "../../../utils/cookie";

const RoomMaterialReadOnly = ({ datas }) => {
  const { defaultOrderList, index } = datas;
  const numOfRoom = index + 1;
  const [openCollapes, setOpenCollapes] = useState(false);
  const [orderLists, setOrderLists] = useState(defaultOrderList || null);
  const { productInfo } = useProductInfo();
  const { openCustomModal } = useContext(CustomModalContext);
  const token = getCookie("token");
  const position = decode(token).user_authority;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    if (defaultOrderList && productInfo) {
      const newProjectOrderProductLists =
        defaultOrderList.project_order_product_lists.map((product) => {
          return {
            ...product,
            product_name:
              productInfo[product.product_id].name || "Unknown Product",
          };
        });

      setOrderLists((prev) => ({
        ...prev,
        project_order_product_lists: newProjectOrderProductLists,
      }));
    }
    return () => {};
  }, [defaultOrderList, productInfo]);

  const updateOrderHandler = (id) => {
    let formatedOrderForm = projectData.proceedToDataForm;

    if (formatedOrderForm.endPoint.slice(-1) === "/")
      formatedOrderForm.endPoint += id;
    openCustomModal(formatedOrderForm);
  };

  return (
    <>
      <div style={{ width: "100%", padding: "1rem 0" }}>
        <div className="mainBar" id={"mainBar" + numOfRoom}>
          <input
            type="text"
            name="room1"
            id="room1"
            value={orderLists.name || "Unknow"}
            style={{ padding: "5px" }}
            readOnly
          />
          {defaultOrderList.status.toLowerCase() === "under process" &&
            position !== 2 && (
              <>
                <span
                  className="material-symbols-outlined mainBarAction"
                  id="fade-button"
                  aria-controls={open ? "fade-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}>
                  more_vert
                </span>
                <Menu
                  id="fade-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  TransitionComponent={Fade}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}>
                  <MenuItem
                    onClick={(e) => {
                      handleClose();
                      updateOrderHandler(defaultOrderList.id);
                    }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px" }}>
                      order_play
                    </span>
                    <p style={{ fontSize: "12px", margin: "0" }}>
                      proceed to order
                    </p>
                  </MenuItem>
                </Menu>
              </>
            )}
          <p className="subTotal">
            <span
              className={`orderStatus ${
                defaultOrderList.status.includes("Paid") ? "success" : ""
              } ${
                defaultOrderList.status.includes("Problematic") ||
                defaultOrderList.status.includes("Rejected")
                  ? "failed"
                  : ""
              }`}>
              {defaultOrderList.status}
            </span>

            {"RM " + parseFloat(orderLists.subtotal).toFixed(2)}
          </p>
          <span
            className={
              openCollapes
                ? "material-symbols-outlined secClose rotate"
                : "material-symbols-outlined secClose"
            }
            onClick={() => setOpenCollapes(!openCollapes)}>
            keyboard_arrow_up
          </span>
          <div className={openCollapes ? "barContent open" : "barContent"}>
            {orderLists.project_order_product_lists.length > 0 ? (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ maxWidth: "100px" }}>Quantity</th>
                      <th style={{ maxWidth: "100px" }}>Unit Price</th>
                      <th style={{ maxWidth: "100px" }}>Sub-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderLists.project_order_product_lists.map(
                      (order, index) => {
                        return (
                          <tr key={`${order.product_id}${index}`}>
                            <td>
                              <input
                                type="text"
                                value={order.product_name || "Unknow"}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                name="product_quantity"
                                value={
                                  parseInt(order.total_quantity) || "Unknow"
                                }
                                min={0}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={parseFloat(order.unit_cost)}
                                step="0.01"
                                readOnly
                              />
                            </td>
                            <td>
                              <p>
                                RM{" "}
                                {(
                                  +order.unit_cost * +order.total_quantity
                                ).toFixed(2)}
                              </p>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </>
            ) : (
              <div style={{ height: "100px" }} className="center">
                No product added
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomMaterialReadOnly;
