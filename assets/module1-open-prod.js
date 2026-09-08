const DATA_GZ_B64=window.BOOST_DATA_B64||'';
const KEY='pinal_boost_career_exploration_v1';
const SCORE_KEY='pinal_boost_onet_scores_v1';
const KEYS=['R','I','A','S','E','C'];
const LABELS={R:'Realistic',I:'Investigative',A:'Artistic',S:'Social',E:'Enterprising',C:'Conventional'};
const ALIASES={
 'cna':['31-1131'],'certified nursing assistant':['31-1131'],'nursing assistant':['31-1131'],
 'rn':['29-1141'],'registered nurse':['29-1141'],'lpn':['29-2061'],'lvn':['29-2061'],
 'cdl':['53-3032'],'truck driver':['53-3032'],'class a':['53-3032'],
 'help desk':['15-1232'],'it support':['15-1232'],'computer support':['15-1232'],
 'hvac':['49-9021'],'air conditioning':['49-9021'],'refrigeration':['49-9021'],
 'pharmacy tech':['29-2052'],'medical assistant':['31-9092'],'welder':['51-4121'],
 'electrician':['47-2111'],'plumber':['47-2152'],'cybersecurity':['15-1212'],'cyber security':['15-1212']
};
let OCCS=[],scores=null,ranked=[],filter='all',visible=8,selected=new Map(),lastSearch=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const money=n=>n==null?'—':'$'+Number(n).toFixed(2);
const integer=n=>n==null?'—':Number(n).toLocaleString();
function annualText(n){return n==null?'—':'$'+Math.round(Number(n)*2080).toLocaleString()+'/yr'}
function loadState(){
 try{
  const state=JSON.parse(localStorage.getItem(KEY)||'null');
  const old=state?.module1?.selected||[];
  old.forEach(o=>selected.set(o.soc,o));
 }catch(_){}
 try{
  const oldScores=JSON.parse(localStorage.getItem(SCORE_KEY)||'null');
  if(oldScores)KEYS.forEach(k=>{if(Number.isFinite(Number(oldScores[k])))$(k).value=oldScores[k]});
 }catch(_){}
 renderChosen();
}
function currentScores(){
 const out={};
 for(const k of KEYS){
  const el=$(k),v=Number(el.value);
  if(el.value===''||!Number.isFinite(v)||v<0||v>40)return null;
  out[k]=v;
 }
 if(Math.max(...Object.values(out))<=0)return null;
 return out;
}
function alignment(o){
 if(!scores||!o.ria)return null;
 const max=Math.max(...KEYS.map(k=>scores[k]));
 if(!max)return null;
 let d=0;
 for(const k of KEYS){
  const ov=o.ria[k];
  if(ov==null)return null;
  const occ=((Number(ov)-1)/6)*100;
  const me=(scores[k]/max)*100;
  d+=Math.abs(occ-me);
 }
 return Math.max(0,100-d/6);
}
function stageFor(o){
 const p=(o.pathway?.position||'').toLowerCase();
 if(p.includes('destination')||p.includes('long-term'))return 'Career Destination';
 if(p.includes('bridge')||p.includes('advancement'))return 'Bridge / Advancement';
 if(p.includes('skilled entry'))return 'Skilled Starting Point';
 if(p.includes('entry'))return 'Potential Starting Point';
 const edu=(o.education||'').toLowerCase(),exp=(o.experience||'').toLowerCase(),ojt=(o.ojt||'').toLowerCase();
 if(ojt.includes('apprenticeship'))return 'Skilled Starting Point';
 if(edu.includes('bachelor')||edu.includes('master')||edu.includes('doctoral')||exp.includes('5 years'))return 'Career Destination';
 return 'Potential Starting Point';
}
function stageClass(o){return stageFor(o).includes('Destination')?'destination':'start'}
function opportunity(o){return o.tier||'Regional evidence available'}
function topInterests(){
 if(!scores)return [];
 return KEYS.map(k=>[k,scores[k]]).sort((a,b)=>b[1]-a[1]).slice(0,3);
}
function interestText(){
 const t=topInterests();
 return t.length?`Your strongest interest signals are <b>${t.map(x=>LABELS[x[0]]).join(', ')}</b>. BOOST uses the full six-score pattern when comparing occupations.`:'';
}
function buildRank(){
 ranked=OCCS.filter(o=>o.ria&&o.gate).map(o=>({...o,_a:alignment(o)})).filter(o=>o._a!=null).sort((a,b)=>b._a-a._a);
}
function mixedInitial(){
 const starts=ranked.filter(o=>stageClass(o)==='start').slice(0,5);
 const dest=ranked.filter(o=>stageClass(o)==='destination').slice(0,3);
 const bySoc=new Map([...starts,...dest].map(o=>[o.soc,o]));
 return [...bySoc.values()].sort((a,b)=>b._a-a._a);
}
function resultSet(){
 if(!scores)return [];
 let base;
 if(filter==='all'){
  if(visible<=8)base=mixedInitial();
  else base=ranked;
 }else{
  base=ranked.filter(o=>stageClass(o)===filter);
 }
 return base.slice(0,visible);
}
function evidenceObject(o,origin){
 return {
  soc:o.soc,title:o.title,origin,
  interestAlignment:alignment(o)==null?null:Math.round(alignment(o)*10)/10,
  interests:o.interests||null,sector:o.sector,
  regional:{jobs26:o.jobs,jobs35:o.jobs35,annualOpenings:o.openings,growthPct:o.growth,p25Hourly:o.p25,medianHourly:o.median,p75Hourly:o.p75,tier:o.tier},
  preparation:{education:o.education,experience:o.experience,ojt:o.ojt},
  pathway:o.pathway?{name:o.pathway.name,position:o.pathway.position,destinationStory:o.pathway.destinations}:null,
  stage:stageFor(o)
 };
}
function cardHtml(o,origin='BOOST Surfaced',search=false){
 const a=alignment(o),stage=stageFor(o),saved=selected.has(o.soc),path=o.pathway;
 const pathwayHtml=path?`<div class="pathStory"><b>Pinal H3 Career Pathway — ${esc(path.name)}</b><br>${esc(path.position||'Pathway role')}${path.destinations?` → <b>${esc(path.destinations)}</b>`:''}</div>`:'';
 const prep=[o.education&&`Education: ${o.education}`,o.ojt&&o.ojt!=='None'&&`Typical employer training: ${o.ojt}`].filter(Boolean).join(' • ')||'Preparation requirements vary by employer.';
 return `<article class="card">
  <div class="origin">${esc(origin)}${o.soc?` • SOC ${esc(o.soc)}`:''}</div>
  <h3>${esc(o.title)}</h3>
  <div class="badges"><span class="badge opp">${esc(opportunity(o))}</span><span class="badge stage">${esc(stage)}</span>${path?'<span class="badge path">Pinal H3 Career Pathway</span>':''}${saved?'<span class="badge selectedBadge">Saved ✓</span>':''}</div>
  <div class="metrics">
   <div class="metric"><small>Interest alignment</small><b>${a==null?'Not scored':Math.round(a)+'%'}</b></div>
   <div class="metric"><small>Regional jobs</small><b>${integer(o.jobs)}</b></div>
   <div class="metric"><small>Annual openings</small><b>${integer(o.openings)}</b></div>
   <div class="metric"><small>Growth</small><b>${o.growth==null?'—':Number(o.growth).toFixed(1)+'%'}</b></div>
   <div class="metric entry"><small>Point-of-entry estimate</small><b>${money(o.p25)}/hr</b><small>${annualText(o.p25)}</small></div>
   <div class="metric"><small>Median wage</small><b>${money(o.median)}/hr</b></div>
  </div>
  <div class="prep"><b>Typical entry preparation:</b> ${esc(prep)}</div>
  ${pathwayHtml}
  <button class="addBtn ${saved?'remove':''}" type="button" data-soc="${esc(o.soc)}" data-origin="${esc(origin)}">${saved?'Remove from My Career Exploration':'＋ Add to My Career Exploration'}</button>
 </article>`;
}
function bindAddButtons(root=document){
 root.querySelectorAll('.addBtn').forEach(btn=>btn.onclick=()=>toggle(btn.dataset.soc,btn.dataset.origin));
}
function renderCards(){
 const box=$('cards');
 if(!scores){box.innerHTML='<div class="empty">Enter your O*NET scores above to surface careers.</div>';$('moreBtn').style.display='none';return}
 const arr=resultSet();
 box.innerHTML=arr.length?arr.map(o=>cardHtml(o,'BOOST Surfaced')).join(''):'<div class="empty">No careers match this view. Try another filter or search any occupation below.</div>';
 bindAddButtons(box);
 const possible=(filter==='all'?ranked:ranked.filter(o=>stageClass(o)===filter)).length;
 $('moreBtn').style.display=visible<Math.min(possible,24)?'inline-block':'none';
}
function toggle(soc,origin){
 const o=OCCS.find(x=>x.soc===soc);if(!o)return;
 if(selected.has(soc))selected.delete(soc);
 else{
  if(selected.size>=3){alert('You can carry up to three careers into Module 2. Remove one before adding another.');return}
  selected.set(soc,evidenceObject(o,origin));
 }
 persistDraft();renderChosen();renderCards();if(lastSearch?.soc===soc)renderSearchDetail(lastSearch);
}
function renderChosen(){
 const box=$('chosen');
 if(!selected.size){box.innerHTML='<div class="chosenItem"><b>No careers saved yet.</b><br><small>Choose up to three from the cards or search.</small></div>';return}
 box.innerHTML=[...selected.values()].map(o=>`<div class="chosenItem"><b>${esc(o.title)}</b><br><small>${esc(o.origin||'Saved career')} • ${esc(o.stage||'Career possibility')}</small></div>`).join('');
}
function persistDraft(){
 let state={version:1};
 try{state=JSON.parse(localStorage.getItem(KEY)||'null')||state}catch(_){}
 state.updatedAt=new Date().toISOString();
 state.module1=state.module1||{};
 state.module1.scores=scores||currentScores();
 state.module1.topInterests=(scores||currentScores())?topInterests().map(x=>({code:x[0],label:LABELS[x[0]],score:x[1]})):[];
 state.module1.selected=[...selected.values()];
 localStorage.setItem(KEY,JSON.stringify(state));
}
function surface(){
 scores=currentScores();
 if(!scores){alert('Please enter all six O*NET scores from 0 to 40.');return}
 localStorage.setItem(SCORE_KEY,JSON.stringify(scores));
 $('interestSummary').innerHTML=interestText();$('interestSummary').style.display='block';
 buildRank();visible=8;filter='all';
 document.querySelectorAll('.filterBtn').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));
 renderCards();persistDraft();
 $('recommendations').scrollIntoView({behavior:'smooth',block:'start'});
}
function searchMatches(q){
 q=q.trim().toLowerCase();if(!q)return [];
 const aliasSocs=new Set();
 Object.entries(ALIASES).forEach(([a,socs])=>{if(a.includes(q)||q.includes(a))socs.forEach(s=>aliasSocs.add(s))});
 return OCCS.filter(o=>aliasSocs.has(o.soc)||o.title.toLowerCase().includes(q)||o.soc.includes(q)).sort((a,b)=>{
  const aa=aliasSocs.has(a.soc)?1:0,bb=aliasSocs.has(b.soc)?1:0;if(bb!==aa)return bb-aa;
  const ax=scores&&a.ria?alignment(a):-1,bx=scores&&b.ria?alignment(b):-1;if(bx!==ax)return bx-ax;
  return a.title.localeCompare(b.title);
 }).slice(0,30);
}
function renderSearchList(){
 const q=$('searchInput').value,res=searchMatches(q),box=$('searchResults');
 if(!q.trim()){box.style.display='none';box.innerHTML='';return}
 box.style.display='block';
 box.innerHTML=res.length?res.map(o=>`<button class="searchPick" type="button" data-soc="${esc(o.soc)}"><b>${esc(o.title)}</b><small>${esc(o.soc)} • ${esc(o.tier)}${o.gate?'':' • Participant-selected exploration'}</small></button>`).join(''):'<div class="empty">No occupation found. Try another title or SOC.</div>';
 box.querySelectorAll('.searchPick').forEach(b=>b.onclick=()=>{const o=OCCS.find(x=>x.soc===b.dataset.soc);lastSearch=o;renderSearchDetail(o);box.style.display='none'});
}
function renderSearchDetail(o){$('searchDetail').innerHTML=o?cardHtml(o,'I Chose to Explore',true):'';bindAddButtons($('searchDetail'))}
function showCompletion(){
 const params=new URLSearchParams(location.search),returnUrl=params.get('boost_return'),moduleId=params.get('boost_module'),nonce=params.get('boost_nonce');
 const box=$('completion');box.style.display='block';
 let safeReturn=null;
 if(returnUrl&&moduleId==='module1'&&nonce){
  try{safeReturn=new URL(returnUrl,location.href);if(safeReturn.origin!==location.origin)safeReturn=null}catch(_){safeReturn=null}
 }
 if(safeReturn){
  box.innerHTML='<h3>Module 1 Complete</h3><p>Your career exploration has been saved. Return to BOOST to record completion and continue your pathway.</p><button id="boostReturnComplete" type="button">Save Completion & Return to BOOST</button>';
  $('boostReturnComplete').onclick=()=>{safeReturn.searchParams.set('boost_complete','module1');safeReturn.searchParams.set('boost_nonce',nonce);location.assign(safeReturn.toString())};
 }else{
  box.innerHTML='<h3>Module 1 Complete</h3><p>Your selected careers and evidence are ready to carry forward into Validate.</p><a href="https://pinalworkforce1-del.github.io/BOOST-Career-Validation/">Continue to Module 2 — Validate →</a>';
 }
}
function saveModule(){
 scores=currentScores()||scores;
 if(!scores){alert('Enter your O*NET scores before completing Module 1.');$('onet').scrollIntoView({behavior:'smooth'});return}
 if(!selected.size){alert('Choose at least one career to carry forward.');return}
 let state={version:1};try{state=JSON.parse(localStorage.getItem(KEY)||'null')||state}catch(_){}
 state.updatedAt=new Date().toISOString();
 state.module1={
  scores,
  topInterests:topInterests().map(x=>({code:x[0],label:LABELS[x[0]],score:x[1]})),
  selected:[...selected.values()],
  evidenceVersion:'2026-09-open-exploration-v1',
  geography:'Pinal + Maricopa + Pima Counties, Arizona',
  completedAt:new Date().toISOString()
 };
 localStorage.setItem(KEY,JSON.stringify(state));localStorage.setItem(SCORE_KEY,JSON.stringify(scores));
 $('saveStatus').textContent=`Saved ${selected.size} career${selected.size===1?'':'s'} for Module 2.`;
 showCompletion();$('completion').scrollIntoView({behavior:'smooth',block:'center'});
}
async function init(){
 loadState();
 try{
  if(!DATA_GZ_B64||!('DecompressionStream' in window))throw new Error('career data unavailable');
  const bytes=Uint8Array.from(atob(DATA_GZ_B64),c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const rows=JSON.parse(await new Response(stream).text());
  OCCS=rows.map(r=>({soc:r[0],title:r[1],sector:r[2],jobs:r[3],openings:r[4],growth:r[5],p25:r[6],median:r[7],gate:!!r[8],tier:r[9],education:r[10],experience:r[11],ojt:r[12],pathway:r[13]?{name:r[13],position:r[14],destinations:r[15]}:null,ria:r[16]==null?null:{R:r[16],I:r[17],A:r[18],S:r[19],E:r[20],C:r[21]}}));
  const existing=currentScores();if(existing){scores=existing;$('interestSummary').innerHTML=interestText();$('interestSummary').style.display='block';buildRank();renderCards()}
 }catch(e){console.error(e);$('cards').innerHTML='<div class="empty"><b>Career data could not load.</b><br>Please refresh the page. If the issue continues, return to BOOST and reopen Module 1.</div>'}
}
$('surfaceBtn').onclick=surface;
$('moreBtn').onclick=()=>{visible=Math.min(visible+8,24);renderCards()};
document.querySelectorAll('.filterBtn').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;visible=8;document.querySelectorAll('.filterBtn').forEach(x=>x.classList.toggle('active',x===b));renderCards()});
$('searchInput').addEventListener('input',renderSearchList);
$('saveBtn').onclick=saveModule;$('printBtn').onclick=()=>window.print();
$('audioBtn').onclick=()=>{const a=$('introAudio');if(a.paused){a.play();$('audioBtn').textContent='❚❚ Pause introduction'}else{a.pause();$('audioBtn').textContent='▶ Hear the Module 1 introduction'}};
$('introAudio').addEventListener('ended',()=>{$('audioBtn').textContent='▶ Hear the Module 1 introduction'});
init();