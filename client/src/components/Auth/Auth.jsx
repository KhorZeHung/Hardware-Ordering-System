import React from "react";
import { Navigate } from "react-router-dom";
import { getCookie } from "../../utils/cookie";

const PrivateRoute = ({ children }) => {
  const isLoggedIn = getCookie("token");

  return isLoggedIn ? children : <Navigate to="/login" replace={true} />;
};

export default PrivateRoute;
