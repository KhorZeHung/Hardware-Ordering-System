import React, { useState } from "react";
import "../FormBody.css";

const InputOption = ({ datas, formHandler }) => {
  const {
    label,
    name,
    required = true,
    options = [],
    disable = false,
    defaultValue = null,
  } = datas;
  const [selected, setSelected] = useState(defaultValue);
  const selectChangeHandler = (event) => {
    const { value } = event.target;
    setSelected(value);
    formHandler(event);
  };
  return (
    <div className={disable ? "normalInput disable" : "normalInput"}>
      <label htmlFor={name}>
        {label} {required && <span>*</span>}
      </label>
      <select
        name={name}
        id={name}
        onChange={selectChangeHandler}
        value={selected || ""}
        disabled={disable}>
        {options.length > 0 && (
          <>
            {!defaultValue && (
              <option value="" disabled>
                Select an option
              </option>
            )}
            {options.map((option, index) => {
              return (
                <option key={index} value={option.value} name={name}>
                  {option.name}
                </option>
              );
            })}
          </>
        )}
      </select>
    </div>
  );
};

export default InputOption;
