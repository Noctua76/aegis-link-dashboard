import { useEffect, useState } from "react";
import "./Settings.css";

function Settings() {
  const API_BASE_URL = "https://noctua-panic-backend-production.up.railway.app";
  const getSessionToken = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("aegis-current-user") || "{}"
  );

  return currentUser?.session?.token || null;
};

  const [systemStatus, setSystemStatus] = useState(null);
  const [alertConfig, setAlertConfig] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [sites, setSites] = useState([]);
const [guards, setGuards] = useState([]);
const [users, setUsers] = useState([]);
const [loadingUsers, setLoadingUsers] = useState(false);
const [usersError, setUsersError] = useState("");
const [selectedUser, setSelectedUser] = useState(null);
const [isEditingUser, setIsEditingUser] = useState(false);
const [editingUser, setEditingUser] = useState(null);
const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);
const [showTemporaryPasswordModal, setShowTemporaryPasswordModal] = useState(false);
const [temporaryPassword, setTemporaryPassword] = useState("");
const [isResettingPassword, setIsResettingPassword] = useState(false);
const [passwordCopied, setPasswordCopied] = useState(false);
const [showNewUserModal, setShowNewUserModal] = useState(false);
const [isCreatingUser, setIsCreatingUser] = useState(false);
const [newUserError, setNewUserError] = useState("");

const [newUser, setNewUser] = useState({
  full_name: "",
  username: "",
  email: "",
  secondary_email: "",
  phone: "",
  mobile_phone: "",
  backup_phone: "",
  role: "guard",
  status: "active",
  company_id: 1,
});
const [loadingSelectedUser, setLoadingSelectedUser] = useState(false);
const [selectedUserError, setSelectedUserError] = useState("");
const [editingSite, setEditingSite] = useState(null);
const [profileSite, setProfileSite] = useState(null);
const [patrolSite, setPatrolSite] = useState(null);
const [activePatrolTab, setActivePatrolTab] = useState("points");
const [patrolScheduleScope, setPatrolScheduleScope] = useState("24_7");
const [patrolIntervalHours, setPatrolIntervalHours] = useState("1");
const [patrolStartTime, setPatrolStartTime] = useState("13:00");
const [patrolReminderMinutes, setPatrolReminderMinutes] = useState("5");
const [patrolScheduleSaveStatus, setPatrolScheduleSaveStatus] = useState("");
const [activeRecurringSchedule, setActiveRecurringSchedule] = useState(null);
const [manualPatrolDate, setManualPatrolDate] = useState("");
const [manualPatrolTime, setManualPatrolTime] = useState("");
const [manualPatrolSaveStatus, setManualPatrolSaveStatus] = useState("");
const [manualPatrolHistory, setManualPatrolHistory] = useState([]);
const [patrolPoints, setPatrolPoints] = useState([]);

const [newPatrolPoint, setNewPatrolPoint] = useState({
  point_name: "",
  point_description: "",
});
const [profileGuard, setProfileGuard] = useState(null);
const [expandedSiteId, setExpandedSiteId] = useState(null);
const [guardProfileSaveStatus, setGuardProfileSaveStatus] = useState("");
const [sopFile, setSopFile] = useState(null);
const [isUploadingSop, setIsUploadingSop] = useState(false);
const [document1File, setDocument1File] = useState(null);
const [document2File, setDocument2File] = useState(null);

const [isUploadingDocument1, setIsUploadingDocument1] = useState(false);
const [isUploadingDocument2, setIsUploadingDocument2] = useState(false);

const [newSite, setNewSite] = useState({
  name: "",
  location: "",
  required_shifts: "",
});

const [newGuard, setNewGuard] = useState({
  full_name: "",
  username: "",
  phone: "",
  password: "",
  site_id: "",
});

const [newRecipient, setNewRecipient] = useState({
full_name:"",
phone:"",
sms_enabled:true,
voice_enabled:true,
});
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const loadAlertConfiguration = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/settings/alert-configuration`
    );

    const data = await response.json();

    setAlertConfig(data);
  } catch (err) {
    console.error("Alert configuration error", err);
  }
};

const loadRecipients = async () => {
try{

const response = await fetch(
`${API_BASE_URL}/settings/alert-recipients`
);

const data = await response.json();

setRecipients(data.recipients || []);

}catch(err){

console.error(
"Recipients load error",
err
);

}
};

const loadSites = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/sites`);
    const data = await response.json();

    setSites(data.sites || []);
  } catch (err) {
    console.error("Sites load error", err);
  }
};

const loadGuards = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/guards`);
    const data = await response.json();

    setGuards(data.guards || []);
  } catch (err) {
    console.error("Guards load error", err);
  }
};

const loadUsers = async (showLoader = true) => {
  if (showLoader) {
    setLoadingUsers(true);
  }

  setUsersError("");

  try {
    const sessionToken = getSessionToken();

    if (!sessionToken) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    const data = await response.json();

    console.log("Users API:", data);

    if (!response.ok) {
      throw new Error(data.message || "Users load failed");
    }

    setUsers(data.users || []);
  } catch (err) {
    console.error("Users load error", err);
    setUsersError(err.message || "Users load failed");
  } finally {
    if (showLoader) {
      setLoadingUsers(false);
    }
  }
};

const loadUserDetails = async (
  userId,
  showLoader = true,
  resetEditMode = true
) => {
  if (showLoader) {
    setLoadingSelectedUser(true);
    setSelectedUserError("");
  }

  try {
    const sessionToken = getSessionToken();

    if (!sessionToken) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "User details load failed");
    }

    setSelectedUser(data.user);
    setEditingUser(data.user);

    if (resetEditMode) {
      setIsEditingUser(false);
    }
  } catch (err) {
    console.error("User details load error", err);

    if (showLoader) {
      setSelectedUserError(
        err.message || "User details load failed"
      );
    }
  } finally {
    if (showLoader) {
      setLoadingSelectedUser(false);
    }
  }
};

const saveUserChanges = async () => {
  if (!editingUser?.id) return;

  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${editingUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  full_name: editingUser.full_name,
  username: editingUser.username,
  email: editingUser.email,
  secondary_email: editingUser.secondary_email,
  phone: editingUser.phone,
  mobile_phone: editingUser.mobile_phone,
  backup_phone: editingUser.backup_phone,
  role: editingUser.role,
  status: editingUser.status,
  company_id: editingUser.company_id,
}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "User update failed");
    }

    setSelectedUser(data.user);
    setEditingUser(data.user);
    setIsEditingUser(false);
    loadUsers(false);
  } catch (err) {
    console.error("User update error", err);
    alert(err.message || "User update failed");
  }
};

const resetUserPassword = async () => {
  if (!selectedUser?.id) return;

  try {
    setIsResettingPassword(true);

    const response = await fetch(
      `${API_BASE_URL}/admin/users/${selectedUser.id}/reset-password`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Password reset failed");
    }

    setShowResetPasswordConfirm(false);

    setTemporaryPassword(data.temporary_password);

    setSelectedUser(data.user);
    setEditingUser(data.user);

    loadUsers(false);

    setShowTemporaryPasswordModal(true);
  } catch (err) {
    console.error("Password reset error", err);
    alert(err.message || "Password reset failed");
  } finally {
    setIsResettingPassword(false);
  }
};

const copyTemporaryPassword = async () => {
  if (!temporaryPassword) return;

  try {
    await navigator.clipboard.writeText(temporaryPassword);
    setPasswordCopied(true);

    setTimeout(() => {
      setPasswordCopied(false);
    }, 2000);
  } catch (err) {
    console.error("Password copy error", err);
  }
};

const createNewUser = async () => {
  const fullName = newUser.full_name.trim();
  const username = newUser.username.trim();

  if (!fullName || !username) {
    setNewUserError("Full name and username are required.");
    return;
  }

  try {
    setIsCreatingUser(true);
    setNewUserError("");
    setPasswordCopied(false);

    const sessionToken = getSessionToken();

    if (!sessionToken) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        full_name: fullName,
        username,
        email: newUser.email.trim(),
        secondary_email: newUser.secondary_email.trim(),
        phone: newUser.phone.trim(),
        mobile_phone: newUser.mobile_phone.trim(),
        backup_phone: newUser.backup_phone.trim(),
        role: newUser.role,
        status: newUser.status,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "User creation failed");
    }

    setShowNewUserModal(false);
    setTemporaryPassword(data.temporary_password);
    setSelectedUser(data.user);
    setEditingUser(data.user);
    setShowTemporaryPasswordModal(true);

    await loadUsers(false);
  } catch (err) {
    console.error("Create user error", err);
    setNewUserError(err.message || "User creation failed");
  } finally {
    setIsCreatingUser(false);
  }
};

const formatUserRole = (role) => {
  if (!role) return "-";

  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatUserStatus = (status) => {
  if (!status) return "-";

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatUserDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("el-GR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const loadPatrolPoints = async (siteId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/settings/sites/${siteId}/patrol-points`
    );

    const data = await response.json();

    setPatrolPoints(data.points || []);
  } catch (err) {
    console.error("Patrol points load error", err);
  }
};

const loadManualPatrolHistory = async (siteId) => {
  if (!siteId) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/patrols/manual-history?site_id=${siteId}`
    );

    const data = await response.json();

    if (data.status === "ok") {
      setManualPatrolHistory(data.manual_history || []);
    }
  } catch (err) {
    console.error("Manual patrol history load error", err);
  }
};

const addPatrolPoint = async () => {
  if (!patrolSite || !newPatrolPoint.point_name) return;

  try {
    await fetch(
      `${API_BASE_URL}/settings/sites/${patrolSite.id}/patrol-points`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPatrolPoint),
      }
    );

    setNewPatrolPoint({
      point_name: "",
      point_description: "",      
    });

    await loadPatrolPoints(patrolSite.id);
  } catch (err) {
    console.error("Add patrol point error", err);
  }
};

const addRecipient = async () => {

try{

await fetch(
`${API_BASE_URL}/settings/alert-recipients`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
},
body:JSON.stringify(newRecipient),
}
);

setNewRecipient({
full_name:"",
phone:"",
sms_enabled:true,
voice_enabled:true,
});

await loadRecipients();

}catch(err){

console.error(
"Add recipient error",
err
);

}

};

const addSite = async () => {
  try {
    await fetch(`${API_BASE_URL}/settings/sites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSite),
    });

    setNewSite({
      name: "",
      location: "",
      required_shifts: "",
    });

    await loadSites();
  } catch (err) {
    console.error("Add site error", err);
  }
};

const updateSite = async () => {
  if (!editingSite) return;

  try {
    await fetch(`${API_BASE_URL}/settings/sites/${editingSite.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingSite),
    });

    setEditingSite(null);
    await loadSites();
  } catch (err) {
    console.error("Update site error", err);
  }
};

const uploadSopFile = async () => {
  if (!profileSite || !sopFile) return;

  try {
    setIsUploadingSop(true);

    const formData = new FormData();
    formData.append("sop_file", sopFile);

    const response = await fetch(
      `${API_BASE_URL}/settings/sites/${profileSite.id}/sop/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "SOP upload failed");
    }

    setProfileSite({
      ...profileSite,
      sop_file_url: data.sop_file_url,
      sop_updated_at: data.site?.sop_updated_at,
    });

    setSopFile(null);
    await loadSites();
  } catch (err) {
    console.error("SOP upload error", err);
    alert(err.message || "SOP upload failed");
  } finally {
    setIsUploadingSop(false);
  }
};

const uploadSiteDocument = async (slot, file) => {
  if (!profileSite || !file) return;

  try {
    if (slot === 1) {
      setIsUploadingDocument1(true);
    } else {
      setIsUploadingDocument2(true);
    }

    const formData = new FormData();
    formData.append("site_document", file);

    const response = await fetch(
      `${API_BASE_URL}/settings/sites/${profileSite.id}/documents/${slot}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    setProfileSite({
      ...profileSite,
      [`document_${slot}_url`]: data.document_url,
    });

    await loadSites();
  } catch (err) {
    console.error("Document upload error:", err);
    alert(err.message);
  } finally {
    setIsUploadingDocument1(false);
    setIsUploadingDocument2(false);
  }
};

const updateSiteProfile = async () => {
  if (!profileSite) return;

  try {
    await fetch(`${API_BASE_URL}/settings/sites/${profileSite.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileSite),
    });

    setProfileSite(null);
    await loadSites();
  } catch (err) {
    console.error("Update site profile error", err);
  }
};

const saveGuardProfile = async () => {
  if (!profileGuard) return;

  setGuardProfileSaveStatus("Saving...");

  try {
    const response = await fetch(
      `${API_BASE_URL}/guards/${profileGuard.id}/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  ...profileGuard,
  mobile_phone:
    profileGuard.mobile_phone || profileGuard.phone || "",
  phone:
    profileGuard.mobile_phone || profileGuard.phone || "",
}),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save guard profile");
    }

    await loadGuards();

setProfileGuard(data.guard);

setGuardProfileSaveStatus("Saved");
  } catch (err) {
    console.error(err);

setGuardProfileSaveStatus("Save failed");

alert(err.message);
  }
};

const addGuard = async () => {
  try {
    await fetch(`${API_BASE_URL}/settings/guards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  ...newGuard,
  site_id: newGuard.site_id === "trial" ? null : newGuard.site_id,
  assignment_status:
    newGuard.site_id === "trial" ? "trial" : "assigned",
}),
    });

    setNewGuard({
      full_name: "",
      username: "",
      phone: "",
      password: "",
      site_id: "",
    });

    await loadGuards();
  } catch (err) {
    console.error("Add guard error", err);
  }
};


  useEffect(() => {
    

loadAlertConfiguration();
loadRecipients();
loadSites();
loadGuards();
loadUsers();
    async function loadSystemStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/system/status`);
        const data = await response.json();

        setSystemStatus(data);
      } catch (err) {
        console.error("Settings system status error:", err);

        setSystemStatus({
          overall_status: "offline",
          services: {
            web_app: { status: "offline" },
            backend_api: { status: "offline" },
            sms_gateway: { status: "unknown" },
            voice_calls: { status: "unknown" },
            database: { status: "unknown" },
          },
        });
      }
    }

    loadSystemStatus();

    const interval = setInterval(() => {
  loadSystemStatus();
loadAlertConfiguration();
loadRecipients();
loadSites();
loadGuards();
loadUsers(false);
}, 5000);

    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  if (!selectedUser?.id || isEditingUser) {
    return;
  }

  const selectedUserInterval = setInterval(() => {
    loadUserDetails(selectedUser.id, false, false);
  }, 5000);

  return () => clearInterval(selectedUserInterval);
}, [selectedUser?.id, isEditingUser]);

  const handleTestAlert = async () => {
  setIsTestingAlert(true);

  try {
    const response = await fetch(`${API_BASE_URL}/alerts/test`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Test alert failed");
    }

    await loadAlertConfiguration();
  } catch (err) {
    console.error("Test alert error", err);
    alert(err.message || "Test alert failed");
  } finally {
    setIsTestingAlert(false);
  }
};

const createDefaultShiftRules = (requiredShifts = 1) => {
  const templates = {
    1: [
      { name: "Shift 1", start: "07:00", end: "19:00" },
    ],
    2: [
      { name: "Shift 1", start: "07:00", end: "19:00" },
      { name: "Shift 2", start: "19:00", end: "07:00" },
    ],
    3: [
      { name: "Shift 1", start: "07:00", end: "15:00" },
      { name: "Shift 2", start: "15:00", end: "23:00" },
      { name: "Shift 3", start: "23:00", end: "07:00" },
    ],
  };

  return {
    shifts: templates[requiredShifts] || Array.from(
      { length: requiredShifts },
      (_, index) => ({
        name: `Shift ${index + 1}`,
        start: "",
        end: "",
      })
    ),
  };
};

const printSiteProfile = (site) => {
  if (!site) return;

  const formatValue = (value) => value || "-";

  const shiftsHtml = site.shift_rules?.shifts?.length
    ? site.shift_rules.shifts
        .map(
          (shift) => `
            <tr>
              <td>${formatValue(shift.name)}</td>
              <td>${formatValue(shift.start)}</td>
              <td>${formatValue(shift.end)}</td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="3">No shift rules configured</td>
      </tr>
    `;

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Aegis Link Site Operational Profile</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111;
            padding: 32px;
          }

          .report-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 3px solid #111827;
            padding-bottom: 18px;
            margin-bottom: 28px;
          }

          .brand-title h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 1px;
          }

          .brand-title p {
            margin: 4px 0 0;
            color: #555;
            font-size: 14px;
          }

          .report-meta {
            text-align: right;
            font-size: 13px;
            color: #444;
          }

          h2 {
            margin-top: 28px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
            font-size: 18px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 28px;
          }

          .item {
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
          }

          .label {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            color: #666;
            letter-spacing: .6px;
            margin-bottom: 3px;
          }

          .value {
            font-size: 15px;
            font-weight: 600;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            border-bottom: 1px solid #eee;
            padding: 9px 8px;
            text-align: left;
            font-size: 14px;
          }

          .notes {
            white-space: pre-line;
            line-height: 1.5;
          }

          .footer {
            margin-top: 36px;
            padding-top: 14px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #555;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>

      <body>
        <div class="report-header">
          <div class="brand-title">
            <h1>AEGIS LINK</h1>
            <p>Security Operations Platform</p>
          </div>

          <div class="report-meta">
            <strong>Site Operational Profile</strong><br/>
            Site ID: SITE-${String(site.id).padStart(3, "0")}<br/>
            Generated: ${new Date().toLocaleString("el-GR")}<br/>
            Generated By: elias_admin
          </div>
        </div>

        <h2>Site Information</h2>
        <div class="grid">
          <div class="item"><span class="label">Site Name</span><span class="value">${formatValue(site.name)}</span></div>
          <div class="item"><span class="label">Location</span><span class="value">${formatValue(site.location)}</span></div>
          <div class="item"><span class="label">Full Address</span><span class="value">${formatValue(site.full_address)}</span></div>
          <div class="item"><span class="label">Site Phone</span><span class="value">${formatValue(site.site_phone)}</span></div>
          <div class="item"><span class="label">Status</span><span class="value">${formatValue(site.status)}</span></div>
          <div class="item"><span class="label">Required Shifts</span><span class="value">${formatValue(site.required_shifts)}</span></div>
        </div>

        <h2>Coverage & Shift Rules</h2>
        <div class="grid">
          <div class="item"><span class="label">Coverage Type</span><span class="value">${formatValue(site.coverage_type)}</span></div>
          <div class="item"><span class="label">Schedule Mode</span><span class="value">${formatValue(site.shift_rules?.schedule_mode)}</span></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Shift</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            ${shiftsHtml}
          </tbody>
        </table>

        <h2>Contacts</h2>
        <div class="grid">
          <div class="item"><span class="label">Residence Contact</span><span class="value">${formatValue(site.residence_contact_name)}</span></div>
          <div class="item"><span class="label">Residence Phone</span><span class="value">${formatValue(site.residence_contact_phone)}</span></div>
          <div class="item"><span class="label">Supervisor Contact</span><span class="value">${formatValue(site.supervisor_contact_name)}</span></div>
          <div class="item"><span class="label">Supervisor Phone</span><span class="value">${formatValue(site.supervisor_contact_phone)}</span></div>
        </div>

        <h2>Operational Notes</h2>
        <p><strong>General Notes:</strong><br/><span class="notes">${formatValue(site.general_notes)}</span></p>
        <p><strong>Access Instructions:</strong><br/><span class="notes">${formatValue(site.access_instructions)}</span></p>
        <p><strong>Patrol Instructions:</strong><br/><span class="notes">${formatValue(site.patrol_instructions)}</span></p>
        <p><strong>Emergency Instructions:</strong><br/><span class="notes">${formatValue(site.emergency_instructions)}</span></p>
        <p><strong>Special Warnings:</strong><br/><span class="notes">${formatValue(site.special_warnings)}</span></p>

        <h2>SOP Documentation</h2>

<div class="grid">
  <div class="item">
    <span class="label">SOP Title</span>
    <span class="value">${formatValue(site.sop_title)}</span>
  </div>

  <div class="item">
    <span class="label">SOP Version</span>
    <span class="value">${formatValue(site.sop_version)}</span>
  </div>
</div>

<p>
  <strong>SOP Text:</strong><br/>
  <span class="notes">${formatValue(site.sop_text)}</span>
</p>

<p>
  <strong>SOP File URL:</strong><br/>
  <span class="notes">${formatValue(site.sop_file_url)}</span>
</p>

        <div class="footer">
          <span>Aegis Link Security Operations Platform</span>
          <span>Generated Automatically</span>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

const printGuardProfile = (guard) => {
  if (!guard) return;

  const formatValue = (value) => value || "-";

  const assignedSite =
    sites.find((site) => String(site.id) === String(guard.site_id))?.name ||
    guard.site_name ||
    "Trial / Unassigned";

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Aegis Link Guard Profile</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111;
            padding: 32px;
          }

          .report-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 3px solid #111827;
            padding-bottom: 18px;
            margin-bottom: 28px;
          }

          .brand-title h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 1px;
          }

          .brand-title p {
            margin: 4px 0 0;
            color: #555;
            font-size: 14px;
          }

          .report-meta {
            text-align: right;
            font-size: 13px;
            color: #444;
          }

          h2 {
            margin-top: 28px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
            font-size: 18px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 28px;
          }

          .item {
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
          }

          .label {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            color: #666;
            letter-spacing: .6px;
            margin-bottom: 3px;
          }

          .value {
            font-size: 15px;
            font-weight: 600;
          }

          .notes {
            white-space: pre-line;
            line-height: 1.5;
          }

          .footer {
            margin-top: 36px;
            padding-top: 14px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #555;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>

      <body>
        <div class="report-header">
          <div class="brand-title">
            <h1>AEGIS LINK</h1>
            <p>Security Operations Platform</p>
          </div>

          <div class="report-meta">
            <strong>Guard Operational Profile</strong><br/>
            Guard ID: GUARD-${String(guard.id).padStart(3, "0")}<br/>
            Generated: ${new Date().toLocaleString("el-GR")}<br/>
            Generated By: elias_admin
          </div>
        </div>

        <h2>Basic Information</h2>

        <div class="grid">
          <div class="item"><span class="label">Full Name</span><span class="value">${formatValue(guard.full_name)}</span></div>
          <div class="item"><span class="label">Username</span><span class="value">${formatValue(guard.username)}</span></div>
          <div class="item"><span class="label">Mobile Phone</span><span class="value">${formatValue(guard.mobile_phone || guard.phone)}</span></div>
          <div class="item"><span class="label">Landline Phone</span><span class="value">${formatValue(guard.landline_phone)}</span></div>
          <div class="item"><span class="label">Tax ID / ΑΦΜ</span><span class="value">${formatValue(guard.tax_id)}</span></div>
          <div class="item"><span class="label">Home Address</span><span class="value">${formatValue(guard.home_address)}</span></div>
        </div>

        <h2>Assignment</h2>

        <div class="grid">
          <div class="item"><span class="label">Assigned Site</span><span class="value">${formatValue(assignedSite)}</span></div>
          <div class="item"><span class="label">Assignment Status</span><span class="value">${formatValue(guard.assignment_status)}</span></div>
          <div class="item"><span class="label">Employment Status</span><span class="value">${formatValue(guard.employment_status)}</span></div>
          <div class="item"><span class="label">Operational Status</span><span class="value">${guard.active ? "Active" : "Inactive"}</span></div>
        </div>

        <h2>Training & Experience</h2>

        <div class="grid">
          <div class="item"><span class="label">Education Level</span><span class="value">${formatValue(guard.education_level)}</span></div>
          <div class="item"><span class="label">Foreign Languages</span><span class="value">${formatValue(guard.foreign_languages)}</span></div>
          <div class="item"><span class="label">Security Experience</span><span class="value">${formatValue(guard.security_experience_range)}</span></div>
        </div>

        <h2>Guard Notes</h2>

        <p>
          <span class="notes">${formatValue(guard.guard_notes)}</span>
        </p>

        <div class="footer">
          <span>Aegis Link Security Operations Platform</span>
          <span>Generated Automatically</span>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

const formatGreekDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("el-GR", {
    timeZone: "Europe/Athens",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const saveRecurringPatrolSchedule = async () => {
  if (!patrolSite) return;
  const currentUser = JSON.parse(
  localStorage.getItem("aegis-current-user") || "{}"
);
  console.log("Saving recurring schedule for site:", patrolSite);

  setPatrolScheduleSaveStatus("Saving...");

  try {
    console.log("Calling recurring endpoint:", `${API_BASE_URL}/settings/sites/${patrolSite.id}/patrol-schedules/recurring`);
    const response = await fetch(
      `${API_BASE_URL}/settings/sites/${patrolSite.id}/patrol-schedules/recurring`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  interval_hours: Number(patrolIntervalHours),
  start_time: patrolStartTime,
  reminder_minutes_before: Number(patrolReminderMinutes),
  schedule_scope: patrolScheduleScope,

  created_by_admin_id:
    currentUser?.user?.id || currentUser?.id || null,

  created_by_username:
    currentUser?.user?.username ||
    currentUser?.username ||
    "unknown_admin",

  created_by_role:
    currentUser?.user?.role ||
    currentUser?.role ||
    "admin",
}),
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "ok") {
      throw new Error(data.message || "Failed to save patrol schedule");
    }

    await loadPatrolPoints(patrolSite.id);
    await loadActiveRecurringSchedule(patrolSite.id);

    setPatrolScheduleSaveStatus("Saved");
  } catch (err) {
    console.error("Save recurring patrol schedule error", err);
    setPatrolScheduleSaveStatus("Save failed");
    alert(err.message || "Failed to save patrol schedule");
  }
};

const loadActiveRecurringSchedule = async (siteId) => {
  if (!siteId) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/settings/sites/${siteId}/patrol-schedules`
    );

    const data = await response.json();

    if (!response.ok || data.status !== "ok") {
      throw new Error(data.message || "Failed to load patrol schedules");
    }

    const activeRecurring = (data.schedules || []).find(
      (schedule) =>
        schedule.schedule_type === "recurring" && schedule.active === true
    );

    setActiveRecurringSchedule(activeRecurring || null);
  } catch (err) {
    console.error("Load active recurring schedule error", err);
    setActiveRecurringSchedule(null);
  }
};

const addManualPatrolSchedule = async () => {
  if (!patrolSite) return;

  if (!manualPatrolDate || !manualPatrolTime) {
    alert("Please select date and time.");
    return;
  }

  const currentUser = JSON.parse(
  localStorage.getItem("aegis-current-user") || "{}"
);

  setManualPatrolSaveStatus("Saving...");

  try {
    const response = await fetch(
      `${API_BASE_URL}/settings/sites/${patrolSite.id}/patrol-schedules/manual`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduled_date: manualPatrolDate,
          scheduled_time: manualPatrolTime,
          reminder_minutes_before: Number(patrolReminderMinutes),

          created_by_admin_id:
            currentUser?.user?.id || currentUser?.id || null,

          created_by_username:
            currentUser?.user?.username ||
            currentUser?.username ||
            "unknown_admin",

          created_by_role:
            currentUser?.user?.role ||
            currentUser?.role ||
            "admin",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "ok") {
      throw new Error(data.message || "Failed to add manual patrol.");
    }

    setManualPatrolDate("");
    setManualPatrolTime("");
    setManualPatrolSaveStatus("Saved");

    await loadPatrolPoints(patrolSite.id);
    await loadManualPatrolHistory(patrolSite.id);
  } catch (err) {
    console.error("Add manual patrol error", err);
    setManualPatrolSaveStatus("Save failed");
    alert(err.message || "Failed to add manual patrol.");
  }
};

const cancelManualPatrol = async (item) => {
  if (!item?.id || !patrolSite) return;

  const confirmed = window.confirm(
    "Cancel this manual patrol? The record will remain in history."
  );

  if (!confirmed) return;

  const currentUser = JSON.parse(
    localStorage.getItem("aegis-current-user") || "{}"
  );

  try {
    await fetch(
      `${API_BASE_URL}/patrols/manual/${item.id}/cancel`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelled_by_username:
            currentUser?.user?.username ||
            currentUser?.username ||
            "unknown_admin",
          cancel_reason: "Cancelled from Settings manual patrol history",
        }),
      }
    );

    await loadManualPatrolHistory(patrolSite.id);
  } catch (err) {
    console.error("Cancel manual patrol error", err);
    alert("Failed to cancel manual patrol.");
  }
};

  return (
    <>
      <header style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "700" }}>
          Settings
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#9ca3af",
            fontSize: "15px",
          }}
        >
          Operational configuration and system controls
        </p>
      </header>

      <section className="settings-grid">
        <div className="settings-card">
  <h3>Alert Configuration</h3>

  <div className="settings-item">
    <span>SMS Recipients</span>
    <strong>{alertConfig?.sms?.recipients_count ?? "-"}</strong>
  </div>

  <div className="settings-item">
    <span>Voice Call Recipients</span>
    <strong>{alertConfig?.voice?.recipients_count ?? "-"}</strong>
  </div>

  <div className="settings-item">
    <span>Escalation Order</span>
    <strong>{alertConfig?.escalation?.order ?? "-"}</strong>
  </div>

  <div className="settings-item">
    <span>SMS Status</span>
    <strong>{alertConfig?.last_test?.sms?.status || "-"}</strong>
  </div>

  <div className="settings-item">
    <span>Voice Status</span>
    <strong>{alertConfig?.last_test?.voice?.status || "-"}</strong>
  </div>

  <div className="settings-item">
    <span>Last Test</span>
    <strong>{formatGreekDateTime(alertConfig?.last_test?.tested_at)}</strong>
  </div>

  <hr />

<h4>Recipients</h4>

<input
placeholder="Name"
value={newRecipient.full_name}
onChange={(e)=>
setNewRecipient({
...newRecipient,
full_name:e.target.value
})
}
/>

<input
placeholder="+3069..."
value={newRecipient.phone}
onChange={(e)=>
setNewRecipient({
...newRecipient,
phone:e.target.value
})
}
/>

<button onClick={addRecipient}>
Add Recipient
</button>

<button
className="secondary-button"
onClick={()=>
setShowRecipientsModal(true)
}
>
Manage Recipients
</button>
  
  <button
  onClick={handleTestAlert}
  disabled={isTestingAlert}
>
  {isTestingAlert ? "Sending..." : "Send Test Alert"}
</button>
</div>

<div className="settings-card">
  <h3>Sites Management</h3>

  <input
    placeholder="Site name"
    value={newSite.name}
    onChange={(e) =>
      setNewSite({
        ...newSite,
        name: e.target.value,
      })
    }
  />

  <input
    placeholder="Location"
    value={newSite.location}
    onChange={(e) =>
      setNewSite({
        ...newSite,
        location: e.target.value,
      })
    }
  />

  <label className="settings-field">
  <span>Required Shifts</span>

  <select
    value={newSite.required_shifts}
    onChange={(e) =>
      setNewSite({
        ...newSite,
        required_shifts: Number(e.target.value),
      })
    }
  >
    <option value="">Select shifts</option>
    <option value={1}>1 Shift</option>
    <option value={2}>2 Shifts</option>
    <option value={3}>3 Shifts</option>
    <option value={4}>4 Shifts</option>
    <option value={5}>5 Shifts</option>
  </select>
</label>

  <button onClick={addSite}>Add Site</button>

  <hr />

  {sites.map((site, index) => (
  <div
    key={site.id}
    className="settings-item"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "10px",
    }}
  >
    <div
      style={{
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onClick={() =>
        setExpandedSiteId(
          expandedSiteId === site.id ? null : site.id
        )
      }
    >
      <div>
        <strong>
          SITE-{String(index + 1).padStart(3, "0")} | {site.name}
        </strong>

        <br />

        <small>{site.location}</small>

        <br />

        <small>
          {site.status === "active" ? "Active" : "Inactive"}
          {" • "}
          {site.required_shifts || 1}
          {" "}
          {(site.required_shifts || 1) === 1
            ? "shift"
            : "shifts"}
        </small>
      </div>

      <strong>
        {expandedSiteId === site.id ? "▲" : "▼"}
      </strong>
    </div>

    {expandedSiteId === site.id && (
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setEditingSite(site);
          }}
        >
          Edit
        </button>

        <button
  type="button"
  className="secondary-button"
  onClick={() => {
    setProfileSite({
      ...site,
      shift_rules:
        site.shift_rules ||
        createDefaultShiftRules(site.required_shifts || 1),
    });
  }}
>
  Profile
</button>

        <button
  type="button"
  className="secondary-button"
  onClick={() => {
  setPatrolSite(site);
  loadPatrolPoints(site.id);
  loadActiveRecurringSchedule(site.id);
  loadManualPatrolHistory(site.id);
}}
>
  Patrols
</button>

        <button
          type="button"
          className="secondary-button"
          onClick={async () => {
            try {
              await fetch(
                `${API_BASE_URL}/settings/sites/${site.id}/toggle-active`,
                {
                  method: "PUT",
                }
              );

              await loadSites();
            } catch (err) {
              console.error("Toggle site active error", err);
            }
          }}
        >
          {site.status === "active"
            ? "Deactivate"
            : "Activate"}
        </button>

        <button
          type="button"
          className="secondary-button danger-button"
          onClick={async () => {
            const confirmed = window.confirm(
              "Archive this site? It will be removed from operational views, but historical incidents and reports will remain available."
            );

            if (!confirmed) return;

            try {
              await fetch(
                `${API_BASE_URL}/settings/sites/${site.id}/archive`,
                {
                  method: "PUT",
                }
              );

              await loadSites();
            } catch (err) {
              console.error("Archive site error", err);
            }
          }}
        >
          Archive
        </button>
      </div>
    )}
  </div>
))}
</div>

<div className="settings-users-layout">

<div className="settings-card">
  <h3>Guards Management</h3>

  <input
    placeholder="Full name"
    value={newGuard.full_name}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        full_name: e.target.value,
      })
    }
  />

  <input
    placeholder="Username"
    value={newGuard.username}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        username: e.target.value,
      })
    }
  />

  <input
    placeholder="Phone"
    value={newGuard.phone}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        phone: e.target.value,
      })
    }
  />

  <input
    type="password"
    placeholder="Temporary password"
    value={newGuard.password}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        password: e.target.value,
      })
    }
  />

  <select
    value={newGuard.site_id}
    onChange={(e) =>
      setNewGuard({
        ...newGuard,
        site_id: e.target.value,
      })
    }
  >
    <option value="">Assign to site</option>
    <option value="trial">Trial / Unassigned</option>

    {sites.map((site) => (
      <option key={site.id} value={site.id}>
        {site.name}
      </option>
    ))}
  </select>

  <button onClick={addGuard}>Add Guard</button>

  <hr />

  {[...guards]
  .sort((a, b) =>
    (a.full_name || "").localeCompare(b.full_name || "")
  )
  .map((guard, index) => (
    <div
  key={guard.id}
  className="settings-item"
  style={{ cursor: "pointer" }}
  onClick={() => setProfileGuard(guard)}
>
      <span>
        {index + 1}. {guard.full_name}
        <br />
        <small>
          {guard.username} · {guard.site_name || "No site"}
        </small>
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
  <strong>
    {guard.active ? "Active" : "Inactive"}
  </strong>

  <button
    type="button"
    className="secondary-button"
    onClick={async (e) => {
  e.stopPropagation();
      try {
        await fetch(
          `${API_BASE_URL}/settings/guards/${guard.id}/toggle-active`,
          {
            method: "PUT",
          }
        );

        await loadGuards();
      } catch (err) {
        console.error("Toggle guard active error", err);
      }
    }}
  >
    {guard.active ? "Deactivate" : "Activate"}
  </button>
</div>
    </div>
  ))}
</div>

<div className="settings-side-stack">
  <div className="settings-card users-management-card">
    <h3>Users Management</h3>

    <button
  type="button"
  className="secondary-button"
  onClick={() => {
    setNewUser({
      full_name: "",
      username: "",
      email: "",
      secondary_email: "",
      phone: "",
      mobile_phone: "",
      backup_phone: "",
      role: "guard",
      status: "active",
      company_id: 1,
    });

    setNewUserError("");
    setShowNewUserModal(true);
  }}
>
  + New User
</button>

<hr />

<div className="users-list">
{loadingUsers && (
  <p className="settings-muted-text">Loading users...</p>
)}

{usersError && (
  <p className="settings-error-text">{usersError}</p>
)}

{!loadingUsers && !usersError && users.length === 0 && (
  <p className="settings-muted-text">No users found.</p>
)}

{!loadingUsers &&
  !usersError &&
  [...users]
    .sort((a, b) =>
      (a.full_name || "").localeCompare(b.full_name || "")
    )
    .map((user, index) => (
  <div
  key={user.id}
  className="settings-item"
  style={{ cursor: "pointer" }}
  onClick={() => loadUserDetails(user.id)}
>
    <span>
  {index + 1}. {user.full_name}
  <br />

  <small>
    {user.role === "system_owner"
      ? "System Owner"
      : user.role === "supervisor"
      ? "Supervisor"
      : user.role === "guard"
      ? "Guard"
      : user.role}
  </small>

  <br />

  <small className="settings-user-username">
    Username: {user.username}
  </small>
</span>

    <span
  className={
    user.status === "active"
      ? "status-badge active"
      : "status-badge inactive"
  }
>
  {user.status === "active" ? "Active" : "Inactive"}
</span>
  </div>
))}
</div>

</div>

<div className="settings-card">
  <h3>Incident Rules</h3>

  <div className="settings-item">
    <span>Timeline Reset</span>
    <strong>1 hour</strong>
  </div>

  <div className="settings-item">
    <span>Default Priority</span>
    <strong>High</strong>
  </div>

  <div className="settings-item">
    <span>AI Intake</span>
    <strong>Enabled</strong>
  </div>
</div>

</div>
</div>

        <div className="settings-card">
          <h3>Guard Sessions</h3>

          <div className="settings-item">
            <span>Heartbeat</span>
            <strong>30 sec</strong>
          </div>

          <div className="settings-item">
            <span>Offline Timeout</span>
            <strong>90 sec</strong>
          </div>

          <div className="settings-item">
            <span>Auto Close</span>
            <strong>Enabled</strong>
          </div>
        </div>

        <div className="settings-card">
  <h3>System Integrations</h3>

  <div className="integration-status">
    <strong>Web App</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.web_app?.status || "Loading"}
    </div>
  </div>

  <div className="integration-status">
    <strong>Backend API</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.backend_api?.status || "Loading"}
    </div>

    <div style={{ fontSize: "12px", color: "#6b7280" }}>
      {systemStatus?.services?.backend_api?.message}
    </div>
  </div>

  <div className="integration-status">
    <strong>SMS Gateway</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.sms_gateway?.status || "Loading"}
    </div>

    <div style={{ fontSize: "12px", color: "#6b7280" }}>
      Configured:
      {" "}
      {systemStatus?.services?.sms_gateway?.configured
        ? "Yes"
        : "No"}
    </div>
  </div>

  <div className="integration-status">
    <strong>Voice Calls</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.voice_calls?.status || "Loading"}
    </div>

    <div style={{ fontSize: "12px", color: "#6b7280" }}>
      Configured:
      {" "}
      {systemStatus?.services?.voice_calls?.configured
        ? "Yes"
        : "No"}
    </div>
  </div>

  <div className="integration-status">
    <strong>Database</strong>

    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
      Status:
      {" "}
      {systemStatus?.services?.database?.status || "Loading"}
    </div>

    <div style={{ fontSize: "12px", color: "#6b7280" }}>
      Server:
      {" "}
      {formatGreekDateTime(systemStatus?.services?.database?.server_time)}
    </div>
  </div>

  <div
    style={{
      marginTop: "16px",
      paddingTop: "12px",
      borderTop: "1px solid #242424",
      fontSize: "12px",
      color: "#9ca3af",
    }}
  >
    Last checked:
    {" "}
    {formatGreekDateTime(systemStatus?.checked_at)}

    <br />

    Response:
    {" "}
    {systemStatus?.response_time_ms || "-"} ms
  </div>

</div>
        <div className="settings-card">
          <h3>Notifications</h3>

          <div className="settings-item">
            <span>Desktop Alerts</span>
            <strong>Enabled</strong>
          </div>

          <div className="settings-item">
            <span>Sound Alerts</span>
            <strong>Enabled</strong>
          </div>

          <div className="settings-item">
            <span>Push Notifications</span>
            <strong>Disabled</strong>
          </div>
        </div>

        <div className="settings-card">
          <h3>AI Configuration</h3>

          <div className="settings-item">
  <span>Assistant</span>

  <strong>
    {systemStatus?.services?.ai_intake?.configured
      ? "Enabled"
      : "Disabled"}
  </strong>
</div>

          <div className="settings-item">
            <span>Model</span>
            <strong>GPT-4.1-mini</strong>
          </div>

          <div className="settings-item">
            <span>Auto Summary</span>
            <strong>Enabled</strong>
          </div>
        </div>
      </section>

      {showNewUserModal && (
  <div className="modal-overlay">
    <div className="recipients-modal new-user-modal">
      <div className="modal-header">
        <div>
          <h3>Create New User</h3>
          <p className="settings-muted-text">
            Add a new user to the Aegis Link platform.
          </p>
        </div>

        <button
          type="button"
          className="modal-close user-modal-close"
          onClick={() => {
            setShowNewUserModal(false);
            setNewUserError("");
          }}
          disabled={isCreatingUser}
        >
          ×
        </button>
      </div>

      <div className="new-user-grid">
        <div className="user-details-section">
          <h4>Identity</h4>

          <label className="settings-field">
            <span>Full Name *</span>
            <input
              value={newUser.full_name}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  full_name: e.target.value,
                })
              }
            />
          </label>

          <label className="settings-field">
            <span>Username *</span>
            <input
              value={newUser.username}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  username: e.target.value,
                })
              }
            />
          </label>

          <label className="settings-field">
            <span>Role</span>
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  role: e.target.value,
                })
              }
            >
              <option value="guard">Guard</option>
              <option value="supervisor">Supervisor</option>
              <option value="system_owner">System Owner</option>
            </select>
          </label>

          <label className="settings-field">
            <span>Status</span>
            <select
              value={newUser.status}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  status: e.target.value,
                })
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="user-details-section">
          <h4>Contact Information</h4>

          <label className="settings-field">
            <span>Email</span>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  email: e.target.value,
                })
              }
            />
          </label>

          <label className="settings-field">
            <span>Secondary Email</span>
            <input
              type="email"
              value={newUser.secondary_email}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  secondary_email: e.target.value,
                })
              }
            />
          </label>

          <label className="settings-field">
            <span>Phone</span>
            <input
              value={newUser.phone}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  phone: e.target.value,
                })
              }
            />
          </label>

          <label className="settings-field">
            <span>Mobile Phone</span>
            <input
              value={newUser.mobile_phone}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  mobile_phone: e.target.value,
                })
              }
            />
          </label>

          <label className="settings-field">
            <span>Backup Phone</span>
            <input
              value={newUser.backup_phone}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  backup_phone: e.target.value,
                })
              }
            />
          </label>
        </div>
      </div>

      {newUserError && (
        <p className="settings-error-text">{newUserError}</p>
      )}

      <div className="user-modal-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setShowNewUserModal(false);
            setNewUserError("");
          }}
          disabled={isCreatingUser}
        >
          Cancel
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={createNewUser}
          disabled={isCreatingUser}
        >
          {isCreatingUser ? "Creating..." : "Create User"}
        </button>
      </div>
    </div>
  </div>
)}

      {selectedUser && (
  <div className="modal-overlay">
    <div className="recipients-modal">
      <div className="modal-header user-modal-header">
  <div>
    <h3>{selectedUser.full_name || "User Details"}</h3>
    <p className="modal-subtitle">User Details</p>
  </div>

  <button
    className="modal-close user-modal-close"
    onClick={() => {
      setSelectedUser(null);
      setEditingUser(null);
      setIsEditingUser(false);
    }}
  >
    ×
  </button>
</div>

<div className="user-modal-actions">
  {!isEditingUser ? (
  <>
    <button
      className="secondary-button"
      onClick={() => setShowResetPasswordConfirm(true)}
    >
      Reset Password
    </button>

    <button
      className="primary-button"
      onClick={() => {
        setEditingUser({ ...selectedUser });
        setIsEditingUser(true);
      }}
    >
      Edit User
    </button>
  </>
) : (
    <>
      <button
        className="secondary-button"
        onClick={() => {
          setEditingUser(selectedUser);
          setIsEditingUser(false);
        }}
      >
        Cancel
      </button>

      <button
        className="primary-button"
        onClick={saveUserChanges}
      >
        Save Changes
      </button>
    </>
  )}
</div>

      {loadingSelectedUser && (
        <p className="settings-muted-text">Loading user details...</p>
      )}

      {selectedUserError && (
        <p className="settings-error-text">{selectedUserError}</p>
      )}

      {!loadingSelectedUser && !selectedUserError && (
        <>
          <div className="user-details-grid">
  <div className="user-details-section">
    <h4>Identity</h4>

    <div className="settings-item">
  <span>Full Name</span>

  {isEditingUser ? (
    <input
      className="user-edit-input"
      value={editingUser?.full_name || ""}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          full_name: e.target.value,
        })
      }
    />
  ) : (
    <strong>{selectedUser.full_name || "-"}</strong>
  )}
</div>

    <div className="settings-item">
  <span>Username</span>

  {isEditingUser ? (
    <input
      className="user-edit-input"
      value={editingUser?.username || ""}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          username: e.target.value,
        })
      }
    />
  ) : (
    <strong>{selectedUser.username || "-"}</strong>
  )}
</div>

    <div className="settings-item">
  <span>Role</span>

  {isEditingUser ? (
    <select
      className="user-edit-input"
      value={editingUser?.role || "guard"}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          role: e.target.value,
        })
      }
    >
      <option value="guard">Guard</option>
      <option value="supervisor">Supervisor</option>
      <option value="system_owner">System Owner</option>
    </select>
  ) : (
    <strong className="user-detail-badge">
      {formatUserRole(selectedUser.role)}
    </strong>
  )}
</div>

    <div className="settings-item">
  <span>Status</span>

  {isEditingUser ? (
    <select
      className="user-edit-input"
      value={editingUser?.status || "active"}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          status: e.target.value,
        })
      }
    >
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  ) : (
    <strong className="user-detail-badge">
      {formatUserStatus(selectedUser.status)}
    </strong>
  )}
</div>
  </div>

  <div className="user-details-section">
    <h4>Contact Information</h4>

    <div className="settings-item">
  <span>Email</span>

  {isEditingUser ? (
    <input
      className="user-edit-input"
      type="email"
      value={editingUser?.email || ""}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          email: e.target.value,
        })
      }
    />
  ) : (
    <strong>{selectedUser.email || "-"}</strong>
  )}
</div>

<div className="settings-item">
  <span>Secondary Email</span>

  {isEditingUser ? (
    <input
      className="user-edit-input"
      type="email"
      value={editingUser?.secondary_email || ""}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          secondary_email: e.target.value,
        })
      }
    />
  ) : (
    <strong>{selectedUser.secondary_email || "-"}</strong>
  )}
</div>

<div className="settings-item">
  <span>Phone</span>

  {isEditingUser ? (
    <input
      className="user-edit-input"
      value={editingUser?.phone || ""}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          phone: e.target.value,
        })
      }
    />
  ) : (
    <strong>{selectedUser.phone || "-"}</strong>
  )}
</div>

<div className="settings-item">
  <span>Mobile Phone</span>

  {isEditingUser ? (
    <input
      className="user-edit-input"
      value={editingUser?.mobile_phone || ""}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          mobile_phone: e.target.value,
        })
      }
    />
  ) : (
    <strong>{selectedUser.mobile_phone || "-"}</strong>
  )}
</div>

<div className="settings-item">
  <span>Backup Phone</span>

  {isEditingUser ? (
    <input
      className="user-edit-input"
      value={editingUser?.backup_phone || ""}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          backup_phone: e.target.value,
        })
      }
    />
  ) : (
    <strong>{selectedUser.backup_phone || "-"}</strong>
  )}
</div>
  </div>

  <div className="user-details-section">
    <h4>Security</h4>

    <div className="settings-item">
      <span>Password Status</span>
      <strong className="user-detail-badge">
  {selectedUser.must_change_password
    ? "Password Reset Required"
    : "Password OK"}
</strong>
    </div>
  </div>
  <div className="user-details-section">
  <h4>System Information</h4>

  <div className="settings-item">
    <span>User ID</span>
    <strong>{selectedUser.id || "-"}</strong>
  </div>

  <div className="settings-item">
    <span>Created At</span>
    <strong>{formatUserDateTime(selectedUser.created_at)}</strong>
  </div>

  <div className="settings-item">
    <span>Last Updated</span>
    <strong>{formatUserDateTime(selectedUser.updated_at)}</strong>
  </div>

  <div className="settings-item">
    <span>Company</span>
    <strong>{selectedUser.company_name || selectedUser.company || "-"}</strong>
  </div>
</div>
</div>
        </>
      )}
    </div>
  </div>
)}

{showResetPasswordConfirm && selectedUser && (
  <div className="modal-overlay">
    <div className="recipients-modal reset-password-modal">
      <div className="modal-header">
        <div>
          <h3>Reset Password</h3>
          <p className="settings-muted-text">
            Confirm password reset for this user.
          </p>
        </div>

        <button
          type="button"
          className="user-modal-close"
          onClick={() => setShowResetPasswordConfirm(false)}
          disabled={isResettingPassword}
        >
          ×
        </button>
      </div>

      <div className="reset-password-user">
        <div className="settings-item">
          <span>Full Name</span>
          <strong>{selectedUser.full_name || "-"}</strong>
        </div>

        <div className="settings-item">
          <span>Username</span>
          <strong>{selectedUser.username || "-"}</strong>
        </div>

        <div className="settings-item">
          <span>Role</span>
          <strong>{formatUserRole(selectedUser.role)}</strong>
        </div>
      </div>

      <div className="reset-password-warning">
        The current password will stop working immediately. A new temporary
        password will be generated, and the user will be required to change it
        after login.
      </div>

      <div className="user-modal-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setShowResetPasswordConfirm(false)}
          disabled={isResettingPassword}
        >
          Cancel
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={resetUserPassword}
          disabled={isResettingPassword}
        >
          {isResettingPassword ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  </div>
)}

{showTemporaryPasswordModal && selectedUser && (
  <div className="modal-overlay">
    <div className="recipients-modal reset-password-modal">
      <div className="modal-header">
        <div>
          <h3>Password Reset Successfully</h3>
          <p className="settings-muted-text">
            A new temporary password has been generated.
          </p>
        </div>

        <button
          type="button"
          className="modal-close user-modal-close"
          onClick={() => {
            setShowTemporaryPasswordModal(false);
            setTemporaryPassword("");
            setPasswordCopied(false);
          }}
        >
          ×
        </button>
      </div>

      <div className="reset-password-user">
        <div className="settings-item">
          <span>User</span>
          <strong>{selectedUser.full_name || "-"}</strong>
        </div>

        <div className="settings-item">
          <span>Username</span>
          <strong>{selectedUser.username || "-"}</strong>
        </div>
      </div>

      <div className="temporary-password-box">
        <span>Temporary Password</span>

        <strong>{temporaryPassword}</strong>
      </div>

      <p className="reset-password-warning">
        Copy this password now. It will not be available again after this
        window is closed.
      </p>

      <div className="user-modal-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={copyTemporaryPassword}
        >
          {passwordCopied ? "Password Copied" : "Copy Password"}
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setShowTemporaryPasswordModal(false);
            setTemporaryPassword("");
            setPasswordCopied(false);
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      {showRecipientsModal && (

<div className="modal-overlay">

<div className="recipients-modal">

<div className="modal-header">

<h3>
Alert Recipients
</h3>

<button
className="modal-close"

onClick={()=>
setShowRecipientsModal(
false
)
}
>

×

</button>

</div>

<div className="recipients-list-modal">

{recipients.map(
(item)=>(

<div
key={item.id}

className="
recipient-row-modal
"
>

<div>

<strong>
{item.full_name}
</strong>

<span>
{item.phone}
</span>

</div>

<button
className="danger-btn"

onClick={async()=>{

try{

await fetch(
`${API_BASE_URL}/settings/alert-recipients/${item.id}`,
{
method:
"DELETE"
}
);

loadRecipients();

}catch(err){

console.error(
err
);

}

}}
>

Delete

</button>

</div>

)

)}

</div>

</div>

</div>

)}

{editingSite && (
  <div className="modal-overlay">
    <div className="recipients-modal">
      <div className="modal-header">
        <h3>Edit Site</h3>

        <button
          className="modal-close"
          onClick={() => setEditingSite(null)}
        >
          ×
        </button>
      </div>

      <input
        placeholder="Site name"
        value={editingSite.name || ""}
        onChange={(e) =>
          setEditingSite({
            ...editingSite,
            name: e.target.value,
          })
        }
      />

      <input
        placeholder="Location"
        value={editingSite.location || ""}
        onChange={(e) =>
          setEditingSite({
            ...editingSite,
            location: e.target.value,
          })
        }
      />

      <input
        type="number"
        min="1"
        placeholder="Required shifts"
        value={editingSite.required_shifts || 1}
        onChange={(e) =>
          setEditingSite({
            ...editingSite,
            required_shifts: Number(e.target.value),
          })
        }
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        <button onClick={updateSite}>
          Save Changes
        </button>

        <button
          className="secondary-button"
          onClick={() => setEditingSite(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{profileSite && (
  <div className="modal-overlay">
    <div className="recipients-modal">
      <div className="modal-header">
        <h3>Site Profile</h3>

        <button
          className="modal-close"
          onClick={() => setProfileSite(null)}
        >
          ×
        </button>
      </div>

      <h4>Site Information</h4>

<label className="settings-field">
  <span>Full Address</span>

  <input
    placeholder="Full address"
    value={profileSite.full_address || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        full_address: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Site Phone</span>

  <input
    placeholder="Site phone"
    value={profileSite.site_phone || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        site_phone: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Coverage Type</span>

  <select
    value={profileSite.coverage_type || "24_7"}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        coverage_type: e.target.value,
        shift_rules:
          profileSite.shift_rules ||
          createDefaultShiftRules(profileSite.required_shifts || 1),
      })
    }
  >
    <option value="24_7">24/7 Coverage</option>
    <option value="custom">Custom Hours</option>
  </select>
</label>

<div className="settings-field">
  <span>Schedule Mode</span>

  <select
    value={profileSite.shift_rules?.schedule_mode || "daily"}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        shift_rules: {
          ...(profileSite.shift_rules || {}),
          schedule_mode: e.target.value,
          shifts:
            profileSite.shift_rules?.shifts ||
            createDefaultShiftRules(
              profileSite.required_shifts || 1
            ).shifts,
        },
      })
    }
  >
    <option value="daily">Daily</option>
    <option value="weekly">Specific Days of Week</option>
    <option value="monthly">Specific Days of Month</option>
  </select>
</div>

{profileSite.shift_rules?.schedule_mode === "weekly" && (
  <div className="settings-field">
    <span>Days of Week</span>

    <input
      placeholder="Mon,Tue,Wed,Thu,Fri"
      value={
        profileSite.shift_rules?.days_of_week?.join(",") || ""
      }
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          shift_rules: {
            ...profileSite.shift_rules,
            days_of_week: e.target.value
              .split(",")
              .map((d) => d.trim()),
          },
        })
      }
    />
  </div>
)}

{profileSite.shift_rules?.schedule_mode === "monthly" && (
  <div className="settings-field">
    <span>Days of Month</span>

    <input
      placeholder="1,5,10,15,20"
      value={
        profileSite.shift_rules?.days_of_month?.join(",") || ""
      }
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          shift_rules: {
            ...profileSite.shift_rules,
            days_of_month: e.target.value
              .split(",")
              .map((d) => d.trim()),
          },
        })
      }
    />
  </div>
)}

<div className="settings-field">
  <span>Shift Rules</span>

  {(profileSite.shift_rules?.shifts ||
    createDefaultShiftRules(profileSite.required_shifts || 1).shifts
  ).map((shift, index) => (
    <div
      key={index}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <input
        value={shift.name}
        onChange={(e) => {
          const updated = [...(profileSite.shift_rules?.shifts || [])];

          updated[index] = {
            ...updated[index],
            name: e.target.value,
          };

          setProfileSite({
            ...profileSite,
            shift_rules: {
              ...profileSite.shift_rules,
              shifts: updated,
            },
          });
        }}
      />

      <input
        type="time"
        value={shift.start}
        onChange={(e) => {
          const updated = [...(profileSite.shift_rules?.shifts || [])];

          updated[index] = {
            ...updated[index],
            start: e.target.value,
          };

          setProfileSite({
            ...profileSite,
            shift_rules: {
              ...profileSite.shift_rules,
              shifts: updated,
            },
          });
        }}
      />

      <input
        type="time"
        value={shift.end}
        onChange={(e) => {
          const updated = [...(profileSite.shift_rules?.shifts || [])];

          updated[index] = {
            ...updated[index],
            end: e.target.value,
          };

          setProfileSite({
            ...profileSite,
            shift_rules: {
              ...profileSite.shift_rules,
              shifts: updated,
            },
          });
        }}
      />

      <button
        type="button"
        onClick={() => {
          const updated =
            profileSite.shift_rules.shifts.filter(
              (_, i) => i !== index
            );

          setProfileSite({
            ...profileSite,
            shift_rules: {
              ...profileSite.shift_rules,
              shifts: updated,
            },
          });
        }}
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    className="secondary-button"
    onClick={() => {
      const current =
        profileSite.shift_rules?.shifts || [];

      setProfileSite({
        ...profileSite,
        shift_rules: {
          ...profileSite.shift_rules,
          shifts: [
            ...current,
            {
              name: `Shift ${current.length + 1}`,
              start: "",
              end: "",
            },
          ],
        },
      });
    }}
  >
    Add Shift
  </button>
</div>

      <h4>Residence Contact</h4>

      <input
        placeholder="Contact name"
        value={profileSite.residence_contact_name || ""}
        onChange={(e) =>
          setProfileSite({
            ...profileSite,
            residence_contact_name: e.target.value,
          })
        }
      />

      <input
        placeholder="Contact phone"
        value={profileSite.residence_contact_phone || ""}
        onChange={(e) =>
          setProfileSite({
            ...profileSite,
            residence_contact_phone: e.target.value,
          })
        }
      />

      <h4>Supervisor Contact</h4>

      <input
        placeholder="Supervisor name"
        value={profileSite.supervisor_contact_name || ""}
        onChange={(e) =>
          setProfileSite({
            ...profileSite,
            supervisor_contact_name: e.target.value,
          })
        }
      />

      <input
        placeholder="Supervisor phone"
        value={profileSite.supervisor_contact_phone || ""}
        onChange={(e) =>
          setProfileSite({
            ...profileSite,
            supervisor_contact_phone: e.target.value,
          })
        }
      />

      <h4>Operational Notes</h4>

<label className="settings-field">
  <span>General Notes</span>

  <textarea
    rows="3"
    value={profileSite.general_notes || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        general_notes: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Access Instructions</span>

  <textarea
    rows="3"
    value={profileSite.access_instructions || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        access_instructions: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Patrol Instructions</span>

  <textarea
    rows="3"
    value={profileSite.patrol_instructions || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        patrol_instructions: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Emergency Instructions</span>

  <textarea
    rows="3"
    value={profileSite.emergency_instructions || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        emergency_instructions: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Special Warnings</span>

  <textarea
    rows="3"
    value={profileSite.special_warnings || ""}
    onChange={(e) =>
      setProfileSite({
        ...profileSite,
        special_warnings: e.target.value,
      })
    }
  />
</label>

<h4>SOP Documentation</h4>

<div className="sop-panel">
  <label className="settings-field">
    <span>SOP Title</span>
    <input
      placeholder="Standard Operating Procedure"
      value={profileSite.sop_title || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          sop_title: e.target.value,
        })
      }
    />
  </label>

  <label className="settings-field">
    <span>SOP Version</span>
    <input
      placeholder="v1.0"
      value={profileSite.sop_version || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          sop_version: e.target.value,
        })
      }
    />
  </label>

  <label className="settings-field">
    <span>SOP Text</span>
    <textarea
      rows="5"
      value={profileSite.sop_text || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          sop_text: e.target.value,
        })
      }
    />
  </label>

  <div className="sop-current-file">
    <span>Current SOP File</span>

    {profileSite.sop_file_url ? (
      <div className="sop-actions-row">
        <button
          type="button"
          className="secondary-button"
          onClick={() => window.open(profileSite.sop_file_url, "_blank")}
        >
          View SOP
        </button>

        <a
          className="secondary-button"
          href={profileSite.sop_file_url}
          target="_blank"
          rel="noreferrer"
          download
        >
          Download PDF
        </a>
      </div>
    ) : (
      <small>No SOP PDF uploaded</small>
    )}
  </div>

  <label className="settings-field">
    <span>Replace SOP PDF</span>

    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => {
        setSopFile(e.target.files?.[0] || null);
      }}
    />
  </label>

  {sopFile && (
    <button
      type="button"
      className="secondary-button"
      disabled={isUploadingSop}
      onClick={uploadSopFile}
    >
      {isUploadingSop ? "Uploading..." : "Upload Selected PDF"}
    </button>
  )}
</div>

<h4>Additional Site Documents</h4>

<div className="sop-panel">
  <label className="settings-field">
    <span>Document 1 Title</span>

    <input
      placeholder="e.g. Guarding Contract"
      value={profileSite.document_1_title || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          document_1_title: e.target.value,
        })
      }
    />
  </label>

  <div className="sop-current-file">
    <span>Document 1 File</span>

    {profileSite.document_1_url ? (
      <div className="sop-actions-row">
        <button
          type="button"
          className="secondary-button"
          onClick={() => window.open(profileSite.document_1_url, "_blank")}
        >
          View
        </button>

        <a
          className="secondary-button"
          href={profileSite.document_1_url}
          target="_blank"
          rel="noreferrer"
          download
        >
          Download
        </a>
      </div>
    ) : (
      <small>No document uploaded</small>
    )}
  </div>

  <label className="settings-field">
    <span>Replace Document 1 PDF</span>

    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => {
        setDocument1File(e.target.files?.[0] || null);
      }}
    />
  </label>

  {document1File && (
    <button
      type="button"
      className="secondary-button"
      disabled={isUploadingDocument1}
      onClick={() => uploadSiteDocument(1, document1File)}
    >
      {isUploadingDocument1 ? "Uploading..." : "Upload Document 1"}
    </button>
  )}

  <hr />

  <label className="settings-field">
    <span>Document 2 Title</span>

    <input
      placeholder="e.g. Emergency Plan"
      value={profileSite.document_2_title || ""}
      onChange={(e) =>
        setProfileSite({
          ...profileSite,
          document_2_title: e.target.value,
        })
      }
    />
  </label>

  <div className="sop-current-file">
    <span>Document 2 File</span>

    {profileSite.document_2_url ? (
      <div className="sop-actions-row">
        <button
          type="button"
          className="secondary-button"
          onClick={() => window.open(profileSite.document_2_url, "_blank")}
        >
          View
        </button>

        <a
          className="secondary-button"
          href={profileSite.document_2_url}
          target="_blank"
          rel="noreferrer"
          download
        >
          Download
        </a>
      </div>
    ) : (
      <small>No document uploaded</small>
    )}
  </div>

  <label className="settings-field">
    <span>Replace Document 2 PDF</span>

    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => {
        setDocument2File(e.target.files?.[0] || null);
      }}
    />
  </label>

  {document2File && (
    <button
      type="button"
      className="secondary-button"
      disabled={isUploadingDocument2}
      onClick={() => uploadSiteDocument(2, document2File)}
    >
      {isUploadingDocument2 ? "Uploading..." : "Upload Document 2"}
    </button>
  )}
</div>

<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap",
  }}
>
  <button onClick={updateSiteProfile}>
    Save Profile
  </button>

  <button
    type="button"
    onClick={() => printSiteProfile(profileSite)}
  >
    Print Profile
  </button>

  <button
    className="secondary-button"
    onClick={() => setProfileSite(null)}
  >
    Cancel
  </button>
</div>
    </div>
  </div>
)}

{profileGuard && (
  <div className="modal-overlay">
    <div className="recipients-modal">
      <div className="modal-header">
        <h3>Guard Profile</h3>

        <button
          className="modal-close"
          onClick={() => setProfileGuard(null)}
        >
          ×
        </button>
      </div>

      <h4>Basic Information</h4>

      <label className="settings-field">
        <span>Full Name</span>
        <input
          value={profileGuard.full_name || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              full_name: e.target.value,
            })
          }
        />
      </label>

      <label className="settings-field">
        <span>Username</span>
        <input
          value={profileGuard.username || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              username: e.target.value,
            })
          }
        />
      </label>

      <label className="settings-field">
        <span>Mobile Phone</span>
        <input
          value={profileGuard.mobile_phone || profileGuard.phone || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              mobile_phone: e.target.value,
              phone: e.target.value,
            })
          }
        />
      </label>

      <label className="settings-field">
        <span>Landline Phone</span>
        <input
          value={profileGuard.landline_phone || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              landline_phone: e.target.value,
            })
          }
        />
      </label>

      <label className="settings-field">
        <span>Tax ID / ΑΦΜ</span>
        <input
          value={profileGuard.tax_id || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              tax_id: e.target.value,
            })
          }
        />
      </label>

      <label className="settings-field">
        <span>Home Address</span>
        <input
          value={profileGuard.home_address || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              home_address: e.target.value,
            })
          }
        />
      </label>

      <h4>Assignment</h4>

      <label className="settings-field">
        <span>Assigned Site</span>

        <select
          value={profileGuard.site_id || "trial"}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              site_id: e.target.value === "trial" ? null : e.target.value,
              assignment_status:
                e.target.value === "trial" ? "trial" : "assigned",
            })
          }
        >
          <option value="trial">Trial / Unassigned</option>

          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </label>

      <h4>Training & Experience</h4>

      <label className="settings-field">
        <span>Education Level</span>

        <select
          value={profileGuard.education_level || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              education_level: e.target.value,
            })
          }
        >
          <option value="">Select education</option>
          <option value="secondary">Secondary Education</option>
          <option value="tertiary">Tertiary Education</option>
        </select>
      </label>

      <label className="settings-field">
        <span>Foreign Languages</span>
        <input
          placeholder="English, German, French..."
          value={profileGuard.foreign_languages || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              foreign_languages: e.target.value,
            })
          }
        />
      </label>

      <label className="settings-field">
        <span>Security Experience</span>

        <select
          value={profileGuard.security_experience_range || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              security_experience_range: e.target.value,
            })
          }
        >
          <option value="">Select experience</option>
          <option value="1-2">1–2 years</option>
          <option value="2-5">2–5 years</option>
          <option value="5-8">5–8 years</option>
          <option value="9-13">9–13 years</option>
          <option value="14-18">14–18 years</option>
          <option value="18+">18+ years</option>
        </select>
      </label>

      <label className="settings-field">
        <span>Guard Notes</span>
        <textarea
          rows="4"
          value={profileGuard.guard_notes || ""}
          onChange={(e) =>
            setProfileGuard({
              ...profileGuard,
              guard_notes: e.target.value,
            })
          }
        />
      </label>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
  type="button"
  onClick={saveGuardProfile}
>
  Save Guard Profile
</button>

{guardProfileSaveStatus && (
  <div className="profile-save-status">
    {guardProfileSaveStatus}
  </div>
)}

        <button
  type="button"
  onClick={() => printGuardProfile(profileGuard)}
>
  Print Guard Profile
</button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => setProfileGuard(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{patrolSite && (
  <div className="modal-overlay">
    <div className="recipients-modal">
      <div className="modal-header">
        <h3>Patrol Points V1.2</h3>

        <button
          className="modal-close"
          onClick={() => setPatrolSite(null)}
        >
          ×
        </button>
      </div>

      <p>
        SITE-{String(patrolSite.id).padStart(3, "0")} | {patrolSite.name}
      </p>

      <hr />

      <div style={{ marginBottom: "16px" }}>
  <strong>
    SITE-{String(patrolSite.id).padStart(3, "0")}
  </strong>
</div>

<div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  }}
>
  <button
  className={`patrol-tab ${activePatrolTab === "points" ? "active" : ""}`}
  onClick={() => setActivePatrolTab("points")}
>
  Patrol Points
</button>

<button
  className={`patrol-tab ${activePatrolTab === "schedule" ? "active" : ""}`}
  onClick={() => setActivePatrolTab("schedule")}
>
  Patrol Schedule
</button>

<button
  className={`patrol-tab ${activePatrolTab === "qr" ? "active" : ""}`}
  onClick={() => setActivePatrolTab("qr")}
>
  QR Codes
</button>
</div>

<div
  style={{
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px"
  }}
>
  {activePatrolTab === "points" && (
  <>
    <p>
  <strong>Total Points:</strong> {patrolPoints.length}
</p>

<label className="settings-field">
  <span>Point Name</span>
  <input
    placeholder="Main Gate"
    value={newPatrolPoint.point_name}
    onChange={(e) =>
      setNewPatrolPoint({
        ...newPatrolPoint,
        point_name: e.target.value,
      })
    }
  />
</label>

<label className="settings-field">
  <span>Description</span>
  <input
    placeholder="North entrance / garage / perimeter"
    value={newPatrolPoint.point_description}
    onChange={(e) =>
      setNewPatrolPoint({
        ...newPatrolPoint,
        point_description: e.target.value,
      })
    }
  />
</label>

<button
  className="primary-button"
  onClick={addPatrolPoint}
>
  Save Patrol Point
</button>

<div style={{ marginTop: "16px" }}>
  {patrolPoints.length === 0 ? (
    <div>No patrol points configured.</div>
  ) : (
    patrolPoints.map((point, index) => (
      <div
        key={point.id}
        className="settings-item"
        style={{ marginTop: "10px" }}
      >
        <span>
  <strong>
    PT-{String(index + 1).padStart(3, "0")} | {point.point_name}
  </strong>
  <br />
  <small>{point.point_description || "No description"}</small>  
</span>

<button
  type="button"
  className="patrol-point-action danger"
  onClick={async () => {
    await fetch(
      `${API_BASE_URL}/settings/patrol-points/${point.id}/deactivate`,
      { method: "PUT" }
    );

    await loadPatrolPoints(patrolSite.id);
    await loadManualPatrolHistory(patrolSite.id);
  }}
>
  Deactivate
</button>
      </div>
    ))
  )}
</div>
  </>
)}

{activePatrolTab === "schedule" && (
  <>
    <p><strong>Patrol Schedule V1.3</strong></p>

    <div className="patrol-schedule-box">
      <h4>Recurring Patrol</h4>
      {activeRecurringSchedule && (
  <div
    style={{
      padding: "12px",
      borderRadius: "12px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      marginBottom: "14px",
      fontSize: "13px",
      color: "#9ca3af",
    }}
  >
    <div>
      <strong style={{ color: "#f9fafb" }}>Current Active Schedule</strong>
    </div>

    <div style={{ marginTop: "6px" }}>
      Start Time: {activeRecurringSchedule.start_time || "-"}
    </div>

    <div>
      Every:{" "}
      {activeRecurringSchedule.interval_hours
        ? `${activeRecurringSchedule.interval_hours} hour${
            Number(activeRecurringSchedule.interval_hours) === 1 ? "" : "s"
          }`
        : "-"}
    </div>

    <div>
      Reminder:{" "}
      {activeRecurringSchedule.reminder_minutes_before
        ? `${activeRecurringSchedule.reminder_minutes_before} minutes before`
        : "-"}
    </div>

    <div style={{ marginTop: "8px" }}>
      Last Updated By: {activeRecurringSchedule.created_by_username || "-"}
    </div>

    <div>
      Role: {activeRecurringSchedule.created_by_role || "-"}
    </div>

    <div>
      Updated At:{" "}
      {activeRecurringSchedule.created_at
        ? new Date(
  activeRecurringSchedule.created_at.replace("Z", "")
).toLocaleString("el-GR")
        : "-"}
    </div>
  </div>
)}

      <label className="settings-field">
  <span>Schedule Scope</span>

  <select
    value={patrolScheduleScope}
    onChange={(e) => setPatrolScheduleScope(e.target.value)}
  >
    <option value="24_7">24/7 Patrol</option>
    <option value="custom">Custom Days & Hours</option>
  </select>
</label>

<label className="settings-field">
  <span>Start Time</span>

  <input
    type="time"
    value={patrolStartTime}
    onChange={(e) => setPatrolStartTime(e.target.value)}
  />
</label>

<label className="settings-field">
  <span>Every</span>
  <select
  value={patrolIntervalHours}
  onChange={(e) => setPatrolIntervalHours(e.target.value)}
>
    <option value="1">Every 1 hour</option>
    <option value="2">Every 2 hours</option>
    <option value="3">Every 3 hours</option>
    <option value="4">Every 4 hours</option>
  </select>
</label>

{patrolScheduleScope === "custom" && (
  <>
    <div className="patrol-days-box">
      <strong>Custom Days</strong>

      <div className="patrol-days-grid">
        <label><input type="checkbox" /> Mon</label>
        <label><input type="checkbox" /> Tue</label>
        <label><input type="checkbox" /> Wed</label>
        <label><input type="checkbox" /> Thu</label>
        <label><input type="checkbox" /> Fri</label>
        <label><input type="checkbox" /> Sat</label>
        <label><input type="checkbox" /> Sun</label>
      </div>
    </div>

    <label className="settings-field">
      <span>Start Time</span>
      <input type="time" />
    </label>

    <label className="settings-field">
      <span>End Time</span>
      <input type="time" />
    </label>
  </>
)}

<label className="settings-field">
  <span>Reminder</span>
  <select
  value={patrolReminderMinutes}
  onChange={(e) => setPatrolReminderMinutes(e.target.value)}
>
    <option value="5">5 minutes before</option>
    <option value="10">10 minutes before</option>
    <option value="15">15 minutes before</option>
  </select>
</label>

<button
  type="button"
  className="primary-button"
  onClick={saveRecurringPatrolSchedule}
>
  Save Recurring Schedule
</button>

{patrolScheduleSaveStatus && (
  <div className="profile-save-status">
    {patrolScheduleSaveStatus}
  </div>
)}
    </div>

    <div className="patrol-schedule-box">
      <h4>Manual Patrol</h4>

      <label className="settings-field">
        <span>Date</span>
        <input
  type="date"
  value={manualPatrolDate}
  onChange={(e) => setManualPatrolDate(e.target.value)}
/>
      </label>

      <label className="settings-field">
        <span>Time</span>
        <input
  type="time"
  value={manualPatrolTime}
  onChange={(e) => setManualPatrolTime(e.target.value)}
/>
      </label>

      <button
  type="button"
  className="secondary-button"
  onClick={addManualPatrolSchedule}
>
  Add Manual Patrol
</button>

{manualPatrolSaveStatus && (
  <div className="profile-save-status">
    {manualPatrolSaveStatus}
  </div>
)}

<div style={{ marginTop: "22px" }}>
  <h4>Manual Patrol History</h4>

  {manualPatrolHistory.length === 0 ? (
    <div className="patrol-empty-state">
      No manual patrols found.
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gap: "10px",
        marginTop: "12px",
      }}
    >
      {manualPatrolHistory.slice(0, 6).map((item) => (
        <div
          key={item.id}
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <strong>{item.point_name || "Patrol Point"}</strong>

          <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "6px" }}>
  Scheduled:{" "}
  {item.scheduled_date && item.scheduled_time
    ? `${new Date(item.scheduled_date).toLocaleDateString("el-GR")}, ${item.scheduled_time}`
    : "-"}
</div>

          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            Created By: {item.created_by_username || "-"}
          </div>

          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            Created At:{" "}
            {item.created_at
              ? new Date(item.created_at).toLocaleString("el-GR", {
                  timeZone: "Europe/Athens",
                })
              : "-"}
          </div>

          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            Status: {item.computed_status || item.manual_status || "-"}
          </div>

          {item.computed_status === "pending" && (
  <button
    type="button"
    className="secondary-button danger-button"
    style={{ marginTop: "10px" }}
    onClick={() => cancelManualPatrol(item)}
  >
    Cancel Manual Patrol
  </button>
)}

{item.computed_status === "cancelled" && (
  <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "6px" }}>
    Cancelled By: {item.cancelled_by_username || "-"}
  </div>
)}
        </div>
      ))}
    </div>
  )}
</div>

      </div>
  </>
)}

{activePatrolTab === "qr" && (
  <>
    <p><strong>QR Codes V1.5</strong></p>

    {patrolPoints.length === 0 ? (
      <div>No patrol points configured.</div>
    ) : (
      patrolPoints.map((point, index) => (
        <div
          key={point.id}
          className="settings-item"
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>
              PT-{String(index + 1).padStart(3, "0")} | {point.point_name}
            </strong>

            <br />

            <small>
              {point.qr_token
                ? point.qr_token
                : "QR Not Generated"}
            </small>
          </div>

          <button
            className="primary-button"
            onClick={async () => {
              try {
                await fetch(
                  `${API_BASE_URL}/settings/patrol-points/${point.id}/generate-qr`,
                  {
                    method: "POST",
                  }
                );

                await loadPatrolPoints(patrolSite.id);
              } catch (err) {
                console.error("Generate QR error", err);
              }
            }}
          >
            {point.qr_token
              ? "Regenerate QR"
              : "Generate QR"}
          </button>
        </div>
      ))
    )}
  </>
)}
</div>

<div style={{ marginTop: "20px" }}>
  <button
    className="secondary-button"
    onClick={() => setPatrolSite(null)}
  >
    Close
  </button>
</div>
    </div>
  </div>
)}

    </>
  );
}

export default Settings;