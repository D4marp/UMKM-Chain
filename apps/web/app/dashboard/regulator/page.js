"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/glass-card";
import { apiClient } from "@/lib/api-client";
import { useRealtimeEvents } from "@/lib/use-realtime-events";
import { loadSession } from "@/lib/auth-session";

export default function RegulatorDashboardPage() {
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const { events, connected } = useRealtimeEvents("REGULATOR");

  useEffect(() => {
    setSession(loadSession());

    apiClient
      .getRegulatorSummary()
      .then((payload) => {
        setSummary(payload.data || null);
      })
      .catch(() => {
        setSummary(null);
      });
  }, []);

  const panels = useMemo(() => {
    if (!summary) {
      return [
        { title: "Total transaksi", value: "-" },
        { title: "Fraud alert aktif", value: "-" },
        { title: "Active financing", value: "-" },
        { title: "Risk monitoring", value: "-" }
      ];
    }

    return [
      { title: "Total transaksi", value: summary.totalTransactions ?? 0 },
      { title: "Fraud alert aktif", value: summary.fraudAlerts?.length ?? 0 },
      { title: "Active financing", value: summary.activeFinancing ?? 0 },
      { title: "Risk monitoring", value: `${summary.highRisk ?? 0} high risk` }
    ];
  }, [summary]);

  if (!session || session.role !== "REGULATOR") {
    return (
      <main className="page-wrap pt-8">
        <GlassCard className="p-8 md:p-10">
          <p className="badge">Role Required</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Regulator Dashboard</h1>
          <p className="mt-3 text-slate-600">
            Anda harus login dengan role REGULATOR untuk mengakses monitoring dashboard.
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
        <p className="badge">OJK Style Monitoring Center</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Regulator Supervision Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Memantau transparansi transaksi, eksposur risiko, dan fraud signals real-time.
        </p>

        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-sky-700">
          Realtime stream: {connected ? "connected" : "disconnected"}
        </p>
      </GlassCard>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {panels.map((item) => (
          <GlassCard key={item.title} className="p-5">
            <p className="kpi-label">{item.title}</p>
            <p className="kpi-value mt-2">{item.value}</p>
          </GlassCard>
        ))}
      </section>

      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">Realtime Ledger Events</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {events.slice(0, 10).map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-sky-100 bg-white/70 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-wide text-sky-700">
                {new Date(event.createdAt).toLocaleTimeString("id-ID")}
              </p>
              <p className="text-sm font-semibold text-slate-900">{event.contractEvent}</p>
              <p className="text-sm text-slate-600">Source: {event.source}</p>
              <p className="text-xs text-slate-500">Payload: {JSON.stringify(event.payload)}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </main>
  );
}
