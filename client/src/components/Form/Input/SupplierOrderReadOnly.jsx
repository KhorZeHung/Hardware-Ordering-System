import React, { useState, useEffect, useRef, useContext } from "react";
import useProductInfo from "../../../utils/useProductInfo";
import { decode } from "jsonwebtoken";
import { CustomModalContext } from "../../Modal/CustomModalProvider";
import { projectData } from "../../../data";
import "../FormBody.css";
import { getCookie } from "../../../utils/cookie";

const RoomMaterialReadOnly = ({ datas }) => {
  const { defaultOrderList, index } = datas;
  const numOfRoom = index + 1;
  const [open, setOpen] = useState(false);
  const [orderLists, setOrderLists] = useState(defaultOrderList || null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const mainBarActionRef = useRef(null);
  const { productInfo } = useProductInfo();
  const { openCustomModal } = useContext(CustomModalContext);
  const token = getCookie("token");
  const position = decode(token).user_authority;

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const mainBar = document.querySelector("#mainBar" + numOfRoom);

      if (mainBar && !mainBar.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyPress = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [open, numOfRoom]);

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
                  ref={mainBarActionRef}
                  className="material-symbols-outlined mainBarAction"
                  onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}>
                  more_vert
                </span>
                <span
                  className="actionMenu"
                  style={
                    isActionMenuOpen
                      ? { display: "block" }
                      : { display: "none" }
                  }>
                  <div
                    onClick={() => {
                      updateOrderHandler(defaultOrderList.id);
                    }}
                    style={{ color: "black" }}>
                    <p>proceed to order</p>
                  </div>
                </span>
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
              open
                ? "material-symbols-outlined secClose rotate"
                : "material-symbols-outlined secClose"
            }
            onClick={() => setOpen(!open)}>
            keyboard_arrow_up
          </span>
          <div className={open ? "barContent open" : "barContent"}>
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
