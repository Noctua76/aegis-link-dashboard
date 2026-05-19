import { useEffect, useState } from "react";

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString(
    "el-GR",
    { timeZone: "Europe/Athens" }
  );
}

function AdminAuditLogs() {

  const [sessions, setSessions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {

    fetch(
      "https://noctua-panic-backend-production.up.railway.app/admin/sessions/history"
    )
    .then(res => res.json())
    .then(data => {

      if(data.status === "ok"){
        setSessions(data.sessions);
      }

    });

  }, []);

  const filtered = sessions.filter(item => {

    if(statusFilter === "all") return true;

    if(statusFilter === "active"){
      return item.is_active;
    }

    return !item.is_active;

  });

  return (

    <section>

      <h1 style={{marginBottom:"20px"}}>
        Admin Audit Logs
      </h1>

      <div
      style={{
        display:"flex",
        gap:"10px",
        marginBottom:"20px"
      }}
      >

        <button onClick={() => setStatusFilter("all")}>
          All
        </button>

        <button onClick={() => setStatusFilter("active")}>
          Active
        </button>

        <button onClick={() => setStatusFilter("closed")}>
          Closed
        </button>

        <a
        href="https://noctua-panic-backend-production.up.railway.app/admin/sessions/export"
        target="_blank"
        >
          Export CSV
        </a>

      </div>

      <table style={{width:"100%"}}>

        <thead>

          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Login</th>
            <th>Logout</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {filtered.map(item => (

            <tr key={item.id}>

              <td>{item.username}</td>

              <td>{item.role}</td>

              <td>
                {formatDate(item.login_time)}
              </td>

              <td>
                {formatDate(item.logout_time)}
              </td>

              <td>
                {item.session_duration_seconds || "-"}
              </td>

              <td>

                {item.is_active
                  ? "🟢 ACTIVE"
                  : "⚪ CLOSED"}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </section>

  );

}

export default AdminAuditLogs;
