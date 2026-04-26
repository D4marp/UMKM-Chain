"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/glass-card";
import { heroStats, realtimeEvents } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <main className="page-wrap space-y-8 pt-8">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="glass-card overflow-hidden p-8 md:p-12"
      >
        <p className="badge mb-4">KARISMA OJK 2026 Demo Product</p>
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Empowering MSMEs through Event-Driven Blockchain and IPFS Ecosystems
            </h1>
            <p className="mt-4 max-w-2xl text-slate-600">
              UMKMChain menghadirkan pembiayaan digital transparan untuk UMKM Indonesia
              lewat identitas usaha on-chain, dokumen IPFS, smart contract automation,
              dan dashboard regulator real-time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Connect Wallet
              </Link>
              <Link
                href="/dashboard/regulator"
                className="rounded-full border border-sky-200 bg-white px-5 py-2.5 text-sm font-semibold text-sky-700"
              >
                Lihat Regulator Dashboard
              </Link>
            </div>
          </div>

          <GlassCard className="p-5">
            <h2 className="text-xl font-semibold text-slate-800">Realtime Event Feed</h2>
            <div className="mt-4 space-y-3">
              {realtimeEvents.map((item) => (
                <div
                  key={`${item.time}-${item.event}`}
                  className="rounded-2xl border border-sky-100 bg-white/70 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                    {item.time}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{item.event}</p>
                  <p className="text-sm text-slate-600">{item.actor}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {heroStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <GlassCard className="p-5">
              <p className="kpi-label">{stat.label}</p>
              <p className="kpi-value mt-2 text-slate-900">{stat.value}</p>
            </GlassCard>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
