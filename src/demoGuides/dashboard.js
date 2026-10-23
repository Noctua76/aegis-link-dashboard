const demoLimitations = {
  en: {
    title: "Demo mode",
    body: "You are viewing this page with read-only Preview Access. Actions that create, edit, delete, approve, configure or otherwise modify operational data are disabled. The production platform provides these capabilities according to the user's assigned role and permissions.",
  },
  gr: {
    title: "Λειτουργία επίδειξης",
    body: "Βλέπετε αυτή τη σελίδα μέσω Preview Access μόνο για ανάγνωση. Ενέργειες που δημιουργούν, τροποποιούν, διαγράφουν, εγκρίνουν, παραμετροποιούν ή μεταβάλλουν επιχειρησιακά δεδομένα είναι απενεργοποιημένες. Στο κανονικό περιβάλλον οι δυνατότητες αυτές παρέχονται σύμφωνα με τον ρόλο και τα δικαιώματα του χρήστη.",
  },
};

const guide = (id, title, intro, seeing, howItWorks, value) => ({
  id,
  title,
  intro,
  seeing,
  howItWorks,
  value,
  demoLimitations,
});

export const dashboardDemoGuides = {
  operations: guide(
    "operations",
    { en: "Operations Overview", gr: "Επιχειρησιακή Επισκόπηση" },
    {
      en: "The central operational picture for the sites and teams available to this account.",
      gr: "Η κεντρική επιχειρησιακή εικόνα για τις εγκαταστάσεις και τις ομάδες που είναι διαθέσιμες σε αυτόν τον λογαριασμό.",
    },
    {
      en: ["Active guards and site coverage", "Incidents, patrol activity and operational indicators"],
      gr: ["Ενεργούς φύλακες και κάλυψη εγκαταστάσεων", "Συμβάντα, δραστηριότητα περιπολιών και επιχειρησιακές ενδείξεις"],
    },
    {
      en: ["The view is updated by real Guard actions and backend events.", "Each card reflects the latest permitted operational state."],
      gr: ["Η εικόνα ενημερώνεται από πραγματικές ενέργειες των φυλάκων και γεγονότα του backend.", "Κάθε κάρτα αποτυπώνει την τελευταία επιτρεπόμενη επιχειρησιακή κατάσταση."],
    },
    {
      en: ["Creates one concise control point for day-to-day supervision.", "Helps identify gaps that need attention."],
      gr: ["Δημιουργεί ένα ενιαίο σημείο καθημερινής εποπτείας.", "Βοηθά στον εντοπισμό κενών που χρειάζονται προσοχή."],
    }
  ),
  guards: guide(
    "guards",
    { en: "Guards", gr: "Φύλακες" },
    { en: "Operational management of security personnel and their assigned work context.", gr: "Επιχειρησιακή διαχείριση του προσωπικού ασφαλείας και του ανατεθειμένου πλαισίου εργασίας του." },
    { en: ["Guard identity, assigned site and operational status", "Heartbeat, online presence and available GPS status"], gr: ["Ταυτότητα φύλακα, ανατεθειμένη εγκατάσταση και επιχειρησιακή κατάσταση", "Heartbeat, online παρουσία και διαθέσιμη κατάσταση GPS"] },
    { en: ["Authorized administrators connect guards with sites and shifts.", "Controlled temporary credentials support account onboarding and recovery."], gr: ["Οι εξουσιοδοτημένοι διαχειριστές συνδέουν φύλακες με εγκαταστάσεις και βάρδιες.", "Οι ελεγχόμενοι προσωρινοί κωδικοί υποστηρίζουν την ενεργοποίηση και ανάκτηση λογαριασμών."] },
    { en: ["Supports staffing visibility and timely operational coordination."], gr: ["Υποστηρίζει την εικόνα στελέχωσης και τον έγκαιρο επιχειρησιακό συντονισμό."] }
  ),
  sites: guide(
    "sites",
    { en: "Sites", gr: "Εγκαταστάσεις" },
    { en: "Each site is a distinct operational context within the company.", gr: "Κάθε εγκατάσταση αποτελεί ξεχωριστό επιχειρησιακό πλαίσιο μέσα στην εταιρεία." },
    { en: ["Site identity, location and current coverage", "Associated guards, patrol points and operational records"], gr: ["Ταυτότητα, τοποθεσία και τρέχουσα κάλυψη εγκατάστασης", "Συνδεδεμένους φύλακες, σημεία περιπολίας και επιχειρησιακές καταγραφές"] },
    { en: ["Patrols, Shift Reports and incidents remain connected to their site.", "Data remains scoped to the authorized tenant."], gr: ["Οι περιπολίες, οι αναφορές βάρδιας και τα συμβάντα παραμένουν συνδεδεμένα με την εγκατάστασή τους.", "Τα δεδομένα παραμένουν περιορισμένα στον εξουσιοδοτημένο tenant."] },
    { en: ["Keeps responsibility and operational history clear per location."], gr: ["Διατηρεί σαφή την ευθύνη και το επιχειρησιακό ιστορικό ανά τοποθεσία."] }
  ),
  patrols: guide(
    "patrols",
    { en: "Patrols", gr: "Περιπολίες" },
    { en: "Patrol oversight combines scheduled, system-generated random and manually requested patrols.", gr: "Η εποπτεία περιπολιών συνδυάζει προγραμματισμένες, τυχαίες που δημιουργεί το σύστημα και χειροκίνητες περιπολίες." },
    { en: ["Scheduled Patrols: predefined recurring rounds", "Random Patrols: revealed to the guard shortly before execution", "Manual Patrols: created for exceptional operational needs", "Completion states: Completed, Late Completed and Missed"], gr: ["Scheduled Patrols: προκαθορισμένες επαναλαμβανόμενες περιπολίες", "Random Patrols: αποκαλύπτονται στον φύλακα λίγο πριν από την εκτέλεση", "Manual Patrols: δημιουργούνται για έκτακτες επιχειρησιακές ανάγκες", "Καταστάσεις ολοκλήρωσης: Completed, Late Completed και Missed"] },
    { en: ["A reminder is normally issued about 15 minutes before the patrol.", "Scan access opens about 5 minutes before the scheduled time.", "Completion may be recorded normally, late up to +2 hours, or as Missed afterward."], gr: ["Υπενθύμιση αποστέλλεται συνήθως περίπου 15 λεπτά πριν από την περιπολία.", "Η δυνατότητα scan ανοίγει περίπου 5 λεπτά πριν από την προγραμματισμένη ώρα.", "Η ολοκλήρωση καταγράφεται κανονικά, εκπρόθεσμα έως +2 ώρες ή ως Missed στη συνέχεια."] },
    { en: ["Provides verifiable patrol coverage and a consistent completion history."], gr: ["Παρέχει επαληθεύσιμη κάλυψη περιπολιών και συνεπές ιστορικό ολοκλήρωσης."] }
  ),
  incidents: guide(
    "incidents",
    { en: "Incidents", gr: "Συμβάντα" },
    { en: "A live operational record for events that require attention and coordinated response.", gr: "Ζωντανή επιχειρησιακή καταγραφή για γεγονότα που απαιτούν προσοχή και συντονισμένη απόκριση." },
    { en: ["Current incident status, responsible site and operational chronology", "Updates recorded as the response progresses"], gr: ["Τρέχουσα κατάσταση συμβάντος, υπεύθυνη εγκατάσταση και επιχειρησιακή χρονολογία", "Ενημερώσεις που καταγράφονται καθώς εξελίσσεται η απόκριση"] },
    { en: ["Lifecycle: NORMAL → ACTIVE → IN PROGRESS → RESOLVED → NORMAL.", "The chronology preserves how the incident evolved and was handled."], gr: ["Κύκλος: NORMAL → ACTIVE → IN PROGRESS → RESOLVED → NORMAL.", "Η χρονολογία διατηρεί τον τρόπο με τον οποίο εξελίχθηκε και αντιμετωπίστηκε το συμβάν."] },
    { en: ["Supports timely escalation, supervision and accountable follow-through."], gr: ["Υποστηρίζει έγκαιρη κλιμάκωση, εποπτεία και υπεύθυνη ολοκλήρωση ενεργειών."] }
  ),
  shiftReports: guide(
    "shiftReports",
    { en: "Shift Reports", gr: "Αναφορές Βάρδιας" },
    { en: "Operational notes submitted by a guard and linked to the relevant guard, site and shift.", gr: "Επιχειρησιακές σημειώσεις που υποβάλλονται από φύλακα και συνδέονται με τον αντίστοιχο φύλακα, την εγκατάσταση και τη βάρδια." },
    { en: ["Report category, priority, status and shift context", "Notes and permitted photographic attachments"], gr: ["Κατηγορία, προτεραιότητα, κατάσταση και πλαίσιο βάρδιας", "Σημειώσεις και επιτρεπόμενες φωτογραφικές επισυνάψεις"] },
    { en: ["Submitted reports form an immutable operational record.", "Authorized users may read, acknowledge, preview, print or download them."], gr: ["Οι υποβληθείσες αναφορές αποτελούν αμετάβλητη επιχειρησιακή καταγραφή.", "Οι εξουσιοδοτημένοι χρήστες μπορούν να τις διαβάσουν, επιβεβαιώσουν, προβάλλουν, εκτυπώσουν ή κατεβάσουν."] },
    { en: ["Creates a dependable handover and audit trail between shifts."], gr: ["Δημιουργεί αξιόπιστη παράδοση και audit trail μεταξύ βαρδιών."] }
  ),
  eventLogs: guide(
    "eventLogs",
    { en: "Event Logs", gr: "Ιστορικό Γεγονότων" },
    { en: "The operational history of events visible to this account.", gr: "Το επιχειρησιακό ιστορικό γεγονότων που είναι ορατό σε αυτόν τον λογαριασμό." },
    { en: ["Guard and shift events in chronological order", "Permitted site and status context"], gr: ["Γεγονότα φυλάκων και βαρδιών σε χρονολογική σειρά", "Επιτρεπόμενο πλαίσιο εγκατάστασης και κατάστασης"] },
    { en: ["Entries are generated from operational activity and shown according to access permissions."], gr: ["Οι εγγραφές δημιουργούνται από την επιχειρησιακή δραστηριότητα και εμφανίζονται σύμφωνα με τα δικαιώματα πρόσβασης."] },
    { en: ["Helps reconstruct activity and support operational review."], gr: ["Βοηθά στην ανασύνθεση της δραστηριότητας και στην επιχειρησιακή ανασκόπηση."] }
  ),
  adminAuditLogs: guide(
    "adminAuditLogs",
    { en: "Admin Audit Logs", gr: "Αρχεία Διοικητικού Ελέγχου" },
    { en: "A history of permitted administrative actions within the visible company context.", gr: "Ιστορικό επιτρεπόμενων διοικητικών ενεργειών μέσα στο ορατό εταιρικό πλαίσιο." },
    { en: ["Who performed an administrative action and when", "The affected operational area where disclosure is permitted"], gr: ["Ποιος πραγματοποίησε μια διοικητική ενέργεια και πότε", "Την επηρεαζόμενη επιχειρησιακή περιοχή όπου επιτρέπεται η εμφάνιση"] },
    { en: ["Audit entries support accountability, traceability and supervision."], gr: ["Οι εγγραφές ελέγχου υποστηρίζουν λογοδοσία, ιχνηλασιμότητα και εποπτεία."] },
    { en: ["Provides a reviewable record of administrative activity."], gr: ["Παρέχει ελέγξιμη καταγραφή της διοικητικής δραστηριότητας."] }
  ),
  analytics: guide(
    "analytics",
    { en: "Analytics", gr: "Αναλυτικά Στοιχεία" },
    { en: "Management visibility derived from recorded operational events.", gr: "Διοικητική εικόνα που προκύπτει από καταγεγραμμένα επιχειρησιακά γεγονότα." },
    { en: ["Patrol performance and completion trends", "Incident activity and recurring operational patterns"], gr: ["Απόδοση περιπολιών και τάσεις ολοκλήρωσης", "Δραστηριότητα συμβάντων και επαναλαμβανόμενα επιχειρησιακά μοτίβα"] },
    { en: ["Available records are aggregated into practical management indicators."], gr: ["Οι διαθέσιμες καταγραφές συγκεντρώνονται σε πρακτικές διοικητικές ενδείξεις."] },
    { en: ["Supports evidence-based review without replacing human operational judgement."], gr: ["Υποστηρίζει τεκμηριωμένη ανασκόπηση χωρίς να αντικαθιστά την ανθρώπινη επιχειρησιακή κρίση."] }
  ),
  systemStatus: guide(
    "systemStatus",
    { en: "System Status", gr: "Κατάσταση Συστήματος" },
    { en: "A transparent view of platform and tenant operational status—not a SIEM or security monitoring console.", gr: "Διαφανής εικόνα της κατάστασης της πλατφόρμας και του tenant — όχι SIEM ή κονσόλα παρακολούθησης ασφάλειας." },
    { en: ["Current service health", "Historical operational success", "Readiness and status indicators"], gr: ["Τρέχουσα υγεία υπηρεσιών", "Ιστορική επιχειρησιακή επιτυχία", "Ενδείξεις ετοιμότητας και κατάστασης"] },
    { en: ["Current health describes what is happening now.", "Historical success records the latest verified activity; readiness shows whether required capabilities are available."], gr: ["Η τρέχουσα υγεία περιγράφει τι συμβαίνει τώρα.", "Η ιστορική επιτυχία καταγράφει την τελευταία επαληθευμένη δραστηριότητα, ενώ η ετοιμότητα δείχνει αν οι απαιτούμενες δυνατότητες είναι διαθέσιμες."] },
    { en: ["Separates current problems from historical evidence and configuration readiness."], gr: ["Διαχωρίζει τα τρέχοντα προβλήματα από τα ιστορικά στοιχεία και την ετοιμότητα παραμετροποίησης."] }
  ),
  settings: guide(
    "settings",
    { en: "Settings", gr: "Ρυθμίσεις" },
    { en: "Operational configuration available to authorized administrators according to their permissions.", gr: "Επιχειρησιακή παραμετροποίηση που είναι διαθέσιμη σε εξουσιοδοτημένους διαχειριστές σύμφωνα με τα δικαιώματά τους." },
    { en: ["Configuration areas permitted for the current account", "Users, roles, alerts or operational settings where applicable"], gr: ["Περιοχές παραμετροποίησης που επιτρέπονται στον τρέχοντα λογαριασμό", "Χρήστες, ρόλους, ειδοποιήσεις ή επιχειρησιακές ρυθμίσεις όπου εφαρμόζεται"] },
    { en: ["Production changes are controlled by role and permission.", "Configuration changes are disabled in Demo mode."], gr: ["Οι αλλαγές παραγωγής ελέγχονται από ρόλο και δικαίωμα.", "Οι αλλαγές παραμετροποίησης είναι απενεργοποιημένες στη λειτουργία Demo."] },
    { en: ["Keeps operational setup governed and traceable."], gr: ["Διατηρεί την επιχειρησιακή παραμετροποίηση ελεγχόμενη και ιχνηλάσιμη."] }
  ),
};

export const dashboardMenuGuideIds = {
  Dashboard: "operations",
  "Live Incidents": "incidents",
  "Shift Reports": "shiftReports",
  "Event Logs": "eventLogs",
  "Admin Audit Logs": "adminAuditLogs",
  Guards: "guards",
  Sites: "sites",
  Patrols: "patrols",
  "System Status": "systemStatus",
  Analytics: "analytics",
  Settings: "settings",
};

export function resolveDemoLanguage(value) {
  return String(value || "").toLowerCase().startsWith("el") ? "gr" : "en";
}

export function isDashboardPreviewUser(user) {
  return user?.access_mode === "read_only";
}
