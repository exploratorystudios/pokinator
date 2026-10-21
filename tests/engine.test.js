import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game, buildTraits} from '../dist/engine.js';
import {ROSTER_SIZE, REGIONS, filterRoster, validRoster} from '../dist/config.js';

const pokemon = JSON.parse(fs.readFileSync(new URL('../dist/pokemon.json', import.meta.url)));

function play(target, random = () => .5, roster = pokemon) {
  const game = new Game(roster, {random});
  while (!game.shouldGuess()) game.answer(game.current.members.has(target.id) ? 1 : -1);
  return game;
}

test('the roster has all 386 unique Pokémon, local sprites, and distinct feature profiles', () => {
  assert.ok(validRoster(pokemon));
  assert.equal(pokemon.length, ROSTER_SIZE);
  assert.equal(new Set(pokemon.map(p => p.id)).size,ROSTER_SIZE);
  const traits = buildTraits(pokemon);
  const profiles = pokemon.map(p => traits.map(t => Number(t.members.has(p.id))).join(''));
  assert.equal(new Set(profiles).size,ROSTER_SIZE,'Every Pokémon must be distinguishable');
  for (const p of pokemon) assert.ok(fs.statSync(new URL(`../dist/assets/pokemon/${p.id}.png`,import.meta.url)).size > 100);
});

test('perfect fact answers identify every Pokémon within the question budget', () => {
  const lengths = [];
  for (const p of pokemon) {
    const game = play(p);
    assert.equal(game.ranking()[0].pokemon.id,p.id,`Failed to identify ${p.name}`);
    assert.ok(game.history.length <= 20);
    assert.equal(new Set(game.history.map(h => h.traitId)).size,game.history.length,'Repeated a clue');
    lengths.push(game.history.length);
  }
  console.log(`${ROSTER_SIZE}/${ROSTER_SIZE} identified; ${(lengths.reduce((a,b)=>a+b)/ROSTER_SIZE).toFixed(1)} average questions; ${Math.max(...lengths)} maximum.`);
});

test('region filters partition the roster and every regional Pokémon remains identifiable', () => {
  const allIds = [];
  for (const region of REGIONS.filter(r => r.generation)) {
    const roster = filterRoster(pokemon,region.id);
    assert.equal(roster.length,region.count);
    assert.ok(roster.every(p => p.generation === region.generation));
    allIds.push(...roster.map(p => p.id));
    for (const target of roster) {
      const game = play(target,()=>.5,roster);
      assert.equal(game.ranking()[0].pokemon.id,target.id,`${region.id}: ${target.name}`);
    }
  }
  assert.equal(new Set(allIds).size,ROSTER_SIZE);
  assert.deepEqual(filterRoster(pokemon,'unknown'),pokemon);
});

test('cross-generation evolutions and overlapping visual clues stay truthful', () => {
  const traits = buildTraits(pokemon);
  const members = id => traits.find(t=>t.id===id).members;
  for (const id of [25,172,311,312]) assert.ok(members('cheeks').has(id));
  for (const id of [25,26]) assert.ok(members('lightning-tail').has(id));
  for (const id of [125,239]) assert.ok(members('plugs').has(id));
  for (const id of [41,42,169]) assert.ok(members('bat').has(id));
  for (const id of [113,242]) assert.ok(members('egg-pouch').has(id));
  for (const id of [138,139,140,141,142,345,346,347,348]) assert.ok(members('fossil').has(id));
  for (const id of [197,198,228,248,359]) assert.ok(members('type:dark').has(id));
  for (const id of [116,117,230]) assert.ok(members('seahorse').has(id));
  const johtoTraits = buildTraits(filterRoster(pokemon,'johto'));
  const canEvolve = johtoTraits.find(t=>t.id==='can-evolve');
  assert.ok(canEvolve.members.has(172),'Pichu can evolve, even when Pikachu is outside the selected region');
  assert.ok(canEvolve.members.has(183),'Marill can evolve');
  assert.ok(!canEvolve.members.has(197),'Umbreon cannot evolve');
  assert.ok(!canEvolve.members.has(215),'Later-generation Weavile is outside the Gen 1–3 evolution question');
  assert.deepEqual([...members('family:pichu')].sort((a,b)=>a-b),[25,26,172]);
  assert.deepEqual([...members('family:tyrogue')].sort((a,b)=>a-b),[106,107,236,237]);
});

test('question variation preserves identification across all three generations', () => {
  // Cover every new evolution family and several original families with varied
  // question paths rather than just the deterministic policy used above.
  for (const id of [1,25,94,151,152,160,169,172,186,197,201,202,230,242,248,251,252,258,267,268,272,282,292,303,311,312,330,350,351,360,376,382,385,386]) {
    for (const random of [()=>.01,()=>.99]) {
      const target=pokemon.find(p=>p.id===id);
      assert.equal(play(target,random).ranking()[0].pokemon.id,id,target.name);
    }
  }
});

test('roster validation rejects truncated, duplicated, out-of-range, or mislabeled data', () => {
  assert.equal(validRoster(pokemon.slice(0,151)),false);
  assert.equal(validRoster([...pokemon.slice(0,-1),pokemon[0]]),false);
  assert.equal(validRoster(pokemon.map(p=>p.id===386?{...p,id:387}:p)),false);
  assert.equal(validRoster(pokemon.map(p=>p.id===252?{...p,generation:2}:p)),false);
});

test('unknown answers are neutral and undo restores both probabilities and exact wording', () => {
  const game = new Game(pokemon,{random:()=>.5});
  const question = game.current;
  const before = game.ranking();
  game.answer(0);
  assert.deepEqual(game.ranking(),before);
  assert.notEqual(game.current.id,question.id);
  game.back();
  assert.equal(game.current.id,question.id);
  assert.equal(game.current.text,question.text);
  game.answer(1);
  assert.notDeepEqual(game.ranking(),before);
  game.back();
  assert.deepEqual(game.ranking(),before);
});

test('a rejected guess stays rejected after undo while remaining guesses stay valid', () => {
  const game = play(pokemon.find(p => p.id===25));
  const rejected = game.ranking()[0].pokemon.id;
  game.reject(rejected);
  assert.equal(game.ranking().find(r => r.pokemon.id===rejected).probability,0);
  assert.ok(game.hasConflict(),'Rejecting the only matching candidate should request a clue review');
  game.back();
  assert.equal(game.ranking().find(r => r.pokemon.id===rejected).probability,0);
  assert.ok(game.ranking().every(r => Number.isFinite(r.probability)));
});

function give(game,id,value) {
  const trait=game.traits.find(t=>t.id===id);
  assert.ok(trait,`Missing clue ${id}`);
  game.current={...trait,text:trait.lines[0]};
  game.answer(value);
}

test('a confirmed region excludes other regions and stays known after a rejected guess', () => {
  const game=new Game(pokemon,{random:()=>.5});
  give(game,'generation:1',1);
  assert.equal(game.knownGeneration(),1);
  assert.equal(game.remaining(),151);
  assert.ok(game.ranking().filter(r=>r.probability>0).every(r=>r.pokemon.generation===1));
  assert.ok(game.availableTraits().every(t=>t.group!=='generation'));
  const history=structuredClone(game.history);
  game.reject(25);
  assert.deepEqual(game.history,history,'A rejected guess must keep all earlier answers');
  assert.equal(game.knownGeneration(),1);
  assert.equal(game.remaining(),150);
  assert.ok(game.availableTraits().every(t=>t.group!=='generation'));
  assert.equal(game.ranking().find(r=>r.pokemon.id===25).probability,0);
});

test('two negative region answers infer the third region without asking it', () => {
  const game=new Game(pokemon,{random:()=>.5});
  give(game,'generation:1',-1);
  give(game,'generation:2',-1);
  assert.equal(game.knownGeneration(),3);
  assert.equal(game.remaining(),135);
  assert.ok(game.availableTraits().every(t=>t.group!=='generation'));
  assert.ok(game.candidates.every(id=>id>=252));
});

test('a visual clue carries its region, type, and legendary implications into question selection', () => {
  const game=new Game(pokemon,{random:()=>.5});
  give(game,'legend-bird',1);
  assert.deepEqual(game.candidates,[144,145,146]);
  assert.equal(game.knownGeneration(),1);
  const options=game.availableTraits();
  for(const settled of ['rare','bird','wings','type:flying','generation:1','generation:2','generation:3']) {
    assert.ok(!options.some(t=>t.id===settled),`Repeated a settled implication: ${settled}`);
  }
  give(game,'type:ice',1);
  assert.equal(game.ranking()[0].pokemon.name,'Articuno');
  assert.equal(game.remaining(),1);
  assert.equal(game.current,null);
  assert.ok(game.shouldGuess());
});

test('evolution-family knowledge respects relatives introduced in different generations', () => {
  const game=new Game(pokemon,{random:()=>.5});
  give(game,'family:pichu',1);
  assert.deepEqual(game.candidates,[25,26,172]);
  assert.equal(game.knownGeneration(),null,'Knowing a family must not incorrectly lock the debut region');
  const options=game.availableTraits();
  assert.ok(!options.some(t=>t.id==='generation:3'));
  assert.ok(!options.some(t=>t.id==='type:electric'));
  assert.ok(options.some(t=>t.group==='generation'));
});

test('equivalent clues and inverse questions are skipped even after a soft or unknown answer', () => {
  for(const value of [0,.5]) {
    const game=new Game(pokemon,{random:()=>.5});
    give(game,'bagon',value);
    assert.equal(game.remaining(),386,'Soft and unknown clues should leave alternatives possible');
    assert.ok(!game.availableTraits().some(t=>t.id==='family:bagon'),'Rephrased family clue repeated');
    game.reject(371);
    assert.ok(!game.availableTraits().some(t=>t.id==='family:bagon'),'Rejected guess reopened a duplicate clue');
  }
  const pair=new Game(pokemon.filter(p=>[25,94].includes(p.id)),{random:()=>.5});
  give(pair,'color:yellow',.5);
  assert.ok(!pair.availableTraits().some(t=>t.id==='color:purple'),'Inverse of an answered question repeated');
});

test('revising a region updates every deduction without losing other answers or rejections', () => {
  const game=new Game(pokemon,{random:()=>.5});
  give(game,'generation:1',-1);
  give(game,'generation:2',-1);
  game.reject(258);
  game.revise(0,1);
  assert.equal(game.knownGeneration(),1);
  assert.equal(game.history[1].value,-1);
  assert.deepEqual(game.rejected,[258]);
  assert.equal(game.remaining(),151);
  game.revise(0,0);
  assert.equal(game.knownGeneration(),null);
  assert.equal(game.remaining(),285);
});

test('the core exposes strict conflicts before the interface records recovery, and edits can resolve them', () => {
  const game=new Game(pokemon,{random:()=>.5});
  give(game,'type:fire',1);
  give(game,'type:water',-1);
  game.revise(1,1);
  assert.ok(game.hasConflict());
  assert.equal(game.remaining(),0);
  assert.equal(game.current,null);
  assert.equal(game.shouldGuess(),false);
  assert.ok(game.ranking().every(r=>r.probability===0));
  game.revise(1,.5);
  assert.equal(game.hasConflict(),false);
  assert.ok(game.ranking().filter(r=>r.probability>0).every(r=>r.pokemon.types.includes('fire')));
  assert.equal(game.history.length,2);
  assert.ok(Math.abs(game.ranking().reduce((s,r)=>s+r.probability,0)-1)<1e-10);
});

test('Dragonite recovers after a reasonable orange-versus-brown answer and a rejected wrong guess', () => {
  const game=new Game(pokemon,{random:()=>.5});
  while (!game.shouldGuess()) game.answer(game.current.id==='color:brown' ? -1 : game.current.members.has(149) ? 1 : -1);
  assert.equal(game.ranking()[0].pokemon.name,'Butterfree','Reproduce the original confusing color failure');
  const history=structuredClone(game.history);
  game.reject(12);
  assert.ok(game.hasConflict());
  const plan=game.recoveryPlan();
  assert.deepEqual(plan.answers.map(a=>a.traitId),['color:brown']);
  game.recover();
  assert.equal(game.remaining(),19);
  assert.ok(game.candidateIds.has(149));
  assert.ok(!game.candidateIds.has(12));
  assert.deepEqual(game.history,history,'Recovery does not change any original answer');
  assert.equal(game.mistakeBudget,1);
  assert.ok(game.candidates.every(id=>game.conflictsFor(id).length===1),'Only nearest alternatives are considered');
  let further=0;
  while(!game.shouldGuess() && further++<10)game.answer(game.current.members.has(149)?1:-1);
  assert.equal(game.ranking()[0].pokemon.id,149);
  assert.equal(further,4);
  assert.equal(new Set(game.history.map(h=>h.traitId)).size,game.history.length);
});

test('recovery only operates at zero matches and never restores rejected guesses', () => {
  const game=new Game(pokemon.filter(p=>[25,26,172].includes(p.id)),{random:()=>.5});
  const before=game.ranking();
  assert.equal(game.recoveryPlan(),null);
  assert.equal(game.recover(),null);
  assert.deepEqual(game.ranking(),before);
  for(const id of [25,26,172])game.reject(id);
  assert.ok(game.hasConflict());
  assert.equal(game.recoveryPlan(),null,'There are no unrejected leads left');
  assert.equal(game.recover(),null);
  assert.equal(game.remaining(),0);
});

test('editing a conflicting clue restores exact-match mode without erasing other answers', () => {
  const game=new Game(pokemon,{random:()=>.5});
  give(game,'generation:1',1);give(game,'type:dragon',1);give(game,'evolved',1);give(game,'can-evolve',-1);give(game,'color:brown',-1);
  assert.ok(game.hasConflict());
  game.recover();
  const index=game.history.findIndex(h=>h.traitId==='color:brown');
  assert.equal(game.history[index].value,-1);
  assert.equal(game.mistakeBudget,1);
  const answers=structuredClone(game.history);
  game.revise(index,1);
  assert.equal(game.mistakeBudget,0);
  assert.deepEqual(game.history.filter((h,i)=>i!==index),answers.filter((h,i)=>i!==index));
  assert.deepEqual(game.candidates,[149]);
});

test('an early wrong definite answer does not lock recovery into a long sequence of bad guesses', () => {
  for(const target of [25,197,258,384]){
    const game=new Game(pokemon,{random:()=>.5});let questions=0,recoveries=0,guesses=0,found=false;
    for(let step=0;step<100;step++){
      if(game.hasConflict()){
        const old=structuredClone(game.history);assert.ok(game.recover());recoveries++;
        assert.deepEqual(game.history,old);assert.ok(game.candidates.every(id=>!game.rejected.includes(id)));continue;
      }
      if(game.shouldGuess()){
        const id=game.ranking()[0].pokemon.id;guesses++;
        if(id===target){found=true;break;}game.reject(id);continue;
      }
      const truth=game.current.members.has(target)?1:-1;
      game.answer(questions++===1?-truth:truth);
    }
    assert.ok(found,`Could not recover ${target}`);
    assert.ok(questions<=30,`Too many questions for ${target}: ${questions}`);
    assert.ok(guesses<=2,`Too many guesses for ${target}: ${guesses}`);
    assert.equal(recoveries,1);
  }
});

test('an accidentally rejected final candidate can be restored explicitly', () => {
  const game=play(pokemon.find(p=>p.id===151));
  game.reject(151);
  assert.ok(game.hasConflict());
  assert.equal(game.restoreRejected(),151);
  assert.equal(game.hasConflict(),false);
  assert.equal(game.ranking()[0].pokemon.id,151);
  assert.ok(game.shouldGuess());
});

test('restoring an accidentally rejected correct guess exits closest-fit mode again', () => {
  const game=play(pokemon.find(p=>p.id===25));
  game.reject(25);assert.ok(game.recover());
  assert.equal(game.mistakeBudget,1);assert.ok(!game.candidateIds.has(25));
  game.restoreRejected();
  assert.equal(game.mistakeBudget,0);assert.equal(game.ranking()[0].pokemon.id,25);
  assert.deepEqual(game.candidates,[25]);
});

test('retry rounds can recover from mistaken soft clues without repeating binary facts', () => {
  for(const id of [25,197,258,384,386]) {
    const game=new Game(pokemon,{random:()=>.5});
    let attempts=0, steps=0;
    while(steps++<50) {
      assert.equal(game.hasConflict(),false,'Soft mistakes must not eliminate the true target');
      if(game.shouldGuess()) {
        const guess=game.ranking()[0].pokemon.id;
        if(guess===id)break;
        const oldHistory=structuredClone(game.history);
        game.reject(guess); attempts++;
        assert.deepEqual(game.history,oldHistory);
        continue;
      }
      const expected=game.current.members.has(id)?1:-1;
      game.answer(game.history.length<3 ? -expected*.5 : expected);
    }
    assert.ok(steps<50,`Failed to recover ${id} after ${attempts} misses`);
    assert.equal(game.ranking()[0].pokemon.id,id);
    const facts=game.history.map(h=>game.traits.find(t=>t.id===h.traitId).key);
    assert.equal(new Set(facts).size,facts.length,'A retry repeated the same binary fact');
  }
});

test('question variation and soft answers retain a valid normalized distribution', () => {
  for (const random of [()=>.01,()=>.99]) {
    const game = new Game(pokemon,{random});
    for (let i=0;i<15&&!game.shouldGuess();i++) game.answer(i%2 ? .5 : -.5);
    const ranking = game.ranking();
    assert.ok(Math.abs(ranking.reduce((s,p)=>s+p.probability,0)-1)<1e-10);
    assert.ok(ranking.every(p=>p.probability>=0));
  }
});

function reachDelibirdFinale() {
  const game=new Game(pokemon,{random:()=>.5});
  for(let i=0;i<25&&!game.shouldGuess();i++) {
    if(game.current.id==='gift-bird')return game;
    const trait=game.current;
    game.answer((trait.members.has(225)?1:-1)*(trait.signature?.5:1));
  }
  assert.fail('The Delibird round should end with its present-sack clue');
}

test('Delibird’s identifying clue is saved for the finale after broader clues', () => {
  const game=reachDelibirdFinale();
  assert.ok(game.current.finisher);
  assert.equal(game.current.targetId,225);
  assert.ok(game.history.length>=3,'A signature clue should not open a full-roster round');
  assert.ok(game.history.some(h=>h.group==='type'));
  assert.ok(!game.history.some(h=>h.traitId==='gift-bird'));
});

test('Yes or Probably on the final identifying clue immediately reveals the leading Pokémon', () => {
  for(const value of [1,.5]) {
    const game=reachDelibirdFinale();
    game.answer(value);
    assert.ok(game.shouldGuess());
    assert.equal(game.current,null,'A final confirmation must not be followed by another type question');
    assert.equal(game.ranking()[0].pokemon.id,225);
    assert.equal(game.history.at(-1).traitId,'gift-bird');
    assert.ok(game.history.at(-1).finisher);
  }
});

test('a negative or unknown finale answer keeps alternatives and does not force the hinted guess', () => {
  for(const value of [-1,0]) {
    const game=reachDelibirdFinale();
    const before=[...game.candidates];
    const oldHistory=structuredClone(game.history);
    game.answer(value);
    assert.deepEqual(game.history.slice(0,-1),oldHistory);
    assert.equal(game.hasConflict(),false);
    if(value===-1) {
      assert.ok(!game.candidates.includes(225));
      assert.equal(game.ranking().find(r=>r.pokemon.id===225).probability,0);
    } else {
      assert.deepEqual(game.candidates,before,'Unknown must not eliminate alternatives');
      assert.equal(game.readyForReveal(),false);
      assert.equal(game.shouldGuess(),false);
    }
    assert.notEqual(game.current?.id,'gift-bird','The next question must not repeat the finale');
  }
});

test('undo preserves the final-question role and a rejected soft guess keeps all earlier clues', () => {
  const game=reachDelibirdFinale();
  const text=game.current.text;
  game.answer(.5);
  game.back();
  assert.ok(game.current.finisher);
  assert.equal(game.current.targetId,225);
  assert.equal(game.current.text,text);
  assert.equal(game.shouldGuess(),false,'Undo must return to the confirmation question');
  game.answer(.5);
  const history=structuredClone(game.history);
  game.reject(225);
  assert.deepEqual(game.history,history);
  assert.equal(game.readyForReveal(),false,'A rejected hint target cannot trigger its old finale again');
  assert.notEqual(game.current?.id,'gift-bird');
  assert.equal(game.ranking().find(r=>r.pokemon.id===225).probability,0);
});

test('finishing a deduction can add one final visual clue without adding known factual questions', () => {
  const game=new Game(pokemon,{random:()=>.5});
  give(game,'category:Delivery Pokémon',1);
  // This category is an alias of the visual clue, so it must not be repeated.
  assert.ok(game.shouldGuess());
  assert.equal(game.current,null);
  assert.equal(game.ranking()[0].pokemon.id,225);
  const other=new Game(pokemon,{random:()=>.5});
  give(other,'generation:2',1);
  give(other,'type:ice',1);
  give(other,'type:flying',1);
  assert.equal(other.remaining(),1);
  assert.equal(other.current.id,'gift-bird');
  assert.ok(other.current.finisher);
  assert.equal(other.shouldGuess(),false);
  other.answer(1);
  assert.ok(other.shouldGuess());
  assert.equal(other.current,null);
});
