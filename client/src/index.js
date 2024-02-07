import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import SnackBarProvider from "./components/Snackbar/SnackBarProvidor";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SnackBarProvider>
      <App />
    </SnackBarProvider>
  </React.StrictMode>
);
