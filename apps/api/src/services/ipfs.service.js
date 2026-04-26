const crypto = require("crypto");
const env = require("../config/env");

const makeLocalDigest = ({ msmeId, fileName, fileContent }) => {
  const digest = crypto
    .createHash("sha256")
    .update(`${msmeId}:${fileName}:${fileContent}`)
    .digest("hex");

  return {
    digest,
    cid: `bafy${digest.slice(0, 40)}`
  };
};

const pinToPinata = async ({ msmeId, fileName, fileContent }) => {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.pinataJwt}`
    },
    body: JSON.stringify({
      pinataMetadata: {
        name: fileName,
        keyvalues: {
          msmeId,
          category: "invoice"
        }
      },
      pinataContent: {
        msmeId,
        fileName,
        fileContent,
        uploadedAt: new Date().toISOString()
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} ${details}`);
  }

  const result = await response.json();
  const digest = crypto.createHash("sha256").update(result.IpfsHash).digest("hex");

  return {
    cid: result.IpfsHash,
    uri: `ipfs://${result.IpfsHash}`,
    hash: digest,
    provider: "pinata"
  };
};

const storeDocument = async ({ msmeId, fileName, fileContent }) => {
  if (env.pinataJwt) {
    try {
      return await pinToPinata({ msmeId, fileName, fileContent });
    } catch (error) {
      console.error("Pinata unavailable, fallback to local digest:", error.message);
    }
  }

  const localDoc = makeLocalDigest({ msmeId, fileName, fileContent });
  return {
    cid: localDoc.cid,
    uri: `ipfs://${localDoc.cid}`,
    hash: localDoc.digest,
    provider: "local-mock"
  };
};

module.exports = {
  storeDocument
};
