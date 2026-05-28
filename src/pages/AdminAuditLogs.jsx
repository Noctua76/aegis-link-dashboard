import { useEffect, useState } from "react";

const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("el-GR", {
    timeZone: "Europe/Athens",
  });
}

function isReallyActive(session) {
  if (!session.is_active || !session.last_seen) return false;

  const lastSeen = new Date(session.last_seen).getTime();
  const now = Date.now();

  return now - lastSeen < 90000;
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
    fetch(
      `${API_BASE_URL}/admin/sessions/history?from=${fromDate}&to=${toDate}`
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

  const exportUrl =
    `${API_BASE_URL}/admin/sessions/export?from=${fromDate}&to=${toDate}`;

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

        <a
          href={exportUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            marginLeft: "auto",
            color: "#fff",
            textDecoration: "none",
            border: "1px solid #444",
            padding: "10px 22px",
            borderRadius: "8px",
          }}
        >
          Export CSV
        </a>
      </div>

      <div
        style={{
          maxHeight: "520px",
          overflowY: "auto",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "14px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#111",
              zIndex: 1,
            }}
          >
            <tr>
              <th>Date / Login</th>
              <th>User</th>
              <th>Role</th>
              <th>Logout</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredSessions.map((session) => {
              const activeNow = session.is_currently_online === true;
              return (
                <tr
                  key={session.id}
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <td>{formatDate(session.login_time)}</td>
                  <td>{session.username}</td>
                  <td>{session.role}</td>
                  <td>{formatDate(session.logout_time)}</td>
                  <td>{session.session_duration_seconds || "-"}</td>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        minWidth: "82px",
                        textAlign: "center",
                        padding: "6px 10px",
                        borderRadius: "7px",
                        background: activeNow ? "#166534" : "#991b1b",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {activeNow ? "ACTIVE" : "CLOSED"}
                    </span>
                  </td>
                </tr>
              );
            })}
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
