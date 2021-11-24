const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { validateToken } = require("../utils/JWT");
const mysqlConnection = require("../database/db");

router.get("/my-insurance/:clientId", (req, res) => {
  const { clientId } = req.params;
  if (clientId) {
    mysqlConnection.query(
      "SELECT * FROM insurance WHERE insurance_id (SELECT transc_insurance_id FROM payment WHERE transc_client_id = ?;)",
      [clientId],
      (error, result) => {
        if (error) {
          console.log(error);
          res.status(400).json({
            success: false,
            message: error,
          });
        } else if (result) {
          console.log(result);
          res.status(200).json({
            success: true,
            data: result,
          });
        }
      }
    );
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid Customer",
    });
  }
});

router.post("/insurance-add", async (req, res) => {
  const {
    insuranceId,
    clientId,
    car_id
  } = req.body;

  if (insuranceId && clientId && carId) {
    mysqlConnection.query(
      "SELECT * FROM insurance WHERE insuranceId = ?",
      [insuranceId],
      (error, result) => {
        if (error) {
          console.log(error);
        }
        else if (result.length) { // update payment and car
          const query = `INSERT INTO payment (
            transc_date, 
            transc_client_id, 
            transc_insurance_id
            VALUES (?, ?, ?);`;
          mysqlConnection.query(
            query,
            [
              new Date(),
              clientId,
              insuranceId
            ],
            (err, result) => {
              if (err) {
                console.log(err);
                res.send(err);
              } else {
                await mysqlConnection.query(
                  `UPDATE car SET car_insurance_id = ? WHERE car_id = ?`,
                  [insuranceId, carId],
                  (err, result) => { 
                    if (err) {
                      console.log(err);
                      return res.json({
                        success: true,
                        data: "Insurance added but no such car",
                      })
                    }
                  }
                )
                return res.json({
                  success: true,
                  data: "Insurance added Successfully",
                });
              }
            }
          );
        } else {
          console.log(result);
          return res.status(404).json({
            success: false,
            message: "No such insurance",
          });
        }
      }
    );
  }
});

module.exports = router;
