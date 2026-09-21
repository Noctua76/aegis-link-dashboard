export const DASHBOARD_MENU_RULES = [
  ["Dashboard", ["dashboard.view"]],
  ["Live Incidents", ["incidents.view"]],
  ["Shift Reports", ["shift_reports.view"]],
  ["Event Logs", ["audit_logs.view"]],
  ["Admin Audit Logs", ["audit_logs.view"]],
  ["Guards", ["guards.view"]],
  ["Sites", ["sites.view"]],
  ["Patrols", ["patrols.view"]],
  ["System Status", ["system_status.tenant"]],
  ["Analytics", ["analytics.view"]],
  [
    "Settings",
    [
      "sites.view",
      "guards.view",
      "patrols.view",
      "alerts.view",
      "users.view",
      "roles.view",
      "system_status.tenant",
      "temporary_access.manage",
      "patrols.correct",
    ],
  ],
];

export function getDashboardSessionToken(session) {
  return session?.session_token || session?.session?.token || null;
}

export function readDashboardSession(storage = globalThis.localStorage) {
  try {
    return JSON.parse(storage?.getItem("aegis-current-user") || "null");
  } catch {
    return null;
  }
}

export function getDashboardAuthHeaders(session = readDashboardSession()) {
  const token = getDashboardSessionToken(session);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function isSystemOwner(user) {
  return Boolean(
    user?.is_system_owner ||
      user?.role === "system_owner" ||
      user?.role_code === "system_owner"
  );
}

export function isAuthorizationReady(session) {
  return Boolean(session?.user && Array.isArray(session.user.permissions));
}

export function hasDashboardPermission(user, permission) {
  if (isSystemOwner(user)) return true;
  return Array.isArray(user?.permissions) && user.permissions.includes(permission);
}

export function canAccessDashboardMenu(user, menuLabel) {
  const rule = DASHBOARD_MENU_RULES.find(([label]) => label === menuLabel);
  if (!rule) return false;
  return rule[1].some((permission) => hasDashboardPermission(user, permission));
}

export function getPermittedDashboardMenus(user) {
  return DASHBOARD_MENU_RULES
    .filter(([, permissions]) =>
      permissions.some((permission) => hasDashboardPermission(user, permission))
    )
    .map(([label]) => label);
}

export function getDashboardPollingCapabilities(user, authorizationReady) {
  const allowed = (permission) =>
    Boolean(authorizationReady && hasDashboardPermission(user, permission));
  return {
    auditLogs: allowed("audit_logs.view"),
    dashboard: allowed("dashboard.view"),
    guards: allowed("guards.view"),
    incidents: allowed("incidents.view"),
    sites: allowed("sites.view"),
    shiftReports: allowed("shift_reports.view"),
    systemStatus: allowed("system_status.tenant"),
  };
}

export function hydrateDashboardSession(existingSession, authContext) {
  const token = getDashboardSessionToken(existingSession);
  if (!token || !authContext || !Array.isArray(authContext.permissions)) return null;

  const previousUser = existingSession?.user || {};
  const user = {
    ...previousUser,
    ...authContext,
    id: authContext.id ?? authContext.user_id ?? previousUser.id,
    role: authContext.role ?? previousUser.role ?? authContext.role_code,
    role_id: authContext.role_id ?? previousUser.role_id ?? null,
    role_code: authContext.role_code ?? previousUser.role_code ?? authContext.role,
    role_name: authContext.role_name ?? previousUser.role_name ?? null,
    permissions: [...authContext.permissions],
    company_id: authContext.company_id ?? previousUser.company_id,
    company_name: authContext.company_name ?? previousUser.company_name,
    access_mode: authContext.access_mode ?? previousUser.access_mode,
    must_change_password: false,
  };

  return {
    ...existingSession,
    session_token: token,
    session: {
      ...(existingSession?.session || {}),
      token,
    },
    user,
  };
}
