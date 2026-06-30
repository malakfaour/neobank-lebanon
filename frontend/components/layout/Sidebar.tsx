"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

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
    <aside style={{ display: "none", position: "fixed", left: 0, top: 0, height: "100%", width: "240px", backgroundColor: "#fff", borderRight: "1px solid #F0F0F0", padding: "24px 16px", flexDirection: "column", zIndex: 20 }}
      className="lg-sidebar">
      <div style={{ marginBottom: "32px", paddingLeft: "8px" }}>
        <div style={{ fontSize: "24px", fontWeight: "800", color: "#000" }}>neo<span style={{ color: "#00C853" }}>.</span></div>
        <div style={{ color: "#aaa", fontSize: "12px", marginTop: "2px" }}>NeoBank Lebanon</div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "14px",
              fontSize: "14px", fontWeight: "600", textDecoration: "none",
              backgroundColor: active ? "#F0FDF4" : "transparent",
              color: active ? "#00C853" : "#666",
            }}>
              <span style={{ fontSize: "18px" }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
      <button onClick={() => { logout(); router.push("/login"); }}
        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "14px", border: "none", backgroundColor: "transparent", fontSize: "14px", fontWeight: "600", color: "#aaa", cursor: "pointer" }}>
        <span style={{ fontSize: "18px" }}>🚪</span>Sign out
      </button>
    </aside>
  );
}