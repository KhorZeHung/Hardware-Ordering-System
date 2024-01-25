import React from "react";
import "../FormBody.css";

const NormalInput = ({ datas, formHandler }) => {
  const {
    type = "text",
    required = true,
    name,
    label,
    placeholder = null,
    defaultValue = null,
  } = datas;

  return (
    <div className="normalInput">
      <label htmlFor="name">
        {label}
        {required && <span>*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={formHandler}
        id={name}
      />
    </div>
  );
};

export default NormalInput;
