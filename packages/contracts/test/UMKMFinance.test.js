const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UMKMFinance", function () {
  async function deployFixture() {
    const [owner, msme, lender] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("UMKMFinance");
    const contract = await Factory.deploy();
    return { contract, owner, msme, lender };
  }

  it("registers MSME and requests funding", async function () {
    const { contract, msme } = await deployFixture();

    await expect(contract.connect(msme).registerMSME("UMKM-001"))
      .to.emit(contract, "MSMERegistered")
      .withArgs(msme.address, "UMKM-001", 50);

    await expect(contract.connect(msme).requestFunding(ethers.parseEther("1")))
      .to.emit(contract, "FundingRequested")
      .withArgs(1, msme.address, ethers.parseEther("1"));
  });

  it("approves and repays funding", async function () {
    const { contract, msme, lender } = await deployFixture();

    await contract.connect(msme).registerMSME("UMKM-002");
    await contract.connect(msme).requestFunding(ethers.parseEther("1"));

    await expect(
      contract.connect(lender).approveFunding(1, { value: ethers.parseEther("1") })
    )
      .to.emit(contract, "FundingApproved")
      .withArgs(1, lender.address);

    await expect(
      contract.connect(msme).repayLoan(1, { value: ethers.parseEther("1") })
    )
      .to.emit(contract, "PaymentCompleted")
      .withArgs(1, msme.address);
  });
});
