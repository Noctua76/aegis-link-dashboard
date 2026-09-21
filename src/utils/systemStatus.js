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
