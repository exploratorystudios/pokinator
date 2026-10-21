import {loadReport,ANSWER_NAMES} from './report-data.js?v=recovery-v1';
import {buildTree,layoutTree,treeMarkup,exportTreeSvg,eventTitle,escape} from './report-tree.js?v=recovery-v1';

const $=id => document.getElementById(id);
const percent=value => `${(value*100).toFixed(1)}%`;
const id=location.hash.slice(1);
const report=loadReport(id);

if (!report) {
  $('report-empty').innerHTML='<div class="eyebrow">A MISSING FIELD NOTE</div><h1>This report isn’t in this browser.</h1><p>Finish a round, then choose “Explore this round’s report” to see its full story. Reports belong to the browser where you played; older reports may have been cleared.</p><p><a href="./">Back to Pokinator →</a></p>';
} else {
  render(report);
}

function render(report) {
  const names=Object.fromEntries(report.roster.map(p => [p.id,p.name]));
  const target=names[report.targetId];
  const answers=report.events.filter(e => e.kind==='answer');
  const rejected=report.events.filter(e => e.kind==='reject').length;
  const changes=report.events.filter(e => ['undo','revise','restore'].includes(e.kind)).length;
  const recoveries=report.events.filter(e => e.kind==='recover').length;
  const region={all:'All three regions',kanto:'Kanto',johto:'Johto',hoenn:'Hoenn'}[report.region];
  const targetScore=report.final.targetProbability;
  document.title=`${target} · Your round report · Pokinator`;
  $('report-heading').textContent=`${target}, one clue at a time.`;
  $('report-summary').textContent=report.outcome==='correct' ? `A confirmed hunch. ${report.initial.count} possibilities, ${answers.length} answers, and one Pokémon on your mind.` : `You revealed the answer. Here’s how the clues led us along the way, and where ${target} stood at the end.`;
  $('report-meta').textContent=`${region} · ${new Date(report.completed).toLocaleString()} · ${report.engine}`;
  $('report-sprite').src=`assets/pokemon/${report.targetId}.png`;
  $('report-sprite').alt=target;
  $('report-stats').innerHTML=[['Answers given',answers.length],['Candidates left',report.final.count],['Your Pokémon’s score',percent(targetScore)],['Rejected hunches',rejected]].map(([label,value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('');
  if (changes) $('report-meta').textContent+=` · ${changes} answer or rejection ${changes===1?'change':'changes'}`;
  if (recoveries) $('report-meta').textContent+=` · ${recoveries} ${recoveries===1?'recovery':'recoveries'}`;
  $('report-empty').hidden=true;
  $('report-content').hidden=false;

  const layout=layoutTree(buildTree(report));
  const scene=$('tree-scene'),viewport=$('tree-viewport');
  scene.innerHTML=treeMarkup(layout);
  let scale=1,tx=0,ty=0,drag=null,selection='start';
  function transform() {
    scene.setAttribute('transform',`translate(${tx},${ty}) scale(${scale})`);
    $('tree-zoom').textContent=`${Math.round(scale*100)}%`;
  }
  function focusNode(nodeId) {
    const p=layout.nodes.find(p => p.node.id===nodeId);
    if (!p) return;
    scale=1;
    // Leave a little of the incoming branch visible on a narrow screen.
    tx=viewport.clientWidth<600 ? 16-p.x : Math.min(28,viewport.clientWidth/2-(p.x+130));
    ty=viewport.clientHeight/2-p.y;
    transform();
  }
  function fit() {
    scale=Math.min((viewport.clientWidth-30)/layout.width,(viewport.clientHeight-30)/layout.height,1);
    tx=(viewport.clientWidth-layout.width*scale)/2;ty=(viewport.clientHeight-layout.height*scale)/2;transform();
  }
  function zoom(factor,x=viewport.clientWidth/2,y=viewport.clientHeight/2) {
    const next=Math.max(.025,Math.min(2.5,scale*factor));
    tx=x-(x-tx)*next/scale;ty=y-(y-ty)*next/scale;scale=next;transform();
  }
  function select(nodeId,{focus=false}={}) {
    const p=layout.nodes.find(p => p.node.id===nodeId);
    if (!p) return;
    selection=nodeId;
    scene.querySelectorAll('[data-node]').forEach(g => g.classList.toggle('selected',g.dataset.node===nodeId));
    const n=p.node;
    if (n.index!==undefined) {
      const e=report.events[n.index];
      $('tree-detail').innerHTML=`<h3>${escape(n.title)}</h3>${n.kind==='unvisited'?'<p>This answer wasn’t taken. The count comes from candidates compatible at the moment this question was asked; no future questions were simulated.</p>':eventDetails(e)}<p><a href="#entry-${n.index}">Find this ${e.kind==='answer'?'clue':'event'} in the full history ↓</a></p>`;
      $('tree-question').value=`event-${n.index}`;
    } else {
      $('tree-detail').innerHTML=n.kind==='outcome' ? `<h3>${escape(target)}</h3><p>${report.outcome==='correct'?'You confirmed this Pokémon.':'You supplied this Pokémon after the investigation.'} Its final score was ${percent(targetScore)}; ${report.final.count} candidates remained ${report.final.mistakeBudget?'in closest-fit mode':'compatible with your definite clues'}.</p>` : `<h3>A clean slate.</h3><p>All ${report.initial.count} Pokémon in your chosen roster began with equal weight. Follow the labeled answers to see what changed.</p>`;
      $('tree-question').value=nodeId;
    }
    if (focus) focusNode(nodeId);
  }
  $('tree-question').innerHTML=layout.nodes.filter(p => p.node.kind!=='unvisited').sort((a,b) => (a.node.id==='start'?-2:a.node.id==='finish'?Infinity:a.node.index)-(b.node.id==='start'?-2:b.node.id==='finish'?Infinity:b.node.index)).map(({node:n}) => `<option value="${n.id}">${escape(n.title.length>65?n.title.slice(0,62)+'…':n.title)}</option>`).join('');
  $('tree-question').addEventListener('change',e => select(e.target.value,{focus:true}));
  scene.addEventListener('click',e => { const n=e.target.closest('[data-node]');if (n&&!drag?.moved) select(n.dataset.node); });
  scene.addEventListener('keydown',e => {
    const n=e.target.closest('[data-node]');
    if (n && ['Enter',' '].includes(e.key)) { e.preventDefault();select(n.dataset.node,{focus:true}); }
  });
  viewport.addEventListener('pointerdown',e => { if (e.button!==0) return;drag={x:e.clientX,y:e.clientY,tx,ty,moved:false}; });
  viewport.addEventListener('pointermove',e => {
    if (!drag) return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if (Math.abs(dx)+Math.abs(dy)>4 && !drag.moved) { drag.moved=true;viewport.setPointerCapture(e.pointerId); }
    if (drag.moved) { tx=drag.tx+dx;ty=drag.ty+dy;viewport.classList.add('dragging');transform(); }
  });
  function endDrag() { viewport.classList.remove('dragging');setTimeout(() => drag=null,0); }
  viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
  // Keep normal page scrolling; a modifier opts into wheel zoom.
  viewport.addEventListener('wheel',e => { if (!e.ctrlKey&&!e.metaKey) return;e.preventDefault();const r=viewport.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.002),e.clientX-r.left,e.clientY-r.top); },{passive:false});
  $('tree-fit').addEventListener('click',fit);
  $('tree-readable').addEventListener('click',() => focusNode(selection));
  $('tree-in').addEventListener('click',() => zoom(1.35));
  $('tree-out').addEventListener('click',() => zoom(1/1.35));

  function ranked(state) {
    if (!state.top.length) return '<p>No candidates match the definite clues at this point.</p>';
    return `<ol class="report-ranked">${state.top.map(p => `<li>${escape(names[p.id])} <strong>${percent(p.probability)}</strong></li>`).join('')}</ol>`;
  }
  function eventDetails(e) {
    const eliminated=e.before.ids.filter(id => !e.after.ids.includes(id));
    const restored=e.after.ids.filter(id => !e.before.ids.includes(id));
    const label=e.kind==='answer' ? `<p><strong>${ANSWER_NAMES[e.value]}</strong>${e.finisher?' · One last hunch':''}. ${Math.abs(e.value)===1?'A definite answer filters the candidate pool.':e.value===0?'No candidates or scores change for Not sure.':'A tentative answer changes scores without eliminating candidates.'}</p>` : e.kind==='revise' ? `<p>${escape(e.text)}<br>${ANSWER_NAMES[e.oldValue]} → ${ANSWER_NAMES[e.value]}</p>` : e.kind==='recover' ? `<p>The previous clues left no candidates. I resumed with the closest unrejected matches, allowing up to ${e.budget} conflicting definite ${e.budget===1?'answer':'answers'}. Every original answer was preserved. My leading alternative differed on:</p><ul>${e.answers.map(a=>`<li>${escape(a.text)} <strong>${ANSWER_NAMES[a.value]}</strong></li>`).join('')}</ul>` : '';
    return `${label}<p>${e.before.count} → <strong>${e.after.count} candidates</strong>. ${escape(target)}: ${percent(e.before.targetProbability)} → ${percent(e.after.targetProbability)}${e.after.ids.includes(report.targetId)?'':' · ruled out by the current clues or rejection'}.</p>${e.after.mistakeBudget?`<p>Closest-fit mode: up to ${e.after.mistakeBudget} conflicting definite ${e.after.mistakeBudget===1?'answer':'answers'} allowed. Color and appearance clues have less weight in this mode.</p>`:''}${e.after.generation?`<p>Debut region established: ${['','Kanto','Johto','Hoenn'][e.after.generation]}.</p>`:''}<p>Leading guesses after this event:</p>${ranked(e.after)}${eliminated.length?`<details><summary>${eliminated.length} Pokémon ruled out</summary><p>${escape(eliminated.map(id => names[id]).join(', '))}</p></details>`:''}${restored.length?`<details><summary>${restored.length} Pokémon brought back</summary><p>${escape(restored.map(id => names[id]).join(', '))}</p></details>`:''}${e.after.count<=30?`<details><summary>All ${e.after.count} remaining candidates</summary><p>${escape(e.after.ids.map(id => names[id]).join(', ')||'None')}</p></details>`:''}`;
  }
  $('report-history').innerHTML=report.events.map((e,i) => `<li id="entry-${i}"><details><summary>${escape(eventTitle(e,names))}</summary><div class="event-details">${eventDetails(e)}<p><button class="text-button" data-focus="event-${i}">Show in the tree ↑</button></p></div></details><p class="event-result">${e.kind==='answer'?ANSWER_NAMES[e.value]+' · ':''}${e.before.count} → ${e.after.count} candidates</p></li>`).join('');
  $('report-history').addEventListener('click',e => { const b=e.target.closest('[data-focus]');if (b) { select(b.dataset.focus,{focus:true});$('decision-tree').scrollIntoView({behavior:'smooth'}); } });

  function drawChart() {
    const chart=$('candidate-chart'),w=chart.clientWidth,h=260,left=48,right=16,top=20,bottom=48;
    const points=[report.initial.count,...report.events.map(e => e.after.count)],max=report.initial.count;
    const x=i => left+i/Math.max(1,points.length-1)*(w-left-right),y=value => top+(1-value/max)*(h-top-bottom);
    chart.setAttribute('viewBox',`0 0 ${w} ${h}`);
    chart.innerHTML=`<title>Candidate pool: ${max} at the start, ${points.at(-1)} at the end</title><desc>Every recorded event is included. Exact counts and scores are available in Every clue.</desc>`+[0,Math.round(max/2),max].map(value => `<path d="M${left} ${y(value)}H${w-right}" stroke="#d8d9cb"/><text x="${left-8}" y="${y(value)+4}" text-anchor="end">${value}</text>`).join('')+`<path d="${points.map((p,i) => `${i?'L':'M'}${x(i)},${y(p)}`).join(' ')}" fill="none" stroke="#687b4e" stroke-width="2.5"/>`+points.map((p,i) => `<circle class="report-chart-hit" data-event="${i-1}" cx="${x(i)}" cy="${y(p)}" r="${points.length>30?3:4}" fill="#687b4e"><title>${i?eventTitle(report.events[i-1],names):'Start'}: ${p} candidates</title></circle>`).join('')+`<text x="${left}" y="${h-24}">Start</text><text x="${w-right}" y="${h-24}" text-anchor="end">${report.events.length} events · ${points.at(-1)} remain</text><text x="${left}" y="${h-4}">Possible Pokémon after each event</text>`;
  }
  $('candidate-chart').addEventListener('click',e => { const mark=e.target.closest('[data-event]');if (mark) { select(Number(mark.dataset.event)<0?'start':`event-${mark.dataset.event}`,{focus:true});$('decision-tree').scrollIntoView({behavior:'smooth'}); } });
  new ResizeObserver(drawChart).observe($('candidate-chart'));
  new ResizeObserver(() => focusNode(selection)).observe(viewport);
  select(report.events.length?'event-0':'start',{focus:true});
  drawChart();

  function download(blob,extension) {
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`pokinator-${target.toLowerCase()}-${report.id.slice(0,8)}.${extension}`;a.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  }
  $('download-json').addEventListener('click',() => download(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),'json'));
  $('download-svg').addEventListener('click',() => download(new Blob([exportTreeSvg(layout)],{type:'image/svg+xml'}),'svg'));
  $('download-png').addEventListener('click',async () => {
    const button=$('download-png');button.disabled=true;
    const url=URL.createObjectURL(new Blob([exportTreeSvg(layout)],{type:'image/svg+xml'}));
    try {
      const image=new Image();image.src=url;await image.decode();
      const ratio=Math.min(1,8192/layout.width,8192/layout.height,Math.sqrt(12_000_000/(layout.width*layout.height)));
      const canvas=document.createElement('canvas');canvas.width=Math.round(layout.width*ratio);canvas.height=Math.round(layout.height*ratio);
      canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
      const blob=await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
      if (!blob) throw new Error('No image generated');
      download(blob,'png');$('export-status').textContent=ratio<1?'PNG saved at a size suitable for a long tree. The SVG keeps every label at full resolution.':'PNG saved.';
    } catch { $('export-status').textContent='The image could not be saved. Try the SVG download instead.'; }
    finally { URL.revokeObjectURL(url);button.disabled=false; }
  });
}
