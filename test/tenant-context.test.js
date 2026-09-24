import test from "node:test";
import assert from "node:assert/strict";
import {
  canAccessDashboardMenu, getPermittedDashboardMenus,
  hasDashboardPermission, hydrateDashboardSession,
} from "../src/utils/dashboardAuth.js";

const owner = { role: "system_owner", permissions: ["*"], company_id: 1 };
const token = { session: { token: "test-token" }, user: owner };

test("server context determines effective company across restored sessions", () => {
  const restored = hydrateDashboardSession(token, { ...owner, tenant_context_active: true,
    actor_company_id: 1, effective_company_id: 8, tenant_context_company_id: 8,
    tenant_context_company_name: "Defensor", tenant_context_mode: "read_only",
    tenant_context_can_mutate: false });
  assert.equal(restored.user.company_id, 1);
  assert.equal(restored.user.effective_company_id, 8);
  assert.equal(restored.user.tenant_context_company_name, "Defensor");
  assert.equal(canAccessDashboardMenu(restored.user, "Companies"), false);
  assert.equal(getPermittedDashboardMenus(restored.user).includes("Companies"), false);
  assert.equal(hasDashboardPermission(restored.user, "sites.view"), true);
  assert.equal(hasDashboardPermission(restored.user, "sites.manage"), false);
  assert.equal(hasDashboardPermission(restored.user, "shift_reports.acknowledge"), false);
  const elevated = { ...restored.user, tenant_context_can_mutate: true, tenant_context_mode: "administrative" };
  assert.equal(hasDashboardPermission(elevated, "sites.manage"), true);
  assert.equal(canAccessDashboardMenu(owner, "Companies"), true);
});
