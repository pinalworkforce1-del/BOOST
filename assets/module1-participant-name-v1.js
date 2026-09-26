(()=>{
'use strict';
const KEY='pinal_boost_career_exploration_v1';
const JOURNEY_KEY='pinal_boost_journey_v1';
const input=document.getElementById('participantFullName');
const status=document.getElementById('participantNameStatus');
const panel=document.getElementById('participantName');
function hideDiscoverCarryForward(){
  const remove=()=>document.getElementById('pinalConnectedCarry')?.remove();
  remove();
  const obs=new MutationObserver(remove);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>obs.disconnect(),5000);
}
hideDiscoverCarryForward();
if(!input)return;
function readKey(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return{}}}
function clean(v){return String(v||'').trim().replace(/\s+/g,' ')}
function existingName(s){const p=s?.participant||{};return clean(p.fullName||p.name||[p.firstName,p.lastName].filter(Boolean).join(' ')||[p.first_name,p.last_name].filter(Boolean).join(' ')||p.first_name||'')}
function bestName(){return existingName(readKey(KEY))||existingName(readKey(JOURNEY_KEY))}
function persist(nameOverride){const name=clean(nameOverride||input.value);if(!name)return false;const s=readKey(KEY);s.participant=s.participant||{};s.participant.fullName=name;s.participant.name=name;s.participant.updatedAt=new Date().toISOString();s.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(s));return true}
function useKnownName(name){input.value=name;persist(name);if(panel)panel.style.display='none'}
function showNameEntry(){if(panel)panel.style.display='';const h=panel?.querySelector('h2'),sub=panel?.querySelector('.sub'),wrap=input.closest('.searchWrap');if(h)h.textContent='What name should appear on your BOOST reports?';if(sub)sub.textContent='Enter your full name once. BOOST will carry it forward to your Career Decision Report, Career Coach Summary, and future personalized outputs.';if(wrap)wrap.style.display='';input.addEventListener('change',()=>{if(persist()&&status){status.textContent=`✓ ${clean(input.value)} will appear on your BOOST reports and future outputs.`;status.style.display='block'}});input.addEventListener('blur',()=>persist())}
function requireName(e){if(bestName()||persist())return;alert('Please enter your full name before continuing in Module 1.');e?.preventDefault();e?.stopPropagation();e?.stopImmediatePropagation?.();panel?.scrollIntoView({behavior:'smooth',block:'center'});input.focus()}
const name=bestName();if(name)useKnownName(name);else showNameEntry();
['surfaceBtn','saveBtn'].forEach(id=>document.getElementById(id)?.addEventListener('click',requireName,true));
})();