const express = require("express");
const {
  createPurchaseBill,
  getPurchaseBillById,
  updatePurchaseBill,
  deletePurchaseBill,
  getAllPurchaseBills,
  getPurchaseBillByUserId,
} = require("../controllers/purchaseBillController");
const router = express.Router();
router.post("/createPurchaseBill", createPurchaseBill);
router.get("/getPurchaseBillById", getPurchaseBillById);
router.post("/updatePurchaseBill", updatePurchaseBill);
router.delete("/deletePurchaseBill", deletePurchaseBill);
router.get("/getAllPurchaseBills", getAllPurchaseBills);
router.post("/getPurchaseBillByUser", getPurchaseBillByUserId);
module.exports = router;
