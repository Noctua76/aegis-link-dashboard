export function getAlertCapabilities(hasPermission) {
  const canViewAlerts = hasPermission("alerts.view");
  return {
    canViewAlerts,
    canManageAlerts: canViewAlerts && hasPermission("alerts.manage"),
  };
}
