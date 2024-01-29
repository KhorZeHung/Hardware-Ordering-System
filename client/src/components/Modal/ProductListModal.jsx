import React from "react";
import "./Modal.css";
import FilterTable from "../Table/FilterTable";

const ProductListModal = (props) => {
  const { open, closeFunc } = props;
  return (
    <div className={open ? "modal open" : "modal"}>
      <span onClick={closeFunc} className="closeModal">
        &#x2716;
      </span>
      <div className="modalContentContainer">
        {
          <FilterTable
            datas={{
              checkBox: true,
              filter: {
                column: "title",
                options: ["iphone", "samsung", "oppo", "huawei"],
              },
            }}
          />
        }
      </div>
    </div>
  );
};

export default ProductListModal;
