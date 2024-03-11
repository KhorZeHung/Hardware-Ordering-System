const db = require("./conn");

function getProductInfo(req, res, next) {
  const selectQuery =
    "SELECT product_id AS `id`, product_name AS name, product_description AS description, product_category AS category, product_unit_price as 'unit_price', supplier_id AS 'supplier', product_unit_cost as 'unit_cost' FROM product WHERE supplier_id IS NOT NULL;";
  db.query(selectQuery, [], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    const productArray = result.map((product) => ({
      ...product,
      description: JSON.parse(product.description),
      category: JSON.parse(product.category),
    }));

    req.productArray = productArray;
    next();
  });
}

function getCategoryInfo(req, res, next) {
  const selectCatQuery =
    "SELECT cat_id AS `id`, cat_name AS name FROM category;";
  db.query(selectCatQuery, [], (err, result) => {
    if (err)
      return res.status(500).json({ message: "something went wrong " + err });
    req.categoryArray = result;
    next();
  });
}

function getSupplierInfo(req, res, next) {
  let selectSupplierQuery =
    "SELECT supplier_id AS `value`, supplier_cmp_name AS `name` FROM supplier;";
  let queryParams = [];
  db.query(selectSupplierQuery, queryParams, (err, result) => {
    if (err)
      return res.status(500).json({ message: "something went wrong " + err });
    req.supplierArray = result;
    next();
  });
}

module.exports = { getProductInfo, getCategoryInfo, getSupplierInfo };
