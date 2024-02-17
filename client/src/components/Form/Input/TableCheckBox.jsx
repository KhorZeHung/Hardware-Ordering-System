import React, { useState } from "react";
import "../FormBody.css";

const TableCheckBox = ({ datas, formHandler }) => {
  const {
    name,
    label,
    required = true,
    options = [],
    disable = false,
    defaultValue = [],
  } = datas;
  const [checkedBox, setCheckedBox] = useState(defaultValue);

  const checkBoxHandler = (e) => {
    let newCheckedBoxArray = [...checkedBox];
    const value = parseInt(e.target.value);
    if (e.target.checked) {
      newCheckedBoxArray.push(value);
    } else {
      newCheckedBoxArray = newCheckedBoxArray.filter(
        (checkedBox) => checkedBox !== value
      );
    }
    setCheckedBox(newCheckedBoxArray);
    formHandler(e, newCheckedBoxArray, name);
  };

  return (
    <div className={disable ? "checkBoxList disable" : "checkBoxList"}>
      <label htmlFor={name}>
        {label} {required && <span>*</span>}
      </label>
      <div className="scrollable">
        {options.length > 0 &&
          options.map((option) => {
            return (
              <div key={"Option_" + option.value}>
                <input
                  type="checkbox"
                  value={parseInt(option.value)}
                  name={name}
                  disabled={disable}
                  checked={checkedBox.includes(parseInt(option.value))}
                  onChange={checkBoxHandler}
                />
                <p>{option.name}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default TableCheckBox;
