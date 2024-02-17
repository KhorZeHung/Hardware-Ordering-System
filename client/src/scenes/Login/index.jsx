import React, { useState, useContext } from "react";
import { constructInput } from "../../components/Form/FormBody";
import { loginData } from "../../data";
import { Link } from "react-router-dom";
import { APIGateway } from "../../data";
import { setCookie } from "../../utils/cookie";
import axios from "axios";
import LoadableBtn from "../../components/Form/Button/LoadableBtn";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import "../index.css";

const Login = () => {
  const { setSnackbar } = useContext(SnackbarContext);

  const [isLoading, setIsLoading] = useState(false);
  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams(new FormData(e.target));
    setIsLoading(true);
    await axios
      .post(APIGateway + "/user/login", formData)
      .then((res) => {
        const token = res.data.token;
        const message = res.data.message;
        setCookie("token", token, 12);
        setSnackbar((prev) => ({
          severity: "success",
          message: message,
          open: true,
        }));
        setTimeout(() => {
          window.location = "../";
        }, 2000);
      })
      .catch((err) => {
        const message = err.response.data || err.message;
        setSnackbar({ open: true, message: message, severity: "error" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className="center centerFormContainer">
        <div className="formBody">
          <form method="post" name="loginForm" onSubmit={submitHandler}>
            <p className="title">login</p>
            {constructInput(loginData, null)}
            <Link to="../forgot-password" target="_self">
              forgot password?
            </Link>
            <div className="formAction">
              <LoadableBtn isLoading={isLoading} txt="Login" />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
