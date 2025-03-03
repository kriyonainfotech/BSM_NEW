const express = require("express");
const {
  createSaleBill,
  updateSaleBill,
  getSalesBillByUser,
  deleteSaleBill,
  createInvoiceBill,
  getPastHistory,
  getInvoiceBillsByUser,
  receivePayment,
  getReceivedPaymentBills,
} = require("../controllers/SaleBillController");
const router = express.Router();

router.post("/createSaleBill", createSaleBill);
router.post("/getSaleBillByUser", getSalesBillByUser);
router.post("/updateSaleBill", updateSaleBill);
router.delete("/deleteSaleBill", deleteSaleBill);
router.post("/getInvoiceBill", createInvoiceBill);
router.post("/pastHistory", getPastHistory);
router.post("/invoicebills", getInvoiceBillsByUser);
router.post("/receive-payment", receivePayment);
// router.post("/receive-payment-bills", getReceivedPaymentBills);

module.exports = router;
