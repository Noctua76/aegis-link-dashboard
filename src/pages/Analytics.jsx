import { useEffect, useState } from "react";
import "./Analytics.css";

function Analytics() {
  const API_BASE_URL =
    "https://noctua-panic-backend-production.up.railway.app";

  const [analytics, setAnalytics] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/summary`
      );

      const data = await response.json();

      if (data.status === "ok") {
        setAnalytics(data);
        setLastChecked(new Date());
      }
    } catch (err) {
      console.error("Analytics load error:", err);
    }
  };

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(() => {
      loadAnalytics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const riskLevel = analytics?.alerts?.risk_level || "No Data";
  const readinessLevel = analytics?.readiness?.level || "No Data";
  const fatigueLevel = analytics?.fatigue?.level || "No Data";
  const stabilityScore = analytics?.stability?.score || "No Data";

  return (
    <div>
      <header className="analytics-header">
        <h1>Analytics</h1>

        <p>
          Live operational intelligence for site risk, guard readiness and
          fatigue exposure.
        </p>

        <span className="analytics-live-status">
          Live data · Auto-refresh every 5 sec
          {lastChecked &&
            ` · Last checked: ${lastChecked.toLocaleTimeString("el-GR", {
              timeZone: "Europe/Athens",
            })}`}
        </span>
      </header>

      <section className="analytics-overview">
        <div className="analytics-card">
          <span>Site</span>
          <strong>{analytics?.site?.name || "No Data"}</strong>
        </div>

        <div className={`analytics-card ${riskLevel.toLowerCase().replace(" ", "-")}`}>
          <span>Site Risk</span>
          <strong>{riskLevel}</strong>
        </div>

        <div className={`analytics-card ${readinessLevel.toLowerCase().replace(" ", "-")}`}>
          <span>Guard Readiness</span>
          <strong>{readinessLevel}</strong>
        </div>

        <div className="analytics-card no-data">
          <span>Stability Score</span>
          <strong>{stabilityScore}</strong>
        </div>
      </section>

      <section className="analytics-table-card">
        <h3>Site Risk & Readiness Index</h3>

        <div className="analytics-table">
          <div className="analytics-row analytics-row-head">
            <span>Site</span>
            <span>Alerts</span>
            <span>Guards</span>
            <span>Shifts</span>
            <span>Ratio</span>
            <span>Risk</span>
            <span>Readiness</span>
            <span>Fatigue</span>
          </div>

          <div className="analytics-row">
            <span>{analytics?.site?.name || "No Data"}</span>

            <span>{analytics?.alerts?.count ?? "No Data"}</span>

            <span>
              {analytics?.readiness?.assigned_guards ?? "No Data"}
            </span>

            <span>
              {analytics?.readiness?.required_shifts ?? "No Data"}
            </span>

            <span>
              {analytics?.readiness?.ratio ?? "No Data"}
            </span>

            <span className={`badge ${riskLevel.toLowerCase().replace(" ", "-")}`}>
              {riskLevel}
            </span>

            <span className={`badge ${readinessLevel.toLowerCase().replace(" ", "-")}`}>
              {readinessLevel}
            </span>

            <span className={`badge ${fatigueLevel.toLowerCase().replace(" ", "-")}`}>
              {fatigueLevel}
            </span>
          </div>
        </div>
      </section>

      <section className="analytics-table-card">
        <h3>Calculation Notes</h3>

        <div className="analytics-notes">
          <p>
            <strong>Site Risk:</strong> calculated from live alert events
            assigned to the site.
          </p>

          <p>
            <strong>Guard Readiness:</strong> assigned active guards divided by
            required shifts.
          </p>

          <p>
            <strong>Fatigue Risk:</strong> No Data until guard shift history is
            fully connected.
          </p>

          <p>
            <strong>Stability Score:</strong> No Data until fatigue data becomes
            available.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Analytics;