import { useEffect, useState } from "react";

const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("el-GR", {
    timeZone: "Europe/Athens",
  });
}

function formatDuration(value) {
  const totalSeconds = Number(value);

  if (
    !Number.isFinite(totalSeconds) ||
    totalSeconds < 0
  ) {
    return "-";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );
  const seconds = totalSeconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }

  parts.push(`${seconds}s`);

  return parts.join(" ");
}

function getSessionEndDetails(
  session,
  activeNow
) {
  if (activeNow) {
    return {
      label: "Active session",
      detail:
        session.is_temporary &&
        session.access_expires_at
          ? `Expires ${formatDate(
              session.access_expires_at
            )}`
          : null,
      tone: "active",
    };
  }

  switch (session.session_end_reason) {
    case "logout":
      return {
        label: "Logged out",
        detail: session.logout_time
          ? `Ended ${formatDate(
              session.logout_time
            )}`
          : null,
        tone: "logout",
      };

    case "temporary_access_expired":
      return {
        label: "Preview expired",
        detail:
          session.access_expires_at ||
          session.logout_time
            ? `Expired ${formatDate(
                session.access_expires_at ||
                  session.logout_time
              )}`
            : null,
        tone: "expired",
      };

    case "temporary_access_revoked":
      return {
        label: "Preview revoked",
        detail:
          session.temporary_access_revoked_at ||
          session.logout_time
            ? `Revoked ${formatDate(
                session.temporary_access_revoked_at ||
                  session.logout_time
              )}`
            : null,
        tone: "revoked",
      };

    default:
      return {
        label: session.is_active
          ? "No recent heartbeat"
          : "Closed session",
        detail: session.last_seen
          ? `Last seen ${formatDate(
              session.last_seen
            )}`
          : null,
        tone: "inactive",
      };
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function AdminAuditLogs() {
  const [sessions, setSessions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState(todayISO());
  const [toDate, setToDate] = useState(todayISO());

  const loadSessions = () => {
  const storedUser = JSON.parse(
    localStorage.getItem("aegis-current-user") || "null"
  );

  const sessionToken =
    storedUser?.session_token ||
    storedUser?.session?.token;

  if (!sessionToken) {
    return;
  }

  fetch(
    `${API_BASE_URL}/admin/sessions/history?from=${fromDate}&to=${toDate}`,
    {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "ok") {
        setSessions(data.sessions);
      }
    });
};

  useEffect(() => {
  loadSessions();

  const interval = setInterval(() => {
    loadSessions();
  }, 10000);

  return () => clearInterval(interval);
}, [fromDate, toDate]);

  const filteredSessions = sessions.filter((session) => {
  const activeNow = session.is_currently_online === true;

  if (statusFilter === "active") return activeNow;
  if (statusFilter === "closed") return !activeNow;

  return true;
});

  const exportSessions = async () => {
  try {
    const storedUser = JSON.parse(
      localStorage.getItem("aegis-current-user") || "null"
    );

    const sessionToken =
      storedUser?.session_token ||
      storedUser?.session?.token;

    if (!sessionToken) {
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/sessions/export?from=${fromDate}&to=${toDate}`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Session export failed");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "admin_sessions.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Admin session export error:", error);
  }
};

  return (
    <section style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "42px", marginBottom: "8px" }}>
        Admin Audit Logs
      </h1>

      <p style={{ marginBottom: "24px", color: "#b8c2cc" }}>
        View and monitor admin user sessions and activity.
      </p>

      <div className="audit-toolbar">
        <label>From</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
          }}
        />

        <label>To</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
          }}
        />

        <button
  onClick={() => setStatusFilter("all")}
  style={{
    cursor: "pointer",
    background: statusFilter === "all" ? "#4b5563" : "#2a2a2a",
    color: "#fff",
    border: "1px solid #6b7280",
    padding: "10px 18px",
    borderRadius: "8px",
    opacity: statusFilter === "all" ? 1 : 0.8,
    transition: "all .2s ease",
  }}
>
  All
</button>

<button
  onClick={() => setStatusFilter("active")}
  style={{
    cursor: "pointer",
    background:
      statusFilter === "active"
        ? "#166534"
        : "rgba(22,101,52,.75)",

    color: "#fff",
    border: "1px solid #22c55e",
    padding: "10px 22px",
    borderRadius: "8px",

    boxShadow:
      statusFilter === "active"
        ? "0 0 12px rgba(34,197,94,.35)"
        : "none",

    opacity: statusFilter === "active" ? 1 : 0.8,
    transition: "all .2s ease",
  }}
>
  Active
</button>

<button
  onClick={() => setStatusFilter("closed")}
  style={{
    cursor: "pointer",
    background:
      statusFilter === "closed"
        ? "#991b1b"
        : "#7f1d1d",

    color: "#fff",
    border: "1px solid #ef4444",
    padding: "10px 22px",
    borderRadius: "8px",

    opacity: statusFilter === "closed" ? 1 : 0.8,
    transition: "all .2s ease",
  }}
>
  Closed
</button>

        <button
  type="button"
  onClick={exportSessions}
  style={{
    marginLeft: "auto",
    color: "#fff",
    background: "transparent",
    border: "1px solid #444",
    padding: "10px 22px",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  Export CSV
</button>
      </div>

      <div className="audit-table-container">
  <table className="audit-table">
    <thead>
      <tr>
        <th>Date / Login</th>
        <th>User</th>
        <th>Role</th>
        <th>Access</th>
        <th>Logout</th>
        <th>Duration</th>
        <th>Status</th>
        <th>Session End</th>
      </tr>
    </thead>

    <tbody>
      {filteredSessions.length === 0 ? (
        <tr>
          <td
            colSpan={8}
            className="audit-empty-state"
          >
            No admin sessions found for the
            selected period.
          </td>
        </tr>
      ) : (
        filteredSessions.map((session) => {
          const activeNow =
            session.is_currently_online === true;

          const endDetails =
            getSessionEndDetails(
              session,
              activeNow
            );

          return (
            <tr
              key={session.id}
              className={
                session.is_temporary
                  ? "audit-row-temporary"
                  : ""
              }
            >
              <td>
                {formatDate(session.login_time)}
              </td>

              <td>{session.username}</td>

              <td>{session.role || "-"}</td>

              <td>
                <span
                  className={`audit-access-badge ${
                    session.is_temporary
                      ? "temporary"
                      : "standard"
                  }`}
                >
                  {session.is_temporary
                    ? "TEMPORARY PREVIEW"
                    : "STANDARD"}
                </span>

                {session.is_temporary &&
                  session.temporary_access_label && (
                    <small className="audit-access-label">
                      {
                        session.temporary_access_label
                      }
                    </small>
                  )}
              </td>

              <td>
                {formatDate(session.logout_time)}
              </td>

              <td>
                {formatDuration(
                  session.session_duration_seconds
                )}
              </td>

              <td>
                <span
                  className={`audit-status-badge ${
                    activeNow
                      ? "active"
                      : "closed"
                  }`}
                >
                  {activeNow
                    ? "ACTIVE"
                    : "CLOSED"}
                </span>
              </td>

              <td>
                <span
                  className={`audit-session-end ${endDetails.tone}`}
                >
                  {endDetails.label}
                </span>

                {endDetails.detail && (
                  <small className="audit-session-detail">
                    {endDetails.detail}
                  </small>
                )}
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>

      <div style={{ marginTop: "14px", color: "#b8c2cc" }}>
        Total: {filteredSessions.length}
      </div>
    </section>
  );
}

export default AdminAuditLogs;
