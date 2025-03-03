const express = require("express");
const {
  addSaleman,
  getSalesmanByUser,
  getAllSalesman,
  updateSalesman,
  deleteSalesman,
} = require("../controllers/salesmanController");
const router = express.Router();

router.post("/AddSalesman", addSaleman);
// router.post("/getSalesman", getSalesmanByUser);
// router.get("/getAllSalesman", getAllSalesman);
router.post("/updateSalesman", updateSalesman);
router.delete("/deleteSalesman", deleteSalesman);
router.post("/getSalesmanbyUser", getSalesmanByUser);

module.exports = router;
