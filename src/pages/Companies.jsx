import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { getDashboardAuthHeaders } from "../utils/dashboardAuth";
import { formatDateTime } from "../utils/dateTime";
import "./Companies.css";

const EMPTY_FORM = {
  company: { name: "", timezone: "Europe/Athens", status: "active" },
  administrator: { full_name: "", username: "", email: "", phone: "" },
};

function CompanyCreatedAt({ value }) {
  if (!value) return "—";

  const [date, time] = formatDateTime(value).split(", ");

  return (
    <span className="company-created-at">
      <span>{date}</span>
      {time && <span>{time}</span>}
    </span>
  );
}

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState("");
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [notice, setNotice] = useState("");

  const loadCompanies = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/companies`, {
        headers: getDashboardAuthHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to load companies");
      setCompanies(data.companies || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const updateSection = (section, field, value) => {
    setForm((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  };

  const createCompany = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getDashboardAuthHeaders() },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Company creation failed");
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setCredentials({ company: data.company, administrator: data.administrator, ...data.credentials });
      await loadCompanies();
    } catch (saveError) {
      setError(saveError.message || "Company creation failed");
    } finally {
      setSaving(false);
    }
  };

  const copyValue = async (label, value) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  };

  const changeCompanyStatus = async (company, newStatus) => {
    if (newStatus === company.status) return;
    if (newStatus === "inactive") {
      const confirmed = window.confirm(
        `Set ${company.name} to Inactive? All Dashboard users and Guards for this company will be signed out immediately, and tenant background operations will stop.`
      );
      if (!confirmed) return;
    }

    setStatusSavingId(company.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/companies/${company.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getDashboardAuthHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Company status change failed");
      setCompanies((current) => current.map((item) => (
        item.id === company.id ? { ...item, status: data.company.status } : item
      )));
      const shutdown = data.shutdown || {};
      setNotice(
        newStatus === "inactive"
          ? `${company.name} is inactive. Closed ${shutdown.dashboard_sessions || 0} Dashboard session(s), ${shutdown.guard_sessions || 0} Guard session(s), and ${shutdown.push_subscriptions || 0} push subscription(s).`
          : `${company.name} is now ${newStatus === "pilot" ? "Pilot" : "Active"}. New sign-ins and current-time operations are enabled.`
      );
    } catch (statusError) {
      setError(statusError.message || "Company status change failed");
    } finally {
      setStatusSavingId(null);
    }
  };

  const credentialsText = credentials
    ? `Aegis Link company: ${credentials.company.name}\nAdministrator: ${credentials.administrator.full_name}\nUsername: ${credentials.username}\nTemporary password: ${credentials.temporary_password}\nPassword change is required at first sign-in.`
    : "";

  return (
    <section className="companies-page">
      <header className="companies-header">
        <div>
          <span className="companies-eyebrow">SYSTEM OWNER</span>
          <h1>Companies Management</h1>
          <p>Create isolated tenants and their first Company Administrator.</p>
        </div>
        <button className="companies-primary" type="button" onClick={() => { setError(""); setShowCreate(true); }}>
          + New Company
        </button>
      </header>

      {error && <div className="companies-error" role="alert">{error}</div>}
      {notice && <div className="companies-notice" role="status">{notice}</div>}

      <div className="companies-table-wrap">
        <table className="companies-table">
          <thead>
            <tr><th>Company</th><th>Status</th><th>Timezone</th><th>Sites</th><th>Guards</th><th>Dashboard users</th><th>Created</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="7" className="companies-empty">Loading companies…</td></tr>}
            {!loading && companies.length === 0 && <tr><td colSpan="7" className="companies-empty">No companies have been created.</td></tr>}
            {!loading && companies.map((company) => (
              <tr key={company.id}>
                <td><strong>{company.name}</strong><small>Tenant #{company.id}</small></td>
                <td>
                  <select
                    className={`company-status-select company-status-${company.status}`}
                    aria-label={`Status for ${company.name}`}
                    value={company.status}
                    disabled={statusSavingId === company.id}
                    onChange={(event) => changeCompanyStatus(company, event.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="pilot">Pilot</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td>{company.timezone}</td>
                <td>{company.sites_count}</td>
                <td>{company.guards_count}</td>
                <td>{company.dashboard_users_count}</td>
                <td><CompanyCreatedAt value={company.created_at} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="companies-modal-backdrop" role="presentation">
          <form className="companies-modal" onSubmit={createCompany}>
            <header><div><span className="companies-eyebrow">NEW TENANT</span><h2>Create Company</h2></div><button type="button" aria-label="Close" onClick={() => setShowCreate(false)}>×</button></header>
            <div className="companies-form-grid">
              <fieldset>
                <legend>Company</legend>
                <label>Company name *<input required value={form.company.name} onChange={(event) => updateSection("company", "name", event.target.value)} /></label>
                <label>Timezone *<input required value={form.company.timezone} onChange={(event) => updateSection("company", "timezone", event.target.value)} placeholder="Europe/Athens" /></label>
                <label>Status<select value={form.company.status} onChange={(event) => updateSection("company", "status", event.target.value)}><option value="active">Active</option><option value="pilot">Pilot</option><option value="inactive">Inactive</option></select></label>
              </fieldset>
              <fieldset>
                <legend>First administrator</legend>
                <label>Full name *<input required value={form.administrator.full_name} onChange={(event) => updateSection("administrator", "full_name", event.target.value)} /></label>
                <label>Username *<input required autoComplete="off" value={form.administrator.username} onChange={(event) => updateSection("administrator", "username", event.target.value)} /></label>
                <label>Email<input type="email" value={form.administrator.email} onChange={(event) => updateSection("administrator", "email", event.target.value)} /></label>
                <label>Phone<input value={form.administrator.phone} onChange={(event) => updateSection("administrator", "phone", event.target.value)} /></label>
              </fieldset>
            </div>
            {error && <div className="companies-error" role="alert">{error}</div>}
            <p className="companies-note">Only the tenant and its first administrator are created. No sites, guards, patrols, incidents, or sample records are added.</p>
            <footer><button type="button" onClick={() => setShowCreate(false)} disabled={saving}>Cancel</button><button className="companies-primary" type="submit" disabled={saving}>{saving ? "Creating…" : "Create Company"}</button></footer>
          </form>
        </div>
      )}

      {credentials && (
        <div className="companies-modal-backdrop">
          <div className="companies-modal credentials-modal" role="dialog" aria-modal="true" aria-labelledby="credentials-title">
            <header><div><span className="companies-eyebrow">CREATED SUCCESSFULLY</span><h2 id="credentials-title">One-time credentials</h2></div></header>
            <p className="credentials-warning">Save these credentials now. The temporary password will not be shown again.</p>
            <dl><div><dt>Company</dt><dd>{credentials.company.name}</dd></div><div><dt>Administrator</dt><dd>{credentials.administrator.full_name}</dd></div><div><dt>Username</dt><dd><code>{credentials.username}</code><button type="button" onClick={() => copyValue("username", credentials.username)}>{copied === "username" ? "Copied" : "Copy"}</button></dd></div><div><dt>Temporary password</dt><dd><code>{credentials.temporary_password}</code><button type="button" onClick={() => copyValue("password", credentials.temporary_password)}>{copied === "password" ? "Copied" : "Copy"}</button></dd></div></dl>
            <footer><button type="button" onClick={() => copyValue("all", credentialsText)}>{copied === "all" ? "Credentials copied" : "Copy credentials"}</button><button className="companies-primary" type="button" onClick={() => setCredentials(null)}>I saved them — close</button></footer>
          </div>
        </div>
      )}
    </section>
  );
}

export default Companies;
