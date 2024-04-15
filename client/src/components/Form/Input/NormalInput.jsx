import React, { useContext, useRef } from "react";
import "../FormBody.css";
import { SnackbarContext } from "../../Snackbar/SnackBarProvidor";

const NormalInput = ({ datas, formHandler }) => {
  const inputRequirement = useRef();
  const { setSnackbar } = useContext(SnackbarContext);
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
    onKeyUpCheck = false,
  } = datas;

  const checkInputRequirements = (event) => {
    const inputValue = event.target.value;
    if (!event.target.required) return;

    const isLengthValid = inputValue.length >= 8;
    const hasAlphabet = /[a-zA-Z]/.test(inputValue);
    //eslint-disable-next-line
    const hasSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      inputValue
    );

    //Atleast 8 character, include 1 alphabet, 1 special character
    inputRequirement.current.classList.remove("success");
    var returnTxt = "Atleast";
    if (!isLengthValid) returnTxt += " 8 character";
    if (!hasAlphabet) {
      returnTxt += " 1 alphabet";
    }
    if (!hasSpecialCharacter) {
      returnTxt += " 1 special character";
    }

    if (returnTxt !== "Atleast") {
      inputRequirement.current.innerHTML = returnTxt;
    } else {
      inputRequirement.current.classList.remove("fail");
      inputRequirement.current.classList.add("success");
      inputRequirement.current.innerHTML = "Valid Password";
    }
  };

  const notificationCheck = () => {
    if (onKeyUpCheck)
      return (
        <span className="inputRequirement" ref={inputRequirement}>
          Atleast 8 character 1 alphabet 1 special character
        </span>
      );

    if (type === "tel")
      return (
        <span className="inputRequirement">
          Only input digit without space, dash, +6.
        </span>
      );

    return;
  };

  const handleCopy = (event) => {
    if (event.target.readOnly) {
      navigator.clipboard.writeText(event.target.value);
      setSnackbar({ open: true, message: "copied", serverity: "success" });
    }
  };

  const defaultValueHandler = () => {
    if (defaultValue) {
      if (type === "date") {
        const parts = defaultValue.split("/");
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        const malaysiaTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        const formattedDate = malaysiaTime.toISOString().substr(0, 10);
        return formattedDate;
      }
      return defaultValue;
    }
    return null;
  };

  return (
    <div className={disable ? "normalInput disable" : "normalInput"}>
      <label htmlFor={name}>
        {label}
        {required && <span>*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValueHandler()}
        placeholder={placeholder}
        onChange={formHandler}
        id={name}
        min={min}
        max={max}
        readOnly={disable}
        onKeyUp={onKeyUpCheck ? checkInputRequirements : null}
        onClick={handleCopy}
        pattern={type === "tel" ? "^\\d{10,13}$" : null}
      />
      {notificationCheck()}
    </div>
  );
};

export default NormalInput;
