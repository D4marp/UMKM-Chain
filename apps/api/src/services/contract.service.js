const { createWalletClient, createPublicClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { UMKM_FINANCE_ABI } = require("@umkmchain/shared");
const env = require("../config/env");

const hasWalletMode = Boolean(env.privateKey && env.rpcUrl && env.contractAddress);
const hasBrowserWalletMode = Boolean(env.contractAddress);

const submitDocumentHash = async ({ hash, walletAddress }) => {
  if (!hash) {
    throw new Error("Document hash is required");
  }

  // No wallet address means UI requested no-wallet mode, so skip on-chain tx.
  if (!walletAddress) {
    return {
      txHash: null,
      status: "SIMULATED",
      blockNumber: null,
      mode: "mock"
    };
  }

  // Prefer browser wallet flow when caller wallet is provided so the tx sender
  // stays aligned with the MSME wallet used during on-chain registration.
  if (hasBrowserWalletMode && walletAddress) {
    return {
      txHash: null,
      status: "PENDING_BROWSER_SIGNATURE",
      blockNumber: null,
      mode: "browser-wallet"
    };
  }

  if (hasWalletMode) {
    const account = privateKeyToAccount(env.privateKey.startsWith("0x") ? env.privateKey : `0x${env.privateKey}`);
    const chain = {
      id: env.chainId,
      name: "Configured Chain",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: { http: [env.rpcUrl] },
        public: { http: [env.rpcUrl] }
      }
    };

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(env.rpcUrl)
    });

    const publicClient = createPublicClient({
      chain,
      transport: http(env.rpcUrl)
    });

    const txHash = await walletClient.writeContract({
      address: env.contractAddress,
      abi: UMKM_FINANCE_ABI,
      functionName: "submitDocument",
      args: [hash]
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    return {
      txHash,
      status: receipt.status,
      blockNumber: receipt.blockNumber ? receipt.blockNumber.toString() : null,
      mode: "server-wallet"
    };
  }

  return {
    txHash: null,
    status: "SIMULATED",
    blockNumber: null,
    mode: "mock"
  };
};

module.exports = {
  submitDocumentHash
};
