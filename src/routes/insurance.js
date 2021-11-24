const express = require("express");
const router = express.Router();
const mysqlConnection = require("../database/db");
const path = require("path");
const fs = require("fs");

// PRODUCT REGISTER API
router.post("/insurance-register", async (req, res) => {
  const {
    insuranceName,
    insuranceAdminId,
    insuranceDescription,
  } = req.body;

  if (
    insuranceName !== "" &&
    insuranceAdminId &&
    insuranceDescription !== ""
  ) {
    await mysqlConnection.query(
      `SELECT admin_id FROM admins WHERE admin_id = ?`,
      [insuranceAdminId],
      async (error, result, fields) => {
        if (error || !result.length) {
          console.log(error, result, fields);
          return res.status(403).json({
            success: false,
            message:
              "Unauthorized Admin, Malicious activity.",
          });
        } else if (result.length) {
          console.log(result, fields);
          const query = `INSERT INTO insurance (
            insurance_name,
            insurance_description,
            insurance_admin_id,
          ) 
          VALUES (?, ?, ?);`;
          await mysqlConnection.query(
            query,
            [
              insuranceName,
              insuranceDescription,
              insuranceAdminId
            ],
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(503).json({
                  success: false,
                  error: err,
                });
              } else {
                console.log(result);
                res.status(200).json({
                  success: true,
                  data: result,
                });
              }
            }
          );
        }
      }
    );
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Mandatory Fields are Empty" });
  }
});

// PRODUCT UPDATE API
router.patch("/insurance-update", (req, res) => {
  const {
    insuranceId,
    insuranceName,
    insuranceAdminId,
    insuranceDescription,
  } = req.body;

  if (
    insuranceName !== "" &&
    insuranceAdminId && insuranceId && 
    insuranceDescription !== ""
  ) {
    mysqlConnection.query(
      `UPDATE insurance SET 
      insurance_name,
      insurance_description,
      insurance_admin_id,
      WHERE insurance_id = ?;`,
      [
        insuranceName,
        insuranceDescription,
        insuranceAdminId,
        insuranceId
      ],
      (error, result, fields) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: error,
          });
        } else if (result && result.affectedRows) {
          console.log(result, fields);
          res
            .status(200)
            .json({ success: true, message: "Product updated successfully" });
        } else {
          res.status(404).json({
            success: false,
            message: "Product doesn't exist or invalid Seller",
          });
        }
      }
    );
  } else {
    return res
      .status(407)
      .json({ success: false, message: "Mandatory Fields are Empty" });
  }
});

// DELETE PRODUCT API
router.delete("/insurance-delete/:insuranceAdminId/:insuranceId", (req, res) => {
  const { insuranceId, insuranceAdminId } = req.params;
  console.log(insuranceId, insuranceSellerId);
  if (insuranceId && insuranceSellerId) {
    const query = `DELETE FROM insurance WHERE insurance_id = ? && insurance_admin_id = ?;`;
    mysqlConnection.query(
      query,
      [insuranceId, insuranceAdminId],
      (error, result) => {
        if (error) {
          console.log(error);
          return res.status(400).json({
            success: false,
            error: error,
          });
        } else if (result && result.affectedRows) {
          console.log(result);
          return res
            .status(200)
            .json({ success: true, message: "Product Deleted Successfully" });
        } else {
          return res.status(404).json({
            success: false,
            message: "Invalid Product or Seller",
          });
        }
      }
    );
  } else {
    return res.status(403).json({
      success: false,
      message: "Mandatory fields are empty",
    });
  }
});

router.get("/insurance-holders/:insuranceId", (req, res) => {
  const { insuranceId } = req.params;
  const query = `SELECT COUNT(*) 
                FROM payment
                WHERE transc_insurance_id = ?;`;
  mysqlConnection.query(query, [insuranceId], (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        error: error,
      });
    } else if (result) {
      console.log(result);
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  });
});

module.exports = router;
