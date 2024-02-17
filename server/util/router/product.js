const express = require("express");
const router = express.Router();
const db = require("../function/conn");
const {
  validateJWT,
  validateSupplier,
  validateCategory,
  validateProduct,
} = require("../function/validation");
const { isAdmin } = require("../function/authorization");

// add new product
router.post(
  "/add",
  validateJWT,
  isAdmin,
  validateSupplier,
  async (req, res) => {
    const {
      product_name,
      product_category,
      product_unit_price,
      product_description,
      supplier_id,
    } = req.body;

    // Check if all required fields are provided
    if (
      !product_name ||
      !product_unit_price ||
      isNaN(product_unit_price) ||
      parseFloat(product_unit_price).toFixed(2) !== product_unit_price ||
      !Array.isArray(product_description) ||
      product_description.length === 0 ||
      !Array.isArray(product_category) ||
      product_category.length === 0
    ) {
      return res.status(400).json({ message: "Please provide required info" });
    }

    const uniqueCategory = [...new Set(product_category)];

    try {
      const categoryCheck = await validateCategory(uniqueCategory);
    } catch (error) {
      return res.status(error.status).json(error.message);
    }

    const json_product_category = JSON.stringify(uniqueCategory);
    const json_product_description = JSON.stringify(product_description);

    const insertQuery =
      "INSERT INTO product (product_name, product_category, product_unit_price, product_description, supplier_id) VALUES (?, ?, ?, ?, ?);";
    db.query(
      insertQuery,
      [
        product_name,
        json_product_category,
        product_unit_price,
        json_product_description,
        supplier_id,
      ],
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong " + err });
        }
        return res
          .status(201)
          .json({ message: "Product/service added successfully." });
      }
    );
  }
);

//get all product data info
router.get(
  "",
  validateJWT,
  (req, res, next) => {
    const searchTerm = req.query.searchterm || "";
    const filterOption = req.query.filteroption || "";

    let selectQuery = `SELECT p.product_id AS 'id', p.product_name AS 'name', p.product_unit_price AS 'unit price (RM)', p.product_category AS category, p.product_description AS 'description', s.supplier_cmp_name as supplier FROM product AS p INNER JOIN supplier AS s ON p.supplier_id = s.supplier_id`;
    let queryParams = [];

    if (searchTerm) {
      selectQuery += ` WHERE (p.product_name LIKE ?
      OR p.product_description LIKE ?)`;
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (filterOption) {
      if (searchTerm) selectQuery += " AND";
      else selectQuery += " WHERE";

      selectQuery += " supplier_category LIKE ";
      queryParams.push(`%${filterOption}%`);
    }

    db.query(selectQuery, queryParams, (err, results) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong" + err });

      const thead = results.length > 0 ? Object.keys(results[0]) : [];
      const responseBody = {
        thead: thead,
        tbody: results,
      };
      req.responseBody = responseBody;
      next();
    });
  },
  (req, res) => {
    const selectCatQuery = "SELECT * FROM category;";
    db.query(selectCatQuery, [], (err, result) => {
      if (err)
        return res.status(500).json({ message: "something went wrong " + err });

      function replaceCategoryIDs(categoryArray) {
        return categoryArray.map((id) => {
          const categoryObj = result.find(
            (item) => item.cat_id === parseInt(id)
          );
          return categoryObj ? categoryObj.cat_name : null;
        });
      }

      req.responseBody.tbody.forEach((obj) => {
        const categoryArray = JSON.parse(obj.category);
        const descriptionArray = JSON.parse(obj.description);

        obj.description = descriptionArray.join(", ");
        obj.category = replaceCategoryIDs(categoryArray).join(", ");
      });

      return res.status(200).json({ data: req.responseBody });
    });
  }
);

//get specific product data
router.get(
  "/:product_id",
  validateJWT,
  isAdmin,
  (req, res, next) => {
    const selectQuery =
      "SELECT supplier_id AS 'id', supplier_cmp_name AS name FROM supplier;";
    db.query(selectQuery, [], (err, result) => {
      if (err) res.status(500).json({ message: "Something went wrong " + err });
      const supplierSelection = result.map((supplier) => ({
        value: supplier.id,
        name: supplier.name,
      }));
      req.supplierSelection = supplierSelection;
      next();
    });
  },
  (req, res) => {
    const { product_id } = req.params;

    const selectQuery = `SELECT * FROM product WHERE product_id = ?;`;
    db.query(selectQuery, [product_id], (err, result) => {
      if (err) res.status(500).json({ message: "Something went wrong " + err });

      if (result.length !== 1)
        res.status(400).json({ message: "Product/service not found" });

      const returnObj = result[0];

      if (returnObj.product_category) {
        returnObj.product_category = JSON.parse(returnObj.product_category);
        if (Array.isArray(returnObj.product_category)) {
          returnObj.product_category = returnObj.product_category.map(
            (category) => parseInt(category)
          );
        }
      }
      if (returnObj.product_description) {
        returnObj.product_description = JSON.parse(
          returnObj.product_description
        );
      }

      return res.status(200).json({
        data: returnObj,
        option: { supplier_id: req.supplierSelection },
      });
    });
  }
);

//edit product
router.post(
  "/edit",
  validateJWT,
  isAdmin,
  validateSupplier,
  validateProduct,
  async (req, res) => {
    const {
      product_name,
      product_unit_cost,
      product_unit_price,
      supplier_id,
      product_category,
      product_description,
      product_id,
    } = req.body;

    // Check if all required fields are provided
    if (
      !product_name ||
      !product_unit_price ||
      isNaN(product_unit_price) ||
      isNaN(product_unit_cost) ||
      !Array.isArray(product_description) ||
      product_description.length === 0 ||
      !Array.isArray(product_category) ||
      product_category.length === 0 ||
      !product_id ||
      isNaN(parseInt(product_id))
    ) {
      return res.status(400).json({ message: "Please provide required info" });
    }

    const uniqueCategory = [...new Set(product_category)];

    try {
      const categoryCheck = await validateCategory(uniqueCategory);
    } catch (error) {
      return res.status(error.status).json(error.message);
    }

    const json_product_category = JSON.stringify(uniqueCategory);
    const json_product_description = JSON.stringify(product_description);

    const updateQuery =
      "UPDATE product SET product_name = ?,product_category = ?, product_unit_price = ?, product_description = ?, supplier_id = ? WHERE product_id = ?;";
    db.query(
      updateQuery,
      [
        product_name,
        json_product_category,
        product_unit_price,
        json_product_description,
        supplier_id,
        product_id,
      ],
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong " + err });
        }
        return res
          .status(201)
          .json({ message: "Product/service update successfully." });
      }
    );
  }
);

//remove supplier id from product, cannot be use anymore.
router.delete(
  "/delete/:product_id",
  validateJWT,
  isAdmin,
  validateProduct,
  (req, res) => {
    const { product_id } = req.params;

    if (!product_id)
      return res.status(400).json({ message: "Please provide required info" });

    const updateQuery =
      "UPDATE product SET supplier_id = NULL WHERE product_id = ?;";

    db.query(updateQuery, [product_id], (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Something went wrong : " + err });
      res.status(200).json({ messsage: "Product delete successfully" });
    });
  }
);

module.exports = router;
