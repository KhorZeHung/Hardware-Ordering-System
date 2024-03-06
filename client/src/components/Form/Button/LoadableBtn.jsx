import React from "react";
import CircularProgress from "@mui/material-next/CircularProgress";
import "../FormBody.css";

const LoadableBtn = ({ isLoading, txt }) => {
  return (
    <>
      <button type="submit">
        {isLoading ? <CircularProgress size={18} color="inherit" /> : txt}
      </button>
    </>
  );
};

export default LoadableBtn;
