import React from "react";
import "./Modal.css";
import FormBody from "../Form/FormBody";
import Dialog from "@mui/material/Dialog";
import "../index.css";

const CustomModal = (props) => {
  const { open, closeFunc, formStructure = null } = props;

  return (
    <Dialog
      open={open}
      onClose={closeFunc}
      scroll="body"
      maxWidth="md"
      fullWidth={true}>
      {formStructure && (
        <FormBody
          title={formStructure.title}
          inputLists={formStructure.inputLists}
          submitValue={formStructure.submitValue}
          endPoint={formStructure.endPoint}
          grid={
            typeof formStructure.grid === "boolean" ? formStructure.grid : true
          }
        />
      )}
    </Dialog>
  );
};

export default CustomModal;
