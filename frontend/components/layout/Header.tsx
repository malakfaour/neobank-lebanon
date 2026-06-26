"use client";

import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 lg:px-8 flex items-center justify-between">
      {/* Greeting */}
      <div>
        <p className="text-gray-400 text-xs">Good day,</p>
        <p className="text-white text-sm font-semibold">
          {user?.full_name ?? "Welcome"}
        </p>
      </div>

      {/* Notification bell */}
      <button className="relative w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
        <span className="text-lg">🔔</span>
        {/* Unread dot */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 border border-gray-950" />
      </button>
    </header>
  );
}