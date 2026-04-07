function SiteCard({ site }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "alert":
        return "site-status alert";
      case "normal":
        return "site-status normal";
      case "no-guard":
        return "site-status no-guard";
      default:
        return "site-status";
    }
  };

  return (
    <div className="site-card">
      <div className="site-card-header">
        <h3>{site.name}</h3>
        <span className={getStatusClass(site.status)}>
          {site.status === "alert"
            ? "Alert Active"
            : site.status === "normal"
            ? "Normal"
            : "No Guard"}
        </span>
      </div>

      <div className="site-card-body">
        <p><strong>Location:</strong> {site.location}</p>
        <p><strong>Guards Assigned:</strong> {site.guardsAssigned}</p>
        <p><strong>On Duty:</strong> {site.guardsOnDuty}</p>
        <p><strong>Active Guard:</strong> {site.activeGuard}</p>
      </div>
    </div>
  );
}

export default SiteCard;