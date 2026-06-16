import QRCode from "qrcode";
import { useEffect, useState } from "react";

const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";

function Patrols() {
  const [patrolSites, setPatrolSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSiteDetails, setSelectedSiteDetails] = useState(null);
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

    loadPatrolSites();

    const interval = setInterval(loadPatrolSites, 15000);

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
          {patrolSites.map((site) => (
            <div
  key={site.site_id}
  className="analytics-table-card"
  onClick={() => openSiteDetails(site.site_id)}
  style={{ cursor: "pointer" }}
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
                <div className="system-status-card">
                  <h3>Patrol Points</h3>
                  <span>{site.active_points}</span>
                </div>

                <div className="system-status-card">
                  <h3>QR Codes</h3>
                  <span>{site.generated_qrs}</span>
                </div>

                <div className="system-status-card">
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

                <div className="system-status-card">
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
      <h3 style={{ margin: 0 }}>Upcoming Patrols</h3>
      <p
        style={{
          margin: "4px 0 0",
          color: "#9ca3af",
          fontSize: "13px",
        }}
      >
        Recurring and manual patrols scheduled for this site.
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
      {site.upcoming_patrols?.length || 0} Scheduled
    </span>
  </div>

  {site.upcoming_patrols?.length ? (
    <div style={{ display: "grid", gap: "10px" }}>
      {site.upcoming_patrols.map((patrol, index) => (
        <div
          key={`${patrol.schedule_type}-${patrol.point_id}-${index}`}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(90px, 110px) 1fr auto",
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
            {patrol.schedule_type}
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
})} ·{" "}
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
                patrol.status === "overdue"
                  ? "#ef4444"
                  : patrol.status === "due_soon"
                  ? "#f59e0b"
                  : "#22c55e",
              fontSize: "12px",
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            ●{" "}
            {patrol.status === "overdue"
              ? "Overdue"
              : patrol.status === "due_soon"
              ? "Due Soon"
              : "Scheduled"}
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
      No upcoming patrols scheduled.
    </div>
  )}
</div>
              
            </div>
          ))}
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