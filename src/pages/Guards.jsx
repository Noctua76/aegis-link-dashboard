import "./Guards.css";

const activeGuards = [
  {
    id: 1,
    name: "Giorgos Papas",
    phone: "+30 69XXXXXXXX",
    location: "Ekali Residence",
    shift: "15:00 – 23:00",
    status: "On Duty",
    checkIn: "15:02",
  },
  {
    id: 2,
    name: "Nikos Arvanitis",
    phone: "+30 69XXXXXXXX",
    location: "Kifisia Office",
    shift: "15:00 – 23:00",
    status: "On Duty",
    checkIn: "14:58",
  },
];

const locations = [
  {
    name: "Ekali Residence",
    guards: [
      { name: "Giorgos Papas", role: "Shift Guard", status: "On Duty" },
      { name: "Dimitris K.", role: "Backup Guard", status: "Standby" },
      { name: "Petros M.", role: "Night Guard", status: "Off Duty" },
    ],
  },
  {
    name: "Kifisia Office",
    guards: [
      { name: "Nikos Arvanitis", role: "Shift Guard", status: "On Duty" },
      { name: "Alexis R.", role: "Patrol Guard", status: "Off Duty" },
    ],
  },
];

function statusClass(status) {
  if (status === "On Duty") return "status on-duty";
  if (status === "Standby") return "status standby";
  if (status === "Late") return "status late";
  return "status off-duty";
}

export default function Guards() {
  return (
    <div className="guards-page">
      <h1>Guards</h1>

      <h2>Active Guards Now</h2>
      {activeGuards.map((g) => (
        <div key={g.id}>
          {g.name} – {g.location} – {g.status}
        </div>
      ))}

      <h2>Guards by Location</h2>
      {locations.map((loc) => (
        <div key={loc.name}>
          <h3>{loc.name}</h3>
          {loc.guards.map((g) => (
            <div key={g.name}>
              {g.name} – {g.role} – {g.status}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
