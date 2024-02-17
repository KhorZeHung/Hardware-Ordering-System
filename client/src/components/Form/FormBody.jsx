import React, { useState, useContext, useEffect } from "react";
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
    grid = true,
    endPoint,
  } = props;
  const [formInputValue, setFormInputValue] = useState({});

  useEffect(() => {
    inputLists.map((fileds) => {
      if (fileds.hasOwnProperty("defaultValue")) {
        setFormInputValue((prev) => ({
          ...prev,
          [fileds.name]: fileds.defaultValue,
          update: true,
        }));
      }
      return null;
    });
  }, [inputLists]);

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
            key={`input-${index}`}
            datas={inputList}
            formHandler={formHandler}
          />
        );

      case "file":
        return (
          <InputFile
            key={`input-${index}`}
            datas={inputList}
            formHandler={formHandler}
          />
        );

      case "textarea":
        return (
          <TextArea
            key={`input-${index}`}
            datas={inputList}
            formHandler={formHandler}
          />
        );

      case "checkbox":
        return (
          <TableCheckBox
            key={`input-${index}`}
            datas={inputList}
            formHandler={formHandler}
          />
        );
      case "option":
        return (
          <InputOption
            key={`input-${index}`}
            datas={inputList}
            formHandler={formHandler}
          />
        );
      case "multipletext":
        return (
          <InputMultipleTxt
            key={`input-${index}`}
            datas={inputList}
            formHandler={formHandler}
          />
        );
      case "hidden":
        return (
          <input
            type="hidden"
            value={inputList.value}
            name={inputList.name}
            key={`input-${index}`}
          />
        );

      default:
        return (
          <NormalInput
            key={`input-${index}`}
            datas={inputList}
            formHandler={formHandler}
          />
        );
    }
  });
};
export default FormBody;
