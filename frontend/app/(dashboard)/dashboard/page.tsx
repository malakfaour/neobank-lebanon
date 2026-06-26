export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* USD card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5">
          <p className="text-emerald-100 text-xs font-medium uppercase tracking-wide mb-3">Fresh USD</p>
          <p className="text-white text-3xl font-bold tracking-tight">$0.00</p>
          <p className="text-emerald-200 text-xs mt-1">Available balance</p>
        </div>

        {/* LBP card */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-5">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">Cash LBP</p>
          <p className="text-white text-3xl font-bold tracking-tight">ل.ل 0</p>
          <p className="text-gray-500 text-xs mt-1">Available balance</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">Quick actions</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Transfer", icon: "💸" },
            { label: "Add Money", icon: "➕" },
            { label: "Exchange", icon: "💱" },
          ].map(({ label, icon }) => (
            <button key={label} className="flex flex-col items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl py-4 transition-colors">
              <span className="text-2xl">{icon}</span>
              <span className="text-gray-300 text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent transactions placeholder */}
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">Recent transactions</p>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 divide-y divide-gray-800">
          {["Placeholder transaction 1", "Placeholder transaction 2", "Placeholder transaction 3"].map((t) => (
            <div key={t} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-lg">💳</div>
              <div className="flex-1">
                <p className="text-white text-sm">{t}</p>
                <p className="text-gray-500 text-xs">Today</p>
              </div>
              <p className="text-gray-400 text-sm font-medium">$0.00</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}