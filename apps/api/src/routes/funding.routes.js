const { Router } = require("express");
const {
  listFundingRequests,
  requestFunding,
  registerMsme,
  confirmFundingRequest,
  approveFunding,
  repayFunding,
  uploadDocument,
  listEvents,
  listDocuments,
  confirmBrowserDocumentSubmit
} = require("../controllers/funding.controller");
const { requireRole } = require("../middleware/auth.middleware");
const { ROLES } = require("@umkmchain/shared");

const router = Router();

router.get("/requests", listFundingRequests);
router.post("/request", requestFunding);
router.post("/msme/register", requireRole(ROLES.MSME), registerMsme);
router.post("/request/confirm", requireRole(ROLES.MSME), confirmFundingRequest);
router.post("/:id/approve", approveFunding);
router.post("/:id/repay", repayFunding);
router.post("/document/upload", requireRole(ROLES.MSME), uploadDocument);
router.post("/documents/:id/confirm-browser-submit", requireRole(ROLES.MSME), confirmBrowserDocumentSubmit);
router.get("/documents", listDocuments);
router.get("/events", listEvents);

module.exports = router;
