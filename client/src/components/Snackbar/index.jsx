import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const CustomSnackbar = ({ open, handleClose, message, severity }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      onClose={handleClose}>
      <Alert
        onClose={handleClose}
        severity={severity}
        elevation={6}
        variant="filled"
        sx={{ mb: 2 }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
