import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createRequire} from 'node:module';
import {createIncidentReportHtml} from '../src/utils/incidentReportHtml.js';
const attack='</script><img src="https://canary.invalid/leak" onerror="parent.pwned=true"><script>parent.pwned=true</script>';
function fixture(){return {report_title:attack,report_id:attack,generated_at_display:attack,incident:{incident_ref:attack,site:attack,guard:attack},investigation:{guard_notes:attack},timeline:[{display_time:attack,event:attack}],guard_responses:[{question_text:attack,answer:attack}]};}
test('actual Chromium report frame isolates parent auth and blocks adversarial requests',async()=>{
 const require=createRequire(import.meta.url);
 const puppeteer=require(process.env.AEGIS_PUPPETEER_MODULE || 'puppeteer');
 const server=http.createServer((_req,res)=>{res.setHeader('Cache-Control','no-store');res.end('<!doctype html><title>Synthetic harness</title>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
 browser=await puppeteer.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();const requests=[];
  page.on('request',r=>requests.push(r.url()));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.evaluate(html=>{window.pwned=false;localStorage.setItem('synthetic-auth','canary');const f=document.createElement('iframe');f.sandbox='allow-scripts allow-modals';f.srcdoc=html;document.body.append(f);},createIncidentReportHtml(fixture(),{username:attack},'', '0123456789abcdef'));
  const frame=await page.waitForFrame(f=>f.url()==='about:srcdoc');
  await frame.waitForSelector('#print-report');
  assert.equal(await page.evaluate(()=>window.pwned),false);
  assert.equal(await frame.evaluate(()=>{try{return parent.localStorage.getItem('synthetic-auth');}catch{return 'DENIED';}}),'DENIED');
  assert.equal(await frame.evaluate(()=>document.querySelectorAll('img[src^="https:"]').length),0);
  assert.ok(!requests.some(u=>u.includes('canary.invalid')));
  assert.ok((await frame.evaluate(()=>document.body.textContent)).includes(attack));
  // The sole nonce-authorized script preserves printing without same-origin access.
  assert.equal(await frame.evaluate(()=>{let calls=0;window.print=()=>calls++;document.querySelector('#print-report').click();return calls;}),1);
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
});
