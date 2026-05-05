import { useState } from "react";
import "./Sites.css";

import {
  sites,
  incidents,
  activeSessions,
  guardSessionsHistory,
  getGuardById,
  getGuardsBySiteId,
} from "../data/securityData";

function statusClass(status = "") {
  return status.toLowerCase().replaceAll(" ", "-");
}

function getLatestIncident(siteId) {
  const siteIncidents = incidents.filter((incident) => incident.siteId === siteId);
  return siteIncidents[0] || null;
}

export default function Sites() {
  const [selectedSite, setSelectedSite] = useState(null);

  const siteOverview = sites.map((site) => {
    const assignedGuards = getGuardsBySiteId(site.id);

    const currentSession = activeSessions.find(
      (session) => session.siteId === site.id
    );

    const currentGuard = currentSession
      ? getGuardById(currentSession.guardId)
      : null;

    const activeIncidents = incidents.filter(
      (incident) =>
        incident.siteId === site.id && incident.status !== "Resolved"
    );

    const lastIncident = getLatestIncident(site.id);

    const recentSessions = guardSessionsHistory
      .filter((session) => session.siteId === site.id)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.loginAt}`).getTime();
        const dateB = new Date(`${b.date}T${b.loginAt}`).getTime();
        return dateB - dateA;
      })
      .slice(0, 2)
      .map((session) => ({
        ...session,
        guard: getGuardById(session.guardId),
      }));

    return {
      ...site,
      assignedGuards,
      currentSession,
      currentGuard,
      coverageStatus: currentGuard ? "Covered" : "Uncovered",
      activeIncidents,
      lastIncident,
      recentSessions,
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
                <p>
                  {site.location} · {site.clientType}
                </p>
              </div>

              <span className={`status-pill ${statusClass(site.status)}`}>
                {site.status}
              </span>
            </div>

            <div className="site-card-grid">
              <div>
                <span>Company Phone</span>
                <strong>{site.companyPhone}</strong>
              </div>

              <div>
                <span>Coverage</span>
                <strong>{site.coverageStatus}</strong>
              </div>

              <div>
                <span>Current Guard</span>
                <strong>
                  {site.currentGuard ? site.currentGuard.fullName : "No guard"}
                </strong>
              </div>

              <div>
                <span>Active Incidents</span>
                <strong>{site.activeIncidents.length}</strong>
              </div>
            </div>

            <div className="site-shifts">
              <span>Shift Pattern</span>
              <div>
                {site.shiftPattern.map((shift) => (
                  <small key={shift}>{shift}</small>
                ))}
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
                {selectedSite.location}
              </p>
              <p>
                <span>Client Type</span>
                {selectedSite.clientType}
              </p>
              <p>
                <span>Company Phone</span>
                {selectedSite.companyPhone}
              </p>
              <p>
                <span>Site Status</span>
                {selectedSite.status}
              </p>
              <p>
                <span>Coverage</span>
                {selectedSite.coverageStatus}
              </p>
              <p>
                <span>Current Guard</span>
                {selectedSite.currentGuard
                  ? selectedSite.currentGuard.fullName
                  : "No active guard"}
              </p>
            </div>

            <div className="site-detail-box">
              <span>Security Context</span>
              <p>
                Active Incidents:{" "}
                <strong>{selectedSite.activeIncidents.length}</strong>
              </p>
              <p>
                Last Incident:{" "}
                <strong>
                  {selectedSite.lastIncident
                    ? `${selectedSite.lastIncident.title} · ${selectedSite.lastIncident.status}`
                    : "No incident recorded"}
                </strong>
              </p>
            </div>

            <div className="site-detail-box">
              <span>Shift Structure</span>
              {selectedSite.shiftPattern.map((shift) => (
                <p key={shift}>{shift}</p>
              ))}
            </div>

            <div className="site-detail-box">
              <span>Recent Guard Sessions</span>
              {selectedSite.recentSessions.map((session) => (
                <p key={session.id}>
                  {session.guard?.fullName || "Unknown Guard"} ·{" "}
                  {session.loginAt} – {session.logoutAt} · {session.status}
                </p>
              ))}
            </div>

            <div className="site-detail-box">
              <span>Notes Summary</span>
              <p>{selectedSite.notes.summary}</p>
            </div>

            <div className="site-detail-box">
              <span>SOP</span>
              {selectedSite.notes.sop.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>

            <div className="site-detail-box">
              <span>Special Instructions</span>
              {selectedSite.notes.specialInstructions.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>

            <div className="site-detail-box">
              <span>Emergency Protocol</span>
              {selectedSite.notes.emergencyProtocol.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
