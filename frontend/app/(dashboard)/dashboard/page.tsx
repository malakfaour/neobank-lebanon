export default function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", backgroundColor: "#F5F5F5", minHeight: "100vh", padding: "20px" }}>
      
      {/* Balance cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ borderRadius: "20px", backgroundColor: "#00C853", padding: "20px" }}>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Fresh USD</p>
          <p style={{ color: "#fff", fontSize: "28px", fontWeight: "800" }}>$0.00</p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", marginTop: "4px" }}>Available balance</p>
        </div>
        <div style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #F0F0F0", padding: "20px" }}>
          <p style={{ color: "#aaa", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Cash LBP</p>
          <p style={{ color: "#000", fontSize: "28px", fontWeight: "800" }}>0 ل.ل</p>
          <p style={{ color: "#aaa", fontSize: "11px", marginTop: "4px" }}>Available balance</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p style={{ color: "#aaa", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Quick actions</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {[
            { label: "Transfer", svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
            { label: "Add Money", svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#00C853" strokeWidth="2" strokeLinecap="round"/></svg> },
            { label: "Exchange", svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
          ].map(({ label, svg }) => (
            <button key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", backgroundColor: "#fff", border: "1px solid #F0F0F0", borderRadius: "20px", padding: "16px 8px", cursor: "pointer" }}>
              {svg}
              <span style={{ color: "#333", fontSize: "11px", fontWeight: "600" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <p style={{ color: "#aaa", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Recent transactions</p>
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #F0F0F0", overflow: "hidden" }}>
          {["Placeholder transaction 1", "Placeholder transaction 2", "Placeholder transaction 3"].map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: i < 2 ? "1px solid #F5F5F5" : "none" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "12px", backgroundColor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="#00C853" strokeWidth="2"/><path d="M2 10h20" stroke="#00C853" strokeWidth="2"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#000", fontSize: "14px", fontWeight: "500" }}>{t}</p>
                <p style={{ color: "#aaa", fontSize: "12px" }}>Today</p>
              </div>
              <p style={{ color: "#333", fontSize: "14px", fontWeight: "600" }}>$0.00</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}