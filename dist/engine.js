// Fact selection and question phrasing are separate so a learned policy can replace
// the information-gain policy later without changing the UI or truth labels.
import {extendedMembers, newSignatures} from './clues.js';

const typeLines = {
  grass: ['Does it bring its own greenery wherever it goes?', 'Is it part Grass type, basically a houseplant with opinions?'],
  fire: ['Is it Fire type, with all the insurance problems that implies?', 'Would its Fire typing make a sprinkler system nervous?'],
  water: ['Is it a Water type who would feel at home at a pool party?', 'Does Water type belong on its résumé?'],
  electric: ['Is it Electric type, a walking warning for your electronics?', 'Does this one come with Electric typing and a shock hazard?'],
  psychic: ['Is it Psychic type, making this mind-reading contest a little unfair?', 'Does it have Psychic typing? I feel like it knows my next question.'],
  poison: ['Is it Poison type, and someone you should probably not lick?', 'Does its Poison typing make hugs a questionable idea?'],
  flying: ['Does it have Flying typing? Yes, the actual type, not just wings.', 'Is Flying one of its types? My ceiling would like to know.'],
  bug: ['Is it Bug type, and perhaps unwelcome at a picnic?', 'Does this mystery have Bug typing? There goes my picnic.'],
  normal: ['Is it officially Normal type, however weird it actually looks?', 'Does Normal appear in its typing? A generous use of “normal.”'],
  ground: ['Is it Ground type, with a professional interest in dirt?', 'Does it have Ground typing? The garden is looking nervous.'],
  rock: ['Is it Rock type, the sort of friend who takes granite for granted?', 'Does Rock appear in its typing? That sounds like a heavy friendship.'],
  fighting: ['Is it Fighting type, and taking gym membership far too seriously?', 'Does it have Fighting typing? I promise this is a friendly interview.'],
  ghost: ['Is it Ghost type? I would like to keep this haunting consensual.', 'Does it have Ghost typing, and terrible respect for solid walls?'],
  ice: ['Is it Ice type, and bringing its own air conditioning?', 'Does this one have Ice typing? I should have brought a scarf.'],
  dragon: ['Is it actually Dragon type? Looking like a dragon does not count.', 'Does Dragon appear in its typing? I checked the fine print.'],
  fairy: ['Is it Fairy type, with suspiciously magical energy?', 'Does it have Fairy typing? Cute can still be dangerous.'],
  steel: ['Is it Steel type, a potential problem for airport security?', 'Does Steel appear in its typing? That explains the clanking.'],
  dark: ['Is it Dark type, and perhaps enjoying this mysterious business a little too much?', 'Does it have Dark typing? Very on-brand for a secret identity.'],
};

// Explicit membership keeps playful metaphors grounded in observable features.
const signatures = [
  ['tail-flame', [4,5,6], 'Does its tail double as a very personal campfire?', 'Would putting out the flame on its tail be a terrible idea?'],
  ['back-plant', [1,2,3], 'Is it carrying a whole gardening project on its back?', 'Does a plant grow out of its back? Talk about bringing the outdoors in.'],
  ['turtle', [7,8,9], 'Does it have a turtle shell and a very aquatic lifestyle?', 'Is this a turtle-shaped friend with built-in swimwear?'],
  ['cannons', [9], 'Are those actual water cannons sticking out of its shell?', 'Did its turtle shell come with built-in water cannons?'],
  ['flower', [3,44,45,69,70,71], 'Does a big flower or pitcher-plant mouth do most of its accessorizing?', 'Is a flower or pitcher-shaped plant a major part of its look?'],
  ['wings', [6,12,16,17,18,21,22,41,42,49,83,123,142,144,145,146,149], 'Does it have a proper pair of wings to show off?', 'Would a pair of visible wings give this one away?'],
  ['cocoon', [11,14], 'Is it in its “please do not disturb, becoming fabulous” cocoon era?', 'Does it look like a cocoon waiting for a dramatic makeover?'],
  ['caterpillar', [10,13], 'Is it a little caterpillar-shaped creature crawling toward its glow-up?', 'Does it have that tiny, crawling caterpillar look?'],
  ['stingers', [13,14,15], 'Is a pointy stinger part of its personal space policy?', 'Does its bug-like body come with a very obvious stinger?'],
  ['bird', [16,17,18,21,22,83,84,85,144,145,146], 'Does it have a clearly bird-like body? An unusual birdwatching trip awaits.', 'Would you put it in the “definitely a bird” section of the field guide?'],
  ['scruffy-bird', [21], 'Is it a small, scruffy brown bird with short reddish wings?', 'Does this little bird have reddish wings and a distinctly scruffy brown head?'],
  ['rat', [19,20], 'Is it a purple rat or its chunky brown evolution? I am hiding the cheese.', 'Does it belong to Rattata’s family of unusually formidable rats?'],
  ['snake', [23,24], 'Is it basically a snake with a battle career?', 'Does it slither around looking unmistakably like a snake?'],
  ['cobra', [24], 'Does it spread a cobra hood with a face-like pattern?', 'Is that a threatening face pattern on its cobra hood?'],
  ['cheeks', [25,26], 'Are those electric cheek pouches, or is it just happy to shock me?', 'Does it store electricity in those very recognizable cheeks?'],
  ['lightning-tail', [25,26], 'Does its tail have a lightning-bolt shape, either along it or at the tip?', 'Does it advertise its electricity with a lightning-bolt-shaped tail or tail tip?'],
  ['rhino', [111,112], 'Does it look like a gray rhinoceros with a drilling career?', 'Is it a gray, rhinoceros-like creature with a drill-shaped horn on its nose?'],
  ['moon', [35,36], 'Is it one of those pink, pointy-eared moon fairies with a curled tail?', 'Does it have that pink moon-fairy look, complete with a little curled tail?'],
  ['many-tails', [37,38], 'Does this fox have considerably more than one fluffy tail?', 'Is its fox-like tail situation getting seriously out of hand?'],
  ['sing', [39,40], 'Is it a round pink singer with a curl on its forehead?', 'Does it look like a pink singing balloon with a little forehead curl?'],
  ['bat', [41,42], 'Does it look like a bat who found the wrong cave exit?', 'Is it distinctly bat-shaped? I will keep the lights down.'],
  ['mushroom', [46,47], 'Are there mushrooms growing on its back? That seems personal.', 'Is its crab-like body carrying a mushroom problem?'],
  ['cat', [52,53], 'Is it a housecat-like Pokémon from the Meowth or Skitty family?', 'Does it belong to Meowth’s or Skitty’s family? I am sensing feline mischief.'],
  ['coin', [52], 'Does it wear a gold coin on its forehead like it owns the place?', 'Is that a coin on its forehead? Very committed to the brand.'],
  ['duck', [54,55,83], 'Does it look like a duck who has had a long day?', 'Is this one distinctly duck-shaped?'],
  ['headache', [54], 'Is it a yellow duck clutching its head like Monday never ended?', 'Does this yellow duck look like it has a permanent headache?'],
  ['pig-monkey', [56,57], 'Is it a furry monkey with a pig-like snout and anger issues?', 'Does a pig snout on a very angry monkey sound familiar?'],
  ['fire-dog', [58,59], 'Is it a fluffy orange canine with bold black stripes?', 'Does this dog have orange fur and black tiger-like stripes?'],
  ['swirl', [60,61,62], 'Is there a very obvious spiral drawn on its belly?', 'Does its belly come with a built-in hypnotic swirl?'],
  ['spoons', [64,65], 'Has it brought a spoon (or two) to a psychic fight?', 'Does it insist on carrying silverware for psychic business?'],
  ['four-arms', [68], 'Is it a gray, muscular fighter with four arms? Unfair at high-fives.', 'Would counting this gray bodybuilder’s arms get you all the way to four?'],
  ['belt', [67,68], 'Is it a muscular gray fighter wearing a championship-style belt?', 'Did this gray bodybuilder accessorize with a big belt?'],
  ['jellyfish', [72,73], 'Is it a jellyfish with red gems on its head?', 'Does this jellyfish come with dramatic red head ornaments?'],
  ['rock-arms', [74,75,76], 'Is it in Geodude’s family of grumpy, arm-waving rocks?', 'Does it look like Geodude or one of its increasingly hefty rock relatives?'],
  ['fire-horse', [77,78], 'Is it a horse whose mane is an actual fire hazard?', 'Does this horse have flames where a mane should be?'],
  ['slow', [79,80], 'Is it a pink, wonderfully vacant-looking creature with a long tail?', 'Does it have a pink body, a long tail, and a very vacant stare?'],
  ['magnet', [81,82], 'Does it have magnets attached to a metal ball-shaped body?', 'Is it made of metal spheres with magnets sticking out?'],
  ['multiple-heads', [82,84,85,102,103,110], 'Does this Pokémon have more than one head or face sharing its identity?', 'Does it consist of multiple visible heads or faces, either connected or grouped together?'],
  ['sludge', [88,89], 'Is it essentially a living pile of purple sludge?', 'Does its whole body look like purple sludge with opinions?'],
  ['shell', [90,91], 'Is it a purple shellfish with a face peeking out?', 'Does a purple clamshell dominate its entire look?'],
  ['haunt', [92,93,94], 'Is it a purple, mischievous ghost with an enormous grin?', 'Does it have that purple prankster-ghost look?'],
  ['rock-snake', [95], 'Is it a giant snake made of a chain of boulders?', 'Did a pile of rocks somehow become one enormous snake?'],
  ['tapir', [96,97], 'Does it have a long tapir-like nose and a taste for dreams?', 'Is it a yellow dream-eater with a long, drooping nose?'],
  ['crab', [98,99], 'Is it an orange crab with a serious set of pincers?', 'Does this orange crab look ready to pinch the interviewer?'],
  ['ball', [100,101], 'Does it look suspiciously like a Poké Ball with a face?', 'Would mistaking it for a Poké Ball be an explosive error?'],
  ['eggs', [102], 'Is it a group of cracked eggs having a collective bad day?', 'Are we dealing with a whole cluster of cracked, pinkish eggs?'],
  ['palm', [103], 'Is it a walking palm tree with several very opinionated faces?', 'Does it look like a palm tree with multiple faces?'],
  ['skull', [104,105], 'Does it wear a skull helmet? Very committed to the aesthetic.', 'Is that an actual skull being worn as headgear?'],
  ['tongue', [108], 'Is its enormous tongue doing most of the talking?', 'Is it pink, with a tongue that is frankly excessive?'],
  ['gas', [109,110], 'Is it a floating purple gas ball marked with a skull and crossbones?', 'Does its purple, gas-filled body have a skull-and-crossbones mark?'],
  ['egg-pouch', [113], 'Does it keep an egg in a pouch on its belly?', 'Is that an egg tucked into its belly pouch?'],
  ['vines', [114], 'Is it a tangle of blue vines with little red shoes?', 'Does it look like a walking blue vine knot wearing red boots?'],
  ['baby', [115], 'Does it carry a little baby in a belly pouch?', 'Is there a smaller passenger riding in its pouch?'],
  ['seahorse', [116,117], 'Is it a seahorse with a snout that looks like a tiny cannon?', 'Does it have a curled seahorse tail and a tube-shaped snout?'],
  ['goldfish', [118,119], 'Is it a horned fish dressed in white and orange?', 'Does this orange-and-white fish have a horn on its head?'],
  ['star', [120,121], 'Is it star-shaped with a jewel right in the middle?', 'Does a central gem sit in its star-shaped body?'],
  ['mime', [122], 'Does it look like a mime who takes invisible walls seriously?', 'Is it a clown-like mime with round fingertips?'],
  ['scythes', [123], 'Are its arms enormous scythes? Handshakes seem unwise.', 'Does this green insect have blades instead of hands?'],
  ['ice-dancer', [124], 'Does it have long blond hair and a red dress-like body?', 'Is this the blond-haired one with big lips and a red dress-like body?'],
  ['plugs', [125], 'Does it have black stripes on yellow fur and plug-like head prongs?', 'Is it a yellow, black-striped creature with two prongs on its head?'],
  ['duck-fire', [126], 'Is it a red-and-yellow fire creature with a duck-like bill?', 'Does this fiery red-and-yellow Pokémon have a very duck-like face?'],
  ['pincers', [127], 'Does this brown beetle have giant spiky pincers on its head?', 'Are two huge, spiky head pincers this beetle’s main accessory?'],
  ['bull', [128], 'Is it a bull with three tails? That is a lot of fly swatters.', 'Does this bull have a rather excessive three tails?'],
  ['fish', [129,130], 'Did it start life as a red fish with extravagant whiskers?', 'Is it the red whiskered fish, or its long blue sea-serpent evolution?'],
  ['ferry', [131], 'Does it have a long neck, flippers, and a shell made for ferry rides?', 'Would a blue, long-necked sea creature with a gray shell fit?'],
  ['blob', [132], 'Is it a little purple blob with a face you could draw in three dots?', 'Does it look like a smiling purple puddle waiting to become something else?'],
  ['eevee', [133,134,135,136], 'Is it Eevee or one of its original three evolutions?', 'Does it belong to Eevee’s original Water, Electric, or Fire family, including Eevee?'],
  ['pixels', [137], 'Does it look like a pink-and-blue 3D model before anyone smoothed the edges?', 'Is it a delightfully angular, pink-and-blue virtual creature?'],
  ['fossil', [138,139,140,141,142], 'Could its family be revived from a fossil? A very dramatic comeback.', 'Is it from a fossil-revival family? Ancient history with a pulse.'],
  ['snail', [138,139], 'Does it have a spiral shell with tentacles peeking out?', 'Is it an ancient tentacled creature in a spiral shell?'],
  ['kabuto', [140,141], 'Is it a brown-armored fossil creature with a dark underside?', 'Does it belong to the brown-armored, horseshoe-crab-like fossil family?'],
  ['sleep', [143], 'Would this enormous, round-bellied sleeper block an entire road?', 'Is it that huge blue-and-cream Pokémon who treats sleeping as a career?'],
  ['legend-bird', [144,145,146], 'Is it one of Kanto’s three legendary birds?', 'Are we dealing with the legendary Ice, Electric, or Fire bird?'],
  ['dragon-line', [147,148,149], 'Is it in the family that goes from blue serpents to an orange dragon?', 'Does its evolution family end with a friendly-looking orange dragon?'],
  ['mew', [150,151], 'Is it one of the two famous Mew-related psychic legends?', 'Does its story involve Mew or the Pokémon created from Mew?'],
];

const colors = {black:'black',blue:'blue',brown:'brown',gray:'gray',green:'green',pink:'pink',purple:'purple',red:'red',white:'white',yellow:'yellow'};

export function buildTraits(pokemon) {
  const traits = [];
  const add = (id, group, lines, matches, detail, signature = false) => {
    const members = pokemon.filter(matches).map(p => p.id);
    if (members.length && members.length < pokemon.length) {
      const membership = new Set(members);
      // A question and its inverse are the same binary fact, regardless of wording.
      const key = splitKey(pokemon.map(p => p.id), membership);
      const revealing = signature && members.length <= 3;
      traits.push({id, group, lines, members:membership, key, detail, signature, revealing});
    }
  };
  for (const [type, lines] of Object.entries(typeLines)) add(`type:${type}`, 'type', lines, p => p.types.includes(type), `Count either of its official types. Use its original regional appearance with current typings.`);
  for (const color of Object.keys(colors)) add(`color:${color}`, 'color', [
    `Would ${color} be the main crayon you reach for to draw it?`,
    `Is its main body color ${color}? I am mentally assembling a very suspicious portrait.`,
  ], p => p.color === color, 'Think of its usual appearance, not a shiny version. Pokédex color categories can be broad.');
  for (const [id, members, ...lines] of [...signatures, ...newSignatures]) {
    const ids = new Set([...members, ...(extendedMembers[id] || [])]);
    add(id, 'appearance', lines, p => ids.has(p.id), 'Think of its original regional appearance, not a shiny, Mega, or alternate form. “Not sure” is fine.', true);
  }
  add('evolved', 'evolution', ['Has it already evolved from another Pokémon? Someone has had a glow-up.', 'Is it an evolved form? I am checking for a previous identity.'], p => Boolean(p.evolvesFrom), 'Includes later pre-evolutions, such as Pichu for Pikachu and Budew for Roselia.');
  const parents = new Set(pokemon.map(p => p.evolvesFrom));
  add('can-evolve', 'evolution', ['Can it evolve into another Pokémon introduced in Gens 1–3? Its story is not over yet.', 'Does it still have an evolution waiting among the first 386 Pokémon?'], p => p.evolvesWithinRoster ?? parents.has(p.slug), 'Count any evolution introduced in Gens 1–3, even outside your selected region. Later evolutions such as Sylveon do not count.');
  add('rare', 'legend', ['Is it Legendary or Mythical? A suspiciously exclusive guest list.', 'Does it belong to the Legendary or Mythical club?'], p => p.legendary || p.mythical, 'Includes legendary birds, beasts, the Regis, the weather trio, and Mythical Pokémon such as Mew, Celebi, Jirachi, and Deoxys.');
  const regions = [[1,'Kanto','the Red and Blue era'],[2,'Johto','the Gold and Silver era'],[3,'Hoenn','the Ruby and Sapphire era']];
  for (const [generation,region,era] of regions) add(`generation:${generation}`, 'generation', [
    `Did it make its grand entrance in ${region}, back in ${era}?`,
    `Was this Pokémon first introduced in ${region}’s generation? I am dating its debut, not its trainer.`,
  ], p => p.generation === generation, `Think of the generation that introduced the species, not every region where it can be caught. ${region} is Gen ${generation}.`);
  const bySlug = new Map(pokemon.map(p => [p.slug,p]));
  const familyRoot = p => { const visited = new Set(); while (bySlug.has(p.evolvesFrom) && !visited.has(p.id)) { visited.add(p.id); p = bySlug.get(p.evolvesFrom); } return p; };
  for (const root of new Map(pokemon.map(p => { const r = familyRoot(p); return [r.id,r]; })).values()) {
    // Family membership is useful when relatives look quite different. Singles
    // rely on visual clues and official categories rather than naming a guess.
    if (pokemon.filter(p => familyRoot(p).id === root.id).length < 2) continue;
    add(`family:${root.slug}`, 'family', [
      `Is it ${root.name} or one of its evolution relatives? I recognize a family resemblance.`,
      `Does it share an evolution family with ${root.name}? Something about the family portrait is familiar.`,
    ], p => familyRoot(p).id === root.id, `Count every evolution branch and pre-evolution in the ${root.name} family, including ${root.name} itself.`);
  }
  // Official categories are a useful late fallback, never a made-up physical fact.
  for (const genus of new Set(pokemon.map(p => p.genus))) add(`category:${genus}`, 'category', [
    `Does the Pokédex call it the “${genus}”? That label feels like a clue.`,
    `Would “${genus}” be its official Pokédex job title?`,
  ], p => p.genus === genus, 'This is its official species category, not its name or type. “Not sure” is completely fine.');
  return traits;
}

function splitKey(ids, members) {
  const yes = [], no = [];
  for (const id of ids) (members.has(id) ? yes : no).push(id);
  const parts = [yes.sort((a,b)=>a-b).join(','), no.sort((a,b)=>a-b).join(',')];
  return parts.sort().join('|');
}

export const ENGINE_VERSION = 'deduction-v5';

export class Game {
  constructor(pokemon, {random = Math.random} = {}) {
    this.pokemon = pokemon;
    this.traits = buildTraits(pokemon);
    this.traitById = new Map(this.traits.map(t => [t.id,t]));
    this.revealingKeys = new Set(this.traits.filter(t => t.revealing).map(t => t.key));
    this.random = random;
    this.history = [];
    this.rejected = [];
    this.mistakeBudget = 0;
    this.logs = new Map(pokemon.map(p => [p.id, 0]));
    this.candidates = pokemon.map(p => p.id);
    this.candidateIds = new Set(this.candidates);
    this.current = null;
    this.next();
  }
  ranking() {
    const max = Math.max(...this.candidates.map(id => this.logs.get(id)));
    const weights = this.pokemon.map(p => ({pokemon:p, weight:this.candidateIds.has(p.id) ? Math.exp(this.logs.get(p.id) - max) : 0}));
    const total = weights.reduce((s,p) => s + p.weight, 0);
    return weights.map(p => ({pokemon:p.pokemon, probability:total ? p.weight/total : 0})).sort((a,b) => b.probability-a.probability);
  }
  availableTraits() {
    if (this.candidates.length < 2) return [];
    const asked = new Set(this.history.map(h => h.traitId));
    const askedFacts = new Set(this.history.map(h => this.traitById.get(h.traitId).key));
    // Compare questions on the remaining candidates too. Two different clues
    // can become equivalent after an elimination or a rejected guess.
    const askedSplits = new Set(this.history.map(h => splitKey(this.candidates,this.traitById.get(h.traitId).members)));
    return this.traits.filter(trait => {
      if (asked.has(trait.id) || askedFacts.has(trait.key)) return false;
      const yes = this.candidates.reduce((count,id) => count + Number(trait.members.has(id)),0);
      if (!yes || yes === this.candidates.length) return false;
      return !askedSplits.has(splitKey(this.candidates,trait.members));
    });
  }
  next() {
    const ranking = this.ranking();
    if (this.hasConflict() || this.readyForReveal(ranking[0].pokemon.id)) {
      this.current = null;
      return;
    }
    const available = this.availableTraits();
    // Keep the most identifying visual details (and aliases of those details)
    // for the payoff. Broad visual clues still help with the investigation.
    const discovery = available.filter(t => !t.revealing && !this.revealingKeys.has(t.key));
    const informative = this.history.filter(h => h.value !== 0).length;
    const finaleReady = this.candidates.length <= 2 ||
      (this.candidates.length <= 4 && informative >= 3) ||
      (ranking[0].probability >= .6 && informative >= 4) || !discovery.length;
    const finisher = finaleReady ? this.finisherFor(ranking[0].pokemon.id) : null;
    if (finisher) {
      this.current = {...finisher, finisher:true, targetId:ranking[0].pokemon.id,
        text:finisher.lines[Math.floor(this.random()*finisher.lines.length)]};
      return;
    }
    const lastGroup = this.history.at(-1)?.group;
    const options = (discovery.length ? discovery : available).map(trait => {
      const mass = ranking.reduce((s,r) => s + (trait.members.has(r.pokemon.id) ? r.probability : 0), 0);
      let gain = mass > 0 && mass < 1 ? -mass*Math.log2(mass)-(1-mass)*Math.log2(1-mass) : 0;
      if (trait.group === 'category') gain *= this.history.length < 6 ? 0.08 : 0.52;
      if (trait.group === 'family') gain *= .8;
      if (trait.group === 'generation') gain *= this.history.length < 3 ? .55 : .9;
      if (trait.signature) gain *= 1.15 + Math.min(0.3, ranking[0].probability);
      if (trait.group === lastGroup && trait.group !== 'appearance') gain *= .7;
      return {trait, score:gain*(.94+this.random()*.12)};
    }).sort((a,b) => b.score-a.score);
    const trait = options[0]?.trait;
    if (!trait) { this.current = null; return; }
    this.current = {...trait, text:trait.lines[Math.floor(this.random()*trait.lines.length)]};
  }
  finisherFor(id) {
    const asked = new Set(this.history.map(h => this.traitById.get(h.traitId).key));
    return this.traits.filter(t => t.revealing && t.members.has(id) && !asked.has(t.key) &&
      this.candidates.every(candidate => candidate === id || !t.members.has(candidate)))
      .sort((a,b) => a.members.size-b.members.size)[0] || null;
  }
  readyForReveal(leadingId = this.ranking()[0].pokemon.id) {
    const last = this.history.at(-1);
    return Boolean(last?.finisher && this.candidateIds.has(last.targetId) &&
      leadingId === last.targetId && (last.value > 0 || (last.value === 0 && this.candidates.length === 1)));
  }
  answer(value) {
    if (![-1,-.5,0,.5,1].includes(value) || !this.current) throw new Error('Invalid answer');
    const t = this.current;
    this.history.push({traitId:t.id, group:t.group, text:t.text, value,
      finisher:Boolean(t.finisher), targetId:t.targetId});
    this.rebuild();
    this.next();
  }
  apply(trait, value) {
    if (!value) return;
    const certainty = Math.abs(value) === 1 ? .94 : .73;
    for (const p of this.pokemon) {
      const agrees = trait.members.has(p.id) === (value > 0);
      this.logs.set(p.id, this.logs.get(p.id) + Math.log(agrees ? certainty : 1-certainty));
    }
  }
  back() {
    if (!this.history.length) return;
    const last = this.history.pop();
    this.rebuild();
    this.current = {...this.traitById.get(last.traitId), text:last.text,
      finisher:last.finisher, targetId:last.targetId};
  }
  rebuild() {
    this.logs = new Map(this.pokemon.map(p => [p.id,0]));
    const definite = this.history.filter(h => Math.abs(h.value) === 1)
      .map(h => ({yes:h.value>0,members:this.traitById.get(h.traitId).members}));
    const alternatives = this.pokemon.filter(p => !this.rejected.includes(p.id))
      .map(p => ({id:p.id,errors:definite.reduce((sum,h) => sum+Number(h.members.has(p.id)!==h.yes),0)}));
    // Edits and undo can make an exact fit possible again.
    this.mistakeBudget = Math.min(this.mistakeBudget,Math.min(...alternatives.map(p => p.errors)));
    for (const h of this.history) {
      const trait = this.traitById.get(h.traitId);
      const subjective = this.mistakeBudget > 0 && ['color','appearance'].includes(trait.group);
      this.apply(trait,subjective && Math.abs(h.value) === 1 ? h.value*.5 : h.value);
    }
    this.candidates = alternatives.filter(p => p.errors <= this.mistakeBudget).map(p => p.id);
    this.candidateIds = new Set(this.candidates);
  }
  revise(index,value) {
    if (!Number.isInteger(index) || !this.history[index] || ![-1,-.5,0,.5,1].includes(value)) throw new Error('Invalid answer revision');
    this.history[index] = {...this.history[index],value};
    this.rebuild();
    this.next();
  }
  reject(id) {
    if (!this.pokemon.some(p => p.id === id) || this.rejected.includes(id)) throw new Error('Invalid rejected guess');
    this.rejected.push(id);
    this.rebuild();
    this.next();
  }
  restoreRejected() {
    if (!this.rejected.length) return;
    const id = this.rejected.pop();
    this.rebuild();
    this.next();
    return id;
  }
  hasConflict() {
    return this.candidates.length === 0;
  }
  conflictsFor(id) {
    return this.history.flatMap((answer,index) => Math.abs(answer.value) === 1 &&
      this.traitById.get(answer.traitId).members.has(id) !== (answer.value > 0)
      ? [{index,traitId:answer.traitId,text:answer.text,value:answer.value}] : []);
  }
  recoveryPlan() {
    if (!this.hasConflict()) return null;
    // Compare every lead with the complete original history, rather than
    // accumulating discarded constraints that protect an early mistaken clue.
    let best = null;
    for (const p of this.pokemon) {
      if (this.rejected.includes(p.id)) continue;
      const conflicts = this.conflictsFor(p.id);
      let score = 0;
      for (const h of this.history) {
        if (!h.value) continue;
        const trait = this.traitById.get(h.traitId);
        const subjective = ['color','appearance'].includes(trait.group);
        const certainty = Math.abs(h.value) === 1 && !subjective ? .94 : .73;
        const agrees = trait.members.has(p.id) === (h.value > 0);
        score += Math.log(agrees ? certainty : 1-certainty);
      }
      if (!best || conflicts.length < best.budget || (conflicts.length === best.budget && score > best.score)) {
        best = {leadId:p.id,budget:conflicts.length,score,answers:conflicts};
      }
    }
    return best?.budget ? {leadId:best.leadId,budget:best.budget,answers:best.answers} : null;
  }
  recover() {
    const plan = this.recoveryPlan();
    if (!plan) return null;
    this.mistakeBudget = plan.budget;
    this.rebuild();
    this.next();
    return plan;
  }
  knownGeneration() {
    const generations = new Set(this.pokemon.filter(p => this.candidateIds.has(p.id)).map(p => p.generation));
    return generations.size === 1 ? [...generations][0] : null;
  }
  shouldGuess() {
    if (this.hasConflict()) return false;
    if (this.readyForReveal()) return true;
    if (this.current?.finisher) return false;
    const informative = this.history.filter(h => h.value !== 0).length;
    return this.candidates.length === 1 || (informative >= 5 && this.ranking()[0].probability >= .88) || this.history.length >= 20 + this.rejected.length*5 || !this.current;
  }
  remaining() {
    return this.candidates.length;
  }
}
