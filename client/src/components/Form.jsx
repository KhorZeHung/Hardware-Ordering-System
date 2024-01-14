import React from "react";
import "./index.css";
import "./Form.css";

const Form = ({ className, inputArrays, submitVal }) => {
  return (
    <form className={className}>
      {inputArrays.map((inputEle) => {
        return (
          <>
            <label htmlFor={inputEle["name"]} key={inputEle["name"]}>
              {inputEle["placeholder"]}
            </label>
            <input
              key={inputEle["name"] + "Input"}
              type={inputEle["type"] || "text"}
              name={inputEle["name"]}
              placeholder={inputEle["placeholder"]}
            />
          </>
        );
      })}
      <input type="submit" value={submitVal} />
    </form>
  );
};

export default Form;
