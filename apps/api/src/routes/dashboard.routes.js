const { Router } = require("express");
const {
  regulatorSummary,
  lenderSummary,
  msmeSummary
} = require("../controllers/dashboard.controller");

const router = Router();

router.get("/regulator", regulatorSummary);
router.get("/lender", lenderSummary);
router.get("/msme", msmeSummary);

module.exports = router;
