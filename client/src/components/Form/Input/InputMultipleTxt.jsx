import React, { useState } from "react";
import "../FormBody.css";

const InputMultipleTxt = ({ datas, formHandler }) => {
  const {
    name,
    label,
    required = true,
    descriptions = [],
    placeholder,
  } = datas;

  const [inputLists, setInputLists] = useState(descriptions);

  const updateDescriptions = (e) => {
    const inputEle = document.getElementById(name);
    const newInputListsArray = [...inputLists, inputEle.value];
    setInputLists(newInputListsArray);
    inputEle.value = "";
    formHandler(e, newInputListsArray, name);
  };

  const removeDescriptionHanlder = (e, index) => {
    const newInputListsArray = [...inputLists];
    newInputListsArray.splice(index, 1);
    setInputLists(newInputListsArray);
    formHandler(e, newInputListsArray, name);
  };

  return (
    <div className="checkBoxList">
      <div className="normalInput" style={{ position: "relative" }}>
        <label htmlFor="name">
          {label}
          {required && <span>*</span>}
        </label>
        <input
          name={name}
          id={name}
          required={required}
          placeholder={placeholder}
          style={{ paddingRight: "1.7rem" }}
        />
        <span className="addToListBtn" onClick={updateDescriptions}>
          +
        </span>
      </div>
      <div className="scrollable">
        <ul className="descriptionList">
          {inputLists.length > 0 &&
            inputLists.map((inputList, index) => {
              return (
                <li key={index}>
                  {inputList}
                  <input
                    type="button"
                    onClick={() => removeDescriptionHanlder({ index })}
                    value="&#x2716;"
                    className="fileList"
                  />
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default InputMultipleTxt;
