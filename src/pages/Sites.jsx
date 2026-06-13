import { useEffect, useState } from "react";
import "./Sites.css";

const API_BASE_URL =
  "https://noctua-panic-backend-production.up.railway.app";

function statusClass(status = "") {
  return status.toLowerCase().replaceAll(" ", "-");
}

function shortAddress(address = "") {
  if (!address) return "Location unavailable";

  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.slice(0, 3).join(", ");
}

function isGpsLive(lastLocationAt) {
  if (!lastLocationAt) return false;

  const lastUpdate = new Date(lastLocationAt).getTime();
  const now = Date.now();

  return now - lastUpdate < 2 * 60 * 1000;
}

function gpsAccuracyLabel(accuracy) {
  const value = Number(accuracy);

  if (!value && value !== 0) {
    return {
      label: "Unknown",
      className: "gps-accuracy-unknown",
    };
  }

  if (value <= 20) {
    return {
      label: "Excellent",
      className: "gps-accuracy-excellent",
    };
  }

  if (value <= 50) {
    return {
      label: "Good",
      className: "gps-accuracy-good",
    };
  }

  if (value <= 100) {
    return {
      label: "Fair",
      className: "gps-accuracy-fair",
    };
  }

  return {
    label: "Poor",
    className: "gps-accuracy-poor",
  };
}

export default function Sites() {
  const [selectedSite, setSelectedSite] = useState(null);
  const [sites, setSites] = useState([]);
  const [guards, setGuards] = useState([]);
  const [activeGuards, setActiveGuards] = useState([]);
  const [incidents, setIncidents] = useState([]);
const [shiftHistory, setShiftHistory] = useState([]);
const [liveLocations, setLiveLocations] = useState([]);

  const loadData = async () => {
    try {
      const [sitesRes, guardsRes, activeRes, shiftsRes, incidentsRes, locationsRes] =
  await Promise.all([
    fetch(`${API_BASE_URL}/sites`),
    fetch(`${API_BASE_URL}/guards`),
    fetch(`${API_BASE_URL}/guards/active`),
    fetch(`${API_BASE_URL}/guards/shifts/history`),
    fetch(`${API_BASE_URL}/incidents/site-monitoring`),
    fetch(`${API_BASE_URL}/guards/live-locations`),
  ]);

      const sitesData = await sitesRes.json();
const guardsData = await guardsRes.json();
const activeData = await activeRes.json();
const shiftsData = await shiftsRes.json();
const incidentsData = await incidentsRes.json();
const locationsData = await locationsRes.json();

      setSites(sitesData.sites || []);
setGuards(guardsData.guards || []);
setActiveGuards(activeData.guards || []);
setShiftHistory(shiftsData.shifts || []);
setIncidents(incidentsData.cards || []);
setLiveLocations(locationsData.locations || []);
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

    const liveLocation = liveLocations.find(
  (location) => location.site_id === site.id
);

    return {
      ...site,
      assignedGuards,
      currentSession: currentSession || null,
      liveLocation: liveLocation || null,
      coverageStatus: site.coverage_status || "Uncovered",
      activeIncidents: incidents.filter(
  (incident) =>
    incident.siteId === site.id &&
    incident.status !== "normal" &&
    incident.status !== "inactive"
),
recentSessions: shiftHistory
  .filter((session) => session.site_id === site.id)
  .slice(0, 5),
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
  <strong>{site.site_phone || "—"}</strong>
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
            {site.liveLocation && (
  <div className="site-live-location">
    <div className="gps-status-row">
  <span>Live Guard Location</span>

  <strong
    className={
      isGpsLive(site.liveLocation.last_location_at)
        ? "gps-status-live"
        : "gps-status-offline"
    }
  >
    {isGpsLive(site.liveLocation.last_location_at)
      ? "GPS LIVE ●"
      : "GPS OFFLINE"}
  </strong>
</div>

<p>{shortAddress(site.liveLocation.last_location_address)}</p>

    <div className="site-live-location-grid">
      <small
  className={`gps-accuracy-pill ${
    gpsAccuracyLabel(site.liveLocation.last_location_accuracy).className
  }`}
>
  Accuracy:{" "}
  {site.liveLocation.last_location_accuracy
    ? `${site.liveLocation.last_location_accuracy}m`
    : "—"}{" "}
  · {gpsAccuracyLabel(site.liveLocation.last_location_accuracy).label}
</small>

      <small>
        Battery:{" "}
        {site.liveLocation.last_battery_level
          ? `${site.liveLocation.last_battery_level}%`
          : "—"}
      </small>

      <small>
        Updated:{" "}
        {site.liveLocation.last_location_at
          ? new Date(site.liveLocation.last_location_at).toLocaleString("el-GR", {
              timeZone: "Europe/Athens",
            })
          : "—"}
      </small>

      <a
        href={`https://www.google.com/maps?q=${site.liveLocation.last_latitude},${site.liveLocation.last_longitude}`}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        Open Map
      </a>
    </div>
  </div>
)}
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
  <span>Live Guard Location</span>

  {selectedSite.liveLocation ? (
    <>
      <p>
        <strong>Address:</strong>{" "}
        {selectedSite.liveLocation.last_location_address || "—"}
      </p>

      <p>
        <strong>Coordinates:</strong>{" "}
        {selectedSite.liveLocation.last_latitude},{" "}
        {selectedSite.liveLocation.last_longitude}
      </p>

      <p>
        <strong>Accuracy:</strong>{" "}
{selectedSite.liveLocation.last_location_accuracy
  ? `${selectedSite.liveLocation.last_location_accuracy}m`
  : "—"}{" "}
· {gpsAccuracyLabel(selectedSite.liveLocation.last_location_accuracy).label}
      </p>

      <p>
        <strong>Battery:</strong>{" "}
        {selectedSite.liveLocation.last_battery_level
          ? `${selectedSite.liveLocation.last_battery_level}%`
          : "—"}
      </p>

      <p>
        <strong>Last Update:</strong>{" "}
        {selectedSite.liveLocation.last_location_at
          ? new Date(selectedSite.liveLocation.last_location_at).toLocaleString(
              "el-GR",
              { timeZone: "Europe/Athens" }
            )
          : "—"}
      </p>

      <a
        href={`https://www.google.com/maps?q=${selectedSite.liveLocation.last_latitude},${selectedSite.liveLocation.last_longitude}`}
        target="_blank"
        rel="noreferrer"
      >
        Open in Google Maps
      </a>
    </>
  ) : (
    <p>No live location available</p>
  )}
</div>

            <div className="site-detail-box">
  <span>Recent Guard Sessions</span>

  {selectedSite.recentSessions.length === 0 ? (
    <p>No recent sessions</p>
  ) : (
    selectedSite.recentSessions.map((session) => (
      <p key={session.id}>
        {session.full_name} · {session.status} ·{" "}
        {session.check_in_time
          ? new Date(session.check_in_time).toLocaleString("el-GR", {
              timeZone: "Europe/Athens",
            })
          : "—"}
      </p>
    ))
  )}
</div>
          </div>
        </div>
      )}
    </div>
  );
}
