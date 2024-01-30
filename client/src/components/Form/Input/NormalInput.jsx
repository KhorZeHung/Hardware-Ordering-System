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
    min = null,
    max = null,
    disable = false,
  } = datas;

  return (
    <div className={disable ? "normalInput disable" : "normalInput"}>
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
        min={min}
        max={max}
        disabled={disable}
      />
    </div>
  );
};

export default NormalInput;
