import { useEffect, useState } from "react";
import "./Settings.css";

function Settings() {
  const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";

  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
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

    const interval = setInterval(loadSystemStatus, 10000);

    return () => clearInterval(interval);
  }, []);

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
            <strong>2 configured</strong>
          </div>

          <div className="settings-item">
            <span>Voice Call Recipients</span>
            <strong>1 configured</strong>
          </div>

          <div className="settings-item">
            <span>Escalation Order</span>
            <strong>Supervisor → Client</strong>
          </div>

          <button>Send Test Alert</button>
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
      {systemStatus?.services?.database?.server_time || "-"}
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
    {systemStatus?.checked_at || "-"}

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
    </>
  );
}

export default Settings;