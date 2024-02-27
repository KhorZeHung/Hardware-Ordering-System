import React, { useState, useEffect, useContext } from "react";
import { constructInput } from "../../components/Form/FormBody";
import { projectData, APIGateway } from "../../data";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { useParams } from "react-router-dom";
import AccountStatusCard from "../../components/Card/AccountStatusCard";
import ProjActionFab from "../../components/FloatingActionButton/ProjActionFab";
import RoomMaterialReadOnly from "../../components/Form/Input/RoomMaterialReadOnly";
import SupplierOrderReadOnly from "../../components/Form/Input/SupplierOrderReadOnly";
import axios from "axios";
import "../index.css";

const ProjectInfo = () => {
  const { project_id } = useParams();
  const { setSnackbar } = useContext(SnackbarContext);
  const [inputLists, setInputLists] = useState([]);
  const [orderLists, setOrderLists] = useState([]);
  const [isOrderSummary, setIsOrderSummary] = useState(false);
  const [roomMaterial, setRoomMaterial] = useState(null);
  const token = getCookie("token");

  useEffect(() => {
    if (project_id) {
      axios
        .get(APIGateway + "/project/" + project_id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const { data } = res.data;
          const updatedInputLists = projectData.inputLists.map((field) => {
            let returnField = field;
            if (data.hasOwnProperty(field.name)) {
              returnField = {
                ...returnField,
                defaultValue: data[field.name],
              };
            }
            return returnField;
          });
          setInputLists(updatedInputLists);
          setRoomMaterial(data.project_product_lists);
        })
        .catch((err) => {
          const message =
            err.response.data.message || err.message || "Something went wrong";
          setSnackbar({ open: true, message: message, severity: "error" });
        });
    }
  }, [project_id, setSnackbar]);

  useEffect(() => {
    const token = getCookie("token");
    axios
      .get(APIGateway + "/order/" + project_id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const { data } = res.data;
        setOrderLists(data);
      })
      .catch((err) => {
        const message =
          err.response.data.message || err.message || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      });
    return () => {};
  }, []);

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

  return (
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
        </div>

        <AccountStatusCard />
      </div>
      <ProjActionFab />
    </div>
  );
};

export default ProjectInfo;
