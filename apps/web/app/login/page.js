"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/glass-card";
import { loadSession, saveSession } from "@/lib/auth-session";
import { apiClient } from "@/lib/api-client";

const roles = [
  {
    role: "MSME",
    description: "Kelola profil usaha, upload invoice ke IPFS, dan ajukan pembiayaan."
  },
  {
    role: "LENDER",
    description: "Tinjau pengajuan UMKM, verifikasi risiko, dan lakukan pendanaan."
  },
  {
    role: "REGULATOR",
    description: "Pantau transaksi, fraud alert, dan metrik risiko secara real-time."
  }
];

const dashboardByRole = {
  MSME: "/dashboard/msme",
  LENDER: "/dashboard/lender",
  REGULATOR: "/dashboard/regulator"
};

const demoAccounts = [
  {
    role: "MSME",
    email: "demo-msme@umkmchain.local",
    password: "DemoMSME123!"
  },
  {
    role: "LENDER",
    email: "demo-lender@umkmchain.local",
    password: "DemoLENDER123!"
  },
  {
    role: "REGULATOR",
    email: "demo-regulator@umkmchain.local",
    password: "DemoREGULATOR123!"
  }
];

const payloadReference = [
  {
    section: "Auth",
    endpoint: "POST /api/auth/register",
    payload: '{ email, password, role }'
  },
  {
    section: "Auth",
    endpoint: "POST /api/auth/login",
    payload: '{ email, password }'
  },
  {
    section: "Auth",
    endpoint: "GET /api/auth/demo?role=MSME",
    payload: "role query param"
  },
  {
    section: "Funding",
    endpoint: "POST /api/funding/msme/register",
    payload: '{ businessId, businessName, owner, city, sector, walletAddress }'
  },
  {
    section: "Funding",
    endpoint: "POST /api/funding/request/confirm",
    payload: '{ msmeId, amount, tenorMonths, purpose, walletAddress, txHash? }'
  },
  {
    section: "Funding",
    endpoint: "POST /api/funding/document/upload",
    payload: '{ msmeId, fileName, fileContent, walletAddress? }'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login, register, demo
  const [selectedRole, setSelectedRole] = useState("MSME");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState("");
  
  // Form state
  const [registerForm, setRegisterForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const currentSession = loadSession();
    if (currentSession) {
      setSession(currentSession);
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error("Password tidak cocok");
      }

      const data = await apiClient.registerUser({
        email: registerForm.email,
        password: registerForm.password,
        role: selectedRole
      });
      const nextSession = {
        token: data.token,
        ...data.session
      };

      saveSession(nextSession);
      setSession(nextSession);
      setMessage("Registrasi berhasil! Redirect ke dashboard...");
      setTimeout(() => router.push(dashboardByRole[selectedRole]), 1000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await apiClient.loginUser({
        email: loginForm.email,
        password: loginForm.password
      });
      const nextSession = {
        token: data.token,
        ...data.session
      };

      saveSession(nextSession);
      setSession(nextSession);
      setMessage("Login berhasil! Redirect ke dashboard...");
      setTimeout(() => router.push(dashboardByRole[nextSession.role]), 1000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await apiClient.getDemoSession(selectedRole);
      const nextSession = {
        token: data.token,
        ...data.session
      };

      saveSession(nextSession);
      setSession(nextSession);
      setMessage("Demo login berhasil! Redirect ke dashboard...");
      setTimeout(() => router.push(dashboardByRole[selectedRole]), 1000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return (
      <main className="page-wrap space-y-8 pt-8">
        <GlassCard className="p-8 md:p-10">
          <p className="badge">Signed In</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Session Active</h1>
          <p className="mt-3 text-slate-600">
            Anda sudah login sebagai <span className="font-semibold">{session.role}</span>.
          </p>
          <button
            onClick={() => router.push(dashboardByRole[session.role] || "/dashboard/msme")}
            className="mt-6 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Buka Dashboard
          </button>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="page-wrap space-y-8 pt-8">
      <GlassCard className="p-8 md:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="badge">UMKMChain Authentication</p>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Login / Register</h1>
            <p className="mt-3 text-slate-600">
              Pilih mode login, register akun baru, atau masuk lewat akun demo yang sudah di-seed
              di backend untuk langsung buka dashboard sesuai role.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Akun demo default</p>
            <p className="mt-1">MSME, LENDER, dan REGULATOR sudah tersedia dari startup.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-slate-200">
          {[
            { id: "login", label: "Login" },
            { id: "register", label: "Register" },
            { id: "demo", label: "🎬 Demo" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`px-4 py-2 text-sm font-semibold transition ${
                mode === tab.id
                  ? "border-b-2 border-sky-600 text-sky-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Role Selection */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">Pilih Role</p>
          <div className="grid gap-3 md:grid-cols-3">
            {roles.map((item) => (
              <button
                key={item.role}
                onClick={() => setSelectedRole(item.role)}
                disabled={loading}
                className={`rounded-lg border p-3 text-left text-sm transition disabled:opacity-50 ${
                  selectedRole === item.role
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="font-semibold text-sky-700">{item.role}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-70"
            >
              {loading ? "Sedang login..." : "Login"}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
            >
              {loading ? "Sedang register..." : "Register"}
            </button>
          </form>
        )}

        {/* Demo Mode */}
        {mode === "demo" && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-600">
              Masuk dengan akun demo tanpa perlu registrasi untuk testing.
            </p>
            <button
              onClick={handleDemo}
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
            >
              {loading ? "Loading..." : `🎬 Start Demo as ${selectedRole}`}
            </button>
          </div>
        )}

        {message && (
          <p className={`mt-4 text-sm ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </GlassCard>

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Demo Accounts</p>
          <div className="mt-4 space-y-3">
            {demoAccounts.map((account) => (
              <div key={account.role} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{account.role}</p>
                  <p className="text-xs text-slate-500">Seeded</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{account.email}</p>
                <p className="text-sm text-slate-600">Password: {account.password}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Request Payload Ringkas</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Endpoint</th>
                  <th className="px-4 py-3 font-semibold">Payload</th>
                </tr>
              </thead>
              <tbody>
                {payloadReference.map((row) => (
                  <tr key={row.endpoint} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{row.endpoint}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{row.section}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.payload}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {roles.map((item) => (
          <GlassCard key={item.role} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              {item.role}
            </p>
            <p className="mt-2 text-sm text-slate-700">{item.description}</p>
          </GlassCard>
        ))}
      </section>
    </main>
  );
}
