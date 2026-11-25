// Every dynamic report value is untrusted text; only generated fragments are HTML.
export function escapeReportText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function createIncidentReportHtml(data, currentUser, logoDataUrl = "", nonce = globalThis.crypto.randomUUID().replaceAll("-", "")) {
  if (!/^[a-zA-Z0-9]{16,80}$/.test(nonce)) throw new Error("Invalid report nonce");
    const logoUrl = /^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(logoDataUrl) ? logoDataUrl : "";

    const timelineHtml = (data.timeline || [])
      .map(
        (item) => `
          <tr>
            <td>${escapeReportText(item.display_time)}</td>
            <td>
  ${escapeReportText(
    item.event === "Voice Call online"
      ? "Voice Call Completed"
      : item.event
  )}
</td>
          </tr>
        `
      )
      .join("");

    const responsesHtml = (data.guard_responses || [])
      .map(
        (item) => `
          <div style="margin-bottom:12px">
            <strong>${escapeReportText(item.question_text)}</strong><br/>
            <small>${escapeReportText(item.provenance || "Legacy response")}${escapeReportText(item.position ? " · Question " + item.position : "")}${escapeReportText(item.required === false ? " · Optional" : "")}</small><br/>
            ${escapeReportText(item.answer)}
          </div>
        `
      )
      .join("");

      const incidentLocationHtml =
  data.incident?.incident_latitude && data.incident?.incident_longitude
    ? `
      <h2>Incident Location</h2>

      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Address</span>
          <span class="value">${escapeReportText(data.incident.incident_address || "-")}</span>
        </div>

        <div class="summary-item">
          <span class="label">Coordinates</span>
          <span class="value">
            ${escapeReportText(data.incident.incident_latitude)}, ${escapeReportText(data.incident.incident_longitude)}
          </span>
        </div>

        <div class="summary-item">
          <span class="label">Accuracy</span>
          <span class="value">${escapeReportText(data.incident.incident_accuracy || "-")}m</span>
        </div>

        <div class="summary-item">
          <span class="label">Battery</span>
          <span class="value">${escapeReportText(data.incident.incident_battery_level || "-")}%</span>
        </div>

        <div class="summary-item">
          <span class="label">Snapshot Time</span>
          <span class="value">${escapeReportText(data.incident.incident_location_timestamp_display || "-")}</span>
        </div>

        <div class="summary-item">
          <span class="label">Map</span>
          <span class="value">
            https://www.google.com/maps?q=${escapeReportText(data.incident.incident_latitude)},${escapeReportText(data.incident.incident_longitude)}
          </span>
        </div>
      </div>
    `
    : "";

    const reportHtml = `
      <html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'" />
    <title>${escapeReportText(data.report_title)}</title>

    <style>
      @page {
        margin: 16mm;
      }

      body {
  font-family: Arial, sans-serif;
  color: #111;
  margin: 0;
  padding: 28px 34px;
  box-sizing: border-box;
}

      .report-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 3px solid #111827;
        padding-bottom: 18px;
        margin-bottom: 28px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .brand img {
        width: 58px;
        height: 58px;
        object-fit: contain;
      }

      .brand-title h1 {
        margin: 0;
        font-size: 28px;
        letter-spacing: 1px;
      }

      .brand-title p {
        margin: 4px 0 0;
        color: #555;
        font-size: 14px;
      }

      .report-meta {
        text-align: right;
        font-size: 13px;
        color: #444;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 28px;
        margin-bottom: 28px;
      }

      .summary-item {
        border-bottom: 1px solid #eee;
        padding-bottom: 8px;
      }

      .label {
        display: block;
        font-size: 11px;
        text-transform: uppercase;
        color: #666;
        letter-spacing: .6px;
        margin-bottom: 3px;
      }

      .value {
        font-size: 15px;
        font-weight: 600;
      }

      h2 {
        margin-top: 30px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
        font-size: 18px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }

      td {
        border-bottom: 1px solid #eee;
        padding: 9px 8px;
        font-size: 14px;
        vertical-align: top;
      }

      .notes {
        white-space: pre-line;
        line-height: 1.5;
      }

      .footer {
        margin-top: 36px;
        padding-top: 14px;
        border-top: 1px solid #ddd;
        font-size: 12px;
        color: #555;
        display: flex;
        justify-content: space-between;
      }

      .preview-toolbar {
  position: sticky;
  top: 0;
  z-index: 999;
  background: #111827;
  padding: 12px;
  text-align: right;
  margin: -28px -34px 24px;
}

.preview-toolbar button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

      @media print {
      .preview-toolbar {
  display: none;
}
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          padding: 0;
        }
      }
    </style>
  </head>

  <body>
  <div class="preview-toolbar">
  <button id="print-report">Print / Save as PDF</button>
</div>
    <div class="report-header">
      <div class="brand">
      <img src="${logoUrl}" alt="Aegis Link Logo" />
        <div class="brand-title">
          <h1>AEGIS LINK</h1>
          <p>Security Operations Platform</p>
        </div>
      </div>

      <div class="report-meta">
        <strong>Security Incident Report</strong><br/>
        Report ID: ${escapeReportText(data.report_id)}<br/>
        Generated: ${escapeReportText(data.generated_at_display)}<br/>
        Generated By: ${escapeReportText(currentUser?.user?.username || currentUser?.username || "-")}
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-item">
        <span class="label">Incident Ref</span>
        <span class="value">${escapeReportText(data.incident.incident_ref)}</span>
      </div>

      <div class="summary-item">
        <span class="label">Duration</span>
        <span class="value">${escapeReportText(data.incident.duration_display)}</span>
      </div>

      <div class="summary-item">
        <span class="label">Site</span>
        <span class="value">${escapeReportText(data.incident.site)}</span>
      </div>

      <div class="summary-item">
        <span class="label">Guard</span>
        <span class="value">${escapeReportText(data.incident.guard)}</span>
      </div>

      <div class="summary-item">
        <span class="label">Status</span>
        <span class="value">${escapeReportText(data.incident.status)}</span>
      </div>

      <div class="summary-item">
        <span class="label">Priority</span>
        <span class="value">${escapeReportText(data.incident.priority)}</span>
      </div>

      <div class="summary-item">
        <span class="label">Triggered</span>
        <span class="value">${escapeReportText(data.incident.trigger_time_display)}</span>
      </div>

      <div class="summary-item">
        <span class="label">Resolved</span>
        <span class="value">${escapeReportText(data.incident.resolved_time_display)}</span>
      </div>
    </div>

    ${incidentLocationHtml}

    <h2>Incident Timeline</h2>
    <table>
      ${timelineHtml}
    </table>

    <h2>Guard Responses</h2>
    <p>Questionnaire version: ${escapeReportText(data.questionnaire?.versionId || "Legacy unversioned")}</p>
    ${responsesHtml}

    <h2>Investigation Notes</h2>

    <p><strong>Supervisor:</strong> ${escapeReportText(data.investigation?.supervisor_name || "-")}</p>

    <p>
      <strong>Supervisor Notes:</strong><br/>
      <span class="notes">${escapeReportText(data.investigation?.supervisor_notes || "-")}</span>
    </p>

    <p>
      <strong>Guard Notes:</strong><br/>
      <span class="notes">${escapeReportText(data.investigation?.guard_notes || "-")}</span>
    </p>

    <p>
      <strong>Residence Notes:</strong><br/>
      <span class="notes">${escapeReportText(data.investigation?.residence_notes || "-")}</span>
    </p>

    <p>
      <strong>Admin Notes:</strong><br/>
      <span class="notes">${escapeReportText(data.investigation?.admin_notes || "-")}</span>
    </p>

    <h2>Resolution Summary</h2>

    <p><strong>Approved By:</strong> ${escapeReportText(data.investigation?.approved_by || "-")}</p>
    <p><strong>Approved At:</strong> ${escapeReportText(data.investigation?.approved_at_display || "-")}</p>

    <div class="footer">
      <span>Aegis Link Security Operations Platform</span>
      <span>Generated Automatically</span>
    </div>

    <script nonce="${nonce}">
      document.getElementById('print-report').addEventListener('click', () => window.print());
    </script>
  </body>
</html>
        `;


 return reportHtml;
}
