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
  const [resolutionForms, setResolutionForms] = useState({});
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
const [resolvedIncidents, setResolvedIncidents] = useState([]);
const [reportPreviewHtml, setReportPreviewHtml] = useState(null);

const [resolvedFilters, setResolvedFilters] = useState({
  date: "",
  site: "",
});

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
  const loadResolvedIncidents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/resolved`);
      const data = await response.json();

      if (data.status === "ok") {
        setResolvedIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error("Failed loading resolved incidents:", err);
    }
  };

  loadResolvedIncidents();

  const interval = setInterval(loadResolvedIncidents, 15000);

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
    : incidentFilter === "Normal"
    ? [...dashboardIncidents].sort((a, b) => {
        const priority = {
          active: 1,
          in_progress: 2,
          normal: 3,
          resolved: 4,
        };

        return (
          (priority[a.status] || 99) -
          (priority[b.status] || 99)
        );
      })
    : dashboardIncidents.filter(
        (incident) =>
          incident.status?.toLowerCase() ===
          incidentFilter.toLowerCase().replace(" ", "_")
      );

      const hasActiveIncident = dashboardIncidents.some(
  (incident) => incident.status === "active"
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
  value === "delivered" ||
  value === "sent"
)
{
  return "flow-completed";
}

  if (value === "failed") {
    return "flow-failed";
  }

  return "flow-ready";
};

const updateResolutionForm = (incidentDbId, field, value) => {
  setResolutionForms((prev) => ({
    ...prev,
    [incidentDbId]: {
      ...prev[incidentDbId],
      [field]: value,
    },
  }));
};

const loadGuardNotesForIncident = async (incidentDbId) => {
  if (!incidentDbId) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/incidents/${incidentDbId}/guard-responses`
    );

    const data = await response.json();

    if (data.status === "ok") {
      updateResolutionForm(
        incidentDbId,
        "guard_notes",
        data.guard_notes || ""
      );
    }
  } catch (err) {
    console.error("Failed loading guard notes:", err);
  }
};

const handlePreviewIncidentReport = async (incident) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/incidents/${incident.id}/report`
    );

    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error("Report generation failed");
    }

    
    const logoUrl = new URL(aegisLogo, window.location.href).href;

    const timelineHtml = data.timeline
      .map(
        (item) => `
          <tr>
            <td>${item.display_time}</td>
            <td>
  ${
    item.event === "Voice Call online"
      ? "Voice Call Completed"
      : item.event
  }
</td>
          </tr>
        `
      )
      .join("");

    const responsesHtml = data.guard_responses
      .map(
        (item) => `
          <div style="margin-bottom:12px">
            <strong>${item.question_text}</strong><br/>
            ${item.answer}
          </div>
        `
      )
      .join("");

    const reportHtml = `
      <html>
  <head>
    <title>${data.report_title}</title>

    <style>
      @page {
        margin: 16mm;
      }

      body {
  font-family: Arial, sans-serif;
  color: #111;
  margin: 0;
  padding: 28px 34px;
  box-sizing: border-box;
}

      .report-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 3px solid #111827;
        padding-bottom: 18px;
        margin-bottom: 28px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .brand img {
        width: 58px;
        height: 58px;
        object-fit: contain;
      }

      .brand-title h1 {
        margin: 0;
        font-size: 28px;
        letter-spacing: 1px;
      }

      .brand-title p {
        margin: 4px 0 0;
        color: #555;
        font-size: 14px;
      }

      .report-meta {
        text-align: right;
        font-size: 13px;
        color: #444;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 28px;
        margin-bottom: 28px;
      }

      .summary-item {
        border-bottom: 1px solid #eee;
        padding-bottom: 8px;
      }

      .label {
        display: block;
        font-size: 11px;
        text-transform: uppercase;
        color: #666;
        letter-spacing: .6px;
        margin-bottom: 3px;
      }

      .value {
        font-size: 15px;
        font-weight: 600;
      }

      h2 {
        margin-top: 30px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
        font-size: 18px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }

      td {
        border-bottom: 1px solid #eee;
        padding: 9px 8px;
        font-size: 14px;
        vertical-align: top;
      }

      .notes {
        white-space: pre-line;
        line-height: 1.5;
      }

      .footer {
        margin-top: 36px;
        padding-top: 14px;
        border-top: 1px solid #ddd;
        font-size: 12px;
        color: #555;
        display: flex;
        justify-content: space-between;
      }

      .preview-toolbar {
  position: sticky;
  top: 0;
  z-index: 999;
  background: #111827;
  padding: 12px;
  text-align: right;
  margin: -28px -34px 24px;
}

.preview-toolbar button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

      @media print {
      .preview-toolbar {
  display: none;
}
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          padding: 0;
        }
      }
    </style>
  </head>

  <body>
  <div class="preview-toolbar">
  <button onclick="window.print()">Print / Save as PDF</button>
</div>
    <div class="report-header">
      <div class="brand">
      <img src="${logoUrl}" alt="Aegis Link Logo" />
        <div class="brand-title">
          <h1>AEGIS LINK</h1>
          <p>Security Operations Platform</p>
        </div>
      </div>

      <div class="report-meta">
        <strong>Security Incident Report</strong><br/>
        Report ID: ${data.report_id}<br/>
        Generated: ${data.generated_at_display}<br/>
        Generated By: ${currentUser?.user?.username || currentUser?.username || "-"}
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-item">
        <span class="label">Incident Ref</span>
        <span class="value">${data.incident.incident_ref}</span>
      </div>

      <div class="summary-item">
        <span class="label">Duration</span>
        <span class="value">${data.incident.duration_display}</span>
      </div>

      <div class="summary-item">
        <span class="label">Site</span>
        <span class="value">${data.incident.site}</span>
      </div>

      <div class="summary-item">
        <span class="label">Guard</span>
        <span class="value">${data.incident.guard}</span>
      </div>

      <div class="summary-item">
        <span class="label">Status</span>
        <span class="value">${data.incident.status}</span>
      </div>

      <div class="summary-item">
        <span class="label">Priority</span>
        <span class="value">${data.incident.priority}</span>
      </div>

      <div class="summary-item">
        <span class="label">Triggered</span>
        <span class="value">${data.incident.trigger_time_display}</span>
      </div>

      <div class="summary-item">
        <span class="label">Resolved</span>
        <span class="value">${data.incident.resolved_time_display}</span>
      </div>
    </div>

    <h2>Incident Timeline</h2>
    <table>
      ${timelineHtml}
    </table>

    <h2>Guard Responses</h2>
    ${responsesHtml}

    <h2>Investigation Notes</h2>

    <p><strong>Supervisor:</strong> ${data.investigation?.supervisor_name || "-"}</p>

    <p>
      <strong>Supervisor Notes:</strong><br/>
      <span class="notes">${data.investigation?.supervisor_notes || "-"}</span>
    </p>

    <p>
      <strong>Guard Notes:</strong><br/>
      <span class="notes">${data.investigation?.guard_notes || "-"}</span>
    </p>

    <p>
      <strong>Residence Notes:</strong><br/>
      <span class="notes">${data.investigation?.residence_notes || "-"}</span>
    </p>

    <p>
      <strong>Admin Notes:</strong><br/>
      <span class="notes">${data.investigation?.admin_notes || "-"}</span>
    </p>

    <h2>Resolution Summary</h2>

    <p><strong>Approved By:</strong> ${data.investigation?.approved_by || "-"}</p>
    <p><strong>Approved At:</strong> ${data.investigation?.approved_at_display || "-"}</p>

    <div class="footer">
      <span>Aegis Link Security Operations Platform</span>
      <span>Generated Automatically</span>
    </div>

    <script>
  window.onload = function() {
    document.title = "${data.report_title}";
  };
</script>
  </body>
</html>
        `;

    setReportPreviewHtml(reportHtml);

  } catch (err) {
    console.error(err);

    alert("Failed to generate report");
  }
};
const handleResolveIncident = async (incident) => {
  const form = resolutionForms[incident.incidentDbId] || {};

  try {
    await fetch(`${API_BASE_URL}/incidents/${incident.incidentDbId}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  supervisor_notified: true,
  supervisor_name:
    form.supervisor_name ||
    currentUser?.user?.username ||
    currentUser?.username ||
    "",

  supervisor_notes: form.supervisor_notes || "",

  guard_contacted: true,
  guard_contacted_name:
    form.guard_contacted_name ||
    incident.guard ||
    "",

  guard_notes: form.guard_notes || "",

  residence_contacted: true,
  residence_contacted_name:
    form.residence_contacted_name ||
    incident.site ||
    "",

  residence_notes: form.residence_notes || "",

  admin_notes: form.admin_notes || "",
  approved_by:
    currentUser?.user?.username ||
    currentUser?.username ||
    "Unknown admin",
}),
    });

    setDashboardIncidents((prev) =>
      prev.filter((item) => item.incidentDbId !== incident.incidentDbId)
    );
  } catch (err) {
    console.error("Resolve incident failed:", err);
  }
};

const gpsAccuracyLabel = (accuracy) => {
  const value = Number(accuracy);

  if (!Number.isFinite(value)) return "Unknown";
  if (value <= 20) return "Excellent";
  if (value <= 50) return "Good";
  if (value <= 100) return "Fair";
  return "Poor";
};

const renderIncidentLocation = (incident) => {
  if (!incident?.incidentLatitude || !incident?.incidentLongitude) {
    return null;
  }

  const address =
    incident.incidentAddress ||
    `${incident.incidentLatitude}, ${incident.incidentLongitude}`;

  return (
    <div className="incident-location-box">
      <h4>📍 Incident Location</h4>

      <p><strong>Address:</strong> {address}</p>

      <p>
        <strong>Accuracy:</strong>{" "}
        {incident.incidentAccuracy
          ? `${incident.incidentAccuracy}m · ${gpsAccuracyLabel(incident.incidentAccuracy)}`
          : "-"}
      </p>

      <p>
        <strong>Battery:</strong>{" "}
        {incident.incidentBatteryLevel !== null &&
        incident.incidentBatteryLevel !== undefined
          ? `${incident.incidentBatteryLevel}%`
          : "-"}
      </p>

      <p>
        <strong>Snapshot Time:</strong>{" "}
        {incident.incidentLocationTimestamp
          ? new Date(incident.incidentLocationTimestamp).toLocaleString("el-GR")
          : "-"}
      </p>

      <button
        type="button"
        onClick={() =>
          window.open(
            `https://www.google.com/maps?q=${incident.incidentLatitude},${incident.incidentLongitude}`,
            "_blank"
          )
        }
      >
        Open Map
      </button>
    </div>
  );
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

    {incidentTimeline.events && incidentTimeline.events.length > 0 ? (
      incidentTimeline.events.map((event) => {
        const eventIcon =
          event.type === "alert"
            ? "🚨"
            : event.type === "call"
            ? "📞"
            : event.type === "sms"
            ? "💬"
            : "●";

        const eventColor =
          event.type === "alert"
            ? "#ff4d4f"
            : event.type === "call"
            ? "#ffac15"
            : event.type === "sms"
            ? "#3b82f6"
            : "#22c55e";

        return (
          <div
            key={event.id}
            style={{
              position: "relative",
              background: "#101010",
              padding: "14px",
              borderRadius: "10px",
              borderLeft: `4px solid ${eventColor}`,
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
                background: eventColor,
                border: "3px solid #0d1117",
              }}
            />

            <strong>
              {eventIcon} {event.label}
            </strong>

            <div
              style={{
                fontSize: "14px",
                color: "#aaaaaa",
                marginTop: "6px",
              }}
            >
              {event.detail}
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "#aaaaaa",
                marginTop: "4px",
              }}
            >
              Time: {formatTimelineTime(event.time)}
            </div>
          </div>
        );
      })
    ) : (
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

        <strong>✅ System Normal</strong>

        <div
          style={{
            fontSize: "14px",
            color: "#aaaaaa",
            marginTop: "6px",
          }}
        >
          No active incident timeline available.
        </div>
      </div>
    )}
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
} ${
  filter === "Active" && hasActiveIncident ? "active-alert-button" : ""
}`}
    onClick={() => setIncidentFilter(filter)}
  >
    {filter}
  </button>
))}
    </section>

    {incidentFilter === "Resolved" && (
  <section className="resolved-filters">
    <input
      type="date"
      value={resolvedFilters.date}
      onChange={(e) =>
        setResolvedFilters({
          ...resolvedFilters,
          date: e.target.value,
        })
      }
    />

    <select
  value={resolvedFilters.site}
  onChange={(e) =>
    setResolvedFilters({
      ...resolvedFilters,
      site: e.target.value,
    })
  }
>
  <option value="">All Sites</option>

  {[...new Set(resolvedIncidents.map((incident) => incident.site_name))]
    .filter(Boolean)
    .map((siteName) => (
      <option key={siteName} value={siteName}>
        {siteName}
      </option>
    ))}
</select>

    <button
      type="button"
      onClick={() =>
        setResolvedFilters({
          date: "",
          site: "",
        })
      }
    >
      Clear Filters
    </button>
  </section>
)}

    <section style={{ display: "grid", gap: "16px" }}>
  {incidentFilter === "Active"
  ? filteredIncidents.length === 0 ? (
      <div className="empty-incident-state">
        <img src={aegisLogo} alt="Aegis Link" />
        <h2>No Active Alert</h2>
        <p>All monitored sites are operating normally.</p>
      </div>
    ) : filteredIncidents.map((incident, index) => (
        <div key={index} className="active-alert-panel">
          <h2>🚨 ALERT ON {incident.site}</h2>

          <p>
            Triggered:{" "}
            {incident.triggerTime
              ? new Date(incident.triggerTime).toLocaleTimeString("el-GR", {
                  timeZone: "Europe/Athens",
                })
              : "-"}
          </p>

          <p>Guard: {incident.guard}</p>
          {renderIncidentLocation(incident)}
        </div>
      ))
      : incidentFilter === "In Progress"
? filteredIncidents.length === 0 ? (
    <div className="empty-incident-state">
      <img src={aegisLogo} alt="Aegis Link" />
      <h2>No Alert In Progress</h2>
      <p>No incidents are currently under investigation.</p>
    </div>
  ) : filteredIncidents.map((incident, index) => (
    <div
      key={index}
      className="incident-detail-card in-progress"
    >
      <h3>🚨 Incident Investigation</h3>

<p><strong>Site:</strong> {incident.site}</p>
<p><strong>Guard:</strong> {incident.guard}</p>
<p><strong>Incident:</strong> {incident.incidentId}</p>
{renderIncidentLocation(incident)}

<hr />

<h4>Supervisor</h4>

<label>
  Supervisor Name
  <input
  type="text"
  defaultValue={
    currentUser?.user?.username ||
    currentUser?.username ||
    ""
  }
  onBlur={(e) => {
    updateResolutionForm(
      incident.incidentDbId,
      "supervisor_notified",
      true
    );

    updateResolutionForm(
      incident.incidentDbId,
      "supervisor_name",
      e.target.value
    );
  }}
/>
</label>

<label>
  Supervisor Notes
  <textarea
  rows="3"
  onChange={(e) =>
    updateResolutionForm(
      incident.incidentDbId,
      "supervisor_notes",
      e.target.value
    )
  }
/>
</label>

<hr />

<h4>Guard Contact</h4>

<label>
  Guard Contact Name
  <input
  type="text"
  defaultValue={incident.guard || ""}
  onBlur={(e) =>
    updateResolutionForm(
      incident.incidentDbId,
      "guard_contacted_name",
      e.target.value
    )
  }
/>
</label>

<label>
  Guard Notes
  <textarea
  rows="4"
  placeholder="Guard report / incident description"
  value={
    resolutionForms[incident.incidentDbId]?.guard_notes || ""
  }
  onFocus={async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/incidents/${incident.incidentDbId}/guard-responses`
      );

      const data = await response.json();

      updateResolutionForm(
        incident.incidentDbId,
        "guard_notes",
        data.guard_notes || ""
      );
    } catch (err) {
      console.error("Failed loading guard responses:", err);
    }
  }}
  onChange={(e) =>
    updateResolutionForm(
      incident.incidentDbId,
      "guard_notes",
      e.target.value
    )
  }
/>
</label>

<hr />

<h4>Residence Contact</h4>

<label>
  Residence Contact Name
  <input
  type="text"
  defaultValue={incident.site || ""}
  onBlur={(e) =>
    updateResolutionForm(
      incident.incidentDbId,
      "residence_contacted_name",
      e.target.value
    )
  }
/>
</label>

<label>
  Residence Notes
  <textarea
    rows="3"
    onChange={(e) =>
      updateResolutionForm(
        incident.incidentDbId,
        "residence_notes",
        e.target.value
      )
    }
  />
</label>

<hr />

<h4>Admin Review</h4>

<label>
  Admin Notes
  <textarea
    rows="6"
    onChange={(e) =>
      updateResolutionForm(
        incident.incidentDbId,
        "admin_notes",
        e.target.value
      )
    }
  />
</label>

<button
  className="resolve-button"
  onClick={() => handleResolveIncident(incident)}
>
  Approve & Resolve
</button>
    </div>
  ))

    : incidentFilter === "Resolved"
? resolvedIncidents
    .filter((incident) => {
      const dateMatch =
        !resolvedFilters.date ||
        incident.resolved_time?.startsWith(resolvedFilters.date);

      const siteMatch =
        !resolvedFilters.site ||
        incident.site_name?.toLowerCase().includes(resolvedFilters.site.toLowerCase());

      return dateMatch && siteMatch;
    })
    .map((incident, index) => (
      <div key={index} className="incident-detail-card resolved">
        <h3>✅ {incident.incident_ref}</h3>
        <p><strong>Site:</strong> {incident.site_name}</p>
        <p><strong>Guard:</strong> {incident.guard_name}</p>
        {renderIncidentLocation({
  incidentLatitude: incident.incident_latitude,
  incidentLongitude: incident.incident_longitude,
  incidentAccuracy: incident.incident_accuracy,
  incidentBatteryLevel: incident.incident_battery_level,
  incidentAddress: incident.incident_address,
  incidentLocationTimestamp: incident.incident_location_timestamp,
})}
        <p><strong>Resolved:</strong> {incident.resolved_time ? new Date(incident.resolved_time).toLocaleString("el-GR") : "-"}</p>
        <p><strong>Approved By:</strong> {incident.approved_by || "-"}</p>
        <p><strong>Supervisor:</strong> {incident.supervisor_name || "-"}</p>
        <p><strong>Guard Contact:</strong> {incident.guard_contacted_name || "-"}</p>
        <p><strong>Residence Contact:</strong> {incident.residence_contacted_name || "-"}</p>
        <p><strong>Admin Notes:</strong> {incident.admin_notes || "-"}</p>
        <div className="report-actions">
  <button
    type="button"
    onClick={() => handlePreviewIncidentReport(incident)}
  >
    👁 Preview Report
  </button>

  <button
  type="button"
  onClick={() =>
    window.open(
      `${API_BASE_URL}/incidents/${incident.id}/report/pdf`,
      "_blank"
    )
  }
>
  ⬇ Download PDF
</button>
</div>
      </div>
    ))
: filteredIncidents.map((incident, index) => (
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
              {incident.status === "inactive"
  ? "Inactive"
  : incident.status === "normal"
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
              {incident.status === "inactive"
  ? "Site inactive"
  : incident.status === "normal"
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
              <strong>Status:</strong>{" "}
              {incident.status === "inactive"
  ? "Site inactive"
  : incident.status === "normal"
  ? "Waiting for incident trigger"
  : incident.aiSummary}
            </p>

            <p>
              <strong>Site:</strong> {incident.site}
            </p>
            {renderIncidentLocation(incident)}

            <p>
              <strong>Escalation:</strong>{" "}
              {incident.status === "normal"
                ? "Standby"
                : incident.escalation}
            </p>
          </div>
        </div>
      ))}
</section>
 
{incidentFilter === "All" && (        
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
)}

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

{reportPreviewHtml && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>Incident Report Preview</h2>

        <button
          type="button"
          onClick={() => setReportPreviewHtml(null)}
        >
          ✕
        </button>
      </div>

      <iframe
        title="Incident Report Preview"
        className="report-preview-frame"
        srcDoc={reportPreviewHtml}
      />
    </div>
  </div>
)}

      </main>
    </div>
  );
}

export default App;
