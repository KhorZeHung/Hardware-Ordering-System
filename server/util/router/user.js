const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { email } = require("../function/email");
const {
  getUserInfo,
  generateJWT,
  correctUser,
  validateJWT,
  uniqueEmail,
  generateUserPK,
} = require("../function/validation.js");
const {
  isAdmin,
  isSuperuser,
  isManager,
} = require("../function/authorization.js");
const { randomPassword } = require("../function/randomPassword");
const db = require("../function/conn.js");
const moment = require("moment-timezone");

//get user info
router.get("", validateJWT, isAdmin, (req, res) => {
  const searchTerm = req.query.searchterm || "";
  const filterOption = req.query.filteroption || "";

  let selectQuery = `SELECT u.user_id AS 'id', u.user_email AS 'emil', u.user_phone AS 'contact number', u.user_name AS 'name',p.pos_name AS 'position' FROM \`user\`AS u INNER JOIN position AS p ON u.user_position = p.pos_id`;
  let queryParams = [];

  if (searchTerm) {
    selectQuery += ` WHERE (u.user_name LIKE ?
      OR u.user_email LIKE ?
      OR u.user_phone LIKE ?
      OR u.user_id LIKE ?)`;
    queryParams.push(
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    );
  }

  if (filterOption) {
    if (searchTerm) selectQuery += " AND";
    else selectQuery += " WHERE";

    selectQuery += " p.pos_name LIKE ?";
    queryParams.push(`%${filterOption}%`);
  }

  db.query(selectQuery, queryParams, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong" + err });

    const thead = results.length > 0 ? Object.keys(results[0]) : [];

    const responseBody = {
      thead: thead,
      tbody: results,
    };

    // Send the JSON response
    res.status(200).json(responseBody);
  });
});

//authenticate the user
router.post("/login", getUserInfo, correctUser, generateJWT, (req, res) => {
  if (!req.signedToken) return res.sendStatus(500);
  res.status(200).send({ token: req.signedToken, message: "login successful" });
});

//admin or superuser register a new user
router.post(
  "/register",
  validateJWT,
  isAdmin,
  uniqueEmail,
  generateUserPK,
  async (req, res) => {
    const { user_email, user_contact, user_authority, user_name } = req.body;
    const new_user_id = req.new_user_id;

    if (!user_email || !user_contact || !user_authority || !user_name) {
      return res.status(400).json({ message: "Please fill in all field" });
    }

    const user_temp_password = randomPassword(8);
    const hashed_user_temp_password = await bcrypt.hash(
      user_temp_password,
      process.env.BCRYPT_HASH_SALT
    );

    const insertQuery =
      "INSERT INTO `user` (user_id, user_email, user_phone, user_position, user_name, user_password) VALUES (?,?,?,?,?,?);";
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
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "something went wrong" + err });

        const sendEmailSuccess = email(
          user_email,
          "Temporary password",
          "Here is your temporary password : " + user_temp_password
        );

        if (!sendEmailSuccess) {
          const deleteQuery = "DELETE FROM `user` WHERE user_id = ?;";
          db.query(deleteQuery, [new_user_id], (err) => {
            if (err)
              return res.status(500).json({ message: "Server delete failed" });
            return res.status(500).json({ message: "Email cannot be send" });
          });
        } else {
          return res.status(201).json({ message: "User created success" });
        }
      }
    );
  }
);

//3 steps of forgot password
router.post("/forgot-password/1", getUserInfo, async (req, res) => {
  const temp_password = randomPassword(6);
  const hashed_temp_password = await bcrypt.hash(
    temp_password,
    process.env.BCRYPT_HASH_SALT
  );
  if (req.mysqlRes.length < 1)
    return res.status(400).json({ message: "No such user" });
  const { user_email } = req.mysqlRes[0];
  const insertQuery = `INSERT INTO password_reset_token (token, user_email) VALUES (?, ?);`;

  db.query(
    insertQuery,
    [hashed_temp_password, user_email],
    async (err, result1) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong" + err });

      const sendEmailSuccess = email(
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
          if (err) {
            return res
              .status(500)
              .json({ message: "Something went wrong " + err });
          }
          return res
            .status(500)
            .json({ message: "Email cannot be send, please try later" });
        });
      } else {
        return res
          .status(200)
          .json({ message: "email has send to " + user_email });
      }
    }
  );
});

router.post("/forgot-password/2", (req, res) => {
  const { user_password, user_email } = req.body;

  if (!user_password || !user_email) {
    return res
      .status(401)
      .json({ message: "Please provide 6-pin verification, or click resend" });
  }

  const selectQuery =
    "SELECT * FROM password_reset_token WHERE user_email = ? LIMIT 1;";
  db.query(selectQuery, [user_email], async (err, result1) => {
    const { token, expiredAt } = result1[0];
    const correctPassword = bcrypt.compare(user_password, token);

    const expiredAtDate = new Date(expiredAt);

    const currentTimeInMalaysia = moment().tz("Asia/Kuala_Lumpur");

    if (expiredAtDate > currentTimeInMalaysia)
      return res.status(401).json({ message: "Token expired" });

    if (!correctPassword)
      return res.status(401).json({ message: "Wrong verification code" });
    return res.status(200).json({ message: "Verify successful" });
  });
});

router.post("/forgot-password/3", async (req, res) => {
  const { user_password, user_repeat_password, user_email } = req.body;

  if (!user_password || !user_repeat_password || !user_email)
    return res.status(400).json({ message: "Please fill in all fields" });

  if (user_password !== user_repeat_password)
    return res
      .send(400)
      .json({ message: "New password and repeat password are not same" });

  if (user_password.length < 8)
    return res
      .send(200)
      .json({ message: "Password need atleast 8 character long" });

  const hashed_user_password = await bcrypt.hash(
    user_password,
    process.env.BCRYPT_HASH_SALT
  );

  const updateQuery =
    "UPDATE `user` SET user_password = ? WHERE user_email = ?;";
  db.query(updateQuery, [hashed_user_password, user_email], (err) => {
    if (err) return res.status(500).json({ message: "Something went wrong" });

    const deleteQuery =
      "DELETE FROM password_reset_token WHERE user_email = ?;";

    db.query(deleteQuery, [user_email], (err) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong " + err });
      return res.status(200).json({ message: "Password reset successfully" });
    });
  });
});

//reset password
router.post(
  "/reset-password",
  validateJWT,
  getUserInfo,
  correctUser,
  (req, res) => {
    const { new_user_password, repeat_user_password } = req.body;
    const { user_id } = req.user;

    if (!new_user_password || !repeat_user_password)
      return res.status(400).json({ message: "Please fill up all fields" });

    if (new_user_password !== repeat_user_password)
      return res
        .status(400)
        .json({ message: "New password and repeat password not the same" });

    const hashed_new_user_password = bcrypt.hash(
      new_user_password,
      process.env.BCRYPT_HASH_SALT
    );

    const updateQuery =
      "UPDATE `user` SET user_password = ? WHERE user_id = ?;";
    db.query(updateQuery, [hashed_new_user_password, user_id], (err) => {
      if (err)
        return res.status(500).json({ message: "something went wrong" + err });
      return res.status(200).json({ messsage: "Password reset successfully" });
    });
  }
);

//allow user to edit profile
router.post("/edit-profile", validateJWT, uniqueEmail, (req, res) => {
  const user_id = req.body.user_id || req.user.user_id;
  const { user_email, user_contact, user_position, user_name } = req.body;

  let updateQuery =
    "UPDATE `user` SET user_email = ?, user_phone = ?, user_position = ?, user_name = ?";
  let queryParams = [user_email, user_contact, user_position, user_name];

  if (user_position) {
    if (req.user.user_position > 2)
      return res.status(400).json({ message: "Cannot update position" });

    updateQuery += ", user_position = ? ";
    queryParams.push(user_position);
  }

  updateQuery += "WHERE user_id = ?;";
  queryParams.push(user_id);

  db.query(updateQuery, queryParams, (err) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong" + err });
    return res.status(200).json({ messsage: "Profile update successfully" });
  });
});

// delete user account
router.delete("/delete-user", validateJWT, isAdmin, async (req, res, next) => {
  const { user_id } = req.body;
  if (!user_id)
    return res.status(400).json({ message: "Please provide required info. " });

  const arrayOfQueries = [
    "UPDATE project SET admin_in_charge_id = NULL WHERE admin_in_charge_id = ?;",
    "UPDATE project SET manager_in_charge_id = NULL WHERE manager_in_charge_id = ?;",
    "UPDATE project SET last_edit_pic_id = NULL WHERE last_edit_pic_id = ?;",
    "UPDATE quotation SET pic_id = NULL WHERE pic_id = ?;",
    "DELETE FROM `user` WHERE user_id = ?",
  ];

  for (const query of arrayOfQueries) {
    db.query(query, [user_id], (err) => {
      if (err)
        return res
          .status(500)
          .json({ messasge: "Something went wrong " + err });
    });
  }
  return res.status(200).json({ message: "Delete successful" });
});

module.exports = router;
