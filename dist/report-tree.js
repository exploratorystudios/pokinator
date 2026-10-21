import {ANSWER_NAMES} from './report-data.js?v=recovery-v1';

export const escape = value => String(value).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function eventTitle(event,names) {
  switch (event.kind) {
    case 'answer': return `Q${event.question}. ${event.text}`;
    case 'guess': return `Hunch: ${names[event.id]}`;
    case 'reject': return `Ruled out ${names[event.id]}`;
    case 'restore': return `Restored ${names[event.id]}`;
    case 'undo': return `Undid answer ${event.question}`;
    case 'revise': return `Edited answer ${event.question} to ${ANSWER_NAMES[event.value]}`;
    case 'recover': return `Closest fits with ${event.budget} conflicting ${event.budget===1?'clue':'clues'}`;
    case 'conflict': return 'No candidates match these clues';
    case 'stumped': return 'Not enough clues to make a fair guess';
    default: return 'Round event';
  }
}

export function buildTree(report) {
  const names=Object.fromEntries(report.roster.map(p => [p.id,p.name]));
  const root={id:'start',kind:'start',title:`${report.initial.count} possibilities`,detail:'The beginning of your round',children:[]};
  let parent=root,edge='Start';
  report.events.forEach((event,index) => {
    const n={id:`event-${index}`,kind:event.kind,title:eventTitle(event,names),detail:`${event.before.count} → ${event.after.count} candidates`,index,children:[]};
    parent.children.push({label:edge,observed:true,node:n});
    if (event.kind==='answer') {
      for (const [value,label,key] of [[1,'Yes','yes'],[-1,'No','no']]) {
        if (event.value!==value) n.children.push({label,observed:false,node:{id:`other-${index}-${key}`,kind:'unvisited',title:`${event.branches[key].length} compatible`,detail:`${label} · unexplored answer`,index,children:[]}});
      }
      edge=ANSWER_NAMES[event.value];
    } else edge='Continue';
    parent=n;
  });
  parent.children.push({label:['Start','Continue'].includes(edge)?'Result':edge,observed:true,node:{id:'finish',kind:'outcome',title:names[report.targetId],detail:report.outcome==='correct'?'You confirmed the hunch':'You revealed your Pokémon',children:[]}});
  return root;
}

export function layoutTree(root) {
  const nodes=[],edges=[];let leaf=0;
  function visit(node,depth) {
    const kids=node.children.map(c => ({...c,position:visit(c.node,depth+1)}));
    const y=kids.length ? kids.reduce((s,c) => s+c.position.y,0)/kids.length : 80+leaf++*145;
    const position={node,x:24+depth*340,y};nodes.push(position);
    for (const c of kids) edges.push({from:position,to:c.position,label:c.label,observed:c.observed});
    return position;
  }
  visit(root,0);
  return {nodes,edges,width:Math.max(...nodes.map(n => n.x))+290,height:Math.max(210,leaf*145+20)};
}

function wrap(text) {
  const lines=[];let line='';
  for (const word of text.split(/\s+/)) {
    if ((line+' '+word).trim().length>31 && line) { lines.push(line); line=''; }
    line+=(line?' ':'')+word;
  }
  if (line) lines.push(line);
  return lines.length>3 ? [...lines.slice(0,2),lines[2].slice(0,27)+'…'] : lines;
}

export function treeMarkup(layout, interactive=true) {
  return layout.edges.map(e => `<g><path class="tree-edge ${e.observed?'observed':'unvisited'}" d="M${e.from.x+260},${e.from.y} C${e.from.x+300},${e.from.y} ${e.to.x-40},${e.to.y} ${e.to.x},${e.to.y}"/>${!['Start','Continue','Result'].includes(e.label)?`<text class="tree-label" x="${e.to.x-8}" y="${e.to.y-58}" text-anchor="end">${escape(e.label)}</text>`:''}</g>`).join('')+
    layout.nodes.map(({node:n,x,y}) => `<g class="tree-node" data-node="${n.id}" ${interactive?'role="button" tabindex="0"':''} aria-label="${escape(n.title+'; '+n.detail)}"><title>${escape(n.title+' · '+n.detail)}</title><rect class="tree-box ${n.kind}" x="${x}" y="${y-49}" width="260" height="98" rx="7"/>${wrap(n.title).map((text,i) => `<text class="tree-title" x="${x+12}" y="${y-27+i*18}">${escape(text)}</text>`).join('')}<text class="tree-label" x="${x+12}" y="${y+35}">${escape(n.detail)}</text></g>`).join('');
}

export function exportTreeSvg(layout) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img"><title>Pokinator round decision tree</title><style>text{font:14px sans-serif;fill:#272a23}.tree-label{font-size:12px;fill:#5d6356}.tree-edge{fill:none;stroke:#a4ab98;stroke-width:1.4}.tree-edge.observed{stroke:#687b4e;stroke-width:2}.tree-edge.unvisited{stroke-dasharray:4 4}.tree-box{fill:#f3e4eb;stroke:#c9cbbc}.tree-box.unvisited{fill:#efede5;stroke-dasharray:4 4}.tree-box.outcome{fill:#d4ed9b}.tree-box.start{fill:#ddd5f3}</style><rect width="100%" height="100%" fill="#f5f1e8"/>${treeMarkup(layout,false)}</svg>`;
}
