const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isManager, isAdmin } = require("../function/authorization");
const db = require("../function/conn");

router.get("/:project_id", validateJWT, (req, res) => {
  const { project_id } = req.params;
  if (!project_id)
    return res
      .status(400)
      .json({ message: "Project identification is not provided" });
  const selectQuery = `SELECT o.project_order_id AS id,
                          s.supplier_cmp_name AS name,
                          o.project_order_subtotal AS subtotal,
                          o.project_order_total_paid AS "total paid",
                          o.project_order_product_lists,
                          o.project_order_status AS "status",
                          o.project_order_doc_refer
                        FROM project_order AS o
                        INNER JOIN supplier AS s ON o.supplier_id = s.supplier_id
                        WHERE o.project_id = ?;`;
  db.query(selectQuery, [project_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong" });
    result = result.map((order) => {
      order.project_order_product_lists = JSON.parse(
        order.project_order_product_lists
      );
      return order;
    });
    return res.status(200).json({ data: result });
  });
});

router.post("/add/:project_order_id", validateJWT, isManager, (req, res) => {
  const { project_order_id } = req.params;
  if (!project_order_id)
    return res
      .status(400)
      .json({ message: "Order identification is not provided" });

  const updateQuery =
    "UPDATE project_order SET project_order_status = ? WHERE project_order_id = ?";

  db.query(updateQuery, ["pending", project_order_id], (err) => {
    if (err) return res.status(500).json({ message: "Something went wrong" });
    return res.status(200).json({ message: "Order is under process" });
  });
});

router.post("/edit/:project_order_id", validateJWT, isAdmin, (req, res) => {
  const { project_order_id } = req.params;
  const { project_order_status } = req.body;
  const { user_id } = req.user;
  if (!project_order_id)
    return res
      .status(400)
      .json({ message: "Order identification is not provided" });

  const updateQuery =
    "UPDATE project_order SET project_order_status = ?, pic_id = ? WHERE project_order_id = ?";

  db.query(
    updateQuery,
    [project_order_status, user_id, project_order_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Something went wrong" });
      return res.status(200).json({ message: "Order is under process" });
    }
  );
});

module.exports = router;
