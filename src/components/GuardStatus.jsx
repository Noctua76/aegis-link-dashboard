function GuardStatus({ guard }) {
  return (
    <div className="guard-status-card">
      <h3>{guard.full_name}</h3>

      <p>
        <strong>Site:</strong> {guard.site_name}
      </p>

      <p>
        <strong>Status:</strong> {" "}On Duty
      </p>

      <p>
        <strong>Logged in:</strong> {new Date(guard.check_in_time).toLocaleTimeString()}
      </p>
    </div>
  );
}

export default GuardStatus;
