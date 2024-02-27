import React, { useContext } from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { quoteData, APIGateway } from "../../data";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmModalContext } from "../../components/Modal/ConfirmModalProvider";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import axios from "axios";
import { getCookie } from "../../utils/cookie";

const Quotation = () => {
  const { openModal } = useContext(ConfirmModalContext);
  const { setSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  const deleteQuotationHandler = (id) => {
    openModal(
      "Confirmation",
      ["Are you sure you want to delete?", "Deletion is permenant"],
      () => deleteUserRequest(id)
    );
  };

  const token = getCookie("token");

  const deleteUserRequest = async (id) => {
    await axios
      .delete(APIGateway + quoteData.tableData.endPoint + `/delete/${id}`, {
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

  const editQuotationRequest = async (id) => {
    const des = "./" + id;
    navigate(des);
  };

  quoteData.tableData.checkBox.handlerArray[0].onClickHandler =
    editQuotationRequest;
  quoteData.tableData.checkBox.handlerArray[1].onClickHandler =
    deleteQuotationHandler;
  return (
    <div className="contentMainBody">
      <TableWithSmlCard datas={quoteData} />
      <span className="addNewItem">
        <Link to="./new-quote">+</Link>
      </span>
    </div>
  );
};

export default Quotation;
