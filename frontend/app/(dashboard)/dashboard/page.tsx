export default function DashboardPage() {
  return (
    <div className="space-y-5">
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-3xl bg-[#00C853] p-5">
          <p className="text-green-100 text-xs font-semibold uppercase tracking-wide mb-3">Fresh USD</p>
          <p className="text-white text-3xl font-bold">$0.00</p>
          <p className="text-green-100 text-xs mt-1">Available balance</p>
        </div>
        <div className="rounded-3xl bg-white border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Cash LBP</p>
          <p className="text-black text-3xl font-bold">ل.ل 0</p>
          <p className="text-gray-400 text-xs mt-1">Available balance</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Quick actions</p>
        <div className="grid grid-cols-3 gap-3">
          {[{ label: "Transfer", icon: "💸" }, { label: "Add Money", icon: "➕" }, { label: "Exchange", icon: "💱" }].map(({ label, icon }) => (
            <button key={label} className="flex flex-col items-center gap-2 bg-white hover:bg-gray-50 border border-gray-100 rounded-3xl py-4 transition-colors">
              <span className="text-2xl">{icon}</span>
              <span className="text-gray-700 text-xs font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Recent transactions</p>
        <div className="bg-white rounded-3xl border border-gray-100 divide-y divide-gray-50">
          {["Placeholder transaction 1", "Placeholder transaction 2", "Placeholder transaction 3"].map((t) => (
            <div key={t} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center text-lg">💳</div>
              <div className="flex-1">
                <p className="text-black text-sm font-medium">{t}</p>
                <p className="text-gray-400 text-xs">Today</p>
              </div>
              <p className="text-gray-500 text-sm font-semibold">$0.00</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}