require("dotenv").config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/umkmchain",
  pinataJwt: process.env.PINATA_JWT || "",
  rpcUrl: process.env.RPC_URL || "",
  privateKey: process.env.PRIVATE_KEY || "",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  chainId: Number(process.env.CHAIN_ID || 11155111),
  authJwtSecret: process.env.AUTH_JWT_SECRET || "umkmchain-demo-secret"
};

module.exports = env;
