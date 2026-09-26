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
function hydrateSharedFromJourney(){
  const shared=read(SHARED_KEY),journey=read(JOURNEY_KEY),jm=journey?.modules?.module1;
  if(!jm||typeof jm!=='object')return shared;
  shared.module1=shared.module1||{};
  const sm=shared.module1;
  let changed=false;
  if((!sm.scores||!Object.keys(sm.scores).length)&&jm.interestScores&&Object.keys(jm.interestScores).length){sm.scores=jm.interestScores;changed=true}
  if((!Array.isArray(sm.selected)||!sm.selected.length)&&Array.isArray(jm.careers)&&jm.careers.length){sm.selected=jm.careers;changed=true}
  if(!sm.mindmap&&jm.mindmap){sm.mindmap=jm.mindmap;changed=true}
  if(!sm.alignmentProfile&&jm.alignmentProfile){sm.alignmentProfile=jm.alignmentProfile;changed=true}
  if(!sm.topInterests&&Array.isArray(jm.topInterests)){sm.topInterests=jm.topInterests;changed=true}
  if(!sm.completedAt&&jm.completedAt){sm.completedAt=jm.completedAt;changed=true}
  if(changed){shared.updatedAt=new Date().toISOString();localStorage.setItem(SHARED_KEY,JSON.stringify(shared))}
  return shared;
}
function normalize(){
  const shared=hydrateSharedFromJourney();
  const m1=shared.module1||{};
  const selected=Array.isArray(m1.selected)?m1.selected:[];
  if(!m1.completedAt||!selected.length)return null;
  const primary=selected[0]||{};
  const name=clean(shared.participant?.name||shared.participant?.fullName||document.getElementById('participantFullName')?.value);
  const journey=read(JOURNEY_KEY);
  const previous=journey?.modules?.module1||{};
  journey.schema_version=2;
  journey.region=REGION;
  journey.participant=Object.assign({},journey.participant||{});
  if(name)journey.participant.name=name;
  journey.modules=journey.modules||{};
  journey.progress=journey.progress||{};
  journey.modules.module1=Object.assign({},previous,{
    module:'module1',
    source:'pinal_module1_discover',
    interestScores:m1.scores||previous.interestScores||{},
    topInterests:Array.isArray(m1.topInterests)?m1.topInterests:(previous.topInterests||[]),
    careers:selected,
    primaryCareer:primary.title||'',
    h3Status:h3Status(primary),
    mindmap:m1.mindmap||previous.mindmap||null,
    alignmentProfile:m1.alignmentProfile||previous.alignmentProfile||null,
    evidenceVersion:m1.evidenceVersion||previous.evidenceVersion||'2026-09-open-exploration-v1',
    geography:m1.geography||previous.geography||'Pinal + Maricopa + Pima Counties, Arizona',
    completedAt:m1.completedAt
  });
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
      evidence:{source:'pinal_module1_save',version:3,journey_payload_saved:true,mindmap_saved:!!journey.modules?.module1?.mindmap,alignment_profile_saved:!!journey.modules?.module1?.alignmentProfile},
      completed_at:journey.modules.module1.completedAt||now,
      updated_at:now
    },{onConflict:'user_id,region,module_id'});
    if(progressError)throw progressError;
    const saved=await cloud.saveNow();
    if(!saved)throw new Error('BOOST cloud journey save did not complete');
    const status=document.getElementById('saveStatus');
    if(status)status.textContent=(status.textContent?status.textContent+' ':'')+'Discover reflection + O*NET + career choices saved to your BOOST cloud journey ✓';
    window.dispatchEvent(new CustomEvent('pinal-module1-cloud-saved',{detail:{module:MODULE,mindmap:true}}));
    return {ok:true};
  }catch(error){
    console.warn('Pinal Module 1 cloud sync failed',error);
    const status=document.getElementById('saveStatus');
    if(status)status.textContent='Module 1 is saved on this device, but the BOOST cloud save did not finish: '+(error?.message||'unknown error');
    return {ok:false,error};
  }
}
function bind(){
  hydrateSharedFromJourney();
  const save=document.getElementById('saveBtn');
  if(!save)return;
  save.addEventListener('click',()=>setTimeout(sync,120));
  const shared=read(SHARED_KEY);
  if(shared?.module1?.completedAt) setTimeout(sync,500);
}
window.PinalModule1CloudBridge={sync,normalize,hydrateSharedFromJourney};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();