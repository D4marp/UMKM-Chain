"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSession, loadSession } from "@/lib/auth-session";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard/msme", label: "MSME" },
  { href: "/dashboard/lender", label: "Lender" },
  { href: "/dashboard/regulator", label: "Regulator" },
  { href: "/analytics", label: "Analytics" }
];

export default function SiteNav() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 border-b border-sky-100/60 bg-white/70 backdrop-blur-md">
      <nav className="page-wrap flex items-center justify-between py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-sky-900">
          UMKMChain
        </Link>

        <ul className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {links.map((item) => (
            <li key={item.href}>
              <Link className="transition hover:text-sky-700" href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={session ? "/dashboard/msme" : "/login"}
          className="rounded-full bg-gradient-to-r from-sky-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-400/30"
        >
          {session ? `${session.role} Dashboard` : "Connect Wallet"}
        </Link>

        {session ? (
          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700"
          >
            Logout
          </button>
        ) : null}
      </nav>
    </header>
  );
}
