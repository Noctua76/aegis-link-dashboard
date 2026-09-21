import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PASSWORD_CHANGE_REQUIRED_CODE,
  buildPasswordChangedSession,
  buildRestrictedPasswordSession,
} from "../src/utils/passwordChangeSession.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const appSource = fs.readFileSync(
  path.join(dirname, "../src/App.jsx"),
  "utf8"
);

test("PASSWORD_CHANGE_REQUIRED preserves the token and returns password-change state", () => {
  const restricted = buildRestrictedPasswordSession(
    { code: PASSWORD_CHANGE_REQUIRED_CODE },
    {
      session_token: "active-session-token",
      user: { id: 7, username: "temporary_admin", permissions: ["*"] },
    }
  );

  assert.equal(restricted.storedSession.session_token, "active-session-token");
  assert.equal(restricted.storedSession.user.must_change_password, true);
  assert.equal(restricted.passwordChangeUser.session_token, "active-session-token");
  assert.equal(restricted.passwordChangeUser.must_change_password, true);
});

test("unrelated 403 response does not trigger password-change navigation", () => {
  assert.equal(
    buildRestrictedPasswordSession(
      { code: "PERMISSION_DENIED" },
      { session_token: "active-session-token", user: { id: 7 } }
    ),
    null
  );
});

test("global handler shows Change Password and stops normal Dashboard rendering", () => {
  assert.match(
    appSource,
    /responseData\?\.code === PASSWORD_CHANGE_REQUIRED_CODE[\s\S]*setShowPasswordChange\(true\);[\s\S]*setCurrentUser\(null\);/
  );
  assert.match(appSource, /if \(!currentUser\) \{[\s\S]*showPasswordChange \?/);
});

test("successful password change restores a normal Dashboard session", () => {
  const session = buildPasswordChangedSession(
    "same-session-token",
    { id: 7, username: "temporary_admin", must_change_password: true }
  );

  assert.equal(session.session_token, "same-session-token");
  assert.equal(session.user.must_change_password, false);
  assert.match(
    appSource,
    /setCurrentUser\(loginData\);[\s\S]*setShowPasswordChange\(false\);/
  );
});

test("GitHub Pages workflow runs tests before build and deploy", () => {
  const workflow = fs.readFileSync(
    path.join(dirname, "../.github/workflows/deploy.yml"),
    "utf8"
  );
  const testStep = workflow.indexOf("run: npm test");
  const buildStep = workflow.indexOf("npm run build");
  const deployStep = workflow.indexOf("uses: actions/deploy-pages@v4");
  assert.ok(testStep > 0);
  assert.ok(testStep < buildStep);
  assert.ok(buildStep < deployStep);
});
