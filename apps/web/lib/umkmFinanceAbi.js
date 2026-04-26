export const UMKM_FINANCE_ABI = [
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
  }
];
