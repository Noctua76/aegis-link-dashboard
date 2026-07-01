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
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateShiftDelay(scheduledStart, loginTime) {
  if (!scheduledStart || !loginTime) return "—";

  const scheduled = new Date(scheduledStart);
  const login = new Date(loginTime);

  if (Number.isNaN(scheduled.getTime()) || Number.isNaN(login.getTime())) {
    return "—";
  }

  const diffMs = login - scheduled;

  if (diffMs <= 0) return "On Time";

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);

  if (totalMinutes < 60) {
    return `+${totalMinutes}m`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `+${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
        const loginAt = formatTime(shift.check_in_time);
        const logoutAt = formatTime(shift.check_out_time);

        const status =
  shift.status === "abandoned" || shift.status === "auto_closed"
    ? "Missed Logout"
    : !shift.check_out_time
    ? "On Duty"
    : "Logged Out";

        return {
          id: shift.id,
          guard: { fullName: shift.full_name || "Unknown Guard" },
          site: {
            name: shift.site_name || "Unknown Site",
            location: shift.site_location || "—",
          },
          siteId: shift.site_id,
          date: shift.check_in_time
            ? new Date(shift.check_in_time).toISOString().split("T")[0]
            : "—",
          shift:
  shift.shift_label ||
  (shift.shift_start && shift.shift_end
    ? `${formatTime(shift.shift_start)} – ${formatTime(shift.shift_end)}`
    : "—"),
loginAt: loginAt || "—",
logoutAt,
shiftDelay: calculateShiftDelay(shift.shift_start, shift.check_in_time),
          status,
          notes:
            status === "On Duty"
              ? "Guard is currently on duty."
              : status === "Missed Logout"
              ? "Session was closed automatically after heartbeat timeout."
              : "Shift completed.",
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
    (log) => log.status === "Logged Out"
  ).length;

  const lateLogins = filteredLogs.filter(
    (log) => log.shiftDelay !== "On Time" && log.shiftDelay !== "—"
  ).length;

  const missedLogouts = filteredLogs.filter(
    (log) => log.status === "Missed Logout"
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
                {selectedLog.status === "Missed Logout"
                  ? "Missed logout"
                  : selectedLog.logoutAt || "Still active"}
              </p>
              <p><span>Shift Delay</span>{selectedLog.shiftDelay}</p>
              <p><span>Status</span>{selectedLog.status}</p>
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
