import React from "react";
import { constructInput } from "../../components/Form/FormBody";
import { loginData } from "../../data";
import { Link } from "react-router-dom";

const Login = () => {
  const containerStyle = {
    height: "100vh",
    width: "100vw",
    backgroundColor: "var(--primary-color-6)",
  };

  const loginFormStyle = {
    maxWidth: "400px",
    maxHeight: "600px",
    boxShadow: "var(--box-shadow-1)",
    borderRadius: "10px",
  };

  const linkStyle = {
    margin: "10px",
    color: "blue",
    fontSize: "0.7rem",
    display: "block",
  };

  return (
    <div className="center" style={containerStyle}>
      <div className="formBody" style={loginFormStyle}>
        <form method="post" name="loginForm">
          <p className="title">login</p>
          {constructInput(loginData)}
          <Link to="./forgot-password" target="_self" style={linkStyle}>
            forgot password?
          </Link>
          <div className="formAction">
            <input type="submit" value="login" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
