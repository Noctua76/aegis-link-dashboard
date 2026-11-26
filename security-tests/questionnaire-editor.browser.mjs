import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const require=createRequire(import.meta.url);
const puppeteer=require(process.env.AEGIS_PUPPETEER_MODULE||'puppeteer');
const prompt='Synthetic <img src="https://canary.invalid/secret" onerror="window.pwned=true">';
const question={id:'11111111-1111-4111-8111-111111111111',prompt,help:'Synthetic help',type:'LONG_TEXT',required:true,maxLength:5000};
const version={id:'22222222-2222-4222-8222-222222222222',title:'Synthetic default',questions:[question]};
const permissions=['sites.view','sites.manage','questionnaires.view','questionnaires.draft','questionnaires.publish','questionnaires.restore','audit_logs.view'];
test('actual Chromium editor: synthetic preview, safe rendering, draft/publish isolation and late-context fencing',async()=>{
 const entry=`import React from 'react';import '/src/pages/Settings.css';import{createRoot}from'react-dom/client';import Editor from '/src/components/SiteIncidentQuestionnaire.jsx';
 const root=createRoot(document.getElementById('root'));window.showSession=(company=1,permissions=${JSON.stringify(permissions)})=>root.render(React.createElement(Editor,{site:{id:company,status:'active',name:'Synthetic site '+company},session:{session_token:'synthetic-'+company,user:{effective_company_id:company,permissions}}}));window.showSession();`;
 const server=await createServer({root:fileURLToPath(new URL('..',import.meta.url)),server:{host:'127.0.0.1',port:0},plugins:[{name:'synthetic-questionnaire-harness',resolveId(id){if(id==='/__q-test-entry.jsx')return id;},load(id){if(id==='/__q-test-entry.jsx')return entry;},configureServer(s){s.middlewares.use('/__q-test',async(_req,res,next)=>{
  if(_req.url!=='/'&&_req.url!=='')return next();
  res.setHeader('Content-Type','text/html');res.end(await s.transformIndexHtml('/__q-test',`<!doctype html><div id="root" class="settings-card"></div><script type="module" src="/__q-test-entry.jsx"></script>`));
 });}}]});
 let browser;const requests=[],external=[];let draft=null,draftRevision=0,sequence=1,mode='DEFAULT',failPublish=true,pause=false,release;
 try{
  await server.listen();const origin=`http://127.0.0.1:${server.httpServer.address().port}`;
  browser=await puppeteer.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage();
  await page.setRequestInterception(true);page.on('request',async r=>{
   const url=new URL(r.url());if(!url.pathname.includes('incident-questionnaire')){if(r.url().startsWith(origin)||/^(data:|about:)/.test(r.url()))return r.continue();external.push(r.url());return r.abort();}
   requests.push({path:url.pathname,method:r.method(),token:r.headers().authorization});
   if(r.method()==='OPTIONS')return r.respond({status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, PUT, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type'}});
   let status=200,data={status:'ok'};const body=r.postData()?JSON.parse(r.postData()):null;
   if(url.pathname.endsWith('incident-questionnaire-default'))data.version={...version,title:'Current platform default',questions:[{...question,prompt:'Distinct current platform default'}]};
   else if(r.method()==='PUT'){draft=body.content;draftRevision++;data.draftRevision=draftRevision;}
   else if(url.pathname.endsWith('/publish')){if(failPublish){status=409;data={status:'error',code:'ASSIGNMENT_REVISION_CONFLICT'};}else{sequence++;mode='CUSTOM';}}
   else if(url.pathname.endsWith('/audit'))data.events=[];
   else {data={status:'ok',assignment:{mode,sequence},version,draft,draftRevision,history:[]};if(pause){pause=false;await new Promise(resolve=>release=resolve);}}
   await r.respond({status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Authorization,Content-Type'},body:JSON.stringify(data)});
  });
  await page.goto(origin+'/__q-test');
  await page.waitForSelector('button.iq-trigger',{visible:true});
  assert.equal(await page.$('dialog[open]'),null);

  await page.click('button.iq-trigger');
  await page.waitForSelector('dialog.iq-dialog[open] select',{visible:true});

  await page.keyboard.press('Escape');
  await page.waitForSelector('dialog.iq-dialog[open]',{hidden:true});

  await page.click('button.iq-trigger');
  await page.waitForSelector('dialog.iq-dialog[open] select',{visible:true});

  await page.setViewport({width:390,height:844});
  const layout=await page.$eval('dialog.iq-dialog',d=>{
    const rect=d.getBoundingClientRect();
    const footer=d.querySelector('.iq-footer').getBoundingClientRect();
    const body=d.querySelector('.iq-body');
    return {
      fits:rect.left>=0 && rect.right<=window.innerWidth &&
           rect.top>=0 && rect.bottom<=window.innerHeight,
      footerVisible:footer.bottom<=window.innerHeight,
      noOverflow:body.scrollWidth<=body.clientWidth+1
    };
  });

  assert.ok(layout.fits,'Mobile modal must fit the viewport');
  assert.ok(layout.footerVisible,'Footer must remain visible');
  assert.ok(layout.noOverflow,'No horizontal overflow');

  assert.equal(
    await page.$eval('.iq-primary',e=>getComputedStyle(e).backgroundColor),
    'rgb(37, 99, 235)'
  );

  await page.setViewport({width:1280,height:900});
  const select='section[aria-label="Incident Questionnaire"] select';await page.select(select,'custom');
  assert.equal(await page.evaluate(()=>window.pwned),undefined);assert.equal(await page.$eval('textarea',e=>e.value),prompt);
  // Native setter is required for React's controlled input value tracker.
  await page.$eval('textarea',e=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(e,'Synthetic edited prompt 😀');e.dispatchEvent(new Event('input',{bubbles:true}));});
  const click=async text=>{await page.evaluate(text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text).click(),text);};
  await click('Save Draft');await page.waitForFunction(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Publish')?.disabled===false);assert.equal(draft.questions[0].prompt,'Synthetic edited prompt 😀');
  page.on('dialog',d=>d.accept());await click('Publish');await page.waitForSelector('[role="alert"]');assert.equal(sequence,1);assert.equal(mode,'DEFAULT');
  failPublish=false;await click('Publish');await page.waitForFunction(()=>document.body.textContent.includes('Site custom · Assignment 2'));assert.equal(sequence,2);
  await page.select(select,'default');await page.waitForFunction(()=>[...document.querySelectorAll('textarea')].some(e=>e.value==='Distinct current platform default'));assert.equal(mode,'CUSTOM','previewing default must not publish or restore');
  await click('Guard App preview');assert.ok(!requests.some(r=>/alert|submission/.test(r.path)));assert.deepEqual(external,[]);
  // A delayed response for company 2 must not return into company 3's editor.
  pause=true;await page.evaluate(()=>window.showSession(2));await page.waitForFunction(()=>document.body.textContent.includes('Loading questionnaire…'));await new Promise(r=>setTimeout(r,100));
  assert.equal(typeof release,'function');await page.evaluate(()=>window.showSession(3));await page.waitForFunction(()=>document.body.textContent.includes('Incident Questionnaire')&&document.querySelector('select'));
  release();await new Promise(r=>setTimeout(r,50));assert.equal(await page.$eval('select',e=>e.value),'custom');
  const before=requests.length;await page.evaluate(()=>window.showSession(4,[]));await page.waitForFunction(()=>!document.querySelector('section'));await new Promise(r=>setTimeout(r,50));assert.equal(requests.length,before,'no content request without view permission');
 }finally{await browser?.close();await server.close();}
});
