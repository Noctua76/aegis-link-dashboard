import { APP_VERSION, APP_BUILD } from "./config/version";
import aegisLogo from "./assets/aegis-logo.png";
import { useEffect, useState } from "react";
import "./App.css";
import SiteCard from "./components/SiteCard";
import GuardStatus from "./components/GuardStatus";
import IncidentCard from "./components/IncidentCard";
import Guards from "./pages/Guards";
import Sites from "./pages/Sites";
import EventLogs from "./pages/EventLogs";
import Settings from "./pages/Settings";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import Analytics from "./pages/Analytics";
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
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";

const [currentUser, setCurrentUser] = useState(() => {
  const savedUser = localStorage.getItem("aegis-current-user");
  return savedUser ? JSON.parse(savedUser) : null;
});

const [loginForm, setLoginForm] = useState({
  username: "",
  password: "",
});

const [loginError, setLoginError] = useState("");
const [isLoggingIn, setIsLoggingIn] = useState(false);
const [recentAlerts, setRecentAlerts] = useState([]);
const [recentAlertsCheckedAt, setRecentAlertsCheckedAt] = useState(null);

useEffect(() => {
  const loadRecentAlerts = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/event-logs`
      );

      const data = await response.json();

      if (data.status === "ok") {
  setRecentAlerts(data.logs);
  setRecentAlertsCheckedAt(new Date());
}
    } catch (err) {
      console.error(
        "Recent alert activity error:",
        err
      );
    }
    };

loadRecentAlerts();

const interval = setInterval(() => {
  loadRecentAlerts();
}, 5000);

return () => clearInterval(interval);
}, []);

  
const handleLogin = async (event) => {
  event.preventDefault();
  setLoginError("");
  setIsLoggingIn(true);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginForm),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("aegis-current-user", JSON.stringify(data));
    setCurrentUser(data);
  } catch (error) {
    setLoginError(error.message || "Invalid username or password");
  } finally {
    setIsLoggingIn(false);
  }
};

const [dashboardMetrics, setDashboardMetrics] = useState({
  activeIncidents: 0,
  alertsToday: 0,
  responseTime: "0s",
  guardsOnDuty: 0,
});

const [liveSites, setLiveSites] = useState([]);

const [incidentTimeline, setIncidentTimeline] = useState({
  status: "normal",
  location: "Normal",
  alertTime: null,
  alertStatus: "normal",
  callStatus: "normal",
  smsStatus: "normal",
  incidentStatus: "normal",
  duration: null,
});

const handleLogout = async () => {
  const username =
    currentUser?.user?.username ||
    currentUser?.username;

  try {
    await fetch(`${API_BASE_URL}/admin/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
  } catch (err) {
    console.error("Logout tracking failed", err);
  }

  localStorage.removeItem("aegis-current-user");
  setCurrentUser(null);
};
  const [activeMenu, setActiveMenu] = useState(() => {
  return localStorage.getItem("aegis-active-menu") || "Dashboard";
});
const [liveActiveGuards, setLiveActiveGuards] = useState([]);
  const [incidentFilter, setIncidentFilter] = useState("All");
const menuItems = [
  "Dashboard",
  "Live Incidents",
  "Event Logs",
  "Admin Audit Logs",
  "Guards",
  "Sites",
  "System Status",
  "Analytics",
  "Settings",
];
  useEffect(() => {
    const loadAdmins = async () => {
    try {
      const response = await fetch(
        "https://noctua-panic-backend-production.up.railway.app/admin/active"
      );

      const data = await response.json();

      if (data.status === "ok") {
        setOnlineAdmins(data.admins);
      }

    } catch (err) {
      console.error(err);
    }
  };


  loadAdmins();

  const interval = setInterval(loadAdmins, 10000);

  return () => clearInterval(interval);

}, []);
  useEffect(() => {

if (!currentUser) return;

const sendHeartbeat = async () => {

try{

await fetch(
`${API_BASE_URL}/admin/heartbeat`,
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username:
currentUser?.user?.username ||
currentUser?.username
})

}
);

}catch(err){

console.error(
"Heartbeat failed",
err
);

}

};

sendHeartbeat();

const interval =
setInterval(
sendHeartbeat,
30000
);

return () =>
clearInterval(interval);

}, [currentUser]);
  useEffect(() => {
  localStorage.setItem("aegis-active-menu", activeMenu);
    const fetchActiveGuards = async () => {
  try {
    const response = await fetch(
      "https://noctua-panic-backend-production.up.railway.app/guards/active"
    );

    const data = await response.json();

    setLiveActiveGuards(data.guards || []);
  } catch (err) {
    console.error("Failed loading active guards:", err);
  }
};

fetchActiveGuards();

const interval = setInterval(fetchActiveGuards, 10000);

return () => clearInterval(interval);
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

const guardsOnDuty = liveActiveGuards.map((guard) => ({
  full_name: guard.full_name,
  site_name: guard.site_name,
  check_in_time: guard.check_in_time,
}));

const [dashboardIncidents, setDashboardIncidents] = useState([]);
const [systemStatus, setSystemStatus] = useState(null);

useEffect(() => {
  async function loadDashboardMetrics() {
    try {
      const res = await fetch(
        "https://noctua-panic-backend-production.up.railway.app/dashboard/metrics"
      );

      const data = await res.json();

      setDashboardMetrics(data);

    } catch (err) {
      console.error("Dashboard metrics error:", err);
    }
  }

  loadDashboardMetrics();

  const interval = setInterval(loadDashboardMetrics, 15000);

  return () => clearInterval(interval);

}, []);

useEffect(() => {
  async function loadIncidentTimeline() {
    try {
      const res = await fetch(
        `${API_BASE_URL}/dashboard/incident-timeline`
      );

      const data = await res.json();

      setIncidentTimeline(data);
    } catch (err) {
      console.error("Incident timeline load error:", err);

      setIncidentTimeline({
        status: "normal",
        location: "Normal",
        alertTime: null,
        alertStatus: "normal",
        callStatus: "normal",
        smsStatus: "normal",
        incidentStatus: "normal",
        duration: null,
      });
    }
  }

  loadIncidentTimeline();

  const interval = setInterval(loadIncidentTimeline, 5000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  async function loadSites() {
    try {
      const res = await fetch(
        "https://noctua-panic-backend-production.up.railway.app/sites"
      );

      const data = await res.json();

      setLiveSites(data.sites || []);
    } catch (err) {
      console.error("Sites load error:", err);
    }
  }

  loadSites();

  const interval = setInterval(loadSites, 15000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const loadSiteMonitoring = async () => {
    try {
      const response = await fetch(
        "https://noctua-panic-backend-production.up.railway.app/incidents/site-monitoring"
      );

      const data = await response.json();

      setDashboardIncidents(data.cards || []);
    } catch (err) {
      console.error("Failed loading site monitoring:", err);
    }
  };

  loadSiteMonitoring();

  const interval = setInterval(loadSiteMonitoring, 5000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const loadSystemStatus = async () => {
    try {
      let webAppStatus = "offline";

try {
  const webCheck = await fetch(
    "https://noctua-panic-backend-production.up.railway.app/health",
    {
      cache: "no-store"
    }
  );

  const webData = await webCheck.json();

  if (webData.status === "ok") {
    webAppStatus = "online";
  }
} catch {
  webAppStatus = "offline";
}

      const response = await fetch(
        "https://noctua-panic-backend-production.up.railway.app/system/status"
      );

      const data = await response.json();

      data.services.web_app = {
  status: webAppStatus
};

      setSystemStatus(data);

    } catch (err) {

      console.error(
  "Failed loading system status:",
  err
);

setSystemStatus({
  overall_status: "offline",
  services: {
    backend_api: {
      label: "Backend API",
      status: "offline",
      message: "Backend API is not responding"
    },
    sms_gateway: {
      label: "SMS Gateway",
      status: "unknown"
    },
    voice_calls: {
      label: "Voice Calls",
      status: "unknown"
    },
    database: {
      label: "Database",
      status: "unknown"
    },
    ai_intake: {
      label: "AI Intake",
      status: "unknown"
    }
    }
  });

}
};

  loadSystemStatus();

  const interval =
    setInterval(
      loadSystemStatus,
      10000
    );

  return () => {
  clearInterval(interval);
};

}, []);
  const filteredIncidents =
  incidentFilter === "All"
    ? dashboardIncidents
    : dashboardIncidents.filter(
        (incident) =>
          incident.status?.toLowerCase() ===
          incidentFilter.toLowerCase().replace(" ", "_")
      );

const formatTimelineTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("el-GR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const timelineText = {
  alert:
incidentTimeline.alertStatus === "normal"
? "No Alert"
: "Alert Triggered",

  call:
incidentTimeline.callStatus === "normal"
? "No Call"
      : incidentTimeline.callStatus === "completed"
      ? "Call Completed"
      : "Call In Progress",

  sms:
incidentTimeline.smsStatus === "normal"
? "No Message"
      : incidentTimeline.smsStatus === "completed"
      ? "SMS Sent"
      : "SMS In Progress",

  incident:
incidentTimeline.incidentStatus === "normal"
? "No Incident"
      : incidentTimeline.incidentStatus === "resolved"
      ? "Incident Resolved"
      : "Incident Active",
};

if (!currentUser) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <img src={aegisLogo} alt="Aegis Link Logo" className="login-logo" />

        <h1>Aegis Link</h1>
        <p>Security Operations Access</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={loginForm.username}
            onChange={(e) =>
              setLoginForm({ ...loginForm, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
          />

          {loginError && <span className="login-error">{loginError}</span>}

          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
  
const getFlowStatusClass = (status) => {
  const value = status?.toLowerCase();

  if (
    value === "received" ||
    value === "sending" ||
    value === "dialing" ||
    value === "processing" ||
    value === "pending"
  ) {
    return "flow-active";
  }

  if (
    value === "completed" ||
    value === "delivered"
  ) {
    return "flow-completed";
  }

  if (value === "failed") {
    return "flow-failed";
  }

  return "flow-ready";
};

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
          <button className="logout-button" onClick={handleLogout}>
  Logout
</button>
          <div className="current-user-box">
  <span>Logged in as</span>
  <strong>{currentUser?.username || currentUser?.user?.username}</strong>
  <small>● Active</small>
</div>
          <div className="current-user-box">

<span>ONLINE ADMINS</span>

{onlineAdmins.map((admin) => (

<div key={admin.username}>

<small>
🟢 {admin.username}
</small>

</div>

))}

</div>
  <img
    src={aegisLogo}
    alt="Aegis Link Logo"
    className="sidebar-brand-logo"
  />

  <div
  style={{
    marginTop: "12px",
    textAlign: "center",
    fontSize: "12px",
    color: "#6b7280",
    letterSpacing: "1px",
  }}
>
  Dashboard {APP_VERSION} · build {APP_BUILD}
</div>

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
            <div style={{ fontSize: "28px", marginTop: "10px", color: "#ff4d4f" }}>
            {dashboardMetrics.activeIncidents}
           </div>
          </div>

          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Alerts Today</div>
            <div style={{ fontSize: "28px", marginTop: "10px" }}>
            {dashboardMetrics.alertsToday}
            </div>
          </div>

          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Response Time</div>
            <div style={{ fontSize: "28px", marginTop: "10px" }}>
            {dashboardMetrics.responseTime}
            </div>
          </div>

          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Guards On Duty</div>
            <div style={{ fontSize: "28px", marginTop: "10px", color: "#22c55e" }}>
            {dashboardMetrics.guardsOnDuty}
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
            {liveSites.map((site, index) => (
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
            {liveActiveGuards.length > 0 ? (
              liveActiveGuards.map((guard, index) => (
                <GuardStatus key={index} guard={guard} />
              ))
            ) : (
              <GuardStatus guard={null} />
            )}
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
            Live Incident Timeline
          </h3>

          <div
  className="live-incident-panel"
  style={{
    marginTop: "16px",
    background: "#0d1117",
              borderRadius: "14px",
              padding: "18px",
              border: "1px solid #1f2937",
            }}
         >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                position: "relative",
                paddingLeft: "26px",
             }}
          >
             <div
               style={{
                 position: "absolute",
                 left: "8px",
                 top: "12px",
                 bottom: "12px",
                 width: "2px",
                 background: "#242424",
             }}
           />

           {/* Alert Triggered */}

           <div
             style={{
               position: "relative",
               background: "#101010",
               padding: "14px",
               borderRadius: "10px",
               borderLeft: "4px solid #ff4d4f",
            }}
           >
            <div
              style={{
                position: "absolute",
                left: "-26px",
                top: "18px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#ff4d4f",
                border: "3px solid #0d1117",
             }}
           />

          <strong>🚨 {timelineText.alert}</strong>

          <div
            style={{
              fontSize: "14px",
              color: "#aaaaaa",
              marginTop: "6px",
           }}
         >
           Location: {incidentTimeline.location || "Normal"}
         </div>

         <div
           style={{
             fontSize: "14px",
             color: "#aaaaaa",
          }}  
         >
          Time: {formatTimelineTime(incidentTimeline.alertTime)}
        </div>
      </div>

      {/* Call */}

      <div
        style={{
          position: "relative",
          background: "#101010",
          padding: "14px",
          borderRadius: "10px",
          borderLeft: "4px solid #ffac15",
        }}
       >
        <div
          style={{
            position: "absolute",
            left: "-26px",
            top: "18px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "#ffac15",
            border: "3px solid #0d1117",
          }}
        />

       <strong>📞 {timelineText.call}</strong>

       <div
         style={{
          fontSize: "14px",
          color: "#aaaaaa",
          marginTop: "6px",
        }}
      >
        {incidentTimeline.callStatus === "normal"
  ? "System standing by"
  : incidentTimeline.callStatus === "completed"
  ? "Supervisor calls completed"
  : "Contacting supervisors"}
      </div>
    </div>

    {/* SMS */}

    <div
      style={{
        position: "relative",
        background: "#101010",
        padding: "14px",
        borderRadius: "10px",
        borderLeft: "4px solid #3b82f6",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-26px",
          top: "18px",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: "#3b82f6",
          border: "3px solid #0d1117",
        }}
      />

      <strong>💬 {timelineText.sms}</strong>

      <div
        style={{
          fontSize: "14px",
          color: "#aaaaaa",
          marginTop: "6px",
        }}
      >
        {incidentTimeline.smsStatus === "normal"
  ? "System standing by"
  : incidentTimeline.smsStatus === "completed"
  ? "SMS notifications sent"
  : "Sending SMS notifications"}
      </div>
    </div>

    {/* Resolved */}

    <div
      style={{
        position: "relative",
        background: "#101010",
        padding: "14px",
        borderRadius: "10px",
        borderLeft: "4px solid #22c55e",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-26px",
          top: "18px",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: "#22c55e",
          border: "3px solid #0d1117",
        }}
      />

      <strong>✅ {timelineText.incident}</strong>

      <div
        style={{
          fontSize: "14px",
          color: "#aaaaaa",
          marginTop: "6px",
        }}
      >
        Duration: {incidentTimeline.duration || "-"}
      </div>
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

    <section className="live-incident-filters">
     {["All", "Normal", "Active", "In Progress", "Resolved"].map((filter) => (
  <button
    key={filter}
    className={`filter-button ${
      incidentFilter === filter ? "active-filter" : ""
    }`}
    onClick={() => setIncidentFilter(filter)}
  >
    {filter}
  </button>
))}
    </section>

    <section style={{ display: "grid", gap: "16px" }}>
      {filteredIncidents.map((incident, index) => (
  <div
    key={index}
    className={`incident-detail-card ${incident.status}`}
  >
          <div className="incident-card-header">
            <div>
              <h3>{incident.title}</h3>
              <p>Site monitoring card</p>
            </div>

            <span className="incident-status">
              {incident.status === "normal"
  ? "Normal"
  : incident.status === "active"
  ? "Active"
  : incident.status === "resolved"
  ? "Resolved"
  : "In Progress"}
            </span>
          </div>

          <div className="incident-meta-grid">
            <p><strong>Site:</strong> {incident.site}</p>
            <p><strong>Guard:</strong> {incident.guard}</p>
            <p>
  <strong>Alert status:</strong>{" "}
  {incident.status === "normal"
    ? "Waiting for alert"
    : incident.status === "resolved"
    ? "Resolved"
    : "Alert active"}
</p>
            <p><strong>Priority:</strong> {incident.priority}</p>
          </div>

          <div className="incident-flow">
  <span className={`flow-step trigger ${getFlowStatusClass(incident.triggerStatus)}`}>
    🚨 Trigger {incident.triggerStatus}
  </span>

  <span className={`flow-step sms ${getFlowStatusClass(incident.smsStatus)}`}>
    📩 SMS {incident.smsStatus}
  </span>

  <span className={`flow-step call ${getFlowStatusClass(incident.callStatus)}`}>
    📞 Call {incident.callStatus}
  </span>

  <span className={`flow-step ai ${getFlowStatusClass(incident.aiStatus)}`}>
    🤖 AI {incident.aiStatus}
  </span>
</div>

          <div className="incident-ai-box">
  <h4>AI Intake</h4>

  <p>
    <strong>Status:</strong>
    {" "}
    {incident.status === "normal"
      ? "Waiting for incident trigger"
      : incident.aiSummary}
  </p>

  <p>
    <strong>Site:</strong>
    {" "}
    {incident.site}
  </p>

  <p>
    <strong>Escalation:</strong>
    {" "}
    {incident.status === "normal"
      ? "Standby"
      : incident.escalation}
  </p>
</div>
        </div>
      ))}
    </section>
 

<section
  style={{
    marginTop: "24px",
    background: "#111",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "20px",
  }}
>
  <h3 style={{ marginTop: 0 }}>Recent Alert Activity</h3>

  <p style={{ color: "#9ca3af" }}>
    Dashboard test alerts and escalation activity
  </p>
  <p style={{ color: "#22c55e", fontSize: "13px" }}>
  Auto-refresh: every 5 sec
  {recentAlertsCheckedAt &&
    ` • Last checked: ${recentAlertsCheckedAt.toLocaleTimeString("el-GR", {
      timeZone: "Europe/Athens",
    })}`}
</p>

  <div
    style={{
      marginTop: "16px",
      display: "grid",
      gap: "12px",
    }}
  >
    {recentAlerts.slice(0, 5).map((alert, index) => (
  <div
    key={index}
    style={{
      padding: "14px",
      borderRadius: "12px",
      background: "#0f172a",
    }}
  >
    <strong>
      {alert.event_type.toUpperCase()}
    </strong>

    <p>
      Source: {alert.source}
    </p>

    <p>
      Status: {alert.status}
    </p>

    <p>
  Time: {new Date(alert.created_at).toLocaleString("el-GR", {
    timeZone: "Europe/Athens",
  })}
</p>

    <p>
      SMS: {alert.sms_sent} sent /
      {alert.sms_failed} failed
    </p>

    <p>
      Voice: {alert.voice_attempted} attempted / {alert.voice_status}
    </p>
  </div>
))}
  </div>
</section>

</>
)}

        {activeMenu === "Guards" && <Guards />}
        {activeMenu==="Admin Audit Logs" &&
<AdminAuditLogs/>
}
        {activeMenu === "Event Logs" && <EventLogs />}
        {activeMenu === "Sites" && <Sites />}
        {activeMenu === "Settings" && (
<Settings/>
)}

{activeMenu === "Analytics" && (
<Analytics/>
)}
        
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
        <span>
  {systemStatus?.services?.web_app?.status || "Loading"}
</span>
      </div>

      <div
className={`system-status-card ${
systemStatus?.services?.backend_api?.status === "operational"
? "online"
: "warning"
}`}
>

<div>

<h3>Backend API</h3>

<p>
Incident orchestration and event handling
</p>

</div>

<span>

{
systemStatus?.services?.backend_api?.status
||
"Loading"
}

</span>

</div>

      <div
  className={`system-status-card ${
    systemStatus?.services?.sms_gateway?.status === "operational"
      ? "online"
      : "warning"
  }`}
>
  <div>
    <h3>SMS Gateway</h3>
    <p>Vonage SMS delivery channel</p>
  </div>
  <span>
    {systemStatus?.services?.sms_gateway?.status || "Loading"}
  </span>
</div>

      <div
  className={`system-status-card ${
    systemStatus?.services?.voice_calls?.status === "operational"
      ? "online"
      : "warning"
  }`}
>
  <div>
    <h3>Voice Calls</h3>
    <p>Automated outbound emergency calls</p>
  </div>
  <span>
    {systemStatus?.services?.voice_calls?.status || "Loading"}
  </span>
</div>

      <div className="system-status-card warning">
        <div>
          <h3>AI Intake</h3>
          <p>Post-alert structured questioning flow</p>
        </div>
        <span>Demo Mode</span>
      </div>

      <div
  className={`system-status-card ${
    systemStatus?.services?.database?.status === "operational"
      ? "online"
      : "warning"
  }`}
>
  <div>
    <h3>Database</h3>
    <p>Incident history and audit persistence</p>
  </div>

  <span>
    {systemStatus?.services?.database?.status || "Loading"}
  </span>
</div>
    </section>

    <section className="system-status-panel">
      <h2>Current Infrastructure State</h2>
      <p>
        Operational overview of the Aegis Link environment. Service status indicators provide live visibility into communication channels, incident workflows, backend infrastructure, and escalation readiness.
      </p>
    </section>
  </>
)}
      </main>
    </div>
  );
}

export default App;
