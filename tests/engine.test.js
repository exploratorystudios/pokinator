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
  game.answer(0);
  game.back();
  assert.equal(game.ranking().find(r => r.pokemon.id===rejected).probability,0);
  assert.ok(game.ranking().every(r => Number.isFinite(r.probability)));
});

test('question variation and soft answers retain a valid normalized distribution', () => {
  for (const random of [()=>.01,()=>.99]) {
    const game = new Game(pokemon,{random});
    for (let i=0;i<15;i++) game.answer(i%2 ? .5 : -.5);
    const ranking = game.ranking();
    assert.ok(Math.abs(ranking.reduce((s,p)=>s+p.probability,0)-1)<1e-10);
    assert.ok(ranking.every(p=>p.probability>=0));
  }
});
