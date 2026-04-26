"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import GlassCard from "@/components/glass-card";
import { analyticsSeries } from "@/lib/demo-data";

const riskDistribution = [
  { name: "Low", value: 58, fill: "#1b82ff" },
  { name: "Medium", value: 30, fill: "#0ea37a" },
  { name: "High", value: 12, fill: "#f97316" }
];

export default function AnalyticsPage() {
  return (
    <main className="page-wrap space-y-6 pt-8">
      <GlassCard className="p-6 md:p-8">
        <p className="badge">/analytics</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Network Financing Analytics</h1>
        <p className="mt-2 text-slate-600">
          Trend pendanaan, repayment, default ratio, dan distribusi risiko portfolio.
        </p>
      </GlassCard>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <GlassCard className="h-[360px] p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Monthly Performance</h2>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="financing" stroke="#1b82ff" strokeWidth={2} />
                <Line type="monotone" dataKey="repaid" stroke="#0ea37a" strokeWidth={2} />
                <Line type="monotone" dataKey="defaults" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="h-[360px] p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Risk Composition</h2>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </section>
    </main>
  );
}
