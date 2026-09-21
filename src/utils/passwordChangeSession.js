import {
  getDashboardSessionToken,
  hydrateDashboardSession,
} from "./dashboardAuth.js";

export const PASSWORD_CHANGE_REQUIRED_CODE = "PASSWORD_CHANGE_REQUIRED";
export const getStoredSessionToken = getDashboardSessionToken;

export function buildRestrictedPasswordSession(payload, storedSession = null) {
  if (payload?.code !== PASSWORD_CHANGE_REQUIRED_CODE) return null;

  const sessionToken = getStoredSessionToken(storedSession);
  if (!sessionToken) return null;

  const user = {
    ...(storedSession?.user || {}),
    must_change_password: true,
  };

  return {
    storedSession: {
      ...(storedSession || {}),
      session_token: sessionToken,
      session: {
        ...(storedSession?.session || {}),
        token: sessionToken,
      },
      user,
    },
    passwordChangeUser: {
      ...user,
      session_token: sessionToken,
    },
  };
}

export function buildPasswordChangedSession(existingSession, authContext) {
  return hydrateDashboardSession(existingSession, authContext);
}
