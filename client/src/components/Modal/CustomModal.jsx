import React from "react";
import "./Modal.css";
import FormBody from "../Form/FormBody";

const CustomModal = (props) => {
  const { open, closeFunc, formStructure = null } = props;
  return (
    <div className={open ? "modal open" : "modal"}>
      <span onClick={closeFunc} className="closeModal">
        &#x2716;
      </span>
      {formStructure && (
        <FormBody
          title={formStructure.title}
          inputLists={formStructure.inputLists}
          submitValue={formStructure.submitValue}
        />
      )}
    </div>
  );
};

export default CustomModal;
