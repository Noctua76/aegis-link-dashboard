import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createIncidentReportHtml, escapeReportText } from '../src/utils/incidentReportHtml.js';
const attack = '</script><img src="https://canary.invalid/leak" onerror="parent.pwned=true"><script>parent.pwned=true</script>';
function fixture() {
  return {report_title:attack,report_id:attack,generated_at_display:attack,
    incident:Object.fromEntries(['incident_ref','duration_display','site','guard','status','priority','trigger_time_display','resolved_time_display','incident_latitude','incident_longitude','incident_accuracy','incident_address','incident_location_timestamp_display','incident_battery_level'].map(k=>[k,attack])),
    investigation:Object.fromEntries(['supervisor_name','supervisor_notes','guard_notes','residence_notes','admin_notes','approved_by','approved_at_display'].map(k=>[k,attack])),
    timeline:[{display_time:attack,event:attack}],guard_responses:[{question_text:attack,answer:attack}]};
}
test('every report data field is escaped, with no inline event handlers or untrusted URLs',()=>{
 const html=createIncidentReportHtml(fixture(),{username:attack},'https://canary.invalid/logo','0123456789abcdef');
 assert.ok(html.includes(escapeReportText(attack)));
 assert.ok(!html.includes(attack));
 assert.ok(!html.includes('onclick='));
 assert.match(html,/default-src 'none'/); assert.match(html,/connect-src 'none'/);
 assert.match(html,/script-src 'nonce-0123456789abcdef'/);
 assert.match(fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8'),/sandbox="allow-scripts allow-modals"/);
 assert.throws(()=>createIncidentReportHtml(fixture(),{},'',"\"bad"));
});
