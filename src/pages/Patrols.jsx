import { useEffect, useState } from "react";

const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";

function Patrols() {
  const [patrolSites, setPatrolSites] = useState([]);
  const [loading, setLoading] = useState(true);

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
            <div key={site.site_id} className="analytics-table-card">
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
    </div>
  );
}

export default Patrols;