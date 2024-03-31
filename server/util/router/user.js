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
const { isAdmin } = require("../function/authorization.js");
const { randomPassword } = require("../function/randomPassword");
const db = require("../function/conn.js");
const moment = require("moment-timezone");
const { getCategoryInfo } = require("../function/getInfo.js");

//get user info
router.get("", validateJWT, isAdmin, (req, res) => {
  const { searchterm, filteroption, sort, desc, page } = req.query;
  let selectQuery = `SELECT u.user_id AS 'id', u.user_email AS 'emil', u.user_contact AS 'contact number', u.user_name AS 'name',p.pos_name AS 'position' FROM \`user\`AS u INNER JOIN position AS p ON u.user_authority = p.pos_id`;
  let queryParams = [];

  if (searchterm) {
    selectQuery += ` WHERE (u.user_name LIKE ?
      OR u.user_email LIKE ?
      OR u.user_contact LIKE ?
      OR u.user_id LIKE ?)`;
    queryParams.push(
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`,
      `%${searchterm}%`
    );
  }

  if (filteroption) {
    if (searchterm) selectQuery += " AND";
    else selectQuery += " WHERE";

    selectQuery += " u.user_authority = ?";
    queryParams.push(filteroption);
  }
  if (sort) {
    const sortColumnNameMap = {
      id: "u.user_id",
      emil: "u.user_email",
      "contact number": "u.user_contact",
      name: "u.user_name",
      position: "p.pos_name",
    };

    if (sortColumnNameMap[sort]) {
      selectQuery += ` ORDER BY ${sortColumnNameMap[sort]} ${
        desc ? "DESC" : "ASC"
      }`;
    }
  }

  // if (page) {
  //   const limit = 25 * page;
  //   selectQuery += " LIMIT " + limit + ";";
  // }

  db.query(selectQuery, queryParams, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong" + err });

    const thead = results.length > 0 ? Object.keys(results[0]) : [];

    const responseBody = {
      thead: thead,
      tbody: results,
    };

    // Send the JSON response
    res.status(200).json({ data: responseBody });
  });
});

//get specific user info
router.get("/:user_id", validateJWT, isAdmin, (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    res.status(400).json({ message: "Please select a user" });
  }

  const selectQuery =
    "SELECT user_id, user_authority, user_name, user_contact, user_email FROM `user` WHERE user_id = ?;";

  db.query(selectQuery, user_id, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Something went wrong " + err });

    if (result.length !== 1)
      return res.status(400).json({ message: "No such user" });

    return res.status(200).json({ data: result[0] });
  });
});

//authenticate the user
router.post(
  "/login",
  getUserInfo,
  correctUser,
  generateJWT,
  getCategoryInfo,
  (req, res) => {
    if (!req.signedToken || !req.categoryArray)
      return res.status(500).json({ message: "Something went wrong " + err });
    const categoryArray = req.categoryArray.map((category) => ({
      value: category.id,
      name: category.name,
    }));
    res.status(200).send({
      token: req.signedToken,
      message: "login successful",
      options: [{ categoryInfo: req.categoryArray }],
    });
  }
);

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
      "INSERT INTO `user` (user_id, user_email, user_contact, user_authority, user_name, user_password) VALUES (?,?,?,?,?,?);";
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

    // const expiredAtDate = new Date(expiredAt);

    // const currentTimeInMalaysia = moment().tz("Asia/Kuala_Lumpur");

    // if (expiredAtDate > currentTimeInMalaysia)
    //   return res.status(401).json({ message: "Token expired" });

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
      return res.status(200).json({ message: "Password reset successfully" });
    });
  }
);

//allow user to edit profile
router.post(
  "/edit-profile",
  validateJWT,
  getUserInfo,
  async (req, res, next) => {
    const { user_password } = req.body;
    if (user_password) {
      if (req.mysqlRes.length !== 1)
        return res.status(404).json("No such user");
      var validUser = await bcrypt.compare(
        user_password,
        req.mysqlRes[0].user_password
      );

      if (!validUser) return res.status(401).json("wrong password");
      next();
    } else {
      next();
    }
  },
  uniqueEmail,
  async (req, res) => {
    const user_id = req.body.user_id || req.user.user_id;
    const {
      user_email,
      user_contact,
      user_authority,
      user_name,
      user_password,
      new_password,
    } = req.body;

    let updateQuery =
      "UPDATE `user` SET user_email = ?, user_contact = ?, user_authority = ?, user_name = ?";
    let queryParams = [user_email, user_contact, user_authority, user_name];

    if (user_authority) {
      if (req.user.user_authority > 2)
        return res.status(400).json({ message: "Cannot update position" });

      updateQuery += ", user_authority = ? ";
      queryParams.push(user_authority);
    }

    if (user_password && new_password) {
      updateQuery += ", user_password = ? ";
      const hashPassword = await bcrypt.hash(
        new_password,
        process.env.BCRYPT_HASH_SALT
      );
      queryParams.push(hashPassword);
    }

    updateQuery += "WHERE user_id = ?;";
    queryParams.push(user_id);

    db.query(updateQuery, queryParams, (err) => {
      if (err)
        return res.status(500).json({ message: "Something went wrong" + err });
      return res.status(200).json({ message: "Profile update successfully" });
    });
  }
);

// delete user account
router.delete("/delete/:user_id", validateJWT, isAdmin, async (req, res) => {
  const { user_id } = req.params;
  if (!user_id)
    return res.status(400).json({ message: "Please provide required info. " });

  const arrayOfQueries = [
    "UPDATE project SET admin_in_charge_id = NULL WHERE admin_in_charge_id = ?;",
    "UPDATE project SET manager_in_charge_id = NULL WHERE manager_in_charge_id = ?;",
    "UPDATE project SET last_edit_pic = NULL WHERE last_edit_pic = ?;",
    "UPDATE quotation SET pic_id = NULL WHERE pic_id = ?;",
    "DELETE FROM `user` WHERE user_id = ?",
  ];

  const deleteAsyncQueries = async (arrayOfQueries, user_id) => {
    try {
      const queryPromises = arrayOfQueries.map((query) => {
        return new Promise((resolve, reject) => {
          db.query(query, [user_id], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
      await Promise.all(queryPromises);
      return { success: true, message: "Delete successful" };
    } catch (err) {
      return { success: false, message: "Something went wrong " + err };
    }
  };

  deleteAsyncQueries(arrayOfQueries, user_id)
    .then((result) => {
      return res
        .status(result.success ? 200 : 500)
        .json({ message: result.message });
    })
    .catch((error) => {
      return res.status(500).json({ message: "Internal Server Error" });
    });
});

module.exports = router;
