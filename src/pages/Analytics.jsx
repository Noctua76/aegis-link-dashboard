import "./Analytics.css";

function Analytics() {
  const sites = [
    {
      name: "Ekali Residence",
      alerts: 4,
      guards: 4,
      shifts: 3,
      risk: "Normal",
      readiness: "High",
      fatigue: "Low",
    },
    {
      name: "Kifisia Site",
      alerts: 9,
      guards: 3,
      shifts: 3,
      risk: "Medium",
      readiness: "Medium",
      fatigue: "Medium",
    },
    {
      name: "Marousi Site",
      alerts: 15,
      guards: 2,
      shifts: 3,
      risk: "High",
      readiness: "Low",
      fatigue: "High",
    },
  ];

  return (
    <div>
      <header className="analytics-header">
        <h1>Analytics</h1>
        <p>Operational intelligence for site risk, guard readiness and fatigue exposure.</p>
      </header>

      <section className="analytics-overview">
        <div className="analytics-card">
          <span>Total Sites</span>
          <strong>{sites.length}</strong>
        </div>

        <div className="analytics-card normal">
          <span>Normal Risk</span>
          <strong>{sites.filter((s) => s.risk === "Normal").length}</strong>
        </div>

        <div className="analytics-card medium">
          <span>Medium Risk</span>
          <strong>{sites.filter((s) => s.risk === "Medium").length}</strong>
        </div>

        <div className="analytics-card high">
          <span>High Risk</span>
          <strong>{sites.filter((s) => s.risk === "High").length}</strong>
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
            <span>Risk</span>
            <span>Readiness</span>
            <span>Fatigue</span>
          </div>

          {sites.map((site) => (
            <div className="analytics-row" key={site.name}>
              <span>{site.name}</span>
              <span>{site.alerts}</span>
              <span>{site.guards}</span>
              <span>{site.shifts}</span>
              <span className={`badge ${site.risk.toLowerCase()}`}>{site.risk}</span>
              <span className={`badge ${site.readiness.toLowerCase()}`}>{site.readiness}</span>
              <span className={`badge ${site.fatigue.toLowerCase()}`}>{site.fatigue}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Analytics;