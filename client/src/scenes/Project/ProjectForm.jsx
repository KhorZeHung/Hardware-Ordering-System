import React, { useState, useEffect, useContext, useRef } from "react";
import RoomMaterialInput, {
  calculateSubTotal,
} from "../../components/Form/Input/RoomMaterialInput";
import { projectData, APIGateway, accountData } from "../../data";
import { constructInput } from "../../components/Form/FormBody";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { useParams, useNavigate } from "react-router-dom";
import QuoteProjSummary from "../../components/Card/QuoteProjSummary";
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
import SupplierOrderReadOnly from "../../components/Form/Input/SupplierOrderReadOnly";
import axios from "axios";
import { cloneDeep } from "lodash";
import "../index.css";

const ProjectForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { project_id } = useParams();
  const { setSnackbar } = useContext(SnackbarContext);
  const [formInputValue, setFormInputValue] = useState(null);
  const [orderLists, setOrderLists] = useState([]);
  const [accountInfo, setAccountInfo] = useState([]);
  const [profitInfo, setprofitInfo] = useState(0);
  const newProjectDataCopy = useRef(projectData.editProjectForm);
  const token = getCookie("token");
  const { openCustomModal } = useContext(CustomModalContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(APIGateway + newProjectDataCopy.current.endPoint);
    await axios
      .post(APIGateway + newProjectDataCopy.current.endPoint, formInputValue, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const { message } = res.data;
        setSnackbar({ open: true, severity: "success", message: message });
        setTimeout(() => {
          navigate(0);
        }, 2000);
      })
      .catch((err) => {
        const msg =
          err.response.data.message || err.message || "Something went wrong";
        setSnackbar({ open: true, message: msg, severity: "error" });
      });
  };

  const formHandler = (
    e,
    name = null,
    value = null,
    index = null,
    changeSubTotalValue = 0
  ) => {
    const inputValue = value || e.target.value;
    const inputName = name || e.target.name;
    console.log(inputValue);
    setFormInputValue((prev) => {
      const { project_sub_total, project_grand_total, ...rest } = prev;
      return {
        ...rest,
        [inputName]:
          Array.isArray(prev[inputName]) && index !== null
            ? prev[inputName].map((item, i) => {
                return i === index ? { ...item, ...inputValue } : item;
              })
            : inputValue,
        project_sub_total: project_sub_total + changeSubTotalValue,
        project_grand_total: project_grand_total + changeSubTotalValue,
      };
    });
  };

  const addRoomHandler = (e, defaultValue = []) => {
    e.preventDefault();
    const numOfRooms = formInputValue.project_product_lists.length + 1 || 1;
    const changeValue = calculateSubTotal(defaultValue);
    const copiedDefaultValue = cloneDeep(defaultValue);

    const productListArray = [
      ...formInputValue.project_product_lists,
      {
        roomName: `room ${numOfRooms}`,
        productList: copiedDefaultValue,
      },
    ];
    setFormInputValue((prev) => ({
      ...prev,
      project_product_lists: productListArray,
      project_sub_total: prev.project_sub_total + parseFloat(changeValue),
      project_grand_total: prev.project_grand_total + parseFloat(changeValue),
    }));
  };

  const deleteRoomHandler = (index) => {
    const changeValue = calculateSubTotal(
      formInputValue.project_product_lists[index].productList
    );

    setFormInputValue((prev) => {
      const newProductList = [...prev.project_product_lists];
      newProductList.splice(index, 1);

      return {
        ...prev,
        project_product_lists: newProductList,
        project_sub_total: prev.project_sub_total - parseFloat(changeValue),
        project_grand_total: prev.project_grand_total - parseFloat(changeValue),
      };
    });
  };

  const discountHandler = (e) => {
    const value = parseFloat(e.target.value) || 0;
    if (value > formInputValue.project_sub_total) {
      return;
    }
    setFormInputValue((prev) => ({
      ...prev,
      project_discount: value,
      project_grand_total: prev.project_sub_total - value,
    }));
  };

  const createRoomHandler = () => {
    if (formInputValue) {
      return formInputValue.project_product_lists.map((value, index) => {
        return (
          <RoomMaterialInput
            key={"room_" + (index + 1)}
            datas={{
              index: index,
              formHandler: formHandler,
              defaultProductList: value,
              addRoomHandler: addRoomHandler,
              deleteRoomHandler: deleteRoomHandler,
              isQuote: false,
            }}
          />
        );
      });
    }
    return null;
  };

  const createOrderHandler = () => {
    if (orderLists) {
      return orderLists.map((value, index) => {
        return (
          <SupplierOrderReadOnly
            key={"room" + index}
            datas={{ defaultOrderList: value, index: index, action: [] }}
          />
        );
      });
    }
    return null;
  };

  useEffect(() => {
    if (project_id && setSnackbar) {
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
          let newProjectDataWithDefaultValue = projectData.inputLists.map(
            (field) => {
              let returnField = field;
              if (projectInfo.hasOwnProperty(field.name)) {
                returnField = {
                  ...returnField,
                  defaultValue: projectInfo[field.name],
                };
              }
              return returnField;
            }
          );

          newProjectDataCopy.current.endPoint = `/project/edit/${project_id}`;
          setFormInputValue((prev) => ({
            ...prev,
            ...projectInfo,
            project_grand_total:
              projectInfo.project_sub_total -
              (projectInfo.project_discount || 0),
          }));
          newProjectDataCopy.current.inputLists =
            newProjectDataWithDefaultValue;
          setprofitInfo(profitInfo);
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
    return () => {};
  }, [project_id, setSnackbar, token]);

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
  return (
    <>
      {!isLoading ? (
        <div style={{ position: "relative" }}>
          <div className="prevPageBtn">
            <span
              className="material-symbols-outlined"
              onClick={() => navigate(-1)}>
              arrow_back
            </span>
          </div>
          <form method="post" className="formBody" style={{ width: "80%" }}>
            <p className="title">{newProjectDataCopy.current.title}</p>
            <div className="formInputLists" style={{ marginBottom: "3rem" }}>
              {constructInput(
                newProjectDataCopy.current.inputLists,
                formHandler
              )}
            </div>
            <p className="title">material</p>
            <div style={{ margin: "1rem 0" }}>{createRoomHandler()}</div>
            <button className="addRoom" onClick={addRoomHandler}>
              +
            </button>
            {formInputValue && (
              <QuoteProjSummary
                formInputValue={{
                  quote_sub_total: formInputValue.project_sub_total,
                  quote_grand_total: formInputValue.project_grand_total,
                  quote_discount: formInputValue.project_discount,
                }}
                discountHandler={discountHandler}
              />
            )}
            <br />
            <div className="title">order</div>
            <div style={{ margin: "1rem 0" }}>{createOrderHandler()}</div>
          </form>

          <AccountStatusCard
            data={{
              defaultValue: accountInfo,
              profitInfo: profitInfo,
            }}
          />
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
                      <span className="material-symbols-outlined">
                        view_list
                      </span>
                    </ListItemIcon>
                    <ListItemText
                      primary={"generate .xlsx order spreadsheet"}
                    />
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
                            inputLists:
                              accountData.newAccountForm.inputLists.map(
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
                <ListItem disablePadding>
                  <ListItemButton onClick={submitHandler}>
                    <ListItemIcon>
                      <span className="material-symbols-outlined">
                        file_save
                      </span>
                    </ListItemIcon>
                    <ListItemText primary={"save project"} />
                  </ListItemButton>
                </ListItem>
              </List>
            </div>
          </SwipeableDrawer>
        </div>
      ) : (
        <div className="center" style={{ height: "400px", width: "100%" }}>
          <CircularProgress />
        </div>
      )}
    </>
  );
};

export default ProjectForm;
