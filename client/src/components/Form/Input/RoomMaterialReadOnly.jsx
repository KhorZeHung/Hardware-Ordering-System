import React, { useState, useEffect, useRef, useContext } from "react";
import ProductListTable from "../../Table/ProductListTable";
import { ConfirmModalContext } from "../../Modal/ConfirmModalProvider";
import { calculateSubTotal } from "./RoomMaterialInput";
import "../FormBody.css";

const RoomMaterialReadOnly = ({ datas }) => {
  const { defaultProductList, index, action = [], id = null } = datas;

  const numOfRoom = index + 1;
  const [open, setOpen] = useState(false);
  const [productLists, setProductLists] = useState(defaultProductList);
  const [subTotal, setSubTotal] = useState(
    calculateSubTotal(defaultProductList.productList) || 0
  );
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const mainBarActionRef = useRef(null);
  const { openModal } = useContext(ConfirmModalContext);
  useEffect(() => {
    setProductLists(defaultProductList);
    setSubTotal(calculateSubTotal(defaultProductList.productList) || 0);
  }, [defaultProductList]);

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

  const productDescriptionHandler = (newArray, index) => {
    setProductLists((prev) => ({
      ...prev,
      productList: prev.productList.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            product_description: newArray,
          };
        }
        return item;
      }),
    }));
  };

  return (
    <>
      <div style={{ width: "100%", padding: "1rem 0" }}>
        <div className="mainBar" id={"mainBar" + numOfRoom}>
          <input
            type="text"
            name="room1"
            id="room1"
            value={productLists.roomName}
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
          <p className="subTotal">{"RM " + parseFloat(subTotal).toFixed(2)}</p>
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
            {productLists.productList.length > 0 ? (
              <ProductListTable
                productList={productLists.productList}
                changeProductHandler={null}
                changeQuantityHandler={null}
                productDescriptionHandler={productDescriptionHandler}
                disable={true}
              />
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
