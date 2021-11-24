const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mysqlConnection = require("../database/db");
const { createTokens, validateToken } = require("../utils/JWT");
const dotenv = require("dotenv");
dotenv.config();

const { saltRounds } = require("../utils/constants.js");

// CUSTOMER REGISTER API
router.post("/client-register", (req, res) => {
  const {
    clientName,
    clientPassword,
    clientEmail,
    clientAddress
  } = req.body;

  if (
    clientName !== "" &&
    clientEmail !== "" &&
    clientPassword !== ""
  ) {
    mysqlConnection.query(
      "SELECT client_email FROM clients WHERE client_email = ?",
      [clientEmail],
      (error, result) => {
        if (error) {
          console.log(error);
        }
        if (result.length) {
          return res.status(400).json({
            success: false,
            message: "Email already registered please try Signing In",
          });
        } else {
          bcrypt.hash(clientPassword, saltRounds, function (err, hash) {
            // Store hash in password DB.
            const hashedPassword = hash;
            const query = `INSERT INTO client_table (
                client_name, 
                client_email, 
                client_pass_hash,
                client_address 
                )
                VALUES (?, ?, ?, ?);`;
            mysqlConnection.query(
              query,
              [
                clientName,
                clientEmail,
                hashedPassword,
                clientAddress
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

// CUSTOMER LOGIN API
router.post("/client-login", async (req, res) => {
  const { clientEmail, clientPassword } = req.body;
  await mysqlConnection.query(
    `SELECT 
    client_id, 
    client_email, 
    client_name,  
    FROM clients WHERE client_email = ?;`,
    [clientEmail],
    (error, result) => {
      if (error) {
        console.log(error);
      }
      if (!result.length) {
        return res.status(403).json({
          success: false,
          message: "User doesn't exist, Please make an Account",
        });
      } else {
        const hashedPassword = result[0].client_pass;
        bcrypt.compare(clientPassword, hashedPassword).then((match) => {
          if (!match) {
            res.status(403).json({
              status: false,
              message: "Email or Password Incorrect",
            });
          } else {
            const tokenObject = {
              email: result[0].client_email,
              pass: result[0].client_pass,
              id: result[0].client_id,
              role: "client",
            };
            const accessToken = createTokens(tokenObject);
            // console.log(tokenObject, accessToken);

            res.cookie(process.env.cookieName, accessToken, {
              maxAge: 60 * 60 * 24 * 30 * 1000,
              httpOnly: true,
            });
            let clientData = result[0];
            delete clientData["client_pass_hash"];
            res.json({
              success: true,
              data: { accessToken: accessToken, clientData: clientData },
            });
          }
        });
      }
    }
  );
});

router.get("/profile", validateToken, async (req, res) => {
  res.json({ sucess: true, message: "Welcome to profile" });
});

router.get("/insurance-list", async (req, res) => {
  // change query
  const query = `SELECT 
	  insurance_id,  
    insurance_name, 
    insurance_description, 
    insurance_admin_id, 
    FROM insurance ;`;
  mysqlConnection.query(query, async (error, result, fields) => {
    // console.log(result);
    if (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error,
      });
    } else if (result && result.length) {
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  });
});

// CUSTOMER UPDATE API
router.patch("/client-update", async (req, res) => {
  const {
    clientId,
    clientName,
    clientPassword,
    clientEmail,
    clientAddress
  } = req.body;
  if (clientId && clientEmail !== "" && clientName !== "") {
    await mysqlConnection.query(
      "SELECT client_email, client_id, client_pass_hash FROM clients WHERE client_id = ?;",
      [clientId],
      (error, result) => {
        if (error) {
          console.log(error);
        }
        if (!result.length) {
          return res.status(403).json({
            success: false,
            message: "Invalid Password, Please try again",
          });
        } else {
          const hashedPassword = result[0].client_pass;
          bcrypt.compare(clientPassword, hashedPassword).then((match) => {
            if (!match) {
              res.status(400).json({
                status: false,
                message: "Email or Password Incorrect",
              });
            } else {
              const query = `UPDATE client_table SET 
                    client_name = ?,  
                    client_address = ?
                    client_email = ?
                  WHERE client_id = ?;`;
              mysqlConnection.query(
                query,
                [
                  clientName,
                  clientAddress,
                  clientEmail,
                  clientId
                ],
                (error, result) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).json({
                      success: false,
                      error: error,
                    });
                  } else {
                    res.json({
                      success: true,
                      data: result,
                    });
                  }
                }
              );
            }
          });
        }
      }
    );
  } else {
    res.status(403).json({
      success: false,
      message: "Mandatory fields are empty",
    });
  }
});

module.exports = router;
