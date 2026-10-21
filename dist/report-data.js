export const REPORT_SCHEMA = 1;
export const ANSWER_NAMES = {'1':'Yes','-1':'No','0.5':'Probably','-0.5':'Probably not','0':'Not sure'};
const CACHE_KEY = 'pokinator-run-reports';
const SESSION_KEY = 'pokinator-current-report';
let sequence = 0;

function snapshot(game) {
  const ranked = game.ranking().filter(r => r.probability > 0);
  return {
    count:game.remaining(), ids:[...game.candidates], generation:game.knownGeneration(),mistakeBudget:game.mistakeBudget,
    top:ranked.slice(0,5).map(r => ({id:r.pokemon.id, probability:r.probability})),
    scores:ranked.map(r => ({id:r.pokemon.id, probability:r.probability})),
  };
}

// Record live mutations, rather than replaying the randomized question policy.
// Keep the full ranking in memory until the player tells us their target.
export class RunRecorder {
  constructor(game, {region,engine}) {
    this.game = game;
    this.region = region;
    this.engine = engine;
    this.id = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${++sequence}`;
    this.started = new Date().toISOString();
    this.initial = snapshot(game);
    this.events = [];
  }
  record(kind, details = {}, action = () => {}) {
    const before = snapshot(this.game);
    action();
    this.events.push({kind,...details,before,after:snapshot(this.game)});
  }
  answer(value) {
    const q = this.game.current;
    const yes = this.game.candidates.filter(id => q.members.has(id));
    this.record('answer', {
      question:this.game.history.length+1,traitId:q.id,group:q.group,text:q.text,
      value,finisher:Boolean(q.finisher),branches:{yes,no:this.game.candidates.filter(id => !q.members.has(id))},
    }, () => this.game.answer(value));
  }
  finish(target, outcome) {
    const compact = state => {
      const {scores,...rest} = state;
      const index = scores.findIndex(r => r.id === target.id);
      return {...rest,targetProbability:index < 0 ? 0 : scores[index].probability,targetRank:index < 0 ? null : index+1};
    };
    return {
      schema:REPORT_SCHEMA,kind:'pokinator-run-report',id:this.id,engine:this.engine,region:this.region,
      started:this.started,completed:new Date().toISOString(),targetId:target.id,outcome,
      roster:this.game.pokemon.map(p => ({id:p.id,name:p.name})),initial:compact(this.initial),
      events:this.events.map(e => ({...e,before:compact(e.before),after:compact(e.after)})),
      final:compact(snapshot(this.game)),answers:this.game.history.map(h => ({...h})),rejectedIds:[...this.game.rejected],
    };
  }
}

function valid(report, id) {
  return report?.kind === 'pokinator-run-report' && report.schema === REPORT_SCHEMA && report.id === id &&
    Array.isArray(report.events) && Array.isArray(report.roster) && report.initial && report.final;
}

// Keep the training-round store separate. Reports are richer and retain the
// latest three games; the current report also survives in this tab's session.
export function saveReport(report, storage = globalThis) {
  let saved = false;
  try { storage.sessionStorage.setItem(SESSION_KEY,JSON.stringify(report)); saved = true; } catch { /* Try local storage below. */ }
  try {
    let previous;
    try { previous = JSON.parse(storage.localStorage.getItem(CACHE_KEY) || '[]'); } catch { previous = []; }
    const reports = [...(Array.isArray(previous) ? previous : []).filter(r => r?.id !== report.id).slice(-2),report];
    while (reports.length) {
      try { storage.localStorage.setItem(CACHE_KEY,JSON.stringify(reports)); saved = true; break; }
      catch { reports.shift(); }
    }
  } catch { /* Session storage may still be available. */ }
  return saved;
}

export function loadReport(id, storage = globalThis) {
  try {
    const current = JSON.parse(storage.sessionStorage.getItem(SESSION_KEY) || 'null');
    if (valid(current,id)) return current;
  } catch { /* Check the retained reports. */ }
  try {
    const reports = JSON.parse(storage.localStorage.getItem(CACHE_KEY) || '[]');
    return Array.isArray(reports) ? reports.find(r => valid(r,id)) || null : null;
  } catch { return null; }
}

export function clearReports(storage = globalThis) {
  for (const [area,key] of [['sessionStorage',SESSION_KEY],['localStorage',CACHE_KEY]]) {
    try { storage[area].removeItem(key); } catch { /* Storage can be disabled. */ }
  }
}
