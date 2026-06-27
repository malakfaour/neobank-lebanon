"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/transfer", label: "Transfer", icon: "💸" },
  { href: "/exchange", label: "Exchange", icon: "💱" },
  { href: "/transactions", label: "History", icon: "📋" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors
                ${active ? "text-[#00C853]" : "text-gray-400 hover:text-gray-600"}`}>
              <span className="text-xl">{icon}</span>
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}