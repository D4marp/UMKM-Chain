const fs = require("fs");
const path = require("path");

const loadJson = (fileName) => {
  const fullPath = path.join(__dirname, "..", "data", fileName);
  const content = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(content);
};

const getUmkmProfiles = () => loadJson("umkm-indonesia.json");
const getFundingRequests = () => loadJson("funding-requests.json");

module.exports = {
  getUmkmProfiles,
  getFundingRequests
};
