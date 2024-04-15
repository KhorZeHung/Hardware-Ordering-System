import React, { useEffect, useState, useRef, useContext } from "react";
import { Dialog, DialogContent, DialogActions } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { APIGateway, ImgPathWay, accountData } from "../../data";
import "./AccountStatusCard.css";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../Snackbar/SnackBarProvidor";
import { ConfirmModalContext } from "../Modal/ConfirmModalProvider";
import { CustomModalContext } from "../Modal/CustomModalProvider";
import { useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import axios from "axios";

const AccountStatusCard = ({ data }) => {
  const { defaultValue, profitInfo } = data;
  const newDefaultValue = useRef([]);
  const [accountSummary, setAccountSummary] = useState({
    debitTotal: 0,
    creditTotal: 0,
  });
  let cumulativeBalance = 0;
  const { setSnackbar } = useContext(SnackbarContext);
  const [openDialogIndex, setOpenDialogIndex] = useState(-1);
  const [imageUrls, setImageUrls] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const { openModal } = useContext(ConfirmModalContext);
  const { openCustomModal } = useContext(CustomModalContext);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const getImage = async (value) => {
    const token = getCookie("token");

    await axios
      .get(APIGateway + "/account/image/" + value, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const { data } = res.data;
        setImageUrls(data);
        setOpenDialogIndex(0);
      })
      .catch((err) => {
        const message = err.response.data.message || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };

  const handleNextDialog = () => {
    setOpenDialogIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const handlePrevDialog = () => {
    setOpenDialogIndex(
      (prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length
    );
  };

  const deleteStmtHandler = (e, id) => {
    e.preventDefault();
    openModal(
      "Confirmation",
      [
        "Are you sure you want to delete this statement",
        "Deletion is permanent, and cannot be undo.",
      ],
      () => {
        axios
          .post(APIGateway + "/account/delete/" + id, null, {
            headers: {
              Authorization: `Bearer ${getCookie("token")}`,
            },
          })
          .then((res) => {
            const { message } = res.data;
            setSnackbar({
              severity: "success",
              message: message,
              open: true,
            });
            setTimeout(() => {
              navigate(0);
            }, 2000);
          })
          .catch((err) => {
            const message = err.response.data.message || "Something went wrong";
            setSnackbar({
              open: true,
              message: message,
              severity: "error",
            });
          });
      }
    );
  };

  const editStmtHandler = (e, value) => {
    e.preventDefault();
    const nameRefer = {
      typeOfPayment: "description",
      account_status_date: "date",
      amount: "amount",
      account_status_description: "description",
      account_status_id: "id",
    };
    var updatedEditAccountForm = {
      ...accountData.editAccountForm,
      inputLists: accountData.editAccountForm.inputLists.map((input) => {
        return {
          ...input,
          defaultValue: value[nameRefer[input.name]],
        };
      }),
    };
    openCustomModal(updatedEditAccountForm);
  };

  useEffect(() => {
    let newObj = { debitTotal: 0, creditTotal: 0 };
    newDefaultValue.current = defaultValue.map((value) => {
      if (value.typeOfPayment === null) newObj.debitTotal += value.amount;
      else newObj.creditTotal += value.amount;
      return value;
    });

    setAccountSummary(newObj);

    return () => {};
  }, [defaultValue]);
  return (
    <>
      <div className="accountStatusSec center">
        {newDefaultValue.current.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Doc no</th>
                <th>Description</th>
                <th>Debit (RM)</th>
                <th>Credit (RM)</th>
                <th>Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {newDefaultValue.current.map((value, index) => {
                if (value.typeOfPayment === 0 || value.typeOfPayment === null)
                  cumulativeBalance += parseFloat(value.amount);
                else cumulativeBalance -= parseFloat(value.amount);
                return (
                  <tr key={`account-status-row-${index + 1}`}>
                    <td>{value.date}</td>
                    <td className="doc_link" onClick={() => getImage(value.id)}>
                      doc refer
                    </td>
                    <td>{value.description}</td>
                    {value.typeOfPayment === null ? (
                      <>
                        <td>{parseFloat(value.amount).toFixed(2)}</td>
                        <td></td>
                      </>
                    ) : (
                      <>
                        <td></td>
                        <td>{parseFloat(value.amount).toFixed(2)}</td>
                      </>
                    )}
                    <td>{cumulativeBalance.toFixed(2)}</td>
                    <td>
                      <span
                        className="material-symbols-outlined menuIcon"
                        id="fade-button"
                        aria-controls={open ? "fade-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleClick}>
                        more_vert
                      </span>
                      <Menu
                        id="fade-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        TransitionComponent={Fade}>
                        <MenuItem
                          onClick={(e) => {
                            editStmtHandler(e, value);
                            handleClose();
                          }}>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}>
                            edit
                          </span>
                          <p style={{ fontSize: "12px", margin: "0" }}>
                            edit statement
                          </p>
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => {
                            deleteStmtHandler(e, value.id);
                            handleClose();
                          }}
                          style={{ color: "red" }}>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}>
                            delete
                          </span>
                          <p style={{ fontSize: "12px", margin: "0" }}>
                            delete statement
                          </p>
                        </MenuItem>
                      </Menu>
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td></td>
                <td></td>
                <th style={{ textAlign: "right" }}>Total : </th>
                <th>{parseFloat(accountSummary.debitTotal).toFixed(2)}</th>
                <th>{parseFloat(accountSummary.creditTotal).toFixed(2)}</th>
                <th>
                  {parseFloat(
                    accountSummary.debitTotal - accountSummary.creditTotal
                  ).toFixed(2)}
                </th>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <th style={{ textAlign: "right" }}>Realtime Profit %: </th>
                <th>
                  {parseFloat(
                    ((accountSummary.debitTotal - accountSummary.creditTotal) /
                      accountSummary.debitTotal) *
                      100
                  ).toFixed(2)}{" "}
                  %
                </th>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <th style={{ textAlign: "right" }}>Actual Profit : </th>
                <th>RM {parseFloat(profitInfo.totalProfit).toFixed(2)}</th>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <th style={{ textAlign: "right" }}>Actual Profit %: </th>
                <th>{parseFloat(profitInfo.profitMargin).toFixed(2)} %</th>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div>no account record</div>
        )}
      </div>
      {imageUrls.length > 0 &&
        imageUrls.map((imageUrl, index) => (
          <Dialog
            key={`img-${index}`}
            open={openDialogIndex === index}
            onClose={() => {
              setOpenDialogIndex(-1);
            }}>
            <DialogContent
              style={{
                padding: "0 80px",
              }}>
              <img
                src={APIGateway + ImgPathWay + imageUrl}
                alt={`Preview-${index + 1}`}
                style={{ maxWidth: "100%" }}
              />
            </DialogContent>
            {imageUrls.length > 1 && (
              <DialogActions
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <ArrowBackIosIcon
                  onClick={handlePrevDialog}
                  style={{ cursor: "pointer" }}
                />
                <ArrowForwardIosIcon
                  onClick={handleNextDialog}
                  style={{ cursor: "pointer" }}
                />
              </DialogActions>
            )}
          </Dialog>
        ))}
    </>
  );
};

export default AccountStatusCard;
