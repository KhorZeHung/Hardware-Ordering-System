import React, { useState } from "react";
import CustomSnackbar from ".";

export const SnackbarContext = React.createContext();

const SnackBarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <SnackbarContext.Provider value={{ setSnackbar }}>
      {children}
      <CustomSnackbar
        open={snackbar.open}
        handleClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </SnackbarContext.Provider>
  );
};

export default SnackBarProvider;
