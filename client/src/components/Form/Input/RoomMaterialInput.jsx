import React, { useState, useEffect, useRef, useContext } from "react";
import ProductListModal from "../../Modal/ProductListModal";
import ProductListTable from "../../Table/ProductListTable";
import { ConfirmModalContext } from "../../Modal/ConfirmModalProvider";
import "../FormBody.css";

export const calculateSubTotal = (productLists) => {
  if (productLists.length < 1) {
    return 0;
  }
  return productLists.reduce(
    (total, item) =>
      total +
      parseInt(item.product_quantity) * parseFloat(item.product_unit_price),
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
  } = datas;

  const numOfRoom = index + 1;
  const indexOfArray = index;
  const [open, setOpen] = useState(false);
  const [productLists, setProductLists] = useState(defaultProductList);
  const [subTotal, setSubTotal] = useState(
    calculateSubTotal(defaultProductList.productList) || 0
  );
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isProductListModalOpen, setIsProductListModalOpen] = useState(false);
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

  function changeProductHandler(key, index, e) {
    const newProductListsArray = { ...productLists };
    const product = productLists.productList[index];
    const currentProductTotal =
      parseFloat(product.product_unit_price) *
      parseInt(product.product_quantity);
    let changeValue = 0;

    if (key === "delete") {
      newProductListsArray.productList.splice(index, 1);
      changeValue = -currentProductTotal;
    } else {
      const newValue = e.target.value;

      if (key === "product_quantity") {
        const unitPrice = parseFloat(product.product_unit_price) || 0;
        const quantity = parseFloat(newValue) < 0 ? 0 : parseFloat(newValue);
        changeValue = unitPrice * quantity - currentProductTotal;
        newProductListsArray.productList[index] = {
          ...product,
          [key]: quantity,
        };
      } else if (key === "product_unit_price") {
        const quantity = parseInt(product.product_quantity) || 0;
        const unitPrice = parseFloat(newValue) < 0 ? 0 : parseFloat(newValue);
        changeValue = quantity * unitPrice - currentProductTotal;
        newProductListsArray.productList[index] = {
          ...product,
          [key]: unitPrice,
        };
      } else {
        newProductListsArray.productList[index] = {
          ...product,
          [key]: newValue,
        };
        changeValue =
          parseFloat(product.product_unit_price) *
            parseInt(product.product_quantity) -
          currentProductTotal;
      }
    }

    setSubTotal((prev) => prev + changeValue);
    setProductLists(newProductListsArray);
    formHandler(
      e,
      "quote_product_lists",
      newProductListsArray,
      indexOfArray,
      changeValue
    );
    e.target.focus();
  }

  const changeQuantityHandler = (index, add, e) => {
    e.preventDefault();
    const newProductListsArray = { ...productLists };
    var unit_price = parseFloat(
      newProductListsArray.productList[index].product_unit_price
    );
    let newSubTotal = subTotal;
    if (add) {
      newProductListsArray.productList[index].product_quantity++;
    } else {
      newProductListsArray.productList[index].product_quantity--;
      unit_price = -unit_price;
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

  const addProductHandler = (e, arraysOfProduct, newSubTotal) => {
    const newProductListsArray = {
      ...productLists,
      productList: arraysOfProduct,
    };

    setProductLists(newProductListsArray);
    const netPlus = newSubTotal - subTotal;
    setSubTotal((prev) => prev + newSubTotal);
    formHandler(
      e,
      "quote_product_lists",
      newProductListsArray,
      indexOfArray,
      netPlus
    );
  };

  const deleteConfirm = () => {
    openModal(
      "Confirmation",
      [
        "Are you sure you want to delete this room?",
        "Deletion is permenantly, cannot be undo!",
      ],
      () => deleteRoomHandler(indexOfArray)
    );
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
            onChange={changeRoomNameHandler}
          />
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
            <div
              onClick={(e) => {
                setIsActionMenuOpen(false);
                addRoomHandler(e, productLists.productList);
              }}>
              <span className="material-symbols-outlined">content_copy</span>
              <p>make a copy</p>
            </div>
            <div
              onClick={() => {
                setIsActionMenuOpen(false);
                deleteConfirm();
              }}>
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
                productDescriptionHandler={productDescriptionHandler}
              />
            ) : (
              <div style={{ height: "100px" }} className="center">
                No product added
              </div>
            )}
            <div
              className="addProduct"
              onClick={() => setIsProductListModalOpen(true)}>
              add material
            </div>
          </div>
        </div>
      </div>
      <ProductListModal
        open={isProductListModalOpen}
        closeFunc={() => setIsProductListModalOpen(false)}
        addProductHandler={addProductHandler}
        defaultValue={productLists.productList.map((product) =>
          String(product.product_id)
        )}
      />
    </>
  );
};

export default RoomMaterialInput;
