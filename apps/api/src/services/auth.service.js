const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { SiweMessage } = require("siwe");
const env = require("../config/env");
const { ROLES } = require("@umkmchain/shared");

const nonces = new Map();

const authSecret = () => env.authJwtSecret || "umkmchain-demo-secret";

const createNonce = (address, role) => {
  const nonce = crypto.randomBytes(16).toString("hex");
  nonces.set(address.toLowerCase(), { nonce, role, createdAt: Date.now() });
  return nonce;
};

const consumeNonce = (address) => {
  const key = address.toLowerCase();
  const item = nonces.get(key);
  nonces.delete(key);
  return item;
};

const getRoleFromResources = (resources = []) => {
  const roleResource = resources.find((resource) => resource.startsWith("urn:umkmchain:role:"));
  if (!roleResource) {
    return null;
  }

  return roleResource.split(":").pop();
};

const verifySiweMessage = async ({ message, signature }) => {
  const siweMessage = new SiweMessage(message);
  const nonceRecord = consumeNonce(siweMessage.address);

  if (!nonceRecord) {
    throw new Error("Nonce tidak ditemukan atau sudah kedaluwarsa");
  }

  const domain = siweMessage.domain || new URL(siweMessage.uri).host;
  const result = await siweMessage.verify({
    signature,
    domain,
    nonce: nonceRecord.nonce
  });

  if (!result.success) {
    throw new Error("SIWE verification failed");
  }

  const requestedRole = getRoleFromResources(siweMessage.resources || []);
  if (requestedRole && requestedRole !== nonceRecord.role) {
    throw new Error("Role tidak cocok dengan nonce request");
  }

  const role = requestedRole || nonceRecord.role;
  if (!Object.values(ROLES).includes(role)) {
    throw new Error("Role tidak valid");
  }

  const token = jwt.sign(
    {
      address: siweMessage.address,
      role,
      chainId: siweMessage.chainId,
      domain
    },
    authSecret(),
    { expiresIn: "7d" }
  );

  return {
    token,
    session: {
      address: siweMessage.address,
      role,
      chainId: siweMessage.chainId,
      domain,
      statement: siweMessage.statement
    }
  };
};

const verifyToken = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new Error("Authorization token missing");
  }

  const token = authorizationHeader.slice("Bearer ".length);
  return jwt.verify(token, authSecret());
};

const createDemoToken = (address, role) => {
  return jwt.sign(
    {
      address,
      role,
      chainId: 31337,
      domain: "localhost:3001"
    },
    authSecret(),
    { expiresIn: "7d" }
  );
};

const createToken = (address, role) => {
  return jwt.sign(
    {
      address,
      role,
      chainId: 31337,
      domain: "localhost:3001"
    },
    authSecret(),
    { expiresIn: "7d" }
  );
};

module.exports = {
  createNonce,
  verifySiweMessage,
  verifyToken,
  createDemoToken,
  createToken
};
