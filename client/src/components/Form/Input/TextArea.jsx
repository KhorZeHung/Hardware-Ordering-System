import React from "react";
import "../FormBody.css";

const textArea = ({ datas, formHandler }) => {
  const {
    name,
    label,
    required = true,
    placeholder = "Any other thing you want to mention?",
  } = datas;
  return (
    <div className="normalInput">
      <label htmlFor="name">
        {label} {required && <span>*</span>}
      </label>
      <textarea
        name={name}
        id={name}
        placeholder={placeholder}
        onChange={formHandler}></textarea>
    </div>
  );
};

export default textArea;
