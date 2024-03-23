import React, { useState, useContext } from "react";
import { APIGateway, projectData } from "../../data";
import { ConfirmModalContext } from "../../components/Modal/ConfirmModalProvider";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { getCookie } from "../../utils/cookie";
import FilterTable from "../../components/Table/FilterTable";
import Dialog from "@mui/material/Dialog";
import axios from "axios";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { useNavigate } from "react-router-dom";
import "../index.css";

const Project = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { openModal } = useContext(ConfirmModalContext);
  const { setSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();
  const token = getCookie("token");

  const addProjectHandler = async (id) => {
    const url = APIGateway + projectData.endPoint + "/add/" + id;

    await axios
      .post(url, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const { message, project_id } = res.data;
        setSnackbar({ severity: "success", message: message, open: true });
        setTimeout(() => {
          navigate(`./${project_id}`);
        }, 2000);
      })
      .catch((err) => {
        const message = err.response.data.message || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };

  const filterTableData = {
    checkBox: {
      addCheckBox: false,
      handlerArray: [
        {
          name: "select",
          onClickHandler: (id) => {
            openModal(
              "Confirmation",
              [
                "Are you sure you want to convert this quotation to a project",
                "After convertion, nothing can be changes",
              ],
              () => addProjectHandler(id)
            );
          },
        },
      ],
    },
    endPoint: "/quote/options",
  };

  const editProjectHandler = (id) => {
    navigate(`./${id}`);
  };

  projectData.tableData.checkBox.handlerArray[0].onClickHandler =
    editProjectHandler;

  return (
    <>
      <div className="contentMainBody">
        <TableWithSmlCard datas={projectData} />
        <span className="addNewItem" onClick={() => setModalOpen(true)}>
          +
        </span>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        scroll="body"
        maxWidth="md"
        fullWidth={true}
        sx={{
          "& .MuiDialog-paper": {
            padding: "10px",
          },
        }}>
        <FilterTable datas={filterTableData} />
      </Dialog>
    </>
  );
};

export default Project;
