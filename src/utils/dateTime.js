export function formatDateTime(value, timeZone = "Europe/Athens") {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("el-GR", {
    timeZone,
  });
}