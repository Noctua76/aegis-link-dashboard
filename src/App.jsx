import "./App.css";
import SiteCard from "./components/SiteCard";
import GuardStatus from "./components/GuardStatus";
import IncidentCard from "./components/IncidentCard";

function App() {
  const sites = [
    {
      name: "Ekali",
      location: "Ekali",
      guardsAssigned: 4,
      guardsOnDuty: 1,
      activeGuard: "N. Papadakis",
      status: "alert",
    },
    {
      name: "Astir Vouliagmenis",
      location: "Vouliagmeni",
      guardsAssigned: 6,
      guardsOnDuty: 2,
      activeGuard: "M. Ioannou",
      status: "normal",
    },
  ];

  const guards = [
    {
      name: "N. Papadakis",
      site: "Ekali",
      shift: "14:00 - 22:00",
      status: "On Duty",
      loggedInAt: "13:56",
    },
    {
      name: "M. Ioannou",
      site: "Astir Vouliagmenis",
      shift: "08:00 - 16:00",
      status: "On Duty",
      loggedInAt: "07:52",
    },
  ];

  const incidents = [
    {
      title: "Alert Triggered",
      site: "Ekali",
      guard: "N. Papadakis",
      location: "Zone 3",
      time: "14:32:18",
      smsStatus: "Delivered",
      callStatus: "Answered",
      aiStatus: "Completed",
      type: "alert",
    },
    {
      title: "Call in Progress",
      site: "Astir Vouliagmenis",
      guard: "M. Ioannou",
      location: "Main Gate",
      time: "14:35:41",
      smsStatus: "Delivered",
      callStatus: "Dialing",
      aiStatus: "Pending",
      type: "warning",
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", margin: 0 }}>
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
  <ul className="sidebar-menu">
    <li className="sidebar-item active">Dashboard</li>
    <li className="sidebar-item">Live Incidents</li>
    <li className="sidebar-item">Event Logs</li>
    <li className="sidebar-item">Users</li>
    <li className="sidebar-item">Alert Profiles</li>
    <li className="sidebar-item">Notifications</li>
    <li className="sidebar-item">Reports</li>
    <li className="sidebar-item">System Status</li>
    <li className="sidebar-item">Settings</li>
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
        <header style={{ marginBottom: "28px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            Aegis Link Operations Console
          </h1>
          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#9ca3af",
              fontSize: "15px",
            }}
          >
            Live view of sites, guards, and active incidents
          </p>
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
            <div>Guards On Duty</div>
            <div style={{ fontSize: "28px", marginTop: "10px", color: "#22c55e" }}>2</div>
          </div>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <h2
            style={{
              marginBottom: "16px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            Sites Overview
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {sites.map((site, index) => (
              <SiteCard key={index} site={site} />
            ))}
          </div>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <h2
            style={{
              marginBottom: "16px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            Guards On Duty
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {guards.map((guard, index) => (
              <GuardStatus key={index} guard={guard} />
            ))}
          </div>
        </section>

        <section
          style={{
            background: "#181818",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "18px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            Live Incident Feed
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            <div
              style={{
                background: "#101010",
                padding: "16px",
                borderRadius: "10px",
                borderLeft: "4px solid #ff4d4f",
              }}
            >
              <strong>🚨 Alert Triggered</strong>
              <div style={{ fontSize: "14px", color: "#aaaaaa", marginTop: "6px" }}>
                Location: Ekali
              </div>
              <div style={{ fontSize: "14px", color: "#aaaaaa" }}>
                Time: 14:32:18
              </div>
            </div>

            <div
              style={{
                background: "#101010",
                padding: "16px",
                borderRadius: "10px",
                borderLeft: "4px solid #facc15",
              }}
            >
              <strong>📞 Call in Progress</strong>
              <div style={{ fontSize: "14px", color: "#aaaaaa", marginTop: "6px" }}>
                Contacting: Supervisor
              </div>
            </div>

            <div
              style={{
                background: "#101010",
                padding: "16px",
                borderRadius: "10px",
                borderLeft: "4px solid #22c55e",
              }}
            >
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