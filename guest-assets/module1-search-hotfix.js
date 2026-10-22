(function(){
 const isMobile=()=>window.matchMedia('(max-width: 700px)').matches;
 function liveMatches(raw){
  const q=String(raw||'').trim().toLowerCase();
  if(!q)return[];
  const aliasSocs=new Set();
  Object.entries(ALIASES||{}).forEach(([a,socs])=>{if(a.includes(q)||q.includes(a))socs.forEach(s=>aliasSocs.add(s))});
  return OCCS.filter(o=>{
   const matches=aliasSocs.has(o.soc)||(o.title||'').toLowerCase().includes(q)||(o.soc||'').includes(q);
   return matches && (typeof boostPass!=='function'||boostPass(o));
  }).sort((a,b)=>{
   const aa=aliasSocs.has(a.soc)?1:0,bb=aliasSocs.has(b.soc)?1:0;
   if(bb!==aa)return bb-aa;
   const ax=scores&&a.ria?alignment(a):-1,bx=scores&&b.ria?alignment(b):-1;
   if(bx!==ax)return bx-ax;
   return (a.title||'').localeCompare(b.title||'');
  }).slice(0,30);
 }
 function sizeMobileResults(){
  if(!isMobile())return;
  const box=document.getElementById('searchResults');if(!box)return;
  const vh=window.visualViewport?.height||window.innerHeight;
  box.style.maxHeight=Math.max(150,Math.min(330,vh-190))+'px';
  box.style.overscrollBehavior='contain';
 }
 function revealSearch(){
  if(!isMobile())return;
  const input=document.getElementById('searchInput');if(!input)return;
  sizeMobileResults();
  requestAnimationFrame(()=>{
   input.scrollIntoView({behavior:'smooth',block:'start'});
   setTimeout(()=>window.scrollBy({top:-78,left:0,behavior:'smooth'}),90);
  });
 }
 function renderLiveSearch(){
  const input=document.getElementById('searchInput'),box=document.getElementById('searchResults');
  if(!input||!box)return;
  const q=input.value.trim();
  if(!q){box.style.display='none';box.innerHTML='';return}
  const res=liveMatches(q);
  box.style.display='block';
  box.innerHTML=res.length?res.map(o=>`<button class="searchPick" type="button" data-soc="${esc(o.soc)}"><b>${esc(o.title)}</b><small>${esc(o.soc)} • ${esc(o.tier||'Regional evidence available')}${o.gate?'':' • Participant-selected exploration'}</small></button>`).join(''):'<div class="empty">No occupation matches this search and the filters currently selected. Clear a filter or try another title.</div>';
  sizeMobileResults();
  revealSearch();
  box.querySelectorAll('.searchPick').forEach(btn=>btn.onclick=()=>{
   const o=OCCS.find(x=>x.soc===btn.dataset.soc);
   if(!o)return;
   lastSearch=o;
   renderSearchDetail(o);
   box.style.display='none';
   input.blur();
   if(isMobile())setTimeout(()=>document.getElementById('searchDetail')?.scrollIntoView({behavior:'smooth',block:'start'}),180);
  });
 }
 function install(){
  const input=document.getElementById('searchInput');if(!input)return;
  input.oninput=renderLiveSearch;
  input.onkeyup=renderLiveSearch;
  input.addEventListener('search',renderLiveSearch);
  input.addEventListener('focus',()=>setTimeout(revealSearch,120));
  window.visualViewport?.addEventListener('resize',sizeMobileResults);
  window.renderSearchList=renderLiveSearch;
  window.searchMatches=liveMatches;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();