const express = require("express");
const router = express.Router();
const { validateJWT } = require("../function/validation");
const { isManager } = require("../function/authorization");
const { getProductInfo } = require("../function/getInfo");
const { createOrderSpreadSheet } = require("../function/excelFactory");
const db = require("../function/conn");

//create new project
router.post(
  "/add/:project_id",
  validateJWT,
  isManager,
  (req, res, next) => {
    const { project_id } = req.params;
    const { user_id } = req.user;
    const selectQuery =
      "SELECT * FROM quotation WHERE quote_id = ? AND pic_id = ?;";

    db.query(selectQuery, [project_id, user_id], (err, result) => {
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
        quote_sub_total - quote_discount,
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
  (req, res) => {
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

//update specific project
router.post(
  "/edit/:project_id",
  validateJWT,
  isManager,
  (req, res, next) => {
    const { project_id } = req.params;
    const { user_id } = req.user;
    const selectQuery =
      "SELECT project_product_lists AS `old_project_product_lists` FROM project WHERE project_id = ? AND manager_in_charge_id = ?;";

    db.query(selectQuery, [project_id, user_id], (err, result) => {
      if (err) res.status(500).json({ message: "Something went wrong" + err });
      if (result.length !== 1)
        res.status(500).json({ message: "No such project / not authorize" });
      req.project = result[0];
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
    const { project_id } = req.params;
    const selectQuery =
      "SELECT s.supplier_id AS supplier_id, po.project_order_id, project_order_product_lists, project_order_status FROM project_order AS po INNER JOIN supplier AS s ON po.supplier_id = s.supplier_id  WHERE project_id = ? AND project_order_status = 'Under Process';";
    db.query(selectQuery, [project_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      req.availableOrder = result.reduce((summary, order) => {
        summary[String(order.supplier_id)] = {
          ...order,
          project_order_product_lists: JSON.parse(
            order.project_order_product_lists
          ),
        };
        return summary;
      }, {});
      next();
    });
  },
  (req, res, next) => {
    const { old_project_product_lists } = req.project;
    const { project_product_lists } = req.body;
    const { productArray } = req;
    if (!project_product_lists || !productArray)
      return res.status(500).json({ message: "Something went wrong" });

    const productToSupplier = productArray.reduce((map, product) => {
      map[product.id] = {
        supplier_id: String(product.supplier),
        unit_cost: product.unit_cost,
      };
      return map;
    }, {});

    const summarize = (productLists) => {
      return productLists
        .flatMap((product_lists) => product_lists.productList)
        .reduce((summary, product) => {
          const { product_id, product_quantity, product_unit_cost } = product;
          const supplier_id = String(productToSupplier[product_id].supplier_id);
          const subTotal =
            parseInt(product_quantity) *
            parseFloat(
              product_unit_cost || productToSupplier[product_id].unit_cost
            );

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
    };
    // Summarize new product list
    const newProductListSummary = summarize(project_product_lists);
    const oldProductListSummary = summarize(
      JSON.parse(old_project_product_lists)
    );

    let addNewOrder = false;
    let deleteOldOrder = false;

    let oldProductListSupplierId = Object.keys(oldProductListSummary).sort();
    let newProductListSupplierId = Object.keys(newProductListSummary).sort();
    const deleteSupplier = oldProductListSupplierId.filter(
      (item) => !newProductListSupplierId.includes(item)
    );
    const addSupplier = newProductListSupplierId.filter(
      (item) => !oldProductListSupplierId.includes(item)
    );

    deleteOldOrder = deleteSupplier.length > 0;
    addNewOrder = addSupplier.length > 0;

    let supplierRefer = [
      ...new Set([...oldProductListSupplierId, ...newProductListSupplierId]),
    ];
    console.log(supplierRefer);

    const updates = {};
    const additions = {};

    const { availableOrder } = req;
    const modifiableOrder = availableOrder;
    const modifiableSupplierIdToPOId = Object.values(availableOrder).reduce(
      (summary, order) => {
        summary[String(order.supplier_id)] = order.project_order_id;
        return summary;
      },
      {}
    );

    supplierRefer.forEach((supplierId) => {
      const POid = modifiableSupplierIdToPOId[supplierId] || null;
      updates[POid] = POid
        ? modifiableOrder[supplierId].project_order_product_lists
        : [];
      let hasUpdate = false;
      additions[supplierId] = [];

      const oldProducts = oldProductListSummary[supplierId]?.productList || [];
      const newProducts = newProductListSummary[supplierId]?.productList || [];

      oldProducts.forEach((oldProduct) => {
        const matchingNewProduct = newProducts.find(
          (newProduct) => newProduct.product_id === oldProduct.product_id
        );
        //can add into/remove from current order
        if (
          !matchingNewProduct &&
          Object.keys(modifiableSupplierIdToPOId).includes(supplierId) &&
          POid !== null
        ) {
          //remove from existing order
          hasUpdate = true;
          updates[POid].filter((obj) => {
            return obj.product_id === oldProduct.product_id;
          });
        } else if (
          matchingNewProduct.total_quantity !== oldProduct.total_quantity ||
          matchingNewProduct.unit_cost !== oldProduct.unit_cost
        ) {
          //update current order quantity or/and unit cost
          if (
            POid !== null &&
            Object.keys(modifiableSupplierIdToPOId).includes(supplierId)
          ) {
            updates[POid] = updates[POid].map((product) => {
              if (
                String(product.product_id) === String(oldProduct.product_id)
              ) {
                hasUpdate = true;
                if (
                  product.total_quantity - matchingNewProduct.total_quantity <
                  1
                ) {
                  return null;
                } else {
                  return {
                    product_id: oldProduct.product_id,
                    total_quantity: matchingNewProduct.total_quantity,
                    unit_cost: matchingNewProduct.unit_cost,
                  };
                }
              } else {
                return product;
              }
            });
          } else {
            // create a new order as previous order has been placed.
            additions[supplierId].push({
              product_id: matchingNewProduct.product_id,
              total_quantity: matchingNewProduct.total_quantity,
              unit_cost: matchingNewProduct.unit_cost,
            });
          }
        }
      });

      newProducts.forEach((newProduct) => {
        const matchingOldProduct = oldProducts.find(
          (oldProduct) => oldProduct.product_id === newProduct.product_id
        );
        if (!matchingOldProduct) {
          if (
            POid !== null &&
            Object.keys(modifiableSupplierIdToPOId).includes(supplierId)
          ) {
            updates[POid] = updates[POid].map((product) => {
              if (
                String(product.product_id) === String(newProduct.product_id)
              ) {
                hasUpdate = true;
                return {
                  product_id: newProduct.product_id,
                  total_quantity: matchingOldProduct.total_quantity,
                  unit_cost: matchingOldProduct.unit_cost,
                };
              } else {
                return product;
              }
            });
          } else {
            // create a new order as previous order has been placed.
            additions[supplierId].push({
              product_id: newProduct.product_id,
              total_quantity: newProduct.total_quantity,
              unit_cost: newProduct.unit_cost,
            });
          }
        }
      });

      !hasUpdate && delete updates[POid];
      additions[supplierId].length === 0 && delete additions[supplierId];
    });

    const { project_id } = req.params;

    const updatePromise = Object.keys(updates).map(function (key) {
      return new Promise(function (resolve, reject) {
        const productList = updates[key];
        const subTotal = productList.reduce((subtotal, product) => {
          return (subtotal += product.unit_cost * product.total_quantity);
        }, 0);
        const formatedProductList = JSON.stringify(productList);
        const updateQuery =
          "UPDATE project_order SET project_order_subtotal = ?, project_order_product_lists = ? WHERE project_order_id = ? AND project_id = ?;";

        db.query(
          updateQuery,
          [subTotal, formatedProductList, key, project_id],
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

    const insertPromise = Object.keys(additions).map(function (key) {
      return new Promise(function (resolve, reject) {
        const productList = additions[key];
        const subTotal = productList.reduce((subtotal, product) => {
          return (subtotal += product.unit_cost * product.total_quantity);
        }, 0);
        const formatedProductList = JSON.stringify(productList);
        const { user_id } = req.user;
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

    const allPromises = [...updatePromise, ...insertPromise];
    Promise.all(allPromises)
      .then(() => {
        next();
      })
      .catch((err) => {
        return res.status(500).json({ message: "Something went wroFng" + err });
      });
  },
  (req, res) => {
    const {
      project_id,
      project_name,
      project_client_name,
      project_client_contact,
      project_address,
      project_product_lists,
      project_sub_total,
      project_prop_type,
      project_discount = 0,
    } = req.body;

    const { user_id } = req.user;
    const insertQuery =
      "UPDATE project SET project_name =?,project_client_name =?, project_client_contact =?, project_address =?, project_grand_total =?, project_sub_total =?, project_discount =?, project_prop_type =?, last_edit_pic =?, project_product_lists =?, project_outstanding = project_outstanding - project_grand_total + ? WHERE project_id = ?;";
    db.query(
      insertQuery,
      [
        project_name,
        project_client_name,
        project_client_contact,
        project_address,
        project_sub_total - project_discount,
        project_sub_total,
        project_discount,
        project_prop_type,
        user_id,
        JSON.stringify(project_product_lists),
        project_sub_total - project_discount,
        project_id,
      ],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Something went wrong" + err });

        return res.status(200).json({
          message: "Project update successfully",
        });
      }
    );
  }
);

//get all project info, with filter function
router.get("", validateJWT, (req, res) => {
  const { searchterm, filteroption, sort, desc, page } = req.query;

  let selectQuery = `SELECT project_id AS "id", project_name AS 'project name', project_client_name AS "client name", project_client_contact AS "contact", project_grand_total AS "total charge", project_outstanding AS "outstanding", project_address AS location FROM project`;
  let queryParams = [];

  if (searchterm) {
    selectQuery += ` WHERE (project_name LIKE ?
      OR project_client_name LIKE ?
      OR project_client_contact LIKE ?
      OR project_address LIKE ?)`;
    queryParams.push(
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`
    );
  }

  if (filteroption) {
    selectQuery += " AND project_prop_type = ?";
    queryParams.push(filteroption);
  }

  const { user_authority, user_id } = req.user;

  if (user_authority === 3) {
    if (searchterm || filteroption) selectQuery += " AND";
    else selectQuery += " WHERE";
    selectQuery += "  manager_in_charge_id = ?";
    queryParams.push(user_id);
  }

  if (sort) {
    const sortColumnNameMap = {
      id: "project_id",
      "project name": "project_name",
      "client name": "project_client_name",
      contact: "project_client_contact",
      "total charge": "project_grand_total",
      location: "project_address",
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
      var orderSubtotal = 0;
      result = result.map((order) => {
        order.project_order_product_lists = JSON.parse(
          order.project_order_product_lists
        );
        orderSubtotal += parseFloat(order.subtotal);
        return order;
      });
      req.orderData = result;
      req.orderSubtotal = orderSubtotal;
      next();
    });
  },
  (req, res) => {
    const { project_id } = req.params;
    if (!project_id)
      return res
        .status(400)
        .json({ message: "Project identification is not provided" });

    const selectQuery = `SELECT account_status_description AS "description", amount, account_status_payment_refer AS typeOfPayment, DATE_FORMAT(account_status_date, '%d/%m/%Y') AS 'date', account_status_id AS "id" FROM account_status WHERE project_id = ?;`;
    db.query(selectQuery, [project_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      const profitMargin =
        parseFloat(req.projectData.project_grand_total) - req.orderSubtotal;
      return res.status(200).json({
        projectInfo: req.projectData,
        orderInfo: req.orderData,
        accountInfo: result,
        profitInfo: {
          profitMargin: (
            (profitMargin / parseFloat(req.projectData.project_grand_total)) *
            100
          ).toFixed(2),
          totalProfit: profitMargin,
        },
      });
    });
  }
);

router.get(
  "/order-spreadsheet/:project_id",
  validateJWT,
  getProductInfo,
  (req, res, next) => {
    const { project_id } = req.params;
    if (!project_id)
      return res
        .status(400)
        .json({ message: "Project identification is not provided" });

    const selectQuery = `SELECT p.project_order_product_lists, s.supplier_cmp_name FROM project_order AS p INNER JOIN supplier AS s ON p.supplier_id = s.supplier_id WHERE p.project_id = ?;`;
    db.query(selectQuery, [project_id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      if (result.length === 0)
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

module.exports = router;
