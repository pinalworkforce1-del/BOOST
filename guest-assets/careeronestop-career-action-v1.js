(()=>{
'use strict';
if(window.__BOOSTCareerOneStopLinks)return;window.__BOOSTCareerOneStopLinks=true;

const profileUrl=(soc,title)=>{
  const q=new URLSearchParams({keyword:title||soc||'',location:'US'});
  return 'https://www.careeronestop.org/Toolkit/Careers/Occupations/occupation-profile.aspx?'+q.toString();
};

const videoUrl=(soc)=>{
  const digits=String(soc||'').replace(/[^0-9]/g,'');
  if(digits.length<6)return '';
  const code=(digits.length>=8?digits.slice(0,8):digits.slice(0,6)+'00');
  return `https://cdn.careeronestop.org/OccVids/OccupationVideos/${code.slice(0,2)}-${code.slice(2,6)}.${code.slice(6,8)}.mp4`;
};

const css=document.createElement('style');
css.textContent=`
.cosRealityWrap{margin:14px 0 4px;padding:12px 14px;border-radius:12px;background:#eef7fb;border:1px solid #c9dde8}
.cosRealityWrap p{margin:0 0 7px;font-size:.9rem;color:#355568}
.cosVideoAction{display:inline-flex;align-items:center;gap:6px;margin-top:5px;padding:8px 11px;border:0;border-radius:999px;background:#174e70;color:#fff!important;font:inherit;font-weight:900;font-size:.8rem;box-shadow:0 2px 7px #173b5620;cursor:pointer}
.cosVideoAction:hover,.cosVideoAction:focus-visible{background:#0e3c58;outline:2px solid #76b8dc;outline-offset:2px}
.cosVideoAction small{font-weight:650;opacity:.9}
.cosVideoPanel{margin-top:10px}
.cosVideoPanel video{display:block;width:100%;max-width:720px;aspect-ratio:16/9;background:#08141b;border-radius:12px;box-shadow:0 4px 14px #173b5625}
.cosVideoMeta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:7px;font-size:.78rem;color:#58717e}
.cosProfileLink{font-weight:800;color:#174e70;text-decoration:none}
.cosProfileLink:hover{text-decoration:underline}
.cosVideoFallback{padding:10px 12px;border-radius:10px;background:#fff;border:1px solid #d3e0e6;color:#445f6d;font-size:.86rem}
`;
document.head.appendChild(css);

function buildWidget(soc,title){
  const wrap=document.createElement('div');
  wrap.className='cosRealityWrap';
  wrap.dataset.cosSoc=String(soc);
  wrap.innerHTML='<p><b>See this career in action:</b> watch the CareerOneStop career video without leaving BOOST.</p>';

  const btn=document.createElement('button');
  btn.type='button';
  btn.className='cosVideoAction';
  btn.innerHTML='▶ Watch Career Video <small>CareerOneStop</small>';
  btn.setAttribute('aria-expanded','false');

  const panel=document.createElement('div');
  panel.className='cosVideoPanel';
  panel.hidden=true;

  btn.addEventListener('click',()=>{
    const isOpen=!panel.hidden;
    if(isOpen){
      panel.hidden=true;
      btn.setAttribute('aria-expanded','false');
      btn.innerHTML='▶ Watch Career Video <small>CareerOneStop</small>';
      const v=panel.querySelector('video');
      if(v&&!v.paused)v.pause();
      return;
    }

    panel.hidden=false;
    btn.setAttribute('aria-expanded','true');
    btn.innerHTML='▾ Hide Career Video <small>CareerOneStop</small>';

    if(panel.dataset.loaded)return;
    panel.dataset.loaded='1';

    const src=videoUrl(soc);
    const fallback=()=>{
      panel.innerHTML='';
      const box=document.createElement('div');
      box.className='cosVideoFallback';
      box.innerHTML='CareerOneStop does not expose a video at this exact occupation-code file address. Some occupations use a shared or cross-walked career video. ';
      const a=document.createElement('a');
      a.className='cosProfileLink';
      a.target='_blank';
      a.rel='noopener';
      a.href=profileUrl(soc,title);
      a.textContent='Open the CareerOneStop profile ↗';
      box.appendChild(a);
      panel.appendChild(box);
    };

    if(!src){fallback();return;}

    const video=document.createElement('video');
    video.controls=true;
    video.preload='metadata';
    video.playsInline=true;
    video.src=src;
    video.setAttribute('aria-label',`${title||'Career'} career video from CareerOneStop`);
    video.addEventListener('error',fallback,{once:true});

    const meta=document.createElement('div');
    meta.className='cosVideoMeta';
    meta.innerHTML='<span>Source: U.S. Department of Labor CareerOneStop</span><span>•</span>';
    const a=document.createElement('a');
    a.className='cosProfileLink';
    a.target='_blank';
    a.rel='noopener';
    a.href=profileUrl(soc,title);
    a.textContent='View full occupation profile ↗';
    meta.appendChild(a);

    panel.append(video,meta);
    video.load();
  });

  wrap.append(btn,panel);
  return wrap;
}

function addToCard(card,soc,title){
  if(!card||!soc)return;
  const direct=[...card.children].filter(x=>x.classList?.contains('cosRealityWrap')||x.classList?.contains('cosCareerAction'));
  if(direct.length){direct.slice(1).forEach(x=>x.remove());return;}

  const widget=buildWidget(soc,title);
  const add=card.querySelector('.addBtn[data-soc]');
  const research=card.querySelector('.research');
  if(add){add.insertAdjacentElement('afterend',widget);return;}
  if(research){research.insertAdjacentElement('beforebegin',widget);return;}
  const anchor=card.querySelector('.workDriverLine,.prep,.metrics,.actions')||card.lastElementChild||card;
  anchor.insertAdjacentElement(anchor.classList?.contains('actions')?'beforebegin':'afterend',widget);
}

function scan(){
  const data=[...(Array.isArray(window.OCCS)?window.OCCS:[]),...(Array.isArray(window.DATA)?window.DATA:[])];
  document.querySelectorAll('article.card,article.career,.careerCard,.career-card,.resultCard,.result-card').forEach(card=>{
    const add=card.querySelector('.addBtn[data-soc]');
    let soc=add?.dataset?.soc||card.dataset?.soc||'';
    if(!soc){const m=(card.textContent||'').match(/\b\d{2}-\d{4}(?:\.\d{2})?\b/);soc=m?.[0]||'';}
    if(!soc)return;
    const o=data.find(x=>String(x.soc)===String(soc))||data.find(x=>String(x.soc).startsWith(String(soc).slice(0,7)));
    addToCard(card,soc,o?.title||card.querySelector('h2,h3,h4,.title')?.textContent?.trim());
  });
}

const mo=new MutationObserver(muts=>{
  if(muts.every(m=>[...m.addedNodes].every(n=>n.nodeType!==1||n.classList?.contains('cosRealityWrap')||n.classList?.contains('cosVideoPanel'))))return;
  clearTimeout(window.__cosScanTimer);
  window.__cosScanTimer=setTimeout(scan,80);
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{scan();mo.observe(document.body,{childList:true,subtree:true});},{once:true});
else{scan();mo.observe(document.body,{childList:true,subtree:true});}
})();