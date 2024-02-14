import React, { useRef } from "react";
import "../FormBody.css";

const NormalInput = ({ datas, formHandler }) => {
  const inputRequirement = useRef();
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

    if (returnTxt !== "Atleast ") {
      inputRequirement.current.innerHTML = returnTxt;
    } else {
      inputRequirement.current.classList.add("success");
      inputRequirement.current.innerHTML = "Valid Password";
    }
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={formHandler}
        id={name}
        min={min}
        max={max}
        disabled={disable}
        onKeyUp={onKeyUpCheck ? checkInputRequirements : null}
      />
      {onKeyUpCheck && (
        <span className="inputRequirement" ref={inputRequirement}>
          Atleast 8 character 1 alphabet 1 special character
        </span>
      )}
    </div>
  );
};

export default NormalInput;
