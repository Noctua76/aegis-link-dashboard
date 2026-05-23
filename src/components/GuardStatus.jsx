function GuardStatus({ guard }) {
  const hasGuard = guard && guard.full_name;

  return (
    <div className="guard-status-card">
      <h3>{hasGuard ? guard.full_name : "No guard on duty"}</h3>

      <p>
        <strong>Site:</strong> {hasGuard ? guard.site_name : "None"}
      </p>

      <p>
        <strong>Status:</strong> {hasGuard ? "On Duty" : "No Duty"}
      </p>

      <p>
        <strong>Logged in:</strong>{" "}
        {hasGuard ? new Date(guard.check_in_time).toLocaleTimeString() : "-"}
      </p>
    </div>
  );
}

export default GuardStatus;
