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
    shiftStart: "15:00",
    shiftEnd: "23:00",
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
    shiftStart: "15:00",
    shiftEnd: "23:00",
    status: "On Duty",
    lastCheckIn: "14:58",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Responsible for entrance control and patrol reporting.",
  },
];

const guardsByLocation = [
  {
    location: "Ekali Residence",
    address: "Ekali, Athens",
    client: "Private Residence",
    guards: [
      { name: "Giorgos Papas", role: "Shift Guard", status: "On Duty" },
      { name: "Dimitris K.", role: "Backup Guard", status: "Standby" },
      { name: "Petros M.", role: "Night Guard", status: "Off Duty" },
    ],
  },
  {
    location: "Kifisia Office",
    address: "Kifisia, Athens",
    client: "Corporate Site",
    guards: [
      { name: "Nikos Arvanitis", role: "Shift Guard", status: "On Duty" },
      { name: "Alexis R.", role: "Patrol Guard", status: "Offline" },
    ],
  },
];

function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

export default function Guards() {
  const [selectedGuard, setSelectedGuard] = useState(null);

  return (
    <div className="guards-page">
      <header className="guards-header">
        <div>
          <h1>Guards</h1>
          <p>Live guard coverage, assigned sites, shifts and check-in status.</p>
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
                  <span>Check-in</span>
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
            <div key={site.location} className="location-card">
              <div className="location-header">
                <div>
                  <h3>{site.location}</h3>
                  <p>{site.address} · {site.client}</p>
                </div>
              </div>

              <div className="location-list">
                {site.guards.map((guard) => (
                  <div key={guard.name} className="location-row">
                    <div>
                      <strong>{guard.name}</strong>
                      <span>{guard.role}</span>
                    </div>
                    <span className={`status-pill ${statusClass(guard.status)}`}>
                      {guard.status}
                    </span>
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
          shifts and check-ins tables.
        </p>

        <div className="backend-grid">
          <code>GET /api/guards</code>
          <code>GET /api/guards/active</code>
          <code>GET /api/shifts/current</code>
          <code>GET /api/checkins/latest</code>
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
              <p><span>Last Check-in</span>{selectedGuard.lastCheckIn}</p>
              <p><span>Emergency Contact</span>{selectedGuard.emergencyContact}</p>
            </div>

            <div className="notes-box">
              <span>Notes</span>
              <p>{selectedGuard.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
