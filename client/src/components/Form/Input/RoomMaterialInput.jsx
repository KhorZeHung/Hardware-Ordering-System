import React, { useState, useEffect, useRef } from "react";
import ConfirmModal from "../../Modal/ConfirmModal";
import ProductListModal from "../../Modal/ProductListModal";
import ProductListTable from "../../Table/ProductListTable";
import "../FormBody.css";

export const calculateSubTotal = (productLists) => {
  if (productLists.length < 1) {
    return 0;
  }
  return productLists.reduce(
    (total, item) =>
      total + parseInt(item.quantity) * parseFloat(item.unit_price),
    0
  );
};

const RoomMaterialInput = ({ datas }) => {
  const {
    index,
    defaultProductList,
    formHandler = null,
    addRoomHandler = null,
    deleteRoomHandler = null,
    disable = false,
  } = datas;

  const numOfRoom = index + 1;
  const indexOfArray = index;

  const [open, setOpen] = useState(false);
  const [productLists, setProductLists] = useState(defaultProductList);
  const [subTotal, setSubTotal] = useState(
    calculateSubTotal(defaultProductList.productList) || 0
  );
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductListModalOpen, setIsProductListModalOpen] = useState(false);
  const mainBarActionRef = useRef(null);

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        mainBarActionRef.current &&
        !mainBarActionRef.current.contains(event.target)
      ) {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isActionMenuOpen]);

  const changeProductHandler = (key, index, e) => {
    const newProductListsArray = { ...productLists };
    const product = productLists.productList[index];
    const currentProductTotal =
      parseFloat(product.unit_price) * parseInt(product.quantity);
    var changeValue = 0;

    if (key === "delete") {
      newProductListsArray.productList.splice(index, 1);
    } else {
      newProductListsArray.productList[index][key] = e.target.value;
      if (key === "quantity") {
        changeValue = parseFloat(product.unit_price) * e.target.value;
      } else if (key === "unit_price") {
        changeValue = parseInt(product.quantity) * e.target.value;
      }
    }
    changeValue -= currentProductTotal;
    setSubTotal((prev) => prev + changeValue);
    setProductLists(newProductListsArray);
    formHandler(
      e,
      "quote_product_lists",
      newProductListsArray,
      indexOfArray,
      changeValue
    );
  };

  const changeQuantityHandler = (index, add, e) => {
    e.preventDefault();
    const newProductListsArray = { ...productLists };
    var unit_price = parseFloat(
      newProductListsArray.productList[index].unit_price
    );
    let newSubTotal = subTotal;
    if (add) {
      newProductListsArray.productList[index].quantity++;
      unit_price = -unit_price;
    } else {
      newProductListsArray.productList[index].quantity--;
    }
    newSubTotal -= unit_price;
    setSubTotal(newSubTotal);
    setProductLists(newProductListsArray);
    formHandler(
      e,
      "quote_product_lists",
      newProductListsArray,
      indexOfArray,
      unit_price
    );
  };

  const changeRoomNameHandler = (e) => {
    const newRoomName = e.target.value;
    const newProductListsArray = { ...productLists, roomName: newRoomName };

    setProductLists(newProductListsArray);
    formHandler(e, "quote_product_lists", newProductListsArray, indexOfArray);
  };

  const deleteConfirm = () => {
    setIsModalOpen(false);
    deleteRoomHandler(indexOfArray);
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
            onChange={(e) => changeRoomNameHandler(e)}
            disabled={disable}
          />
          <span
            ref={mainBarActionRef}
            className="material-symbols-outlined mainBarAction"
            onClick={() => !disable && setIsActionMenuOpen(!isActionMenuOpen)}>
            more_vert
          </span>
          <span
            className="actionMenu"
            style={
              isActionMenuOpen ? { display: "block" } : { display: "none" }
            }>
            <div
              onClick={(e) => {
                !disable && addRoomHandler(e, productLists.productList);
              }}>
              <span className="material-symbols-outlined">content_copy</span>
              <p>make a copy</p>
            </div>
            <div onClick={() => !disable && setIsModalOpen(true)}>
              <span className="material-symbols-outlined">delete</span>
              <p>delete room</p>
            </div>
          </span>
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
                changeProductHandler={changeProductHandler}
                changeQuantityHandler={changeQuantityHandler}
                disable={disable}
              />
            ) : (
              <div style={{ height: "100px" }} className="center">
                No product added
              </div>
            )}
            <div
              className="addProduct"
              onClick={() => disable && setIsProductListModalOpen(true)}>
              add material
            </div>
          </div>
        </div>
      </div>

      {!disable && (
        <>
          <ConfirmModal
            title={"Confirmation"}
            descriptions={[
              "Are you sure you want to delete this room?",
              "Deletion is permenantly, cannot be undo!",
            ]}
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={deleteConfirm}
          />
          <ProductListModal
            open={isProductListModalOpen}
            closeFunc={() => setIsProductListModalOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default RoomMaterialInput;
