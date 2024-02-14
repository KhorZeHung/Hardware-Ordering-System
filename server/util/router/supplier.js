const express = require("express");
const router = express.Router();
const db = require("../function/conn");
const {
  validateJWT,
  validateCategory,
  validateSupplier,
} = require("../function/validation");
const { isAdmin } = require("../function/authorization");

// register for new supplier
router.post("/register", validateJWT, isAdmin, async (req, res) => {
  const {
    supplier_cmp_name,
    supplier_pic,
    supplier_phone,
    supplier_category,
    supplier_address,
  } = req.body;

  // Check if all required fields are provided
  if (
    !supplier_cmp_name ||
    !supplier_phone ||
    !supplier_category ||
    !supplier_pic ||
    !Array.isArray(supplier_category) ||
    supplier_category.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required information." });
  }
  const uniqueCategory = [...new Set(supplier_category)];

  try {
    const categoryCheck = await validateCategory(uniqueCategory);
  } catch (error) {
    return res.status(error.status).json(error.message);
  }

  const json_supplier_category = JSON.stringify(uniqueCategory);

  const insertQuery =
    "INSERT INTO supplier (supplier_cmp_name, supplier_pic, supplier_phone, supplier_category, supplier_address) VALUES (?, ?, ?, ?, ?)";
  db.query(
    insertQuery,
    [
      supplier_cmp_name,
      supplier_pic,
      supplier_phone,
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
});

router.get("/:supplier_id", validateJWT, (req, res) => {
  const { supplier_id } = req.params;

  let selectQuery = "SELECT * FROM supplier";
  let queryParams = [];
  if (supplier_id !== "*") {
    selectQuery += " WHERE supplier_id = ?;";
    queryParams.push(supplier_id);
  }
  db.query(selectQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong." + err });
    if (!result.length)
      return res.status(400).json({ message: "Supplier not found" });

    return res.status(200).json({ data: result });
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
      supplier_phone,
      supplier_category,
      supplier_id,
      supplier_address,
    } = req.body;
    if (
      !supplier_cmp_name ||
      !supplier_phone ||
      !supplier_category ||
      !supplier_pic ||
      !supplier_id ||
      !supplier_address ||
      !Array.isArray(supplier_category) ||
      supplier_category.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required information." });
    }

    const uniqueCategory = [...new Set(supplier_category)];

    try {
      const categoryCheck = await validateCategory(uniqueCategory);
    } catch (error) {
      return res.status(error.status).json(error.message);
    }

    const json_supplier_category = JSON.stringify(uniqueCategory);

    const udpateQuery =
      "UPDATE supplier SET supplier_cmp_name = ?, supplier_pic = ?, supplier_phone = ? , supplier_category = ?, supplier_address = ? WHERE supplier_id = ?";
    db.query(
      udpateQuery,
      [
        supplier_cmp_name,
        supplier_pic,
        supplier_phone,
        json_supplier_category,
        supplier_id,
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
router.delete("/delete", validateJWT, isAdmin, validateSupplier, (req, res) => {
  const { supplier_id } = req.body;

  if (!supplier_id)
    return res.status(400).json({ message: "Please provide required info" });

  const arrayOfQuery = [
    "UPDATE product SET supplier_id = NULL WHERE supplier_id = ?;",
    "DELETE FROM supplier WHERE supplier_id = ?;",
  ];

  for (const query of arrayOfQuery) {
    console.log(query);
    db.query(query, [supplier_id], (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Something went wrong : " + err });
    });
  }

  return res.status(200).json({ messsage: "Supplier delete successfully" });
});

module.exports = router;
