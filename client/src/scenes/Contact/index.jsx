import React, { useState, useContext } from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { contactData, APIGateway } from "../../data";
import { CustomModalContext } from "../../components/Modal/CustomModalProvider";
import { ConfirmModalContext } from "../../components/Modal/ConfirmModalProvider";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { getCookie } from "../../utils/cookie";
import axios from "axios";

const Contact = () => {
  const [isSupplierPage, setIsSupplierPage] = useState("supplier");
  const { openCustomModal } = useContext(CustomModalContext);
  const { setSnackbar } = useContext(SnackbarContext);
  const { openModal } = useContext(ConfirmModalContext);
  const token = getCookie("token");

  const deleteHandler = (id) => {
    openModal(
      "Confirmation",
      ["Are you sure you want to delete?", "Deletion is permenant"],
      () => deleteRequest(id)
    );
  };

  const deleteRequest = async (id) => {
    await axios
      .delete(
        APIGateway +
          contactData[isSupplierPage].tableData.endPoint +
          `/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const message = res.data.message;
        setSnackbar({ severity: "success", message: message, open: true });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        const message =
          err.response.data.message || err.message || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };

  const editRequest = async (id) => {
    await axios
      .get(
        APIGateway +
          contactData[isSupplierPage].newModalForm.getDefaultValueEndPoint +
          id,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const newValue = {
          title: `edit ${isSupplierPage}`,
          submitValue: `update ${isSupplierPage}`,
          endPoint: `/${isSupplierPage}/edit`,
        };
        let dataWithDefaultValue = {
          ...contactData[isSupplierPage].newModalForm,
          ...newValue,
        };

        const data = res.data.data;
        const option = res.data.option || null;

        dataWithDefaultValue.inputLists = contactData[
          isSupplierPage
        ].newModalForm.inputLists.map((field) => {
          let returnField = field;
          if (data.hasOwnProperty(field.name)) {
            returnField = {
              ...returnField,
              defaultValue: data[field.name],
            };
          }

          if (option && option[field.name]) {
            returnField = {
              ...returnField,
              options: option[field.name],
            };
          }

          return returnField;
        });

        openCustomModal(dataWithDefaultValue);
      })
      .catch((err) => {
        console.log(err);
        const message =
          err.response.data.message || err.message || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };

  contactData[
    isSupplierPage
  ].tableData.checkBox.handlerArray[0].onClickHandler = editRequest;
  contactData[
    isSupplierPage
  ].tableData.checkBox.handlerArray[1].onClickHandler = deleteHandler;
  return (
    <>
      <div className="contentMainBody">
        <ul className="subPageOption">
          {["supplier", "product"].map((pages, index) => (
            <li
              key={index}
              onClick={() => setIsSupplierPage(pages)}
              className={isSupplierPage === pages ? "selected" : ""}>
              {pages}
            </li>
          ))}
        </ul>
        <TableWithSmlCard datas={contactData[isSupplierPage]} />
        <span
          className="addNewItem"
          onClick={() =>
            openCustomModal(contactData[isSupplierPage].newModalForm)
          }>
          +
        </span>
      </div>
    </>
  );
};

export default Contact;
