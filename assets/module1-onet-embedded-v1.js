(()=>{
'use strict';
const KEYS=['R','I','A','S','E','C'];
const LABELS={R:'Realistic',I:'Investigative',A:'Artistic',S:'Social',E:'Enterprising',C:'Conventional'};
const PHRASES={
 R:'hands-on building, fixing, tools, and practical work',
 I:'investigating, analyzing, researching, and solving complex problems',
 A:'creating, designing, writing, performing, and expressing ideas',
 S:'helping, teaching, advising, supporting, and serving people',
 E:'leading, persuading, selling, influencing, and directing outcomes',
 C:'organizing, tracking, processing, accuracy, and structured systems'
};
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
.bip-card{overflow:hidden;border-radius:20px;background:#0b1d33;color:#fff;box-shadow:0 16px 38px #17324d22}.bip-visual{width:100%;aspect-ratio:16/9;height:auto;min-height:0;display:grid;place-items:center;text-align:center;padding:0;background-color:#0b1d33;background-image:radial-gradient(circle at 50% 35%,#225f78,#0b1d33 72%);background-size:cover;background-repeat:no-repeat;background-position:center;position:relative}.bip-visual.has-art:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 72%,rgba(5,17,31,.30))}.bip-placeholder{position:relative;z-index:1;padding:22px}.bip-placeholder b{font-size:3rem;display:block}.bip-placeholder span{font-size:.75rem;letter-spacing:.12em;font-weight:900;color:#bdeae6}.bip-copy{padding:18px 20px 20px}.bip-copy small{color:#63d6d0;font-weight:900;letter-spacing:.1em}.bip-copy h3{font-size:clamp(1.35rem,2.6vw,2rem);margin:5px 0}.bip-copy p{color:#d7e3ed;margin:0 0 14px}.bip-answers{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.bip-answers button{min-height:56px;border:1px solid #385873;border-radius:12px;background:#102944;color:#fff;font-weight:900;cursor:pointer}.bip-answers button:hover,.bip-answers button.selected{background:#176e69;border-color:#6be0d9;outline:2px solid #6be0d944}.bip-nav{display:flex;gap:10px;margin-top:12px}.bip-nav button,.bip-saved button,.bip-done button{padding:11px 15px;border-radius:10px;border:1px solid #c6d9e1;background:#fff;color:#17324d;font-weight:900;cursor:pointer}.bip-nav .next,.bip-saved .primary,.bip-done .primary{margin-left:auto;background:#0b3158;color:#fff}.bip-nav button:disabled{opacity:.4;cursor:not-allowed}.bip-saved,.bip-done{padding:20px;border:1px solid #bfe0da;border-radius:16px;background:#eef9f6;color:#185b56}.bip-saved>strong,.bip-done>strong{display:block;font-size:1.12rem;margin-bottom:5px}.bip-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.bip-profile-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin:14px 0 12px}.bip-profile-head h4{margin:0 0 3px;color:#143b55;font-size:1.15rem}.bip-profile-head p{margin:0;color:#536f78}.bip-code{min-width:88px;text-align:center;padding:9px 13px;border-radius:12px;background:#0b3158;color:#fff}.bip-code small{display:block;font-size:.62rem;letter-spacing:.1em;opacity:.8}.bip-code b{font-size:1.55rem;letter-spacing:.08em}.bip-score-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:9px;margin:12px 0 15px}.bip-score{padding:11px;border:1px solid #c9ddd9;border-radius:12px;background:#fff;color:#17324d}.bip-score.top{border-color:#168c87;box-shadow:0 0 0 2px #168c8722}.bip-score .row{display:flex;align-items:baseline;justify-content:space-between;gap:6px}.bip-score .code{font-weight:950;color:#35606c}.bip-score .num{font-size:1.45rem;font-weight:950;color:#0b3158}.bip-score .label{display:block;font-size:.72rem;font-weight:850;margin:2px 0 8px}.bip-score .bar{height:6px;background:#e4eeee;border-radius:99px;overflow:hidden}.bip-score .bar i{display:block;height:100%;background:#168c87;border-radius:99px}.bip-rosie{margin-top:10px;padding:14px 15px;border-radius:13px;background:#fff;border-left:5px solid #e9aa2c;color:#294a59}.bip-rosie b{color:#0b3158}.bip-rosie p{margin:4px 0 6px}.bip-rosie small{color:#607782}.bip-profile-note{margin:8px 0 0;color:#536f78;font-size:.86rem}
@media(max-width:900px){.bip-score-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:760px){.bip-answers{grid-template-columns:1fr 1fr}.bip-answers button:first-child{grid-column:1/-1}.bip-visual{aspect-ratio:16/9}.bip-profile-head{flex-direction:column}.bip-score-grid{grid-template-columns:repeat(2,1fr)}}
`;document.head.appendChild(style);
const mount=document.createElement('div');mount.id='boostEmbeddedOnet';onet.appendChild(mount);
const state={i:0,answers:{},retaking:false};
function rankedScores(scores){return KEYS.map(k=>({code:k,label:LABELS[k],score:Number(scores[k])||0})).sort((a,b)=>b.score-a.score||KEYS.indexOf(a.code)-KEYS.indexOf(b.code))}
function profileCode(scores){return rankedScores(scores).slice(0,3).map(x=>x.code).join('')}
function syncInterestSummary(scores){
 const summary=document.getElementById('interestSummary');if(!summary)return;
 const top=rankedScores(scores).slice(0,3);
 summary.innerHTML='Your strongest interest signals are <b>'+top.map(x=>x.label).join(', ')+'</b> ('+top.map(x=>x.code).join('')+'). BOOST uses the full six-score pattern when comparing occupations.';
 summary.style.display='block';
}
function hideInterestSummary(){const summary=document.getElementById('interestSummary');if(summary)summary.style.display='none'}
function rosieRead(scores){
 const top=rankedScores(scores).slice(0,3),labels=top.map(x=>x.label),phrases=top.map(x=>PHRASES[x.code]);
 return `<div class="bip-rosie"><b>Rosie's read</b><p>Your strongest pattern is <b>${labels[0]} → ${labels[1]} → ${labels[2]}</b>. You may be especially drawn to work that combines ${phrases[0]}, ${phrases[1]}, and ${phrases[2]}.</p><small>This is career-exploration guidance, not a measure of ability, qualification, or what careers you are allowed to pursue.</small></div>`;
}
function profileHtml(scores,saved=false){
 const ranked=rankedScores(scores),top=new Set(ranked.slice(0,3).map(x=>x.code)),scaleMax=Math.max(...KEYS.map(k=>Number(scores[k])||0))>20?40:20,code=profileCode(scores);
 return `<div class="${saved?'bip-saved':'bip-done'}"><strong>✓ Your O*NET interest profile is ${saved?'saved':'ready'}.</strong><div class="bip-profile-head"><div><h4>Your six-score interest profile</h4><p>The three-letter code is a quick summary. BOOST keeps all six scores for career matching.</p></div><div class="bip-code"><small>TOP 3 CODE</small><b>${code}</b></div></div><div class="bip-score-grid">${KEYS.map(k=>`<div class="bip-score ${top.has(k)?'top':''}"><div class="row"><span class="code">${k}</span><span class="num">${scores[k]}</span></div><span class="label">${LABELS[k]}</span><div class="bar"><i style="width:${Math.min(100,Math.max(0,(Number(scores[k])||0)/scaleMax*100))}%"></i></div></div>`).join('')}</div>${rosieRead(scores)}<p class="bip-profile-note">BOOST has connected these results directly to Career Exploration. No manual score entry is needed.</p><div class="bip-actions"><button class="primary" id="${saved?'bipSavedContinue':'bipContinue'}">${saved?'Continue with saved results':'Show Careers That Connect to Me'} →</button><button id="${saved?'bipSavedRetake':'bipRetake'}">${saved?'Retake Interest Profiler':'Retake'}</button></div></div>`;
}
function continueCareer(){document.getElementById('surfaceBtn')?.click();document.getElementById('recommendations')?.scrollIntoView({behavior:'smooth',block:'start'})}
function startRetake(){state.i=0;state.answers={};state.retaking=true;hideInterestSummary();render()}
function finish(){
 const scores={R:0,I:0,A:0,S:0,E:0,C:0};
 QUESTIONS.forEach(q=>{const v=Number(state.answers[q.index]);if(v>=1&&v<=5)scores[q.area]+=v-1});
 KEYS.forEach(k=>{const el=document.getElementById(k);el.value=String(scores[k]);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});
 try{localStorage.setItem('pinal_boost_onet_scores_v1',JSON.stringify(scores))}catch(_){}
 syncInterestSummary(scores);
 mount.innerHTML=profileHtml(scores,false);
 document.getElementById('bipContinue').onclick=continueCareer;document.getElementById('bipRetake').onclick=startRetake;
}
function render(){
 if(hasSaved&&!state.retaking&&Object.keys(state.answers).length===0){
  syncInterestSummary(oldScores);
  mount.innerHTML=profileHtml(oldScores,true);
  document.getElementById('bipSavedContinue').onclick=continueCareer;document.getElementById('bipSavedRetake').onclick=startRetake;return;
 }
 if(state.retaking)hideInterestSummary();
 const q=QUESTIONS[state.i],selected=Number(state.answers[q.index]||0),answered=Object.keys(state.answers).length,pct=Math.round(answered/30*100),asset='assets/onet/onet-'+String(q.index).padStart(2,'0')+'.webp';
 mount.innerHTML='<div class="bip-status"><span>Activity '+q.index+' of 30</span><div class="bip-track"><i style="width:'+pct+'%"></i></div><span>'+answered+' / 30 answered</span></div><div class="bip-card"><div class="bip-visual" id="bipVisual"><div class="bip-placeholder"><b>✦</b><span>BOOST O*NET VISUAL '+String(q.index).padStart(2,'0')+'</span><div>Image slot ready</div></div></div><div class="bip-copy"><small>WORK ACTIVITY '+q.index+' OF 30</small><h3>'+q.text+'</h3><p>How would you feel about doing this kind of work?</p><div class="bip-answers">'+ANSWERS.map(a=>'<button type="button" data-v="'+a.v+'" class="'+(selected===a.v?'selected':'')+'">'+a.e+' '+a.l+'</button>').join('')+'</div></div></div><div class="bip-nav"><button id="bipPrev" '+(state.i===0?'disabled':'')+'>← Previous</button><button class="next" id="bipNext" '+(!selected?'disabled':'')+'>'+(state.i===29?'Use my results →':'Next →')+'</button></div>';
 const visual=document.getElementById('bipVisual'),probe=new Image();probe.onload=()=>{visual.style.backgroundImage='linear-gradient(180deg,rgba(5,17,31,.02),rgba(5,17,31,.10)),url("'+asset+'")';visual.classList.add('has-art');visual.querySelector('.bip-placeholder').style.visibility='hidden'};probe.src=asset;
 mount.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{state.answers[q.index]=Number(b.dataset.v);render()});
 document.getElementById('bipPrev').onclick=()=>{if(state.i>0){state.i--;render()}};
 document.getElementById('bipNext').onclick=()=>{if(!state.answers[q.index])return;if(state.i<29){state.i++;render()}else finish()};
}
render();
})();