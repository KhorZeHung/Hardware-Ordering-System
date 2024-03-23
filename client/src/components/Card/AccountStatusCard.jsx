import React, { useEffect, useState, useRef, useContext } from "react";
import { Dialog, DialogContent, DialogActions } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { APIGateway, ImgPathWay } from "../../data";
import "./AccountStatusCard.css";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../Snackbar/SnackBarProvidor";
import axios from "axios";

const AccountStatusCard = ({ data }) => {
  const { defaultValue } = data;
  const newDefaultValue = useRef([]);
  const [accountSummary, setAccountSummary] = useState({
    debitTotal: 0,
    creditTotal: 0,
  });
  let cumulativeBalance = 0;
  const { setSnackbar } = useContext(SnackbarContext);

  const [openDialogIndex, setOpenDialogIndex] = useState(-1); // State to track which dialog is open
  const [imageUrls, setImageUrls] = useState([]); // State to store image URLs

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

  useEffect(() => {
    let newObj = { debitTotal: 0, creditTotal: 0 };
    newDefaultValue.current = defaultValue.map((value) => {
      if (value.isDebit) newObj.debitTotal += value.amount;
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
              </tr>
            </thead>
            <tbody>
              {newDefaultValue.current.map((value, index) => {
                if (value.isDebit)
                  cumulativeBalance += parseFloat(value.amount);
                else cumulativeBalance -= parseFloat(value.amount);

                return (
                  <tr key={`account-status-row-${index + 1}`}>
                    <td>{value.date}</td>
                    <td className="doc_link" onClick={() => getImage(value.id)}>
                      doc refer
                    </td>
                    <td>{value.description}</td>
                    {value.isDebit ? (
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
                <th style={{ textAlign: "right" }}>Profit Margin: </th>
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
