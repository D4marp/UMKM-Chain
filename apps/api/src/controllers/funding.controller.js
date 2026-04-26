const { z } = require("zod");
const { CONTRACT_EVENTS, FUNDING_STATUS } = require("@umkmchain/shared");
const {
  state,
  addDocument,
  updateDocumentStatus
} = require("../data/store");
const eventBridge = require("../services/event-bridge.service");
const ipfsService = require("../services/ipfs.service");
const contractService = require("../services/contract.service");

const fundingRequestSchema = z.object({
  msmeId: z.string().min(1),
  amount: z.coerce.number().positive(),
  tenorMonths: z.coerce.number().int().positive(),
  purpose: z.string().min(5)
});

const approveSchema = z.object({
  lenderWallet: z.string().min(8)
});

const uploadDocSchema = z.object({
  msmeId: z.string().min(1),
  fileName: z.string().min(1),
  fileContent: z.string().min(1),
  walletAddress: z.string().min(8).optional()
});

const registerMsmeSchema = z.object({
  businessId: z.string().min(1),
  businessName: z.string().min(2),
  owner: z.string().min(2),
  city: z.string().min(2),
  sector: z.string().min(2),
  walletAddress: z.string().min(8).optional()
});

const requestFundingConfirmSchema = z.object({
  msmeId: z.string().min(1),
  amount: z.coerce.number().positive(),
  tenorMonths: z.coerce.number().int().positive(),
  purpose: z.string().min(5),
  walletAddress: z.string().min(8).optional(),
  txHash: z.string().min(8).optional()
});

const browserSubmitSchema = z.object({
  txHash: z.string().min(8),
  walletAddress: z.string().min(8).optional()
});

const getRiskLevel = (amount, creditScore) => {
  if (creditScore >= 80 && amount <= 100000000) {
    return "LOW";
  }
  if (creditScore >= 70 && amount <= 150000000) {
    return "MEDIUM";
  }
  return "HIGH";
};

const listFundingRequests = (_req, res) => {
  res.json({
    data: state.fundingRequests,
    total: state.fundingRequests.length
  });
};

const requestFunding = (req, res) => {
  const parseResult = fundingRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const payload = parseResult.data;
  const profile = state.umkmProfiles.find((item) => item.id === payload.msmeId);
  if (!profile) {
    return res.status(404).json({ error: "UMKM profile not found" });
  }

  const nextId = state.fundingRequests.length
    ? Math.max(...state.fundingRequests.map((item) => item.id)) + 1
    : 1;

  const requestItem = {
    id: nextId,
    msmeId: payload.msmeId,
    amount: payload.amount,
    tenorMonths: payload.tenorMonths,
    purpose: payload.purpose,
    status: FUNDING_STATUS.REQUESTED,
    riskLevel: getRiskLevel(payload.amount, profile.creditScore),
    createdAt: new Date().toISOString()
  };

  state.fundingRequests.unshift(requestItem);

  const eventPayload = eventBridge.publish(CONTRACT_EVENTS.FUNDING_REQUESTED, {
    fundingId: nextId,
    msmeId: payload.msmeId,
    amount: payload.amount
  });

  return res.status(201).json({ data: requestItem, event: eventPayload });
};

const registerMsme = (req, res) => {
  const parseResult = registerMsmeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const payload = parseResult.data;
  const walletAddress = payload.walletAddress || req.user?.address || "system";
  const existingProfile = state.umkmProfiles.find((item) => item.id === payload.businessId);
  const nextProfile = {
    id: payload.businessId,
    businessName: payload.businessName,
    owner: payload.owner,
    city: payload.city,
    sector: payload.sector,
    annualRevenue: existingProfile?.annualRevenue || 0,
    creditScore: existingProfile?.creditScore || 50,
    walletAddress,
    registeredAt: new Date().toISOString()
  };

  if (existingProfile) {
    Object.assign(existingProfile, nextProfile);
  } else {
    state.umkmProfiles.unshift(nextProfile);
  }

  const eventPayload = eventBridge.publish(CONTRACT_EVENTS.MSME_REGISTERED, {
    msmeId: payload.businessId,
    businessName: payload.businessName,
    walletAddress
  }, {
    source: "ui-sync"
  });

  return res.status(201).json({ data: nextProfile, event: eventPayload });
};

const confirmFundingRequest = (req, res) => {
  const parseResult = requestFundingConfirmSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const payload = parseResult.data;
  const walletAddress = payload.walletAddress || req.user?.address || "system";
  const profile = state.umkmProfiles.find((item) => item.id === payload.msmeId);
  if (!profile) {
    return res.status(404).json({ error: "UMKM profile not found" });
  }

  const existing = state.fundingRequests.find(
    (item) => item.msmeId === payload.msmeId && item.amount === payload.amount && item.purpose === payload.purpose
  );

  if (existing) {
    existing.walletAddress = walletAddress;
    existing.txHash = payload.txHash || existing.txHash || null;
    existing.status = FUNDING_STATUS.REQUESTED;
    return res.status(200).json({ data: existing });
  }

  const nextId = state.fundingRequests.length
    ? Math.max(...state.fundingRequests.map((item) => item.id)) + 1
    : 1;

  const requestItem = {
    id: nextId,
    msmeId: payload.msmeId,
    amount: payload.amount,
    tenorMonths: payload.tenorMonths,
    purpose: payload.purpose,
    walletAddress,
    txHash: payload.txHash || null,
    status: FUNDING_STATUS.REQUESTED,
    riskLevel: getRiskLevel(payload.amount, profile.creditScore),
    createdAt: new Date().toISOString(),
    source: "ui-sync"
  };

  state.fundingRequests.unshift(requestItem);

  return res.status(201).json({ data: requestItem });
};

const approveFunding = (req, res) => {
  const id = Number(req.params.id);
  const parseResult = approveSchema.safeParse(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid funding id" });
  }

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const requestItem = state.fundingRequests.find((item) => item.id === id);
  if (!requestItem) {
    return res.status(404).json({ error: "Funding request not found" });
  }

  requestItem.status = FUNDING_STATUS.APPROVED;
  requestItem.approvedBy = parseResult.data.lenderWallet;
  requestItem.approvedAt = new Date().toISOString();

  const eventPayload = eventBridge.publish(CONTRACT_EVENTS.FUNDING_APPROVED, {
    fundingId: id,
    lenderWallet: parseResult.data.lenderWallet,
    msmeId: requestItem.msmeId
  });

  return res.json({ data: requestItem, event: eventPayload });
};

const repayFunding = (req, res) => {
  const id = Number(req.params.id);
  const requestItem = state.fundingRequests.find((item) => item.id === id);

  if (!requestItem) {
    return res.status(404).json({ error: "Funding request not found" });
  }

  requestItem.status = FUNDING_STATUS.REPAID;
  requestItem.repaidAt = new Date().toISOString();

  const eventPayload = eventBridge.publish(CONTRACT_EVENTS.PAYMENT_COMPLETED, {
    fundingId: id,
    msmeId: requestItem.msmeId
  });

  return res.json({ data: requestItem, event: eventPayload });
};

const uploadDocument = async (req, res) => {
  const parseResult = uploadDocSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const payload = parseResult.data;
  const profile = state.umkmProfiles.find((item) => item.id === payload.msmeId);

  if (!profile) {
    return res.status(404).json({ error: "UMKM profile not found" });
  }

  const ipfsDoc = await ipfsService.storeDocument(payload);
  const documentItem = {
    id: state.documents.length + 1,
    msmeId: payload.msmeId,
    fileName: payload.fileName,
    ipfsHash: ipfsDoc.hash,
    ipfsUri: ipfsDoc.uri,
    ipfsProvider: ipfsDoc.provider,
    blockchainStatus: "PENDING",
    chainTxHash: null,
    chainBlockNumber: null,
    onChainWallet: payload.walletAddress || null,
    uploadedAt: new Date().toISOString()
  };

  addDocument(documentItem);

  const pinnedEvent = eventBridge.publish(CONTRACT_EVENTS.DOCUMENT_UPLOADED, {
    documentId: documentItem.id,
    msmeId: payload.msmeId,
    hash: ipfsDoc.hash,
    provider: ipfsDoc.provider,
    stage: "PINNED"
  });

  try {
    const chainResult = await contractService.submitDocumentHash({
      hash: ipfsDoc.hash,
      walletAddress: payload.walletAddress
    });

    const status = chainResult.txHash ? "SUBMITTED" : chainResult.status;
    const updatedDocument = updateDocumentStatus(documentItem.id, {
      blockchainStatus: status,
      chainTxHash: chainResult.txHash,
      chainBlockNumber: chainResult.blockNumber,
      submittedAt: new Date().toISOString(),
      submissionMode: chainResult.mode
    });

    const chainEvent = eventBridge.publish(CONTRACT_EVENTS.DOCUMENT_UPLOADED, {
      documentId: documentItem.id,
      msmeId: payload.msmeId,
      hash: ipfsDoc.hash,
      stage: "CHAIN_SUBMITTED",
      txHash: chainResult.txHash,
      mode: chainResult.mode
    });

    return res.status(201).json({
      data: updatedDocument,
      events: [pinnedEvent, chainEvent]
    });
  } catch (error) {
    const failedDocument = updateDocumentStatus(documentItem.id, {
      blockchainStatus: "FAILED",
      chainError: error.message
    });

    const failedEvent = eventBridge.publish(CONTRACT_EVENTS.DOCUMENT_UPLOADED, {
      documentId: documentItem.id,
      msmeId: payload.msmeId,
      hash: ipfsDoc.hash,
      stage: "CHAIN_FAILED",
      error: error.message
    });

    return res.status(500).json({
      error: "Failed to submit document hash to smart contract",
      details: error.message,
      data: failedDocument,
      event: failedEvent
    });
  }
};

const listEvents = (_req, res) => {
  res.json({ data: state.events, total: state.events.length });
};

const listDocuments = (req, res) => {
  const msmeId = req.query.msmeId;
  const records = msmeId
    ? state.documents.filter((item) => item.msmeId === msmeId)
    : state.documents;

  res.json({
    data: records,
    total: records.length
  });
};

const confirmBrowserDocumentSubmit = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid document id" });
  }

  const parseResult = browserSubmitSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const doc = state.documents.find((item) => item.id === id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }

  const updates = {
    blockchainStatus: "SUBMITTED",
    chainTxHash: parseResult.data.txHash,
    submissionMode: "browser-wallet",
    submittedAt: new Date().toISOString(),
    onChainWallet: parseResult.data.walletAddress || doc.onChainWallet || null
  };

  const updated = updateDocumentStatus(id, updates);

  const eventPayload = eventBridge.publish(CONTRACT_EVENTS.DOCUMENT_UPLOADED, {
    documentId: id,
    msmeId: doc.msmeId,
    hash: doc.ipfsHash,
    stage: "CHAIN_SUBMITTED_BROWSER",
    txHash: parseResult.data.txHash,
    walletAddress: updates.onChainWallet
  });

  return res.json({ data: updated, event: eventPayload });
};

module.exports = {
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
};
