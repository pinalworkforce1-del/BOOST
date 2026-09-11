(()=>{
'use strict';
const KEY='pinal_boost_career_exploration_v1';
const input=document.getElementById('participantFullName');
const status=document.getElementById('participantNameStatus');
if(!input)return;
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}}
function clean(v){return String(v||'').trim().replace(/\s+/g,' ')}
function existingName(s){const p=s.participant||{};return clean(p.fullName||p.name||[p.firstName,p.lastName].filter(Boolean).join(' ')||p.first_name||'')}
function persist(){const name=clean(input.value);if(!name)return false;const s=read();s.participant=s.participant||{};s.participant.fullName=name;s.participant.name=name;s.participant.updatedAt=new Date().toISOString();s.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(s));if(status){status.textContent=`✓ ${name} will appear on your BOOST reports and future outputs.`;status.style.display='block'}return true}
function requireName(e){if(persist())return;alert('Please enter your full name before continuing in Module 1.');e?.preventDefault();e?.stopPropagation();e?.stopImmediatePropagation?.();document.getElementById('participantName')?.scrollIntoView({behavior:'smooth',block:'center'});input.focus()}
const s=read(),name=existingName(s);if(name){input.value=name;persist()}
input.addEventListener('change',persist);input.addEventListener('blur',persist);
['surfaceBtn','saveBtn'].forEach(id=>document.getElementById(id)?.addEventListener('click',requireName,true));
})();