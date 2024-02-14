import React, { useState, useContext } from "react";
import InputFile from "./Input/InputFile";
import InputOption from "./Input/InputOption";
import NormalInput from "./Input/NormalInput";
import TableCheckBox from "./Input/TableCheckBox";
import InputMultipleTxt from "./Input/InputMultipleTxt";
import TextArea from "./Input/TextArea";
import { APIGateway } from "../../data";
import axios from "axios";
import LoadableBtn from "../../components/Form/Button/LoadableBtn";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import "./FormBody.css";
import { getCookie } from "../../utils/cookie";

const FormBody = (props) => {
  const {
    title = null,
    inputLists = null,
    submitValue = "submit",
    reset = true,
    grid = true,
    endPoint,
  } = props;
  const [formInputValue, setFormInputValue] = useState({});

  const formHandler = (e, customValue, inputName) => {
    const id = inputName || e.target.name;
    const value = customValue || e.target.value;
    setFormInputValue({ ...formInputValue, [id]: value });
  };

  const token = getCookie("token");

  const { setSnackbar } = useContext(SnackbarContext);

  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(formInputValue);
    const formData = formInputValue;
    setIsLoading(true);

    await axios
      .post(APIGateway + endPoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const message = res.data.message;
        console.log(res.data);
        setSnackbar((prev) => ({
          severity: "success",
          message: message,
          open: true,
        }));
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        const message = err.response.data.message || err.message;
        setSnackbar({ open: true, message: message, severity: "error" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form method="post" className="formBody" onSubmit={submitHandler}>
      {title && <p className="title">{title}</p>}
      <div className={grid ? "formInputLists" : ""}>
        {inputLists && constructInput(inputLists, formHandler)}
      </div>
      <div className="formAction">
        {reset && <input type="reset" value="reset" />}
        <LoadableBtn isLoading={isLoading} txt={submitValue} />
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
