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

    const qrPayload = `${window.location.origin}/aegis-link-webapp/patrol.html?token=${data.point.qr_token}`;

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

    const qrPayload = `${window.location.origin}/aegis-link-webapp/patrol.html?token=${data.point.qr_token}`;

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
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 40px;
              text-align: center;
              color: #111827;
            }

            .card {
              border: 3px solid #111827;
              border-radius: 18px;
              padding: 36px;
              max-width: 620px;
              margin: 0 auto;
            }

            h1 {
              margin: 0;
              font-size: 30px;
              letter-spacing: 1px;
            }

            h2 {
              margin-top: 24px;
              font-size: 24px;
            }

            .subtitle {
              color: #4b5563;
              margin-top: 8px;
              font-size: 16px;
            }

            img {
              width: 420px;
              height: 420px;
              margin: 28px auto;
              display: block;
            }

            .meta {
              margin-top: 20px;
              font-size: 15px;
              color: #374151;
              word-break: break-all;
            }

            .footer {
              margin-top: 28px;
              font-size: 13px;
              color: #6b7280;
            }

            @media print {
              body {
                padding: 20px;
              }
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Patrols</h1>
          <p>
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
                  <span>-</span>
                </div>

                <div className="system-status-card">
                  <h3>Next Patrol</h3>
                  <span>-</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>                
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
  <button type="button">Download QR</button>
  <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    printQrCard(point.id);
  }}
>
  Print QR
</button>
  <button type="button">Regenerate QR</button>
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