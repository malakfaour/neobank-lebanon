"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/transfer", label: "Transfer", icon: "💸" },
  { href: "/exchange", label: "Exchange", icon: "💱" },
  { href: "/transactions", label: "Transactions", icon: "📋" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 px-4 py-6 z-20">
      {/* Logo */}
      <div className="mb-8 px-2">
        <span className="text-xl font-bold text-white tracking-tight">
          Neo<span className="text-emerald-400">Bank</span>
        </span>
        <p className="text-gray-500 text-xs mt-0.5">Lebanon</p>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: logout */}
      <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors">
        <span className="text-lg">🚪</span>
        Sign out
      </button>
    </aside>
  );
}