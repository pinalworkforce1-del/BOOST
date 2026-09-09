const BOOST_FILTERS={area:'all',wage:0,opportunity:'all',h3:'all',prep:'all'};
function boostArea(o){
 const major=(o.soc||'').slice(0,2),t=(o.title||'').toLowerCase();
 if(['29','31'].includes(major))return'Healthcare';
 if(major==='15')return'Information Technology';
 if(major==='53')return'Transportation & Logistics';
 if(['47','49'].includes(major))return'Skilled Trades & Construction';
 if(['17','51'].includes(major))return'Advanced Manufacturing & Engineering';
 if(['11','13','41','43'].includes(major))return'Business & Customer Operations';
 if(['21','25','39'].includes(major))return'Education & Human Services';
 if(['23','33'].includes(major))return'Public Safety & Legal';
 if(['35','37'].includes(major))return'Food & Hospitality';
 if(['19','45'].includes(major))return'Science & Environment';
 if(major==='27')return'Arts, Media & Design';
 if(t.includes('driver')||t.includes('logistic')||t.includes('transport'))return'Transportation & Logistics';
 return'Other Career Areas';
}
function boostPrep(o){
 const e=(o.education||'').toLowerCase();
 if(!e||e==='n/a')return'other';
 if(e.includes('no formal'))return'none';
 if(e.includes('high school'))return'highschool';
 if(e.includes('some college')||e.includes('postsecondary nondegree'))return'postsecondary';
 if(e.includes('associate'))return'associate';
 if(e.includes('bachelor')||e.includes('master')||e.includes('doctoral')||e.includes('professional'))return'bachelor';
 return'other';
}
function boostPass(o){
 if(BOOST_FILTERS.area!=='all'&&boostArea(o)!==BOOST_FILTERS.area)return false;
 const wage=Number(o.p25 ?? o.median ?? 0);
 if(Number(BOOST_FILTERS.wage)>0&&wage<Number(BOOST_FILTERS.wage))return false;
 if(BOOST_FILTERS.opportunity!=='all'&&(o.tier||'')!==BOOST_FILTERS.opportunity)return false;
 if(BOOST_FILTERS.h3==='yes'&&!o.pathway)return false;
 if(BOOST_FILTERS.prep!=='all'&&boostPrep(o)!==BOOST_FILTERS.prep)return false;
 return true;
}
resultSet=function(){
 if(!scores)return[];
 let base=filter==='all'?ranked:ranked.filter(o=>stageClass(o)===filter);
 return base.filter(boostPass).slice(0,visible);
};
renderCards=function(){
 const box=$('cards');
 if(!scores){box.innerHTML='<div class="empty">Enter your O*NET scores above to surface careers.</div>';$('moreBtn').style.display='none';return}
 const base=(filter==='all'?ranked:ranked.filter(o=>stageClass(o)===filter)).filter(boostPass);
 const arr=base.slice(0,visible);
 box.innerHTML=arr.length?arr.map(o=>cardHtml(o,'BOOST Surfaced')).join(''):'<div class="filterZero"><b>No careers match all of these filters.</b><br>Try widening one filter, or use Explore Any Career below. Filters narrow the view — they never block what you may explore.</div>';
 bindAddButtons(box);
 const count=$('filterCount');if(count)count.textContent=`Showing ${Math.min(arr.length,visible)} of ${base.length} matching careers`;
 $('moreBtn').style.display=visible<base.length?'inline-block':'none';
};
searchMatches=function(q){
 q=q.trim().toLowerCase();if(!q)return[];
 const aliasSocs=new Set();
 Object.entries(ALIASES).forEach(([a,socs])=>{if(a.includes(q)||q.includes(a))socs.forEach(s=>aliasSocs.add(s))});
 return OCCS.filter(o=>boostPass(o)&&(aliasSocs.has(o.soc)||o.title.toLowerCase().includes(q)||o.soc.includes(q))).sort((a,b)=>{
  const aa=aliasSocs.has(a.soc)?1:0,bb=aliasSocs.has(b.soc)?1:0;if(bb!==aa)return bb-aa;
  const ax=scores&&a.ria?alignment(a):-1,bx=scores&&b.ria?alignment(b):-1;if(bx!==ax)return bx-ax;
  return a.title.localeCompare(b.title);
 }).slice(0,30);
};
function boostResetFilters(){
 Object.assign(BOOST_FILTERS,{area:'all',wage:0,opportunity:'all',h3:'all',prep:'all'});
 ['careerArea','careerWage','careerOpportunity','careerH3','careerPrep'].forEach(id=>{const el=$(id);if(el)el.selectedIndex=0});
 visible=12;renderCards();if($('searchInput')?.value)renderSearchList();
}
function boostInstallFilters(){
 if($('careerFilterBar'))return;
 const head=document.querySelector('#recommendations .resultsHead');if(!head)return;
 const wrap=document.createElement('div');wrap.innerHTML=`<div class="careerFilterBar" id="careerFilterBar">
  <div class="careerFilter"><label for="careerArea">Career Area</label><select id="careerArea"><option value="all">All career areas</option><option>Healthcare</option><option>Advanced Manufacturing & Engineering</option><option>Skilled Trades & Construction</option><option>Transportation & Logistics</option><option>Information Technology</option><option>Business & Customer Operations</option><option>Education & Human Services</option><option>Public Safety & Legal</option><option>Food & Hospitality</option><option>Science & Environment</option><option>Arts, Media & Design</option><option>Other Career Areas</option></select></div>
  <div class="careerFilter"><label for="careerWage">Point-of-Entry Wage</label><select id="careerWage"><option value="0">Any wage</option><option value="18">$18+/hour</option><option value="22">$22+/hour</option><option value="28">$28+/hour</option><option value="35">$35+/hour</option></select></div>
  <div class="careerFilter"><label for="careerOpportunity">Regional Opportunity</label><select id="careerOpportunity"><option value="all">All opportunity levels</option><option>Strong Regional Opportunity</option><option>Established Regional Opportunity</option><option>Limited Regional Availability</option><option>Very Limited Regional Evidence</option></select></div>
  <div class="careerFilter"><label for="careerH3">Pinal H3 Career Pathway</label><select id="careerH3"><option value="all">All careers</option><option value="yes">In a Pinal H3 pathway</option></select></div>
 </div>
 <div class="moreFilterWrap"><button class="moreFilterToggle" id="moreFilterToggle" type="button">＋ More filter: typical preparation</button><div class="moreFilters" id="moreFilters"><div class="careerFilter" style="max-width:330px"><label for="careerPrep">Typical Preparation</label><select id="careerPrep"><option value="all">Any preparation</option><option value="none">No formal credential</option><option value="highschool">High school</option><option value="postsecondary">Some college / postsecondary credential</option><option value="associate">Associate degree</option><option value="bachelor">Bachelor's degree or higher</option></select></div></div></div>
 <div class="careerFilterMeta"><span id="filterCount">Showing careers ranked by interest alignment</span><button id="clearCareerFilters" type="button">Clear filters</button></div>`;
 head.insertAdjacentElement('afterend',wrap);
 const bind=(id,key,transform=v=>v)=>{$(id).onchange=e=>{BOOST_FILTERS[key]=transform(e.target.value);visible=12;renderCards();if($('searchInput')?.value)renderSearchList()}};
 bind('careerArea','area');bind('careerWage','wage',Number);bind('careerOpportunity','opportunity');bind('careerH3','h3');bind('careerPrep','prep');
 $('clearCareerFilters').onclick=boostResetFilters;
 $('moreFilterToggle').onclick=()=>{$('moreFilters').classList.toggle('open');$('moreFilterToggle').textContent=$('moreFilters').classList.contains('open')?'− Hide preparation filter':'＋ More filter: typical preparation'};
 document.querySelectorAll('.filterBtn').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;visible=12;document.querySelectorAll('.filterBtn').forEach(x=>x.classList.toggle('active',x===b));renderCards()});
 $('moreBtn').onclick=()=>{visible+=12;renderCards()};
 const originalSurface=surface;
 surface=function(){originalSurface();visible=12;renderCards()};
 visible=12;
 if(scores&&ranked.length)renderCards();
}
(function waitForBoost(){let tries=0;const timer=setInterval(()=>{tries++;if(typeof OCCS!=='undefined'&&OCCS.length){clearInterval(timer);boostInstallFilters()}else if(tries>100)clearInterval(timer)},50)})();