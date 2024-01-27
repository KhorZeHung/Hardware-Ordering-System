import React, { useState, useEffect } from "react";
import "../FormBody.css";

const RoomMaterialInput = ({ datas }) => {
  const { index, defaultProductList, formHandler = null } = datas;

  const numOfRoom = index + 1;
  const indexOfArray = index;

  const [open, setOpen] = useState(false);
  const [productLists, setProductLists] = useState(defaultProductList);

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

  const changeProductHandler = (key, index, e) => {
    const newProductListsArray = { ...productLists };
    if (key === "delete") {
      newProductListsArray.productList.splice(index, 1);
    } else {
      newProductListsArray.productList[index][key] = e.target.value;
    }
    setProductLists(newProductListsArray);
    formHandler(e, "quote_product_lists", newProductListsArray, indexOfArray);
  };

  const changeQuantityHandler = (index, add, e) => {
    const newProductListsArray = { ...productLists };
    if (add) {
      newProductListsArray.productList[index].quantity++;
    } else {
      newProductListsArray.productList[index].quantity--;
    }
    setProductLists(newProductListsArray);
    formHandler(e, "quote_product_lists", newProductListsArray, indexOfArray);
  };

  const changeRoomNameHandler = (e) => {
    const newRoomName = e.target.value;
    const newProductListsArray = { ...productLists, roomName: newRoomName };

    setProductLists(newProductListsArray);
    formHandler(e, "quote_product_lists", newProductListsArray, indexOfArray);
  };

  return (
    <div style={{ width: "100%", padding: "1rem 0" }}>
      <div className="mainBar" id={"mainBar" + numOfRoom}>
        <input
          type="text"
          name="room1"
          id="room1"
          value={productLists.roomName}
          style={{ padding: "5px" }}
          onChange={(e) => changeRoomNameHandler(e)}
        />
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
          {productLists.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ maxWidth: "100px" }}>Quantity</th>
                  <th style={{ maxWidth: "100px" }}>Unit Price</th>
                  <th style={{ maxWidth: "100px" }}>Sub-total</th>
                  <th style={{ maxWidth: "40px" }}></th>
                </tr>
              </thead>
              <tbody>
                {productLists.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => changeProductHandler("name", index, e)}
                      />
                    </td>
                    <td>
                      <span className="productListAction">
                        <button>
                          <span
                            className="material-symbols-outlined"
                            onClick={() => changeQuantityHandler(index)}>
                            remove
                          </span>
                        </button>
                        <input
                          type="number"
                          name="product_quantity"
                          value={product.quantity}
                          onChange={(e) =>
                            changeProductHandler("quantity", index, e)
                          }
                        />
                        <button>
                          <span
                            className="material-symbols-outlined"
                            onClick={() => changeQuantityHandler(index, true)}>
                            add
                          </span>
                        </button>
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={product.unit_price.toFixed(2)}
                        step="0.01"
                        onChange={(e) =>
                          changeProductHandler("unit_price", index, e)
                        }
                      />
                    </td>
                    <td>
                      <p>
                        RM {(product.unit_price * product.quantity).toFixed(2)}
                      </p>
                    </td>
                    <td>
                      <span
                        className="material-symbols-outlined deleteRowIcon"
                        onChange={(e) =>
                          changeProductHandler("delete", index, e)
                        }>
                        delete
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ height: "100px" }} className="center">
              No product added, click + to add
            </div>
          )}
          <div className="addProduct">+</div>
        </div>
      </div>
    </div>
  );
};

export default RoomMaterialInput;
