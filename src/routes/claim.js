const express = require("express");
const mysqlConnection = require("../database/db");
const router = express.Router();
/**Use this file to create a claiming api */
router.get("/all-claims/:userId:userType", (req, res) => {
  const { userId, userType } = req.params; // take user type too
  if (userId) {
    let userTypeIdentifier = "claim_admin_id"
      if (userType == "client") {
        userTypeIdentifier = "claim_client_id"
      }
    mysqlConnection.query(
      `SELECT * FROM claims WHERE ? = ?;`, // change this query to account for both client and admin
      [userTypeIdentifier, userId],
      (error, result) => {
        if (error) {
          console.log(error);
          return res.status(503).json({
            success: false,
            message: error,
          });
        } else if (result && result.length) {
          console.log(result);
          res.status(200).json({
            success: true,
            data: result,
          });
        } else {
          res.status(204).json({
            success: false,
            message: "No Orders found",
          });
        }
      }
    );
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid User",
    });
  }
});

router.post("/claim:insuranceId", async (req, res) => {
  const { clientId, insuranceId } = req.body;

  if (!clientIdinsuranceId || !insuranceId ) {
    return res.status(403).json({
      success: false,
      message: "One or more Insurance has missing details",
    });
  }

  mysqlConnection.query(
    `SELECT insurance_admin_id FROM insurance WHERE insurance_id = ?;`, // change this query to account for both client and admin
    [insuranceId],
    (error, result) => {
      if (error) {
        console.log(error);
        return res.status(503).json({
          success: false,
          message: error,
        });
      } else if (result && result.length) {
        console.log(result);
        let adminId = result['insurance_admin_id'] 
        
        await mysqlConnection.query(`INSERT INTO claims (
          claim_insurance_id,
          claim_date, 
          claim_client_id,
          claim_admin_id
          )
        VALUES (?,?,?);`, 
        [
          insuranceId,
          new Date(),
          clientId,
          adminId
        ], 
        (error, result) => {
          console.log(error, result);
          if (error) {
            console.log(error);
            return res.status(503).json({
              success: false,
              message: error,
            });
          } else if (result && result.affectedRows) {
            console.log(result);
            return res.status(200).json({
              success: true,
              message: "Order Placed Successfully for all Insurance",
            });
          }
        });
      } else {
        res.status(204).json({
          success: false,
          message: "No Orders found",
        });
      }
    }
  );
});

module.exports = router;
