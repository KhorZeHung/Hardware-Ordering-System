import React from "react";
import { Navigate } from "react-router-dom";
import { getCookie } from "../../utils/cookie";

const LoginRoute = ({ children }) => {
  const isLoggedIn = getCookie("token");
  return !isLoggedIn ? children : <Navigate to="../" replace={true} />;
};

export default LoginRoute;
