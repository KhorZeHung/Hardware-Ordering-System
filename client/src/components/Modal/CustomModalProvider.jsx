import React, { useState } from "react";
import CustomModal from "./CustomModal";
export const CustomModalContext = React.createContext();

const CustomModalProvider = ({ children }) => {
  const [modalController, setModalController] = useState({
    open: false,
    formStructure: [],
  });

  const openCustomModal = (formStructure) => {
    setModalController({
      open: true,
      formStructure: formStructure,
    });
  };

  const closeCustomModal = () => {
    setModalController((prev) => ({ ...prev, open: false }));
  };

  return (
    <CustomModalContext.Provider value={{ openCustomModal, closeCustomModal }}>
      {children}
      <CustomModal
        open={modalController.open}
        formStructure={modalController.formStructure}
        closeFunc={closeCustomModal}
      />
    </CustomModalContext.Provider>
  );
};

export default CustomModalProvider;
