"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/components/glass-card";
import { apiClient } from "@/lib/api-client";
import { useRealtimeEvents } from "@/lib/use-realtime-events";
import { loadSession } from "@/lib/auth-session";

export default function LenderDashboardPage() {
  const [session, setSession] = useState(null);
  const [fundings, setFundings] = useState([]);
  const { events, connected } = useRealtimeEvents("LENDER");

  useEffect(() => {
    setSession(loadSession());

    apiClient
      .getFundingRequests()
      .then((payload) => {
        setFundings(payload.data || []);
      })
      .catch(() => {
        setFundings([]);
      });
  }, []);

  const activeDeals = useMemo(
    () => fundings.filter((item) => item.status === "APPROVED").length,
    [fundings]
  );

  const projectedRoi = useMemo(() => {
    if (!fundings.length) {
      return "13.8%";
    }

    const lowRisk = fundings.filter((item) => item.riskLevel === "LOW").length;
    const ratio = lowRisk / fundings.length;
    return `${(11 + ratio * 4).toFixed(1)}%`;
  }, [fundings]);

  if (!session || session.role !== "LENDER") {
    return (
      <main className="page-wrap pt-8">
        <GlassCard className="p-8 md:p-10">
          <p className="badge">Role Required</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Dashboard Lender</h1>
          <p className="mt-3 text-slate-600">
            Anda harus login dengan role LENDER untuk melihat pipeline pembiayaan dan event
            realtime.
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
        <p className="badge">Dashboard Lender</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Pipeline Pembiayaan UMKM</h1>
        <p className="mt-2 text-slate-600">
          Review reputasi on-chain, skor risiko, dan rekomendasi ROI sebelum approval.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="kpi-label">Available Capital</p>
            <p className="kpi-value">Rp4.8B</p>
          </div>
          <div>
            <p className="kpi-label">Active Deals</p>
            <p className="kpi-value">{activeDeals}</p>
          </div>
          <div>
            <p className="kpi-label">Projected ROI</p>
            <p className="kpi-value">{projectedRoi}</p>
          </div>
        </div>

        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-sky-700">
          Realtime stream: {connected ? "connected" : "disconnected"}
        </p>
      </GlassCard>

      <section className="grid gap-4">
        {fundings.map((item) => (
          <GlassCard key={item.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Funding #{item.id}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {item.msme || item.msmeId}
                </h2>
                <p className="text-sm text-slate-600">
                  Nilai: Rp{Number(item.amount || 0).toLocaleString("id-ID")} | Risk: {item.riskLevel} | Status: {item.status}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  Reject
                </button>
                <Link
                  href={`/funding/${item.id}`}
                  className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Review
                </Link>
              </div>
            </div>
          </GlassCard>
        ))}
      </section>

      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">Realtime Solidity Events (Lender)</h2>
        <div className="mt-4 space-y-3">
          {events.slice(0, 8).map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-sky-100 bg-white/70 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-wide text-sky-700">{event.contractEvent}</p>
              <p className="text-sm text-slate-700">
                Source: {event.source} | {new Date(event.createdAt).toLocaleTimeString("id-ID")}
              </p>
              <p className="text-xs text-slate-500">Payload: {JSON.stringify(event.payload)}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </main>
  );
}
