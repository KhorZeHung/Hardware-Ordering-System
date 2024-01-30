import React, { useState } from "react";
import InputFile from "./Input/InputFile";
import InputOption from "./Input/InputOption";
import NormalInput from "./Input/NormalInput";
import TableCheckBox from "./Input/TableCheckBox";
import InputMultipleTxt from "./Input/InputMultipleTxt";
import TextArea from "./Input/TextArea";
import "./FormBody.css";

const FormBody = (props) => {
  const { title = null, inputLists = null, submitValue = "submit" } = props;
  const [formInputValue, setFormInputValue] = useState({});

  const formHandler = (e, customValue, inputName) => {
    const id = inputName || e.target.name;
    const value = customValue || e.target.value;
    setFormInputValue({ ...formInputValue, [id]: value });
  };

  return (
    <form method="post" className="formBody">
      {title && <p className="title">{title}</p>}
      <div className="formInputLists">
        {inputLists && constructInput(inputLists, formHandler)}
      </div>
      <div className="formAction">
        <input type="reset" value="reset" />
        <input type="submit" value={submitValue} />
      </div>
    </form>
  );
};

export const constructInput = (inputLists, formHandler = null) => {
  return inputLists.map((inputList, index) => {
    switch (inputList.type) {
      case "text":
      case "date":
      case "password":
      case "email":
      case "tel":
        return (
          <NormalInput
            key={index}
            datas={inputList}
            formHandler={formHandler}
          />
        );

      case "file":
        return (
          <InputFile key={index} datas={inputList} formHandler={formHandler} />
        );

      case "textarea":
        return (
          <TextArea key={index} datas={inputList} formHandler={formHandler} />
        );

      case "checkbox":
        return (
          <TableCheckBox
            key={index}
            datas={inputList}
            formHandler={formHandler}
          />
        );
      case "option":
        return (
          <InputOption
            key={index}
            datas={inputList}
            formHandler={formHandler}
          />
        );
      case "multipletext":
        return (
          <InputMultipleTxt
            key={index}
            datas={inputList}
            formHandler={formHandler}
          />
        );
      default:
        return (
          <NormalInput
            key={index}
            datas={inputList}
            formHandler={formHandler}
          />
        );
    }
  });
};
export default FormBody;
