import "./Settings.css";

function Settings() {
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

          <div className="integration-status">Web App — Online</div>
          <div className="integration-status">Backend API — Online</div>
          <div className="integration-status">SMS Gateway — Online</div>
          <div className="integration-status">Voice Calls — Online</div>
          <div className="integration-status">Database — Online</div>
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
            <strong>Enabled</strong>
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