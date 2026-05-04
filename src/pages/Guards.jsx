import { useState } from "react";
import "./Guards.css";

const activeGuards = [
  {
    id: 1,
    fullName: "Giorgos Papas",
    phone: "+30 69XXXXXXXX",
    email: "g.papas@security.gr",
    site: "Ekali Residence",
    role: "Shift Guard",
    shift: "15:00 – 23:00",
    status: "On Duty",
    lastCheckIn: "15:02",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Primary guard assigned to main residence perimeter.",
  },
  {
    id: 2,
    fullName: "Nikos Arvanitis",
    phone: "+30 69XXXXXXXX",
    email: "n.arvanitis@security.gr",
    site: "Kifisia Office",
    role: "Shift Guard",
    shift: "15:00 – 23:00",
    status: "On Duty",
    lastCheckIn: "14:58",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Responsible for entrance control and patrol reporting.",
  },
];

const locationCoverage = [
  {
    id: "LOC-001",
    location: "Ekali Residence",
    address: "Ekali, Athens",
    client: "Private Residence",
    sitePhone: "+30 210XXXXXXX",
    status: "Covered",
    currentSession: {
      guardName: "Giorgos Papas",
      role: "Shift Guard",
      loginAt: "15:02",
      status: "On Duty",
    },
    previousSessions: [
      {
        guardName: "N. Papadakis",
        loginAt: "07:00",
        logoutAt: "15:00",
        duration: "8h",
        status: "Logged Out",
      },
      {
        guardName: "P. Markou",
        loginAt: "23:00",
        logoutAt: "07:00",
        duration: "8h",
        status: "Logged Out",
      },
    ],
  },
  {
    id: "LOC-002",
    location: "Kifisia Office",
    address: "Kifisia, Athens",
    client: "Corporate Site",
    sitePhone: "+30 210YYYYYYY",
    status: "Covered",
    currentSession: {
      guardName: "Nikos Arvanitis",
      role: "Shift Guard",
      loginAt: "14:58",
      status: "On Duty",
    },
    previousSessions: [
      {
        guardName: "A. Roussos",
        loginAt: "06:00",
        logoutAt: "14:00",
        duration: "8h",
        status: "Logged Out",
      },
      {
        guardName: "D. K.",
        loginAt: "22:00",
        logoutAt: "06:00",
        duration: "8h",
        status: "Logged Out",
      },
    ],
  },
];

function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

export default function Guards() {
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

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
          {activeGuards.map((guard) => (
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
                  <strong>{guard.site}</strong>
                </div>
                <div>
                  <span>Shift</span>
                  <strong>{guard.shift}</strong>
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
          {locationCoverage.map((site) => (
            <div
              key={site.id}
              className="location-card"
              onClick={() => setSelectedLocation(site)}
            >
              <div className="location-header">
                <div>
                  <h3>{site.location}</h3>
                  <p>{site.address} · {site.client}</p>
                </div>
                <span className={`status-pill ${statusClass(site.status)}`}>
                  {site.status}
                </span>
              </div>

              <div className="current-session-card">
                <span>Current On Duty</span>
                <div className="current-session-row">
                  <div>
                    <strong>{site.currentSession.guardName}</strong>
                    <p>{site.currentSession.role}</p>
                  </div>
                  <span
                    className={`status-pill ${statusClass(
                      site.currentSession.status
                    )}`}
                  >
                    {site.currentSession.status}
                  </span>
                </div>
                <p className="login-line">
                  Logged in at: <strong>{site.currentSession.loginAt}</strong>
                </p>
              </div>

              <div className="previous-session-list">
                <span>Previous Sessions</span>
                {site.previousSessions.map((session, index) => (
                  <div key={index} className="previous-session-row">
                    <strong>{session.guardName}</strong>
                    <span>
                      {session.loginAt} – {session.logoutAt}
                    </span>
                    <span>{session.status}</span>
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
              <p><span>Phone</span>{selectedGuard.phone}</p>
              <p><span>Email</span>{selectedGuard.email}</p>
              <p><span>Assigned Site</span>{selectedGuard.site}</p>
              <p><span>Current Shift</span>{selectedGuard.shift}</p>
              <p><span>Role</span>{selectedGuard.role}</p>
              <p><span>Status</span>{selectedGuard.status}</p>
              <p><span>Shift Login Time</span>{selectedGuard.lastCheckIn}</p>
              <p><span>Emergency Contact</span>{selectedGuard.emergencyContact}</p>
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
              <h2>{selectedLocation.location}</h2>
              <button onClick={() => setSelectedLocation(null)}>×</button>
            </div>

            <div className="modal-grid">
              <p><span>Current Guard</span>{selectedLocation.currentSession.guardName}</p>
              <p><span>Role</span>{selectedLocation.currentSession.role}</p>
              <p><span>Login Time</span>{selectedLocation.currentSession.loginAt}</p>
              <p><span>Coverage Status</span>{selectedLocation.status}</p>
              <p><span>Site Phone</span>{selectedLocation.sitePhone}</p>
              <p><span>Address</span>{selectedLocation.address}</p>
            </div>

            <div className="notes-box">
              <span>Recent Login / Logout Sessions</span>
              {selectedLocation.previousSessions.map((session, index) => (
                <p key={index}>
                  {session.guardName}: {session.loginAt} – {session.logoutAt} ·{" "}
                  {session.duration} · {session.status}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
