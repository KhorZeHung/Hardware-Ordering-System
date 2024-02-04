const mysql = require("mysql");
require("dotenv").config();

//variable part
var env = process.env;

//mysql database connection
const db = mysql.createPool({
  host: env.HOST,
  user: env.USER,
  password: env.PASSWORD,
  database: env.DATABASE,
});

module.exports = db;