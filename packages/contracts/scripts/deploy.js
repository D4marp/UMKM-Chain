const hre = require("hardhat");

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  const UMKMFinance = await hre.ethers.getContractFactory("UMKMFinance");
  const contract = await UMKMFinance.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("UMKMFinance deployed to:", address);
  console.log("CHAIN_ID:", network.chainId.toString());
  console.log("Set CONTRACT_ADDRESS and NEXT_PUBLIC_CONTRACT_ADDRESS to this address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
