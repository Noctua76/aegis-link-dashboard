export const sites = [
  {
    id: "site-ekali",
    name: "Ekali Residence",
    location: "Ekali, Athens",
    clientType: "Private Residence",
    companyPhone: "+30 210XXXXXXX",
    status: "Alert Active",
    notes: {
  summary: "Residential security site with perimeter monitoring.",
  sop: [
    "Monitor the perimeter at regular intervals.",
    "Check all entry points during each patrol cycle.",
    "Record all incoming and outgoing visitors.",
  ],
  specialInstructions: [
    "Confirm owner presence before allowing access.",
    "Night patrol must include full external perimeter check.",
  ],
  emergencyProtocol: [
    "Trigger alert through Aegis Link.",
    "Notify operations manager immediately.",
    "Remain in secure position until escalation response.",
  ],
},
    shiftPattern: ["07:00 – 15:00", "15:00 – 23:00", "23:00 – 07:00"],
    guardsAssigned: 4,
  },
  {
    id: "site-astir",
    name: "Astir Vouliagmenis",
    location: "Vouliagmeni, Athens",
    clientType: "Hotel / Resort Site",
    companyPhone: "+30 210YYYYYYY",
    status: "Normal",
    notes: {
  summary: "Large hospitality site with entrance control and patrol coverage.",
  sop: [
    "Monitor main entrance and service access points.",
    "Log supplier and visitor movement.",
    "Perform scheduled patrols across assigned zones.",
  ],
  specialInstructions: [
    "Coordinate with reception before allowing restricted access.",
    "Report unusual guest or vehicle movement immediately.",
  ],
  emergencyProtocol: [
    "Trigger alert through Aegis Link.",
    "Notify site supervisor and operations manager.",
    "Follow escalation protocol until incident is resolved.",
  ],
},
    shiftPattern: ["08:00 – 14:00", "14:00 – 22:00", "22:00 – 08:00"],
    guardsAssigned: 4,
  },
];

export const guards = [
  {
    id: "guard-giorgos-papas",
    fullName: "Giorgos Papas",
    phone: "+30 69XXXXXXXX",
    email: "g.papas@security.gr",
    siteId: "site-ekali",
    role: "Shift Guard",
    assignedShift: "15:00 – 23:00",
    status: "On Duty",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Primary guard assigned to main residence perimeter.",
  },
  {
    id: "guard-nikos-papadakis",
    fullName: "Nikos Papadakis",
    phone: "+30 69XXXXXXXX",
    email: "n.papadakis@security.gr",
    siteId: "site-ekali",
    role: "Shift Guard",
    assignedShift: "07:00 – 15:00",
    status: "Off Duty",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Morning shift guard for Ekali Residence.",
  },
  {
    id: "guard-petros-markou",
    fullName: "Petros Markou",
    phone: "+30 69XXXXXXXX",
    email: "p.markou@security.gr",
    siteId: "site-ekali",
    role: "Shift Guard",
    assignedShift: "23:00 – 07:00",
    status: "Off Duty",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Night shift guard for Ekali Residence.",
  },
  {
    id: "guard-antonis-roussos",
    fullName: "Antonis Roussos",
    phone: "+30 69XXXXXXXX",
    email: "a.roussos@security.gr",
    siteId: "site-ekali",
    role: "Relief Guard",
    assignedShift: "Flexible",
    status: "Off Duty",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Backup guard for Ekali Residence.",
  },
  {
    id: "guard-nikos-arvanitis",
    fullName: "Nikos Arvanitis",
    phone: "+30 69XXXXXXXX",
    email: "n.arvanitis@security.gr",
    siteId: "site-astir",
    role: "Shift Guard",
    assignedShift: "14:00 – 22:00",
    status: "On Duty",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Responsible for entrance control and patrol reporting.",
  },
  {
    id: "guard-marios-ioannou",
    fullName: "Marios Ioannou",
    phone: "+30 69XXXXXXXX",
    email: "m.ioannou@security.gr",
    siteId: "site-astir",
    role: "Shift Guard",
    assignedShift: "08:00 – 14:00",
    status: "Off Duty",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Morning shift guard for Astir Vouliagmenis.",
  },
  {
    id: "guard-dimitris-karras",
    fullName: "Dimitris Karras",
    phone: "+30 69XXXXXXXX",
    email: "d.karras@security.gr",
    siteId: "site-astir",
    role: "Shift Guard",
    assignedShift: "22:00 – 08:00",
    status: "Off Duty",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Night shift guard for Astir Vouliagmenis.",
  },
  {
    id: "guard-kostas-lianos",
    fullName: "Kostas Lianos",
    phone: "+30 69XXXXXXXX",
    email: "k.lianos@security.gr",
    siteId: "site-astir",
    role: "Relief Guard",
    assignedShift: "Flexible",
    status: "Off Duty",
    emergencyContact: "+30 69XXXXXXXX",
    notes: "Backup guard for Astir Vouliagmenis.",
  },
];

export const activeSessions = [
  {
    id: "session-ekali-current",
    siteId: "site-ekali",
    guardId: "guard-giorgos-papas",
    loginAt: "15:02",
    shift: "15:00 – 23:00",
    status: "On Duty",
  },
  {
    id: "session-astir-current",
    siteId: "site-astir",
    guardId: "guard-nikos-arvanitis",
    loginAt: "14:58",
    shift: "14:00 – 22:00",
    status: "On Duty",
  },
];

export const guardSessionsHistory = [
  {
    id: "history-ekali-001",
    siteId: "site-ekali",
    guardId: "guard-nikos-papadakis",
    loginAt: "07:00",
    logoutAt: "15:00",
    date: "2026-05-04",
    status: "Logged Out",
  },
  {
    id: "history-ekali-002",
    siteId: "site-ekali",
    guardId: "guard-petros-markou",
    loginAt: "23:00",
    logoutAt: "07:00",
    date: "2026-05-03",
    status: "Logged Out",
  },
  {
    id: "history-astir-001",
    siteId: "site-astir",
    guardId: "guard-marios-ioannou",
    loginAt: "08:00",
    logoutAt: "14:00",
    date: "2026-05-04",
    status: "Logged Out",
  },
  {
    id: "history-astir-002",
    siteId: "site-astir",
    guardId: "guard-dimitris-karras",
    loginAt: "22:00",
    logoutAt: "08:00",
    date: "2026-05-03",
    status: "Logged Out",
  },
];

export const incidents = [
  {
    id: "INC-2025-001",
    siteId: "site-ekali",
    guardId: "guard-giorgos-papas",
    sessionId: "session-ekali-current",
    title: "Alert Triggered",
    status: "Active",
    priority: "High",
    time: "14:32:18",
    smsStatus: "Delivered",
    callStatus: "Answered",
    aiStatus: "Completed",
    type: "alert",
  },
  {
    id: "INC-2025-002",
    siteId: "site-astir",
    guardId: "guard-nikos-arvanitis",
    sessionId: "session-astir-current",
    title: "Call in Progress",
    status: "In Progress",
    priority: "High",
    time: "14:35:41",
    smsStatus: "Delivered",
    callStatus: "Dialing",
    aiStatus: "Pending",
    type: "warning",
  },
];

export function getSiteById(siteId) {
  return sites.find((site) => site.id === siteId);
}

export function getGuardById(guardId) {
  return guards.find((guard) => guard.id === guardId);
}

export function getActiveSessionBySiteId(siteId) {
  return activeSessions.find((session) => session.siteId === siteId);
}

export function getGuardsBySiteId(siteId) {
  return guards.filter((guard) => guard.siteId === siteId);
}

export function getGuardSessionsHistoryBySiteId(siteId) {
  return guardSessionsHistory.filter((session) => session.siteId === siteId);
}
