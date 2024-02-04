const express = require("express");
const bcrypt = require("bcrypt"); // function to hash and compare password
const router = express.Router();
const jwt = require("jsonwebtoken");

const {
  getUserInfo,
  generateJWT,
  validateJWT,
} = require("../function/validateUser");

router.post("/login", getUserInfo, generateJWT, (req, res) => {
  if (!req.signedToken) return res.sendStatus(500);
  res.status(200).send(jwt.decode(req.signedToken));
});

module.exports = router;
