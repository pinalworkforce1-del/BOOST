(()=>{
'use strict';
const SHARED_KEY='pinal_boost_career_exploration_v1';
const JOURNEY_KEY='pinal_boost_journey_v1';
const REGION='Pinal County';
const MODULE='module1';
const DRIVER_LABELS={helping:'Helping people directly',hands:'Working with my hands',solving:'Solving problems',creating:'Creating or improving things',leading:'Leading or influencing',organizing:'Organizing details or systems',independence:'Having independence',team:'Being part of a team',movement:'Staying active',stability:'Having stability',growth:'Having room to grow',impact:'Doing work that matters to me'};
const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return{}}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
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
  if(changed){shared.updatedAt=new Date().toISOString();write(SHARED_KEY,shared)}
  return shared;
}
function captureDiscoverUI(markComplete=false){
  const root=document.getElementById('mindmap');
  if(!root)return null;
  const fields={
    dreamJob:clean(document.getElementById('mmDream')?.value),
    dreamNatural:clean(document.getElementById('mmNatural')?.value),
    dreamMotivation:clean(document.getElementById('mmMotivation')?.value),
    activities:clean(document.getElementById('mmActivities')?.value),
    environment:clean(document.getElementById('mmEnvironment')?.value)
  };
  const drivers={};
  root.querySelectorAll('.driverCard[data-driver]').forEach(card=>{
    const on=card.querySelector('.driverChoices button.on');
    if(on?.dataset?.v)drivers[card.dataset.driver]=on.dataset.v;
  });
  const now=new Date().toISOString();
  const shared=read(SHARED_KEY);shared.module1=shared.module1||{};
  const prior=shared.module1.mindmap||{};
  shared.module1.mindmap={fields,drivers,updatedAt:now,...((markComplete||prior.completedAt)?{completedAt:markComplete?now:prior.completedAt}:{})};
  const yes=Object.entries(drivers).filter(([,v])=>v==='yes').map(([key])=>key);
  shared.module1.alignmentProfile={
    model:'60% O*NET interest alignment + 40% validated work-driver alignment',interestWeight:.60,workDriverWeight:.40,
    validatedWorkDrivers:yes.map(key=>({key,label:window.NORTHERN_ONET_DRIVERS?.drivers?.[key]?.label||DRIVER_LABELS[key]||key})),
    note:'Pinal LMI, H3 pathway evidence, wages, preparation, growth, and participant-defined meaning remain separate career evidence.',
    source:'BOOST Module 1 mindmap + O*NET occupation evidence',version:'pinal-discover-alignment-v1'
  };
  const bank=window.NORTHERN_ONET_DRIVERS;
  if(Array.isArray(shared.module1.selected)&&bank?.occupations){
    shared.module1.selected=shared.module1.selected.map(c=>{
      const raw=bank.occupations[String(c?.soc||'')];
      const rows=yes.filter(k=>raw&&Number.isFinite(Number(raw[k]))).map(k=>({key:k,label:bank?.drivers?.[k]?.label||DRIVER_LABELS[k]||k,score:Number(raw[k])}));
      const wd=rows.length?rows.reduce((n,x)=>n+x.score,0)/rows.length:null;
      const ia=Number.isFinite(Number(c?.interestAlignmentScore))?Number(c.interestAlignmentScore):(Number.isFinite(Number(c?.interestAlignment))?Number(c.interestAlignment):null);
      const overall=ia==null?null:(wd==null?ia:ia*.60+wd*.40);
      return Object.assign({},c,{
        interestAlignmentScore:ia,
        workDriverAlignmentScore:wd==null?null:Number(wd.toFixed(1)),
        workDriverConnectionLabel:wd==null?(yes.length?'Work-driver evidence unavailable':'No scored work drivers selected'):(wd>=72?'Strong connection to your work drivers':wd>=55?'Some connection to your work drivers':'Different from your strongest work drivers'),
        matchedWorkDrivers:rows.filter(x=>x.score>=60).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>({key:x.key,label:x.label,score:Number(x.score.toFixed(1))})),
        overallAlignmentScore:overall==null?null:Number(overall.toFixed(1)),
        alignmentModel:{label:'Overall Alignment',interestWeight:.60,workDriverWeight:.40,version:'pinal-discover-alignment-v1'}
      });
    });
  }
  shared.updatedAt=now;write(SHARED_KEY,shared);
  const journey=read(JOURNEY_KEY);journey.modules=journey.modules||{};
  journey.modules.module1=Object.assign({},journey.modules.module1||{}, {
    mindmap:shared.module1.mindmap,
    alignmentProfile:shared.module1.alignmentProfile,
    careers:Array.isArray(shared.module1.selected)?shared.module1.selected:(journey.modules.module1?.careers||[]),
    interestScores:shared.module1.scores||journey.modules.module1?.interestScores||{}
  });
  journey.updated_at=now;write(JOURNEY_KEY,journey);
  return {mindmap:shared.module1.mindmap,alignmentProfile:shared.module1.alignmentProfile};
}
function normalize(){
  captureDiscoverUI(false);
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
    module:'module1',source:'pinal_module1_discover',interestScores:m1.scores||previous.interestScores||{},
    topInterests:Array.isArray(m1.topInterests)?m1.topInterests:(previous.topInterests||[]),careers:selected,
    primaryCareer:primary.title||'',h3Status:h3Status(primary),mindmap:m1.mindmap||previous.mindmap||null,
    alignmentProfile:m1.alignmentProfile||previous.alignmentProfile||null,
    evidenceVersion:m1.evidenceVersion||previous.evidenceVersion||'2026-09-open-exploration-v1',
    geography:m1.geography||previous.geography||'Pinal + Maricopa + Pima Counties, Arizona',completedAt:m1.completedAt
  });
  journey.progress.module1='complete';journey.primaryCareerTitle=primary.title||journey.primaryCareerTitle||'';journey.h3Status=h3Status(primary);journey.updated_at=new Date().toISOString();write(JOURNEY_KEY,journey);return journey;
}
async function sync(){
  const journey=normalize();if(!journey)return {ok:false,reason:'incomplete'};
  try{
    const cloud=window.PinalBOOSTCloud;if(!cloud?.getClient)return {ok:false,reason:'cloud-unavailable'};
    const client=cloud.getClient();const {data:{session}}=await client.auth.getSession();if(!session?.user)return {ok:false,reason:'not-signed-in'};
    if(session.user.email){journey.participant.email=String(session.user.email).toLowerCase();write(JOURNEY_KEY,journey)}
    const now=new Date().toISOString();
    const {error:progressError}=await client.from('boost_module_progress').upsert({user_id:session.user.id,region:REGION,module_id:MODULE,pathway:'shared',status:'completed',evidence:{source:'pinal_module1_save',version:4,journey_payload_saved:true,mindmap_saved:!!journey.modules?.module1?.mindmap,alignment_profile_saved:!!journey.modules?.module1?.alignmentProfile,validated_work_drivers:journey.modules?.module1?.alignmentProfile?.validatedWorkDrivers?.length||0},completed_at:journey.modules.module1.completedAt||now,updated_at:now},{onConflict:'user_id,region,module_id'});
    if(progressError)throw progressError;const saved=await cloud.saveNow();if(!saved)throw new Error('BOOST cloud journey save did not complete');
    const status=document.getElementById('saveStatus');if(status)status.textContent=(status.textContent?status.textContent+' ':'')+'Discover reflection + work drivers + O*NET + career choices saved to your BOOST cloud journey ✓';
    window.dispatchEvent(new CustomEvent('pinal-module1-cloud-saved',{detail:{module:MODULE,mindmap:true,workDrivers:true}}));return {ok:true};
  }catch(error){console.warn('Pinal Module 1 cloud sync failed',error);const status=document.getElementById('saveStatus');if(status)status.textContent='Module 1 is saved on this device, but the BOOST cloud save did not finish: '+(error?.message||'unknown error');return {ok:false,error}}
}
function bind(){
  hydrateSharedFromJourney();
  document.addEventListener('click',e=>{if(e.target?.closest?.('.driverCard[data-driver] .driverChoices button'))setTimeout(()=>captureDiscoverUI(false),0)},true);
  document.addEventListener('change',e=>{if(e.target?.closest?.('#mindmap'))setTimeout(()=>captureDiscoverUI(false),0)},true);
  const save=document.getElementById('saveBtn');if(!save)return;
  save.addEventListener('click',()=>{
    captureDiscoverUI(true);
    setTimeout(()=>captureDiscoverUI(true),40);
    setTimeout(sync,300);
  },true);
  const shared=read(SHARED_KEY);if(shared?.module1?.completedAt)setTimeout(()=>{captureDiscoverUI(false);sync()},700);
}
window.PinalModule1CloudBridge={sync,normalize,hydrateSharedFromJourney,captureDiscoverUI};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();