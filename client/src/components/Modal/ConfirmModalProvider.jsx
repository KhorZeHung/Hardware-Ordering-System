import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export const ConfirmModalContext = React.createContext();

const ConfirmModalProvider = ({ children }) => {
  const [modalController, setModalController] = useState({
    open: false,
    title: null,
    descriptions: [],
    onConfirm: null,
  });

  const openModal = (title, descriptions, onConfirm) => {
    setModalController({
      open: true,
      title: title,
      descriptions: descriptions,
      onConfirm: () => {
        onConfirm();
        closeModal();
      },
    });
  };

  const closeModal = () => {
    setModalController((prev) => ({ ...prev, open: false }));
  };

  return (
    <ConfirmModalContext.Provider
      value={{
        openModal,
        closeModal,
      }}>
      {children}
      <ConfirmModal
        open={modalController.open}
        title={modalController.title}
        descriptions={modalController.descriptions}
        onClose={closeModal}
        onConfirm={modalController.onConfirm}
      />
    </ConfirmModalContext.Provider>
  );
};

export default ConfirmModalProvider;
