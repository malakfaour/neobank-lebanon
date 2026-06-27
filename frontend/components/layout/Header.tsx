"use client";

import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 lg:px-8 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xs">Good day,</p>
        <p className="text-black text-sm font-bold">{user?.full_name ?? "Welcome"}</p>
      </div>
      <button className="relative w-9 h-9 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
        <span className="text-lg">🔔</span>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00C853] border border-white" />
      </button>
    </header>
  );
}