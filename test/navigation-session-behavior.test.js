import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { getDashboardSessionToken, hydrateDashboardSession, getPermittedDashboardMenus } from '../src/utils/dashboardAuth.js';
import { buildPasswordChangedSession, buildRestrictedPasswordSession, PASSWORD_CHANGE_REQUIRED_CODE } from '../src/utils/passwordChangeSession.js';

const source = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
function section(start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `missing source section ${start}`);
  return source.slice(a, b);
}
const login = section('const handleLogin =', 'const handlePasswordChange =');
const password = section('const handlePasswordChange =', 'const [dashboardMetrics');
const logout = section('const handleLogout =', 'const [activeMenu');
const restore = section('useEffect(() => {\n  if (!startupSession', 'const hasPermission');
const fallback = section('useEffect(() => {\n  if (!authorizationReady || !currentUser || menuItems', '\n\nuseEffect');
const position = section('useEffect(() => {\n  if (\n    !authorizationReady', '\n\n  useEffect');
const user = { id: 7, permissions: ['dashboard.view', 'analytics.view'], access_mode: 'standard' };
const session = { user, session_token: 'token', session: { token: 'token' } };

function harness(overrides = {}) {
  const storage = new Map([['aegis-active-menu', 'Analytics'], ['aegis-current-user', JSON.stringify(session)]]);
  const state = { activeMenu: 'Analytics', currentUser: null, authorizationReady: false };
  const requests = [];
  const context = {
    API_BASE_URL: 'https://backend.test',
    loginForm: { username: 'demo', password: 'temporary' },
    passwordChangeForm: { current_password: 'temporary', new_password: 'new-password', confirm_password: 'new-password' },
    passwordChangeUser: { id: 7, session_token: 'token' },
    startupSession: session,
    currentUser: session,
    activeMenu: 'Analytics',
    authorizationReady: true,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    readDashboardSession: () => JSON.parse(storage.get('aegis-current-user') || 'null'),
    getDashboardSessionToken, hydrateDashboardSession, buildPasswordChangedSession, buildRestrictedPasswordSession, PASSWORD_CHANGE_REQUIRED_CODE,
    console: { error() {} },
    useEffect: callback => { context.effectResult = callback(); },
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => url.endsWith('/auth/login') ? session : { auth: user } };
    },
  };
  for (const [, setter] of source.matchAll(/\b(set[A-Z]\w*)\(/g)) {
    context[setter] = value => {
      const key = setter[3].toLowerCase() + setter.slice(4);
      state[key] = value;
      context[key] = value;
    };
  }
  Object.assign(context, overrides);
  const sandbox = vm.createContext(context);
  return { storage, state, context, requests,
    run: code => vm.runInContext(code, sandbox),
    event: { preventDefault() {} },
  };
}

for (const access_mode of ['standard', 'read_only']) {
  test(`fresh ${access_mode} login resets saved Analytics in storage and state`, async () => {
    const data = { ...session, user: { ...user, access_mode } };
    const h = harness({ fetch: async () => ({ ok: true, json: async () => data }) });
    await h.run(`${login}\nhandleLogin`)(h.event);
    assert.equal(h.state.activeMenu, 'Dashboard');
    assert.equal(h.storage.get('aegis-active-menu'), 'Dashboard');
    assert.equal(h.state.authorizationReady, true);
    assert.equal(h.state.currentUser.user.access_mode, access_mode);
  });
}

test('failed login preserves navigation while leaving authorization inactive', async () => {
  const h = harness({ fetch: async () => ({ ok: false, json: async () => ({ message: 'Denied' }) }) });
  await h.run(`${login}\nhandleLogin`)(h.event);
  assert.equal(h.state.activeMenu, 'Analytics');
  assert.equal(h.storage.get('aegis-active-menu'), 'Analytics');
  assert.equal(h.state.currentUser, null);
});

for (const failure of [false, true]) {
  test(`logout finally resets navigation including tracking failure=${failure}`, async () => {
    const h = harness({ fetch: async () => { if (failure) throw new Error('offline'); return { ok: true }; } });
    await h.run(`${logout}\nhandleLogout`)();
    assert.equal(h.state.activeMenu, 'Dashboard');
    assert.equal(h.storage.get('aegis-active-menu'), 'Dashboard');
    assert.equal(h.storage.has('aegis-current-user'), false);
    assert.equal(h.state.currentUser, null);
    assert.equal(h.state.authorizationReady, false);
  });
}

test('startup context restoration preserves saved Analytics', async () => {
  const h = harness();
  h.run(restore);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.state.authorizationReady, true);
  assert.equal(h.state.currentUser.session_token, 'token');
  assert.equal(h.state.activeMenu, 'Analytics');
  assert.equal(h.storage.get('aegis-active-menu'), 'Analytics');
  assert.equal(h.requests[0].url, 'https://backend.test/auth/context');
  assert.doesNotMatch(restore, /setActiveMenu|aegis-active-menu/);
  assert.match(source, /return localStorage.getItem\("aegis-active-menu"\) \|\| "Dashboard"/);
});

test('fresh restricted login and same-session password completion open Dashboard', async () => {
  let restricted = true;
  const h = harness({ fetch: async url => ({ ok: true, json: async () => url.endsWith('/auth/login')
    ? { ...session, user: { ...user, must_change_password: restricted } }
    : { auth: user } }) });
  await h.run(`${login}\nhandleLogin`)(h.event);
  assert.equal(h.state.showPasswordChange, true);
  assert.equal(h.state.authorizationReady, false);
  restricted = false;
  // The handler reads the form state after the user enters and confirms a new password.
  h.context.passwordChangeForm = { current_password: 'temporary', new_password: 'new-password', confirm_password: 'new-password' };
  await h.run(`${password}\nhandlePasswordChange`)(h.event);
  assert.equal(h.state.activeMenu, 'Dashboard');
  assert.equal(h.storage.get('aegis-active-menu'), 'Dashboard');
  assert.equal(h.state.currentUser.session_token, 'token');
  assert.equal(h.state.authorizationReady, true);
  assert.equal(h.state.showPasswordChange, false);
});

test('permitted-menu fallback still applies if Dashboard is forbidden', () => {
  const menus = getPermittedDashboardMenus({ permissions: ['analytics.view'] });
  assert.deepEqual(menus, ['Analytics']);
  const h = harness({ activeMenu: 'Dashboard', menuItems: menus });
  h.run(fallback);
  assert.equal(h.state.activeMenu, 'Analytics');
});

test('navigation persistence and sidebar ref remain wired to the active menu', () => {
  assert.match(source, /import \{[^}]*useRef[^}]*\} from "react"/);
  assert.match(source, /const sidebarMenuRef = useRef\(null\)/);
  assert.match(source, /<ul ref=\{sidebarMenuRef\} className="sidebar-menu">/);
  assert.match(source, /onClick=\{\(\) => setActiveMenu\(item\)\}/);
  assert.match(source, /localStorage.setItem\("aegis-active-menu", activeMenu\)/);
  assert.match(position, /\[activeMenu, authorizationReady, currentUser\]/);
  assert.doesNotMatch(position, /setActiveMenu|scrollIntoView|window.scroll|localStorage/);
});

function positioning({ width = 390, ready = true, current = session, active = 'Analytics', menuPresent = true, itemPresent = true, scrollLeft = 0, itemLeft = 1100 } = {}) {
  const calls = [];
  const h = harness({
    authorizationReady: ready, currentUser: current, activeMenu: active,
    window: { matchMedia: query => { assert.equal(query, '(max-width: 768px)'); return { matches: width <= 768 }; } },
    sidebarMenuRef: { current: menuPresent ? {
      scrollLeft, clientLeft: 0, clientWidth: width,
      getBoundingClientRect: () => ({ left: 20 }),
      querySelector: selector => { assert.equal(selector, '.sidebar-item.active'); return itemPresent ? { getBoundingClientRect: () => ({ left: itemLeft, width: 100 }) } : null; },
      scrollTo: options => calls.push(options),
    } : null },
  });
  h.run(position);
  return { h, calls };
}

for (const width of [390, 768]) {
  test(`mobile ${width}px centers active item through horizontal container scroll only`, () => {
    const { h, calls } = positioning({ width, scrollLeft: 200, itemLeft: 900 });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].left, 200 + 900 - 20 - (width - 100) / 2);
    assert.equal(calls[0].behavior, 'auto');
    assert.equal('top' in calls[0], false);
    assert.equal(h.state.activeMenu, 'Analytics');
    assert.equal(h.storage.get('aegis-active-menu'), 'Analytics');
  });
}

test('mobile scroll clamps first item to zero', () => {
  assert.equal(positioning({ itemLeft: 20 }).calls[0].left, 0);
});

for (const options of [{ width: 769 }, { width: 1440 }, { ready: false }, { current: null }, { active: '' }, { menuPresent: false }, { itemPresent: false }]) {
  test(`positioning safely skips ${JSON.stringify(options)}`, () => {
    assert.equal(positioning(options).calls.length, 0);
  });
}
