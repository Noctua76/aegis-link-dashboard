function IncidentCard({ incident }) {
  return (
    <div className={`incident-card ${incident.type}`}>
      <h3>{incident.title}</h3>
      <p><strong>Site:</strong> {incident.site}</p>
      <p><strong>Guard:</strong> {incident.guard}</p>
      <p><strong>Location:</strong> {incident.location}</p>
      <p><strong>Time:</strong> {incident.time}</p>
      <p><strong>SMS:</strong> {incident.smsStatus}</p>
      <p><strong>Call:</strong> {incident.callStatus}</p>
      <p><strong>AI:</strong> {incident.aiStatus}</p>
    </div>
  );
}

export default IncidentCard;