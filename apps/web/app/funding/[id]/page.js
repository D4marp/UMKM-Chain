import Link from "next/link";
import GlassCard from "@/components/glass-card";
import { fundingRequests, realtimeEvents } from "@/lib/demo-data";

export default function FundingDetailPage({ params }) {
  const fundingId = Number(params.id);
  const funding = fundingRequests.find((item) => item.id === fundingId);

  if (!funding) {
    return (
      <main className="page-wrap pt-8">
        <GlassCard className="p-6">
          <h1 className="text-2xl font-bold text-slate-900">Funding tidak ditemukan</h1>
          <p className="mt-2 text-slate-600">Cek kembali ID funding pada URL.</p>
          <Link href="/dashboard/lender" className="mt-4 inline-block text-sm font-semibold text-sky-700">
            Kembali ke dashboard lender
          </Link>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="page-wrap space-y-6 pt-8">
      <GlassCard className="p-6 md:p-8">
        <p className="badge">Funding Detail #{funding.id}</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">{funding.msme}</h1>
        <p className="mt-2 text-slate-600">
          Nilai pembiayaan {funding.amount} dengan rekomendasi ROI {funding.roi}.
        </p>
      </GlassCard>

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Funding Profile</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>Status: {funding.status}</p>
            <p>Credit score: {funding.score}</p>
            <p>Potential ROI: {funding.roi}</p>
            <p>Smart contract function: approveFunding({funding.id})</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Event Timeline</h2>
          <div className="mt-4 space-y-3">
            {realtimeEvents.map((event) => (
              <div
                key={`${event.time}-${event.event}`}
                className="rounded-2xl border border-sky-100 bg-white/70 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-wide text-sky-700">{event.time}</p>
                <p className="text-sm font-semibold text-slate-900">{event.event}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}
