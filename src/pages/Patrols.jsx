import { useEffect, useState } from "react";

const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";

function Patrols() {
  const [patrolSites, setPatrolSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSiteDetails, setSelectedSiteDetails] = useState(null);
const [detailsLoading, setDetailsLoading] = useState(false);

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
                <button type="button">View QR</button>
                <button type="button">Download QR</button>
                <button type="button">Print QR</button>
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

              <p>
                QR Status:{" "}
                <strong>{point.qr_token ? "Generated" : "Pending"}</strong>
              </p>

              <p>
                Status:{" "}
                <strong>{point.active ? "Active" : "Inactive"}</strong>
              </p>

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

    </div>
  );
}

export default Patrols;