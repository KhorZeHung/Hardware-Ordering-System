import React from "react";
import "../FormBody.css";

const InputOption = ({ datas, formHandler }) => {
  const { label, name, required = true, options = [], disable = false } = datas;

  return (
    <div className="normalInput">
      <label htmlFor={name}>
        {label} {required && <span>*</span>}
      </label>
      <select name={name} id={name} onChange={formHandler} disabled={disable}>
        {options.length > 0 &&
          options.map((option, index) => (
            <option key={index} value={option} name={name}>
              {option}
            </option>
          ))}
      </select>
    </div>
  );
};

export default InputOption;
