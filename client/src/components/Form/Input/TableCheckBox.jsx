import React, { useState, useRef, useEffect } from "react";
import "../FormBody.css";

const TableCheckBox = ({ datas, formHandler }) => {
  const {
    name,
    label,
    required = true,
    options = {},
    disable = false,
    defaultValue = [],
    tm = true,
  } = datas;

  const [checkedBox, setCheckedBox] = useState(
    defaultValue.map((val) => String(val))
  );
  const [openOption, setOpenOption] = useState(false);
  const input = useRef();
  const defaultValueRef = useRef(defaultValue);
  const optionsRef = useRef(options);

  useEffect(() => {
    let newDefaultValue = defaultValueRef.current.map((val) => String(val));
    const newText = optionsRef.current.map((option) => {
      if (newDefaultValue.includes(String(option.value))) {
        return option.name;
      }
      return null;
    });
    input.current.value = newText.filter(Boolean).join(", ");
    return () => {};
  }, []);

  const checkBoxHandler = (e, value) => {
    let newCheckedBoxArray = [...checkedBox];
    if (!newCheckedBoxArray.includes(String(value))) {
      newCheckedBoxArray.push(value);
    } else {
      newCheckedBoxArray = newCheckedBoxArray.filter(
        (checkedBox) => String(checkedBox) !== value
      );
    }
    const newText = optionsRef.current.map((option) => {
      if (newCheckedBoxArray.includes(String(option.value))) {
        return option.name;
      }
      return null;
    });
    input.current.value = newText.filter(Boolean).join(", ");
    setCheckedBox(newCheckedBoxArray);
    formHandler(e, newCheckedBoxArray, name);
  };

  return (
    <div
      style={{ position: "relative", marginTop: tm ? "20px" : "0px" }}
      className={`normalInput checkBoxList ${disable ? "disable" : null}`}>
      <label htmlFor={name}>
        {label}
        {required && <span>*</span>}
      </label>
      <input
        type="text"
        readOnly={true}
        placeholder={"Select a value"}
        ref={input}
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
        onClick={() => setOpenOption((prev) => !prev)}
      />
      <span
        className="displayOption"
        onClick={() => setOpenOption((prev) => !prev)}>
        <span className="material-symbols-outlined">keyboard_arrow_down</span>
      </span>
      <div className={`scrollable ${openOption && "show"}`}>
        {options.length > 0 &&
          options.map((option) => {
            return (
              <div
                key={`option-${option.value}`}
                onClick={(e) => checkBoxHandler(e, String(option.value))}>
                <input
                  type="checkbox"
                  name={name}
                  value={String(option.value)}
                  disabled={disable}
                  onChange={(e) => checkBoxHandler(e, String(option.value))}
                  checked={checkedBox.includes(String(option.value))}
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
