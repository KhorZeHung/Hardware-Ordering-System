import React, { memo } from "react";
import "./FilterTable.css";
import TableCheckBox from "../Form/Input/TableCheckBox";
import useProductInfo from "../../utils/useProductInfo";

const ProductListTable = ({
  productList,
  changeProductHandler,
  changeQuantityHandler,
  productDescriptionHandler,
  disable = false,
}) => {
  const { productDescription, productInfo } = useProductInfo();

  if (!productDescription) {
    return <div>Loading...</div>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th style={{ maxWidth: "100px" }}>Quantity</th>
          <th style={{ maxWidth: "100px" }}>Unit Price</th>
          <th style={{ maxWidth: "100px" }}>Sub-total</th>
          <th style={{ maxWidth: "200px" }}>Descriptions</th>
          {!disable && <th style={{ maxWidth: "40px" }}></th>}
        </tr>
      </thead>
      <tbody>
        {productList.map((product, index) => {
          return (
            <tr key={`${product.product_name}${index}`}>
              <td>
                <input
                  type="text"
                  defaultValue={
                    product.product_name || productInfo[product.product_id].name
                  }
                  name={"product_name"}
                  onBlur={(e) =>
                    !disable &&
                    product.product_name !== e.target.value &&
                    changeProductHandler("product_name", index, e)
                  }
                  readOnly={disable}
                />
              </td>
              <td>
                <span className="productListAction">
                  {!disable && (
                    <button>
                      <span
                        className="material-symbols-outlined"
                        onClick={(e) =>
                          !disable && changeQuantityHandler(index, false, e)
                        }>
                        remove
                      </span>
                    </button>
                  )}
                  <input
                    type="number"
                    name="product_quantity"
                    value={parseInt(product.product_quantity)}
                    onChange={(e) =>
                      !disable &&
                      changeProductHandler("product_quantity", index, e)
                    }
                    min={0}
                    readOnly={disable}
                  />
                  {!disable && (
                    <button>
                      <span
                        className="material-symbols-outlined"
                        onClick={(e) =>
                          !disable && changeQuantityHandler(index, true, e)
                        }>
                        add
                      </span>
                    </button>
                  )}
                </span>
              </td>
              <td>
                <input
                  type="number"
                  value={parseFloat(product.product_unit_price)}
                  step="0.01"
                  onChange={(e) =>
                    !disable &&
                    changeProductHandler("product_unit_price", index, e)
                  }
                  readOnly={disable}
                />
              </td>
              <td>
                <p>
                  RM{" "}
                  {(
                    +product.product_unit_price * +product.product_quantity
                  ).toFixed(2)}
                </p>
              </td>
              <td style={{ marginTop: "0 !important" }}>
                <TableCheckBox
                  formHandler={(e, value, name) => {
                    !disable && productDescriptionHandler(value, index);
                  }}
                  datas={{
                    name: "product_description",
                    tm: false,
                    label: null,
                    required: false,
                    options: productDescription[String(product.product_id)].map(
                      (description, index) => ({
                        value: index,
                        name: description,
                      })
                    ),
                    disable: disable,
                    defaultValue: productDescription[
                      String(product.product_id)
                    ].map((_, index) => index),
                  }}
                />
              </td>
              {!disable && (
                <td>
                  <span
                    className="material-symbols-outlined deleteRowIcon"
                    onClick={(e) =>
                      !disable && changeProductHandler("delete", index, e)
                    }>
                    delete
                  </span>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default memo(ProductListTable);
