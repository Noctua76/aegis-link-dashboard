import { useEffect, useState } from "react";
import "./Guards.css";

const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";

function statusClass(status = "") {
  return status.toLowerCase().replaceAll(" ", "-").replaceAll("_", "-");
}

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("el-GR", {
    timeZone: "Europe/Athens",
  });
}

export default function Guards() {
  const [guards, setGuards] = useState([]);
  const [sites, setSites] = useState([]);
  const [activeGuards, setActiveGuards] = useState([]);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  const loadData = async () => {
    try {
      const [guardsRes, sitesRes, activeRes, statusRes] =
  await Promise.all([
    fetch(`${API_BASE_URL}/guards`),
    fetch(`${API_BASE_URL}/sites`),
    fetch(`${API_BASE_URL}/guards/active`),
    fetch(`${API_BASE_URL}/system/status`)
  ]);

      const statusData = await statusRes.json();
      const guardsData = await guardsRes.json();
      const sitesData = await sitesRes.json();
      const activeData = await activeRes.json();

      setGuards(guardsData.guards || []);
      setSites(sitesData.sites || []);
      setActiveGuards(activeData.guards || []);
      setSystemStatus(statusData);
    } catch (err) {
      console.error("Failed loading guards data:", err);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  const activeGuardsNow = activeGuards
    .filter((item) => item.guard_id && item.is_currently_online)
    .map((item) => ({
      id: item.guard_id,
      fullName: item.full_name,
      username: item.username,
      phone: item.phone,
      role: "Guard",
      siteName: item.site_name,
      siteLocation: item.site_location,
      status: item.status || "on_duty",
      lastCheckIn: item.check_in_time,
      lastSeen: item.last_seen,
      online: item.is_currently_online,
    }));

  const guardsByLocation = sites.map((site) => {
    const siteGuards = guards.filter((guard) => guard.site_id === site.id);

    const currentSession = activeGuards.find(
      (session) => session.site_id === site.id && session.is_currently_online
    );

    return {
      ...site,
      guards: siteGuards,
      currentSession,
      currentGuard: currentSession?.guard_id ? currentSession : null,
      coverageStatus: currentSession?.is_currently_online
        ? "Covered"
        : "Uncovered",
    };
  });

  return (
    <div className="guards-page">
      <header className="guards-header centered-guards-header">
        <div className="guards-title-block">
          <h1>Guards</h1>
          <p>Live guard coverage, assigned sites, shifts and login status.</p>
        </div>

        <div className="live-badge">● Live Coverage</div>
      </header>

      <section className="guards-section">
        <h2>Active Guards Now</h2>

        <div className="active-guards-grid">
          {activeGuardsNow.length === 0 ? (
            <div className="guard-card">
              <h3>No active guard session</h3>
              <p>No guard is currently checked in.</p>
            </div>
          ) : (
            activeGuardsNow.map((guard) => (
              <div
                key={guard.id}
                className="guard-card"
                onClick={() => setSelectedGuard(guard)}
              >
                <div className="guard-card-header">
                  <div>
                    <h3>{guard.fullName}</h3>
                    <p>{guard.role}</p>
                  </div>

                  <span className={`status-pill ${statusClass(guard.status)}`}>
                    {guard.online ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="guard-info-grid">
                  <div>
                    <span>Site</span>
                    <strong>{guard.siteName}</strong>
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>{guard.siteLocation || "—"}</strong>
                  </div>

                  <div>
                    <span>Checked in at</span>
                    <strong>{formatDateTime(guard.lastCheckIn)}</strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>{guard.phone || "—"}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="guards-section">
        <h2>Guards by Location</h2>

        <div className="location-grid">
          {guardsByLocation.map((site) => (
            <div
              key={site.id}
              className="location-card"
              onClick={() => setSelectedLocation(site)}
            >
              <div className="location-header">
                <div>
                  <h3>{site.name}</h3>
                  <p>{site.location || "—"}</p>
                </div>

                <span
                  className={`status-pill ${statusClass(site.coverageStatus)}`}
                >
                  {site.coverageStatus}
                </span>
              </div>

              <div className="current-session-card">
                <span>Current On Duty</span>

                {site.currentGuard ? (
                  <>
                    <div className="current-session-row">
                      <div>
                        <strong>{site.currentGuard.full_name}</strong>
                        <p>{site.currentGuard.username}</p>
                      </div>

                      <span
  className={`status-pill ${
    site.currentGuard.is_currently_online ? "online" : "offline"
  }`}
>
  {site.currentGuard.is_currently_online ? "Online" : "Offline"}
</span>
                    </div>

                    <p className="login-line">
                      Checked in at:{" "}
                      <strong>
                        {formatDateTime(site.currentGuard.check_in_time)}
                      </strong>
                    </p>
                  </>
                ) : (
                  <p className="login-line">
                    <strong>No active guard session</strong>
                  </p>
                )}
              </div>

              <div className="previous-session-list">
                <span>Assigned Guards</span>

                {site.guards.length === 0 ? (
                  <div className="previous-session-row">
                    <strong>No assigned guards</strong>
                  </div>
                ) : (
                  site.guards.map((guard) => (
                    <div key={guard.id} className="previous-session-row">
                      <strong>{guard.full_name}</strong>
                      <span>{guard.role}</span>
                      <span>{guard.active ? "Active" : "Inactive"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="backend-panel">
  <h2>System Connection Status</h2>

  {!systemStatus ? (
    <p>Loading system status...</p>
  ) : (
    <>
      <p>
        Last Sync:{" "}
        {new Date(systemStatus.timestamp).toLocaleString("el-GR")}
      </p>

      <div className="backend-grid">

        <code>
          Backend API · {systemStatus.backend}
        </code>

        <code>
          Database · {systemStatus.database}
        </code>

        <code>
          Guards API · {
            systemStatus?.services?.guard_sessions?.active_guards || 0
          } guards
        </code>

        <code>
          Sites API · {
            systemStatus?.services?.sites_api?.total_sites || 0
          } sites
        </code>

        <code>
          Attendance API · {
            systemStatus?.services?.guard_sessions?.active_guards || 0
          } active guards
        </code>

        <code>
          Heartbeat · {
            systemStatus?.services?.heartbeat?.status || "unknown"
          }
        </code>

      </div>
    </>
  )}
</section>

      {selectedGuard && (
        <div className="modal-backdrop" onClick={() => setSelectedGuard(null)}>
          <div className="guard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedGuard.fullName}</h2>
              <button onClick={() => setSelectedGuard(null)}>×</button>
            </div>

            <div className="modal-grid">
              <p>
                <span>Phone</span>
                {selectedGuard.phone || "—"}
              </p>
              <p>
                <span>Username</span>
                {selectedGuard.username || "—"}
              </p>
              <p>
                <span>Assigned Site</span>
                {selectedGuard.siteName || "—"}
              </p>
              <p>
                <span>Location</span>
                {selectedGuard.siteLocation || "—"}
              </p>
              <p>
                <span>Role</span>
                {selectedGuard.role || "—"}
              </p>
              <p>
                <span>Status</span>
                {selectedGuard.online ? "Online" : "Offline"}
              </p>
              <p>
                <span>Check-in Time</span>
                {formatDateTime(selectedGuard.lastCheckIn)}
              </p>
              <p>
                <span>Last Seen</span>
                {formatDateTime(selectedGuard.lastSeen)}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedLocation && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedLocation(null)}
        >
          <div className="guard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedLocation.name}</h2>
              <button onClick={() => setSelectedLocation(null)}>×</button>
            </div>

            <div className="modal-grid">
              <p>
                <span>Address</span>
                {selectedLocation.location || "—"}
              </p>

              <p>
                <span>Status</span>
                {selectedLocation.coverageStatus}
              </p>

              <p>
                <span>Current Guard</span>
                {selectedLocation.currentGuard?.full_name ||
                  "No active guard"}
              </p>

              <p>
                <span>Assigned Guards</span>
                {selectedLocation.guards.length}
              </p>
            </div>

            <div className="notes-box">
              <span>Assigned Guards</span>

              {selectedLocation.guards.map((guard) => (
                <p key={guard.id}>
                  {guard.full_name} · {guard.username} ·{" "}
                  {guard.active ? "Active" : "Inactive"}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
