import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const ConfirmModal = ({
  title,
  descriptions,
  open = true,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ fontSize: "1.4rem" }}>{title}</DialogTitle>
      <DialogContent>
        {descriptions.map((description, index) => (
          <DialogContentText key={`description${index}`}>
            {description}
          </DialogContentText>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmModal;
