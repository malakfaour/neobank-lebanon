"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/transfer", label: "Transfer", icon: "💸" },
  { href: "/exchange", label: "Exchange", icon: "💱" },
  { href: "/transactions", label: "Transactions", icon: "📋" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 px-4 py-6 z-20">
      <div className="mb-8 px-2">
        <span className="text-2xl font-bold text-black">neo<span className="text-[#00C853]">.</span></span>
        <p className="text-gray-400 text-xs mt-0.5">NeoBank Lebanon</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors
                ${active ? "bg-[#00C853]/10 text-[#00C853]" : "text-gray-500 hover:text-black hover:bg-gray-50"}`}>
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
      <button onClick={() => { logout(); router.push("/login"); }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
        <span className="text-lg">🚪</span>Sign out
      </button>
    </aside>
  );
}