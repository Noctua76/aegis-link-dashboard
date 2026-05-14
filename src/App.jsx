import aegisLogo from "./assets/aegis-logo.png";
import { useEffect, useState } from "react";
import "./App.css";
import SiteCard from "./components/SiteCard";
import GuardStatus from "./components/GuardStatus";
import IncidentCard from "./components/IncidentCard";
import Guards from "./pages/Guards";
import Sites from "./pages/Sites";
import EventLogs from "./pages/EventLogs";
import {
  sites as securitySites,
  guards as securityGuards,
  activeSessions,
  incidents as securityIncidents,
  getSiteById,
  getGuardById,
  getActiveSessionBySiteId,
} from "./data/securityData";

function App() {
  const [activeMenu, setActiveMenu] = useState(() => {
  return localStorage.getItem("aegis-active-menu") || "Dashboard";
});

const menuItems = [
  "Dashboard",
  "Live Incidents",
  "Event Logs",
  "Guards",
  "Sites",
  "System Status",
  "Analytics",
  "Settings",
];
  useEffect(() => {
  localStorage.setItem("aegis-active-menu", activeMenu);
}, [activeMenu]);
  const dashboardSites = securitySites.map((site) => {
  const activeSession = getActiveSessionBySiteId(site.id);
  const activeGuard = activeSession
    ? getGuardById(activeSession.guardId)
    : null;

  return {
    name: site.name,
    location: site.location,
    guardsAssigned: site.guardsAssigned,
    guardsOnDuty: activeSession ? 1 : 0,
    activeGuard: activeGuard ? activeGuard.fullName : "No active guard",
    status: site.status === "Alert Active" ? "alert" : "normal",
  };
});

const guardsOnDuty = activeSessions.map((session) => {
  const guard = getGuardById(session.guardId);
  const site = getSiteById(session.siteId);

  return {
    name: guard.fullName,
    site: site.name,
    shift: session.shift,
    status: session.status,
    loggedInAt: session.loginAt,
  };
});

const dashboardIncidents = securityIncidents.map((incident) => {
  const site = getSiteById(incident.siteId);
  const guard = getGuardById(incident.guardId);

  return {
    ...incident,
    site: site.name,
    guard: guard.fullName,
  };
});

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
        <div className="sidebar-brand">
  <img
    src={aegisLogo}
    alt="Aegis Link Logo"
    className="sidebar-brand-logo"
  />

  <h2>Aegis Link</h2>

  <span>Security Operations Platform</span>
</div>

        <nav>
  <ul className="sidebar-menu">
    {menuItems.map((item) => (
      <li
        key={item}
        className={`sidebar-item ${activeMenu === item ? "active" : ""}`}
        onClick={() => setActiveMenu(item)}
      >
        {item}
      </li>
    ))}
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
        {activeMenu === "Dashboard" && (
  <>
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
            <div style={{ fontSize: "28px", marginTop: "10px", color: "#22c55e" }}>
  {activeSessions.length}
</div>
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
            {dashboardSites.map((site, index) => (
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
            {guardsOnDuty.map((guard, index) => (
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
    </>
)}
        {activeMenu === "Live Incidents" && (
  <>
    <header style={{ marginBottom: "28px" }}>
      <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "700" }}>
        Live Incidents
      </h1>
      <p style={{ marginTop: "8px", color: "#9ca3af", fontSize: "15px" }}>
        Real-time incident monitoring across all active sites
      </p>
    </header>

    <section style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
      {["All", "Active", "In Progress", "Escalated", "Resolved"].map((filter) => (
        <button key={filter} className="filter-button">
          {filter}
        </button>
      ))}
    </section>

    <section style={{ display: "grid", gap: "16px" }}>
      {dashboardIncidents.map((incident, index) => (
        <div key={index} className={`incident-detail-card ${incident.type}`}>
          <div className="incident-card-header">
            <div>
              <h3>{incident.title}</h3>
              <p>Incident ID: INC-2025-00{index + 1}</p>
            </div>

            <span className="incident-status">
              {incident.type === "alert" ? "Active" : "In Progress"}
            </span>
          </div>

          <div className="incident-meta-grid">
            <p><strong>Site:</strong> {incident.site}</p>
            <p><strong>Guard:</strong> {incident.guard}</p>
            <p><strong>Triggered at:</strong> {incident.time}</p>
            <p><strong>Priority:</strong> High</p>
          </div>

          <div className="incident-flow">
            <span>🚨 Trigger Received</span>
            <span>📩 SMS {incident.smsStatus}</span>
            <span>📞 Call {incident.callStatus}</span>
            <span>🤖 AI {incident.aiStatus}</span>
          </div>

          <div className="incident-ai-box">
            <h4>AI Intake</h4>
            <p><strong>What happened?</strong> Suspicious movement reported.</p>
            <p><strong>Where?</strong> {incident.site}</p>
            <p><strong>Need support?</strong> Yes, supervisor review required.</p>
          </div>
        </div>
      ))}
    </section>
  </>
)}
        {activeMenu === "Guards" && <Guards />}
        {activeMenu === "Event Logs" && <EventLogs />}
        {activeMenu === "Sites" && <Sites />}
        
        {activeMenu === "System Status" && (
  <>
    <header style={{ marginBottom: "28px" }}>
      <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "700" }}>
        System Status
      </h1>
      <p style={{ marginTop: "8px", color: "#9ca3af", fontSize: "15px" }}>
        Operational health of the Aegis Link infrastructure
      </p>
    </header>

    <section className="system-status-grid">
      <div className="system-status-card online">
        <div>
          <h3>Web App</h3>
          <p>Guard interface and alert trigger</p>
        </div>
        <span>Online</span>
      </div>

      <div className="system-status-card online">
        <div>
          <h3>Backend API</h3>
          <p>Incident orchestration and event handling</p>
        </div>
        <span>Online</span>
      </div>

      <div className="system-status-card online">
        <div>
          <h3>SMS Gateway</h3>
          <p>Vonage SMS delivery channel</p>
        </div>
        <span>Operational</span>
      </div>

      <div className="system-status-card online">
        <div>
          <h3>Voice Calls</h3>
          <p>Automated outbound emergency calls</p>
        </div>
        <span>Operational</span>
      </div>

      <div className="system-status-card warning">
        <div>
          <h3>AI Intake</h3>
          <p>Post-alert structured questioning flow</p>
        </div>
        <span>Demo Mode</span>
      </div>

      <div className="system-status-card warning">
        <div>
          <h3>Database</h3>
          <p>Incident history and audit persistence</p>
        </div>
        <span>Pending</span>
      </div>
    </section>

    <section className="system-status-panel">
      <h2>Current Infrastructure State</h2>
      <p>
        The dashboard currently operates as a live demo interface. In production,
        this section will reflect real-time health checks from the web app,
        backend, Vonage SMS/call services, AI intake flow, and database layer.
      </p>
    </section>
  </>
)}
      </main>
    </div>
  );
}

export default App;
