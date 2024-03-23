import React, { useContext, useEffect, useState } from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { contactData, APIGateway } from "../../data";
import { CustomModalContext } from "../../components/Modal/CustomModalProvider";
import { ConfirmModalContext } from "../../components/Modal/ConfirmModalProvider";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { getCookie } from "../../utils/cookie";
import { useParams, useNavigate } from "react-router-dom";
import useSupplierInfo from "../../utils/useSupplierInfo";
import axios from "axios";

const Contact = () => {
  const { subPages = "supplier" } = useParams();
  const { openCustomModal } = useContext(CustomModalContext);
  const { setSnackbar } = useContext(SnackbarContext);
  const { openModal } = useContext(ConfirmModalContext);
  const token = getCookie("token");
  const navigate = useNavigate();
  const [newModalFormData, setNewModalFormData] = useState({
    product: contactData.product.newModalForm,
    supplier: contactData.supplier.newModalForm,
  });
  const supplierInfo = useSupplierInfo();

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
        APIGateway + contactData[subPages].tableData.endPoint + `/delete/${id}`,
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
          contactData[subPages].newModalForm.getDefaultValueEndPoint +
          id,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const newValue = {
          title: `edit ${subPages}`,
          submitValue: `update ${subPages}`,
          endPoint: `/${subPages}/edit`,
        };
        let dataWithDefaultValue = {
          ...contactData[subPages].newModalForm,
          ...newValue,
        };

        const data = res.data.data;
        const option = res.data.option || null;

        dataWithDefaultValue.inputLists = contactData[
          subPages
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

  useEffect(() => {
    if (supplierInfo) {
      setNewModalFormData((prev) => {
        prev[subPages].inputLists = prev[subPages].inputLists.map((input) => {
          if (input.name === "supplier_id") {
            input.options = Object.values(supplierInfo);
          }
          return input;
        });
        return prev;
      });
    }
    return () => {};
    //eslint-disable-next-line
  }, [supplierInfo]);

  contactData[subPages].tableData.checkBox.handlerArray[0].onClickHandler =
    editRequest;
  contactData[subPages].tableData.checkBox.handlerArray[1].onClickHandler =
    deleteHandler;
  return (
    <>
      <div className="contentMainBody">
        <ul className="subPageOption">
          {["supplier", "product"].map((pages, index) => (
            <li
              key={index}
              onClick={() => {
                navigate(`/contact/${pages}`);
              }}
              className={subPages === pages ? "selected" : ""}>
              {pages}
            </li>
          ))}
        </ul>
        {subPages === "supplier" && (
          <TableWithSmlCard datas={contactData.supplier} />
        )}
        {subPages === "product" && (
          <TableWithSmlCard datas={contactData.product} />
        )}
        <span
          className="addNewItem"
          onClick={() => openCustomModal(newModalFormData[subPages])}>
          +
        </span>
      </div>
    </>
  );
};

export default Contact;
