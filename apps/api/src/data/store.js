const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { getFundingRequests, getUmkmProfiles } = require("@umkmchain/seed-data");

const seedUsers = [
  {
    email: "demo-msme@umkmchain.local",
    password: "DemoMSME123!",
    role: "MSME",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  },
  {
    email: "demo-lender@umkmchain.local",
    password: "DemoLENDER123!",
    role: "LENDER",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  },
  {
    email: "demo-regulator@umkmchain.local",
    password: "DemoREGULATOR123!",
    role: "REGULATOR",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  }
].map((user) => ({
  id: crypto.randomUUID(),
  email: user.email,
  password: bcrypt.hashSync(user.password, 10),
  role: user.role,
  address: user.address,
  createdAt: new Date().toISOString(),
  demoAccount: true
}));

const state = {
  users: seedUsers,
  umkmProfiles: getUmkmProfiles(),
  fundingRequests: getFundingRequests(),
  documents: [],
  events: []
};

const addEvent = (eventPayload) => {
  state.events.unshift(eventPayload);
  state.events = state.events.slice(0, 100);
};

const addDocument = (documentPayload) => {
  state.documents.unshift(documentPayload);
  return documentPayload;
};

const updateDocumentStatus = (documentId, updates) => {
  const document = state.documents.find((item) => item.id === documentId);
  if (!document) {
    return null;
  }

  Object.assign(document, updates);
  return document;
};

const markDocumentConfirmedByHash = (ipfsHash, chainMetadata) => {
  const document = state.documents.find((item) => item.ipfsHash === ipfsHash);
  if (!document) {
    return null;
  }

  document.blockchainStatus = "CONFIRMED";
  document.chainTxHash = chainMetadata.txHash || document.chainTxHash || null;
  document.chainBlockNumber = chainMetadata.blockNumber || document.chainBlockNumber || null;
  document.onChainWallet = chainMetadata.msmeWallet || document.onChainWallet || null;
  document.confirmedAt = new Date().toISOString();
  return document;
};

module.exports = {
  state,
  addEvent,
  addDocument,
  updateDocumentStatus,
  markDocumentConfirmedByHash
};
