const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isAdmin } = require("../function/authorization");
const { uploadFiles } = require("../function/uploadFiles");
const db = require("../function/conn");
const fs = require("fs");
const path = require("path");

router.get("/image/:account_status_id", validateJWT, (req, res) => {
  const { account_status_id } = req.params;
  const selectQuery =
    "SELECT doc_refer FROM account_status WHERE account_status_id = ?;";
  db.query(selectQuery, [account_status_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Something went wrong: " + err });
    }
    if (!result || result.length === 0 || !result[0].doc_refer) {
      return res
        .status(404)
        .json({ message: "No image found for the provided ID" });
    }
    return res.status(200).json({ data: JSON.parse(result[0].doc_refer) });
  });
});

router.post(
  "/add",
  validateJWT,
  isAdmin,
  uploadFiles,
  (req, res, next) => {
    const {
      account_status_description,
      isDebit,
      amount,
      project_id,
      account_status_date,
    } = req.body;
    const { fileNames } = req;
    if (
      !project_id ||
      !isDebit ||
      !account_status_description ||
      !fileNames ||
      !amount ||
      isNaN(amount) ||
      !Array.isArray(fileNames) ||
      !account_status_date
    )
      return res
        .status(400)
        .json({ message: "Please provide all required information" });

    const binaryIsDebit = isDebit ? 1 : 0;

    const insertQuery =
      "INSERT INTO account_status (account_status_description, isDebit, doc_refer, amount, project_id, account_status_date) VALUE (?,?, ?, ?, ?, ?);";
    db.query(
      insertQuery,
      [
        account_status_description,
        binaryIsDebit,
        JSON.stringify(fileNames),
        amount,
        project_id,
        account_status_date,
      ],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Something went wrong" + err });
        next();
      }
    );
  },
  (req, res) => {
    const { isDebit, amount, project_id } = req.body;
    if (isDebit) {
      const updateQuery =
        "UPDATE project SET project_outstanding = project_outstanding - ? WHERE project_id = ?;";

      db.query(updateQuery, [amount, project_id], (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Something went wrong " + err });

        return res.status(200).json({ message: "Statement added successful" });
      });
    } else {
      return res.status(200).json({ message: "Statement added successful" });
    }
  }
);

router.post("/delete/:account_status_id", validateJWT, isAdmin, (req, res) => {
  const { account_status_id } = req.params;

  if (!account_status_id)
    return res
      .status(400)
      .json({ message: "Please provide required information" });

  const deleteQuery = "DELETE FROM account_status WHERE account_status_id = ?;";
  db.query(deleteQuery, [account_status_id], (err) => {
    if (err) return res.status(500).json({ message: "Something went wrong" });
    return res.status(200).json({ message: "Statement delete successful" });
  });
});

module.exports = router;
