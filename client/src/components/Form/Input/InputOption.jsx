import React from "react";
import "../FormBody.css";

const InputOption = ({ datas, formHandler }) => {
  const { label, name, required = true, options = [], disable = false } = datas;

  return (
    <div className={disable ? "normalInput disable" : "normalInput"}>
      <label htmlFor={name}>
        {label} {required && <span>*</span>}
      </label>
      <select
        name={name}
        id={name}
        onChange={formHandler}
        // value={options[0].value}
        disabled={disable}>
        {options.length > 0 &&
          options.map((option, index) => (
            <option key={index} value={option.value} name={name}>
              {option.name}
            </option>
          ))}
      </select>
    </div>
  );
};

export default InputOption;
