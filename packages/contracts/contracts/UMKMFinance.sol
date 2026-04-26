// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract UMKMFinance {
    struct MSME {
        address wallet;
        string businessId;
        uint256 creditScore;
        bool exists;
    }

    struct Document {
        uint256 id;
        address msme;
        string ipfsHash;
        uint256 uploadedAt;
    }

    struct FundingRequest {
        uint256 id;
        address msme;
        uint256 amount;
        bool approved;
        bool repaid;
        uint256 createdAt;
        address lender;
    }

    address public owner;
    uint256 private nextDocumentId = 1;
    uint256 private nextFundingId = 1;

    mapping(address => MSME) public msmes;
    mapping(uint256 => Document) public documents;
    mapping(uint256 => FundingRequest) public fundingRequests;
    mapping(address => uint256[]) public msmeFundingIds;

    event MSMERegistered(address indexed msme, string businessId, uint256 initialCreditScore);
    event DocumentUploaded(uint256 indexed documentId, address indexed msme, string hash);
    event FundingRequested(uint256 indexed fundingId, address indexed msme, uint256 amount);
    event FundingApproved(uint256 indexed fundingId, address indexed lender);
    event PaymentCompleted(uint256 indexed fundingId, address indexed msme);
    event CreditScoreUpdated(address indexed msme, uint256 newCreditScore);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyRegisteredMSME() {
        require(msmes[msg.sender].exists, "MSME not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerMSME(string calldata businessId) external {
        require(bytes(businessId).length > 0, "Business ID required");
        require(!msmes[msg.sender].exists, "MSME already registered");

        msmes[msg.sender] = MSME({
            wallet: msg.sender,
            businessId: businessId,
            creditScore: 50,
            exists: true
        });

        emit MSMERegistered(msg.sender, businessId, 50);
    }

    function submitDocument(string calldata hash) external onlyRegisteredMSME returns (uint256) {
        require(bytes(hash).length > 0, "Document hash required");

        uint256 documentId = nextDocumentId;
        documents[documentId] = Document({
            id: documentId,
            msme: msg.sender,
            ipfsHash: hash,
            uploadedAt: block.timestamp
        });
        nextDocumentId += 1;

        emit DocumentUploaded(documentId, msg.sender, hash);
        return documentId;
    }

    function requestFunding(uint256 amount) external onlyRegisteredMSME returns (uint256) {
        require(amount > 0, "Amount must be > 0");

        uint256 fundingId = nextFundingId;
        fundingRequests[fundingId] = FundingRequest({
            id: fundingId,
            msme: msg.sender,
            amount: amount,
            approved: false,
            repaid: false,
            createdAt: block.timestamp,
            lender: address(0)
        });
        msmeFundingIds[msg.sender].push(fundingId);
        nextFundingId += 1;

        emit FundingRequested(fundingId, msg.sender, amount);
        return fundingId;
    }

    function approveFunding(uint256 id) external payable {
        FundingRequest storage funding = fundingRequests[id];

        require(funding.id != 0, "Funding not found");
        require(!funding.approved, "Already approved");
        require(!funding.repaid, "Already repaid");
        require(msg.value == funding.amount, "Incorrect amount sent");

        funding.approved = true;
        funding.lender = msg.sender;

        payable(funding.msme).transfer(msg.value);

        emit FundingApproved(id, msg.sender);
    }

    function repayLoan(uint256 id) external payable onlyRegisteredMSME {
        FundingRequest storage funding = fundingRequests[id];

        require(funding.id != 0, "Funding not found");
        require(funding.msme == msg.sender, "Not funding owner");
        require(funding.approved, "Funding not approved");
        require(!funding.repaid, "Already repaid");
        require(msg.value == funding.amount, "Repayment amount mismatch");

        funding.repaid = true;
        payable(funding.lender).transfer(msg.value);

        emit PaymentCompleted(id, msg.sender);
    }

    function updateCreditScore(address msme, uint256 score) external onlyOwner {
        require(msmes[msme].exists, "MSME not registered");
        require(score <= 100, "Score must be <= 100");

        msmes[msme].creditScore = score;
        emit CreditScoreUpdated(msme, score);
    }

    function getFundingIdsByMSME(address msme) external view returns (uint256[] memory) {
        return msmeFundingIds[msme];
    }
}
