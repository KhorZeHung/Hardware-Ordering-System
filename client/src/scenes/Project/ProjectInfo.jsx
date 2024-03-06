import React, { useState, useEffect, useContext } from "react";
import { constructInput } from "../../components/Form/FormBody";
import { projectData, APIGateway, accountData } from "../../data";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { useParams } from "react-router-dom";
import { CircularProgress, Tooltip } from "@mui/material";
import { CustomModalContext } from "../../components/Modal/CustomModalProvider";
import AccountStatusCard from "../../components/Card/AccountStatusCard";
import RoomMaterialReadOnly from "../../components/Form/Input/RoomMaterialReadOnly";
import SupplierOrderReadOnly from "../../components/Form/Input/SupplierOrderReadOnly";
import axios from "axios";
import "../index.css";

const ProjectInfo = () => {
  const { project_id } = useParams();
  const { setSnackbar } = useContext(SnackbarContext);
  const [isLoading, setIsLoading] = useState(false);
  const [inputLists, setInputLists] = useState([]);
  const [orderLists, setOrderLists] = useState([]);
  const [isOrderSummary, setIsOrderSummary] = useState(false);
  const [roomMaterial, setRoomMaterial] = useState([]);
  const [accountInfo, setAccountInfo] = useState([]);
  const [roomMaterialSummary, setRoomMaterialSummary] = useState({});
  const token = getCookie("token");

  useEffect(() => {
    if (project_id) {
      setIsLoading(true);
      accountData.newAccountForm.inputLists =
        accountData.newAccountForm.inputLists.map((input) => {
          if (input.name === "project_id")
            return { ...input, defaultValue: project_id };
          return input;
        });

      axios
        .get(APIGateway + "/project/" + project_id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const { projectInfo, orderInfo, accountInfo } = res.data;
          const updatedInputLists = projectData.inputLists.map((field) => {
            let returnField = field;
            if (projectInfo.hasOwnProperty(field.name)) {
              returnField = {
                ...returnField,
                defaultValue: projectInfo[field.name],
              };
            }
            return returnField;
          });
          setInputLists(updatedInputLists);

          setRoomMaterialSummary({
            subtotal: projectInfo.project_sub_total,
            discount: projectInfo.project_discount,
            grandtotal: projectInfo.project_grand_total,
          });
          setRoomMaterial(projectInfo.project_product_lists);
          setOrderLists(orderInfo);
          setAccountInfo(accountInfo);
        })
        .catch((err) => {
          const message =
            err.response.data.message || err.message || "Something went wrong";
          setSnackbar({ open: true, message: message, severity: "error" });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [project_id, setSnackbar, token]);

  const createRoomHandler = () => {
    if (isOrderSummary && orderLists) {
      return orderLists.map((value, index) => {
        return (
          <SupplierOrderReadOnly
            key={"room" + index}
            datas={{ defaultOrderList: value, index: index, action: [] }}
          />
        );
      });
    } else if (roomMaterial) {
      return roomMaterial.map((value, index) => {
        return (
          <RoomMaterialReadOnly
            key={"room" + index}
            datas={{
              index: index,
              defaultProductList: value,
            }}
          />
        );
      });
    } else {
      return;
    }
  };

  const { openCustomModal } = useContext(CustomModalContext);

  return isLoading ? (
    <div style={{ height: "90vh", width: "100vw" }} className="center">
      <CircularProgress />
    </div>
  ) : (
    <div
      className="projectInfo"
      style={{ position: "relative", boxSizing: "border-box" }}>
      <div>
        <div className="formBody">
          <div className="formInputLists" style={{ marginBottom: "3rem" }}>
            {constructInput(inputLists, null)}
          </div>
          <div className="userOption">
            <p
              className={isOrderSummary ? "" : "selected"}
              onClick={() => setIsOrderSummary(false)}>
              Material summary
            </p>
            <p
              className={isOrderSummary ? "selected" : ""}
              onClick={() => setIsOrderSummary(true)}>
              Order summary
            </p>
          </div>
          <div style={{ margin: "1rem 0" }}>{createRoomHandler()}</div>
          {!isOrderSummary && (
            <div className="materialSummary">
              <table>
                <tbody>
                  <tr>
                    <td>Sub-total</td>
                    <td>
                      {parseFloat(roomMaterialSummary.subtotal).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>Discount</td>
                    <td>
                      {parseFloat(roomMaterialSummary.discount).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>Grand total</td>
                    <td>
                      {parseFloat(roomMaterialSummary.grandtotal).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AccountStatusCard data={{ defaultValue: accountInfo }} />
      </div>
      <Tooltip title="add statement">
        <span
          className="addNewItem"
          onClick={() => openCustomModal(accountData.newAccountForm)}>
          +
        </span>
      </Tooltip>
    </div>
  );
};

export default ProjectInfo;
