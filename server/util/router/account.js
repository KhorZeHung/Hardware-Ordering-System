const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isAdmin } = require("../function/authorization");
const { uploadFiles } = require("../function/uploadFiles");
const db = require("../function/conn");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { json } = require("body-parser");

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

router.get("/options/:project_id", (req, res) => {
  const { project_id } = req.params;
  const selectQuery = `SELECT 
    CONCAT(s.supplier_cmp_name, ' - ', po.project_order_subtotal) AS 'name', 
    po.project_order_id AS 'value'
    FROM 
        project_order AS po 
    INNER JOIN 
        supplier AS s ON po.supplier_id = s.supplier_id 
    LEFT JOIN 
        account_status AS a ON po.project_order_id = a.account_status_payment_refer 
                                AND po.project_id = a.project_id
    WHERE 
        po.project_id = ? 
        AND a.account_status_payment_refer IS NULL;`;
  db.query(selectQuery, [project_id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong here" });
    const returnOptions = [{ value: 0, name: "Receive Payment" }].concat(
      result
    );
    return res.status(200).json({ options: returnOptions });
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
      typeOfPayment = null,
      amount,
      project_id,
      account_status_date,
    } = req.body;
    const { fileNames } = req;
    if (
      !project_id ||
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
        
    var insertQuery, queryOption;
    if (parseInt(typeOfPayment) !== 0) {
      insertQuery =
        "INSERT INTO account_status (account_status_description, account_status_payment_refer, doc_refer, amount, project_id, account_status_date) VALUE (?,?, ?, ?, ?, ?);";
      queryOption = [
        account_status_description,
        typeOfPayment,
        JSON.stringify(fileNames),
        amount,
        project_id,
        account_status_date,
      ];
    } else {
      insertQuery =
        "INSERT INTO account_status (account_status_description, doc_refer, amount, project_id, account_status_date) VALUE (?, ?, ?, ?, ?);";
      queryOption = [
        account_status_description,
        JSON.stringify(fileNames),
        amount,
        project_id,
        account_status_date,
      ];
    }
    db.query(insertQuery, queryOption, (err) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      next();
    });
  },
  (req, res) => {
    const { typeOfPayment, amount, project_id } = req.body;
    var updateQuery, queryOption;
    if (parseInt(typeOfPayment) !== 0) {
      updateQuery =
        "UPDATE project_order SET project_order_total_paid = project_order_total_paid + ?, project_order_status = CASE WHEN project_order_total_paid + ? >= project_order_subtotal THEN 'Paid' ELSE project_order_status END WHERE project_order_id = ?;";
      queryOption = [amount, amount, typeOfPayment];
    } else {
      updateQuery =
        "UPDATE project SET project_outstanding = project_outstanding - ? WHERE project_id = ?;";
      queryOption = [amount, project_id];
    }
    db.query(updateQuery, queryOption, (err) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      return res.status(200).json({ message: "Statement added successful" });
    });
  }
);

router.post(
  "/delete/:account_status_id",
  validateJWT,
  isAdmin,
  (req, res, next) => {
    const { account_status_id } = req.params;
    if (!account_status_id)
      return res
        .status(400)
        .json({ message: "Please provide required information" });
    const selectQuery =
      "SELECT * FROM account_status WHERE account_status_id = ?;";
    db.query(selectQuery, [account_status_id], async (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong" });
      if (result.length !== 1) return next();
      const { doc_refer, ...rest } = result[0];
      const arrayOfDoc = JSON.parse(doc_refer);
      req.updateInfo = rest;
      const promises = await arrayOfDoc.map((doc) => {
        const filePath = path.join(process.env.IMGSAVEPATH, doc);
        if (fs.existsSync(filePath)) {
          return fs.promises.unlink(filePath);
        }
      });

      next();
    });
  },
  (req, res, next) => {
    if (req.updateInfo) {
      const { project_id, typeOfPayment, amount } = req.updateInfo;
      if (!project_id || !amount) {
        return res.status(500).json({ message: "Something went wrong" });
      }
      if (typeOfPayment) next();
      const updateQuery = `UPDATE project SET project_outstanding = project_outstanding + ? WHERE project_id = ?;`;
      db.query(updateQuery, [amount, project_id], (err) => {
        if (err)
          return res.status(500).json({ message: "Something went wrong" });
        next();
      });
    } else {
      next();
    }
  },
  (req, res) => {
    const { account_status_id } = req.params;

    const deleteQuery =
      "DELETE FROM account_status WHERE account_status_id = ?;";
      
    db.query(deleteQuery, [account_status_id], (err) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      return res.status(200).json({ message: "Statement delete successful" });
    });
  }
);

router.post(
  "/edit",
  validateJWT,
  isAdmin,
  (req, res, next) => {
    const { account_status_id, amount, account_status_date } = req.body;
    if (!account_status_id)
      return res
        .status(400)
        .json({ message: "Please provide all required information" });

    const selectQuery =
      "SELECT amount, DATE_FORMAT(account_status_date, '%d/%m/%Y') AS date FROM account_status WHERE account_status_id = ?";
    db.query(selectQuery, [account_status_id], (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong" });
      if (result.length !== 1)
        return res.status(400).json({ message: "Order not found" });
      req.amountChange = amount - result[0].amount;
      req.dateChange = result[0].date !== account_status_date;
      next();
    });
  },
  (req, res, next) => {
    const {
      account_status_description,
      amount,
      account_status_id,
      account_status_date,
    } = req.body;
    if (
      !account_status_id ||
      !account_status_description ||
      !amount ||
      isNaN(amount) ||
      !account_status_date
    )
      return res
        .status(400)
        .json({ message: "Please provide all required information" });
    var updateQuery, queryOption;
    updateQuery =
      "UPDATE account_status SET account_status_description = ?, amount = ?";
    queryOption = [account_status_description, amount];
    if (req.dateChange) {
      updateQuery += ",account_status_date = ?";
      queryOption.push(account_status_date);
    }
    updateQuery += " WHERE account_status_id = ?;";
    queryOption.push(account_status_id);

    db.query(updateQuery, queryOption, (err) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      next();
    });
  },
  (req, res) => {
    const { typeOfPayment, project_id } = req.body;
    const { amountChange } = req;
    if (amountChange !== 0) {
      var updateQuery, queryOption;
      if (parseInt(typeOfPayment) !== 0) {
        updateQuery =
          "UPDATE project_order SET project_order_total_paid = project_order_total_paid + ?, project_order_status = CASE WHEN project_order_total_paid + ? >= project_order_subtotal THEN 'Paid' ELSE project_order_status END WHERE project_order_id = ?;";
        queryOption = [amountChange, amountChange, typeOfPayment];
      } else {
        updateQuery =
          "UPDATE project SET project_outstanding = project_outstanding - ? WHERE project_id = ?;";
        queryOption = [amountChange, project_id];
      }
      db.query(updateQuery, queryOption, (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Something went wrong " + err });
        return res.status(200).json({ message: "Statement edit successful" });
      });
    } else {
      return res.status(200).json({ message: "Statement edit successful" });
    }
  }
);

module.exports = router;
