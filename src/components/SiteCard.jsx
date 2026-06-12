function SiteCard({ site }) {
  
  return (
    <div className="site-card">
      <div className="site-card-header">
        <h3>{site.name}</h3>

        <span className={`site-status ${site.status_class || "normal"}`}>
  {site.status_label || "Normal"}
</span>
      </div>

      <div className="site-card-body">
        <p>
          <strong>Location:</strong> {site.location}
        </p>

        <p>
  <strong>Company Phone:</strong>{" "}
  {site.site_phone || "—"}
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