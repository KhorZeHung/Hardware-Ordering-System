import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

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
    <Suspense fallback={<div>Loading...</div>}>
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
