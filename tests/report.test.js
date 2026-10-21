import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game,ENGINE_VERSION} from '../dist/engine.js';
import {RunRecorder,saveReport,loadReport,clearReports} from '../dist/report-data.js';
import {buildTree,layoutTree,exportTreeSvg} from '../dist/report-tree.js';
const roster=JSON.parse(fs.readFileSync(new URL('../dist/pokemon.json',import.meta.url)));
function setup(){const game=new Game(roster,{random:()=>.5});return {game,recorder:new RunRecorder(game,{region:'all',engine:ENGINE_VERSION})};}
function force(game,id){const trait=game.traitById.get(id);game.current={...trait,text:trait.lines[0]};}
function storage(){function area(){const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)};}return {sessionStorage:area(),localStorage:area()};}
function finalize(recorder,id=25){return recorder.finish(roster.find(p=>p.id===id),'correct');}

test('live report preserves exact questions, partitions, scores, and a confirmed finale',()=>{
 const {game,recorder}=setup();
 while(!game.shouldGuess())recorder.answer(game.current.members.has(25)?1:-1);
 recorder.record('guess',{id:game.ranking()[0].pokemon.id});
 const report=finalize(recorder);
 assert.equal(report.events.at(-1).id,25);
 assert.equal(report.final.targetProbability,game.ranking().find(r=>r.pokemon.id===25).probability);
 assert.equal(report.events.filter(e=>e.kind==='answer').length,game.history.length);
 for(const e of report.events.filter(e=>e.kind==='answer')){
  assert.equal(e.text,game.history[e.question-1].text);
  assert.deepEqual([...e.branches.yes,...e.branches.no].sort((a,b)=>a-b),[...e.before.ids].sort((a,b)=>a-b));
  assert.equal(e.after.count,e.value>0?e.branches.yes.length:e.branches.no.length);
  assert.ok(!('scores' in e.before),'Full in-memory ranking is not persisted');
 }
 assert.ok(report.events.some(e=>e.finisher));
});

test('soft and unknown report branches keep both pools; target scores still reflect tentative clues',()=>{
 const {game,recorder}=setup();force(game,'type:electric');recorder.answer(.5);
 force(game,'generation:1');recorder.answer(0);
 const report=finalize(recorder);
 assert.equal(report.events[0].before.count,386);assert.equal(report.events[0].after.count,386);
 assert.ok(report.events[0].after.targetProbability>report.events[0].before.targetProbability);
 assert.equal(report.events[1].after.targetProbability,report.events[1].before.targetProbability);
 assert.deepEqual(report.events[1].after.ids,report.events[1].before.ids);
 const tree=buildTree(report),question=tree.children[0].node;
 assert.equal(question.children.length,3,'Probably has its observed branch plus unexplored Yes and No');
 assert.ok(question.children.some(c=>c.label==='Probably'&&c.observed));
});

test('report retains rejections, restores, answer revisions, and undos in real chronological order',()=>{
 const {game,recorder}=setup();force(game,'generation:1');recorder.answer(1);
 recorder.record('reject',{id:25},()=>game.reject(25));
 recorder.record('restore',{id:25},()=>game.restoreRejected());
 recorder.record('revise',{question:1,oldValue:1,value:-1,text:game.history[0].text},()=>game.revise(0,-1));
 recorder.record('undo',{question:1},()=>game.back());
 const report=finalize(recorder);
 assert.deepEqual(report.events.map(e=>e.kind),['answer','reject','restore','revise','undo']);
 assert.equal(report.events[1].after.targetProbability,0);
 assert.ok(report.events[2].after.targetProbability>0);
 assert.equal(report.events[3].after.count,235);
 assert.equal(report.events[4].after.count,386);
 assert.equal(report.answers.length,0);
 const layout=layoutTree(buildTree(report));
 for(const e of layout.edges)assert.ok(e.to.x>e.from.x,'A true rooted tree has no backward or disconnected edges');
 assert.equal(layout.nodes.filter(p=>p.node.kind==='outcome').length,1);
});

test('a conflicting report has no phantom leading guess or non-finite target score',()=>{
 const {game,recorder}=setup();force(game,'generation:1');recorder.answer(1);force(game,'generation:2');recorder.answer(1);
 recorder.record('conflict');
 const report=finalize(recorder);assert.equal(report.final.count,0);assert.deepEqual(report.final.top,[]);assert.equal(report.final.targetProbability,0);assert.equal(report.final.targetRank,null);
 assert.ok(!JSON.stringify(report).includes('NaN'));
});

test('report storage retains three rounds, survives reload, and clears separately from training data',()=>{
 const store=storage(),reports=[];store.localStorage.setItem('pokinator-rounds','training-data');
 for(let i=0;i<4;i++){const {recorder}=setup(),report=finalize(recorder);reports.push(report);assert.ok(saveReport(report,store));}
 assert.equal(loadReport(reports[0].id,store),null);
 for(const report of reports.slice(1))assert.equal(loadReport(report.id,store).targetId,25);
 clearReports(store);assert.equal(loadReport(reports[3].id,store),null);assert.equal(store.localStorage.getItem('pokinator-rounds'),'training-data');
});

test('storage failures fall back to a session; corrupt or missing report links fail safely',()=>{
 const report=finalize(setup().recorder),store=storage();
 store.localStorage.setItem=()=>{throw Error('quota');};assert.ok(saveReport(report,store));assert.equal(loadReport(report.id,store).id,report.id);
 const unavailable={get sessionStorage(){throw Error('blocked');},get localStorage(){throw Error('blocked');}};
 assert.equal(saveReport(report,unavailable),false);assert.equal(loadReport(report.id,unavailable),null);
 store.sessionStorage.setItem('pokinator-current-report','broken JSON');assert.equal(loadReport(report.id,store),null);
 assert.equal(loadReport('missing',storage()),null);
});

test('exported tree escapes question text and includes real answer edges and unvisited leaves',()=>{
 const {game,recorder}=setup();force(game,'type:water');game.current.text='<script>alert("clue")</script>';recorder.answer(-1);
 const svg=exportTreeSvg(layoutTree(buildTree(finalize(recorder))));
 assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;script&gt;'));assert.ok(svg.includes('Yes · unexplored answer'));assert.ok(svg.includes('>No</text>'));
});

test('a recovery report preserves the zero-match event, reconsidered clue, and restored target',()=>{
 const {game,recorder}=setup();
 for(const [id,value] of [['generation:1',1],['type:dragon',1],['evolved',1],['can-evolve',-1]]){force(game,id);recorder.answer(value);}
 recorder.record('reject',{id:12},()=>game.reject(12));
 force(game,'color:orange');recorder.answer(-1);
 const plan=game.recoveryPlan();recorder.record('recover',plan,()=>game.recover());
 while(!game.shouldGuess())recorder.answer(game.current.members.has(149)?1:-1);
 recorder.record('guess',{id:149});
 const report=finalize(recorder,149),recovery=report.events.find(e=>e.kind==='recover');
 assert.equal(report.events.filter(e=>e.kind==='answer').find(e=>e.traitId==='color:orange').after.count,0);
 assert.equal(recovery.before.count,0);assert.ok(recovery.after.count>0);
 assert.equal(recovery.before.targetProbability,0);assert.ok(recovery.after.targetProbability>0);
 assert.deepEqual(recovery.answers.map(a=>a.traitId),['color:orange']);
 assert.equal(recovery.answers[0].value,-1);
 assert.equal(report.answers.find(h=>h.traitId==='color:orange').value,-1);
 assert.equal(report.final.mistakeBudget,1);
 assert.ok(report.final.ids.includes(149));assert.ok(!report.final.ids.includes(12));
 const nodes=layoutTree(buildTree(report)).nodes;
 assert.equal(nodes.filter(p=>p.node.kind==='recover').length,1);
 assert.ok(nodes.some(p=>p.node.title.includes('Closest fits with 1 conflicting clue')));
});
