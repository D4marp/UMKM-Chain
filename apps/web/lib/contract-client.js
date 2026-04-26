import { createWalletClient, custom, defineChain } from "viem";
import { UMKM_FINANCE_ABI } from "@/lib/umkmFinanceAbi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

const APP_CHAIN = defineChain({
  id: CHAIN_ID,
  name: CHAIN_ID === 31337 ? "Hardhat Local" : `EVM-${CHAIN_ID}`,
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"]
    },
    public: {
      http: ["http://127.0.0.1:8545"]
    }
  }
});

export const connectWallet = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask tidak ditemukan");
  }

  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  if (!account) {
    throw new Error("Gagal mengambil alamat wallet");
  }

  return account;
};

const getWalletClient = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask tidak ditemukan");
  }

  return createWalletClient({
    chain: APP_CHAIN,
    transport: custom(window.ethereum)
  });
};

const ensureContractAddress = () => {
  if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS belum diisi");
  }
};

const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;

const ensureWalletChain = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask tidak ditemukan");
  }

  const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
  if (Number.parseInt(currentChainId, 16) === CHAIN_ID) {
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }]
    });
  } catch (switchError) {
    // 4902 = chain not added in wallet yet.
    if (switchError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_ID_HEX,
            chainName: APP_CHAIN.name,
            rpcUrls: APP_CHAIN.rpcUrls.default.http,
            nativeCurrency: APP_CHAIN.nativeCurrency
          }
        ]
      });

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_ID_HEX }]
      });
      return;
    }

    throw new Error("Silakan switch MetaMask ke jaringan Hardhat Local (31337)");
  }
};

const writeContract = async ({ functionName, args }) => {
  ensureContractAddress();
  await ensureWalletChain();

  const account = await connectWallet();
  const walletClient = getWalletClient();

  const txHash = await walletClient.writeContract({
    account,
    chain: APP_CHAIN,
    address: CONTRACT_ADDRESS,
    abi: UMKM_FINANCE_ABI,
    functionName,
    args
  });

  return {
    walletAddress: account,
    txHash
  };
};

export const submitDocumentHashWithWallet = async (hash) => {
  return writeContract({
    functionName: "submitDocument",
    args: [hash]
  });
};

export const registerMsmeWithWallet = async (businessId) => {
  return writeContract({
    functionName: "registerMSME",
    args: [businessId]
  });
};

export const requestFundingWithWallet = async (amount) => {
  return writeContract({
    functionName: "requestFunding",
    args: [BigInt(amount)]
  });
};
