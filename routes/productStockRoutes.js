const express = require("express");
const {
  getProductStockByUser,
  getUnbilledProductStocks,
  getproductstockByPBill,
  getTotalProductStock,
} = require("../controllers/productStockController");
const router = express.Router();
router.post("/getProductStockByUser", getProductStockByUser);
router.get("/getUnbilledProductStocks", getUnbilledProductStocks);
router.get("/productstock/:purchaseBillId", getproductstockByPBill);

router.post("/gettotalstock", getTotalProductStock);
module.exports = router;
