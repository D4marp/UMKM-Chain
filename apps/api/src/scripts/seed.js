const fs = require("fs");
const path = require("path");
const { getUmkmProfiles, getFundingRequests } = require("@umkmchain/seed-data");

const outputPath = path.join(__dirname, "..", "data", "seed.snapshot.json");

const payload = {
  generatedAt: new Date().toISOString(),
  umkmProfiles: getUmkmProfiles(),
  fundingRequests: getFundingRequests()
};

fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

console.log(`Seed snapshot generated at ${outputPath}`);
console.log(`UMKM profiles: ${payload.umkmProfiles.length}`);
console.log(`Funding requests: ${payload.fundingRequests.length}`);
