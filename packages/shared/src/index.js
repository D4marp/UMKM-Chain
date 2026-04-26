const ROLES = Object.freeze({
  MSME: "MSME",
  LENDER: "LENDER",
  REGULATOR: "REGULATOR"
});

const CONTRACT_EVENTS = Object.freeze({
  MSME_REGISTERED: "MSMERegistered",
  DOCUMENT_UPLOADED: "DocumentUploaded",
  FUNDING_REQUESTED: "FundingRequested",
  FUNDING_APPROVED: "FundingApproved",
  PAYMENT_COMPLETED: "PaymentCompleted"
});

const FUNDING_STATUS = Object.freeze({
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REPAID: "REPAID"
});

const { UMKM_FINANCE_ABI } = require("./umkmFinanceAbi");

module.exports = {
  ROLES,
  CONTRACT_EVENTS,
  FUNDING_STATUS,
  UMKM_FINANCE_ABI
};
