import React, { useState, useEffect, useContext } from "react";
import { constructInput } from "../../components/Form/FormBody";
import { projectData, APIGateway, accountData } from "../../data";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { useParams, useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Tooltip,
  SwipeableDrawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
} from "@mui/material";
import { CustomModalContext } from "../../components/Modal/CustomModalProvider";
import AccountStatusCard from "../../components/Card/AccountStatusCard";
import RoomMaterialReadOnly from "../../components/Form/Input/RoomMaterialReadOnly";
import SupplierOrderReadOnly from "../../components/Form/Input/SupplierOrderReadOnly";
import axios from "axios";
import "../index.css";

const ProjectInfo = () => {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const { setSnackbar } = useContext(SnackbarContext);
  const [isLoading, setIsLoading] = useState(true);
  const [inputLists, setInputLists] = useState([]);
  const [orderLists, setOrderLists] = useState([]);
  const [isOrderSummary, setIsOrderSummary] = useState(false);
  const [roomMaterial, setRoomMaterial] = useState([]);
  const [accountInfo, setAccountInfo] = useState([]);
  const [profitInfo, setprofitInfo] = useState(0);
  const [roomMaterialSummary, setRoomMaterialSummary] = useState({});
  const token = getCookie("token");
  const { openCustomModal } = useContext(CustomModalContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (project_id) {
      setIsLoading(true);
      accountData.newAccountForm.inputLists =
        accountData.newAccountForm.inputLists.map((input) => {
          if (input.name === "project_id")
            return { ...input, defaultValue: project_id };
          return input;
        });
      accountData.editAccountForm.inputLists =
        accountData.editAccountForm.inputLists.map((input) => {
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
          const { projectInfo, orderInfo, accountInfo, profitInfo } = res.data;
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
          setprofitInfo(profitInfo);
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

  const getOrderSpreadSheet = (e) => {
    e.preventDefault();

    if (!project_id) return null;

    axios
      .get(
        APIGateway + projectData.endPoint + "/order-spreadsheet/" + project_id,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
          responseType: "blob",
        }
      )
      .then((res) => {
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "order-spreadsheet.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSnackbar({
          open: true,
          message: "Download successful",
          severity: "success",
        });
      })
      .catch((err) => {
        const message = err.response.body.message || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSwipe = (open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  return isLoading ? (
    <div style={{ height: "90vh", width: "100vw" }} className="center">
      <CircularProgress />
    </div>
  ) : (
    <div
      className="projectInfo"
      style={{ position: "relative", boxSizing: "border-box" }}>
      <div className="prevPageBtn">
        <span
          className="material-symbols-outlined"
          onClick={() => navigate(-1)}>
          arrow_back
        </span>
      </div>
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

        <AccountStatusCard
          data={{
            defaultValue: accountInfo,
            profitInfo: profitInfo,
          }}
        />
      </div>
      <Tooltip title="edit project">
        <span className="addNewItem" onClick={() => setDrawerOpen(true)}>
          <span className="material-symbols-outlined">edit</span>
        </span>
      </Tooltip>
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={toggleDrawer}
        onOpen={() => {}}
        swipeAreaWidth={20}
        disableBackdropTransition={true}
        disableDiscovery={true}>
        <div
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={handleSwipe(false)}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={getOrderSpreadSheet}>
                <ListItemIcon>
                  <span className="material-symbols-outlined">view_list</span>
                </ListItemIcon>
                <ListItemText primary={"generate .xlsx order spreadsheet"} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  axios
                    .get(APIGateway + "/account/options/" + project_id, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    })
                    .then((res) => {
                      var options = res.data.options;
                      const updatedNewAccountForm = {
                        ...accountData.newAccountForm,
                        inputLists: accountData.newAccountForm.inputLists.map(
                          (input) => {
                            if (input.name === "typeOfPayment") {
                              return {
                                ...input,
                                options: options,
                              };
                            }
                            return input;
                          }
                        ),
                      };
                      openCustomModal(updatedNewAccountForm);
                    })
                    .catch((err) => {
                      const message =
                        err.response.data.message ||
                        err.message ||
                        "Something went wrong";
                      setSnackbar({
                        open: true,
                        message: message,
                        severity: "error",
                      });
                    });
                }}>
                <ListItemIcon>
                  <span className="material-symbols-outlined">add</span>
                </ListItemIcon>
                <ListItemText primary={"record order statement"} />
              </ListItemButton>
            </ListItem>
          </List>
        </div>
      </SwipeableDrawer>
    </div>
  );
};

export default ProjectInfo;
