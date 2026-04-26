export const heroStats = [
  { label: "UMKM Onboarded", value: "2,450+" },
  { label: "Active Financing", value: "Rp 32.8B" },
  { label: "Avg Settlement Time", value: "1m 46s" },
  { label: "Regulator Alerts", value: "12 live" }
];

export const fundingRequests = [
  {
    id: 1,
    msme: "Kopi Nusantara Makmur",
    amount: "Rp120.000.000",
    score: 78,
    status: "REQUESTED",
    roi: "14.2%"
  },
  {
    id: 2,
    msme: "Tenun Flores Sejahtera",
    amount: "Rp80.000.000",
    score: 74,
    status: "APPROVED",
    roi: "12.8%"
  },
  {
    id: 3,
    msme: "Agro Tani Cerdas",
    amount: "Rp95.000.000",
    score: 83,
    status: "REQUESTED",
    roi: "13.4%"
  }
];

export const regulatorPanels = [
  { title: "Total transaksi valid", value: "18.592" },
  { title: "Fraud alert aktif", value: "12" },
  { title: "Risk score menengah/tinggi", value: "28%" },
  { title: "Outstanding financing", value: "Rp11.2B" }
];

export const realtimeEvents = [
  { time: "10:02", event: "MSMERegistered", actor: "UMKM-001" },
  { time: "10:06", event: "DocumentUploaded", actor: "UMKM-003" },
  { time: "10:11", event: "FundingRequested", actor: "UMKM-004" },
  { time: "10:16", event: "FundingApproved", actor: "Lender-07" },
  { time: "10:20", event: "PaymentCompleted", actor: "UMKM-002" }
];

export const analyticsSeries = [
  { month: "Jan", financing: 420, repaid: 250, defaults: 12 },
  { month: "Feb", financing: 520, repaid: 290, defaults: 15 },
  { month: "Mar", financing: 690, repaid: 430, defaults: 13 },
  { month: "Apr", financing: 740, repaid: 510, defaults: 10 },
  { month: "Mei", financing: 860, repaid: 620, defaults: 9 },
  { month: "Jun", financing: 920, repaid: 710, defaults: 8 }
];
