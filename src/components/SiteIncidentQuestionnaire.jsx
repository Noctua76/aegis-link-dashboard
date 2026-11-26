import {useEffect,useRef,useState} from 'react';
import './SiteIncidentQuestionnaire.css';
import {API_BASE_URL} from '../config/api';
import {getDashboardSessionToken,hasDashboardPermission} from '../utils/dashboardAuth';
const empty={title:'Incident Questionnaire',questions:[]};
const identityOf=session=>JSON.stringify([getDashboardSessionToken(session),session?.user?.effective_company_id,session?.user?.tenant_context_company_id]);
const limitText=(value,max)=>[...value].slice(0,max).join('');
const cleanQuestion=q=>({id:q.id,prompt:q.prompt,help:q.help||'',type:q.type,required:q.required,maxLength:q.maxLength});
export default function SiteIncidentQuestionnaire({site,session}){
 const dialogRef = useRef(null);
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
  const ready = state.identity === identity;
 const busy = !ready || state.busy;

 const formatDate = value => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
   day: '2-digit',
   month: 'short',
   year: 'numeric',
   hour: '2-digit',
   minute: '2-digit',
   timeZone: 'Europe/Athens'
  });
 };

 const closeEditor = () => {
  if (ready && state.busy) return;
  if (ready && state.dirty && !window.confirm(
   'Close editor? Unsaved edits are kept only while this site remains expanded. Save Draft to preserve them.'
  )) return;
  dialogRef.current?.close();
 };

 const reloadEditor = () => {
  if (state.dirty && !window.confirm('Discard unsaved editor changes and reload?')) return;
  setState(s => ({...s, busy:true, error:''}));
  void load();
 };

 return <>
  <button
   type="button"
   className="secondary-button iq-trigger"
   aria-haspopup="dialog"
   onClick={() => dialogRef.current?.showModal()}
  >
   Questionnaire
  </button>

  <dialog
   ref={dialogRef}
   className="iq-dialog"
   aria-labelledby="iq-dialog-title"
   onCancel={e => {
    e.preventDefault();
    closeEditor();
   }}
  >
   <section className="iq-editor" aria-label="Incident Questionnaire">

    <header className="iq-header">
     <div>
      <h2 id="iq-dialog-title">Incident Questionnaire</h2>
      <p>{site.site_code ? `${site.site_code} · ` : ''}{site.name}</p>
     </div>

     <button
      type="button"
      className="iq-button iq-close"
      aria-label="Close questionnaire"
      disabled={ready && state.busy}
      onClick={closeEditor}
     >×</button>
    </header>

    <div className="iq-body">

     {ready && state.error && (
      <div className="iq-error" role="alert">
       {state.error}. Reload the current configuration before retrying an unconfirmed operation.
      </div>
     )}

     {!ready || (!state.info && state.busy) ? (
      <p className="iq-loading" role="status">Loading questionnaire…</p>
     ) : !state.info ? (
      <div>
       <p>Questionnaire engine is not available.</p>
       <button type="button" className="iq-button" onClick={reloadEditor}>
        Reload current configuration
       </button>
      </div>
     ) : <>

      <div className="iq-summary">
       <div className="iq-metric">
        <span>Active configuration</span>
        <strong>
         {state.info.assignment.mode === 'DEFAULT' ? 'Platform default' : 'Site custom'}
         {' · '}Assignment {state.info.assignment.sequence}
        </strong>
       </div>

       <div className="iq-metric">
        <span>Active version</span>
        <strong>Version {state.info.version.number || '—'}</strong>
       </div>

       <div className="iq-metric">
        <span>Published at · Athens time</span>
        <strong>{formatDate(state.info.version.publishedAt)}</strong>
       </div>

       <div className="iq-metric">
        <span>Published by · Actor ID</span>
        <strong>{state.info.version.publishedBy || '—'}</strong>
       </div>
      </div>

      <div className="iq-configuration">
       <label className="iq-field">
        <span>Configuration</span>
        <select
         disabled={!write('questionnaires.draft') || busy}
         value={state.editable ? 'custom' : 'default'}
         onChange={e => e.target.value === 'custom' ? custom() : void selectDefault()}
        >
         <option value="default">Platform default</option>
         <option value="custom">Customize for this site</option>
        </select>
       </label>

       <div className="iq-toolbar">
        <button
         type="button"
         className="iq-button"
         disabled={busy}
         onClick={reloadEditor}
        >Reload current configuration</button>

        <button
         type="button"
         className="iq-button"
         aria-expanded={state.preview}
         onClick={() => setState(s => ({...s, preview:!s.preview}))}
        >Guard App preview</button>
       </div>
      </div>

      <p className="iq-note">
       Saving a draft does not change the published questionnaire.
       Publishing applies only to future incidents.
       Use Restore Default to change the active assignment.
      </p>

      {state.preview && (
       <div className="iq-preview" aria-label="Synthetic Guard preview">
        <h3>Guard App Preview</h3>
        <p>Synthetic preview only. No incident or submission is created.</p>

        {state.content.questions.map(q => (
         <label key={q.id} className="iq-field">
          <span>{q.prompt} · {q.required ? 'Required' : 'Optional'}</span>
          <textarea readOnly value="Synthetic preview answer"/>
          {q.help && <small>{q.help}</small>}
         </label>
        ))}
       </div>
      )}

      <div className="iq-section-heading">
       <h3>Questions</h3>
       <span>{state.content.questions.length} / 12</span>
      </div>

      <fieldset
       className="iq-fieldset"
       disabled={!state.editable || !write('questionnaires.draft') || busy}
      >
       <label className="iq-field">
        <span>Questionnaire title</span>
        <input
         value={state.content.title}
         onChange={e => patch({
          content:{
           ...state.content,
           title:limitText(e.target.value,120)
          }
         })}
        />
       </label>

       {state.content.questions.map((q,index) => (
        <article key={q.id} className="iq-question">
         <div className="iq-question-heading">
          <h4>Question {String(index+1).padStart(2,'0')}</h4>

          <div className="iq-question-actions">
           <button
            type="button"
            className="iq-button"
            aria-label={`Move question ${index+1} up`}
            disabled={index===0}
            onClick={() => move(index,-1)}
           >↑</button>

           <button
            type="button"
            className="iq-button"
            aria-label={`Move question ${index+1} down`}
            disabled={index===state.content.questions.length-1}
            onClick={() => move(index,1)}
           >↓</button>

           <button
            type="button"
            className="iq-button iq-danger"
            disabled={state.content.questions.length<=1}
            onClick={() => patch({
             content:{
              ...state.content,
              questions:state.content.questions.filter((_,i)=>i!==index)
             }
            })}
           >Remove</button>
          </div>
         </div>

         <label className="iq-field">
          <span>Question text</span>
          <textarea
           rows={3}
           value={q.prompt}
           onChange={e => update(index,{
            prompt:limitText(e.target.value,500)
           })}
          />
         </label>

         <label className="iq-field">
          <span>Help text (optional)</span>
          <input
           value={q.help}
           onChange={e => update(index,{
            help:limitText(e.target.value,240)
           })}
          />
         </label>

         <div className="iq-question-grid">
          <label className="iq-field">
           <span>Answer type</span>
           <select
            value={q.type}
            onChange={e => update(index,{
             type:e.target.value,
             maxLength:Math.min(q.maxLength,e.target.value==='SHORT_TEXT'?500:5000)
            })}
           >
            <option value="SHORT_TEXT">Short text</option>
            <option value="LONG_TEXT">Long text</option>
           </select>
          </label>

          <label className="iq-field">
           <span>Maximum answer length</span>
           <input
            type="number"
            min="1"
            max={q.type==='SHORT_TEXT'?500:5000}
            value={q.maxLength}
            onChange={e => update(index,{
             maxLength:Number(e.target.value)
            })}
           />
          </label>
         </div>

         <label className="iq-checkbox">
          <input
           type="checkbox"
           checked={q.required}
           onChange={e => update(index,{required:e.target.checked})}
          />
          Required answer
         </label>
        </article>
       ))}

       <button
        type="button"
        className="iq-button iq-add"
        disabled={state.content.questions.length>=12}
        onClick={() => patch({
         content:{
          ...state.content,
          questions:[
           ...state.content.questions,
           {
            id:crypto.randomUUID(),
            prompt:'',
            help:'',
            type:'LONG_TEXT',
            required:true,
            maxLength:5000
           }
          ]
         }
        })}
       >+ Add question</button>
      </fieldset>

      <details className="iq-history">
       <summary>Version history</summary>

       {state.info.history?.map(v => (
        <button
         key={v.id}
         type="button"
         className="iq-button iq-version"
         onClick={() => showHistory(v.version_id)}
        >
         <strong>Version {v.version_number} · {v.mode}</strong>
         <span>{formatDate(v.created_at)}</span>
        </button>
       ))}

       {state.history && (
        <div className="iq-history-content" aria-label="Historical version">
         <h4>{state.history.title}</h4>
         {state.history.questions.map(q => (
          <p key={q.id}>
           {q.position}. {q.prompt} · {q.required?'Required':'Optional'} · {q.provenance}
          </p>
         ))}
        </div>
       )}
      </details>

      {can('audit_logs.view') && (
       <details className="iq-history">
        <summary>Audit metadata</summary>

        <button
         type="button"
         className="iq-button"
         onClick={async()=>{
          const stamp=generation.current;
          try{
           const data=await request('/audit');
           if(alive(stamp))setState(s=>({...s,events:data.events}));
          }catch(e){
           if(alive(stamp))setState(s=>({...s,error:e.message}));
          }
         }}
        >Load audit metadata</button>

        {state.events?.map(e=>(
         <div key={e.id} className="iq-audit-row">
          <strong>{e.action} · {e.outcome}</strong>
          <span>Actor {e.actor_id} · {formatDate(e.created_at)}</span>
         </div>
        ))}
       </details>
      )}

     </>}
    </div>

    {ready && state.info && (
     <footer className="iq-footer">
      <div className="iq-draft-status" role="status">
       {state.busy
        ? 'Processing…'
        : state.dirty
          ? 'Unsaved changes'
          : state.editable
            ? 'No unsaved changes'
            : 'Read-only configuration'}
      </div>

      <div className="iq-footer-actions">
       <button
        type="button"
        className="iq-button"
        disabled={!write('questionnaires.restore')||busy}
        onClick={()=>action('restore')}
       >Restore Default</button>

       <button
        type="button"
        className="iq-button"
        disabled={!write('questionnaires.draft')||!state.editable||busy||!state.dirty}
        onClick={()=>action('save')}
       >Save Draft</button>

       <button
        type="button"
        className="iq-button iq-primary"
        disabled={!write('questionnaires.publish')||!state.editable||state.dirty||!state.draftRevision||busy}
        onClick={()=>action('publish')}
       >Publish</button>
      </div>
     </footer>
    )}

   </section>
  </dialog>
 </>;
}