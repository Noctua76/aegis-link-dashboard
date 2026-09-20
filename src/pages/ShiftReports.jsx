import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config/api";
import "./ShiftReports.css";

const authHeaders = () => {
  const current = JSON.parse(localStorage.getItem("aegis-current-user") || "{}");
  return { Authorization: `Bearer ${current.session_token || current.session?.token || ""}` };
};

const options = {
  category: ["OBSERVATION", "FACILITY_EQUIPMENT", "SECURITY_CONCERN", "HANDOVER_NOTE", "OTHER"],
  priority: ["NORMAL", "IMPORTANT"],
  status: ["NEW", "READ", "ACKNOWLEDGED"],
};

const label = (value) => String(value || "—").replaceAll("_", " ");
const when = (value) => value ? new Date(value).toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" }) : "—";

async function request(path, init = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init.headers },
  });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    const error = contentType.includes("json") ? await response.json() : {};
    throw new Error(error.message || "Request failed");
  }
  return contentType.includes("application/pdf") ? response.blob() : response.json();
}

function ShiftReports({ onUnreadCountChange }) {
  const current = JSON.parse(localStorage.getItem("aegis-current-user") || "{}");
  const readOnly = current?.user?.access_mode === "read_only";
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({ NEW: 0, READ: 0, ACKNOWLEDGED: 0, TODAY: 0 });
  const [filters, setFilters] = useState({ site_id: "", guard_id: "", from: "", to: "", category: "", priority: "", status: "" });
  const [selected, setSelected] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    return params.toString();
  }, [filters]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request(`/shift-reports${query ? `?${query}` : ""}`);
      setReports(data.reports || []);
      setSummary(data.summary || {});
      onUnreadCountChange?.(data.summary?.NEW || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, onUnreadCountChange]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const sites = useMemo(() => Array.from(new Map(reports.map((item) => [item.site_id, item.site_name])).entries()), [reports]);
  const guards = useMemo(() => Array.from(new Map(reports.map((item) => [item.guard_id, item.guard_name])).entries()), [reports]);

  const openReport = async (report) => {
    setError("");
    try {
      if (report.status === "NEW" && !readOnly) {
        await request(`/shift-reports/${report.id}/read`, { method: "PATCH" });
      }
      const data = await request(`/shift-reports/${report.id}`);
      setSelected(data.report);
      setImageUrls({});
      await loadReports();
    } catch (err) {
      setError(err.message);
    }
  };

  const acknowledge = async () => {
    try {
      await request(`/shift-reports/${selected.id}/acknowledge`, { method: "PATCH" });
      const data = await request(`/shift-reports/${selected.id}`);
      setSelected(data.report);
      await loadReports();
    } catch (err) {
      setError(err.message);
    }
  };

  const showImage = async (attachment) => {
    try {
      const data = await request(`/shift-reports/${selected.id}/attachments/${attachment.id}/url`);
      setImageUrls((value) => ({ ...value, [attachment.id]: data.url }));
    } catch (err) {
      setError(err.message);
    }
  };

  const exportPdf = async (path, filename) => {
    try {
      const blob = await request(path);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="shift-reports-page">
      <header className="shift-reports-header">
        <div><p className="shift-reports-eyebrow">OPERATIONAL NOTES</p><h1>Shift Reports</h1><p>Immutable guard observations and handover notes, owned by the active shift.</p></div>
        <button type="button" onClick={() => exportPdf(`/shift-reports/report/pdf${query ? `?${query}` : ""}`, "shift-reports.pdf")}>Export filtered PDF</button>
      </header>

      <section className="shift-report-kpis">
        {[['New', summary.NEW], ['Read', summary.READ], ['Acknowledged', summary.ACKNOWLEDGED], ['Today', summary.TODAY]].map(([name, value]) => <article key={name}><span>{name}</span><strong>{value || 0}</strong></article>)}
      </section>

      <section className="shift-report-filters">
        <label>Site<select value={filters.site_id} onChange={(event) => setFilters({ ...filters, site_id: event.target.value })}><option value="">All sites</option>{sites.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label>Guard<select value={filters.guard_id} onChange={(event) => setFilters({ ...filters, guard_id: event.target.value })}><option value="">All guards</option>{guards.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label>From<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })}/></label>
        <label>To<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })}/></label>
        {Object.entries(options).map(([key, values]) => <label key={key}>{key}<select value={filters[key]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}><option value="">All</option>{values.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>)}
      </section>

      {error && <div className="shift-report-error">{error}</div>}
      <section className="shift-report-list">
        {loading ? <div className="shift-report-empty">Loading Shift Reports…</div> : reports.length === 0 ? <div className="shift-report-empty">No Shift Reports match these filters.</div> : reports.map((report) => (
          <button className={`shift-report-row priority-${report.priority.toLowerCase()}`} key={report.id} type="button" onClick={() => openReport(report)}>
            <span className={`shift-report-status status-${report.status.toLowerCase()}`}>{label(report.status)}</span>
            <span><strong>{report.report_number}</strong><small>{report.site_name} · {report.guard_name}</small></span>
            <span><strong>{label(report.category)}</strong><small>{report.message}</small></span>
            <span><strong>{when(report.created_at)}</strong><small>{report.attachment_count} image(s)</small></span>
          </button>
        ))}
      </section>

      {selected && <div className="shift-report-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
        <article className="shift-report-detail">
          <button className="shift-report-close" type="button" onClick={() => setSelected(null)}>×</button>
          <p className="shift-reports-eyebrow">{selected.report_number}</p><h2>{label(selected.category)}</h2>
          <div className="shift-report-detail-grid"><div><span>Status</span><strong>{label(selected.status)}</strong></div><div><span>Priority</span><strong>{label(selected.priority)}</strong></div><div><span>Site</span><strong>{selected.site_name}</strong></div><div><span>Guard</span><strong>{selected.guard_name}</strong></div><div><span>Created</span><strong>{when(selected.created_at)}</strong></div><div><span>Shift</span><strong>{when(selected.scheduled_shift_start)} → {when(selected.scheduled_shift_end)}</strong></div></div>
          <p className="shift-report-note">{selected.message}</p>
          {!!selected.attachments?.length && <div className="shift-report-images">{selected.attachments.map((attachment) => imageUrls[attachment.id] ? <a key={attachment.id} href={imageUrls[attachment.id]} target="_blank" rel="noreferrer"><img src={imageUrls[attachment.id]} alt={attachment.original_filename || "Shift Report"}/></a> : <button key={attachment.id} type="button" onClick={() => showImage(attachment)}>Load secure image</button>)}</div>}
          <div className="shift-report-actions"><button type="button" onClick={() => exportPdf(`/shift-reports/${selected.id}/report/pdf`, `${selected.report_number}.pdf`)}>Download PDF</button>{selected.status === "READ" && !readOnly && <button className="primary" type="button" onClick={acknowledge}>Acknowledge</button>}</div>
          <div className="shift-report-audit"><h3>Audit</h3>{selected.events?.map((event) => <p key={event.id}>{label(event.event_type)} · {when(event.created_at)}</p>)}</div>
        </article>
      </div>}
    </div>
  );
}

export default ShiftReports;
