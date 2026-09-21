export const AUTH_SESSION_INVALID_CODE = "AUTH_SESSION_INVALID";

export function classifyAuthenticatedFailure({ status, code, requestPath }) {
  if (requestPath === "/auth/login") return null;
  if ((status === 401 || status === 403) && code === "PASSWORD_CHANGE_REQUIRED") {
    return "password_change_required";
  }
  if (status === 401 && code === AUTH_SESSION_INVALID_CODE) {
    return "session_invalid";
  }
  if ((status === 401 || status === 403) && code === "TEMPORARY_ACCESS_EXPIRED") {
    return "temporary_access_expired";
  }
  return null;
}
