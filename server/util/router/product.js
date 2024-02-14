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
      product_category,
      product_unit_price,
      product_description,
      supplier_id,
      product_id,
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
router.delete("/delete", validateJWT, isAdmin, validateProduct, (req, res) => {
  const { product_id } = req.body;

  if (!product_id)
    return res.status(400).json({ message: "Please provide required info" });

  const updateQuery =
    "UPDATE product SET supplier_id = NULL WHERE product_id = ?;";

  db.query(updateQuery, [product_id], (err) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong : " + err });
    res.status(200).json({ messsage: "Product delete successfully" });
  });
});

module.exports = router;
