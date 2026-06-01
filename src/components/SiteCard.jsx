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

        <span
  className={
    site.on_duty > 0
      ? "site-status normal"
      : "site-status no-guard"
  }
>
  {site.on_duty > 0 ? "Covered" : "No Guard"}
</span>
      </div>

      <div className="site-card-body">
        <p>
          <strong>Location:</strong> {site.location}
        </p>

        <p>
          <strong>Guards Assigned:</strong> {site.guards_assigned || 0}
        </p>

        <p>
          <strong>On Duty:</strong> {site.on_duty || 0}
        </p>

        <p>
          <strong>Active Guard:</strong>{" "}
          {site.active_guard || "No active guard"}
        </p>
      </div>
    </div>
  );
}

export default SiteCard;