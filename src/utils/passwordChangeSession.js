export const PASSWORD_CHANGE_REQUIRED_CODE = "PASSWORD_CHANGE_REQUIRED";

export function getStoredSessionToken(session) {
  return session?.session_token || session?.session?.token || null;
}

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
      user,
    },
    passwordChangeUser: {
      ...user,
      session_token: sessionToken,
    },
  };
}

export function buildPasswordChangedSession(sessionToken, user) {
  return {
    status: "ok",
    message: "Login successful",
    session_token: sessionToken,
    user: {
      ...user,
      must_change_password: false,
    },
  };
}
