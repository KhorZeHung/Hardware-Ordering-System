const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");

//variable part
var env = process.env;
var port = env.PORT || 8080;
var ipAddress = env.IPADDRESS || "192.168.1.109";

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: env.ORIGINURL || "*" }));
app.use(express.static("assets"));

const user = require("./util/router/user");
const account = require("./util/router/account");
const order = require("./util/router/order");
const product = require("./util/router/product");
const project = require("./util/router/project");
const quote = require("./util/router/quote");
const supplier = require("./util/router/supplier");
const dashboard = require("./util/router/dashboard");

app.use("/user", user);
app.use("/account", account);
app.use("/order", order);
app.use("/product", product);
app.use("/project", project);
app.use("/quote", quote);
app.use("/supplier", supplier);
app.use("/dashboard", dashboard);

app.all("*", (req, res) => {
  res.status(404).send("Page not found");
});

app.listen(port, (err) => {
  if (err) {
    return console.log("error : ", err);
  }
});
// app.listen(port, ipAddress, (err) => {
//   if (err) {
//     return console.log("error : ", err);
//   }
// });
