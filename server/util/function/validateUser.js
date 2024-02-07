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

module.exports = {
  getUserInfo,
  generateJWT,
  validateJWT,
  correctUser,
};
