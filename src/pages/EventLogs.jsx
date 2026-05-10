import { useEffect, useState } from "react";
import "./EventLogs.css";

import {
  sites,
  activeSessions,
  guardSessionsHistory,
  getGuardById,
  getSiteById,
} from "../data/securityData";

function statusClass(status = "") {
  return status.toLowerCase().replaceAll(" ", "-");
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", " ·");
}

function calculateShiftDelay(shift, loginAt) {
  if (!shift || !loginAt) return "—";

  const shiftStart = shift.split("–")[0].trim();

  const [shiftHour, shiftMinute] = shiftStart.split(":").map(Number);
  const [loginHour, loginMinute] = loginAt.split(":").map(Number);

  const scheduled = shiftHour * 60 + shiftMinute;
  const actual = loginHour * 60 + loginMinute;

  const diff = actual - scheduled;

  if (diff <= 0) return "On Time";

  return `+${diff}m`;
}

export default function EventLogs() {
  const [selectedSiteId, setSelectedSiteId] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeLogs = activeSessions.map((session) => {
    const guard = getGuardById(session.guardId);
    const site = getSiteById(session.siteId);

    return {
      id: session.id,
      guard,
      site,
      siteId: session.siteId,
      date: "Today",
      shift: session.shift,
      loginAt: session.loginAt,
      logoutAt: null,
      shiftDelay: calculateShiftDelay(session.shift, session.loginAt),
      status: session.status,
      notes: "Guard is currently on duty.",
    };
  });

  const historyLogs = guardSessionsHistory.map((session) => {
    const guard = getGuardById(session.guardId);
    const site = getSiteById(session.siteId);
    const shift = `${session.loginAt} – ${session.logoutAt}`;

    return {
      id: session.id,
      guard,
      site,
      siteId: session.siteId,
      date: session.date,
      shift,
      loginAt: session.loginAt,
      logoutAt: session.logoutAt,
      shiftDelay: calculateShiftDelay(shift, session.loginAt),
      status: session.status,
      notes: "Shift completed and logged out.",
    };
  });

  const allLogs = [...activeLogs, ...historyLogs].sort((a, b) => {
    if (a.date === "Today") return -1;
    if (b.date === "Today") return 1;

    const dateA = new Date(`${a.date}T${a.loginAt}`).getTime();
    const dateB = new Date(`${b.date}T${b.loginAt}`).getTime();

    return dateB - dateA;
  });

  const filteredLogs =
    selectedSiteId === "all"
      ? allLogs
      : allLogs.filter((log) => log.siteId === selectedSiteId);

  const activeSessionsCount = filteredLogs.filter(
    (log) => log.status === "On Duty"
  ).length;

  const completedShifts = filteredLogs.filter(
    (log) => log.status === "Logged Out"
  ).length;

  const lateLogins = filteredLogs.filter(
    (log) => log.shiftDelay !== "On Time" && log.shiftDelay !== "—"
  ).length;

  const missedLogouts = filteredLogs.filter(
    (log) => log.status === "Missed Logout"
  ).length;

  const selectedSite =
    selectedSiteId === "all" ? null : sites.find((site) => site.id === selectedSiteId);

  return (
    <div className="event-logs-page">
      <header className="event-logs-header">
        <div>
          <h1>Event Logs</h1>
          <p>Guard login, logout and shift attendance history by site.</p>
        </div>

        <div className="eventlogs-live-clock">
          <span>Live Clock and Date</span>
          <strong>{formatDateTime(now)}</strong>
        </div>
      </header>

      <section className="event-site-tabs">
        <button
          className={selectedSiteId === "all" ? "active" : ""}
          onClick={() => setSelectedSiteId("all")}
        >
          All Sites
        </button>

        {sites.map((site) => (
          <button
            key={site.id}
            className={selectedSiteId === site.id ? "active" : ""}
            onClick={() => setSelectedSiteId(site.id)}
          >
            {site.name}
          </button>
        ))}
      </section>

      <section className="event-logs-context">
        <h2>{selectedSite ? selectedSite.name : "All Sites"}</h2>
        <p>
          {selectedSite
            ? `${selectedSite.location} · ${selectedSite.clientType}`
            : "Combined attendance view across all protected locations."}
        </p>
      </section>

      <section className="event-logs-summary-grid">
        <div className="event-summary-card">
          <span>Active Sessions</span>
          <strong>{activeSessionsCount}</strong>
        </div>

        <div className="event-summary-card">
          <span>Completed Shifts</span>
          <strong>{completedShifts}</strong>
        </div>

        <div className="event-summary-card">
          <span>Late Logins</span>
          <strong>{lateLogins}</strong>
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
          <span>Shift</span>
          <span>Login</span>
          <span>Logout</span>
          <span>Shift Delay</span>
          <span>Status</span>
        </div>

        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="event-log-row"
            onClick={() => setSelectedLog(log)}
          >
            <span>{log.guard?.fullName || "Unknown Guard"}</span>
            <span>{log.site?.name || "Unknown Site"}</span>
            <span>{log.date}</span>
            <span>{log.shift}</span>
            <span>{log.loginAt}</span>
            <span>{log.logoutAt || "—"}</span>
            <span
              className={
                log.shiftDelay === "On Time"
                  ? "delay-pill on-time"
                  : "delay-pill late"
              }
            >
              {log.shiftDelay}
            </span>
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
                <span>Shift Delay</span>
                {selectedLog.shiftDelay}
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
