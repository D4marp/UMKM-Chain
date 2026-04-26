const UMKM_FINANCE_ABI = [
  {
    type: "function",
    name: "registerMSME",
    stateMutability: "nonpayable",
    inputs: [{ name: "businessId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "submitDocument",
    stateMutability: "nonpayable",
    inputs: [{ name: "hash", type: "string" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "requestFunding",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "event",
    name: "MSMERegistered",
    inputs: [
      { indexed: true, name: "msme", type: "address" },
      { indexed: false, name: "businessId", type: "string" },
      { indexed: false, name: "initialCreditScore", type: "uint256" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "DocumentUploaded",
    inputs: [
      { indexed: true, name: "documentId", type: "uint256" },
      { indexed: true, name: "msme", type: "address" },
      { indexed: false, name: "hash", type: "string" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "FundingRequested",
    inputs: [
      { indexed: true, name: "fundingId", type: "uint256" },
      { indexed: true, name: "msme", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "FundingApproved",
    inputs: [
      { indexed: true, name: "fundingId", type: "uint256" },
      { indexed: true, name: "lender", type: "address" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PaymentCompleted",
    inputs: [
      { indexed: true, name: "fundingId", type: "uint256" },
      { indexed: true, name: "msme", type: "address" }
    ],
    anonymous: false
  }
];

module.exports = {
  UMKM_FINANCE_ABI
};
