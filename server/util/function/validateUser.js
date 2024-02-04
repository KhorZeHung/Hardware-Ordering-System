const db = require("./conn.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//function to get customer info
function getUserInfo(req, res, next) {
  var { userEmail } = req.body;
  //need to change
  var query = `SELECT * FROM \`user\` WHERE user_email = ?`;
  db.query(query, [userEmail], (err, result) => {
    if (err) return res.send(500);
    if (result.length !== 1) return res.status(401).send("No such user");
    req.mysqlRes = result;
    next();
  });
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
};
