export const formatHealthTime = (value) => {
  if (!value) return "No recorded event";
  return new Date(value).toLocaleString("el-GR", {
    timeZone: "Europe/Athens",
    dateStyle: "short",
    timeStyle: "medium",
  });
};

export const hasCurrentHealthError = (item) =>
  ["degraded", "offline"].includes(item?.status) && Boolean(item?.current_error);

export const getTenantOperationHistory = (systemStatus, serviceName) => {
  const tenantOperation =
    systemStatus?.services?.[serviceName]?.tenant_operation;

  return {
    last_success_at: tenantOperation?.last_success_at || null,
    last_failure_at: tenantOperation?.last_failure_at || null,
  };
};
