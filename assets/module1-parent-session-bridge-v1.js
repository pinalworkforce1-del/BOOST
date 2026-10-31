(function(){
'use strict';
if(window.self===window.top)return;
const PARENTS=new Set(['https://pinal.boostpathways.org','https://pinalworkforce1-del.github.io']);
const STATE='pinal_boost_career_exploration_v1', SCORES='pinal_boost_onet_scores_v1', JOURNEY='pinal_boost_journey_v1';
let activeParent=null;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
function payload(){
 const shared=read(STATE)||{},m=shared.module1||{},scores=m.scores||read(SCORES)||{};
 return {module1:{scores,selected:Array.isArray(m.selected)?m.selected:[],topInterests:Array.isArray(m.topInterests)?m.topInterests:[],mindmap:m.mindmap||null,alignmentProfile:m.alignmentProfile||null,completedAt:m.completedAt||null},participant:{name:shared.participant?.name||shared.participant?.fullName||''}};
}
function sendRequest(){
 try{window.parent.postMessage({type:'pinal-boost-module1-request-state',version:1},'*')}catch(_){}
}
window.addEventListener('message',e=>{
 if(e.source!==window.parent||!PARENTS.has(e.origin)||!e.data||typeof e.data!=='object')return;
 if(e.data.type==='pinal-boost-module1-collect'){
   // Save Module 1 state to the authenticated outer BOOST shell; never send auth tokens.
   const outgoing=payload();
   e.source.postMessage({type:'pinal-boost-module1-current',requestId:String(e.data.requestId||''),state:outgoing},e.origin);
   return;
 }
 if(e.data.type!=='pinal-boost-module1-restore')return;
 const incoming=e.data.state,mod=incoming?.module1;
 if(!mod||typeof mod!=='object'||!Array.isArray(mod.selected)||!mod.scores||typeof mod.scores!=='object')return;
 try{
   activeParent=e.origin;
   const next={module1:{scores:mod.scores,selected:mod.selected,topInterests:mod.topInterests||[],mindmap:mod.mindmap||null,alignmentProfile:mod.alignmentProfile||null,completedAt:mod.completedAt||null},
     participant:{name:String(incoming.participant?.name||''),fullName:String(incoming.participant?.name||'')}};
   const old=read(STATE);
   const was=JSON.stringify([old?.module1?.scores||{},old?.module1?.selected||[],old?.module1?.completedAt||null,old?.participant?.name||'']);
   const now=JSON.stringify([mod.scores,mod.selected,mod.completedAt||null,next.participant.name]);
   const changed=was!==now;
   // Only an authenticated exact-origin parent may hydrate this embedded view.
   localStorage.setItem(STATE,JSON.stringify(next));
   localStorage.setItem(SCORES,JSON.stringify(mod.scores));
   const oldJourney=read(JOURNEY)||{};
   const newJourney={region:'Pinal County',participant:{name:next.participant.name},modules:{module1:{interestScores:mod.scores,careers:mod.selected,
     topInterests:mod.topInterests||[],mindmap:mod.mindmap||null,alignmentProfile:mod.alignmentProfile||null,completedAt:mod.completedAt||null}},
     progress:{module1:mod.completedAt?'complete':'started'}};
   const merged={...oldJourney,participant:{...(oldJourney.participant||{}),...newJourney.participant},modules:{...(oldJourney.modules||{}),module1:{...(oldJourney.modules?.module1||{}),...newJourney.modules.module1}},progress:{...(oldJourney.progress||{}),module1:newJourney.progress.module1}};
   localStorage.setItem(JOURNEY,JSON.stringify(merged));
   if(changed&&sessionStorage.getItem('boost_m1_hydrated')!==now){sessionStorage.setItem('boost_m1_hydrated',now);location.reload()}
 }catch(err){console.warn('BOOST embedded Module 1 recovery unavailable',err)}
});
document.addEventListener('DOMContentLoaded',sendRequest,{once:true});
window.addEventListener('load',sendRequest,{once:true});
})();