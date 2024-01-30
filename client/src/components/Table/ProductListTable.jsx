import React from "react";

const ProductListTable = ({
  productList,
  changeProductHandler,
  changeQuantityHandler,
  disable = false,
}) => {
  return (
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
        {productList.map((product, index) => (
          <tr key={`${product.name}${index}`}>
            <td>
              <input
                type="text"
                value={product.name}
                onChange={(e) => changeProductHandler("name", index, e)}
                disabled={disable}
              />
            </td>
            <td>
              <span className="productListAction">
                <button>
                  <span
                    className="material-symbols-outlined"
                    onClick={(e) =>
                      !disable && changeQuantityHandler(index, false, e)
                    }>
                    remove
                  </span>
                </button>
                <input
                  type="number"
                  name="product_quantity"
                  value={product.quantity}
                  onChange={(e) =>
                    !disable && changeProductHandler("quantity", index, e)
                  }
                />
                <button>
                  <span
                    className="material-symbols-outlined"
                    onClick={(e) =>
                      !disable && changeQuantityHandler(index, true, e)
                    }>
                    add
                  </span>
                </button>
              </span>
            </td>
            <td>
              <input
                type="number"
                value={product.unit_price}
                step="0.01"
                onChange={(e) =>
                  !disable && changeProductHandler("unit_price", index, e)
                }
              />
            </td>
            <td>
              <p>RM {(product.unit_price * product.quantity).toFixed(2)}</p>
            </td>
            <td>
              <span
                className="material-symbols-outlined deleteRowIcon"
                onClick={(e) =>
                  !disable && changeProductHandler("delete", index, e)
                }>
                delete
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductListTable;
