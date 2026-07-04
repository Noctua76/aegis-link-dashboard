import { useEffect, useState } from "react";
import "./EventLogs.css";

const API_BASE_URL =
  "https://noctua-panic-backend-production.up.railway.app";

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
  }).format(date).replace(",", " ·");
}

function formatTime(value) {
  if (!value) return null;
  return new Date(value).toLocaleTimeString("el-GR", {
    timeZone: "Europe/Athens",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatMinutesDelay(minutes) {
  if (minutes === null || minutes === undefined) return "—";

  const value = Number(minutes);

  if (!Number.isFinite(value)) return "—";
  if (value <= 0) return "On Time";

  if (value < 60) return `+${value}m`;

  const hours = Math.floor(value / 60);
  const mins = value % 60;

  return `+${hours}h ${mins}m`;
}

function getShiftDisplayStatus(shift) {
  const now = new Date();
  const start = shift.shift_start ? new Date(shift.shift_start) : null;
  const end = shift.shift_end ? new Date(shift.shift_end) : null;

  const coverageMinutes = Number(shift.coverage_minutes || 0);

  if (start && now < start) return "Scheduled";

  if (start && end && now >= start && now < end) {
    if (shift.online) return "On Duty";
    if (coverageMinutes > 0 || shift.check_in_time) return "In Progress";
    return "No Guard";
  }

  if (end && now >= end) {
    if (coverageMinutes === 0) return "Missed";
    if (shift.coverage_status === "completed") return "Completed";
    return "Partial Coverage";
  }

  return "Scheduled";
}

function getShiftNotes(shift, status) {
  if (status === "Scheduled") {
    return "Scheduled shift awaiting start.";
  }

  if (status === "No Guard") {
    return "Shift is currently active, but no guard is logged in.";
  }

  if (status === "On Duty") {
    return "Guard is currently covering this scheduled shift.";
  }

  if (status === "In Progress") {
    return `Shift has partial activity so far. Coverage: ${shift.coverage_minutes || 0} minutes / ${shift.coverage_percent || 0}%.`;
  }

  if (status === "Completed") {
    return `Shift completed. Coverage: ${shift.coverage_percent || 0}%.`;
  }

  if (status === "Partial Coverage") {
    return `Shift partially covered. Coverage: ${shift.coverage_minutes || 0} minutes / ${shift.coverage_percent || 0}%.`;
  }

  if (status === "Missed") {
    return "Shift ended with no guard coverage.";
  }

  return "Shift status pending.";
}

export default function EventLogs() {
  const [selectedSiteId, setSelectedSiteId] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [sites, setSites] = useState([]);
  const [logs, setLogs] = useState([]);
  const [now, setNow] = useState(new Date());

  const loadData = async () => {
    try {
      const [sitesRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sites`),
        fetch(`${API_BASE_URL}/guards/shifts/history`),
      ]);

      const sitesData = await sitesRes.json();
      const logsData = await logsRes.json();

      setSites(sitesData.sites || []);

      const mappedLogs = (logsData.shifts || []).map((shift) => {
        const latestSession =
  shift.sessions && shift.sessions.length > 0
    ? shift.sessions[shift.sessions.length - 1]
    : null;

const loginAt = latestSession
  ? formatTime(latestSession.login_time)
  : formatTime(shift.check_in_time);

const logoutAt = latestSession
  ? latestSession.logout_time
    ? formatTime(latestSession.logout_time)
    : null
  : formatTime(shift.check_out_time);

        const status = getShiftDisplayStatus(shift);

        return {
          id: shift.id,
          guard: { fullName: shift.full_name || "Unknown Guard" },
          site: {
            name: shift.site_name || "Unknown Site",
            location: shift.site_location || "—",
          },
          siteId: shift.site_id,
          date: shift.shift_start
            ? new Date(shift.shift_start).toISOString().split("T")[0]
            : "—",
          shift:
  shift.shift_label ||
  (shift.shift_start && shift.shift_end
    ? `${formatTime(shift.shift_start)} – ${formatTime(shift.shift_end)}`
    : "—"),
loginAt: loginAt || "—",
logoutAt,
shiftDelay: formatMinutesDelay(shift.login_delay_minutes),
          status,
          notes: getShiftNotes(shift, status),
operationalStatus: shift.operational_status,
evaluationStatus: shift.evaluation_status,
displayStatus: shift.display_status,
sessions: shift.sessions || [],
coverageStatus: shift.coverage_status,
coverageMinutes: shift.coverage_minutes,
coveragePercent: shift.coverage_percent,
earlyLogoutMinutes: shift.early_logout_minutes,
loginDelayMinutes: shift.login_delay_minutes,
        };
      });

      setLogs(mappedLogs);
    } catch (err) {
      console.error("Event logs load error:", err);
    }
  };

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      setNow(new Date());
      loadData();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const filteredLogs =
    selectedSiteId === "all"
      ? logs
      : logs.filter((log) => String(log.siteId) === String(selectedSiteId));

  const activeSessionsCount = filteredLogs.filter(
  (log) => log.status === "On Duty"
).length;

const completedShifts = filteredLogs.filter(
  (log) => log.status === "Completed"
).length;

const lateLogins = filteredLogs.filter(
  (log) => Number(log.loginDelayMinutes) > 0
).length;

const missedLogouts = filteredLogs.filter(
  (log) =>
    ["Completed", "Partial Coverage", "Missed"].includes(log.status) &&
    Number(log.earlyLogoutMinutes) > 0
).length;

  const selectedSite =
    selectedSiteId === "all"
      ? null
      : sites.find((site) => String(site.id) === String(selectedSiteId));

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
            className={String(selectedSiteId) === String(site.id) ? "active" : ""}
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
            ? selectedSite.location
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

        {filteredLogs.length === 0 ? (
          <div className="event-log-row">
            <span>No guard shift history yet</span>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="event-log-row"
              onClick={() => setSelectedLog(log)}
            >
              <span>{log.guard.fullName}</span>
              <span>{log.site.name}</span>
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
          ))
        )}
      </section>

      {selectedLog && (
        <div className="modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="event-log-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedLog.guard.fullName}</h2>
              <button onClick={() => setSelectedLog(null)}>×</button>
            </div>

            <div className="event-log-modal-grid">
              <p><span>Site</span>{selectedLog.site.name}</p>
              <p><span>Location</span>{selectedLog.site.location}</p>
              <p><span>Date</span>{selectedLog.date}</p>
              <p><span>Scheduled Shift</span>{selectedLog.shift}</p>
              <p><span>Login Time</span>{selectedLog.loginAt}</p>
              <p>
                <span>Logout Time</span>
                {selectedLog.logoutAt ||
  (selectedLog.status === "On Duty" ? "Still active" : "—")}
              </p>
              <p><span>Shift Delay</span>{selectedLog.shiftDelay}</p>
              <p><span>Status</span>{selectedLog.status}</p>
            </div>

            <div className="event-log-notes">
              <span>Notes</span>
              <p>{selectedLog.notes}</p>
            </div>
            <div className="event-log-notes">
  <span>Guard Sessions</span>

  {selectedLog.sessions && selectedLog.sessions.length > 0 ? (
    selectedLog.sessions.map((session, index) => (
      <div key={session.guard_session_id || index} style={{ marginTop: "10px" }}>
        <p><strong>Session {index + 1}</strong></p>
        <p>Guard: {session.guard_name || "Unknown Guard"}</p>
        <p>Login: {formatTime(session.login_time) || "—"}</p>
        <p>
          Logout:{" "}
          {session.logout_time ? formatTime(session.logout_time) : "Active"}
        </p>
        <p>Coverage: {session.coverage_minutes ?? 0} min</p>
      </div>
    ))
  ) : (
    <p>No sessions recorded for this shift.</p>
  )}
</div>
          </div>
        </div>
      )}
    </div>
  );
}
