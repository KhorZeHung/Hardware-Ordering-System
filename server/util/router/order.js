const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isManager, isAdmin } = require("../function/authorization");
const db = require("../function/conn");

router.get("", validateJWT, (req, res) => {
  let selectQuery = `SELECT p.project_order_id AS "id",  s.supplier_cmp_name AS "supplier", p.project_id AS "project", project_order_subtotal AS subtotal, project_order_status AS "status" FROM project_order AS p INNER JOIN supplier AS s ON p.supplier_id = s.supplier_id`;
  let queryParams = [];
  const { user_position, user_id } = req.user;
  if (user_position === 3) {
    selectQuery += " WHERE pic_id = ?;";
    queryParams.push(user_id);
  } else {
    selectQuery += ";";
  }

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    const thead = result.length > 0 ? Object.keys(result[0]) : [];
    return res.status(200).json({
      data: {
        thead: thead,
        tbody: result,
      },
    });
  });
});

router.get("/:order_id", validateJWT, (req, res) => {
  const { order_id } = req.params;

  if (!order_id)
    return res
      .status(400)
      .json({ message: "Order identification is not provided" });

  let selectQuery = `SELECT s.supplier_cmp_name AS "supplier company name", s.supplier_contact AS "supplier contact", s.supplier_address AS "supplier address", s.supplier_pic AS "supplier name",
  p.project_id AS "project id", p.project_address AS "project address", o.project_order_subtotal, o.project_order_total_paid, 
  o.project_order_product_lists, o.project_order_status FROM project_order AS o INNER JOIN
  supplier AS s ON o.supplier_id = s.supplier_id INNER JOIN project AS p ON o.project_id = p.project_id WHERE project_order_id = ?`;

  let queryParams = [order_id];
  const { user_position, user_id } = req.user;
  if (user_position === 3) {
    selectQuery += " AND o.pic_id = ?;";
    queryParams.push(user_id);
  } else {
    selectQuery += ";";
  }

  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });
    if (result.length !== 1)
      return res
        .status(400)
        .json({ message: "Order record not found / unauthorize access" });

    const groupedData = Object.entries(result[0]).reduce(
      (acc, [key, value]) => {
        if (key.includes("supplier")) {
          acc.supplierData = { ...acc.supplierData, [key]: value };
        } else if (key.includes("project_order")) {
          if (key === "project_order_product_lists") value = JSON.parse(value);
          acc.ordersData = { ...acc.ordersData, [key]: value };
        } else {
          acc.projectData = { ...acc.projectData, [key]: value };
        }
        return acc;
      },
      { supplierData: {}, ordersData: {}, projectData: {} }
    );

    return res.status(200).json({ data: groupedData });
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

router.post("/edit", validateJWT, isAdmin, (req, res) => {
  const { project_order_status, project_order_id } = req.body;
  const { user_id } = req.user;
  if (!project_order_id || !project_order_status)
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
      return res
        .status(200)
        .json({ message: `Order is ${project_order_status}` });
    }
  );
});

module.exports = router;
