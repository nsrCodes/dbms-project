const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const path = require("path")
const mysqlConnection = require("../database/db");
const { createTokens, validateToken } = require("../utils/JWT");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const { saltRounds } = require("../utils/constants.js");

// SELLER REGISTER API - only to be used by master
router.post("/admin-register", (req, res) => {
  const {
    adminName,
    adminPassword,
    adminEmail
  } = req.body;

  if (
    adminName !== "" &&
    adminEmail !== "" &&
    adminPassword !== "" 
  ) {
    mysqlConnection.query(
      "SELECT admin_email FROM admin_table WHERE admin_email = ?",
      [adminEmail],
      async (error, result) => {
        if (error) {
          console.log(error);
        }
        if (result.length) {
          return res.status(400).json({
            success: false,
            message: "Email already registered please try Signing In",
          });
        } else {
          await bcrypt.hash(adminPassword, saltRounds, function (err, hash) {
            if (err) {
              console.log(err);
            }
            // Store hash in your password DB.
            const hashedPassword = hash;
            const query = `INSERT INTO admin_table (
                  admin_name, 
                  admin_email, 
                  admin_pass_hash, 
                  )
              VALUES (?, ?, ?);`;
            mysqlConnection.query(
              query,
              [
                adminName,
                adminEmail,
                hashedPassword
              ],
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.send(err);
                } else {
                  console.log(result);
                  res.json({
                    success: true,
                    data: result,
                  });
                }
              }
            );
          });
        }
      }
    );
  } else {
    res.status(400).json({
      success: false,
      error: "Mandatory fields are not filled",
    });
  }
});

// SELLER LOGIN API
router.post("/admin-login", async (req, res) => {
  const { adminEmail, adminPassword } = req.body;
  await mysqlConnection.query(
    `SELECT 
    admin_email, 
    admin_id, 
    admin_pass,
    admin_name,
    FROM admin_table WHERE admin_email = ?;`,
    [adminEmail],
    (error, result) => {
      if (error) {
        console.log(error);
      }
      if (!result.length) {
        return res.status(400).json({
          success: false,
          message: "User doesn't exist, Please make an Account",
        });
      } else {
        const hashedPassword = result[0].admin_pass;
        bcrypt.compare(adminPassword, hashedPassword).then((match) => {
          if (!match) {
            res.status(400).json({
              status: false,
              message: "Email or Password Incorrect",
            });
          } else {
            const tokenObject = {
              email: result[0].admin_email,
              pass: result[0].admin_pass,
              id: result[0].admin_id,
              role: "admin",
            };
            const accessToken = createTokens(tokenObject);
            console.log(tokenObject, accessToken);

            res.cookie(process.env.cookieName, accessToken, {
              maxAge: 60 * 60 * 24 * 30 * 1000,
              httpOnly: true,
            });
            const adminData = result[0];
            delete adminData["admin_pass"];
            res.json({
              success: true,
              data: { accessToken: accessToken, adminData: adminData },
            });
          }
        });
      }
    }
  );
});

router.get("/admin-insurance/:adminId", (req, res) => {
  const { adminId } = req.params;
  const query = `SELECT * FROM insurance WHERE insurance_admin_id = ?;`;
  mysqlConnection.query(query, [adminId], (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        error: error,
      });
    } else if (result && result.length) {
      console.log(result);
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  });
});

module.exports = router;
/**To see all pending claims */