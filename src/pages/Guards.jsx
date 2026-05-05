import { useState } from "react";
import "./Guards.css";

import {
  sites,
  activeSessions,
  guardSessionsHistory,
  getSiteById,
  getGuardById,
  getGuardsBySiteId,
} from "../data/securityData";

function statusClass(status = "") {
  return status.toLowerCase().replaceAll(" ", "-");
}

function formatShift(guard) {
  if (guard.shift) return guard.shift;
  if (guard.shiftStart && guard.shiftEnd) {
    return `${guard.shiftStart} – ${guard.shiftEnd}`;
  }
  return "Not assigned";
}

export default function Guards() {
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const activeGuardsNow = activeSessions
    .map((session) => {
      const guard = getGuardById(session.guardId);
      const site = getSiteById(session.siteId);

      if (!guard || !site) return null;

      return {
        ...guard,
        site,
        session,
        siteName: site.name,
        lastCheckIn: session.loginAt,
        status: session.status || "On Duty",
      };
    })
    .filter(Boolean);

  const guardsByLocation = sites.map((site) => {
  const siteGuards = getGuardsBySiteId(site.id);

  const currentSession = activeSessions.find(
    (session) => session.siteId === site.id
  );

  const currentGuard = currentSession
    ? getGuardById(currentSession.guardId)
    : null;

  const recentSessions = guardSessionsHistory
    .filter((session) => session.siteId === site.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
.slice(0, 2)
    .map((session) => ({
      ...session,
      guard: getGuardById(session.guardId),
    }));

  return {
    ...site,
    guards: siteGuards,
    currentSession,
    currentGuard,
    recentSessions,
    coverageStatus: currentGuard ? "Covered" : "Uncovered",
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
          {activeGuardsNow.map((guard) => (
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
                  {guard.status}
                </span>
              </div>

              <div className="guard-info-grid">
                <div>
                  <span>Site</span>
                  <strong>{guard.siteName}</strong>
                </div>

                <div>
                  <span>Shift</span>
                  <strong>{formatShift(guard)}</strong>
                </div>

                <div>
                  <span>Logged in at</span>
                  <strong>{guard.lastCheckIn}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{guard.phone}</strong>
                </div>
              </div>
            </div>
          ))}
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
                  <p>
                    {site.address} · {site.client}
                  </p>
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
                        <strong>{site.currentGuard.fullName}</strong>
                        <p>{site.currentGuard.role}</p>
                      </div>

                      <span
                        className={`status-pill ${statusClass(
                          site.currentSession.status || "On Duty"
                        )}`}
                      >
                        {site.currentSession.status || "On Duty"}
                      </span>
                    </div>

                    <p className="login-line">
                      Logged in at:{" "}
                      <strong>{site.currentSession.loginAt}</strong>
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

                {site.guards.map((guard) => (
                  <div key={guard.id} className="previous-session-row">
                    <strong>{guard.fullName}</strong>
                    <span>{guard.role}</span>
                    <span>{guard.status || "Assigned"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="backend-panel">
        <h2>Backend Logic</h2>
        <p>
          This module is prepared for live connection with guards, locations,
          shifts, site devices and guard login sessions.
        </p>

        <div className="backend-grid">
          <code>GET /api/guards/active</code>
          <code>GET /api/locations/:id/coverage</code>
          <code>GET /api/guard-sessions/recent</code>
          <code>POST /api/guard-sessions/login</code>
          <code>POST /api/guard-sessions/logout</code>
        </div>
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
                {selectedGuard.phone}
              </p>
              <p>
                <span>Email</span>
                {selectedGuard.email}
              </p>
              <p>
                <span>Assigned Site</span>
                {selectedGuard.siteName}
              </p>
              <p>
                <span>Current Shift</span>
                {formatShift(selectedGuard)}
              </p>
              <p>
                <span>Role</span>
                {selectedGuard.role}
              </p>
              <p>
                <span>Status</span>
                {selectedGuard.status}
              </p>
              <p>
                <span>Shift Login Time</span>
                {selectedGuard.lastCheckIn}
              </p>
              <p>
                <span>Emergency Contact</span>
                {selectedGuard.emergencyContact}
              </p>
            </div>

            <div className="notes-box">
              <span>Notes</span>
              <p>{selectedGuard.notes}</p>
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
    <span>Site Phone</span>
    {selectedLocation.companyPhone || "—"}
  </p>

  <p>
    <span>Address</span>
    {selectedLocation.location || "—"}
  </p>
</div>

<div className="notes-box">
  <span>Previous Guards / Last Month</span>

  {selectedLocation.recentSessions.map((session) => (
    <p key={session.id}>
      {session.guard?.fullName || "Unknown Guard"} · {session.loginAt} –{" "}
      {session.logoutAt} · {session.status}
    </p>
  ))}
</div>
          </div>
        </div>
      )}
    </div>
  );
}
