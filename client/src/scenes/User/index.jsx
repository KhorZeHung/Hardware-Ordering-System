import React, { useContext } from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { userData, APIGateway } from "../../data";
import { CustomModalContext } from "../../components/Modal/CustomModalProvider";
import { ConfirmModalContext } from "../../components/Modal/ConfirmModalProvider";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import axios from "axios";
import { getCookie } from "../../utils/cookie";

const User = () => {
  const { openCustomModal } = useContext(CustomModalContext);
  const { openModal } = useContext(ConfirmModalContext);
  const { setSnackbar } = useContext(SnackbarContext);

  const deleteUserHandler = (user_id) => {
    openModal(
      "Confirmation",
      ["Are you sure you want to delete?", "Deletion is permenant"],
      () => deleteUserRequest(user_id)
    );
  };

  const token = getCookie("token");

  const deleteUserRequest = async (user_id) => {
    await axios
      .delete(APIGateway + userData.tableData.endPoint + `/delete/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const message = res.data.message;
        setSnackbar({
          severity: "success",
          message: message,
          open: true,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        const message = err.response.data.message || err.message;
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };

  const editUserRequest = async (user_id) => {
    await axios
      .get(
        APIGateway + userData.newModalForm.getDefaultValueEndPoint + user_id,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const newValue = {
          title: "edit user",
          submitValue: "update user",
          endPoint: "/user/edit-profile",
        };
        let userDataWithDefaultValue = {
          ...userData.newModalForm,
          ...newValue,
        };

        userDataWithDefaultValue.inputLists =
          userData.newModalForm.inputLists.map((field) => {
            if (res.data.data.hasOwnProperty(field.name)) {
              return {
                ...field,
                defaultValue: res.data.data[field.name],
              };
            } else {
              return field;
            }
          });

        openCustomModal(userDataWithDefaultValue);
      })
      .catch((err) => {
        const message = err.response.data.message || err.message;
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };

  userData.tableData.checkBox.handlerArray[0].onClickHandler = editUserRequest;
  userData.tableData.checkBox.handlerArray[1].onClickHandler =
    deleteUserHandler;

  return (
    <>
      <div className="contentMainBody">
        <TableWithSmlCard datas={userData} />
        <span
          className="addNewItem"
          onClick={() => openCustomModal(userData.newModalForm)}>
          +
        </span>
      </div>
    </>
  );
};

export default User;
