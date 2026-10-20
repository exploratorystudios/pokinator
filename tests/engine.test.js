import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game, buildTraits} from '../dist/engine.js';

const pokemon = JSON.parse(fs.readFileSync(new URL('../dist/pokemon.json', import.meta.url)));

function play(target, random = () => .5) {
  const game = new Game(pokemon, {random});
  while (!game.shouldGuess()) game.answer(game.current.members.has(target.id) ? 1 : -1);
  return game;
}

test('the roster has all 151 unique Pokémon, local sprites, and distinct feature profiles', () => {
  assert.equal(pokemon.length, 151);
  assert.equal(new Set(pokemon.map(p => p.id)).size,151);
  const traits = buildTraits(pokemon);
  const profiles = pokemon.map(p => traits.map(t => Number(t.members.has(p.id))).join(''));
  assert.equal(new Set(profiles).size,151,'Every Pokémon must be distinguishable');
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
  console.log(`151/151 identified; ${(lengths.reduce((a,b)=>a+b)/151).toFixed(1)} average questions; ${Math.max(...lengths)} maximum.`);
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
