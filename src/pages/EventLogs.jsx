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
  })
    .format(date)
    .replace(",", " ·");
}

function calculateShiftDelay(start, login) {
  if (!start || !login) return "—";

  const [sH, sM] = start.split(":").map(Number);
  const [lH, lM] = login.split(":").map(Number);

  const scheduled = sH * 60 + sM;
  const actual = lH * 60 + lM;

  const diff = actual - scheduled;

  if (diff <= 0) return "On Time";

  return `+${diff}m`;
}

export default function EventLogs() {
  const [selectedSiteId, setSelectedSiteId] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);

  const [sites, setSites] = useState([]);
  const [logs, setLogs] = useState([]);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      setNow(new Date());
      loadData();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [sitesRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sites`),
        fetch(`${API_BASE_URL}/guards/shifts/history`)
      ]);

      const sitesData = await sitesRes.json();
      const logsData = await logsRes.json();

      setSites(sitesData.sites || []);

      const mappedLogs = (logsData.shifts || []).map((shift) => ({
        id: shift.id,

        guard: {
          fullName: shift.full_name
        },

        site: {
          name: shift.site_name,
          location: shift.site_location
        },

        siteId: shift.site_id,

        date: shift.check_in_time
          ? new Date(shift.check_in_time)
              .toISOString()
              .split("T")[0]
          : "—",

        shift:
          shift.shift_start && shift.shift_end
            ? `${shift.shift_start} – ${shift.shift_end}`
            : "—",

        loginAt: shift.check_in_time
          ? new Date(shift.check_in_time)
              .toLocaleTimeString(
                "en-GB",
                {
                  hour: "2-digit",
                  minute: "2-digit"
                }
              )
          : "—",

        logoutAt:
          shift.check_out_time
            ? new Date(shift.check_out_time)
                .toLocaleTimeString(
                  "en-GB",
                  {
                    hour: "2-digit",
                    minute: "2-digit"
                  }
                )
            : null,

        shiftDelay: calculateShiftDelay(
          shift.shift_start,
          shift.check_in_time
            ? new Date(shift.check_in_time)
                .toLocaleTimeString(
                  "en-GB",
                  {
                    hour: "2-digit",
                    minute: "2-digit"
                  }
                )
            : null
        ),

        status:
          shift.is_currently_online
            ? "On Duty"
            : "Logged Out",

        notes:
          shift.is_currently_online
            ? "Guard is currently on duty."
            : "Shift completed."
      }));

      setLogs(mappedLogs);

    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs =
    selectedSiteId === "all"
      ? logs
      : logs.filter(
          (log) =>
            String(log.siteId) === String(selectedSiteId)
        );

  const activeSessionsCount =
    filteredLogs.filter(
      (l) => l.status === "On Duty"
    ).length;

  const completedShifts =
    filteredLogs.filter(
      (l) => l.status === "Logged Out"
    ).length;

  const lateLogins =
    filteredLogs.filter(
      (l) =>
        l.shiftDelay !== "On Time" &&
        l.shiftDelay !== "—"
    ).length;

  const selectedSite =
    selectedSiteId === "all"
      ? null
      : sites.find(
          (s) =>
            String(s.id) ===
            String(selectedSiteId)
        );

  return (
    <div className="event-logs-page">

      {/* Κράτα από εδώ και κάτω ΟΛΟ το υπάρχον JSX */}
      {/* ΜΗΝ αλλάξεις HTML / modal / table */}

    </div>
  );
}
