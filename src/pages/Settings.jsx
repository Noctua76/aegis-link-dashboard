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

const [newSite, setNewSite] = useState({
  name: "",
  location: "",
  required_shifts: 1,
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
      required_shifts: 1,
    });

    await loadSites();
  } catch (err) {
    console.error("Add site error", err);
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

  <input
    type="number"
    min="1"
    placeholder="Required shifts"
    value={newSite.required_shifts}
    onChange={(e) =>
      setNewSite({
        ...newSite,
        required_shifts: Number(e.target.value),
      })
    }
  />

  <button onClick={addSite}>Add Site</button>

  <hr />

  {sites.map((site) => (
    <div key={site.id} className="settings-item">
      <span>
        {site.name}
        <br />
        <small>{site.location}</small>
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
  <strong>
    {site.status === "active" ? "Active" : "Inactive"}
  </strong>

  <small>
    {site.required_shifts || 1} shifts
  </small>

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
    {site.status === "active" ? "Deactivate" : "Activate"}
  </button>
</div>
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
    </>
  );
}

export default Settings;