(()=>{
'use strict';
const SHARED_KEY='pinal_boost_career_exploration_v1';
const JOURNEY_KEY='pinal_boost_journey_v1';
const REGION='Pinal County';
const MODULE='module1';
const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return{}}};
const clean=v=>String(v||'').trim().replace(/\s+/g,' ');
function h3Status(primary){
  const pathway=primary?.pathway;
  if(pathway&&typeof pathway==='object'&&(pathway.name||pathway.position||pathway.destinationStory)) return 'Pinal H3 Career Pathway';
  return 'Other Regional Career';
}
function normalize(){
  const shared=read(SHARED_KEY);
  const m1=shared.module1||{};
  const selected=Array.isArray(m1.selected)?m1.selected:[];
  if(!m1.completedAt||!selected.length)return null;
  const primary=selected[0]||{};
  const name=clean(shared.participant?.name||shared.participant?.fullName||document.getElementById('participantFullName')?.value);
  const journey=read(JOURNEY_KEY);
  journey.schema_version=2;
  journey.region=REGION;
  journey.participant=Object.assign({},journey.participant||{});
  if(name)journey.participant.name=name;
  journey.modules=journey.modules||{};
  journey.progress=journey.progress||{};
  journey.modules.module1={
    module:'module1',
    source:'pinal_module1_discover',
    interestScores:m1.scores||{},
    topInterests:Array.isArray(m1.topInterests)?m1.topInterests:[],
    careers:selected,
    primaryCareer:primary.title||'',
    h3Status:h3Status(primary),
    evidenceVersion:m1.evidenceVersion||'2026-09-open-exploration-v1',
    geography:m1.geography||'Pinal + Maricopa + Pima Counties, Arizona',
    completedAt:m1.completedAt
  };
  journey.progress.module1='complete';
  journey.primaryCareerTitle=primary.title||journey.primaryCareerTitle||'';
  journey.h3Status=h3Status(primary);
  journey.updated_at=new Date().toISOString();
  localStorage.setItem(JOURNEY_KEY,JSON.stringify(journey));
  return journey;
}
async function sync(){
  const journey=normalize();
  if(!journey)return {ok:false,reason:'incomplete'};
  try{
    const cloud=window.PinalBOOSTCloud;
    if(!cloud?.getClient)return {ok:false,reason:'cloud-unavailable'};
    const client=cloud.getClient();
    const {data:{session}}=await client.auth.getSession();
    if(!session?.user)return {ok:false,reason:'not-signed-in'};
    if(session.user.email){journey.participant.email=String(session.user.email).toLowerCase();localStorage.setItem(JOURNEY_KEY,JSON.stringify(journey));}
    const now=new Date().toISOString();
    const {error:progressError}=await client.from('boost_module_progress').upsert({
      user_id:session.user.id,
      region:REGION,
      module_id:MODULE,
      pathway:'shared',
      status:'completed',
      evidence:{source:'pinal_module1_save',version:2,journey_payload_saved:true},
      completed_at:journey.modules.module1.completedAt||now,
      updated_at:now
    },{onConflict:'user_id,region,module_id'});
    if(progressError)throw progressError;
    const saved=await cloud.saveNow();
    if(!saved)throw new Error('BOOST cloud journey save did not complete');
    const status=document.getElementById('saveStatus');
    if(status)status.textContent=(status.textContent?status.textContent+' ':'')+'Saved to your BOOST cloud journey ✓';
    window.dispatchEvent(new CustomEvent('pinal-module1-cloud-saved',{detail:{module:MODULE}}));
    return {ok:true};
  }catch(error){
    console.warn('Pinal Module 1 cloud sync failed',error);
    const status=document.getElementById('saveStatus');
    if(status)status.textContent='Module 1 is saved on this device, but the BOOST cloud save did not finish: '+(error?.message||'unknown error');
    return {ok:false,error};
  }
}
function bind(){
  const save=document.getElementById('saveBtn');
  if(!save)return;
  save.addEventListener('click',()=>setTimeout(sync,80));
  const shared=read(SHARED_KEY);
  if(shared?.module1?.completedAt) setTimeout(sync,400);
}
window.PinalModule1CloudBridge={sync,normalize};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();