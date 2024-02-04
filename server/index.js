const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");

//variable part
var env = process.env;
var port = env.PORT || 8080;

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: env.ORIGINURL || "*" }));

const user = require("./util/router/user");


app.use("/user", user);

app.all("*", (req, res) => {
  res.status(404).send("Page not found");
});

app.listen(port, (err) => {
  if (err) {
    return console.log("error : ", err);
  }
});
