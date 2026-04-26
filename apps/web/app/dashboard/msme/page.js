"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/glass-card";
import { apiClient } from "@/lib/api-client";
import { loadSession } from "@/lib/auth-session";

export default function MsmeDashboardPage() {
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({
    msmeId: "UMKM-001",
    fileName: "",
    fileContent: ""
  });
  const [registerForm, setRegisterForm] = useState({
    businessId: "UMKM-001",
    businessName: "Kopi Nusantara Makmur",
    owner: "Siti Rahmawati",
    city: "Bandung",
    sector: "F&B"
  });
  const [fundingForm, setFundingForm] = useState({
    msmeId: "UMKM-001",
    amount: "120000000",
    tenorMonths: "12",
    purpose: "Pembelian mesin roasting baru"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState([]);

  const docsCount = useMemo(() => documents.length + 30, [documents]);

  useEffect(() => {
    setSession(loadSession());

    apiClient
      .getDocuments("UMKM-001")
      .then((payload) => {
        setDocuments(payload.data || []);
      })
      .catch(() => {
        setDocuments([]);
      });
  }, []);

  const onInput = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onRegisterInput = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFundingInput = (event) => {
    const { name, value } = event.target;
    setFundingForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileRead = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const content = await file.text();
    setForm((prev) => ({
      ...prev,
      fileName: file.name,
      fileContent: content.slice(0, 100000)
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await apiClient.uploadInvoice({
        msmeId: form.msmeId,
        fileName: form.fileName,
        fileContent: form.fileContent
      });

      if (response.data) {
        const docsPayload = await apiClient.getDocuments(form.msmeId);
        setDocuments(docsPayload.data || []);

        const statusLabel = response.data.blockchainStatus || "UNKNOWN";
        setMessage(`Invoice berhasil diupload ke IPFS. Status blockchain: ${statusLabel}.`);
      }

      setForm((prev) => ({ ...prev, fileName: "", fileContent: "" }));
    } catch (error) {
      setMessage(`Gagal upload invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await apiClient.registerMsme({
        ...registerForm
      });
      setSession((prev) => (prev ? { ...prev, role: "MSME" } : prev));
      setMessage("UMKM berhasil terdaftar di dashboard backend tanpa transaksi wallet.");
    } catch (error) {
      setMessage(`Gagal register UMKM: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRequestFunding = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await apiClient.confirmFundingRequest({
        msmeId: fundingForm.msmeId,
        amount: Number(fundingForm.amount),
        tenorMonths: Number(fundingForm.tenorMonths),
        purpose: fundingForm.purpose
      });

      setMessage("Request funding berhasil dibuat di dashboard lender tanpa transaksi wallet.");
    } catch (error) {
      setMessage(`Gagal request funding: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.role !== "MSME") {
    return (
      <main className="page-wrap pt-8">
        <GlassCard className="p-8 md:p-10">
          <p className="badge">Role Required</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Dashboard MSME</h1>
          <p className="mt-3 text-slate-600">
            Anda harus login dengan role MSME untuk mengakses register usaha, funding request,
            dan invoice upload.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ke halaman login
          </Link>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="page-wrap space-y-6 pt-8">
      <GlassCard className="p-6 md:p-8">
        <p className="badge">Dashboard MSME</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Kopi Nusantara Makmur</h1>
        <p className="mt-3 text-slate-600">
          Profil usaha, dokumen IPFS, status smart contract, dan riwayat pendanaan.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="kpi-label">Credit Score</p>
            <p className="kpi-value">78</p>
          </div>
          <div>
            <p className="kpi-label">Outstanding Funding</p>
            <p className="kpi-value">Rp120jt</p>
          </div>
          <div>
            <p className="kpi-label">Documents On-Chain</p>
            <p className="kpi-value">{docsCount}</p>
          </div>
          <div>
            <p className="kpi-label">Repayment Progress</p>
            <p className="kpi-value">68%</p>
          </div>
        </div>
      </GlassCard>

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Register UMKM on-chain</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sinkronisasi data UMKM untuk dashboard (tanpa transaksi MetaMask).
          </p>

          <form className="mt-4 space-y-3" onSubmit={onRegister}>
            <input name="businessId" value={registerForm.businessId} onChange={onRegisterInput} className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm" placeholder="Business ID" required />
            <input name="businessName" value={registerForm.businessName} onChange={onRegisterInput} className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm" placeholder="Nama UMKM" required />
            <input name="owner" value={registerForm.owner} onChange={onRegisterInput} className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm" placeholder="Nama pemilik" required />
            <div className="grid gap-3 md:grid-cols-2">
              <input name="city" value={registerForm.city} onChange={onRegisterInput} className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm" placeholder="Kota" required />
              <input name="sector" value={registerForm.sector} onChange={onRegisterInput} className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm" placeholder="Sektor" required />
            </div>
            <button type="submit" disabled={loading} className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Registering..." : "Register UMKM"}
            </button>
          </form>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Ajukan Pembiayaan</h2>
          <p className="mt-2 text-sm text-slate-600">
            Simulasi request funding untuk pipeline lender (tanpa transaksi MetaMask).
          </p>

          <form className="mt-4 space-y-3" onSubmit={onRequestFunding}>
            <input name="msmeId" value={fundingForm.msmeId} onChange={onFundingInput} className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm" placeholder="MSME ID" required />
            <div className="grid gap-3 md:grid-cols-2">
              <input name="amount" type="number" value={fundingForm.amount} onChange={onFundingInput} className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm" placeholder="Jumlah pembiayaan" required />
              <input name="tenorMonths" type="number" value={fundingForm.tenorMonths} onChange={onFundingInput} className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm" placeholder="Tenor (bulan)" required />
            </div>
            <textarea name="purpose" value={fundingForm.purpose} onChange={onFundingInput} rows={3} className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm" placeholder="Tujuan pembiayaan" required />
            <button type="submit" disabled={loading} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Submitting..." : "Request Funding"}
            </button>
          </form>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Upload Dokumen ke IPFS</h2>
          <p className="mt-2 text-sm text-slate-600">
            Alur: pilih invoice {"->"} pin ke IPFS {"->"} simpan status blockchain (tanpa popup wallet).
          </p>

          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <input
              name="msmeId"
              value={form.msmeId}
              onChange={onInput}
              className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm"
              placeholder="MSME ID"
              required
            />

            <input
              type="file"
              accept=".pdf,.csv,.txt,.json,.xlsx"
              onChange={onFileRead}
              className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm"
              required
            />

            <textarea
              name="fileContent"
              value={form.fileContent}
              onChange={onInput}
              rows={4}
              className="w-full rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 text-sm"
              placeholder="Konten file akan terisi otomatis setelah memilih file"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Mengirim ke IPFS..." : "Upload Invoice"}
            </button>
          </form>

          {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Riwayat Dokumen On-Chain</h2>
          <div className="mt-4 space-y-3">
            {documents.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-sky-100 bg-white/70 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-900">{item.fileName}</p>
                <p className="text-xs text-slate-500">Hash: {item.ipfsHash}</p>
                <p className="text-xs text-slate-500">Mode: {item.submissionMode || "n/a"}</p>
                <p className="mt-1 text-xs font-semibold text-sky-700">
                  Status: {item.blockchainStatus || "UNKNOWN"}
                </p>
                {item.chainTxHash ? (
                  <p className="text-xs text-emerald-700">Tx: {item.chainTxHash}</p>
                ) : null}
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}
