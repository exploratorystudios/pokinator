import {Game} from './engine.js';
import {ROSTER_SIZE, ROSTER_ID, REGIONS, filterRoster, validRoster} from './config.js';

const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const answerNames = {'1':'Yes','.5':'Probably','0':'Not sure','-0.5':'Probably not','-1':'No','0.5':'Probably'};
let pokemon = [], game = null, guessed = null, finished = false, toastTimer;
let gameRegion = 'all';
const startButton = $('start');
startButton.disabled = true;
startButton.innerHTML = 'Warming up… <span>✦</span>';

async function load() {
  try {
    const response = await fetch('./pokemon.json');
    if (!response.ok) throw new Error(`Dataset request failed: ${response.status}`);
    const data = await response.json();
    if (!validRoster(data)) throw new Error('Incomplete dataset');
    pokemon = data;
    startButton.disabled = false;
    startButton.innerHTML = 'Let’s play <span>↗</span>';
  } catch (error) {
    startButton.disabled = false;
    startButton.innerHTML = 'Retry loading <span>↻</span>';
    toast('The Pokédex could not load. Tap “Retry loading” to try again.');
    console.error(error);
  }
}

function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.remove('hidden');
  toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 4500);
}

function view(name) {
  for (const id of ['welcome','game','result']) $(id).classList.toggle('hidden', id !== name);
  $('how-strip').classList.toggle('hidden', name !== 'welcome');
}

function start() {
  if (!pokemon.length) { load(); return; }
  gameRegion = $('region').value;
  game = new Game(filterRoster(pokemon, gameRegion));
  guessed = null;
  finished = false;
  view('game');
  renderQuestion();
  window.scrollTo({top:0,behavior:'instant'});
}

function renderQuestion() {
  const q = game.current;
  if (!q) { renderGuess(); return; }
  view('game');
  $('history-count').textContent = game.history.length;
  $('undo').disabled = !game.history.length;
  const remaining = game.remaining();
  $('remaining').textContent = remaining;
  $('meter-fill').style.width = `${Math.max(3,remaining/game.pokemon.length*100)}%`;
  const top = game.ranking()[0].probability;
  $('mood').innerHTML = top > .5 ? 'Oh, I have<br>a theory.' : remaining < 20 ? 'Getting a little<br>suspicious…' : 'Let’s get a feel<br>for this one.';
  $('banter').textContent = game.history.at(-1)?.value === 0 ? 'A mystery within a mystery. No problem—I’ll try a different angle.' : top > .5 ? 'I am trying very hard not to look smug. Just one more detail…' : 'Picture your Pokémon’s original regional appearance. I’ll do the suspicious squinting.';
  $('question-panel').innerHTML = `<div class="question-number"><span>QUESTION ${String(game.history.length+1).padStart(2,'0')}</span><span class="question-spark" aria-hidden="true">✦</span></div>
    <h2 id="question-heading" tabindex="-1">${escape(q.text)}</h2>
    <details><summary>A little clarification?</summary><p>${escape(q.detail)}</p></details>
    <div class="answers" aria-label="Choose your answer">
      <button class="answer positive" data-answer="1">Yes <kbd>1</kbd></button>
      <button class="answer negative" data-answer="-1">No <kbd>2</kbd></button>
      <button class="answer" data-answer="0.5">Probably <kbd>3</kbd></button>
      <button class="answer" data-answer="-0.5">Probably not <kbd>4</kbd></button>
      <button class="answer unsure" data-answer="0">Not sure <kbd>5</kbd></button>
    </div>`;
  $('question-heading').focus({preventScroll:true});
}

function answer(value) {
  if (!game || !$('result').classList.contains('hidden') || $('game').classList.contains('hidden')) return;
  game.answer(value);
  if (game.shouldGuess()) renderGuess(); else renderQuestion();
}

function renderGuess() {
  view('result');
  const informative = game.history.filter(h => h.value !== 0).length;
  if (informative < 3) {
    guessed = null;
    $('result').innerHTML = `<div class="eyebrow">THE MYSTERY REMAINS</div><h1>You’ve got me stumped.</h1><div class="success-stamp" aria-hidden="true">?</div><p class="result-subtitle">I need a few more clues than that to make a fair guess.<br>You can reveal your Pokémon, or give me another shot.</p><div class="result-actions"><button class="primary" id="reveal">Reveal my Pokémon <span>↗</span></button><button class="secondary" id="again">Try a new round</button></div>`;
  } else {
    const best = game.ranking()[0];
    guessed = best.pokemon;
    const percent = Math.round(best.probability*100);
    $('result').innerHTML = `<div class="eyebrow">${best.probability >= .8 ? 'I’VE GOT A HUNCH' : 'THIS ONE IS A STRETCH'}</div><h1>Is it ${escape(guessed.name)}?</h1><img class="result-sprite" src="assets/pokemon/${guessed.id}.png" alt="${escape(guessed.name)}"><div>${guessed.types.map(t => `<span class="type-pill">${escape(t)}</span>`).join('')}</div><p class="result-subtitle">${best.probability >= .8 ? 'I knew there was something familiar about you.' : 'My best lead so far. I may need a few more clues.'}<br>${game.history.length} questions · ${percent}% hunch strength</p><div class="result-actions"><button class="primary" id="correct">That’s my Pokémon! <span>✦</span></button><button class="secondary" id="incorrect">Not this one</button></div><p><button class="text-button" id="reveal">Reveal my Pokémon instead ↗</button></p><p class="fine-print">Hunch strength reflects your answers, not a guaranteed accuracy rate.</p>`;
  }
  $('result').setAttribute('tabindex','-1');
  $('result').focus({preventScroll:true});
}

function storeRound(target, outcome) {
  if (finished) return;
  finished = true;
  const round = {schema:1, roster:ROSTER_ID, region:gameRegion, engine:'bayes-v2', date:new Date().toISOString(), targetId:target.id, outcome, rejectedIds:[...game.rejected], answers:game.history.map(h => ({traitId:h.traitId,question:h.text,answer:h.value}))};
  try {
    const old = JSON.parse(localStorage.getItem('pokinator-rounds') || '[]');
    const rounds = Array.isArray(old) ? old : [];
    localStorage.setItem('pokinator-rounds', JSON.stringify([...rounds.slice(-199), round]));
  } catch { toast('Your browser could not save this round. You can still keep playing.'); }
}

function complete(target, outcome) {
  storeRound(target, outcome);
  guessed = target;
  $('modal').close();
  view('result');
  const won = outcome === 'correct';
  $('result').innerHTML = `<div class="eyebrow">${won ? 'A SUCCESSFUL MEETING OF MINDS' : 'ONE FOR MY FIELD NOTES'}</div><h1>${won ? 'Caught that thought.' : 'So it was '+escape(target.name)+'.'}</h1><img class="result-sprite" src="assets/pokemon/${target.id}.png" alt="${escape(target.name)}"><p class="result-subtitle">${won ? escape(target.name)+' couldn’t hide forever. '+game.history.length+' questions did the trick.' : 'Well, that theory fainted. Thanks for solving the mystery.'}</p><div class="result-actions"><button class="primary" id="again">Another Pokémon? <span>↗</span></button><button class="secondary" id="review">Review this round</button></div><p class="fine-print">This round is saved only in this browser. Manage or export it in “Behind the hunch.”</p>`;
}

function reject() {
  if (!guessed) return;
  game.reject(guessed.id);
  if (game.rejected.length >= 3) {
    openDex(true);
    toast('Three theories fainted. Reveal your Pokémon, or close this to keep investigating.');
  }
  renderQuestion();
}

function modal(title, html) {
  $('modal-title').textContent = title;
  $('modal-body').innerHTML = html;
  if (!$('modal').open) $('modal').showModal();
}

function openDex(select = false) {
  if (!pokemon.length) { toast('The Pokédex is still loading. Try again in a moment.'); return; }
  const catalog = select ? game.pokemon : pokemon;
  modal(select ? 'Who were you thinking of?' : 'Three regions of possibilities.', `<p>${select ? `Choose one of the ${catalog.length} Pokémon in this round to finish and give Pokinator a useful field note.` : `Think of any of these ${ROSTER_SIZE} Pokémon from Gens 1–3. Keep your choice a secret when you start.`}</p><div class="dex-controls"><label class="hidden" for="dex-search">Search Pokémon by name or number</label><input class="dex-search" id="dex-search" type="search" placeholder="Find a Pokémon by name or number…" autocomplete="off">${select ? '' : `<label class="hidden" for="dex-region">Filter by debut region</label><select class="region-select" id="dex-region">${REGIONS.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}</select>`}</div><p id="dex-count" class="fine-print" role="status"></p><div class="dex-grid" id="dex-grid"></div><p class="fine-print">Original regional appearances; current types and evolution ancestry. Standard Unown, Castform, and Deoxys forms. No shiny, Mega, or later regional variants.</p>`);
  const draw = () => {
    const query = $('dex-search').value.trim().toLowerCase().replace(/^#/, '');
    const matches = filterRoster(catalog, $('dex-region')?.value || 'all').filter(p => p.name.toLowerCase().includes(query) || String(p.id).padStart(3,'0').includes(query));
    $('dex-count').textContent = `${matches.length} Pokémon`;
    $('dex-grid').innerHTML = matches.length ? matches.map(p => `<${select ? 'button' : 'div'} class="dex-item ${select ? 'selectable' : ''}" ${select ? `data-pick="${p.id}"` : ''}><small>#${String(p.id).padStart(3,'0')}</small><img src="assets/pokemon/${p.id}.png" loading="lazy" alt=""><b>${escape(p.name)}</b></${select ? 'button' : 'div'}>`).join('') : '<p>No Pokémon found. Try another name.</p>';
  };
  $('dex-search').addEventListener('input', draw);
  $('dex-region')?.addEventListener('change', draw);
  draw();
}

function showHistory() {
  if (!game?.history.length) { toast('Your answers will appear here once you make your first choice.'); return; }
  modal('Following your train of thought.', `<p>${game.history.length} clues, one very mysterious Pokémon.</p><ol class="history-list">${game.history.map((h,i) => `<li>${i+1}. ${escape(h.text)}<strong>${answerNames[h.value]}</strong></li>`).join('')}</ol>`);
}

function showAbout(data = false) {
  modal(data ? 'Behind the hunch.' : 'You think. I overthink.', data ? `<p>Pokinator starts with an equal chance for each Pokémon in your selected roster. Every answer updates those chances. It chooses useful clues, then gives them playful wording from a procedural template library.</p><p>This version uses a probability engine, not a trained neural network. Questions stay tied to explicit facts instead of invented lore.</p><h3>Your field notes stay here.</h3><p>Up to 200 completed rounds are saved in this browser only. Export them as labeled JSON for future training experiments. They are never sent to a server. Earlier Kanto rounds keep their original roster labels.</p><div class="modal-actions"><button class="secondary" id="export-data">Export my rounds ↓</button><button class="secondary" id="clear-data">Clear my rounds</button></div><p class="fine-print">Species metadata and pixel sprites: <a href="https://pokeapi.co/docs/v2" target="_blank" rel="noreferrer">PokéAPI</a> and <a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noreferrer">PokéAPI sprites</a>. Curated visual clues are part of this fan project. Pokémon and character designs belong to their respective owners.</p>` : `<p>Choose any of the first 386 Pokémon, introduced in Gens 1–3, then keep it in your head. Play all three regions, or choose a species that debuted in Kanto, Johto, or Hoenn using the selector before you start.</p><h3>Five answers. No homework.</h3><p>“Yes” and “No” are strong clues. “Probably” and “Probably not” leave room for doubt. “Not sure” skips the clue entirely. You can undo an answer whenever you need to.</p><h3>The fine print, professor.</h3><p>Picture its original regional appearance. We use current types, so Fairy and Steel types count. Evolution ancestry includes later pre-evolutions. Alternate forms are not separate guesses: use standard Unown, normal Castform, and Normal Forme Deoxys. Each question has a little clarification if you need it.</p><p>If a guess misses, reject it to keep going—or reveal your Pokémon. Hunch strength is a score based on your answers, not a promise.</p><div class="modal-actions"><button class="primary" id="modal-play">I’ve got one in mind <span>↗</span></button></div>`);
}

startButton.addEventListener('click', start);
$('region').addEventListener('change', () => {
  const region = REGIONS.find(r => r.id === $('region').value);
  $('roster-note').textContent = `${region.count} possibilities. One very good hunch.`;
  $('region-hint').textContent = region.generation ? `Species introduced in Gen ${region.generation}.` : 'Kanto, Johto, and Hoenn. All first 386 Pokémon.';
});
$('exit-game').addEventListener('click', () => view('welcome'));
$('dex-open').addEventListener('click', () => openDex());
$('about-open').addEventListener('click', () => showAbout());
$('data-open').addEventListener('click', () => showAbout(true));
$('history-open').addEventListener('click', showHistory);
$('undo').addEventListener('click', () => {game.back();renderQuestion();});
$('modal-close').addEventListener('click', () => $('modal').close());
$('modal').addEventListener('click', event => { if(event.target === $('modal')) { const rect = $('modal').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('modal').close(); } });

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.answer !== undefined) answer(Number(button.dataset.answer));
  if (button.dataset.pick) complete(pokemon.find(p => p.id === Number(button.dataset.pick)), 'revealed');
  if (button.id === 'again') start();
  if (button.id === 'correct' && guessed) complete(guessed, 'correct');
  if (button.id === 'incorrect') reject();
  if (button.id === 'reveal') openDex(true);
  if (button.id === 'review') showHistory();
  if (button.id === 'modal-play') { $('modal').close(); start(); }
  if (button.id === 'clear-data') {
    try { localStorage.removeItem('pokinator-rounds'); toast('Your locally saved rounds have been cleared.'); } catch { toast('Your browser could not clear its saved rounds.'); }
  }
  if (button.id === 'export-data') {
    try {
      const rounds = JSON.parse(localStorage.getItem('pokinator-rounds') || '[]');
      const blob = new Blob([JSON.stringify({format:'pokinator-rounds-v1',rounds},null,2)],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');link.href=url;link.download='pokinator-field-notes.json';link.click();
      setTimeout(() => URL.revokeObjectURL(url),1000);
    } catch { toast('Your browser could not export its saved rounds.'); }
  }
});
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || $('modal').open || $('game').classList.contains('hidden') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  const keys = {'1':1,'2':-1,'3':.5,'4':-.5,'5':0};
  if (Object.hasOwn(keys,event.key) && !event.repeat) { event.preventDefault(); answer(keys[event.key]); }
});
load();
