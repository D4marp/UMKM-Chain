const { FUNDING_STATUS } = require("@umkmchain/shared");
const { state } = require("../data/store");

const getKpis = () => {
  const totalFunding = state.fundingRequests.reduce((sum, item) => sum + item.amount, 0);
  const activeFinancing = state.fundingRequests.filter(
    (item) => item.status === FUNDING_STATUS.APPROVED
  ).length;
  const repaid = state.fundingRequests.filter((item) => item.status === FUNDING_STATUS.REPAID).length;
  const highRisk = state.fundingRequests.filter((item) => item.riskLevel === "HIGH").length;

  return {
    totalFunding,
    activeFinancing,
    repaid,
    highRisk
  };
};

const regulatorSummary = (_req, res) => {
  const kpis = getKpis();
  const fraudAlerts = state.fundingRequests
    .filter((item) => item.riskLevel === "HIGH")
    .map((item) => ({
      fundingId: item.id,
      msmeId: item.msmeId,
      reason: "High risk score detected"
    }));

  res.json({
    data: {
      ...kpis,
      totalTransactions: state.events.length,
      fraudAlerts
    }
  });
};

const lenderSummary = (_req, res) => {
  const approved = state.fundingRequests.filter((item) => item.status === FUNDING_STATUS.APPROVED);
  const totalApprovedAmount = approved.reduce((sum, item) => sum + item.amount, 0);

  res.json({
    data: {
      approvedDeals: approved.length,
      totalApprovedAmount,
      averageTicketSize: approved.length ? Math.round(totalApprovedAmount / approved.length) : 0,
      roiProjectionPercent: 14
    }
  });
};

const msmeSummary = (_req, res) => {
  const latestApplications = state.fundingRequests.slice(0, 5);
  const latestDocuments = state.documents.slice(0, 5);

  res.json({
    data: {
      profiles: state.umkmProfiles.length,
      latestApplications,
      latestDocuments
    }
  });
};

module.exports = {
  regulatorSummary,
  lenderSummary,
  msmeSummary
};
