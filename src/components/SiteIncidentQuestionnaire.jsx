import {useEffect,useRef,useState} from 'react';
import {API_BASE_URL} from '../config/api';
import {getDashboardSessionToken,hasDashboardPermission} from '../utils/dashboardAuth';
const empty={title:'Incident Questionnaire',questions:[]};
const identityOf=session=>JSON.stringify([getDashboardSessionToken(session),session?.user?.effective_company_id,session?.user?.tenant_context_company_id]);
const limitText=(value,max)=>[...value].slice(0,max).join('');
const cleanQuestion=q=>({id:q.id,prompt:q.prompt,help:q.help||'',type:q.type,required:q.required,maxLength:q.maxLength});
export default function SiteIncidentQuestionnaire({site,session}){
 const identity=identityOf(session);const generation=useRef(0);const current=useRef(identity);current.current=identity;
 const [state,setState]=useState({identity:null,info:null,content:empty,draftRevision:0,dirty:false,editable:false,busy:false,error:'',history:null,events:null,preview:false});
 const can=code=>hasDashboardPermission(session?.user,code);
 const readable=can('sites.view')&&can('questionnaires.view');
 const writable=session?.user?.access_mode!=='read_only'&&(!session?.user?.tenant_context_active||session?.user?.tenant_context_can_mutate)&&site.status==='active';
 const write=code=>writable&&can('sites.manage')&&can(code);
 const endpoint=`${API_BASE_URL}/settings/sites/${site.id}/incident-questionnaire`;
 const alive=stamp=>stamp===generation.current&&identity===current.current;
 async function request(path='',method='GET',body,url=endpoint+path){
  const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),8000);
  try{
  const response=await fetch(url,{method,signal:abort.signal,cache:'no-store',headers:{Authorization:`Bearer ${getDashboardSessionToken(session)}`, ...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();if(!response.ok||data.status!=='ok')throw new Error(data.code||'QUESTIONNAIRE_UNAVAILABLE');return data;
  }finally{clearTimeout(timeout);}
 }
 async function load(){const stamp=generation.current;
  try{const info=await request();if(!alive(stamp))return;
   const content=info.draft?{title:info.draft.title,questions:info.draft.questions.map(cleanQuestion)}:{title:info.version.title,questions:info.version.questions.map(cleanQuestion)};
   setState({identity,info,content,draftRevision:info.draftRevision,dirty:false,editable:Boolean(info.draft)||info.assignment.mode==='CUSTOM',busy:false,error:'',history:null,events:null,preview:false});
  }catch(e){if(alive(stamp))setState(s=>({...s,identity,busy:false,error:e.message}));}
 }
 useEffect(()=>{generation.current++;setState({identity,info:null,content:empty,draftRevision:0,dirty:false,editable:false,busy:true,error:'',history:null,events:null,preview:false});if(readable)void load();return()=>{generation.current++;};},[identity,site.id,readable]);
 if(!readable)return null;
 if(state.identity!==identity)return <section aria-busy="true">Loading questionnaire…</section>;
 const patch=change=>setState(s=>({...s,...change,dirty:true,error:''}));
 const update=(index,change)=>patch({content:{...state.content,questions:state.content.questions.map((q,i)=>i===index?{...q,...change}:q)}});
 const move=(index,offset)=>{const rows=[...state.content.questions];const next=index+offset;if(next<0||next>=rows.length)return;[rows[index],rows[next]]=[rows[next],rows[index]];patch({content:{...state.content,questions:rows}});};
 const custom=()=>{
  const stored=state.info.draft||(state.info.assignment.mode==='CUSTOM'?state.info.version:null);
  patch({editable:true,content:stored?{title:stored.title,questions:stored.questions.map(cleanQuestion)}:{title:state.content.title,questions:state.content.questions.map(q=>({...q,id:crypto.randomUUID()}))}});
 };
 async function selectDefault(){
  if(state.dirty&&!window.confirm('Discard unsaved editor changes and preview the current platform default? Saved drafts remain preserved.'))return;
  const stamp=generation.current;setState(s=>({...s,busy:true,error:''}));
  try{const data=await request('','GET',undefined,`${API_BASE_URL}/settings/incident-questionnaire-default`);if(alive(stamp))setState(s=>({...s,editable:false,dirty:false,busy:false,preview:true,content:{title:data.version.title,questions:data.version.questions.map(cleanQuestion)}}));}
  catch(e){if(alive(stamp))setState(s=>({...s,busy:false,error:e.message}));}
 }

 async function action(kind){
  const stamp=generation.current;setState(s=>({...s,busy:true,error:''}));
  try{
   if(kind==='save'){const result=await request('/draft','PUT',{expectedRevision:state.draftRevision,content:state.content});if(alive(stamp))setState(s=>({...s,draftRevision:result.draftRevision,dirty:false,busy:false}));return;}
   if(kind==='publish'){if(!window.confirm(`Publish this questionnaire for ${site.name}? Only future incidents will use this version.`)){if(alive(stamp))setState(s=>({...s,busy:false}));return;}await request('/publish','POST',{expectedDraftRevision:state.draftRevision,expectedAssignmentRevision:state.info.assignment.sequence});}
   if(kind==='restore'){if(!window.confirm(`Restore platform default for ${site.name}? Historical versions and incidents are retained.`)){if(alive(stamp))setState(s=>({...s,busy:false}));return;}await request('/restore-default','POST',{expectedAssignmentRevision:state.info.assignment.sequence,reason:'RESTORE_PLATFORM_DEFAULT'});}
   if(alive(stamp))await load();
  }catch(e){if(alive(stamp))setState(s=>({...s,busy:false,error:e.message}));}
 }
 async function showHistory(versionId){const stamp=generation.current;try{const data=await request('/versions/'+encodeURIComponent(versionId));if(alive(stamp))setState(s=>({...s,history:data.version}));}catch(e){if(alive(stamp))setState(s=>({...s,error:e.message}));}}
 return <section className="settings-card" style={{width:'100%'}} aria-label="Incident Questionnaire">
  <h4>Incident Questionnaire</h4>
  {state.error&&<p role="alert">{state.error}. Reload the current configuration before retrying an unconfirmed operation.</p>}
  {!state.info?<p>Questionnaire engine is not available.</p>:<>
   <p>{state.info.assignment.mode==='DEFAULT'?'Platform default':'Site custom'} · Assignment {state.info.assignment.sequence} · {state.info.history?.[0]?.created_at||''}</p>
   <p>Active version {state.info.version.number||'—'} · Published {state.info.version.publishedAt||'—'} · Actor {state.info.version.publishedBy||'—'}</p>
   <button type="button" disabled={state.busy} onClick={()=>void load()}>Reload current configuration</button>
   <label>Configuration <select disabled={!write('questionnaires.draft')||state.busy} value={state.editable?'custom':'default'} onChange={e=>e.target.value==='custom'?custom():void selectDefault()}><option value="default">Platform default</option><option value="custom">Customize for this site</option></select></label>
   <p>Editing and saving a draft does not change the published questionnaire. Use Restore Default to change the active assignment.</p>
   <fieldset disabled={!state.editable||!write('questionnaires.draft')||state.busy}>
    <label>Title <input value={state.content.title} onChange={e=>patch({content:{...state.content,title:limitText(e.target.value,120)}})}/></label>
    {state.content.questions.map((q,index)=><div key={q.id} className="settings-item" style={{display:'block'}}>
     <label>Question {index+1}<textarea value={q.prompt} onChange={e=>update(index,{prompt:limitText(e.target.value,500)})}/></label>
     <label>Help <input value={q.help} onChange={e=>update(index,{help:limitText(e.target.value,240)})}/></label>
     <label>Text type <select value={q.type} onChange={e=>update(index,{type:e.target.value,maxLength:Math.min(q.maxLength,e.target.value==='SHORT_TEXT'?500:5000)})}><option value="SHORT_TEXT">Short text</option><option value="LONG_TEXT">Long text</option></select></label>
     <label><input type="checkbox" checked={q.required} onChange={e=>update(index,{required:e.target.checked})}/>Required</label>
     <label>Maximum answer length <input type="number" min="1" max={q.type==='SHORT_TEXT'?500:5000} value={q.maxLength} onChange={e=>update(index,{maxLength:Number(e.target.value)})}/></label>
     <button type="button" disabled={index===0} onClick={()=>move(index,-1)}>Move up</button><button type="button" disabled={index===state.content.questions.length-1} onClick={()=>move(index,1)}>Move down</button>
     <button type="button" disabled={state.content.questions.length<=1} onClick={()=>patch({content:{...state.content,questions:state.content.questions.filter((_,i)=>i!==index)}})}>Remove</button>
    </div>)}
    <button type="button" disabled={state.content.questions.length>=12} onClick={()=>patch({content:{...state.content,questions:[...state.content.questions,{id:crypto.randomUUID(),prompt:'',help:'',type:'LONG_TEXT',required:true,maxLength:5000}]}})}>Add question</button>
   </fieldset>
   <button type="button" disabled={!write('questionnaires.draft')||!state.editable||state.busy||!state.dirty} onClick={()=>action('save')}>Save Draft</button>
   <button type="button" disabled={!write('questionnaires.publish')||!state.editable||state.dirty||!state.draftRevision||state.busy} onClick={()=>action('publish')}>Publish</button>
   <button type="button" disabled={!write('questionnaires.restore')||state.busy} onClick={()=>action('restore')}>Restore Default</button>
   <button type="button" onClick={()=>setState(s=>({...s,preview:!s.preview}))}>Guard App preview</button>
   {state.preview&&<div aria-label="Synthetic Guard preview"><p>Synthetic preview only. No incident or submission is created.</p>{state.content.questions.map(q=><label key={q.id}>{q.prompt} · {q.required?'Required':'Optional'}<textarea readOnly value="Synthetic preview answer"/>{q.help}</label>)}</div>}
   <h5>Version history</h5>{state.info.history?.map(v=><p key={v.id}><button type="button" onClick={()=>showHistory(v.version_id)}>Version {v.version_number} · {v.mode} · {v.created_at}</button></p>)}
   {state.history&&<div aria-label="Historical version"><strong>{state.history.title}</strong>{state.history.questions.map(q=><p key={q.id}>{q.position}. {q.prompt} · {q.required?'Required':'Optional'} · {q.provenance}</p>)}</div>}
   {can('audit_logs.view')&&<button type="button" onClick={async()=>{const stamp=generation.current;try{const data=await request('/audit');if(alive(stamp))setState(s=>({...s,events:data.events}));}catch(e){if(alive(stamp))setState(s=>({...s,error:e.message}));}}}>Audit metadata</button>}
   {state.events?.map(e=><p key={e.id}>{e.action} · Actor {e.actor_id} · {e.created_at} · {e.outcome}</p>)}
  </>}
 </section>;
}
