const db = require("./conn.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

//function to get customer info
function getUserInfo(req, res, next) {
  const { user_email } = req.body;
  const query = `SELECT * FROM \`user\` WHERE user_email = ?`;
  db.query(query, [user_email], (err, result) => {
    if (err) return res.status(500).json("Something went wrong here");
    req.mysqlRes = result;
    next();
  });
}

async function correctUser(req, res, next) {
  const { user_password } = req.body;
  if (req.mysqlRes.length !== 1) return res.status(404).json("No such user");

  var validUser = await bcrypt.compare(
    user_password,
    req.mysqlRes[0].user_password
  );

  if (!validUser) return res.status(401).json("wrong password");
  next();
}

// generate jason web token (JWT) for user
function generateJWT(req, res, next) {
  const result = req.mysqlRes[0];

  const tokenBody = {
    user_id: result.user_id,
    user_position: result.user_position,
    user_name: result.user_name,
    user_email: result.user_email,
  };

  const signedToken = jwt.sign(tokenBody, process.env.JWT_KEY, {
    algorithm: process.env.JWT_ALGO,
  });

  req.signedToken = signedToken;
  next();
}

// validate user through token
const validateJWT = (req, res, next) => {
  if (!req.headers["authorization"])
    return res.status(401).send("Please sign up");

  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json("verify failed");
    }
  } else {
    return res.status(401).json("Invalid token");
  }

  next();
};

// check uniqueness of email submit
function uniqueEmail(req, res, next) {
  const { user_email, update_profile } = req.body;

  if (!user_email)
    return res
      .status(400)
      .json({ message: "Please fill in all required fields" });

  //check if email or contact number exist in the system
  let checkUniqueUserQuery = "SELECT * FROM `user` WHERE user_email = ?";
  let queryParams = [user_email];

  if (update_profile) {
    checkUniqueUserQuery += " AND user_id != ?;";
    queryParams.push(req.body.user_id || req.user.user_id);
  }

  db.query(checkUniqueUserQuery, queryParams, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Something went wrong" + err });
    } else if (result.length) {
      return res.status(409).json({ message: "Email already registered" });
    } else {
      // Call next() only when the query is successful and there are no conflicts
      next();
    }
  });
}

//generate primary key based on position
function generateUserPK(req, res, next) {
  const { user_authority } = req.body;

  if (!user_authority)
    return res
      .status(400)
      .json({ message: "Please fill in all required fields" });

  var position;

  switch (user_authority) {
    case "1":
      position = "SPU";
      break;
    case "2":
      position = "ADM";
      break;
    case "3":
      position = "MNG";
      break;
    default:
      return res.status(401).json({
        message: "please provide valid user position",
      });
  }

  const lastUserIdQuery =
    "SELECT * FROM `user` WHERE user_position = ? ORDER BY user_created_at DESC LIMIT 1;";

  db.query(lastUserIdQuery, [user_authority], (err, result) => {
    if (err)
      return res.status(500).json({ message: "something went wrong" + err });

    if (result.length < 1) {
      req.new_user_id = position + "001";
    } else {
      const { user_id } = result[0];
      const number = parseInt(user_id.slice(3));
      const paddedNum = String(number + 1).padStart(3, "0");
      req.new_user_id = position + paddedNum;
    }

    next();
  });
}

// validate supplier id
function validateSupplier(req, res, next) {
  const { supplier_id } = req.body;

  if (!supplier_id)
    return res.status(400).json({ message: "Please provide required info" });

  const selectQuery = "SELECT * FROM supplier WHERE supplier_id = ?";
  db.query(selectQuery, [supplier_id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    if (result.length !== 1)
      return res.status(400).json({ message: "Bad request" });

    next();
  });
}

//validate category for both supplier and product, not middleware
async function validateCategory(arraysOfCategory) {
  if (!Array.isArray(arraysOfCategory) || arraysOfCategory.length < 1) {
    return { isValid: false, message: "Category is required", status: 400 };
  }

  let selectQuery = "SELECT * FROM category WHERE cat_id IN(";
  let queryParams = [];

  for (const category of arraysOfCategory) {
    selectQuery += "?,";
    queryParams.push(category);
  }

  selectQuery = selectQuery.slice(0, -1);
  selectQuery += ");";

  return new Promise((resolve, reject) => {
    db.query(selectQuery, queryParams, (err, result) => {
      if (err) {
        reject({
          isValid: false,
          message: "Something went wrong: " + err,
          status: 500,
        });
      } else if (result.length !== arraysOfCategory.length) {
        reject({ isValid: false, message: "Bad request", status: 400 });
      } else {
        resolve({ isValid: true });
      }
    });
  });
}

// validate product id individually
function validateProduct(req, res, next) {
  const { product_id } = req.body;

  if (!product_id)
    return res.status(400).json({ message: "Please provide required info" });

  const selectQuery = "SELECT * FROM product WHERE product_id = ?";
  db.query(selectQuery, [product_id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    if (result.length !== 1)
      return res.status(400).json({ message: "Bad request" });
    next();
  });
}

module.exports = {
  getUserInfo,
  generateJWT,
  validateJWT,
  correctUser,
  uniqueEmail,
  generateUserPK,
  validateSupplier,
  validateCategory,
  validateProduct,
};
