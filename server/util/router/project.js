const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isManager } = require("../function/authorization");
const { getProductInfo } = require("../function/getInfo");
const db = require("../function/conn");

//create new project
router.post(
  "/add/:quote_id",
  validateJWT,
  isManager,
  (req, res, next) => {
    const { quote_id } = req.params;
    const { user_id } = req.user;
    const selectQuery =
      "SELECT * FROM quotation WHERE quote_id = ? AND pic_id = ?;";

    db.query(selectQuery, [quote_id, user_id], (err, result) => {
      if (err) res.status(500).json({ message: "Something went wrong" + err });
      if (result.length !== 1)
        res.status(500).json({ message: "No such quotation / not authorize" });
      req.quotation = result[0];
      next();
    });
  },
  (req, res, next) => {
    const selectQuery =
      "SELECT product_id AS `id`, supplier_id AS 'supplier', product_unit_cost AS 'unit_cost' FROM product WHERE supplier_id IS NOT NULL;";
    db.query(selectQuery, [], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });

      req.productArray = result;
      next();
    });
  },
  (req, res, next) => {
    const {
      quote_id,
      quote_name,
      quote_client_name,
      quote_client_contact,
      quote_address,
      pic_id,
      quote_product_lists,
      quote_sub_total,
      quote_prop_type,
      quote_discount,
    } = req.quotation;

    const insertQuery =
      "INSERT INTO project (project_id, project_name, manager_in_charge_id, project_client_name, project_client_contact, project_address, project_grand_total, project_sub_total, project_discount, project_prop_type, last_edit_pic, project_product_lists, project_outstanding) VALUES (?,?,?,?,?,?,?,?,?,?,?,?, ?);";
    db.query(
      insertQuery,
      [
        quote_id,
        quote_name,
        pic_id,
        quote_client_name,
        quote_client_contact,
        quote_address,
        quote_sub_total - quote_discount,
        quote_sub_total,
        quote_discount,
        quote_prop_type,
        pic_id,
        quote_product_lists,
        (quote_sub_total = quote_discount),
      ],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Something went wrong" + err });
        req.project_id = quote_id;
        next();
      }
    );
  },
  (req, res, next) => {
    const { quote_product_lists } = req.quotation;
    const { productArray } = req;
    if (!quote_product_lists || !productArray)
      return res.status(500).json({ message: "Something went wrong" });

    const productToSupplier = productArray.reduce((map, product) => {
      map[product.id] = {
        supplier_id: String(product.supplier),
        unit_cost: product.unit_cost,
      };
      return map;
    }, {});

    // Summarize product list
    const productListSummary = JSON.parse(quote_product_lists)
      .flatMap((product_lists) => product_lists.productList)
      .reduce((summary, product) => {
        const { product_id, product_quantity, product_unit_cost } = product;
        const supplier_id = String(productToSupplier[product_id].supplier_id);
        const subTotal =
          parseInt(product_quantity) *
          parseFloat(productToSupplier[product_id].unit_cost);

        const productExist = summary.hasOwnProperty(supplier_id);
        const indexInSummary =
          summary[supplier_id] &&
          summary[supplier_id].productList.findIndex(
            (p) => p.product_id === product_id
          );

        if (productExist && indexInSummary !== -1) {
          // Update existing product's total quantity
          summary[supplier_id].productList[indexInSummary].total_quantity +=
            parseInt(product_quantity);

          summary[supplier_id].subTotal += subTotal;
        } else if (productExist) {
          //push new product to order with the same supplier
          summary[supplier_id].productList.push({
            product_id: product_id,
            total_quantity: product_quantity,
            unit_cost: productToSupplier[product_id].unit_cost,
          });
          summary[supplier_id].subTotal += subTotal;
        } else {
          // Create a new product summary entry
          summary[supplier_id] = {
            subTotal: subTotal,
            productList: [
              {
                product_id: product_id,
                total_quantity: product_quantity,
                unit_cost: productToSupplier[product_id].unit_cost,
              },
            ],
          };
        }
        return summary;
      }, {});

    const insertPromises = Object.keys(productListSummary).map(function (key) {
      return new Promise(function (resolve, reject) {
        const { subTotal, productList } = productListSummary[key];
        const { project_id } = req;
        const { user_id } = req.user;
        const formatedProductList = JSON.stringify(productList);
        const insertQuery =
          "INSERT INTO project_order (supplier_id, project_id, project_order_subtotal, project_order_product_lists, pic_id) VALUES (?, ?, ?, ?, ?);";

        db.query(
          insertQuery,
          [key, project_id, subTotal, formatedProductList, user_id],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    });

    Promise.all(insertPromises)
      .then(() => {
        return res.status(200).json({
          message: "Project created successfully",
          project_id: req.project_id,
        });
      })
      .catch((err) => {
        console.error("Error inserting into project_order:", err);
        return res.status(500).json({ message: "Something went wrong" + err });
      });
  }
);

//get all project info, with filter function
router.get("", validateJWT, (req, res) => {
  const searchTerm = req.query.searchterm || "";

  let selectQuery = `SELECT project_id AS "id", project_name AS 'project name', project_client_name AS "client name", project_client_contact AS "contact", project_grand_total AS "total charge", project_address AS location FROM project`;
  let queryParams = [];

  if (searchTerm) {
    selectQuery += ` WHERE (project_name LIKE ?
      OR project_client_name LIKE ?
      OR project_client_phone LIKE ?
      OR project_address LIKE ?)`;
    queryParams.push(
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    );
  }

  db.query(selectQuery, queryParams, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong" + err });

    const thead = results.length > 0 ? Object.keys(results[0]) : [];
    const responseBody = {
      thead: thead,
      tbody: results,
    };
    return res.status(200).json({ data: responseBody });
  });
});

//get specific quotation info
router.get(
  "/:project_id",
  validateJWT,
  (req, res, next) => {
    const { project_id } = req.params;

    if (!project_id)
      res
        .status(400)
        .json({ message: "Project identification is not provided" });

    const selectQuery = "SELECT * FROM project WHERE project_id = ?;";
    db.query(selectQuery, [project_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      if (result.length !== 1)
        return res.status(400).json({ message: "Project not found" });

      let returnObj = result[0];
      returnObj.project_product_lists = JSON.parse(
        returnObj.project_product_lists
      );

      req.projectData = returnObj;
      next();
    });
  },
  (req, res, next) => {
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
                          o.project_order_status AS "status"
                        FROM project_order AS o
                        INNER JOIN supplier AS s ON o.supplier_id = s.supplier_id
                        WHERE o.project_id = ?;`;
    db.query(selectQuery, [project_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      result = result.map((order) => {
        order.project_order_product_lists = JSON.parse(
          order.project_order_product_lists
        );
        return order;
      });

      req.orderData = result;
      next();
    });
  },
  (req, res) => {
    const { project_id } = req.params;
    if (!project_id)
      return res
        .status(400)
        .json({ message: "Project identification is not provided" });

    const selectQuery = `SELECT account_status_description AS "description", amount, isDebit, DATE(created_at) AS 'date', account_status_id AS "id" FROM account_status WHERE project_id = ?;`;
    db.query(selectQuery, [project_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });

      return res.status(200).json({
        projectInfo: req.projectData,
        orderInfo: req.orderData,
        accountInfo: result,
      });
    });
  }
);

module.exports = router;
