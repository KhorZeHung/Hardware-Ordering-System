const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { email } = require("../function/email");
const {
  getUserInfo,
  generateJWT,
  correctUser,
  validateJWT,
} = require("../function/validateUser");
const { randomPassword } = require("../function/randomPassword");
const db = require("../function/conn.js");
const moment = require("moment-timezone");

router.post("/login", getUserInfo, correctUser, generateJWT, (req, res) => {
  if (!req.signedToken) return res.sendStatus(500);
  res.status(200).send({ token: req.signedToken, message: "login successful" });
});

router.post("/register", validateJWT, async (req, res) => {
  const { user_email, user_contact, user_authority, user_name } = req.body;

  if (!user_email || !user_contact || !user_authority || !user_name) {
    return res.status(400).json("Please fill in all field");
  }

  //check if email or contact number exist in the system
  const checkUniqueUserQuery =
    "SELECT * FROM `user` WHERE user_email = ? OR user_contact = ?;";
  db.query(checkUniqueUserQuery, [user_email, user_contact], (err, result1) => {
    if (err) return res.status(500).json("Something went wrong");
    if (result1.length > 0) return res.status(409).json("User already exists");
  });

  var position;
  var new_user_id;

  //generate primary key based on position
  switch (user_authority) {
    case 1:
      position = "SPU";
      break;
    case 2:
      position = "ADM";
      break;
    case 3:
      position = "MNG";
      break;
    default:
      return res.status(401).json("please provide valid user position");
  }

  const lastUserIdQuery =
    'SELECT * FROM `user` WHERE user_id LIKE "' +
    position +
    '%" ORDER BY user_created_at DESC LIMIT 1;';

  db.query(lastUserIdQuery, (err, result2) => {
    if (err) return res.status(500).json("something went wrong");

    if (result2.length !== 1) {
      new_user_id = position + "001";
    } else {
      const { user_id } = result2[0];
      const number = parseInt(user_id.slice(3));
      new_user_id = position + (number + 1);
    }
  });

  const user_temp_password = randomPassword(8);
  const hashed_user_temp_password = await bcrypt.hash(
    user_temp_password,
    process.env.BCRYPT_HASH_SALT
  );

  const insertQuery =
    "INSERT INTO `user` (user_id, user_email, user_contact, user_authority, user_name, user_password) VALUES (?,?,?,?,?);";
  db.query(
    insertQuery,
    [
      new_user_id,
      user_email,
      user_contact,
      user_authority,
      user_name,
      hashed_user_temp_password,
    ],
    (err, result3) => {
      if (err || result3.affectedRows !== 1)
        return res.status(500).json("something went wrong");
      else {
        const sendEmailSuccess = email(
          null,
          user_email,
          "Temporary password",
          "Here is your temporary password : " + user_temp_password,
          null
        );
        if (!sendEmailSuccess) {
          const deleteQuery = "DELETE FROM `user` WHERE user_id = ?;";
          db.query(deleteQuery, [new_user_id], (err, result) => {
            if (err) return res.status(500).json("Server delete failed");
          });
          return res.status(500).json("Email cannot be send");
        }
        res.status(201).json("User created success");
      }
    }
  );
});

router.post("/forgot-password/1", getUserInfo, async (req, res) => {
  const temp_password = randomPassword(6);
  const hashed_temp_password = await bcrypt.hash(
    temp_password,
    process.env.BCRYPT_HASH_SALT
  );
  const { user_email } = req.mysqlRes[0];
  const insertQuery = `INSERT INTO password_reset_token (token, user_email) VALUES (?, ?);`;

  db.query(
    insertQuery,
    [hashed_temp_password, user_email],
    async (err, result1) => {
      if (err) return res.status(500).json("Something went wrong" + err);

      const sendEmailSuccess = await email(
        user_email,
        "6-pin verification",
        "Here is your verification pin : " + temp_password
      );

      console.log("Here is your verification pin : " + temp_password);

      if (!sendEmailSuccess) {
        const { insertId } = result1;
        const deleteQuery =
          "DELETE FROM password_reset_token WHERE token_id = ?;";

        db.query(deleteQuery, [insertId], (err) => {
          if (err) return res.status(500).json("Something went wrong " + err);
        });
      } else {
        return res.status(200).json("email has send to " + user_email);
      }
    }
  );
});

router.post("/forgot-password/2", (req, res) => {
  const { user_password, user_email } = req.body;

  if (!user_password || !user_email) {
    return res
      .status(401)
      .json("Please provide 6-pin verification, or click resend");
  }

  const selectQuery =
    "SELECT * FROM password_reset_token WHERE user_email = ? LIMIT 1;";
  db.query(selectQuery, [user_email], async (err, result1) => {
    const { token, expiredAt } = result1[0];
    const correctPassword = bcrypt.compare(user_password, token);

    const expiredAtDate = new Date(expiredAt);

    const currentTimeInMalaysia = moment().tz("Asia/Kuala_Lumpur");

    if (expiredAtDate > currentTimeInMalaysia)
      return res.status(401).json("Token expired");

    if (!correctPassword)
      return res.status(401).json("Wrong verification code");
    return res.status(200).json("Verify successful");
  });
});

router.post("/forgot-password/3", async (req, res) => {
  const { user_password, user_repeat_password, user_email } = req.body;

  if (!user_password || !user_repeat_password || !user_email)
    return res.status(400).json("Please fill in all fields");

  if (user_password !== user_repeat_password)
    return res.send(400).json("New password and repeat password are not same");

  if (user_password.length < 8)
    return res.send(200).json("Password need atleast 8 character long");

  const hashed_user_password = await bcrypt.hash(
    user_password,
    process.env.BCRYPT_HASH_SALT
  );

  const updateQuery =
    "UPDATE `user` SET user_password = ? WHERE user_email = ?;";
  db.query(updateQuery, [hashed_user_password, user_email], (err) => {
    if (err) return res.status(500).json("Something went wrong");

    const deleteQuery =
      "DELETE FROM password_reset_token WHERE user_email = ?;";

    db.query(deleteQuery, [user_email], (err) => {
      if (err) return res.status(500).json("Something went wrong " + err);
      return res.status(200).json("Password reset successfully");
    });
  });
});

module.exports = router;
