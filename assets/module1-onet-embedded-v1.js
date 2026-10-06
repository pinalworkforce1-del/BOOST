(()=>{
'use strict';
const KEYS=['R','I','A','S','E','C'];
const QUESTIONS=[
[1,'R','Build kitchen cabinets'],[2,'I','Develop a new medicine'],[3,'A','Write books or plays'],[4,'S','Help people with personal or emotional problems'],[5,'E','Manage a department within a large company'],[6,'C','Install software across computers on a large network'],
[7,'R','Repair household appliances'],[8,'I','Study ways to reduce water pollution'],[9,'A','Compose or arrange music'],[10,'S','Give career guidance to people'],[11,'E','Start your own business'],[12,'C','Operate a calculator'],
[13,'R','Assemble electronic parts'],[14,'I','Conduct chemical experiments'],[15,'A','Create special effects for movies'],[16,'S','Perform rehabilitation therapy'],[17,'E','Negotiate business contracts'],[18,'C','Keep shipping and receiving records'],
[19,'R','Drive a truck to deliver packages to offices and homes'],[20,'I','Examine blood samples using a microscope'],[21,'A','Paint sets for plays'],[22,'S','Do volunteer work at a non-profit organization'],[23,'E','Market a new line of clothing'],[24,'C','Inventory supplies using a hand-held computer'],
[25,'R','Test the quality of parts before shipment'],[26,'I','Develop a way to better predict the weather'],[27,'A','Write scripts for movies or television shows'],[28,'S','Teach a high-school class'],[29,'E','Sell merchandise at a department store'],[30,'C','Stamp, sort, and distribute mail for an organization']
].map(x=>({index:x[0],area:x[1],text:x[2]}));
const ANSWERS=[{v:5,l:'Strongly Like',e:'🤩'},{v:4,l:'Like',e:'🙂'},{v:3,l:'Unsure',e:'😐'},{v:2,l:'Dislike',e:'🙁'},{v:1,l:'Strongly Dislike',e:'😣'}];
const onet=document.getElementById('onet'); if(!onet)return;
const oldScores={};KEYS.forEach(k=>{const el=document.getElementById(k);if(el&&el.value!=='')oldScores[k]=Number(el.value)});
const hasSaved=KEYS.every(k=>Number.isFinite(oldScores[k]));
const legacy=[onet.querySelector('.onetBox'),onet.querySelector('.scoreGrid'),onet.querySelector('.actionRow'),document.getElementById('interestSummary')];
legacy.forEach(el=>{if(el)el.style.display='none'});
const tag=onet.querySelector('.stepTag');if(tag)tag.textContent='Step 1 • Discover your interests';
const h=onet.querySelector('h2');if(h)h.textContent='O*NET® Mini Interest Profiler';
const sub=onet.querySelector('.sub');if(sub)sub.textContent='Rate each work activity based on whether you would like or dislike doing it — not whether you already know how to do it. BOOST will calculate your interest pattern automatically.';
const style=document.createElement('style');style.textContent=`
#boostEmbeddedOnet{margin-top:18px}.bip-status{display:flex;align-items:center;gap:12px;margin:12px 0;font-size:.78rem;font-weight:800;color:#587181}.bip-track{height:8px;flex:1;background:#dce8ee;border-radius:99px;overflow:hidden}.bip-track i{display:block;height:100%;background:linear-gradient(90deg,#168c87,#e9aa2c)}
.bip-card{overflow:hidden;border-radius:20px;background:#0b1d33;color:#fff;box-shadow:0 16px 38px #17324d22}.bip-visual{width:100%;aspect-ratio:16/9;height:auto;min-height:0;display:grid;place-items:center;text-align:center;padding:0;background-color:#0b1d33;background-image:radial-gradient(circle at 50% 35%,#225f78,#0b1d33 72%);background-size:cover;background-repeat:no-repeat;background-position:center;position:relative}.bip-visual.has-art:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 72%,rgba(5,17,31,.30))}.bip-placeholder{position:relative;z-index:1;padding:22px}.bip-placeholder b{font-size:3rem;display:block}.bip-placeholder span{font-size:.75rem;letter-spacing:.12em;font-weight:900;color:#bdeae6}.bip-copy{padding:18px 20px 20px}.bip-copy small{color:#63d6d0;font-weight:900;letter-spacing:.1em}.bip-copy h3{font-size:clamp(1.35rem,2.6vw,2rem);margin:5px 0}.bip-copy p{color:#d7e3ed;margin:0 0 14px}.bip-answers{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.bip-answers button{min-height:56px;border:1px solid #385873;border-radius:12px;background:#102944;color:#fff;font-weight:900;cursor:pointer}.bip-answers button:hover,.bip-answers button.selected{background:#176e69;border-color:#6be0d9;outline:2px solid #6be0d944}.bip-nav{display:flex;gap:10px;margin-top:12px}.bip-nav button,.bip-saved button,.bip-done button{padding:11px 15px;border-radius:10px;border:1px solid #c6d9e1;background:#fff;color:#17324d;font-weight:900;cursor:pointer}.bip-nav .next,.bip-saved .primary,.bip-done .primary{margin-left:auto;background:#0b3158;color:#fff}.bip-nav button:disabled{opacity:.4;cursor:not-allowed}.bip-saved,.bip-done{padding:18px;border:1px solid #bfe0da;border-radius:14px;background:#eef9f6;color:#185b56}.bip-saved strong,.bip-done strong{display:block;font-size:1.1rem;margin-bottom:5px}.bip-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
@media(max-width:760px){.bip-answers{grid-template-columns:1fr 1fr}.bip-answers button:first-child{grid-column:1/-1}.bip-visual{aspect-ratio:16/9}}
`;document.head.appendChild(style);
const mount=document.createElement('div');mount.id='boostEmbeddedOnet';onet.appendChild(mount);
const state={i:0,answers:{},retaking:false};
function continueCareer(){document.getElementById('surfaceBtn')?.click();document.getElementById('recommendations')?.scrollIntoView({behavior:'smooth',block:'start'})}
function finish(){
 const scores={R:0,I:0,A:0,S:0,E:0,C:0};
 QUESTIONS.forEach(q=>{const v=Number(state.answers[q.index]);if(v>=1&&v<=5)scores[q.area]+=v-1});
 KEYS.forEach(k=>{const el=document.getElementById(k);el.value=String(scores[k]);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});
 try{localStorage.setItem('pinal_boost_onet_scores_v1',JSON.stringify(scores))}catch(_){}
 mount.innerHTML='<div class="bip-done"><strong>✓ Your O*NET interest profile is ready.</strong><div>'+KEYS.map(k=>k+' '+scores[k]).join(' • ')+'</div><p>BOOST has connected these results directly to Career Exploration. No score entry is needed.</p><div class="bip-actions"><button class="primary" id="bipContinue">Show Careers That Connect to Me →</button><button id="bipRetake">Retake</button></div></div>';
 document.getElementById('bipContinue').onclick=continueCareer;document.getElementById('bipRetake').onclick=()=>{state.i=0;state.answers={};state.retaking=true;render()};
}
function render(){
 if(hasSaved&&!state.retaking&&Object.keys(state.answers).length===0){
  mount.innerHTML='<div class="bip-saved"><strong>✓ Your O*NET interest results are already saved.</strong><p>You do not need to take the assessment again. Continue with your saved results, or retake the embedded profiler if you want to update them.</p><div class="bip-actions"><button class="primary" id="bipSavedContinue">Continue with saved results →</button><button id="bipSavedRetake">Retake Interest Profiler</button></div></div>';
  document.getElementById('bipSavedContinue').onclick=continueCareer;document.getElementById('bipSavedRetake').onclick=()=>{state.retaking=true;render()};return;
 }
 const q=QUESTIONS[state.i],selected=Number(state.answers[q.index]||0),answered=Object.keys(state.answers).length,pct=Math.round(answered/30*100),asset='assets/onet/onet-'+String(q.index).padStart(2,'0')+'.webp';
 mount.innerHTML='<div class="bip-status"><span>Activity '+q.index+' of 30</span><div class="bip-track"><i style="width:'+pct+'%"></i></div><span>'+answered+' / 30 answered</span></div><div class="bip-card"><div class="bip-visual" id="bipVisual"><div class="bip-placeholder"><b>✦</b><span>BOOST O*NET VISUAL '+String(q.index).padStart(2,'0')+'</span><div>Image slot ready</div></div></div><div class="bip-copy"><small>WORK ACTIVITY '+q.index+' OF 30</small><h3>'+q.text+'</h3><p>How would you feel about doing this kind of work?</p><div class="bip-answers">'+ANSWERS.map(a=>'<button type="button" data-v="'+a.v+'" class="'+(selected===a.v?'selected':'')+'">'+a.e+' '+a.l+'</button>').join('')+'</div></div></div><div class="bip-nav"><button id="bipPrev" '+(state.i===0?'disabled':'')+'>← Previous</button><button class="next" id="bipNext" '+(!selected?'disabled':'')+'>'+(state.i===29?'Use my results →':'Next →')+'</button></div>';
 const visual=document.getElementById('bipVisual'),probe=new Image();probe.onload=()=>{visual.style.backgroundImage='linear-gradient(180deg,rgba(5,17,31,.02),rgba(5,17,31,.10)),url("'+asset+'")';visual.classList.add('has-art');visual.querySelector('.bip-placeholder').style.visibility='hidden'};probe.src=asset;
 mount.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{state.answers[q.index]=Number(b.dataset.v);render()});
 document.getElementById('bipPrev').onclick=()=>{if(state.i>0){state.i--;render()}};
 document.getElementById('bipNext').onclick=()=>{if(!state.answers[q.index])return;if(state.i<29){state.i++;render()}else finish()};
}
render();
})();