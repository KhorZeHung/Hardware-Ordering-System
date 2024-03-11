import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const SnackBarProvider = lazy(() =>
  import("./components/Snackbar/SnackBarProvidor")
);
const ConfirmModalProvider = lazy(() =>
  import("./components/Modal/ConfirmModalProvider")
);
const CustomModalProvider = lazy(() =>
  import("./components/Modal/CustomModalProvider")
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Suspense
      fallback={
        <div>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}>
            <CircularProgress color="inherit" />
          </Backdrop>
        </div>
      }>
      <SnackBarProvider>
        <ConfirmModalProvider>
          <CustomModalProvider>
            <App />
          </CustomModalProvider>
        </ConfirmModalProvider>
      </SnackBarProvider>
    </Suspense>
  </React.StrictMode>
);
