function App() {
  return (
    <div style={{ display: "flex", height: "100vh", margin: 0 }}>
      <aside
        style={{
          width: "260px",
          background: "#111111",
          color: "#ffffff",
          padding: "24px 18px",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Aegis Link</h2>

        <nav>
          <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0 0" }}>
            <li style={{ padding: "10px 0" }}>Dashboard</li>
            <li style={{ padding: "10px 0" }}>Live Incidents</li>
            <li style={{ padding: "10px 0" }}>Event Logs</li>
            <li style={{ padding: "10px 0" }}>Users</li>
            <li style={{ padding: "10px 0" }}>Alert Profiles</li>
            <li style={{ padding: "10px 0" }}>Notifications</li>
            <li style={{ padding: "10px 0" }}>Reports</li>
            <li style={{ padding: "10px 0" }}>System Status</li>
            <li style={{ padding: "10px 0" }}>Settings</li>
          </ul>
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          background: "#0b0b0b",
          color: "#ffffff",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <header style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ color: "#aaaaaa" }}>Aegis Link Operations Console</p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Active Incidents</div>
            <div style={{ fontSize: "28px", marginTop: "10px", color: "#ff4d4f" }}>3</div>
          </div>

          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Alerts Today</div>
            <div style={{ fontSize: "28px", marginTop: "10px" }}>128</div>
          </div>

          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Response Time</div>
            <div style={{ fontSize: "28px", marginTop: "10px" }}>18s</div>
          </div>

          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Success Rate</div>
            <div style={{ fontSize: "28px", marginTop: "10px", color: "#22c55e" }}>94%</div>
          </div>
        </section>

        <section
          style={{
            background: "#181818",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Live Incident Feed</h3>

<div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
  
  <div style={{ background: "#101010", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #ff4d4f" }}>
    <strong>🚨 Alert Triggered</strong>
    <div style={{ fontSize: "14px", color: "#aaaaaa", marginTop: "6px" }}>
      Location: Warehouse A — Zone 3  
    </div>
    <div style={{ fontSize: "14px", color: "#aaaaaa" }}>
      Time: 14:32:18
    </div>
  </div>

  <div style={{ background: "#101010", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #facc15" }}>
    <strong>📞 Call in Progress</strong>
    <div style={{ fontSize: "14px", color: "#aaaaaa", marginTop: "6px" }}>
      Contacting: Supervisor
    </div>
  </div>

  <div style={{ background: "#101010", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #22c55e" }}>
    <strong>✅ Incident Resolved</strong>
    <div style={{ fontSize: "14px", color: "#aaaaaa", marginTop: "6px" }}>
      Duration: 2m 14s
    </div>
  </div>

</div>
        </section>
      </main>
    </div>
  );
}

export default App;