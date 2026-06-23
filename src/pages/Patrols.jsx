import QRCode from "qrcode";
import { useEffect, useState } from "react";

const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";
const formatCompletedStatus = (status) => {
  if (status === "missed_completed_late") return "Missed Completed Late";
  if (status === "completed_late") return "Completed Late";
  return "Completed";
};

function Patrols() {
  const [patrolSites, setPatrolSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSiteDetails, setSelectedSiteDetails] = useState(null);
  const [selectedQrSiteDetails, setSelectedQrSiteDetails] = useState(null);
  const [selectedLastPatrol, setSelectedLastPatrol] = useState(null);
  const [selectedNextPatrol, setSelectedNextPatrol] = useState(null);
  const [selectedOverduePatrol, setSelectedOverduePatrol] = useState(null);
  const [selectedHistoryPatrol, setSelectedHistoryPatrol] = useState(null);
  const [missedHistoryModalOpen, setMissedHistoryModalOpen] = useState(false);
const [selectedMissedHistorySite, setSelectedMissedHistorySite] = useState(null);
const [missedHistory, setMissedHistory] = useState([]);
const [missedHistoryLoading, setMissedHistoryLoading] = useState(false);
const [missedHistoryFrom, setMissedHistoryFrom] = useState("");
const [missedHistoryTo, setMissedHistoryTo] = useState("");
const [missedHistoryPointId, setMissedHistoryPointId] = useState("");
const [missedHistoryType, setMissedHistoryType] = useState("all");
const [missedReportPreviewUrl, setMissedReportPreviewUrl] = useState("");
const [missedReportPreviewOpen, setMissedReportPreviewOpen] = useState(false);
const [completedHistoryModalOpen, setCompletedHistoryModalOpen] = useState(false);
const [selectedCompletedHistorySite, setSelectedCompletedHistorySite] = useState(null);
const [completedHistory, setCompletedHistory] = useState([]);
const [completedHistoryLoading, setCompletedHistoryLoading] = useState(false);
const [completedHistoryFrom, setCompletedHistoryFrom] = useState("");
const [completedHistoryTo, setCompletedHistoryTo] = useState("");
const [completedHistoryPointId, setCompletedHistoryPointId] = useState("");
const [completedHistoryType, setCompletedHistoryType] = useState("all");
const [completedHistoryStatus, setCompletedHistoryStatus] = useState("all");
const [completedReportPreviewUrl, setCompletedReportPreviewUrl] = useState("");
const [completedReportPreviewOpen, setCompletedReportPreviewOpen] = useState(false);
  const [patrolHistory, setPatrolHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);
const [detailsLoading, setDetailsLoading] = useState(false);
const [selectedQr, setSelectedQr] = useState(null);
const [qrImageUrl, setQrImageUrl] = useState("");

  useEffect(() => {
  const loadPatrolSites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patrols/sites`);
      const data = await response.json();

      if (data.status === "ok") {
        setPatrolSites(data.sites || []);
      }
    } catch (err) {
      console.error("Failed loading patrol sites:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatrolHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/patrols/completed-history`);
      const data = await response.json();

      if (data.status === "ok") {
        setPatrolHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed loading patrol history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  loadPatrolSites();
  loadPatrolHistory();

  const interval = setInterval(() => {
  loadPatrolSites();
  loadPatrolHistory();
}, 5000);

  return () => clearInterval(interval);
}, []);

  const openSiteDetails = async (siteId) => {
  setDetailsLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/patrols/sites/${siteId}/details`);
    const data = await response.json();

    if (data.status === "ok") {
      setSelectedSiteDetails(data);
    }
  } catch (err) {
    console.error("Failed loading patrol site details:", err);
  } finally {
    setDetailsLoading(false);
  }
};

const openQrSiteDetails = async (siteId) => {
  setDetailsLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/patrols/sites/${siteId}/details`);
    const data = await response.json();

    if (data.status === "ok") {
      setSelectedQrSiteDetails(data);
    }
  } catch (err) {
    console.error("Failed loading QR site details:", err);
  } finally {
    setDetailsLoading(false);
  }
};

const openQrModal = async (pointId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patrol-points/${pointId}/qr`);
    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error("Failed to load QR");
    }

    const qrPayload =
`https://noctua76.github.io/aegis-link-webapp/patrol.html?token=${data.point.qr_token}`;;

    const imageUrl = await QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
    });

    setSelectedQr({
      ...data.point,
      qr_payload: qrPayload,
    });

    setQrImageUrl(imageUrl);
  } catch (err) {
    console.error("Failed opening QR modal:", err);
    alert("Failed to load QR");
  }
};

const printQrCard = async (pointId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patrol-points/${pointId}/qr`);
    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error("Failed to load QR");
    }

    const qrPayload =
`https://noctua76.github.io/aegis-link-webapp/patrol.html?token=${data.point.qr_token}`;

    const imageUrl = await QRCode.toDataURL(qrPayload, {
      width: 420,
      margin: 2,
    });

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Aegis Link Patrol QR</title>
          <style>
  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    text-align: center;
    color: #111827;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }

  .card {
    border: 3px solid #111827;
    border-radius: 18px;
    padding: 28px;
    width: 500px;
    margin: 0 auto;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  h1 {
    margin: 0;
    font-size: 30px;
    letter-spacing: 1px;
  }

  h2 {
    margin-top: 20px;
    font-size: 24px;
  }

  .subtitle {
    color: #4b5563;
    margin-top: 8px;
    font-size: 16px;
  }

  img {
    width: 320px;
    height: 320px;
    margin: 24px auto;
    display: block;
  }

  .meta {
    margin-top: 16px;
    font-size: 14px;
    color: #374151;
    word-break: break-all;
  }

  .footer {
    margin-top: 20px;
    font-size: 13px;
    color: #6b7280;
  }
</style>
        </head>

        <body>
          <div class="card">
            <h1>AEGIS LINK</h1>
            <div class="subtitle">Patrol Checkpoint QR</div>

            <h2>${data.point.point_name}</h2>

            <img src="${imageUrl}" />

            <div class="meta">
              Token: ${data.point.qr_token}
            </div>

            <div class="footer">
              Scan this QR only during an assigned patrol round.
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  } catch (err) {
    console.error("Failed printing QR:", err);
    alert("Failed to print QR");
  }
};

const downloadQr = async (pointId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patrol-points/${pointId}/qr`);
    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error("Failed to load QR");
    }

    const qrPayload =
`https://noctua76.github.io/aegis-link-webapp/patrol.html?token=${data.point.qr_token}`;

    const imageUrl = await QRCode.toDataURL(qrPayload, {
      width: 640,
      margin: 2,
    });

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `aegis-link-${data.point.point_name}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Failed downloading QR:", err);
    alert("Failed to download QR");
  }
};

const loadMissedHistory = async ({
  siteId,
  from = "",
  to = "",
  pointId = "",
  type = "all",
}) => {
  setMissedHistoryLoading(true);

  try {
    const params = new URLSearchParams();

    if (siteId) params.append("site_id", siteId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (pointId) params.append("point_id", pointId);
    if (type) params.append("type", type);

    console.log("MISSED HISTORY REQUEST:", {
  siteId,
  from,
  to,
  pointId,
  type,
  url: `${API_BASE_URL}/patrols/missed-history?${params.toString()}`,
});

    const response = await fetch(
      `${API_BASE_URL}/patrols/missed-history?${params.toString()}`
    );

    const data = await response.json();

    if (data.status === "ok") {
      setMissedHistory(data.history || []);
    }
  } catch (err) {
    console.error("Failed loading missed patrol history:", err);
  } finally {
    setMissedHistoryLoading(false);
  }
};

const loadCompletedHistory = async ({
  siteId,
  from = "",
  to = "",
  pointId = "",
  type = "all",
  status = "all",
}) => {
  setCompletedHistoryLoading(true);

  try {
    const params = new URLSearchParams();

    if (siteId) params.append("site_id", siteId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (pointId) params.append("point_id", pointId);
    if (type) params.append("type", type);
    if (status) params.append("status", status);

    const response = await fetch(
      `${API_BASE_URL}/patrols/completed-history?${params.toString()}`
    );

    const data = await response.json();

    if (data.status === "ok") {
      setCompletedHistory(data.history || []);
    }
  } catch (err) {
    console.error("Failed loading completed patrol history:", err);
  } finally {
    setCompletedHistoryLoading(false);
  }
};

const openMissedReportPreview = () => {
  if (!selectedMissedHistorySite) return;

  const params = new URLSearchParams();

  params.append("site_id", selectedMissedHistorySite.site_id);

  if (missedHistoryFrom) params.append("from", missedHistoryFrom);
  if (missedHistoryTo) params.append("to", missedHistoryTo);
  if (missedHistoryPointId) params.append("point_id", missedHistoryPointId);
  if (missedHistoryType) params.append("type", missedHistoryType);

  params.append("preview", "true");

  const reportUrl = `${API_BASE_URL}/patrols/missed-history/report/pdf?${params.toString()}`;

  setMissedReportPreviewUrl(reportUrl);
  setMissedReportPreviewOpen(true);
};

const openCompletedReportPreview = () => {
  if (!selectedCompletedHistorySite) return;

  const params = new URLSearchParams();

  params.append("site_id", selectedCompletedHistorySite.site_id);

  if (completedHistoryFrom) params.append("from", completedHistoryFrom);
  if (completedHistoryTo) params.append("to", completedHistoryTo);
  if (completedHistoryPointId) params.append("point_id", completedHistoryPointId);
  if (completedHistoryType) params.append("type", completedHistoryType);
  if (completedHistoryStatus) params.append("status", completedHistoryStatus);

  params.append("preview", "true");

  const reportUrl = `${API_BASE_URL}/patrols/completed-history/report/pdf?${params.toString()}`;

  setCompletedReportPreviewUrl(reportUrl);
  setCompletedReportPreviewOpen(true);
};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Patrols</h1>
          <p
  style={{
    marginBottom: "40px",
    color: "#9ca3af",
  }}
>
  Operational center for patrol points, QR codes, and patrol monitoring.
</p>
        </div>
      </div>

      {loading ? (
        <div className="analytics-table-card">
          <h3>Loading Patrol Operations...</h3>
        </div>
      ) : patrolSites.length === 0 ? (
        <div className="analytics-table-card">
          <h3>No Patrol Sites</h3>
          <p style={{ color: "#9ca3af" }}>
            No sites with patrol points have been configured yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {patrolSites.map((site) => {
  const activePatrols = (site.upcoming_patrols || []).filter(
  (patrol) => patrol.status !== "overdue" && patrol.status !== "missed"
);

const overduePatrols = (site.upcoming_patrols || []).filter(
  (patrol) => patrol.status === "overdue"
);

const now = new Date();

const missedPatrols = (site.upcoming_patrols || []).filter((patrol) => {
  if (patrol.status !== "missed") return false;

  const scheduledAt = new Date(patrol.scheduled_at);
  const diffHours = (now - scheduledAt) / (1000 * 60 * 60);

  return diffHours <= 24;
});

const visibleMissedPatrols = missedPatrols.slice(-5).reverse();
const completedPatrolsForSite = patrolHistory.filter((entry) => {
  if (Number(entry.site_id) !== Number(site.site_id)) return false;

  const patrolTime = new Date(entry.patrol_time);
  const diffHours = (now - patrolTime) / (1000 * 60 * 60);

  return diffHours <= 24;
});

const visibleCompletedPatrols = completedPatrolsForSite.slice(0, 6);

  return (
            <div
  key={site.site_id}
  className="analytics-table-card"
>
              <h3>
                SITE-{String(site.site_id).padStart(3, "0")} |{" "}
                {site.site_name}
              </h3>

              <p style={{ color: "#9ca3af" }}>
                {site.site_location} · {site.site_status}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginTop: "18px",
                }}
              >
                <div
  className="system-status-card"
  onClick={() => openSiteDetails(site.site_id)}
  style={{ cursor: "pointer" }}
>
  <h3>Patrol Points</h3>
  <span>{site.active_points}</span>
</div>

                <div
  className="system-status-card"
  onClick={() => openQrSiteDetails(site.site_id)}
  style={{ cursor: "pointer" }}
>
  <h3>QR Codes</h3>
  <span>{site.generated_qrs}</span>
</div>

                <div
  className="system-status-card"
  onClick={() =>
    setSelectedLastPatrol({
      site_id: site.site_id,
      site_name: site.site_name,
      site_location: site.site_location,
      last_patrol: site.last_patrol,
      last_patrol_point: site.last_patrol_point,
      last_patrol_guard: site.last_patrol_guard,
      last_patrol_accuracy: site.last_patrol_accuracy,
      last_patrol_latitude: site.last_patrol_latitude,
      last_patrol_longitude: site.last_patrol_longitude,
    })
  }
  style={{ cursor: site.last_patrol ? "pointer" : "default" }}
>
  <h3>Last Patrol</h3>

  {site.last_patrol ? (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3px",
        fontSize: "15px",
        lineHeight: "1.25",
        whiteSpace: "nowrap",
        textAlign: "center",
      }}
    >
      <strong>
        {new Date(site.last_patrol).toLocaleDateString("el-GR", {
  timeZone: "Europe/Athens",
})}
      </strong>

      <strong>
        {new Date(site.last_patrol).toLocaleTimeString("el-GR", {
  timeZone: "Europe/Athens",
  hour: "2-digit",
  minute: "2-digit",
})}
      </strong>

      <small
        style={{
          marginTop: "4px",
          color: "#22c55e",
          fontSize: "12px",
          fontWeight: 800,
        }}
      >
        ● Completed
      </small>
    </span>
  ) : (
    <span>-</span>
  )}
</div>

                <div
  className="system-status-card"
  onClick={() =>
    site.next_patrol &&
    setSelectedNextPatrol({
      site_id: site.site_id,
      site_name: site.site_name,
      site_location: site.site_location,
      next_patrol: site.next_patrol,
      next_patrol_point: site.next_patrol_point,
      next_patrol_type: site.next_patrol_type,
      patrol_status: site.patrol_status,
    })
  }
  style={{ cursor: site.next_patrol ? "pointer" : "default" }}
>
  <h3>Next Patrol</h3>

  {site.next_patrol ? (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3px",
        fontSize: "15px",
        lineHeight: "1.25",
        whiteSpace: "nowrap",
        textAlign: "center",
      }}
    >
      <strong>
        {new Date(site.next_patrol).toLocaleDateString("el-GR", {
  timeZone: "Europe/Athens",
})}
      </strong>

      <strong>
        {new Date(site.next_patrol).toLocaleTimeString("el-GR", {
  timeZone: "Europe/Athens",
  hour: "2-digit",
  minute: "2-digit",
})}
      </strong>

      <small
        style={{
          marginTop: "4px",
          color:
            site.patrol_status === "overdue"
              ? "#ef4444"
              : site.patrol_status === "due_soon"
              ? "#f59e0b"
              : "#60a5fa",
          fontSize: "12px",
          fontWeight: 800,
        }}
      >
        ●{" "}
        {site.patrol_status === "overdue"
          ? "Overdue"
          : site.patrol_status === "due_soon"
          ? "Due Soon"
          : "Scheduled"}
      </small>
    </span>
  ) : (
    <span>-</span>
  )}
</div>
              </div>

              <div
  style={{
    marginTop: "20px",
    display: "grid",
    gap: "14px",
  }}
>
  <div
    style={{
      padding: "16px",
      borderRadius: "16px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        marginBottom: "14px",
      }}
    >
      <div>
        <h3 style={{ margin: 0 }}>Active Patrol Queue</h3>
        <p
          style={{
            margin: "4px 0 0",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          Scheduled and due patrols awaiting completion.
        </p>
      </div>

      <span
        style={{
          padding: "6px 10px",
          borderRadius: "999px",
          background: "rgba(96,165,250,0.12)",
          border: "1px solid rgba(96,165,250,0.35)",
          color: "#bfdbfe",
          fontSize: "12px",
          fontWeight: 800,
        }}
      >
        {activePatrols.length} Active
      </span>
    </div>

    {activePatrols.length ? (
      <div style={{ display: "grid", gap: "10px" }}>
        {activePatrols.map((patrol, index) => (
          <div
            key={`active-${patrol.schedule_type}-${patrol.point_id}-${index}`}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(90px, 120px) 1fr auto",
              gap: "12px",
              alignItems: "center",
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              style={{
                padding: "5px 9px",
                borderRadius: "999px",
                textAlign: "center",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                color:
                  patrol.schedule_type === "manual"
                    ? "#fcd34d"
                    : "#bfdbfe",
                background:
                  patrol.schedule_type === "manual"
                    ? "rgba(245,158,11,0.12)"
                    : "rgba(96,165,250,0.12)",
                border:
                  patrol.schedule_type === "manual"
                    ? "1px solid rgba(245,158,11,0.35)"
                    : "1px solid rgba(96,165,250,0.35)",
              }}
            >
              {patrol.schedule_type === "manual"
                ? "Extra Patrol"
                : "Routine Patrol"}
            </span>

            <div>
              <strong>{patrol.point_name || "Patrol Point"}</strong>

              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "13px",
                  marginTop: "3px",
                }}
              >
                {new Date(patrol.scheduled_at).toLocaleDateString("el-GR", {
                  timeZone: "Europe/Athens",
                })}{" "}
                ·{" "}
                {new Date(patrol.scheduled_at).toLocaleTimeString("el-GR", {
                  timeZone: "Europe/Athens",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <span
              style={{
                color:
                  patrol.status === "due_soon" ? "#f59e0b" : "#22c55e",
                fontSize: "12px",
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              ● {patrol.status === "due_soon" ? "Due Soon" : "Scheduled"}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <div
        style={{
          padding: "14px",
          borderRadius: "14px",
          color: "#9ca3af",
          background: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.12)",
        }}
      >
        No active patrols scheduled.
      </div>
    )}
  </div>

  <div
    style={{
      padding: "16px",
      borderRadius: "16px",
      background: "rgba(239,68,68,0.05)",
      border: "1px solid rgba(239,68,68,0.22)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        marginBottom: "14px",
      }}
    >
      <div>
        <h3 style={{ margin: 0 }}>Overdue Patrols</h3>
        <p
          style={{
            margin: "4px 0 0",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          Patrols that were scheduled but not completed on time.
        </p>
      </div>

      <span
        style={{
          padding: "6px 10px",
          borderRadius: "999px",
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.35)",
          color: "#fecaca",
          fontSize: "12px",
          fontWeight: 800,
        }}
      >
        {overduePatrols.length} Overdue
      </span>
    </div>

    {overduePatrols.length ? (
      <div style={{ display: "grid", gap: "10px" }}>
        {overduePatrols.map((patrol, index) => (
          <div
  key={`overdue-${patrol.schedule_type}-${patrol.point_id}-${index}`}
  onClick={() =>
    setSelectedOverduePatrol({
      assigned_guard: patrol.assigned_guard,
guard_session_login: patrol.guard_session_login,
shift_label: patrol.shift_label,
      site_id: site.site_id,
      site_name: site.site_name,
      site_location: site.site_location,
      point_name: patrol.point_name,
      schedule_type: patrol.schedule_type,
      scheduled_at: patrol.scheduled_at,
      status: patrol.status,
    })
  }
  style={{
    cursor: "pointer",
              display: "grid",
              gridTemplateColumns: "minmax(90px, 120px) 1fr auto",
              gap: "12px",
              alignItems: "center",
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(239,68,68,0.18)",
            }}
          >
            <span
              style={{
                padding: "5px 9px",
                borderRadius: "999px",
                textAlign: "center",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                color:
                  patrol.schedule_type === "manual"
                    ? "#fcd34d"
                    : "#bfdbfe",
                background:
                  patrol.schedule_type === "manual"
                    ? "rgba(245,158,11,0.12)"
                    : "rgba(96,165,250,0.12)",
                border:
                  patrol.schedule_type === "manual"
                    ? "1px solid rgba(245,158,11,0.35)"
                    : "1px solid rgba(96,165,250,0.35)",
              }}
            >
              {patrol.schedule_type === "manual"
                ? "Extra Patrol"
                : "Routine Patrol"}
            </span>

            <div>
              <strong>{patrol.point_name || "Patrol Point"}</strong>

              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "13px",
                  marginTop: "3px",
                }}
              >
                {new Date(patrol.scheduled_at).toLocaleDateString("el-GR", {
                  timeZone: "Europe/Athens",
                })}{" "}
                ·{" "}
                {new Date(patrol.scheduled_at).toLocaleTimeString("el-GR", {
                  timeZone: "Europe/Athens",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <span
              style={{
                color: "#ef4444",
                fontSize: "12px",
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              ● Overdue
            </span>
          </div>
                ))}
      </div>
    ) : (
      <div
        style={{
          padding: "14px",
          borderRadius: "14px",
          color: "#9ca3af",
          background: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.12)",
        }}
      >
              No overdue patrols.
    </div>
  )}

<div
  style={{
    marginTop: "20px",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.35)",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "14px",
    }}
  >
    <div>
      <h3 style={{ margin: 0 }}>Missed Patrols</h3>

      <p
        style={{
          margin: "4px 0 0",
          color: "#9ca3af",
          fontSize: "13px",
        }}
      >
        Patrols that were not completed within the allowed time window.
      </p>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <button
    type="button"
    onClick={() => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const from = yesterday.toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);

  setSelectedMissedHistorySite(site);
  setMissedHistoryModalOpen(true);
  setMissedHistoryType("all");
  setMissedHistoryFrom(from);
  setMissedHistoryTo(to);
  setMissedHistoryPointId("");

  loadMissedHistory({
    siteId: site.site_id,
    from,
    to,
    pointId: "",
    type: "all",
  });
}}
    style={{
      padding: "6px 10px",
      borderRadius: "999px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      color: "#e5e7eb",
      fontSize: "12px",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
    View History
  </button>

  <span
    style={{
      padding: "6px 10px",
      borderRadius: "999px",
      background: "rgba(239,68,68,0.15)",
      color: "#fecaca",
      fontSize: "12px",
      fontWeight: 800,
    }}
  >
    {missedPatrols.length} Missed
  </span>
</div>
  </div>

  {missedPatrols.length ? (
    <div style={{ display: "grid", gap: "10px" }}>
      {visibleMissedPatrols.map((patrol, index) => (
        <div
          key={`missed-${patrol.schedule_type}-${patrol.point_id}-${index}`}
          style={{
            padding: "12px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <strong>{patrol.point_name}</strong>

          <div
            style={{
              marginTop: "4px",
              color: "#9ca3af",
              fontSize: "13px",
            }}
          >
            {new Date(patrol.scheduled_at).toLocaleString("el-GR", {
              timeZone: "Europe/Athens",
            })}
          </div>

          <div
            style={{
              marginTop: "6px",
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            ● Missed Patrol
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div
      style={{
        padding: "14px",
        borderRadius: "14px",
        color: "#9ca3af",
        background: "rgba(255,255,255,0.03)",
        border: "1px dashed rgba(255,255,255,0.12)",
      }}
    >
      No missed patrols.
    </div>
  )}
  <div
  style={{
    marginTop: "20px",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(34,197,94,0.06)",
    border: "1px solid rgba(34,197,94,0.25)",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "14px",
    }}
  >
    <div>
      <h3 style={{ margin: 0 }}>Completed Patrols</h3>

      <p
        style={{
          margin: "4px 0 0",
          color: "#9ca3af",
          fontSize: "13px",
        }}
      >
        Completed patrols recorded within the last 24 hours.
      </p>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <button
        type="button"
        onClick={() => {
          setSelectedCompletedHistorySite(site);
  setCompletedHistoryModalOpen(true);
  setCompletedHistoryType("all");
  setCompletedHistoryStatus("all");
  setCompletedHistoryFrom("");
  setCompletedHistoryTo("");
  setCompletedHistoryPointId("");

  loadCompletedHistory({
    siteId: site.site_id,
    type: "all",
    status: "all",
  });
}}
        style={{
          padding: "6px 10px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.14)",
          color: "#e5e7eb",
          fontSize: "12px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        View Completed
      </button>

      <span
        style={{
          padding: "6px 10px",
          borderRadius: "999px",
          background: "rgba(34,197,94,0.15)",
          color: "#bbf7d0",
          fontSize: "12px",
          fontWeight: 800,
        }}
      >
        {completedPatrolsForSite.length} Completed
      </span>
    </div>
  </div>

  {visibleCompletedPatrols.length ? (
    <div style={{ display: "grid", gap: "10px" }}>
      {visibleCompletedPatrols.map((entry) => (
        <div
          key={`completed-${entry.id}`}
          onClick={() => setSelectedHistoryPatrol(entry)}
          style={{
            padding: "12px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(34,197,94,0.22)",
            cursor: "pointer",
          }}
        >
          <strong>{entry.point_name || "Patrol Point"}</strong>

          <div
            style={{
              marginTop: "4px",
              color: "#9ca3af",
              fontSize: "13px",
            }}
          >
            {new Date(entry.patrol_time).toLocaleString("el-GR", {
              timeZone: "Europe/Athens",
            })}
          </div>

          <div
            style={{
              marginTop: "6px",
              color:
                entry.display_status === "missed_completed_late"
                  ? "#f59e0b"
                  : entry.display_status === "completed_late"
                  ? "#facc15"
                  : "#22c55e",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            ●{" "}
            {entry.display_status === "missed_completed_late"
              ? "Missed Completed Late"
              : entry.display_status === "completed_late"
              ? "Completed Late"
              : "Completed"}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div
      style={{
        padding: "14px",
        borderRadius: "14px",
        color: "#9ca3af",
        background: "rgba(255,255,255,0.03)",
        border: "1px dashed rgba(255,255,255,0.12)",
      }}
    >
      No completed patrols in the last 24 hours.
    </div>
  )}
</div>
</div>

</div>
</div>
</div>
);

})}
</div>
)}

{selectedSiteDetails && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>
          SITE-{String(selectedSiteDetails.site.site_id).padStart(3, "0")} |{" "}
          {selectedSiteDetails.site.site_name}
        </h2>

        <button
          type="button"
          onClick={() => setSelectedSiteDetails(null)}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        <p style={{ color: "#9ca3af" }}>
          {selectedSiteDetails.site.site_location} ·{" "}
          {selectedSiteDetails.site.site_status}
        </p>

        <h3>Patrol Points</h3>

        <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
          {selectedSiteDetails.points.map((point, index) => (
            <div key={point.id} className="analytics-table-card">
              <h4>
                PT-{String(index + 1).padStart(3, "0")} | {point.point_name}
              </h4>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
  <span className="site-status normal">
    {point.qr_token ? "QR GENERATED" : "QR PENDING"}
  </span>

  <span className={point.active ? "site-status normal" : "site-status inactive"}>
    {point.active ? "ACTIVE" : "INACTIVE"}
  </span>
</div>


              <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                Created:{" "}
                {point.created_at
                  ? new Date(point.created_at).toLocaleString("el-GR")
                  : "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

{selectedOverduePatrol && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>
          Overdue Patrol | SITE-
          {String(selectedOverduePatrol.site_id).padStart(3, "0")} |{" "}
          {selectedOverduePatrol.site_name}
        </h2>

        <button
          type="button"
          onClick={() => setSelectedOverduePatrol(null)}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        <p style={{ color: "#9ca3af" }}>
          {selectedOverduePatrol.site_location}
        </p>

        <div className="analytics-table-card">
          <h3>Overdue Patrol Details</h3>

          <p>
            <strong>Checkpoint:</strong>{" "}
            {selectedOverduePatrol.point_name || "-"}
          </p>

          <p>
            <strong>Scheduled:</strong>{" "}
            {selectedOverduePatrol.scheduled_at
              ? new Date(selectedOverduePatrol.scheduled_at).toLocaleString("el-GR", {
                  timeZone: "Europe/Athens",
                })
              : "-"}
          </p>

          <p>
            <strong>Status:</strong> Overdue
          </p>

          <p>
            <strong>Assigned Guard:</strong>{" "}
{selectedOverduePatrol.assigned_guard || "No logged-in guard found"}
          </p>

          <p>
            <strong>Current Shift:</strong>{" "}
{selectedOverduePatrol.shift_label || "24/7 Coverage"}
          </p>

          <p>
            <strong>Minutes Late:</strong>{" "}
            {selectedOverduePatrol.scheduled_at
              ? Math.max(
                  0,
                  Math.floor(
                    (Date.now() -
                      new Date(selectedOverduePatrol.scheduled_at).getTime()) /
                      60000
                  )
                )
              : "-"}
          </p>

          <p>
            <strong>Site:</strong>{" "}
            {selectedOverduePatrol.site_name || "-"}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

{missedHistoryModalOpen && selectedMissedHistorySite && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>
          Missed Patrol History | SITE-
          {String(selectedMissedHistorySite.site_id).padStart(3, "0")} |{" "}
          {selectedMissedHistorySite.site_name}
        </h2>

        <button
          type="button"
          onClick={() => {
            setMissedHistoryModalOpen(false);
            setSelectedMissedHistorySite(null);
            setMissedHistory([]);
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        <p style={{ color: "#9ca3af" }}>
          {selectedMissedHistorySite.site_location}
        </p>

        <div className="analytics-table-card">
  <h3 style={{ marginBottom: "18px" }}>History Filters</h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
      gap: "18px",
      alignItems: "end",
    }}
  >
    <div>
      <label style={{ display: "block", marginBottom: "8px" }}>
        From Date
      </label>
      <input
        type="date"
        value={missedHistoryFrom}
        onChange={(e) => setMissedHistoryFrom(e.target.value)}
        style={{ width: "100%" }}
      />
    </div>

    <div>
      <label style={{ display: "block", marginBottom: "8px" }}>
        To Date
      </label>
      <input
        type="date"
        value={missedHistoryTo}
        onChange={(e) => setMissedHistoryTo(e.target.value)}
        style={{ width: "100%" }}
      />
    </div>

    <div>
      <label style={{ display: "block", marginBottom: "8px" }}>
        Patrol Point
      </label>
      <select
        value={missedHistoryPointId}
        onChange={(e) => setMissedHistoryPointId(e.target.value)}
        style={{ width: "100%" }}
      >
        <option value="">All Points</option>
        {(selectedMissedHistorySite.upcoming_patrols || [])
          .filter(
            (patrol, index, arr) =>
              patrol.point_id &&
              arr.findIndex((p) => p.point_id === patrol.point_id) === index
          )
          .map((patrol) => (
            <option key={patrol.point_id} value={patrol.point_id}>
              {patrol.point_name}
            </option>
          ))}
      </select>
    </div>

    <div>
      <label style={{ display: "block", marginBottom: "8px" }}>
        Patrol Type
      </label>
      <select
        value={missedHistoryType}
        onChange={(e) => setMissedHistoryType(e.target.value)}
        style={{ width: "100%" }}
      >
        <option value="all">All Patrols</option>
        <option value="recurring">Routine Patrols</option>
        <option value="manual">Manual Patrols</option>
      </select>
    </div>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      marginTop: "22px",
    }}
  >
    <button
      type="button"
      onClick={() =>
        loadMissedHistory({
          siteId: selectedMissedHistorySite.site_id,
          from: missedHistoryFrom,
          to: missedHistoryTo,
          pointId: missedHistoryPointId,
          type: missedHistoryType,
        })
      }
      style={{
        padding: "9px 18px",
        borderRadius: "999px",
        background: "rgba(96,165,250,0.16)",
        border: "1px solid rgba(96,165,250,0.45)",
        color: "#bfdbfe",
        fontSize: "13px",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      View Results
    </button>

    <button
      type="button"
      onClick={openMissedReportPreview}
      style={{
        padding: "9px 18px",
        borderRadius: "999px",
        background: "rgba(34,197,94,0.16)",
        border: "1px solid rgba(34,197,94,0.45)",
        color: "#bbf7d0",
        fontSize: "13px",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      Print Report
    </button>
  </div>
</div>

        <div className="analytics-table-card" style={{ marginTop: "18px" }}>
          <h3>Missed Patrol Results</h3>

          {missedHistoryLoading ? (
            <p style={{ color: "#9ca3af" }}>
              Loading missed patrol history...
            </p>
          ) : missedHistory.length ? (
            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: "14px",
                maxHeight: "360px",
                overflowY: "auto",
                paddingRight: "6px",
              }}
            >
              {missedHistory.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 1fr",
                    gap: "12px",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(239,68,68,0.22)",
                  }}
                >
                  <div>
                    <strong>{entry.point_name || "Patrol Point"}</strong>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#9ca3af",
                        fontSize: "13px",
                      }}
                    >
                      {new Date(entry.scheduled_at).toLocaleString("el-GR", {
                        timeZone: "Europe/Athens",
                      })}
                    </div>
                  </div>

                  <div
  style={{
    color: "#9ca3af",
    fontSize: "13px",
  }}
>
  <div>Guard: {entry.guard_name || "-"}</div>
  <div>
    Type:{" "}
    {entry.schedule_type === "manual"
      ? "Manual Patrol"
      : "Routine Patrol"}
  </div>
</div>

                  <span
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      fontWeight: 800,
                      textAlign: "right",
                    }}
                  >
                    ● Missed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#9ca3af" }}>
              Select filters and press View Results.
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
)}

{completedHistoryModalOpen && selectedCompletedHistorySite && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>
          Completed Patrol History | SITE-
          {String(selectedCompletedHistorySite.site_id).padStart(3, "0")} |{" "}
          {selectedCompletedHistorySite.site_name}
        </h2>

        <button
          type="button"
          onClick={() => {
            setCompletedHistoryModalOpen(false);
            setSelectedCompletedHistorySite(null);
            setCompletedHistory([]);
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        <p style={{ color: "#9ca3af" }}>
          {selectedCompletedHistorySite.site_location}
        </p>

        <div className="analytics-table-card">
          <h3 style={{ marginBottom: "18px" }}>History Filters</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(150px, 1fr))",
              gap: "18px",
              alignItems: "end",
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                From Date
              </label>
              <input
                type="date"
                value={completedHistoryFrom}
                onChange={(e) => setCompletedHistoryFrom(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                To Date
              </label>
              <input
                type="date"
                value={completedHistoryTo}
                onChange={(e) => setCompletedHistoryTo(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Patrol Point
              </label>
              <select
                value={completedHistoryPointId}
                onChange={(e) => setCompletedHistoryPointId(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">All Points</option>
                {(selectedCompletedHistorySite.upcoming_patrols || [])
                  .filter(
                    (patrol, index, arr) =>
                      patrol.point_id &&
                      arr.findIndex((p) => p.point_id === patrol.point_id) ===
                        index
                  )
                  .map((patrol) => (
                    <option key={patrol.point_id} value={patrol.point_id}>
                      {patrol.point_name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Patrol Type
              </label>
              <select
                value={completedHistoryType}
                onChange={(e) => setCompletedHistoryType(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="all">All Patrols</option>
                <option value="recurring">Routine Patrols</option>
                <option value="manual">Manual Patrols</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Completion Status
              </label>
              <select
                value={completedHistoryStatus}
                onChange={(e) => setCompletedHistoryStatus(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="all">All Completed</option>
                <option value="completed">Completed</option>
                <option value="completed_late">Completed Late</option>
                <option value="missed_completed_late">
                  Missed Completed Late
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "22px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                loadCompletedHistory({
                  siteId: selectedCompletedHistorySite.site_id,
                  from: completedHistoryFrom,
                  to: completedHistoryTo,
                  pointId: completedHistoryPointId,
                  type: completedHistoryType,
                  status: completedHistoryStatus,
                })
              }
              style={{
                padding: "9px 18px",
                borderRadius: "999px",
                background: "rgba(96,165,250,0.16)",
                border: "1px solid rgba(96,165,250,0.45)",
                color: "#bfdbfe",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              View Results
            </button>

            <button
              type="button"
              onClick={openCompletedReportPreview}
              style={{
                padding: "9px 18px",
                borderRadius: "999px",
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.25)",
                color: "#86efac",
                fontSize: "13px",
                fontWeight: 800,
                opacity: 1,
cursor: "pointer",
              }}
            >
              Print Report
            </button>
          </div>
        </div>

        <div className="analytics-table-card" style={{ marginTop: "18px" }}>
          <h3>Completed Patrol Results</h3>

          {completedHistoryLoading ? (
            <p style={{ color: "#9ca3af" }}>
              Loading completed patrol history...
            </p>
          ) : completedHistory.length ? (
            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: "14px",
                maxHeight: "420px",
                overflowY: "auto",
                paddingRight: "6px",
              }}
            >
              {completedHistory.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: "14px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(34,197,94,0.22)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.1fr 1.1fr 1fr",
                      gap: "12px",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <strong>{entry.point_name || "Patrol Point"}</strong>

                      <div
                        style={{
                          marginTop: "6px",
                          color: "#9ca3af",
                          fontSize: "13px",
                        }}
                      >
                        Site: {entry.site_name || "-"}
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          color: "#9ca3af",
                          fontSize: "13px",
                        }}
                      >
                        Guard: {entry.guard_name || "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        color: "#e5e7eb",
                        fontSize: "13px",
                      }}
                    >
                      <div>
                        Completed:{" "}
                        {entry.patrol_time
                          ? new Date(entry.patrol_time).toLocaleString(
                              "el-GR",
                              {
                                timeZone: "Europe/Athens",
                              }
                            )
                          : "-"}
                      </div>

                      <div style={{ marginTop: "4px" }}>
                        Delay:{" "}
                        {entry.delay_minutes !== null &&
                        entry.delay_minutes !== undefined
                          ? `${entry.delay_minutes} minutes`
                          : "-"}
                      </div>

                      <div style={{ marginTop: "4px" }}>
                        Shift: {entry.shift_label || "-"}
                      </div>

                      <div style={{ marginTop: "4px" }}>
                        Type:{" "}
                        {entry.schedule_type === "manual"
                          ? "Manual Patrol"
                          : "Routine Patrol"}
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "13px",
                      }}
                    >
                      <div
                        style={{
                          color:
                            entry.display_status === "missed_completed_late"
                              ? "#f59e0b"
                              : entry.display_status === "completed_late"
                              ? "#facc15"
                              : "#22c55e",
                          fontWeight: 800,
                        }}
                      >
                        ● {formatCompletedStatus(entry.display_status)}
                      </div>

                      <div
                        style={{
                          marginTop: "8px",
                          color: "#9ca3af",
                        }}
                      >
                        GPS Accuracy:{" "}
                        {entry.accuracy
                          ? `${Number(entry.accuracy).toFixed(2)} m`
                          : "-"}
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          color: "#9ca3af",
                        }}
                      >
                        Lat: {entry.latitude || "-"}
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          color: "#9ca3af",
                        }}
                      >
                        Lon: {entry.longitude || "-"}
                      </div>

                      {entry.latitude && entry.longitude && (
                        <div style={{ marginTop: "10px" }}>
                          <a
                            href={`https://maps.google.com/?q=${entry.latitude},${entry.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="action-button"
                          >
                            View Location
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#9ca3af" }}>
              No completed patrols found for the selected filters.
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
)}

{missedReportPreviewOpen && missedReportPreviewUrl && (
  <div className="report-modal-overlay">
    <div className="report-modal" style={{ maxWidth: "1100px", height: "90vh" }}>
      <div className="report-modal-header">
        <h2>Missed Patrol History Report Preview</h2>

        <button
          type="button"
          onClick={() => {
            setMissedReportPreviewOpen(false);
            setMissedReportPreviewUrl("");
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "16px", height: "calc(90vh - 80px)" }}>
        <iframe
          src={missedReportPreviewUrl}
          title="Missed Patrol History Report Preview"
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            background: "#fff",
          }}
        />
        <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "16px",
  }}
>
  <button
    type="button"
    onClick={() =>
      window.open(
        missedReportPreviewUrl.replace("&preview=true", ""),
        "_blank"
      )
    }
  >
    Download / Print Report
  </button>
</div>
      </div>
    </div>
  </div>
)}

{completedReportPreviewOpen && (
  <div className="modal-overlay">
    <div
      className="analytics-table-card"
      style={{
        width: "95%",
        maxWidth: "1400px",
        height: "90vh",
        position: "relative",
      }}
    >
      <button
        onClick={() => setCompletedReportPreviewOpen(false)}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: "28px",
          cursor: "pointer",
        }}
      >
        ×
      </button>

      <h2
        style={{
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        Completed Patrol Report Preview
      </h2>

      <iframe
        src={completedReportPreviewUrl}
        title="Completed Patrol Report"
        style={{
          width: "100%",
          height: "calc(100% - 70px)",
          border: "none",
          borderRadius: "12px",
          background: "#fff",
        }}
      />
    </div>
  </div>
)}

{selectedNextPatrol && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>
          Next Patrol | SITE-
          {String(selectedNextPatrol.site_id).padStart(3, "0")} |{" "}
          {selectedNextPatrol.site_name}
        </h2>

        <button
          type="button"
          onClick={() => setSelectedNextPatrol(null)}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        <p style={{ color: "#9ca3af" }}>
          {selectedNextPatrol.site_location}
        </p>

        <div className="analytics-table-card">
          <h3>Scheduled Patrol Details</h3>

          <p>
            <strong>Checkpoint:</strong>{" "}
            {selectedNextPatrol.next_patrol_point || "-"}
          </p>

          <p>
            <strong>Type:</strong>{" "}
            {selectedNextPatrol.next_patrol_type === "manual"
              ? "Extra Patrol"
              : "Routine Patrol"}
          </p>

          <p>
            <strong>Scheduled:</strong>{" "}
            {selectedNextPatrol.next_patrol
              ? new Date(selectedNextPatrol.next_patrol).toLocaleString("el-GR", {
                  timeZone: "Europe/Athens",
                })
              : "-"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {selectedNextPatrol.patrol_status === "due_soon"
              ? "Due Soon"
              : selectedNextPatrol.patrol_status === "scheduled"
              ? "Scheduled"
              : "Not Scheduled"}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

{selectedLastPatrol && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>
          Last Patrol | SITE-
          {String(selectedLastPatrol.site_id).padStart(3, "0")} |{" "}
          {selectedLastPatrol.site_name}
        </h2>

        <button
          type="button"
          onClick={() => setSelectedLastPatrol(null)}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        <p style={{ color: "#9ca3af" }}>
          {selectedLastPatrol.site_location}
        </p>

        <div className="analytics-table-card">
          <h3>Completed Patrol Details</h3>

          <p>
            <strong>Checkpoint:</strong>{" "}
            {selectedLastPatrol.last_patrol_point || "-"}
          </p>

          <p>
            <strong>Guard:</strong>{" "}
            {selectedLastPatrol.last_patrol_guard || "-"}
          </p>

          <p>
            <strong>Completed:</strong>{" "}
            {selectedLastPatrol.last_patrol
              ? new Date(selectedLastPatrol.last_patrol).toLocaleString("el-GR", {
                  timeZone: "Europe/Athens",
                })
              : "-"}
          </p>

          <p>
            <strong>GPS Accuracy:</strong>{" "}
            {selectedLastPatrol.last_patrol_accuracy
              ? `${selectedLastPatrol.last_patrol_accuracy}m`
              : "-"}
          </p>

          <p>
            <strong>Latitude:</strong>{" "}
            {selectedLastPatrol.last_patrol_latitude || "-"}
          </p>

          <p>
            <strong>Longitude:</strong>{" "}
            {selectedLastPatrol.last_patrol_longitude || "-"}
          </p>
          {selectedLastPatrol.last_patrol_latitude &&
  selectedLastPatrol.last_patrol_longitude && (
    <div style={{ marginTop: "20px" }}>
      <a
        href={`https://maps.google.com/?q=${selectedLastPatrol.last_patrol_latitude},${selectedLastPatrol.last_patrol_longitude}`}
        target="_blank"
        rel="noreferrer"
        className="action-button"
      >
        View Location
      </a>
    </div>
)}
        </div>
      </div>
    </div>
  </div>
)}

{selectedHistoryPatrol && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>Patrol History Details</h2>

        <button
          type="button"
          onClick={() => setSelectedHistoryPatrol(null)}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        <div className="analytics-table-card">
          <h3>Completed Patrol Details</h3>

          <p>
            <strong>Checkpoint:</strong>{" "}
            {selectedHistoryPatrol.point_name || "-"}
          </p>

          <p>
            <strong>Site:</strong>{" "}
            {selectedHistoryPatrol.site_name || "-"}
          </p>

          <p>
            <strong>Guard:</strong>{" "}
            {selectedHistoryPatrol.guard_name || "-"}
          </p>

          <p>
            <strong>Completed:</strong>{" "}
            {selectedHistoryPatrol.patrol_time
              ? new Date(selectedHistoryPatrol.patrol_time).toLocaleString("el-GR", {
                  timeZone: "Europe/Athens",
                })
              : "-"}
          </p>

          <p>
  <strong>Status:</strong>{" "}
  {selectedHistoryPatrol.display_status === "missed_completed_late"
    ? "Missed Completed Late"
    : selectedHistoryPatrol.display_status === "completed_late"
    ? "Completed Late"
    : "Completed"}
</p>

<p>
  <strong>Delay:</strong>{" "}
  {selectedHistoryPatrol.delay_minutes !== null &&
  selectedHistoryPatrol.delay_minutes !== undefined
    ? `${selectedHistoryPatrol.delay_minutes} minutes`
    : "-"}
</p>

<p>
  <strong>Shift:</strong>{" "}
  {selectedHistoryPatrol.shift_label || "-"}
</p>

          <p>
            <strong>GPS Accuracy:</strong>{" "}
            {selectedHistoryPatrol.accuracy
  ? `${Number(selectedHistoryPatrol.accuracy).toFixed(2)} m`
  : "-"}
          </p>

          <p>
            <strong>Latitude:</strong>{" "}
            {selectedHistoryPatrol.latitude || "-"}
          </p>

          <p>
            <strong>Longitude:</strong>{" "}
            {selectedHistoryPatrol.longitude || "-"}
          </p>

          {selectedHistoryPatrol.latitude &&
            selectedHistoryPatrol.longitude && (
              <div style={{ marginTop: "20px" }}>
                <a
                  href={`https://maps.google.com/?q=${selectedHistoryPatrol.latitude},${selectedHistoryPatrol.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="action-button"
                >
                  View Location
                </a>
              </div>
            )}
        </div>
      </div>
    </div>
  </div>
)}

{selectedQrSiteDetails && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>
          QR Codes | SITE-
          {String(selectedQrSiteDetails.site.site_id).padStart(3, "0")} |{" "}
          {selectedQrSiteDetails.site.site_name}
        </h2>

        <button
          type="button"
          onClick={() => setSelectedQrSiteDetails(null)}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        <p style={{ color: "#9ca3af" }}>
          {selectedQrSiteDetails.site.site_location} ·{" "}
          {selectedQrSiteDetails.site.site_status}
        </p>

        <h3>Checkpoint QR Codes</h3>

        <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
          {selectedQrSiteDetails.points.map((point, index) => (
            <div key={point.id} className="analytics-table-card">
              <h4>
                PT-{String(index + 1).padStart(3, "0")} | {point.point_name}
              </h4>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <span className="site-status normal">
                  {point.qr_token ? "QR GENERATED" : "QR PENDING"}
                </span>

                <span
                  className={
                    point.active ? "site-status normal" : "site-status inactive"
                  }
                >
                  {point.active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openQrModal(point.id);
                  }}
                >
                  View QR
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadQr(point.id);
                  }}
                >
                  Download QR
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    printQrCard(point.id);
                  }}
                >
                  Print QR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

{selectedQr && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>QR Code | {selectedQr.point_name}</h2>

        <button
          type="button"
          onClick={() => {
            setSelectedQr(null);
            setQrImageUrl("");
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "24px", textAlign: "center" }}>
        {qrImageUrl && (
          <img
            src={qrImageUrl}
            alt={`QR Code for ${selectedQr.point_name}`}
            style={{
              width: "320px",
              height: "320px",
              background: "#ffffff",
              padding: "12px",
              borderRadius: "12px",
            }}
          />
        )}

        <h3 style={{ marginTop: "20px" }}>{selectedQr.point_name}</h3>

        <p style={{ color: "#9ca3af", wordBreak: "break-all" }}>
          {selectedQr.qr_payload}
        </p>

        <p style={{ color: "#9ca3af", wordBreak: "break-all" }}>
          Token: {selectedQr.qr_token}
        </p>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Patrols;