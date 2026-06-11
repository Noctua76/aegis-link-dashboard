import { useEffect, useState } from "react";
import "./Sites.css";

const API_BASE_URL =
  "https://noctua-panic-backend-production.up.railway.app";

function statusClass(status = "") {
  return status.toLowerCase().replaceAll(" ", "-");
}

export default function Sites() {
  const [selectedSite, setSelectedSite] = useState(null);
  const [sites, setSites] = useState([]);
  const [guards, setGuards] = useState([]);
  const [activeGuards, setActiveGuards] = useState([]);
  const [incidents] = useState([]);

  const loadData = async () => {
    try {
      const [sitesRes, guardsRes, activeRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sites`),
        fetch(`${API_BASE_URL}/guards`),
        fetch(`${API_BASE_URL}/guards/active`),
      ]);

      const sitesData = await sitesRes.json();
      const guardsData = await guardsRes.json();
      const activeData = await activeRes.json();

      setSites(sitesData.sites || []);
      setGuards(guardsData.guards || []);
      setActiveGuards(activeData.guards || []);
    } catch (err) {
      console.error("Sites load error:", err);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  const siteOverview = sites.map((site) => {
    const assignedGuards = guards.filter(
      (guard) => guard.site_id === site.id
    );

    const currentSession = activeGuards.find(
      (session) =>
        session.site_id === site.id &&
        session.is_currently_online
    );

    return {
      ...site,
      assignedGuards,
      currentSession: currentSession || null,
      coverageStatus: site.coverage_status || "Uncovered",
      activeIncidents: incidents.filter(
        (incident) =>
          incident.site_id === site.id &&
          incident.status !== "Resolved"
      ),
      recentSessions: [],
    };
  });

  const totalSites = siteOverview.length;

  const coveredSites = siteOverview.filter(
    (site) => site.coverageStatus === "Covered"
  ).length;

  const activeAlerts = siteOverview.reduce(
    (total, site) => total + site.activeIncidents.length,
    0
  );

  const totalAssignedGuards = siteOverview.reduce(
    (total, site) => total + site.assignedGuards.length,
    0
  );

  return (
    <div className="sites-page">
      <header className="sites-header">
        <div>
          <h1>Sites</h1>
          <p>
            Operational overview of protected locations, security context and
            site-specific procedures.
          </p>
        </div>
      </header>

      <section className="sites-summary-grid">
        <div className="sites-summary-card">
          <span>Total Sites</span>
          <strong>{totalSites}</strong>
        </div>

        <div className="sites-summary-card">
          <span>Covered Sites</span>
          <strong>{coveredSites}</strong>
        </div>

        <div className="sites-summary-card">
          <span>Active Incidents</span>
          <strong>{activeAlerts}</strong>
        </div>

        <div className="sites-summary-card">
          <span>Assigned Guards</span>
          <strong>{totalAssignedGuards}</strong>
        </div>
      </section>

      <section className="sites-grid">
        {siteOverview.map((site) => (
          <div
            key={site.id}
            className="site-card"
            onClick={() => setSelectedSite(site)}
          >
            <div className="site-card-header">
              <div>
                <h2>{site.name}</h2>
                <p>{site.location || "—"}</p>
              </div>

              <span className={`status-pill ${site.status_class || statusClass(site.status)}`}>
  {site.status_label || site.status || "—"}
</span>
            </div>

            <div className="site-card-grid">
              <div>
                <span>Company Phone</span>
                <strong>{site.phone || "—"}</strong>
              </div>

              <div>
                <span>Coverage</span>
                <strong>{site.coverageStatus}</strong>
              </div>

              <div>
                <span>Current Guard</span>
                <strong>{site.active_guard || "No guard"}</strong>
              </div>

              <div>
                <span>Active Incidents</span>
                <strong>{site.activeIncidents.length}</strong>
              </div>
            </div>
          </div>
        ))}
      </section>

      {selectedSite && (
        <div className="modal-backdrop" onClick={() => setSelectedSite(null)}>
          <div className="site-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSite.name}</h2>
              <button onClick={() => setSelectedSite(null)}>×</button>
            </div>

            <div className="site-modal-grid">
              <p>
                <span>Location</span>
                {selectedSite.location || "—"}
              </p>

              <p>
                <span>Status</span>
                {selectedSite.status_label || selectedSite.status || "—"}
              </p>

              <p>
                <span>Coverage</span>
                {selectedSite.coverageStatus}
              </p>

              <p>
                <span>Current Guard</span>
                {selectedSite.active_guard || "No active guard"}
              </p>

              <p>
                <span>Check In Time</span>
                {selectedSite.currentSession?.check_in_time || "—"}
              </p>

              <p>
                <span>Assigned Guards</span>
                {selectedSite.assignedGuards.length}
              </p>
            </div>

            <div className="site-detail-box">
              <span>Assigned Guards</span>

              {selectedSite.assignedGuards.length === 0 ? (
                <p>No guards assigned</p>
              ) : (
                selectedSite.assignedGuards.map((guard) => (
                  <p key={guard.id}>
                    {guard.full_name} · {guard.role} ·{" "}
                    {guard.active ? "Active" : "Inactive"}
                  </p>
                ))
              )}
            </div>

            <div className="site-detail-box">
              <span>Security Context</span>

              <p>
                Active Incidents:{" "}
                <strong>{selectedSite.activeIncidents.length}</strong>
              </p>
            </div>

            <div className="site-detail-box">
              <span>Recent Guard Sessions</span>
              <p>No recent sessions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
