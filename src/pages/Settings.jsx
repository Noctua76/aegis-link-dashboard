import { useEffect, useState } from "react";
import "./Settings.css";

function Settings() {
  const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";

  const [systemStatus, setSystemStatus] = useState(null);
  const [alertConfig, setAlertConfig] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [sites, setSites] = useState([]);
const [guards, setGuards] = useState([]);
const [editingSite, setEditingSite] = useState(null);
const [profileSite, setProfileSite] = useState(null);
const [expandedSiteId, setExpandedSiteId] = useState(null);
const [sopFile, setSopFile] = useState(null);
const [isUploadingSop, setIsUploadingSop] = useState(false);
const [document1File, setDocument1File] = useState(null);
const [document2File, setDocument2File] = useState(null);

const [isUploadingDocument1, setIsUploadingDocument1] = useState(false);
const [isUploadingDocument2, setIsUploadingDocument2] = useState(false);

const [newSite, setNewSite] = useState({
  name: "",
  location: "",
  required_shifts: "",
});

const [newGuard, setNewGuard] = useState({
  full_name: "",
  username: "",
  phone: "",
  password: "",
  site_id: "",
});

const [newRecipient, setNewRecipient] = useState({
full_name:"",
phone:"",
sms_enabled:true,
voice_enabled:true,
});
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const loadAlertConfiguration = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/settings/alert-configuration`
    );

    const data = await response.json();

    setAlertConfig(data);
  } catch (err) {
    console.error("Alert configuration error", err);
  }
};

const loadRecipients = async () => {
try{

const response = await fetch(
`${API_BASE_URL}/settings/alert-recipients`
);

const data = await response.json();

setRecipients(data.recipients || []);

}catch(err){

console.error(
"Recipients load error",
err
);

}
};

const loadSites = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/sites`);
    const data = await response.json();

    setSites(data.sites || []);
  } catch (err) {
    console.error("Sites load error", err);
  }
};

const loadGuards = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/guards`);
    const data = await response.json();

    setGuards(data.guards || []);
  } catch (err) {
    console.error("Guards load error", err);
  }
};

const addRecipient = async () => {

try{

await fetch(
`${API_BASE_URL}/settings/alert-recipients`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
},
body:JSON.stringify(newRecipient),
}
);

setNewRecipient({
full_name:"",
phone:"",
sms_enabled:true,
voice_enabled:true,
});

await loadRecipients();

}catch(err){

console.error(
"Add recipient error",
err
);

}

};

const addSite = async () => {
  try {
    await fetch(`${API_BASE_URL}/settings/sites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSite),
    });

    setNewSite({
      name: "",
      location: "",
      required_shifts: "",
    });

    await loadSites();
  } catch (err) {
    console.error("Add site error", err);
  }
};

const updateSite = async () => {
  if (!editingSite) return;

  try {
    await fetch(`${API_BASE_URL}/settings/sites/${editingSite.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingSite),
    });

    setEditingSite(null);
    await loadSites();
  } catch (err) {
    console.error("Update site error", err);
  }
};

const uploadSopFile = async () => {
  if (!profileSite || !sopFile) return;

  try {
    setIsUploadingSop(true);

    const formData = new FormData();
    formData.append("sop_file", sopFile);

    const response = await fetch(
      `${API_BASE_URL}/settings/sites/${profileSite.id}/sop/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "SOP upload failed");
    }

    setProfileSite({
      ...profileSite,
      sop_file_url: data.sop_file_url,
      sop_updated_at: data.site?.sop_updated_at,
    });

    setSopFile(null);
    await loadSites();
  } catch (err) {
    console.error("SOP upload error", err);
    alert(err.message || "SOP upload failed");
  } finally {
    setIsUploadingSop(false);
  }
};

const uploadSiteDocument = async (slot, file) => {
  if (!profileSite || !file) return;

  try {
    if (slot === 1) {
      setIsUploadingDocument1(true);
    } else {
      setIsUploadingDocument2(true);
    }

    const formData = new FormData();
    formData.append("site_document", file);

    const response = await fetch(
      `${API_BASE_URL}/settings/sites/${profileSite.id}/documents/${slot}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    setProfileSite({
      ...profileSite,
      [`document_${slot}_url`]: data.document_url,
    });

    await loadSites();
  } catch (err) {
    console.error("Document upload error:", err);
    alert(err.message);
  } finally {
    setIsUploadingDocument1(false);
    setIsUploadingDocument2(false);
  }
};

const updateSiteProfile = async () => {
  if (!profileSite) return;

  try {
    await fetch(`${API_BASE_URL}/settings/sites/${profileSite.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileSite),
    });

    setProfileSite(null);
    await loadSites();
  } catch (err) {
    console.error("Update site profile error", err);
  }
};

const addGuard = async () => {
  try {
    await fetch(`${API_BASE_URL}/settings/guards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newGuard),
    });

    setNewGuard({
      full_name: "",
      username: "",
      phone: "",
      password: "",
      site_id: "",
    });

    await loadGuards();
  } catch (err) {
    console.error("Add guard error", err);
  }
};


  useEffect(() => {
    

loadAlertConfiguration();
loadRecipients();
loadSites();
loadGuards();
    async function loadSystemStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/system/status`);
        const data = await response.json();

        setSystemStatus(data);
      } catch (err) {
        console.error("Settings system status error:", err);

        setSystemStatus({
          overall_status: "offline",
          services: {
            web_app: { status: "offline" },
            backend_api: { status: "offline" },
            sms_gateway: { status: "unknown" },
            voice_calls: { status: "unknown" },
            database: { status: "unknown" },
          },
        });
      }
    }

    loadSystemStatus();

    const interval = setInterval(() => {
  loadSystemStatus();
loadAlertConfiguration();
loadRecipients();
loadSites();
loadGuards();
}, 5000);

    
    return () => clearInterval(interval);
  }, []);

  const handleTestAlert = async () => {
  setIsTestingAlert(true);

  try {
    const response = await fetch(`${API_BASE_URL}/alerts/test`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Test alert failed");
    }

    await loadAlertConfiguration();
  } catch (err) {
    console.error("Test alert error", err);
    alert(err.message || "Test alert failed");
  } finally {
    setIsTestingAlert(false);
  }
};

const createDefaultShiftRules = (requiredShifts = 1) => {
  const templates = {
    1: [
      { name: "Shift 1", start: "07:00", end: "19:00" },
    ],
    2: [
      { name: "Shift 1", start: "07:00", end: "19:00" },
      { name: "Shift 2", start: "19:00", end: "07:00" },
    ],
    3: [
      { name: "Shift 1", start: "07:00", end: "15:00" },
      { name: "Shift 2", start: "15:00", end: "23:00" },
      { name: "Shift 3", start: "23:00", end: "07:00" },
    ],
  };

  return {
    shifts: templates[requiredShifts] || Array.from(
      { length: requiredShifts },
      (_, index) => ({
        name: `Shift ${index + 1}`,
        start: "",
        end: "",
      })
    ),
  };
};

const printSiteProfile = (site) => {
  if (!site) return;

  const formatValue = (value) => value || "-";

  const shiftsHtml = site.shift_rules?.shifts?.length
    ? site.shift_rules.shifts
        .map(
          (shift) => `
            <tr>
              <td>${formatValue(shift.name)}</td>
              <td>${formatValue(shift.start)}</td>
              <td>${formatValue(shift.end)}</td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="3">No shift rules configured</td>
      </tr>
    `;

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Aegis Link Site Operational Profile</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111;
            padding: 32px;
          }

          .report-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 3px solid #111827;
            padding-bottom: 18px;
            margin-bottom: 28px;
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

          h2 {
            margin-top: 28px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
            font-size: 18px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 28px;
          }

          .item {
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

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            border-bottom: 1px solid #eee;
            padding: 9px 8px;
            text-align: left;
            font-size: 14px;
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
        </style>
      </head>

      <body>
        <div class="report-header">
          <div class="brand-title">
            <h1>AEGIS LINK</h1>
            <p>Security Operations Platform</p>
          </div>

          <div class="report-meta">
            <strong>Site Operational Profile</strong><br/>
            Site ID: SITE-${String(site.id).padStart(3, "0")}<br/>
            Generated: ${new Date().toLocaleString("el-GR")}<br/>
            Generated By: elias_admin
          </div>
        </div>

        <h2>Site Information</h2>
        <div class="grid">
          <div class="item"><span class="label">Site Name</span><span class="value">${formatValue(site.name)}</span></div>
          <div class="item"><span class="label">Location</span><span class="value">${formatValue(site.location)}</span></div>
          <div class="item"><span class="label">Full Address</span><span class="value">${formatValue(site.full_address)}</span></div>
          <div class="item"><span class="label">Site Phone</span><span class="value">${formatValue(site.site_phone)}</span></div>
          <div class="item"><span class="label">Status</span><span class="value">${formatValue(site.status)}</span></div>
          <div class="item"><span class="label">Required Shifts</span><span class="value">${formatValue(site.required_shifts)}</span></div>
        </div>

        <h2>Coverage & Shift Rules</h2>
        <div class="grid">
          <div class="item"><span class="label">Coverage Type</span><span class="value">${formatValue(site.coverage_type)}</span></div>
          <div class="item"><span class="label">Schedule Mode</span><span class="value">${formatValue(site.shift_rules?.schedule_mode)}</span></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Shift</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            ${shiftsHtml}
          </tbody>
        </table>

        <h2>Contacts</h2>
        <div class="grid">
          <div class="item"><span class="label">Residence Contact</span><span class="value">${formatValue(site.residence_contact_name)}</span></div>
          <div class="item"><span class="label">Residence Phone</span><span class="value">${formatValue(site.residence_contact_phone)}</span></div>
          <div class="item"><span class="label">Supervisor Contact</span><span class="value">${formatValue(site.supervisor_contact_name)}</span></div>
          <div class="item"><span class="label">Supervisor Phone</span><span class="value">${formatValue(site.supervisor_contact_phone)}</span></div>
        </div>

        <h2>Operational Notes</h2>
        <p><strong>General Notes:</strong><br/><span class="notes">${formatValue(site.general_notes)}</span></p>
        <p><strong>Access Instructions:</strong><br/><span class="notes">${formatValue(site.access_instructions)}</span></p>
        <p><strong>Patrol Instructions:</strong><br/><span class="notes">${formatValue(site.patrol_instructions)}</span></p>
        <p><strong>Emergency Instructions:</strong><br/><span class="notes">${formatValue(site.emergency_instructions)}</span></p>
        <p><strong>Special Warnings:</strong><br/><span class="notes">${formatValue(site.special_warnings)}</span></p>

        <h2>SOP Documentation</h2>

<div class="grid">
  <div class="item">
    <span class="label">SOP Title</span>
    <span class="value">${formatValue(site.sop_title)}</span>
  </div>

  <div class="item">
    <span class="label">SOP Version</span>
    <span class="value">${formatValue(site.sop_version)}</span>
  </div>
</div>

<p>
  <strong>SOP Text:</strong><br/>
  <span class="notes">${formatValue(site.sop_text)}</span>
</p>

<p>
  <strong>SOP File URL:</strong><br/>
  <span class="notes">${formatValue(site.sop_file_url)}</span>
</p>

        <div class="footer">
          <span>Aegis Link Security Operations Platform</span>
          <span>Generated Automatically</span>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

const formatGreekDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("el-GR", {
    timeZone: "Europe/Athens",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};


  return (
    <>
      <header style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "700" }}>
          Settings
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#9ca3af",
            fontSize: "15px",
          }}
        >
          Operational configuration and system controls
        </p>
      </header>

      <section className="settings-grid">
        <div className="settings-card">
  <h3>Alert Configuration</h3>

  <div className="settings-item">
    <span>SMS Recipients</span>
    <strong>{alertConfig?.sms?.recipients_count ?? "-"}</strong>
  </div>

  <div className="settings-item">
    <span>Voice Call Recipients</span>
    <strong>{alertConfig?.voice?.recipients_count ?? "-"}</strong>
  </div>

  <div className="settings-item">
    <span>Escalation Order</span>
    <strong>{alertConfig?.escalation?.order ?? "-"}</strong>
  </div>

  <div className="settings-item">
    <span>SMS Status</span>
    <strong>{alertConfig?.last_test?.sms?.status || "-"}</strong>
  </div>

  <div className="settings-item">
    <span>Voice Status</span>
    <strong>{alertConfig?.last_test?.voice?.status || "-"}</strong>
  </div>

  <div className="settings-item">
    <span>Last Test</span>
    <strong>{formatGreekDateTime(alertConfig?.last_test?.tested_at)}</strong>
  </div>

  <hr />

<h4>Recipients</h4>

<input
placeholder="Name"
value={newRecipient.full_name}
onChange={(e)=>
setNewRecipient({
...newRecipient,
full_name:e.target.value
})
}
/>

<input
placeholder="+3069..."
value={newRecipient.phone}
onChange={(e)=>
setNewRecipient({
...newRecipient,
phone:e.target.value
})
}
/>

<button onClick={addRecipient}>
Add Recipient
</button>

<button
className="secondary-button"
onClick={()=>
setShowRecipientsModal(true)
}
>
Manage Recipients
</button>
  
  <button
  onClick={handleTestAlert}
  disabled={isTestingAlert}
>
  {isTestingAlert ? "Sending..." : "Send Test Alert"}
</button>
</div>

<div className="settings-card">
  <h3>Sites Management</h3>

  <input
    placeholder="Site name"
    value={newSite.name}
    onChange={(e) =>
      setNewSite({
        ...newSite,
        name: e.target.value,
      })
    }
  />

  <input
    placeholder="Location"
    value={newSite.location}
    onChange={(e) =>
      setNewSite({
        ...newSite,
        location: e.target.value,
      })
    }
  />

  <label className="settings-field">
  <span>Required Shifts</span>

  <select
    value={newSite.required_shifts}
    onChange={(e) =>
      setNewSite({
        ...newSite,
        required_shifts: Number(e.target.value),
      })
    }
  >
    <option value="">Select shifts</option>
    <option value={1}>1 Shift</option>
    <option value={2}>2 Shifts</option>
    <option value={3}>3 Shifts</option>
    <option value={4}>4 Shifts</option>
    <option value={5}>5 Shifts</option>
  </select>
</label>

  <button onClick={addSite}>Add Site</button>

  <hr />

  {sites.map((site, index) => (
  <div
    key={site.id}
    className="settings-item"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "10px",
    }}
  >
    <div
      style={{
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onClick={() =>
        setExpandedSiteId(
          expandedSiteId === site.id ? null : site.id
        )
      }
    >
      <div>
        <strong>
          SITE-{String(index + 1).padStart(3, "0")} | {site.name}
        </strong>

        <br />

        <small>{site.location}</small>

        <br />

        <small>
          {site.status === "active" ? "Active" : "Inactive"}
          {" • "}
          {site.required_shifts || 1}
          {" "}
          {(site.required_shifts || 1) === 1
            ? "shift"
            : "shifts"}
        </small>
      </div>

      <strong>
        {expandedSiteId === site.id ? "▲" : "▼"}
      </strong>
    </div>

    {expandedSiteId === site.id && (
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setEditingSite(site);
          }}
        >
          Edit
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setProfileSite(site);
          }}
        >
          Profile
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={async () => {
            try {
              await fetch(
                `${API_BASE_URL}/settings/sites/${site.id}/toggle-active`,
                {
                  method: "PUT",
                }
              );

              await loadSites();
            } catch (err) {
              console.error("Toggle site active error", err);
            }
          }}
        >
          {site.status === "active"
            ? "Deactivate"
            : "Activate"}
        </button>

        <button
          type="button"
          className="secondary-button danger-button"
          onClick={async () => {
            const confirmed = window.confirm(
              "Archive this site? It will be removed from operational views, but historical incidents and reports will remain available."
            );

            if (!confirmed) return;

            try {
              await fetch(
                `${API_BASE_URL}/settings/sites/${site.id}/archive`,
                {
                  method: "PUT",
                }
              );

              await loadSites();
            } catch (err) {
              console.error("Archive site error", err);
            }
          }}
        >
          Archive
        </button>
      </div>
    )}
  </div>
))}
</div>


<div className="settings-card">
  <h3>Guards Management</h3>

  <input
    placeholder="Full name"
    value={newGuard.full_name}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        full_name: e.target.value,
      })
    }
  />

  <input
    placeholder="Username"
    value={newGuard.username}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        username: e.target.value,
      })
    }
  />

  <input
    placeholder="Phone"
    value={newGuard.phone}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        phone: e.target.value,
      })
    }
  />

  <input
    type="password"
    placeholder="Temporary password"
    value={newGuard.password}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        password: e.target.value,
      })
    }
  />

  <select
    value={newGuard.site_id}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        site_id: e.target.value,
      })
    }
  >
    <option value="">Assign to site</option>

    {sites.map((site) => (
      <option key={site.id} value={site.id}>
        {site.name}
      </option>
    ))}
  </select>

  <button onClick={addGuard}>Add Guard</button>

  <hr />

  {guards.map((guard) => (
    <div key={guard.id} className="settings-item">
      <span>
        {guard.full_name}
        <br />
        <small>
          {guard.username} · {guard.site_name || "No site"}
        </small>
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
  <strong>
    {guard.active ? "Active" : "Inactive"}
  </strong>

  <button
    type="button"
    className="secondary-button"
    onClick={async () => {
      try {
        await fetch(
          `${API_BASE_URL}/settings/guards/${guard.id}/toggle-active`,
          {
            method: "PUT",
          }
        );

        await loadGuards();
      } catch (err) {
        console.error("Toggle guard active error", err);
      }
    }}
  >
    {guard.active ? "Deactivate" : "Activate"}
  </button>
</div>
    </div>
  ))}
</div>

        <div className="settings-card">
          <h3>Incident Rules</h3>

          <div className="settings-item">
            <span>Timeline Reset</span>
            <strong>1 hour</strong>
          </div>

          <div className="settings-item">
            <span>Default Priority</span>
            <strong>High</strong>
          </div>

          <div className="settings-item">
            <span>AI Intake</span>
            <strong>Enabled</strong>
          </div>
        </div>

        <div className="settings-card">
          <h3>Guard Sessions</h3>

          <div className="settings-item">
            <span>Heartbeat</span>
            <strong>30 sec</strong>
          </div>

          <div className="settings-item">
            <span>Offline Timeout</span>
            <strong>90 sec</strong>
          </div>

          <div className="settings-item">
            <span>Auto Close</span>
            <strong>Enabled</strong>
          </div>
        </div>

        <div className="settings-card">
  <h3>System Integrations</h3>

  <div className="integration-status">
    <strong>Web App</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.web_app?.status || "Loading"}
    </div>
  </div>

  <div className="integration-status">
    <strong>Backend API</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.backend_api?.status || "Loading"}
    </div>

    <div style={{ fontSize: "12px", color: "#6b7280" }}>
      {systemStatus?.services?.backend_api?.message}
    </div>
  </div>

  <div className="integration-status">
    <strong>SMS Gateway</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.sms_gateway?.status || "Loading"}
    </div>

    <div style={{ fontSize: "12px", color: "#6b7280" }}>
      Configured:
      {" "}
      {systemStatus?.services?.sms_gateway?.configured
        ? "Yes"
        : "No"}
    </div>
  </div>

  <div className="integration-status">
    <strong>Voice Calls</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.voice_calls?.status || "Loading"}
    </div>

    <div style={{ fontSize: "12px", color: "#6b7280" }}>
      Configured:
      {" "}
      {systemStatus?.services?.voice_calls?.configured
        ? "Yes"
        : "No"}
    </div>
  </div>

  <div className="integration-status">
    <strong>Database</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.database?.status || "Loading"}
    </div>

    <div style={{ fontSize: "12px", color: "#6b7280" }}>
      Server:
      {" "}
      {formatGreekDateTime(systemStatus?.services?.database?.server_time)}
    </div>
  </div>

  <div
    style={{
      marginTop: "16px",
      paddingTop: "12px",
      borderTop: "1px solid #242424",
      fontSize: "12px",
      color: "#9ca3af",
    }}
  >
    Last checked:
    {" "}
    {formatGreekDateTime(systemStatus?.checked_at)}

    <br />

    Response:
    {" "}
    {systemStatus?.response_time_ms || "-"} ms
  </div>

</div>
        <div className="settings-card">
          <h3>Notifications</h3>

          <div className="settings-item">
            <span>Desktop Alerts</span>
            <strong>Enabled</strong>
          </div>

          <div className="settings-item">
            <span>Sound Alerts</span>
            <strong>Enabled</strong>
          </div>

          <div className="settings-item">
            <span>Push Notifications</span>
            <strong>Disabled</strong>
          </div>
        </div>

        <div className="settings-card">
          <h3>AI Configuration</h3>

          <div className="settings-item">
  <span>Assistant</span>

  <strong>
    {systemStatus?.services?.ai_intake?.configured
      ? "Enabled"
      : "Disabled"}
  </strong>
</div>

          <div className="settings-item">
            <span>Model</span>
            <strong>GPT-4.1-mini</strong>
          </div>

          <div className="settings-item">
            <span>Auto Summary</span>
            <strong>Enabled</strong>
          </div>
        </div>
      </section>
      {showRecipientsModal && (

<div className="modal-overlay">

<div className="recipients-modal">

<div className="modal-header">

<h3>
Alert Recipients
</h3>

<button
className="modal-close"

onClick={()=>
setShowRecipientsModal(
false
)
}
>

×

</button>

</div>

<div className="recipients-list-modal">

{recipients.map(
(item)=>(

<div
key={item.id}

className="
recipient-row-modal
"
>

<div>

<strong>
{item.full_name}
</strong>

<span>
{item.phone}
</span>

</div>

<button
className="danger-btn"

onClick={async()=>{

try{

await fetch(
`${API_BASE_URL}/settings/alert-recipients/${item.id}`,
{
method:
"DELETE"
}
);

loadRecipients();

}catch(err){

console.error(
err
);

}

}}
>

Delete

</button>

</div>

)

)}

</div>

</div>

</div>

)}

{editingSite && (
  <div className="modal-overlay">
    <div className="recipients-modal">
      <div className="modal-header">
        <h3>Edit Site</h3>

        <button
          className="modal-close"
          onClick={() => setEditingSite(null)}
        >
          ×
        </button>
      </div>

      <input
        placeholder="Site name"
        value={editingSite.name || ""}
        onChange={(e) =>
          setEditingSite({
            ...editingSite,
            name: e.target.value,
          })
        }
      />

      <input
        placeholder="Location"
        value={editingSite.location || ""}
        onChange={(e) =>
          setEditingSite({
            ...editingSite,
            location: e.target.value,
          })
        }
      />

      <input
        type="number"
        min="1"
        placeholder="Required shifts"
        value={editingSite.required_shifts || 1}
        onChange={(e) =>
          setEditingSite({
            ...editingSite,
            required_shifts: Number(e.target.value),
          })
        }
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        <button onClick={updateSite}>
          Save Changes
        </button>

        <button
          className="secondary-button"
          onClick={() => setEditingSite(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{profileSite && (
  <div className="modal-overlay">
    <div className="recipients-modal">
      <div className="modal-header">
        <h3>Site Profile</h3>

        <button
          className="modal-close"
          onClick={() => setProfileSite(null)}
        >
          ×
        </button>
      </div>

      <h4>Site Information</h4>

<label className="settings-field">
  <span>Full Address</span>

  <input
    placeholder="Full address"
    value={profileSite.full_address || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        full_address: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Site Phone</span>

  <input
    placeholder="Site phone"
    value={profileSite.site_phone || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        site_phone: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Coverage Type</span>

  <select
    value={profileSite.coverage_type || "24_7"}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        coverage_type: e.target.value,
        shift_rules:
          profileSite.shift_rules ||
          createDefaultShiftRules(profileSite.required_shifts || 1),
      })
    }
  >
    <option value="24_7">24/7 Coverage</option>
    <option value="custom">Custom Hours</option>
  </select>
</label>

<div className="settings-field">
  <span>Schedule Mode</span>

  <select
    value={profileSite.shift_rules?.schedule_mode || "daily"}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        shift_rules: {
          ...(profileSite.shift_rules || {}),
          schedule_mode: e.target.value,
          shifts:
            profileSite.shift_rules?.shifts ||
            createDefaultShiftRules(
              profileSite.required_shifts || 1
            ).shifts,
        },
      })
    }
  >
    <option value="daily">Daily</option>
    <option value="weekly">Specific Days of Week</option>
    <option value="monthly">Specific Days of Month</option>
  </select>
</div>

{profileSite.shift_rules?.schedule_mode === "weekly" && (
  <div className="settings-field">
    <span>Days of Week</span>

    <input
      placeholder="Mon,Tue,Wed,Thu,Fri"
      value={
        profileSite.shift_rules?.days_of_week?.join(",") || ""
      }
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          shift_rules: {
            ...profileSite.shift_rules,
            days_of_week: e.target.value
              .split(",")
              .map((d) => d.trim()),
          },
        })
      }
    />
  </div>
)}

{profileSite.shift_rules?.schedule_mode === "monthly" && (
  <div className="settings-field">
    <span>Days of Month</span>

    <input
      placeholder="1,5,10,15,20"
      value={
        profileSite.shift_rules?.days_of_month?.join(",") || ""
      }
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          shift_rules: {
            ...profileSite.shift_rules,
            days_of_month: e.target.value
              .split(",")
              .map((d) => d.trim()),
          },
        })
      }
    />
  </div>
)}

<div className="settings-field">
  <span>Shift Rules</span>

  {(profileSite.shift_rules?.shifts ||
    createDefaultShiftRules(profileSite.required_shifts || 1).shifts
  ).map((shift, index) => (
    <div
      key={index}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <input
        value={shift.name}
        onChange={(e) => {
          const updated = [...(profileSite.shift_rules?.shifts || [])];

          updated[index] = {
            ...updated[index],
            name: e.target.value,
          };

          setProfileSite({
            ...profileSite,
            shift_rules: {
              ...profileSite.shift_rules,
              shifts: updated,
            },
          });
        }}
      />

      <input
        type="time"
        value={shift.start}
        onChange={(e) => {
          const updated = [...(profileSite.shift_rules?.shifts || [])];

          updated[index] = {
            ...updated[index],
            start: e.target.value,
          };

          setProfileSite({
            ...profileSite,
            shift_rules: {
              ...profileSite.shift_rules,
              shifts: updated,
            },
          });
        }}
      />

      <input
        type="time"
        value={shift.end}
        onChange={(e) => {
          const updated = [...(profileSite.shift_rules?.shifts || [])];

          updated[index] = {
            ...updated[index],
            end: e.target.value,
          };

          setProfileSite({
            ...profileSite,
            shift_rules: {
              ...profileSite.shift_rules,
              shifts: updated,
            },
          });
        }}
      />

      <button
        type="button"
        onClick={() => {
          const updated =
            profileSite.shift_rules.shifts.filter(
              (_, i) => i !== index
            );

          setProfileSite({
            ...profileSite,
            shift_rules: {
              ...profileSite.shift_rules,
              shifts: updated,
            },
          });
        }}
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    className="secondary-button"
    onClick={() => {
      const current =
        profileSite.shift_rules?.shifts || [];

      setProfileSite({
        ...profileSite,
        shift_rules: {
          ...profileSite.shift_rules,
          shifts: [
            ...current,
            {
              name: `Shift ${current.length + 1}`,
              start: "",
              end: "",
            },
          ],
        },
      });
    }}
  >
    Add Shift
  </button>
</div>

      <h4>Residence Contact</h4>

      <input
        placeholder="Contact name"
        value={profileSite.residence_contact_name || ""}
        onChange={(e) =>
          setProfileSite({
            ...profileSite,
            residence_contact_name: e.target.value,
          })
        }
      />

      <input
        placeholder="Contact phone"
        value={profileSite.residence_contact_phone || ""}
        onChange={(e) =>
          setProfileSite({
            ...profileSite,
            residence_contact_phone: e.target.value,
          })
        }
      />

      <h4>Supervisor Contact</h4>

      <input
        placeholder="Supervisor name"
        value={profileSite.supervisor_contact_name || ""}
        onChange={(e) =>
          setProfileSite({
            ...profileSite,
            supervisor_contact_name: e.target.value,
          })
        }
      />

      <input
        placeholder="Supervisor phone"
        value={profileSite.supervisor_contact_phone || ""}
        onChange={(e) =>
          setProfileSite({
            ...profileSite,
            supervisor_contact_phone: e.target.value,
          })
        }
      />

      <h4>Operational Notes</h4>

<label className="settings-field">
  <span>General Notes</span>

  <textarea
    rows="3"
    value={profileSite.general_notes || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        general_notes: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Access Instructions</span>

  <textarea
    rows="3"
    value={profileSite.access_instructions || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        access_instructions: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Patrol Instructions</span>

  <textarea
    rows="3"
    value={profileSite.patrol_instructions || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        patrol_instructions: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Emergency Instructions</span>

  <textarea
    rows="3"
    value={profileSite.emergency_instructions || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        emergency_instructions: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Special Warnings</span>

  <textarea
    rows="3"
    value={profileSite.special_warnings || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        special_warnings: e.target.value,
      })
    }
  />
</label>

<h4>SOP Documentation</h4>

<div className="sop-panel">
  <label className="settings-field">
    <span>SOP Title</span>
    <input
      placeholder="Standard Operating Procedure"
      value={profileSite.sop_title || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          sop_title: e.target.value,
        })
      }
    />
  </label>

  <label className="settings-field">
    <span>SOP Version</span>
    <input
      placeholder="v1.0"
      value={profileSite.sop_version || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          sop_version: e.target.value,
        })
      }
    />
  </label>

  <label className="settings-field">
    <span>SOP Text</span>
    <textarea
      rows="5"
      value={profileSite.sop_text || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          sop_text: e.target.value,
        })
      }
    />
  </label>

  <div className="sop-current-file">
    <span>Current SOP File</span>

    {profileSite.sop_file_url ? (
      <div className="sop-actions-row">
        <button
          type="button"
          className="secondary-button"
          onClick={() => window.open(profileSite.sop_file_url, "_blank")}
        >
          View SOP
        </button>

        <a
          className="secondary-button"
          href={profileSite.sop_file_url}
          target="_blank"
          rel="noreferrer"
          download
        >
          Download PDF
        </a>
      </div>
    ) : (
      <small>No SOP PDF uploaded</small>
    )}
  </div>

  <label className="settings-field">
    <span>Replace SOP PDF</span>

    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => {
        setSopFile(e.target.files?.[0] || null);
      }}
    />
  </label>

  {sopFile && (
    <button
      type="button"
      className="secondary-button"
      disabled={isUploadingSop}
      onClick={uploadSopFile}
    >
      {isUploadingSop ? "Uploading..." : "Upload Selected PDF"}
    </button>
  )}
</div>

<h4>Additional Site Documents</h4>

<div className="sop-panel">
  <label className="settings-field">
    <span>Document 1 Title</span>

    <input
      placeholder="e.g. Guarding Contract"
      value={profileSite.document_1_title || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          document_1_title: e.target.value,
        })
      }
    />
  </label>

  <div className="sop-current-file">
    <span>Document 1 File</span>

    {profileSite.document_1_url ? (
      <div className="sop-actions-row">
        <button
          type="button"
          className="secondary-button"
          onClick={() => window.open(profileSite.document_1_url, "_blank")}
        >
          View
        </button>

        <a
          className="secondary-button"
          href={profileSite.document_1_url}
          target="_blank"
          rel="noreferrer"
          download
        >
          Download
        </a>
      </div>
    ) : (
      <small>No document uploaded</small>
    )}
  </div>

  <label className="settings-field">
    <span>Replace Document 1 PDF</span>

    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => {
        setDocument1File(e.target.files?.[0] || null);
      }}
    />
  </label>

  {document1File && (
    <button
      type="button"
      className="secondary-button"
      disabled={isUploadingDocument1}
      onClick={() => uploadSiteDocument(1, document1File)}
    >
      {isUploadingDocument1 ? "Uploading..." : "Upload Document 1"}
    </button>
  )}

  <hr />

  <label className="settings-field">
    <span>Document 2 Title</span>

    <input
      placeholder="e.g. Emergency Plan"
      value={profileSite.document_2_title || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          document_2_title: e.target.value,
        })
      }
    />
  </label>

  <div className="sop-current-file">
    <span>Document 2 File</span>

    {profileSite.document_2_url ? (
      <div className="sop-actions-row">
        <button
          type="button"
          className="secondary-button"
          onClick={() => window.open(profileSite.document_2_url, "_blank")}
        >
          View
        </button>

        <a
          className="secondary-button"
          href={profileSite.document_2_url}
          target="_blank"
          rel="noreferrer"
          download
        >
          Download
        </a>
      </div>
    ) : (
      <small>No document uploaded</small>
    )}
  </div>

  <label className="settings-field">
    <span>Replace Document 2 PDF</span>

    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => {
        setDocument2File(e.target.files?.[0] || null);
      }}
    />
  </label>

  {document2File && (
    <button
      type="button"
      className="secondary-button"
      disabled={isUploadingDocument2}
      onClick={() => uploadSiteDocument(2, document2File)}
    >
      {isUploadingDocument2 ? "Uploading..." : "Upload Document 2"}
    </button>
  )}
</div>

<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap",
  }}
>
  <button onClick={updateSiteProfile}>
    Save Profile
  </button>

  <button
    type="button"
    onClick={() => printSiteProfile(profileSite)}
  >
    Print Profile
  </button>

  <button
    className="secondary-button"
    onClick={() => setProfileSite(null)}
  >
    Cancel
  </button>
</div>
    </div>
  </div>
)}

    </>
  );
}

export default Settings;