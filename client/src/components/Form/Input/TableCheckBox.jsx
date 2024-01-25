import React, { useState } from "react";
import "../FormBody.css";

const TableCheckBox = ({ datas, formHandler }) => {
  const { name, label, required = true, options = [] } = datas;
  const [checkedBox, setCheckedBox] = useState([]);

  const checkBoxHandler = (e) => {
    const newCheckedBoxArray = [...checkedBox];
    if (e.target.checked) {
      newCheckedBoxArray.push(e.target.value);
    } else {
      newCheckedBoxArray.filter((checkedBox) => checkedBox !== e.target.value);
    }
    setCheckedBox(newCheckedBoxArray);
    formHandler(e, newCheckedBoxArray, name);
  };

  return (
    <div className="checkBoxList">
      <label htmlFor={name}>
        {label} {required && <span>*</span>}
      </label>
      <div className="scrollable">
        {options.length > 0 &&
          options.map((option, index) => {
            return (
              <div key={index} onChange={checkBoxHandler}>
                <input type="checkbox" value={option} name={name} />
                <p>{option}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default TableCheckBox;
