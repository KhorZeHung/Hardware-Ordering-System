const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isAdmin } = require("../function/authorization");
const { uploadFiles } = require("../function/uploadFiles");
const db = require("../function/conn");

router.get("/:project_id", validateJWT, (req, res) => {
  const { project_id } = req.params;
  if (!project_id)
    return res
      .status(400)
      .json({ message: "Project identification is not provided" });

  const selectQuery = "SELECT * FROM account_status WHERE project_id = ?";
  db.query(selectQuery, [project_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong" });
    return res.status(200).json({ data: result });
  });
});

router.post(
  "/add/:project_id",
  validateJWT,
  isAdmin,
  uploadFiles,
  (req, res) => {
    const { account_status_description, isDebit, amount } = req.body;
    const { fileNames } = req;
    const { project_id } = req.params;

    if (
      !project_id ||
      !isDebit ||
      !account_status_description ||
      !fileNames ||
      !amount ||
      isNaN(amount)
    )
      return res
        .status(400)
        .json({ message: "Please provide all required information" });

    const insertQuery =
      "INSERT INTO account_status (account_status_description, isDebit, doc_refer, amount, project_id) VALUE (?,?, ?, ?, ?);";
    db.query(
      insertQuery,
      [account_status_description, isDebit, fileNames, amount, project_id],
      (err) => {
        if (err)
          return res.status(500).json({ message: "Something went wrong" });
        return res.status(200).json({ message: "Statement added successful" });
      }
    );
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
