import Patrols from "./pages/Patrols";
import ShiftReports from "./pages/ShiftReports";
import { APP_VERSION, APP_BUILD } from "./config/version";
import aegisLogo from "./assets/aegis-logo.png";
import reportLogoDataUrl from "./assets/aegis-logo.png?inline";
import { createIncidentReportHtml } from "./utils/incidentReportHtml.js";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import SiteCard from "./components/SiteCard";
import GuardStatus from "./components/GuardStatus";
import IncidentCard from "./components/IncidentCard";
import Guards from "./pages/Guards";
import Sites from "./pages/Sites";
import EventLogs from "./pages/EventLogs";
import Settings from "./pages/Settings";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import Analytics from "./pages/Analytics";
import Companies from "./pages/Companies";
import DemoGuidance from "./components/DemoGuidance";
import { formatDateTime } from "./utils/dateTime";
import { formatHealthTime, hasCurrentHealthError } from "./utils/systemStatus";
import { API_BASE_URL } from "./config/api";
import {
  PASSWORD_CHANGE_REQUIRED_CODE,
  buildPasswordChangedSession,
  buildRestrictedPasswordSession,
} from "./utils/passwordChangeSession";
import {
  canAccessDashboardMenu,
  getDashboardSessionToken,
  getDashboardPollingCapabilities,
  getPermittedDashboardMenus,
  hasDashboardPermission,
  hydrateDashboardSession,
  readDashboardSession,
} from "./utils/dashboardAuth";
import {
  classifyAuthenticatedFailure,
} from "./utils/authenticatedResponse";

const STATUS_LABELS = {
  operational: "Operational",
  degraded: "Degraded",
  offline: "Offline",
  unknown: "Unknown",
  not_configured: "Not configured",
};

function SystemStatusCard({ item }) {
  const status = item?.status || "unknown";
  const details = [
    typeof item?.configured === "boolean" && ["Configured", item.configured ? "Yes" : "No"],
    item?.last_checked_at && ["Last checked", formatHealthTime(item.last_checked_at)],
    item?.last_success_at && ["Last success", formatHealthTime(item.last_success_at)],
    item?.last_failure_at && ["Last failure", formatHealthTime(item.last_failure_at)],
    (item?.last_failure_reason || item?.last_error) && [
      "Last failure reason",
      item.last_failure_reason || item.last_error,
    ],
    item?.last_scan_at && ["Last patrol scan", formatHealthTime(item.last_scan_at)],
    item?.last_completion_at && ["Last patrol completion", formatHealthTime(item.last_completion_at)],
    item?.last_missed_patrol_at && ["Last missed patrol", formatHealthTime(item.last_missed_patrol_at)],
    item?.last_incident_at && ["Last incident", formatHealthTime(item.last_incident_at)],
    item?.last_resolved_at && ["Last incident resolved", formatHealthTime(item.last_resolved_at)],
    Number.isFinite(item?.response_time_ms) && ["Response", `${item.response_time_ms} ms`],
    Number.isFinite(item?.active_subscriptions) && ["Active subscriptions", item.active_subscriptions],
    Number.isFinite(item?.active_schedules) && ["Active schedules", item.active_schedules],
    Number.isFinite(item?.active_incidents) && ["Active incidents", item.active_incidents],
    Number.isFinite(item?.missed_last_30_days) && ["Missed (30 days)", item.missed_last_30_days],
    item?.status_message && ["Status note", item.status_message],
  ].filter(Boolean);

  return (
    <article className={`system-status-card status-${status}`}>
      <div className="system-status-card-heading">
        <div>
          <h3>{item?.label || item?.name || "Service"}</h3>
          <p className="system-status-scope">
            {item?.scope === "tenant" ? "Tenant service" : "Shared platform"}
            {item?.severity ? ` · ${item.severity} priority` : ""}
          </p>
        </div>
        <span>{STATUS_LABELS[status] || status}</span>
      </div>

      {details.length > 0 && (
        <dl className="system-status-details">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {hasCurrentHealthError(item) && (
        <p className="system-status-error">{item.current_error}</p>
      )}
    </article>
  );
}

function App() {
  const [startupSession] = useState(() => readDashboardSession());
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [
  temporaryGuardPreviews,
  setTemporaryGuardPreviews,
] = useState([]);
const getSessionToken = () => getDashboardSessionToken(readDashboardSession());

const [currentUser, setCurrentUser] = useState(null);
const [tenantReason, setTenantReason] = useState("");
const [showTenantElevation, setShowTenantElevation] = useState(false);
const [tenantContextBusy, setTenantContextBusy] = useState(false);
const [tenantContextError, setTenantContextError] = useState("");
const [authorizationReady, setAuthorizationReady] = useState(false);
const [authorizationLoading, setAuthorizationLoading] = useState(() =>
  Boolean(startupSession && !startupSession?.user?.must_change_password)
);

const [showPasswordChange, setShowPasswordChange] = useState(() =>
  Boolean(startupSession?.user?.must_change_password)
);
const [passwordChangeUser, setPasswordChangeUser] = useState(() => {
  const stored = startupSession;
  const sessionToken = getDashboardSessionToken(stored);
  return stored?.user?.must_change_password && sessionToken
    ? { ...stored.user, session_token: sessionToken }
    : null;
});

const [passwordChangeForm, setPasswordChangeForm] = useState({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

const [passwordChangeError, setPasswordChangeError] = useState("");
const [isChangingPassword, setIsChangingPassword] = useState(false);

useEffect(() => {
  if (!startupSession || startupSession?.user?.must_change_password) {
    setAuthorizationLoading(false);
    return undefined;
  }

  const token = getDashboardSessionToken(startupSession);
  if (!token) {
    localStorage.removeItem("aegis-current-user");
    setAuthorizationLoading(false);
    return undefined;
  }

  let cancelled = false;
  const restoreAuthorization = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/context`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (cancelled) return;

      if (data?.code === PASSWORD_CHANGE_REQUIRED_CODE) {
        const restricted = buildRestrictedPasswordSession(data, startupSession);
        if (restricted) {
          localStorage.setItem("aegis-current-user", JSON.stringify(restricted.storedSession));
          setPasswordChangeUser(restricted.passwordChangeUser);
          setShowPasswordChange(true);
        }
        return;
      }

      if (!response.ok) {
        localStorage.removeItem("aegis-current-user");
        setLoginError(response.status === 401 ? "Your session has expired. Please sign in again." : "Unable to restore Dashboard authorization.");
        return;
      }

      const hydrated = hydrateDashboardSession(startupSession, data.auth);
      if (!hydrated) throw new Error("Authorization context is incomplete");
      localStorage.setItem("aegis-current-user", JSON.stringify(hydrated));
      setCurrentUser(hydrated);
      setAuthorizationReady(true);
    } catch (error) {
      if (!cancelled) {
        localStorage.removeItem("aegis-current-user");
        setLoginError("Unable to restore Dashboard authorization. Please sign in again.");
      }
    } finally {
      if (!cancelled) setAuthorizationLoading(false);
    }
  };

  restoreAuthorization();
  return () => { cancelled = true; };
}, [startupSession]);

const hasPermission = (permission) =>
  authorizationReady && hasDashboardPermission(currentUser?.user, permission);
const pollingCapabilities = getDashboardPollingCapabilities(
  currentUser?.user,
  authorizationReady
);

const isReadOnlyAccess =
  currentUser?.user?.access_mode === "read_only";
const isTenantReadOnly = Boolean(currentUser?.user?.tenant_context_active &&
  !currentUser?.user?.tenant_context_can_mutate);

const transitionTenant = async (action, body = null) => {
  setTenantContextBusy(true);
  setTenantContextError("");
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tenant-context/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getDashboardSessionToken(currentUser)}` },
      body: body ? JSON.stringify(body) : "{}",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.code || "Context change failed");
    localStorage.setItem("aegis-active-menu", action === "exit" ? "Companies" : "Dashboard");
    setAuthorizationReady(false);
    setCurrentUser(null);
    window.location.reload();
  } catch (error) {
    setTenantContextError(error.message);
    setTenantContextBusy(false);
  }
};

const tenantEntered = () => {
  localStorage.setItem("aegis-active-menu", "Dashboard");
  setAuthorizationReady(false);
  setCurrentUser(null);
  window.location.reload();
};

const readOnlyExpiresAt =
  currentUser?.user?.access_expires_at || null;

const [readOnlyNotice, setReadOnlyNotice] =
  useState("");

  useEffect(() => {
  const originalFetch = window.fetch;

  const safeMethods = new Set([
    "GET",
    "HEAD",
    "OPTIONS",
  ]);

  const allowedMutationPaths = new Set([
    "/admin/heartbeat",
    "/admin/logout",
    "/admin/tenant-context/elevate",
    "/admin/tenant-context/exit",
  ]);

  window.fetch = async (input, init = {}) => {
    const requestMethod = (
      init.method ||
      (
        input instanceof Request
          ? input.method
          : "GET"
      )
    ).toUpperCase();

    const requestUrl =
      input instanceof Request
        ? input.url
        : String(input);

    const requestPath = new URL(
      requestUrl,
      window.location.origin
    ).pathname;

    if (
      (isReadOnlyAccess || isTenantReadOnly) &&
      !safeMethods.has(requestMethod) &&
      !allowedMutationPaths.has(requestPath)
    ) {
      setReadOnlyNotice(
        isTenantReadOnly ? "Tenant access is read-only." : "Read-only preview: changes are disabled."
      );

      window.setTimeout(() => {
        setReadOnlyNotice("");
      }, 3000);

      return new Response(
        JSON.stringify({
          status: "error",
          code: isTenantReadOnly ? "TENANT_CONTEXT_READ_ONLY" : "READ_ONLY_ACCESS",
          message:
            isTenantReadOnly ? "Tenant access is read-only" : "This temporary account has read-only access",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = await originalFetch.call(
      window,
      input,
      init
    );

  if (
  response.status === 401 ||
  response.status === 403
) {
  const responseData = await response
    .clone()
    .json()
    .catch(() => null);

  const authFailure = classifyAuthenticatedFailure({
    status: response.status,
    code: responseData?.code,
    requestPath,
  });

  if (
    responseData?.code === PASSWORD_CHANGE_REQUIRED_CODE &&
    authFailure === "password_change_required"
  ) {
    const storedSession = readDashboardSession();
    const restricted = buildRestrictedPasswordSession(
      responseData,
      storedSession
    );

    if (restricted) {
      localStorage.setItem(
        "aegis-current-user",
        JSON.stringify(restricted.storedSession)
      );
      setPasswordChangeUser(restricted.passwordChangeUser);
      setPasswordChangeForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordChangeError("");
      setShowPasswordChange(true);
      setCurrentUser(null);
      setAuthorizationReady(false);
    }
  } else if (authFailure === "session_invalid") {
    localStorage.removeItem("aegis-current-user");
    setCurrentUser(null);
    setAuthorizationReady(false);
    setShowPasswordChange(false);
    setPasswordChangeUser(null);
    setLoginError(
      "Your Dashboard session is no longer active. Please sign in again."
    );
  } else if (
    isReadOnlyAccess &&
    (
    response.status === 401 ||
    responseData?.code ===
      "TEMPORARY_ACCESS_EXPIRED"
    )
  ) {
    localStorage.removeItem(
      "aegis-current-user"
    );

    setCurrentUser(null);
    setAuthorizationReady(false);

    setLoginError(
      responseData?.code ===
        "TEMPORARY_ACCESS_EXPIRED"
        ? "Temporary access has expired."
        : "Temporary access is no longer active."
    );
  }
}

    return response;
  };

  return () => {
    window.fetch = originalFetch;
  };
}, [isReadOnlyAccess, isTenantReadOnly]);

useEffect(() => {
  if (
    !isReadOnlyAccess ||
    !readOnlyExpiresAt
  ) {
    return undefined;
  }

  const expiryTime =
    new Date(readOnlyExpiresAt).getTime();

  if (!Number.isFinite(expiryTime)) {
    return undefined;
  }

  const remainingMs =
    expiryTime - Date.now();

  const expireLocalSession = () => {
    localStorage.removeItem(
      "aegis-current-user"
    );

    setCurrentUser(null);
    setAuthorizationReady(false);

    setLoginError(
      "Temporary access has expired."
    );
  };

  if (remainingMs <= 0) {
    expireLocalSession();
    return undefined;
  }

  const timer = window.setTimeout(
    expireLocalSession,
    remainingMs
  );

  return () => {
    window.clearTimeout(timer);
  };
}, [
  isReadOnlyAccess,
  readOnlyExpiresAt,
]);

const [loginForm, setLoginForm] = useState({
  username: "",
  password: "",
});

const [loginError, setLoginError] = useState("");
const [isLoggingIn, setIsLoggingIn] = useState(false);
const [showLoginPassword, setShowLoginPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [recentAlerts, setRecentAlerts] = useState([]);
const [recentAlertsCheckedAt, setRecentAlertsCheckedAt] = useState(null);

useEffect(() => {
  if (!currentUser || !pollingCapabilities.auditLogs) {
    setRecentAlerts([]);
    return undefined;
  }
  const loadRecentAlerts = async () => {
    try {
const sessionToken = getDashboardSessionToken(currentUser);

const response = await fetch(
  `${API_BASE_URL}/event-logs`,
  {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  }
);

      const data = await response.json();

      if (data.status === "ok") {
  setRecentAlerts(data.logs);
  setRecentAlertsCheckedAt(new Date());
}
    } catch (err) {
      console.error("Recent alert activity error:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
    }
    };

loadRecentAlerts();

const interval = setInterval(() => {
  loadRecentAlerts();
}, 5000);

return () => clearInterval(interval);
}, [currentUser, authorizationReady]);

  
const handleLogin = async (event) => {
  event.preventDefault();
  setLoginError("");
  setIsLoggingIn(true);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
},
      body: JSON.stringify(loginForm),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.user?.must_change_password) {
  const sessionToken = data.session?.token;

  if (!sessionToken) {
    throw new Error("Login session token was not returned");
  }

  const restrictedLoginData = {
    ...data,
    session_token: sessionToken,
    session: {
      ...(data.session || {}),
      token: sessionToken,
    },
    user: {
      ...data.user,
      must_change_password: true,
    },
  };

  localStorage.setItem(
    "aegis-current-user",
    JSON.stringify(restrictedLoginData)
  );

  setPasswordChangeUser({
    ...restrictedLoginData.user,
    session_token: sessionToken,
  });

  setShowPasswordChange(true);
  setAuthorizationReady(false);

  setPasswordChangeForm({
    current_password: loginForm.password,
    new_password: "",
    confirm_password: "",
  });

  return;
}

    const loginData = hydrateDashboardSession(
      { ...data, session_token: data.session?.token },
      data.user
    );

if (!loginData) {
  throw new Error("Login authorization context is incomplete");
}

localStorage.setItem(
  "aegis-current-user",
  JSON.stringify(loginData)
);

localStorage.setItem("aegis-active-menu", "Dashboard");
setActiveMenu("Dashboard");
setCurrentUser(loginData);
setAuthorizationReady(true);
  } catch (error) {
    setLoginError(error.message || "Invalid username or password");
  } finally {
    setIsLoggingIn(false);
  }
};

const handlePasswordChange = async (event) => {
  event.preventDefault();
  setPasswordChangeError("");

  if (!passwordChangeUser?.id) {
    setPasswordChangeError("User session not found. Please login again.");
    return;
  }

  if (
    !passwordChangeForm.new_password ||
    !passwordChangeForm.confirm_password
  ) {
    setPasswordChangeError("Please enter and confirm your new password.");
    return;
  }

  if (
    passwordChangeForm.new_password !==
    passwordChangeForm.confirm_password
  ) {
    setPasswordChangeError("New passwords do not match.");
    return;
  }

  if (passwordChangeForm.new_password.length < 8) {
    setPasswordChangeError(
      "New password must be at least 8 characters."
    );
    return;
  }

  setIsChangingPassword(true);

  try {
    const storedUser = readDashboardSession();

    const sessionToken =
      passwordChangeUser?.session_token ||
      getDashboardSessionToken(storedUser);

    if (!sessionToken) {
      throw new Error("Authentication session is missing");
    }

    const response = await fetch(
      `${API_BASE_URL}/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          current_password:
            passwordChangeForm.current_password,
          new_password:
            passwordChangeForm.new_password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Password change failed"
      );
    }

    let contextResponse;
    let contextData;
    try {
      contextResponse = await fetch(`${API_BASE_URL}/auth/context`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      contextData = await contextResponse.json().catch(() => ({}));
    } catch {
      localStorage.removeItem("aegis-current-user");
      setCurrentUser(null);
      setAuthorizationReady(false);
      setShowPasswordChange(false);
      setPasswordChangeUser(null);
      setLoginError(
        "Password changed successfully. Please sign in again using your new password."
      );
      return;
    }

    if (!contextResponse.ok) {
      localStorage.removeItem("aegis-current-user");
      setCurrentUser(null);
      setAuthorizationReady(false);
      setShowPasswordChange(false);
      setPasswordChangeUser(null);
      setLoginError(
        "Password changed successfully. Please sign in again using your new password."
      );
      return;
    }

    const loginData = buildPasswordChangedSession(
      storedUser,
      contextData.auth
    );

    if (!loginData) {
      localStorage.removeItem("aegis-current-user");
      setCurrentUser(null);
      setAuthorizationReady(false);
      setShowPasswordChange(false);
      setPasswordChangeUser(null);
      setLoginError(
        "Password changed successfully. Please sign in again using your new password."
      );
      return;
    }

    localStorage.setItem(
      "aegis-current-user",
      JSON.stringify(loginData)
    );

    localStorage.setItem("aegis-active-menu", "Dashboard");
    setActiveMenu("Dashboard");
    setCurrentUser(loginData);
    setAuthorizationReady(true);

    setShowPasswordChange(false);
    setPasswordChangeUser(null);

    setPasswordChangeForm({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
  } catch (error) {
    setPasswordChangeError(
      error.message || "Password change failed"
    );
  } finally {
    setIsChangingPassword(false);
  }
};

const [dashboardMetrics, setDashboardMetrics] = useState({
  activeIncidents: 0,
  alertsToday: 0,
  responseTime: "0s",
  guardsOnDuty: 0,
});

const [liveSites, setLiveSites] = useState([]);

const [incidentTimeline, setIncidentTimeline] = useState({
  status: "normal",
  location: "Normal",
  alertTime: null,
  alertStatus: "normal",
  callStatus: "normal",
  smsStatus: "normal",
  incidentStatus: "normal",
  duration: null,
});

const handleLogout = async () => {
  const sessionToken =
    getDashboardSessionToken(currentUser) ||
    getDashboardSessionToken(readDashboardSession());

  try {
    if (sessionToken) {
      const response = await fetch(
        `${API_BASE_URL}/admin/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        console.error("Logout tracking failed:");
      }
    }
  } catch (err) {
    console.error("Logout tracking failed", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
  } finally {
    localStorage.removeItem("aegis-current-user");
    localStorage.setItem("aegis-active-menu", "Dashboard");
    setActiveMenu("Dashboard");
    setCurrentUser(null);
    setAuthorizationReady(false);
  }
};
  const [activeMenu, setActiveMenu] = useState(() => {
  return localStorage.getItem("aegis-active-menu") || "Dashboard";
});
const sidebarMenuRef = useRef(null);
const [liveActiveGuards, setLiveActiveGuards] = useState([]);
  const [unreadShiftReports, setUnreadShiftReports] = useState(0);
  const [incidentFilter, setIncidentFilter] = useState("All");
  const [resolutionForms, setResolutionForms] = useState({});
  const [guardQuestionnaireResponses, setGuardQuestionnaireResponses] = useState({});
const menuItems = authorizationReady
  ? getPermittedDashboardMenus(currentUser?.user)
  : [];
const canRenderMenu = (menu) =>
  authorizationReady && canAccessDashboardMenu(currentUser?.user, menu);

useEffect(() => {
  if (!authorizationReady || !currentUser || menuItems.length === 0) return;
  if (!menuItems.includes(activeMenu)) setActiveMenu(menuItems[0]);
}, [authorizationReady, currentUser, activeMenu, menuItems.join("|")]);

useEffect(() => {
  if (
    !authorizationReady ||
    !currentUser ||
    !activeMenu ||
    !window.matchMedia("(max-width: 768px)").matches
  ) return;

  const menu = sidebarMenuRef.current;
  const activeItem = menu?.querySelector(".sidebar-item.active");
  if (!menu || !activeItem) return;

  const menuRect = menu.getBoundingClientRect();
  const activeRect = activeItem.getBoundingClientRect();
  const targetLeft = menu.scrollLeft + activeRect.left - menuRect.left - menu.clientLeft -
    (menu.clientWidth - activeRect.width) / 2;
  menu.scrollTo({ left: Math.max(0, targetLeft), behavior: "auto" });
}, [activeMenu, authorizationReady, currentUser]);

  useEffect(() => {
    if (!currentUser || !pollingCapabilities.shiftReports) return undefined;
    const loadUnreadShiftReports = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/shift-reports/unread-count`, {
          headers: { Authorization: `Bearer ${getSessionToken() || ""}` },
        });
        const data = await response.json();
        if (response.ok) setUnreadShiftReports(data.unread || 0);
      } catch (error) {
        console.error("Shift Report badge refresh failed:", {code: /^[0-9A-Z]{5}$/.test(error?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(error?.code) ? error.code : 'INTERNAL'});
      }
    };
    loadUnreadShiftReports();
    const timer = setInterval(loadUnreadShiftReports, 30000);
    return () => clearInterval(timer);
  }, [currentUser, authorizationReady]);
  useEffect(() => {
    if (!currentUser || !pollingCapabilities.dashboard) {
      setOnlineAdmins([]);
      setTemporaryGuardPreviews([]);
      return undefined;
    }
    const loadAdmins = async () => {
    try {
const sessionToken = getDashboardSessionToken(currentUser);

if (!sessionToken) {
  return;
}

const response = await fetch(
  `${API_BASE_URL}/admin/active`,
  {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  }
);

      const data = await response.json();

            if (data.status === "ok") {
        setOnlineAdmins(data.admins || []);
        setTemporaryGuardPreviews(
          data.temporary_guard_previews || []
        );
      }

    } catch (err) {
      console.error("DASHBOARD_SRC_APP_JSX_DIAG_001", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
    }
  };


  loadAdmins();

  const interval = setInterval(loadAdmins, 10000);

  return () => clearInterval(interval);

}, [currentUser, authorizationReady]);
  useEffect(() => {
  if (!currentUser || !authorizationReady) return undefined;
  const sessionToken = getDashboardSessionToken(currentUser);

  if (!sessionToken) return;

  const sendHeartbeat = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/heartbeat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const summary = data.tenant_context;
        if (summary && (summary.tenant_context_mode !== currentUser?.user?.tenant_context_mode ||
            summary.tenant_context_can_mutate !== currentUser?.user?.tenant_context_can_mutate)) {
          const stored = readDashboardSession();
          if (stored?.user) {
            const updated = { ...stored, user: { ...stored.user, ...summary } };
            localStorage.setItem("aegis-current-user", JSON.stringify(updated));
            setCurrentUser(updated);
          }
        }
      } else {
        const data = await response.json().catch(() => ({}));

        console.error("Heartbeat failed:");
      }
    } catch (err) {
      console.error("Heartbeat failed", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
    }
  };

  sendHeartbeat();

  const interval = setInterval(sendHeartbeat, 30000);

  return () => clearInterval(interval);
}, [currentUser, authorizationReady]);
  useEffect(() => {
  localStorage.setItem("aegis-active-menu", activeMenu);
  if (!currentUser || !pollingCapabilities.guards) {
    setLiveActiveGuards([]);
    return undefined;
  }
    const fetchActiveGuards = async () => {
  try {
    const sessionToken = getSessionToken();

    if (!sessionToken) return;

    const response = await fetch(
      `${API_BASE_URL}/guards/active`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    const data = await response.json();

    setLiveActiveGuards(data.guards || []);
  } catch (err) {
    console.error("Failed loading active guards:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
  }
};

fetchActiveGuards();

const interval = setInterval(fetchActiveGuards, 10000);

return () => clearInterval(interval);
}, [activeMenu, currentUser, authorizationReady]);
const guardsOnDuty = liveActiveGuards.map((guard) => ({
  full_name: guard.full_name,
  site_name: guard.site_name,
  check_in_time: guard.check_in_time,
}));

const [dashboardIncidents, setDashboardIncidents] = useState([]);
const [systemStatus, setSystemStatus] = useState(null);
const [resolvedIncidents, setResolvedIncidents] = useState([]);
const [reportPreviewHtml, setReportPreviewHtml] = useState(null);
const reportIdentityRef = useRef(null);
const reportIdentity = JSON.stringify([getDashboardSessionToken(currentUser), currentUser?.user?.effective_company_id, currentUser?.user?.tenant_context_company_id]);
reportIdentityRef.current = reportIdentity;
useEffect(() => { setReportPreviewHtml(null); setGuardQuestionnaireResponses({}); }, [reportIdentity]);

const [resolvedFilters, setResolvedFilters] = useState({
  date: "",
  site: "",
});

useEffect(() => {
  if (!currentUser || !pollingCapabilities.dashboard) return undefined;
  async function loadDashboardMetrics() {
    try {
      const sessionToken = getSessionToken();

if (!sessionToken) return;

const res = await fetch(
  `${API_BASE_URL}/dashboard/metrics`,
  {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  }
);

      const data = await res.json();

      setDashboardMetrics(data);

    } catch (err) {
      console.error("Dashboard metrics error:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
    }
  }

  loadDashboardMetrics();

  const interval = setInterval(loadDashboardMetrics, 15000);

  return () => clearInterval(interval);

}, [currentUser, authorizationReady]);

useEffect(() => {
  if (!currentUser || !pollingCapabilities.dashboard) return undefined;
  async function loadIncidentTimeline() {
    try {
      const sessionToken = getSessionToken();

if (!sessionToken) return;

const res = await fetch(
  `${API_BASE_URL}/dashboard/incident-timeline`,
  {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  }
);

      const data = await res.json();

      setIncidentTimeline(data);
    } catch (err) {
      console.error("Incident timeline load error:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});

      setIncidentTimeline({
        status: "normal",
        location: "Normal",
        alertTime: null,
        alertStatus: "normal",
        callStatus: "normal",
        smsStatus: "normal",
        incidentStatus: "normal",
        duration: null,
      });
    }
  }

  loadIncidentTimeline();

  const interval = setInterval(loadIncidentTimeline, 5000);

  return () => clearInterval(interval);
}, [currentUser, authorizationReady]);

useEffect(() => {
  if (!currentUser || !pollingCapabilities.sites) return undefined;
  async function loadSites() {
  try {
    const sessionToken = getSessionToken();

    if (!sessionToken) return;

    const res = await fetch(
      `${API_BASE_URL}/sites`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    const data = await res.json();

    setLiveSites(data.sites || []);
  } catch (err) {
    console.error("Sites load error:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
  }
}

  loadSites();

  const interval = setInterval(loadSites, 15000);

  return () => clearInterval(interval);
}, [currentUser, authorizationReady]);

useEffect(() => {
  if (!currentUser || !pollingCapabilities.incidents) return undefined;
  const loadResolvedIncidents = async () => {
    try {
      const sessionToken = getSessionToken();

if (!sessionToken) return;

const response = await fetch(
  `${API_BASE_URL}/incidents/resolved`,
  {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  }
);
      const data = await response.json();

      if (data.status === "ok") {
        setResolvedIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error("Failed loading resolved incidents:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
    }
  };

  loadResolvedIncidents();

  const interval = setInterval(loadResolvedIncidents, 15000);

  return () => clearInterval(interval);
}, [currentUser, authorizationReady]);

useEffect(() => {
  if (!currentUser || !pollingCapabilities.incidents) return undefined;
  const loadSiteMonitoring = async () => {
    try {
      const sessionToken = getSessionToken();

if (!sessionToken) return;

const response = await fetch(
  `${API_BASE_URL}/incidents/site-monitoring`,
  {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  }
);

      const data = await response.json();

      setDashboardIncidents(data.cards || []);
    } catch (err) {
      console.error("Failed loading site monitoring:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
    }
  };

  loadSiteMonitoring();

  const interval = setInterval(loadSiteMonitoring, 5000);

  return () => clearInterval(interval);
}, [currentUser, authorizationReady]);

useEffect(() => {
  if (!currentUser || !pollingCapabilities.systemStatus) {
    setSystemStatus(null);
    return undefined;
  }
  const loadSystemStatus = async () => {
    let backendResponded = false;
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken) return;
      const response = await fetch(
        `${API_BASE_URL}/system/status/tenant`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      backendResponded = true;
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `System status request failed (${response.status})`
        );
      }
      const data = await response.json();
      setSystemStatus(data);
    } catch (err) {
      console.error("Failed loading system status:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
      setSystemStatus({
        overall_status: backendResponded ? "degraded" : "offline",
        critical_issue: !backendResponded,
        checked_at: new Date().toISOString(),
        platform: [
          {
            name: "backend_api",
            label: "Backend API",
            status: backendResponded ? "degraded" : "offline",
            severity: "critical",
            current_error: backendResponded
              ? `Backend responded, but operational data could not be loaded: ${err.message}`
              : err.message,
          },
        ],
        tenant: [],
      });
    }
  };

  loadSystemStatus();

  const interval =
    setInterval(
      loadSystemStatus,
      30000
    );

  return () => {
  clearInterval(interval);
};

}, [currentUser, authorizationReady]);
  const filteredIncidents =
  incidentFilter === "All"
    ? dashboardIncidents
    : incidentFilter === "Normal"
    ? [...dashboardIncidents].sort((a, b) => {
        const priority = {
          active: 1,
          in_progress: 2,
          normal: 3,
          resolved: 4,
        };

        return (
          (priority[a.status] || 99) -
          (priority[b.status] || 99)
        );
      })
    : dashboardIncidents.filter(
        (incident) =>
          incident.status?.toLowerCase() ===
          incidentFilter.toLowerCase().replace(" ", "_")
      );

      const hasActiveIncident = dashboardIncidents.some(
  (incident) => incident.status === "active"
);

const formatTimelineTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("el-GR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const timelineText = {
  alert:
incidentTimeline.alertStatus === "normal"
? "No Alert"
: "Alert Triggered",

  call:
incidentTimeline.callStatus === "normal"
? "No Call"
      : incidentTimeline.callStatus === "completed"
      ? "Call Completed"
      : "Call In Progress",

  sms:
incidentTimeline.smsStatus === "normal"
? "No Message"
      : incidentTimeline.smsStatus === "completed"
      ? "SMS Sent"
      : "SMS In Progress",

  incident:
incidentTimeline.incidentStatus === "normal"
? "No Incident"
      : incidentTimeline.incidentStatus === "resolved"
      ? "Incident Resolved"
      : "Incident Active",
};

if (authorizationLoading) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <img src={aegisLogo} alt="Aegis Link Logo" className="login-logo" />
        <p>Loading authorization...</p>
      </div>
    </div>
  );
}

if (!currentUser) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <img src={aegisLogo} alt="Aegis Link Logo" className="login-logo" />

        <h1>Aegis Link</h1>
        <p>Security Operations Access</p>

        {showPasswordChange ? (
  <form onSubmit={handlePasswordChange} className="login-form">
    <div className="password-input-row">
      <input
        type={showLoginPassword ? "text" : "password"}
        placeholder="Current Temporary Password"
        value={passwordChangeForm.current_password}
        onChange={(e) =>
          setPasswordChangeForm({
            ...passwordChangeForm,
            current_password: e.target.value,
          })
        }
      />
      <button
        type="button"
        className="password-visibility-button"
        aria-label={showLoginPassword ? "Hide temporary password" : "Show temporary password"}
        aria-pressed={showLoginPassword}
        onClick={() => setShowLoginPassword((visible) => !visible)}
      >
        {showLoginPassword ? "Hide" : "Show"}
      </button>
    </div>

    <div className="password-input-row">
      <input
        type={showNewPassword ? "text" : "password"}
        placeholder="New Password"
        value={passwordChangeForm.new_password}
        onChange={(e) =>
          setPasswordChangeForm({
            ...passwordChangeForm,
            new_password: e.target.value,
          })
        }
      />
      <button
        type="button"
        className="password-visibility-button"
        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
        aria-pressed={showNewPassword}
        onClick={() => setShowNewPassword((visible) => !visible)}
      >
        {showNewPassword ? "Hide" : "Show"}
      </button>
    </div>

    <div className="password-input-row">
      <input
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Confirm New Password"
        value={passwordChangeForm.confirm_password}
        onChange={(e) =>
          setPasswordChangeForm({
            ...passwordChangeForm,
            confirm_password: e.target.value,
          })
        }
      />
      <button
        type="button"
        className="password-visibility-button"
        aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
        aria-pressed={showConfirmPassword}
        onClick={() => setShowConfirmPassword((visible) => !visible)}
      >
        {showConfirmPassword ? "Hide" : "Show"}
      </button>
    </div>

    {passwordChangeError && (
      <span className="login-error">{passwordChangeError}</span>
    )}

    <button type="submit" disabled={isChangingPassword}>
      {isChangingPassword ? "Updating..." : "Update Password"}
    </button>
  </form>
) : (
  <form onSubmit={handleLogin} className="login-form">
    <input
      type="text"
      placeholder="Username"
      value={loginForm.username}
      onChange={(e) =>
        setLoginForm({ ...loginForm, username: e.target.value })
      }
    />

    <div className="password-input-row">
      <input
        type={showLoginPassword ? "text" : "password"}
        placeholder="Password"
        value={loginForm.password}
        onChange={(e) =>
          setLoginForm({ ...loginForm, password: e.target.value })
        }
      />
      <button
        type="button"
        className="password-visibility-button"
        aria-label={showLoginPassword ? "Hide password" : "Show password"}
        aria-pressed={showLoginPassword}
        onClick={() => setShowLoginPassword((visible) => !visible)}
      >
        {showLoginPassword ? "Hide" : "Show"}
      </button>
    </div>

    {loginError && <span className="login-error">{loginError}</span>}

    <button type="submit" disabled={isLoggingIn}>
      {isLoggingIn ? "Checking..." : "Login"}
    </button>
  </form>
)}
      </div>
    </div>
  );
}

if (!authorizationReady) {
  return (
    <div className="login-screen">
      <div className="login-card"><p>Loading authorization...</p></div>
    </div>
  );
}

if (menuItems.length === 0) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Aegis Link</h1>
        <p>No Dashboard permissions are assigned to this account.</p>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
  
const getFlowStatusClass = (status) => {
  const value = status?.toLowerCase();

  if (
    value === "received" ||
    value === "sending" ||
    value === "dialing" ||
    value === "processing" ||
    value === "pending"
  ) {
    return "flow-active";
  }

  if (
  value === "completed" ||
  value === "delivered" ||
  value === "sent"
)
{
  return "flow-completed";
}

  if (value === "failed") {
    return "flow-failed";
  }

  return "flow-ready";
};

const updateResolutionForm = (incidentDbId, field, value) => {
  setResolutionForms((prev) => ({
    ...prev,
    [incidentDbId]: {
      ...prev[incidentDbId],
      [field]: value,
    },
  }));
};

const loadGuardNotesForIncident = async (incidentDbId) => {
  if (!incidentDbId) return;
  const requestIdentity = reportIdentityRef.current;

  try {
    const response = await fetch(
  `${API_BASE_URL}/incidents/${incidentDbId}/guard-responses`,
  {
    headers: {
      Authorization: `Bearer ${getDashboardSessionToken(currentUser) || ""}`,
    },
  }
);

    const data = await response.json();

    if (data.status === "ok") {
      if (requestIdentity !== reportIdentityRef.current) return;
      setGuardQuestionnaireResponses(previous => ({...previous, [incidentDbId]: data.responses || []}));
    }
  } catch (err) {
    console.error("GUARD_QUESTIONNAIRE_READ_FAILED");
  }
};

const handleDownloadIncidentReport = async (incident) => {
  try {
    const sessionToken = getSessionToken();

    if (!sessionToken) {
      throw new Error("Authentication session is missing");
    }

    const response = await fetch(
      `${API_BASE_URL}/incidents/${incident.id}/report/pdf`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("PDF download failed");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${incident.incident_ref || "incident-report"}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error("Incident PDF download failed:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
    alert("Failed to download PDF");
  }
};

const handlePreviewIncidentReport = async (incident) => {
  const reportIdentity = reportIdentityRef.current;
  try {
    const sessionToken = getSessionToken();

if (!sessionToken) {
  throw new Error("Authentication session is missing");
}

const response = await fetch(
  `${API_BASE_URL}/incidents/${incident.id}/report`,
  {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  }
);

    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error("Report generation failed");
    }

    
    const reportHtml = createIncidentReportHtml(data, currentUser, reportLogoDataUrl);
    if (reportIdentity !== reportIdentityRef.current) return;

    setReportPreviewHtml(reportHtml);

  } catch (err) {
    console.error("DASHBOARD_SRC_APP_JSX_DIAG_002", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});

    alert("Failed to generate report");
  }
};
const handleResolveIncident = async (incident) => {
  const form = resolutionForms[incident.incidentDbId] || {};

  try {
    await fetch(`${API_BASE_URL}/incidents/${incident.incidentDbId}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getDashboardSessionToken(currentUser) || ""}`,
      },
      body: JSON.stringify({
        supervisor_notified: true,
        supervisor_name:
          form.supervisor_name ||
          currentUser?.user?.username ||
          currentUser?.username ||
          "",

        supervisor_notes: form.supervisor_notes || "",

        guard_contacted: true,
        guard_contacted_name:
          form.guard_contacted_name ||
          incident.guard ||
          "",

        guard_notes: form.guard_notes || "",

        residence_contacted: true,
        residence_contacted_name:
          form.residence_contacted_name ||
          incident.site ||
          "",

        residence_notes: form.residence_notes || "",

        admin_notes: form.admin_notes || "",
        approved_by:
          currentUser?.user?.username ||
          currentUser?.username ||
          "Unknown admin",
      }),
    });

    setDashboardIncidents((prev) =>
      prev.filter((item) => item.incidentDbId !== incident.incidentDbId)
    );
  } catch (err) {
    console.error("Resolve incident failed:", {code: /^[0-9A-Z]{5}$/.test(err?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(err?.code) ? err.code : 'INTERNAL'});
  }
};

const gpsAccuracyLabel = (accuracy) => {
  const value = Number(accuracy);

  if (!Number.isFinite(value)) return "Unknown";
  if (value <= 20) return "Excellent";
  if (value <= 50) return "Good";
  if (value <= 100) return "Fair";
  return "Poor";
};

const renderIncidentLocation = (incident) => {
  if (!incident?.incidentLatitude || !incident?.incidentLongitude) {
    return null;
  }

  const address =
    incident.incidentAddress ||
    `${incident.incidentLatitude}, ${incident.incidentLongitude}`;

  return (
    <div className="incident-location-box">
      <h4>📍 Incident Location</h4>

      <p><strong>Address:</strong> {address}</p>

      <p>
        <strong>Accuracy:</strong>{" "}
        {incident.incidentAccuracy
          ? `${incident.incidentAccuracy}m · ${gpsAccuracyLabel(incident.incidentAccuracy)}`
          : "-"}
      </p>

      <p>
        <strong>Battery:</strong>{" "}
        {incident.incidentBatteryLevel !== null &&
        incident.incidentBatteryLevel !== undefined
          ? `${incident.incidentBatteryLevel}%`
          : "-"}
      </p>

      <p>
        <strong>Snapshot Time:</strong>{" "}
        {formatDateTime(incident.incidentLocationTimestamp)}
      </p>

      <button
        type="button"
        onClick={() =>
          window.open(
            `https://www.google.com/maps?q=${incident.incidentLatitude},${incident.incidentLongitude}`,
            "_blank"
          )
        }
      >
        Open Map
      </button>
    </div>
  );
};

  return (
    <div style={{ display: "flex", minHeight: "100vh", margin: 0 }}>
      <aside
        style={{
          width: "260px",
          background: "#111111",
          color: "#ffffff",
          padding: "24px 18px",
          boxSizing: "border-box",
        }}
      >
        <div className="sidebar-brand">
          <button className="logout-button" onClick={handleLogout}>
  Logout
</button>
          <div className="current-user-box">
  <span>Logged in as</span>
  <strong>{currentUser?.username || currentUser?.user?.username}</strong>
  <small>● Active</small>
</div>
          <div className="current-user-box online-admins-box">
  <span className="online-admins-title">
    ONLINE ADMINS & PREVIEWS
  </span>

  {onlineAdmins.length === 0 &&
  temporaryGuardPreviews.length === 0 ? (
    <small className="online-admins-empty">
      No users online
    </small>
  ) : (
    <>
      {onlineAdmins.map((admin) => (
        <div
          key={admin.username}
          className={`online-admin-row ${
            admin.is_temporary
              ? "temporary-preview"
              : ""
          }`}
        >
          <div className="online-admin-main">
            <span
              className="online-admin-indicator"
              aria-hidden="true"
            />

            <small className="online-admin-username">
              {admin.username}
            </small>
          </div>

          {admin.is_temporary && (
            <>
              <span className="temporary-preview-badge">
                TEMPORARY PREVIEW
              </span>

              {admin.temporary_access_label && (
                <small className="temporary-preview-label">
                  {admin.temporary_access_label}
                </small>
              )}
            </>
          )}
        </div>
      ))}

      {temporaryGuardPreviews.length > 0 && (
        <div className="temporary-guard-preview-group">
          <span className="temporary-guard-preview-title">
            GUARD WEB APP
          </span>

          {temporaryGuardPreviews.map((guard) => (
            <div
              key={`guard-${guard.guard_id}`}
              className="
                online-admin-row
                temporary-preview
                temporary-guard-preview
              "
            >
              <div className="online-admin-main">
                <span
                  className="online-admin-indicator"
                  aria-hidden="true"
                />

                <small className="online-admin-username">
                  {guard.username}
                </small>
              </div>

              <span
                className="
                  temporary-preview-badge
                  temporary-guard-preview-badge
                "
              >
                TEMPORARY GUARD PREVIEW
              </span>

              {guard.temporary_access_label && (
                <small className="temporary-preview-label">
                  {guard.temporary_access_label}
                </small>
              )}

              {guard.site_name && (
                <small className="temporary-guard-preview-site">
                  Site: {guard.site_name}
                </small>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )}
</div>
  <img
    src={aegisLogo}
    alt="Aegis Link Logo"
    className="sidebar-brand-logo"
  />

  <div
  style={{
    marginTop: "12px",
    textAlign: "center",
    fontSize: "12px",
    color: "#6b7280",
    letterSpacing: "1px",
  }}
>
  Dashboard {APP_VERSION} · build {APP_BUILD}
</div>

  </div>

        <nav>
  <ul ref={sidebarMenuRef} className="sidebar-menu">
    {menuItems.map((item) => (
      <li
        key={item}
        className={`sidebar-item ${activeMenu === item ? "active" : ""}`}
        onClick={() => setActiveMenu(item)}
      >
        {item}
        {item === "Shift Reports" && unreadShiftReports > 0 && (
          <span className="sidebar-badge">{unreadShiftReports}</span>
        )}
      </li>
    ))}
  </ul>
</nav>
      </aside>

      <main
        style={{
          flex: 1,
          minWidth: 0,
          background: "#0b0b0b",
          color: "#ffffff",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >

{isReadOnlyAccess && (
  <div className="read-only-access-banner">
    <strong>Read-only preview</strong>

    <span>
      All pages are available. Changes and
      operational actions are disabled.
    </span>

    {readOnlyExpiresAt && (
      <small>
        Access expires:{" "}
        {formatDateTime(readOnlyExpiresAt)}
      </small>
    )}
  </div>
)}

{isReadOnlyAccess && (
  <DemoGuidance
    preview
    activeMenu={activeMenu}
    sessionIdentity={readOnlyExpiresAt}
  />
)}

{currentUser?.user?.tenant_context_active && (
  <section className="tenant-context-banner" role="status">
    <div>
      <strong>SYSTEM OWNER · VIEWING {currentUser.user.tenant_context_company_name} · {currentUser.user.tenant_context_can_mutate ? "ADMINISTRATIVE ACCESS" : "READ ONLY"}</strong>
      {currentUser.user.tenant_context_can_mutate && currentUser.user.tenant_context_elevated_until &&
        <small>Access expires: {formatDateTime(currentUser.user.tenant_context_elevated_until)}</small>}
      {currentUser.user.tenant_context_company_status === "inactive" && <small>COMPANY INACTIVE</small>}
    </div>
    <div className="tenant-context-actions">
      {isTenantReadOnly && currentUser.user.tenant_context_company_status !== "inactive" &&
        <button type="button" onClick={() => setShowTenantElevation(true)}>Enable Administrative Access</button>}
      <button type="button" disabled={tenantContextBusy} onClick={() => transitionTenant("exit")}>Exit Company Context</button>
    </div>
    {tenantContextError && <p role="alert">{tenantContextError}</p>}
  </section>
)}

{showTenantElevation && (
  <div className="tenant-context-backdrop">
    <form className="tenant-context-modal" onSubmit={(event) => {
      event.preventDefault();
      if (tenantReason.trim()) transitionTenant("elevate", { reason: tenantReason.trim() });
    }}>
      <h2>Enable Administrative Access</h2>
      <p>Changes will be recorded as actions performed by your System Owner account. Administrative access expires automatically after 30 minutes.</p>
      <label>Reason *<textarea required maxLength={1000} value={tenantReason} onChange={(event) => setTenantReason(event.target.value)} /></label>
      {tenantContextError && <p role="alert">{tenantContextError}</p>}
      <footer><button type="button" onClick={() => setShowTenantElevation(false)}>Cancel</button><button type="submit" disabled={tenantContextBusy || !tenantReason.trim()}>Confirm</button></footer>
    </form>
  </div>
)}

{readOnlyNotice && (
  <div
    className="read-only-access-notice"
    role="status"
  >
    {readOnlyNotice}
  </div>
)}

        {activeMenu === "Dashboard" && canRenderMenu("Dashboard") && (
  <>
        <header style={{ marginBottom: "28px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            Aegis Link Operations Console
          </h1>
          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#9ca3af",
              fontSize: "15px",
            }}
          >
            Live view of sites, guards, and active incidents
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Active Incidents</div>
            <div style={{ fontSize: "28px", marginTop: "10px", color: "#ff4d4f" }}>
            {dashboardMetrics.activeIncidents}
           </div>
          </div>

          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Alerts Today</div>
            <div style={{ fontSize: "28px", marginTop: "10px" }}>
            {dashboardMetrics.alertsToday}
            </div>
          </div>

          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Response Time</div>
            <div style={{ fontSize: "28px", marginTop: "10px" }}>
            {dashboardMetrics.responseTime}
            </div>
          </div>

          <div style={{ background: "#181818", padding: "20px", borderRadius: "12px" }}>
            <div>Guards On Duty</div>
            <div style={{ fontSize: "28px", marginTop: "10px", color: "#22c55e" }}>
            {dashboardMetrics.guardsOnDuty}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <h2
            style={{
              marginBottom: "16px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            Sites Overview
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {liveSites.map((site, index) => (
  <SiteCard key={index} site={site} />
))}
          </div>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <h2
            style={{
              marginBottom: "16px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            Guards On Duty
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {liveActiveGuards.length > 0 ? (
              liveActiveGuards.map((guard, index) => (
                <GuardStatus key={index} guard={guard} />
              ))
            ) : (
              <GuardStatus guard={null} />
            )}
          </div>
        </section>

        <section
          style={{
            background: "#181818",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "18px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            Live Incident Timeline
          </h3>

          <div
  className="live-incident-panel"
  style={{
    marginTop: "16px",
    background: "#0d1117",
    borderRadius: "14px",
    padding: "18px",
    border: "1px solid #1f2937",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      position: "relative",
      paddingLeft: "26px",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: "8px",
        top: "12px",
        bottom: "12px",
        width: "2px",
        background: "#242424",
      }}
    />

    {incidentTimeline.events && incidentTimeline.events.length > 0 ? (
      incidentTimeline.events.map((event) => {
        const eventIcon =
          event.type === "alert"
            ? "🚨"
            : event.type === "call"
            ? "📞"
            : event.type === "sms"
            ? "💬"
            : "●";

        const eventColor =
          event.type === "alert"
            ? "#ff4d4f"
            : event.type === "call"
            ? "#ffac15"
            : event.type === "sms"
            ? "#3b82f6"
            : "#22c55e";

        return (
          <div
            key={event.id}
            style={{
              position: "relative",
              background: "#101010",
              padding: "14px",
              borderRadius: "10px",
              borderLeft: `4px solid ${eventColor}`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "-26px",
                top: "18px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: eventColor,
                border: "3px solid #0d1117",
              }}
            />

            <strong>
              {eventIcon} {event.label}
            </strong>

            <div
              style={{
                fontSize: "14px",
                color: "#aaaaaa",
                marginTop: "6px",
              }}
            >
              {event.detail}
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "#aaaaaa",
                marginTop: "4px",
              }}
            >
              Time: {formatTimelineTime(event.time)}
            </div>
          </div>
        );
      })
    ) : (
      <div
        style={{
          position: "relative",
          background: "#101010",
          padding: "14px",
          borderRadius: "10px",
          borderLeft: "4px solid #22c55e",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-26px",
            top: "18px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "#22c55e",
            border: "3px solid #0d1117",
          }}
        />

        <strong>✅ System Normal</strong>

        <div
          style={{
            fontSize: "14px",
            color: "#aaaaaa",
            marginTop: "6px",
          }}
        >
          No active incident timeline available.
        </div>
      </div>
    )}
  </div>
</div>
</section>
    </>
)}
        {activeMenu === "Live Incidents" && canRenderMenu("Live Incidents") && (
  <>
    <header style={{ marginBottom: "28px" }}>
      <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "700" }}>
        Live Incidents
      </h1>
      <p style={{ marginTop: "8px", color: "#9ca3af", fontSize: "15px" }}>
        Real-time incident monitoring across all active sites
      </p>
    </header>

    <section className="live-incident-filters">
     {["All", "Normal", "Active", "In Progress", "Resolved"].map((filter) => (
  <button
    key={filter}
    className={`filter-button ${
  incidentFilter === filter ? "active-filter" : ""
} ${
  filter === "Active" && hasActiveIncident ? "active-alert-button" : ""
}`}
    onClick={() => setIncidentFilter(filter)}
  >
    {filter}
  </button>
))}
    </section>

    {incidentFilter === "Resolved" && (
  <section className="resolved-filters">
    <input
      type="date"
      value={resolvedFilters.date}
      onChange={(e) =>
        setResolvedFilters({
          ...resolvedFilters,
          date: e.target.value,
        })
      }
    />

    <select
  value={resolvedFilters.site}
  onChange={(e) =>
    setResolvedFilters({
      ...resolvedFilters,
      site: e.target.value,
    })
  }
>
  <option value="">All Sites</option>

  {[...new Set(resolvedIncidents.map((incident) => incident.site_name))]
    .filter(Boolean)
    .map((siteName) => (
      <option key={siteName} value={siteName}>
        {siteName}
      </option>
    ))}
</select>

    <button
      type="button"
      onClick={() =>
        setResolvedFilters({
          date: "",
          site: "",
        })
      }
    >
      Clear Filters
    </button>
  </section>
)}

    <section style={{ display: "grid", gap: "16px" }}>
  {incidentFilter === "Active"
  ? filteredIncidents.length === 0 ? (
      <div className="empty-incident-state">
        <img src={aegisLogo} alt="Aegis Link" />
        <h2>No Active Alert</h2>
        <p>All monitored sites are operating normally.</p>
      </div>
    ) : filteredIncidents.map((incident, index) => (
        <div key={index} className="active-alert-panel">
          <h2>🚨 ALERT ON {incident.site}</h2>

          <p>
            Triggered:{" "}
            {incident.triggerTime
              ? new Date(incident.triggerTime).toLocaleTimeString("el-GR", {
                  timeZone: "Europe/Athens",
                })
              : "-"}
          </p>

          <p>Guard: {incident.guard}</p>
          {renderIncidentLocation(incident)}
        </div>
      ))
      : incidentFilter === "In Progress"
? filteredIncidents.length === 0 ? (
    <div className="empty-incident-state">
      <img src={aegisLogo} alt="Aegis Link" />
      <h2>No Alert In Progress</h2>
      <p>No incidents are currently under investigation.</p>
    </div>
  ) : filteredIncidents.map((incident, index) => (
    <div
      key={index}
      className="incident-detail-card in-progress"
    >
      <h3>🚨 Incident Investigation</h3>

<p><strong>Site:</strong> {incident.site}</p>
<p><strong>Guard:</strong> {incident.guard}</p>
<p><strong>Incident:</strong> {incident.incidentId}</p>
{renderIncidentLocation(incident)}

<hr />

<h4>Supervisor</h4>

<label>
  Supervisor Name
  <input
  type="text"
  defaultValue={
    currentUser?.user?.username ||
    currentUser?.username ||
    ""
  }
  onBlur={(e) => {
    updateResolutionForm(
      incident.incidentDbId,
      "supervisor_notified",
      true
    );

    updateResolutionForm(
      incident.incidentDbId,
      "supervisor_name",
      e.target.value
    );
  }}
/>
</label>

<label>
  Supervisor Notes
  <textarea
  rows="3"
  onChange={(e) =>
    updateResolutionForm(
      incident.incidentDbId,
      "supervisor_notes",
      e.target.value
    )
  }
/>
</label>

<hr />

<h4>Guard Contact</h4>

<label>
  Guard Contact Name
  <input
  type="text"
  defaultValue={incident.guard || ""}
  onBlur={(e) =>
    updateResolutionForm(
      incident.incidentDbId,
      "guard_contacted_name",
      e.target.value
    )
  }
/>
</label>

<section aria-label="Guard Questionnaire Responses">
  <h4>Guard Questionnaire Responses</h4>
  <button type="button" onClick={() => loadGuardNotesForIncident(incident.incidentDbId)}>Load questionnaire answers</button>
  {(guardQuestionnaireResponses[incident.incidentDbId] || []).map((row,index) => <div key={row.question_key || index}>
    <strong>{row.position || index+1}. {row.question_text}</strong>
    <p style={{whiteSpace:"pre-wrap"}}>{row.answer}</p>
    {row.provenance && <small>{row.provenance} · {row.omitted ? "Optional omission" : row.submitted === false ? "Not submitted" : "Guard response"}</small>}
  </div>)}
</section>
<label>
  Independent Guard Notes
  <textarea
  rows="4"
  placeholder="Guard report / incident description"
  value={
    resolutionForms[incident.incidentDbId]?.guard_notes || ""
  }
  onChange={(e) =>
    updateResolutionForm(
      incident.incidentDbId,
      "guard_notes",
      e.target.value
    )
  }
/>
</label>

<hr />

<h4>Residence Contact</h4>

<label>
  Residence Contact Name
  <input
  type="text"
  defaultValue={incident.site || ""}
  onBlur={(e) =>
    updateResolutionForm(
      incident.incidentDbId,
      "residence_contacted_name",
      e.target.value
    )
  }
/>
</label>

<label>
  Residence Notes
  <textarea
    rows="3"
    onChange={(e) =>
      updateResolutionForm(
        incident.incidentDbId,
        "residence_notes",
        e.target.value
      )
    }
  />
</label>

<hr />

<h4>Admin Review</h4>

<label>
  Admin Notes
  <textarea
    rows="6"
    onChange={(e) =>
      updateResolutionForm(
        incident.incidentDbId,
        "admin_notes",
        e.target.value
      )
    }
  />
</label>

{hasPermission("incidents.manage") && <button
  className="resolve-button"
  onClick={() => handleResolveIncident(incident)}
>
  Approve & Resolve
</button>}
    </div>
  ))

    : incidentFilter === "Resolved"
? resolvedIncidents
    .filter((incident) => {
      const dateMatch =
        !resolvedFilters.date ||
        incident.resolved_time?.startsWith(resolvedFilters.date);

      const siteMatch =
        !resolvedFilters.site ||
        incident.site_name?.toLowerCase().includes(resolvedFilters.site.toLowerCase());

      return dateMatch && siteMatch;
    })
    .map((incident, index) => (
      <div key={index} className="incident-detail-card resolved">
        <h3>✅ {incident.incident_ref}</h3>
        <p><strong>Site:</strong> {incident.site_name}</p>
        <p><strong>Guard:</strong> {incident.guard_name}</p>
        {renderIncidentLocation({
  incidentLatitude: incident.incident_latitude,
  incidentLongitude: incident.incident_longitude,
  incidentAccuracy: incident.incident_accuracy,
  incidentBatteryLevel: incident.incident_battery_level,
  incidentAddress: incident.incident_address,
  incidentLocationTimestamp: incident.incident_location_timestamp,
})}
        <p>
  <strong>Resolved:</strong>{" "}
  {incident.resolved_time_display || "-"}
</p>
        <p><strong>Approved By:</strong> {incident.approved_by || "-"}</p>
        <p><strong>Supervisor:</strong> {incident.supervisor_name || "-"}</p>
        <p><strong>Guard Contact:</strong> {incident.guard_contacted_name || "-"}</p>
        <p><strong>Residence Contact:</strong> {incident.residence_contacted_name || "-"}</p>
        <p><strong>Admin Notes:</strong> {incident.admin_notes || "-"}</p>
        <div className="report-actions">
  <button
    type="button"
    onClick={() => handlePreviewIncidentReport(incident)}
  >
    👁 Preview Report
  </button>

  <button
  type="button"
  onClick={() => handleDownloadIncidentReport(incident)}
>
  ⬇ Download PDF
</button>
</div>
      </div>
    ))
: filteredIncidents.map((incident, index) => (
        <div
          key={index}
          className={`incident-detail-card ${incident.status}`}
        >
          <div className="incident-card-header">
            <div>
              <h3>{incident.title}</h3>
              <p>Site monitoring card</p>
            </div>

            <span className="incident-status">
              {incident.status === "inactive"
  ? "Inactive"
  : incident.status === "normal"
  ? "Normal"
  : incident.status === "active"
  ? "Active"
  : incident.status === "resolved"
  ? "Resolved"
  : "In Progress"}
            </span>
          </div>

          <div className="incident-meta-grid">
            <p><strong>Site:</strong> {incident.site}</p>
            <p><strong>Guard:</strong> {incident.guard}</p>
            <p>
              <strong>Alert status:</strong>{" "}
              {incident.status === "inactive"
  ? "Site inactive"
  : incident.status === "normal"
  ? "Waiting for alert"
  : incident.status === "resolved"
  ? "Resolved"
  : "Alert active"}
            </p>
            <p><strong>Priority:</strong> {incident.priority}</p>
          </div>

          <div className="incident-flow">
            <span className={`flow-step trigger ${getFlowStatusClass(incident.triggerStatus)}`}>
              🚨 Trigger {incident.triggerStatus}
            </span>

            <span className={`flow-step sms ${getFlowStatusClass(incident.smsStatus)}`}>
              📩 SMS {incident.smsStatus}
            </span>

            <span className={`flow-step call ${getFlowStatusClass(incident.callStatus)}`}>
              📞 Call {incident.callStatus}
            </span>

            <span className={`flow-step ai ${getFlowStatusClass(incident.aiStatus)}`}>
              🤖 AI {incident.aiStatus}
            </span>
          </div>

          <div className="incident-ai-box">
            <h4>AI Intake</h4>

            <p>
              <strong>Status:</strong>{" "}
              {incident.status === "inactive"
  ? "Site inactive"
  : incident.status === "normal"
  ? "Waiting for incident trigger"
  : incident.aiSummary}
            </p>

            <p>
              <strong>Site:</strong> {incident.site}
            </p>
            {renderIncidentLocation(incident)}

            <p>
              <strong>Escalation:</strong>{" "}
              {incident.status === "normal"
                ? "Standby"
                : incident.escalation}
            </p>
          </div>
        </div>
      ))}
</section>
 
{incidentFilter === "All" && (        
<section
  style={{
    marginTop: "24px",
    background: "#111",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "20px",
  }}
>
  <h3 style={{ marginTop: 0 }}>Recent Alert Activity</h3>

  <p style={{ color: "#9ca3af" }}>
    Dashboard test alerts and escalation activity
  </p>
  <p style={{ color: "#22c55e", fontSize: "13px" }}>
  Auto-refresh: every 5 sec
  {recentAlertsCheckedAt &&
    ` • Last checked: ${recentAlertsCheckedAt.toLocaleTimeString("el-GR", {
      timeZone: "Europe/Athens",
    })}`}
</p>

  <div
    style={{
      marginTop: "16px",
      display: "grid",
      gap: "12px",
    }}
  >
    {recentAlerts.slice(0, 5).map((alert, index) => (
  <div
    key={index}
    style={{
      padding: "14px",
      borderRadius: "12px",
      background: "#0f172a",
    }}
  >
    <strong>
      {alert.event_type.toUpperCase()}
    </strong>

    <p>
      Source: {alert.source}
    </p>

    <p>
      Status: {alert.status}
    </p>

    <p>
  Time: {new Date(alert.created_at).toLocaleString("el-GR", {
    timeZone: "Europe/Athens",
  })}
</p>

    <p>
      SMS: {alert.sms_sent} sent /
      {alert.sms_failed} failed
    </p>

    <p>
      Voice: {alert.voice_attempted} attempted / {alert.voice_status}
    </p>
  </div>
))}
  </div>
</section>
)}

</>
)}

        {activeMenu === "Companies" && canRenderMenu("Companies") &&
          <Companies homeCompanyId={currentUser.user.actor_company_id || currentUser.user.company_id} onAccessTenant={tenantEntered} />}
        {activeMenu === "Guards" && canRenderMenu("Guards") && <Guards permissions={currentUser.user.permissions} />}
        {activeMenu==="Admin Audit Logs" && canRenderMenu("Admin Audit Logs") &&
<AdminAuditLogs permissions={currentUser.user.permissions}/>
}
        {activeMenu === "Event Logs" && canRenderMenu("Event Logs") && <EventLogs permissions={currentUser.user.permissions} />}
        {activeMenu === "Sites" && canRenderMenu("Sites") && <Sites permissions={currentUser.user.permissions} />}
        {activeMenu === "Patrols" && canRenderMenu("Patrols") && <Patrols permissions={currentUser.user.permissions} />}
        {activeMenu === "Shift Reports" && canRenderMenu("Shift Reports") && (
          <ShiftReports
            onUnreadCountChange={setUnreadShiftReports}
            permissions={currentUser?.user?.permissions || null}
          />
        )}
        {activeMenu === "Settings" && canRenderMenu("Settings") && (
<Settings permissions={currentUser?.user?.permissions || null}/>
)}

{activeMenu === "Analytics" && canRenderMenu("Analytics") && (
<Analytics/>
)}
        
{activeMenu === "System Status" && canRenderMenu("System Status") && (
  <div className="system-status-page">
    <header className="system-status-header">
      <div>
        <h1>System Status</h1>
        <p>Live platform checks and real operational events for your company.</p>
      </div>
      <p className="system-status-updated">
        Last refresh: {formatHealthTime(systemStatus?.checked_at)}
      </p>
    </header>

    <section className={`system-health-banner status-${systemStatus?.overall_status || "unknown"}`}>
      <div>
        <strong>
          {systemStatus?.critical_issue
            ? "Critical operational issue"
            : systemStatus?.overall_status === "degraded"
              ? "Some services need attention"
              : systemStatus?.overall_status === "operational"
                ? "All monitored systems operational"
                : "Checking system health"}
        </strong>
        <p>
          Unknown and not-configured services are shown transparently and do not create synthetic failures.
        </p>
      </div>
      <span>{STATUS_LABELS[systemStatus?.overall_status] || "Loading"}</span>
    </section>

    <section className="system-status-section">
      <div className="system-status-section-title">
        <div>
          <h2>Shared Platform</h2>
          <p>Infrastructure shared by all Aegis Link tenants.</p>
        </div>
      </div>
      <div className="system-status-grid">
        {(systemStatus?.platform || []).map((item) => (
          <SystemStatusCard key={item.name} item={{ ...item, scope: "platform" }} />
        ))}
      </div>
    </section>

      <section className="system-status-section">
        <div className="system-status-section-title">
          <div>
            <h2>Company Operations</h2>
            <p>Only real events and resources belonging to your authenticated company.</p>
          </div>
          <span className="system-status-guard-count">
            {systemStatus?.active_guards ?? 0} active guards
          </span>
        </div>
        <div className="system-status-grid">
          {(systemStatus?.tenant || []).map((item) => (
            <SystemStatusCard key={item.name} item={{ ...item, scope: "tenant" }} />
          ))}
        </div>
      </section>


    <section className="system-status-ai-note">
      <div>
        <h3>AI Intake</h3>
        <p>Unchanged. Its state is informational and excluded from overall operational health.</p>
      </div>
      <span>{STATUS_LABELS[systemStatus?.ai_intake?.status] || "Unknown"}</span>
    </section>
  </div>
)}

{reportPreviewHtml && (
  <div className="report-modal-overlay">
    <div className="report-modal">
      <div className="report-modal-header">
        <h2>Incident Report Preview</h2>

        <button
          type="button"
          onClick={() => setReportPreviewHtml(null)}
        >
          ✕
        </button>
      </div>

      <iframe
        title="Incident Report Preview"
        sandbox="allow-scripts allow-modals"
        referrerPolicy="no-referrer"
        className="report-preview-frame"
        srcDoc={reportPreviewHtml}
      />
    </div>
  </div>
)}

      </main>
    </div>
  );
}

export default App;
