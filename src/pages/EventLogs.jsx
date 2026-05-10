import { useState } from "react";
import "./EventLogs.css";

import {
  activeSessions,
  guardSessionsHistory,
  getGuardById,
  getSiteById,
} from "../data/securityData";

function statusClass(status = "") {
  return status.toLowerCase().replaceAll(" ", "-");
}

function calculateDuration(loginAt, logoutAt) {
  if (!loginAt || !logoutAt) return "In progress";

  const [loginHour, loginMinute] = loginAt.split(":").map(Number);
  const [logoutHour, logoutMinute] = logoutAt.split(":").map(Number);

  let start = loginHour * 60 + loginMinute;
  let end = logoutHour * 60 + logoutMinute;

  if (end < start) {
    end += 24 * 60;
  }

  const totalMinutes = end - start;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export default function EventLogs() {
  const [selectedLog, setSelectedLog] = useState(null);

  const activeLogs = activeSessions.map((session) => {
    const guard = getGuardById(session.guardId);
    const site = getSiteById(session.siteId);

    return {
      id: session.id,
      type: "Active Session",
      guard,
      site,
      date: "Today",
      loginAt: session.loginAt,
      logoutAt: null,
      shift: session.shift,
      duration: "In progress",
      status: session.status,
      notes: "Guard is currently on duty.",
    };
  });

  const historyLogs = guardSessionsHistory.map((session) => {
    const guard = getGuardById(session.guardId);
    const site = getSiteById(session.siteId);

    return {
      id: session.id,
      type: "Completed Session",
      guard,
      site,
      date: session.date,
      loginAt: session.loginAt,
      logoutAt: session.logoutAt,
      shift: `${session.loginAt} – ${session.logoutAt}`,
      duration: calculateDuration(session.loginAt, session.logoutAt),
      status: session.status,
      notes: "Shift completed and logged out.",
    };
  });

  const logs = [...activeLogs, ...historyLogs].sort((a, b) => {
    if (a.date === "Today") return -1;
    if (b.date === "Today") return 1;

    const dateA = new Date(`${a.date}T${a.loginAt}`).getTime();
    const dateB = new Date(`${b.date}T${b.loginAt}`).getTime();

    return dateB - dateA;
  });

  const todayLogins = activeLogs.length;
  const activeSessionsCount = activeLogs.length;
  const completedShifts = historyLogs.length;
  const missedLogouts = logs.filter((log) => log.status === "Missed Logout").length;

  return (
    <div className="event-logs-page">
      <header className="event-logs-header">
        <h1>Event Logs</h1>
        <p>Guard login, logout and shift attendance history by site.</p>
      </header>

      <section className="event-logs-summary-grid">
        <div className="event-summary-card">
          <span>Today’s Logins</span>
          <strong>{todayLogins}</strong>
        </div>

        <div className="event-summary-card">
          <span>Active Sessions</span>
          <strong>{activeSessionsCount}</strong>
        </div>

        <div className="event-summary-card">
          <span>Completed Shifts</span>
          <strong>{completedShifts}</strong>
        </div>

        <div className="event-summary-card">
          <span>Missed Logouts</span>
          <strong>{missedLogouts}</strong>
        </div>
      </section>

      <section className="event-logs-table">
        <div className="event-logs-table-header">
          <span>Guard</span>
          <span>Site</span>
          <span>Date</span>
          <span>Login</span>
          <span>Logout</span>
          <span>Duration</span>
          <span>Status</span>
        </div>

        {logs.map((log) => (
          <div
            key={log.id}
            className="event-log-row"
            onClick={() => setSelectedLog(log)}
          >
            <span>{log.guard?.fullName || "Unknown Guard"}</span>
            <span>{log.site?.name || "Unknown Site"}</span>
            <span>{log.date}</span>
            <span>{log.loginAt}</span>
            <span>{log.logoutAt || "—"}</span>
            <span>{log.duration}</span>
            <span className={`status-pill ${statusClass(log.status)}`}>
              {log.status}
            </span>
          </div>
        ))}
      </section>

      {selectedLog && (
        <div className="modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="event-log-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedLog.guard?.fullName || "Unknown Guard"}</h2>
              <button onClick={() => setSelectedLog(null)}>×</button>
            </div>

            <div className="event-log-modal-grid">
              <p>
                <span>Site</span>
                {selectedLog.site?.name || "Unknown Site"}
              </p>
              <p>
                <span>Location</span>
                {selectedLog.site?.location || "—"}
              </p>
              <p>
                <span>Date</span>
                {selectedLog.date}
              </p>
              <p>
                <span>Scheduled Shift</span>
                {selectedLog.shift}
              </p>
              <p>
                <span>Login Time</span>
                {selectedLog.loginAt}
              </p>
              <p>
                <span>Logout Time</span>
                {selectedLog.logoutAt || "Still active"}
              </p>
              <p>
                <span>Duration</span>
                {selectedLog.duration}
              </p>
              <p>
                <span>Status</span>
                {selectedLog.status}
              </p>
            </div>

            <div className="event-log-notes">
              <span>Notes</span>
              <p>{selectedLog.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
