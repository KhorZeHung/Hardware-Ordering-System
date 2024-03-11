const express = require("express");
const router = express.Router();
const db = require("../function/conn");
const { replaceIds } = require("../function/stringFormat");
const { getCategoryInfo, getSupplierInfo } = require("../function/getInfo");
const {
  validateJWT,
  validateCategory,
  validateSupplier,
} = require("../function/validation");
const { isAdmin } = require("../function/authorization");
const { catIdToName } = require("../function/stringFormat");

// register for new supplier
router.post(
  "/register",
  validateJWT,
  isAdmin,
  validateSupplier,
  async (req, res) => {
    const {
      supplier_cmp_name,
      supplier_pic,
      supplier_contact,
      supplier_category,
      supplier_address,
    } = req.body;

    // Check if all required fields are provided
    if (
      !supplier_cmp_name ||
      !supplier_contact ||
      !supplier_category ||
      !supplier_pic ||
      !Array.isArray(supplier_category) ||
      supplier_category.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required information." });
    }

    if (req.supplier.length > 0) {
      return res.status(400).json({ message: "Supplier exists" });
    }

    const uniqueCategory = [...new Set(supplier_category)];
    try {
      const categoryCheck = await validateCategory(uniqueCategory);
    } catch (error) {
      return res.status(error.status).json(error.message);
    }

    const json_supplier_category = JSON.stringify(uniqueCategory);

    const insertQuery =
      "INSERT INTO supplier (supplier_cmp_name, supplier_pic, supplier_contact, supplier_category, supplier_address) VALUES (?, ?, ?, ?, ?)";
    db.query(
      insertQuery,
      [
        supplier_cmp_name,
        supplier_pic,
        supplier_contact,
        json_supplier_category,
        supplier_address,
      ],
      (err) => {
        if (err) {
          console.error("Error creating supplier:", err);
          return res.status(500).json({ message: "Something went wrong." });
        }
        return res
          .status(201)
          .json({ message: "Supplier created successfully." });
      }
    );
  }
);

//get all supplier data info
router.get(
  "",
  validateJWT,
  getCategoryInfo,
  (req, res, next) => {
    const { searchterm = null, filteroption = null } = req.query;

    let selectQuery = `SELECT supplier_id AS 'id', supplier_cmp_name AS 'company name', supplier_pic AS 'person in charge', supplier_contact AS contact, supplier_category AS category, supplier_address AS address FROM supplier`;
    let queryParams = [];

    if (searchterm) {
      selectQuery += ` WHERE (supplier_cmp_name LIKE ?
      OR supplier_pic LIKE ?
      OR supplier_contact LIKE ?
      OR supplier_address LIKE ?)`;
      queryParams.push(
        `%${searchterm}%`,
        `%${searchterm}%`,
        `%${searchterm}%`,
        `%${searchterm}%`
      );
    }

    if (filteroption) {
      if (searchterm) selectQuery += " AND";
      else selectQuery += " WHERE";

      selectQuery += " supplier_category LIKE ?";
      queryParams.push(`%${filteroption}%`);
    }

    selectQuery += " ORDER BY supplier_id DESC;";
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
    req.responseBody.tbody.forEach((obj) => {
      const categoryArray = JSON.parse(obj.category);
      obj.category = replaceIds(categoryArray, req.categoryArray).join(", ");
    });

    return res.status(200).json({ data: req.responseBody });
  }
);

//get all supplier's id and name only
router.get("/options", validateJWT, getSupplierInfo, (req, res) => {
  if (req.supplierArray) {
    res.status(200).json({ option: req.supplierArray });
  } else {
    res.status(500).json({ message: "something went wrong" });
  }
});

//get specific supplier data
router.get("/:supplier_id", validateJWT, (req, res, next) => {
  const { supplier_id } = req.params;

  const selectQuery = "SELECT * FROM supplier WHERE supplier_id = ?;";

  db.query(selectQuery, [supplier_id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong." + err });
    if (result.length !== 1)
      return res.status(400).json({ message: "Supplier not found" });

    const returnObj = result[0];

    if (returnObj.supplier_category) {
      returnObj.supplier_category = JSON.parse(returnObj.supplier_category);
      if (Array.isArray(returnObj.supplier_category)) {
        returnObj.supplier_category = returnObj.supplier_category.map(
          (category) => parseInt(category)
        );
      }
    }
    return res.status(200).json({ data: returnObj });
  });
});

//edit supplier
router.post(
  "/edit",
  validateJWT,
  isAdmin,
  validateSupplier,
  async (req, res) => {
    const {
      supplier_cmp_name,
      supplier_pic,
      supplier_contact,
      supplier_category,
      supplier_id,
      supplier_address = null,
    } = req.body;

    if (
      !supplier_cmp_name ||
      !supplier_contact ||
      !supplier_category ||
      !supplier_pic ||
      !supplier_id ||
      !Array.isArray(supplier_category) ||
      supplier_category.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required information." });
    }

    if (req.supplier.length !== 1) {
      return res.status(400).json({ message: "Supplier not found" });
    }

    const uniqueCategory = [...new Set(supplier_category)];

    try {
      const categoryCheck = await validateCategory(uniqueCategory);
    } catch (error) {
      return res.status(error.status).json(error.message);
    }

    const json_supplier_category = JSON.stringify(uniqueCategory);

    const updateQuery =
      "UPDATE supplier SET supplier_cmp_name = ?, supplier_pic = ?, supplier_contact = ? , supplier_category = ?, supplier_address = ? WHERE supplier_id = ?";
    db.query(
      updateQuery,
      [
        supplier_cmp_name,
        supplier_pic,
        supplier_contact,
        json_supplier_category,
        supplier_address,
        supplier_id,
      ],
      (err) => {
        if (err) {
          console.error("Error creating supplier:", err);
          return res.status(500).json({ message: "Something went wrong." });
        }
        return res
          .status(201)
          .json({ message: "Supplier update successfully." });
      }
    );
  }
);

//delete supplier
router.delete("/delete/:supplier_id", validateJWT, isAdmin, (req, res) => {
  const { supplier_id } = req.params;

  if (!supplier_id)
    return res.status(400).json({ message: "Please provide required info" });

  const arrayOfQuery = [
    "UPDATE product SET supplier_id = NULL WHERE supplier_id = ?;",
    "DELETE FROM supplier WHERE supplier_id = ?;",
  ];

  for (const query of arrayOfQuery) {
    db.query(query, [supplier_id], (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Something went wrong : " + err });
    });
  }

  return res.status(200).json({ message: "Supplier delete successfully" });
});

module.exports = router;
