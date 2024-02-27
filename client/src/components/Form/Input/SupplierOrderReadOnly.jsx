import React, { useState, useEffect, useRef, useContext } from "react";
import { ConfirmModalContext } from "../../Modal/ConfirmModalProvider";
import useProductInfo from "../../../utils/useProductInfo";
import "../FormBody.css";

const RoomMaterialReadOnly = ({ datas }) => {
  const { defaultOrderList, index, action = [], id = null } = datas;

  const numOfRoom = index + 1;
  const [open, setOpen] = useState(false);
  const [orderLists, setOrderLists] = useState(defaultOrderList || null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const mainBarActionRef = useRef(null);
  const { productInfo } = useProductInfo();

  useEffect(() => {
    if (defaultOrderList && productInfo) {
      const productNamesMap = {};
      productInfo.forEach((product) => {
        productNamesMap[product.id] = product.name;
      });

      const newProjectOrderProductLists =
        defaultOrderList.project_order_product_lists.map((product) => {
          return {
            ...product,
            product_name:
              productNamesMap[product.product_id] || "Unknown Product",
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
          {action.length > 0 && (
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
                  isActionMenuOpen ? { display: "block" } : { display: "none" }
                }>
                {action.map((option) => {
                  return (
                    <div
                      onClick={(e) => {
                        option.onClickHandler(id);
                      }}>
                      <p>{option.name}</p>
                    </div>
                  );
                })}
              </span>
            </>
          )}
          <p className="subTotal">
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
