const { CONTRACT_EVENTS, UMKM_FINANCE_ABI } = require("@umkmchain/shared");
const env = require("../config/env");
const eventBridge = require("./event-bridge.service");
const { markDocumentConfirmedByHash } = require("../data/store");

let stopWatching = null;

const normalizeArgs = (args) => {
  if (!args || typeof args !== "object") {
    return {};
  }

  const payload = {};
  for (const [key, value] of Object.entries(args)) {
    payload[key] = typeof value === "bigint" ? value.toString() : value;
  }
  return payload;
};

const handleDocumentUploaded = (eventPacket) => {
  const hash = eventPacket.payload?.hash;
  if (!hash) {
    return;
  }

  markDocumentConfirmedByHash(hash, {
    txHash: eventPacket.transactionHash,
    blockNumber: eventPacket.blockNumber,
    msmeWallet: eventPacket.payload?.msme
  });
};

const startContractEventBridge = async () => {
  if (!env.rpcUrl || !env.contractAddress) {
    console.log("Contract event bridge disabled: missing RPC_URL or CONTRACT_ADDRESS");
    return;
  }

  const { createPublicClient, http } = await import("viem");
  const client = createPublicClient({ transport: http(env.rpcUrl) });

  stopWatching = client.watchContractEvent({
    address: env.contractAddress,
    abi: UMKM_FINANCE_ABI,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const contractEvent = log.eventName;
        if (!contractEvent) {
          return;
        }

        const eventPacket = eventBridge.publish(contractEvent, normalizeArgs(log.args), {
          source: "onchain",
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber ? log.blockNumber.toString() : null
        });

        if (contractEvent === CONTRACT_EVENTS.DOCUMENT_UPLOADED) {
          handleDocumentUploaded(eventPacket);
        }
      });
    },
    onError: (error) => {
      console.error("Contract event bridge error:", error.message);
    }
  });

  console.log(`Contract event bridge active on ${env.contractAddress}`);
};

const stopContractEventBridge = () => {
  if (typeof stopWatching === "function") {
    stopWatching();
    stopWatching = null;
  }
};

module.exports = {
  startContractEventBridge,
  stopContractEventBridge
};
