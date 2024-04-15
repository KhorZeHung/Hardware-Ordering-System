const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isManager, isAdmin } = require("../function/authorization");
const db = require("../function/conn");
const { getProductInfo } = require("../function/getInfo");
const { createPurchaseOrder } = require("../function/pdfFactory");
const { createOrderSpreadSheet } = require("../function/excelFactory");

router.get("", validateJWT, (req, res) => {
  const { searchterm, filteroption, page, sort, desc } = req.query;
  let selectQuery = `SELECT p.project_order_id AS "id",  s.supplier_cmp_name AS "supplier", project.project_name AS "project", 
  p.project_order_subtotal AS subtotal, p.project_order_status AS "status", IFNULL(DATE_FORMAT(DATE(p.project_order_delivery_date), '%Y-%m-%d'), "-") AS "due time" 
  FROM project_order AS p INNER JOIN supplier AS s ON p.supplier_id = s.supplier_id INNER JOIN project ON p.project_id = project.project_id`;
  let queryParams = [];

  if (searchterm) {
    selectQuery += ` WHERE (s.supplier_cmp_name LIKE ?
    OR p.project_order_id LIKE ?
    OR project.project_name LIKE ?)`;
    queryParams.push(`%${searchterm}%`, `%${searchterm}%`, `%${searchterm}%`);
  }
  if (filteroption) {
    if (searchterm) selectQuery += " AND";
    else selectQuery += " WHERE";

    selectQuery += " p.project_order_status = ?";
    queryParams.push(filteroption);
  } else {
    if (searchterm) selectQuery += " AND";
    else selectQuery += " WHERE";

    selectQuery += " p.project_order_status != ?";
    queryParams.push("Under Process");
  }
  const { user_authority, user_id } = req.user;

  if (user_authority === 3) {
    if (searchterm || filteroption) selectQuery += " AND";
    else selectQuery += " WHERE";
    selectQuery += "  pic_id = ?";
    queryParams.push(user_id);
  }

  if (sort) {
    const sortColumnNameMap = {
      id: "p.project_order_id",
      supplier: "s.supplier_cmp_name",
      project: "project.project_name",
      subtotal: "p.project_order_subtotal",
      status: "p.project_order_status",
    };

    if (sortColumnNameMap[sort]) {
      selectQuery += ` ORDER BY ${sortColumnNameMap[sort]} ${
        desc ? "DESC" : "ASC"
      }`;
    }
  }

  // if (page) {
  //   const limit = 25 * page;
  //   selectQuery += " LIMIT " + limit + ";";
  // }
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

  let selectQuery = `SELECT CONCAT(s.supplier_cmp_name, ', ', s.supplier_pic) AS "supplier", s.supplier_contact AS "supplier contact", s.supplier_address AS "supplier address",
  p.project_id AS "project id", p.project_address AS "project address", o.project_order_subtotal, 
  o.project_order_product_lists, o.project_order_status, o.project_order_total_paid 
  , IFNULL(DATE_FORMAT(DATE(o.project_order_delivery_date), '%Y-%m-%d'), "-") AS "due time",
  IFNULL(o.project_order_remark, "-") AS "remark"
  FROM project_order AS o INNER JOIN
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

router.get(
  "/purchase-order/:order_id",
  validateJWT,
  isAdmin,
  getProductInfo,
  (req, res, next) => {
    const { order_id } = req.params;
    if (!order_id)
      return res
        .status(400)
        .json({ message: "Order identification is not provided" });

    const selectQuery = `SELECT *, DATE_FORMAT(project_order.project_order_delivery_date, "%d-%m-%Y") AS 'due_date' 
    FROM project_order INNER JOIN supplier 
    ON project_order.supplier_id = supplier.supplier_id 
    INNER JOIN project
    ON project_order.project_id = project.project_id
    WHERE project_order_id = ?;`;
    db.query(selectQuery, [order_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      if (result.length !== 1)
        return res.status(400).json({ message: "Order not found / not exist" });
      if (result[0].due_date === null)
        return res.status(400).json({ message: "Order not found / not exist" });

      let returnObj = result[0];

      const { productArray } = req;

      let formatedProductArray = productArray.reduce((productObj, product) => {
        const stringProductId = String(product.id);
        productObj[stringProductId] = product;
        return productObj;
      }, {});

      returnObj.project_order_product_lists = JSON.parse(
        returnObj.project_order_product_lists
      ).map((product) => {
        const { product_id, product_name, unit_cost, total_quantity } = product;
        let returnProduct = product;

        if (!product_id || !total_quantity)
          return res.status(400).json({ message: "Message is not complete" });

        if (!product_name)
          returnProduct.product_name =
            formatedProductArray[String(product_id)].name;
        if (!unit_cost)
          returnProduct.unit_cost =
            formatedProductArray[String(product_id)].unit_cost;

        return product;
      });

      req.purchaseOrderData = returnObj;
      next();
    });
  },
  (req, res) => {
    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment;filename=purchase-order.pdf",
    });
    createPurchaseOrder(
      req.purchaseOrderData,
      (chunk) => stream.write(chunk),
      () => stream.end()
    );
  }
);

router.get(
  "/order-spreadsheet/:order_id",
  validateJWT,
  isAdmin,
  getProductInfo,
  (req, res, next) => {
    const { order_id } = req.params;
    if (!order_id)
      return res
        .status(400)
        .json({ message: "Order identification is not provided" });

    const selectQuery = `SELECT p.project_order_product_lists, s.supplier_cmp_name FROM project_order AS p INNER JOIN supplier AS s ON p.supplier_id = s.supplier_id WHERE project_order_id = ?;`;
    db.query(selectQuery, [order_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      if (result.length !== 1)
        return res.status(400).json({ message: "Order not found / not exist" });

      let returnObj = result;

      const { productArray } = req;

      let formatedProductArray = productArray.reduce((productObj, product) => {
        const stringProductId = String(product.id);
        productObj[stringProductId] = product;
        return productObj;
      }, {});

      returnObj = returnObj.map((obj) => {
        obj.project_order_product_lists = JSON.parse(
          obj.project_order_product_lists
        ).map((product) => {
          const { product_id, product_name, unit_cost, total_quantity } =
            product;
          let returnProduct = [];

          if (!product_id || !total_quantity || !unit_cost)
            return res.status(400).json({ message: "Message is not complete" });

          returnProduct.push(product_id);
          returnProduct.push(
            product_name || formatedProductArray[String(product_id)].name
          );
          returnProduct.push(parseFloat(unit_cost).toFixed(2));
          returnProduct.push(parseInt(total_quantity));
          returnProduct.push(
            (parseInt(total_quantity) * parseFloat(unit_cost)).toFixed(2)
          );
          return returnProduct;
        });
        return obj;
      });

      req.excelData = returnObj;
      req.excelHeader = [
        "id",
        "product/service name",
        "unit price (RM)",
        "quantity",
        "subtotal",
      ];
      next();
    });
  },
  createOrderSpreadSheet
);

router.post("/add/:project_order_id", validateJWT, isManager, (req, res) => {
  const { project_order_id } = req.params;
  if (!project_order_id)
    return res
      .status(400)
      .json({ message: "Order identification is not provided" });

  const updateQuery =
    "UPDATE project_order SET project_order_status = ? WHERE project_order_id = ?";

  db.query(updateQuery, ["Proceed to order", project_order_id], (err) => {
    if (err) return res.status(500).json({ message: "Something went wrong" });
    return res.status(200).json({ message: "Order is under process" });
  });
});

router.post("/edit/:order_id", validateJWT, isAdmin, (req, res) => {
  const {
    project_order_status,
    project_order_delivery_date,
    project_order_remark,
  } = req.body;
  const { order_id } = req.params;
  const { user_id } = req.user;
  if (!order_id || !project_order_status)
    return res
      .status(400)
      .json({ message: "Order identification is not provided" });
  let updateQuery =
    "UPDATE project_order SET project_order_status = ?, pic_id = ?";

  const queryParams = [project_order_status, user_id];

  if (
    project_order_delivery_date !== null &&
    project_order_delivery_date !== undefined
  ) {
    updateQuery += ", project_order_delivery_date = ?";
    queryParams.push(project_order_delivery_date);
  }
  if (project_order_remark !== null && project_order_remark !== undefined) {
    updateQuery += ", project_order_remark = ?";
    queryParams.push(project_order_remark);
  }

  updateQuery += " WHERE project_order_id = ?";

  queryParams.push(order_id);

  db.query(updateQuery, queryParams, (err) => {
    if (err) return res.status(500).json({ message: "Something went wrong" });
    return res
      .status(200)
      .json({ message: `Order is ${project_order_status}` });
  });
});

module.exports = router;
