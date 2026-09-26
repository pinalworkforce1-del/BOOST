(()=>{
'use strict';
if(window.__BOOSTCareerOneStopLinks)return;window.__BOOSTCareerOneStopLinks=true;
const profileUrl=(soc,title)=>{const code=String(soc||'').replace(/[^0-9]/g,'');const q=new URLSearchParams({keyword:title||soc||'',lang:'en',location:'Arizona'});if(code)q.set('onetcode',code);return 'https://www.careeronestop.org/Toolkit/Careers/Occupations/occupation-profile.aspx?'+q.toString()};
const css=document.createElement('style');css.textContent='.cosCareerAction{display:inline-flex;align-items:center;gap:6px;margin-top:9px;padding:8px 11px;border-radius:999px;background:#174e70;color:#fff!important;text-decoration:none!important;font-weight:900;font-size:.8rem;box-shadow:0 2px 7px #173b5620}.cosCareerAction:hover{background:#0e3c58}.cosCareerAction small{font-weight:650;opacity:.9}';document.head.appendChild(css);
function addToCard(card,soc,title){if(!card||!soc)return;const existing=card.querySelectorAll(':scope > .cosCareerAction');if(existing.length){existing.forEach((x,i)=>{if(i)x.remove()});return}const a=document.createElement('a');a.className='cosCareerAction';a.target='_blank';a.rel='noopener';a.href=profileUrl(soc,title);a.innerHTML='▶ See This Career in Action <small>CareerOneStop</small>';a.title='Open the U.S. Department of Labor CareerOneStop occupation profile. Career videos are available for many occupations.';const add=card.querySelector('.addBtn[data-soc]');const anchor=add||card.querySelector('.workDriverLine,.prep,.metrics,.actions')||card.lastElementChild||card;if(add)add.insertAdjacentElement('afterend',a);else anchor.insertAdjacentElement(anchor.classList?.contains('actions')?'beforebegin':'afterend',a)}
function scan(){
 const data=Array.isArray(window.OCCS)?window.OCCS:[];
 document.querySelectorAll('article.card,.careerCard,.career-card,.resultCard,.result-card').forEach(card=>{
  const add=card.querySelector('.addBtn[data-soc]');
  let soc=add?.dataset?.soc||card.dataset?.soc||'';
  if(!soc){const m=(card.textContent||'').match(/\b\d{2}-\d{4}(?:\.\d{2})?\b/);soc=m?.[0]||''}
  if(!soc)return;
  const o=data.find(x=>String(x.soc)===String(soc))||data.find(x=>String(x.soc).startsWith(String(soc).slice(0,7)));
  addToCard(card,soc,o?.title||card.querySelector('h3,h4,.title')?.textContent?.trim());
 });
}
const mo=new MutationObserver(muts=>{if(muts.every(m=>[...m.addedNodes].every(n=>n.nodeType!==1||n.classList?.contains('cosCareerAction'))))return;clearTimeout(window.__cosScanTimer);window.__cosScanTimer=setTimeout(scan,80)});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{scan();mo.observe(document.body,{childList:true,subtree:true})},{once:true});else{scan();mo.observe(document.body,{childList:true,subtree:true})}
})();