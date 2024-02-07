import React from "react";
import { Navigate } from "react-router-dom";
import { getCookie } from "../../utils/cookie";
import { allowAccessLink } from "../../utils/allowAccessLink";

const PrivateRoute = ({ children, path }) => {
  const isLoggedIn = getCookie("token");
  const allowAccess =
    isLoggedIn && (allowAccessLink().includes(path) || path === "dashboard");

  return isLoggedIn && allowAccess ? (
    children
  ) : (
    <Navigate to="/login" replace={true} />
  );
};

export default PrivateRoute;
