const db = require("./conn");

function replaceIds(arrays, result) {
  return arrays.map((arrayId) => {
    const categoryObj = result.find((item) => item.id === parseInt(arrayId));
    return categoryObj ? categoryObj.name : null;
  });
}

function selectCategory(req, res, next) {
  const selectCatQuery =
    "SELECT cat_id AS `id`, cat_name AS name FROM category;";
  db.query(selectCatQuery, [], (err, result) => {
    if (err)
      return res.status(500).json({ message: "something went wrong " + err });
    req.categoryArray = result;
    next();
  });
}

module.exports = { selectCategory, replaceIds };
