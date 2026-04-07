function GuardStatus({ guard }) {
  return (
    <div className="guard-status-card">
      <h3>{guard.name}</h3>
      <p><strong>Site:</strong> {guard.site}</p>
      <p><strong>Shift:</strong> {guard.shift}</p>
      <p><strong>Status:</strong> {guard.status}</p>
      <p><strong>Logged in:</strong> {guard.loggedInAt}</p>
    </div>
  );
}

export default GuardStatus;