// Fact selection and question phrasing are separate so a learned policy can replace
// the information-gain policy later without changing the UI or truth labels.
const typeLines = {
  grass: ['Does it bring its own greenery wherever it goes?', 'Is it part Grass type—basically a houseplant with opinions?'],
  fire: ['Is it Fire type, with all the insurance problems that implies?', 'Would its Fire typing make a sprinkler system nervous?'],
  water: ['Is it a Water type who would feel at home at a pool party?', 'Does Water type belong on its résumé?'],
  electric: ['Is it Electric type—a walking warning for your electronics?', 'Does this one come with Electric typing and a shock hazard?'],
  psychic: ['Is it Psychic type, making this mind-reading contest a little unfair?', 'Does it have Psychic typing? I feel like it knows my next question.'],
  poison: ['Is it Poison type—someone you should probably not lick?', 'Does its Poison typing make hugs a questionable idea?'],
  flying: ['Does it have Flying typing? Yes, the actual type—not just wings.', 'Is Flying one of its types? My ceiling would like to know.'],
  bug: ['Is it Bug type, and perhaps unwelcome at a picnic?', 'Does this mystery have Bug typing? There goes my picnic.'],
  normal: ['Is it officially Normal type, however weird it actually looks?', 'Does Normal appear in its typing? A generous use of “normal.”'],
  ground: ['Is it Ground type, with a professional interest in dirt?', 'Does it have Ground typing? The garden is looking nervous.'],
  rock: ['Is it Rock type—the sort of friend who takes granite for granted?', 'Does Rock appear in its typing? That sounds like a heavy friendship.'],
  fighting: ['Is it Fighting type, and taking gym membership far too seriously?', 'Does it have Fighting typing? I promise this is a friendly interview.'],
  ghost: ['Is it Ghost type? I would like to keep this haunting consensual.', 'Does it have Ghost typing, and terrible respect for solid walls?'],
  ice: ['Is it Ice type, and bringing its own air conditioning?', 'Does this one have Ice typing? I should have brought a scarf.'],
  dragon: ['Is it actually Dragon type? Looking like a dragon does not count.', 'Does Dragon appear in its typing? I checked the fine print.'],
  fairy: ['Is it Fairy type, with suspiciously magical energy?', 'Does it have Fairy typing? Cute can still be dangerous.'],
  steel: ['Is it Steel type—a potential problem for airport security?', 'Does Steel appear in its typing? That explains the clanking.'],
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
  ['bird', [16,17,18,21,22,83,84,85,144,145,146], 'Is it clearly bird-shaped, feathers and all?', 'Would you put it in the “definitely a bird” section of the field guide?'],
  ['scruffy-bird', [21], 'Is it a small, scruffy brown bird with short reddish wings?', 'Does this little bird have reddish wings and a distinctly scruffy brown head?'],
  ['rodent', [19,20,25,26,27,28], 'Does it have that little rodent look—mouse, rat, or shrew?', 'Would “suspiciously powerful rodent” fit its general appearance?'],
  ['snake', [23,24], 'Is it basically a snake with a battle career?', 'Does it slither around looking unmistakably like a snake?'],
  ['cobra', [24], 'Does it spread a cobra hood with a face-like pattern?', 'Is that a threatening face pattern on its cobra hood?'],
  ['cheeks', [25,26], 'Are those electric cheek pouches, or is it just happy to shock me?', 'Does it store electricity in those very recognizable cheeks?'],
  ['lightning-tail', [25], 'Is its tail shaped like a lightning bolt? Subtle branding.', 'Does it advertise its electricity with a lightning-bolt tail?'],
  ['horn', [29,31,32,33,34,77,78,86,87,111,112,118,119], 'Does it have a noticeable horn on its forehead or nose?', 'Would the horn on its head make a headbutt especially concerning?'],
  ['moon', [35,36], 'Is it one of those pink, pointy-eared moon fairies with a curled tail?', 'Does it have that pink moon-fairy look, complete with a little curled tail?'],
  ['many-tails', [37,38], 'Does this fox have considerably more than one fluffy tail?', 'Is its fox-like tail situation getting seriously out of hand?'],
  ['sing', [39,40], 'Is it a round pink singer with a curl on its forehead?', 'Does it look like a pink singing balloon with a little forehead curl?'],
  ['bat', [41,42], 'Does it look like a bat who found the wrong cave exit?', 'Is it distinctly bat-shaped? I will keep the lights down.'],
  ['mushroom', [46,47], 'Are there mushrooms growing on its back? That seems personal.', 'Is its crab-like body carrying a mushroom problem?'],
  ['cat', [52,53], 'Is it recognizably a cat, complete with whiskers?', 'Would you describe it as a cat with battle privileges?'],
  ['coin', [52], 'Does it wear a gold coin on its forehead like it owns the place?', 'Is that a coin on its forehead? Very committed to the brand.'],
  ['duck', [54,55], 'Does it look like a duck who has had a long day?', 'Is this one distinctly duck-shaped?'],
  ['headache', [54], 'Is it a yellow duck clutching its head like Monday never ended?', 'Does this yellow duck look like it has a permanent headache?'],
  ['pig-monkey', [56,57], 'Is it a furry monkey with a pig-like snout and anger issues?', 'Does a pig snout on a very angry monkey sound familiar?'],
  ['fire-dog', [58,59], 'Is it a fluffy orange canine with bold black stripes?', 'Does this dog have orange fur and black tiger-like stripes?'],
  ['swirl', [60,61,62], 'Is there a very obvious spiral drawn on its belly?', 'Does its belly come with a built-in hypnotic swirl?'],
  ['spoons', [64,65], 'Has it brought a spoon—or two—to a psychic fight?', 'Does it insist on carrying silverware for psychic business?'],
  ['four-arms', [68], 'Does it have four arms? That is an unfair advantage at high-fives.', 'Would counting its arms get you all the way to four?'],
  ['belt', [67,68], 'Is it a muscular gray fighter wearing a championship-style belt?', 'Did this gray bodybuilder accessorize with a big belt?'],
  ['jellyfish', [72,73], 'Is it a jellyfish with red gems on its head?', 'Does this jellyfish come with dramatic red head ornaments?'],
  ['rock-arms', [74,75,76], 'Is it a rocky creature with two hefty arms and a grumpy face?', 'Does it look like a rock decided to grow arms and fight?'],
  ['fire-horse', [77,78], 'Is it a horse whose mane is an actual fire hazard?', 'Does this horse have flames where a mane should be?'],
  ['slow', [79,80], 'Is it a pink, wonderfully vacant-looking creature with a long tail?', 'Does it have a pink body, a long tail, and a very vacant stare?'],
  ['magnet', [81,82], 'Does it have magnets attached to a metal ball-shaped body?', 'Is it made of metal spheres with magnets sticking out?'],
  ['multiple-heads', [82,84,85,102,103,110], 'Does more than one face want a say in this conversation?', 'Does this Pokémon have multiple heads or faces on one connected body?'],
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
  ['eevee', [133,134,135,136], 'Is it Eevee or one of its original three evolutions?', 'Does it belong to Eevee’s original Water, Electric, or Fire family—including Eevee?'],
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
    if (members.length && members.length < pokemon.length) traits.push({id, group, lines, members: new Set(members), detail, signature});
  };
  for (const [type, lines] of Object.entries(typeLines)) add(`type:${type}`, 'type', lines, p => p.types.includes(type), `Count either of its official types. Use standard Kanto forms with current typings.`);
  for (const color of Object.keys(colors)) add(`color:${color}`, 'color', [
    `Would ${color} be the main crayon you reach for to draw it?`,
    `Is its main body color ${color}? I am mentally assembling a very suspicious portrait.`,
  ], p => p.color === color, 'Think of its usual appearance, not a shiny version. Pokédex color categories can be broad.');
  for (const [id, members, ...lines] of signatures) add(id, 'appearance', lines, p => members.includes(p.id), 'Think of its usual Kanto form. Choose “Not sure” if this detail is unfamiliar.', true);
  add('evolved', 'evolution', ['Has it already evolved from another Pokémon? Someone has had a glow-up.', 'Is it an evolved form? I am checking for a previous identity.'], p => Boolean(p.evolvesFrom), 'Includes pre-evolutions introduced after Kanto, such as Pichu.');
  const parents = new Set(pokemon.map(p => p.evolvesFrom));
  add('can-evolve', 'evolution', ['Can it evolve into another of the original 151? Its story is not over yet.', 'Does it still have an evolution waiting within the original 151?'], p => parents.has(p.slug), 'Only count evolutions within the original 151 for this question.');
  add('rare', 'legend', ['Is it Legendary or Mythical? A suspiciously exclusive guest list.', 'Does it belong to the Legendary or Mythical club?'], p => p.legendary || p.mythical, 'Kanto’s legendary birds, Mewtwo, and Mew count.');
  // Official categories are a useful late fallback, never a made-up physical fact.
  for (const genus of new Set(pokemon.map(p => p.genus))) add(`category:${genus}`, 'category', [
    `Does the Pokédex call it the “${genus}”? That label feels like a clue.`,
    `Would “${genus}” be its official Pokédex job title?`,
  ], p => p.genus === genus, 'This is its official species category, not its name or type. “Not sure” is completely fine.');
  return traits;
}

export class Game {
  constructor(pokemon, {random = Math.random} = {}) {
    this.pokemon = pokemon;
    this.traits = buildTraits(pokemon);
    this.random = random;
    this.history = [];
    this.rejected = [];
    this.logs = new Map(pokemon.map(p => [p.id, 0]));
    this.current = null;
    this.next();
  }
  ranking() {
    const max = Math.max(...this.logs.values());
    const weights = this.pokemon.map(p => ({pokemon:p, weight:Math.exp(this.logs.get(p.id) - max)}));
    const total = weights.reduce((s,p) => s + p.weight, 0);
    return weights.map(p => ({pokemon:p.pokemon, probability:p.weight/total})).sort((a,b) => b.probability-a.probability);
  }
  next() {
    const ranking = this.ranking();
    const asked = new Set(this.history.map(h => h.traitId));
    const lastGroup = this.history.at(-1)?.group;
    const options = this.traits.filter(t => !asked.has(t.id)).map(trait => {
      const mass = ranking.reduce((s,r) => s + (trait.members.has(r.pokemon.id) ? r.probability : 0), 0);
      let gain = mass > 0 && mass < 1 ? -mass*Math.log2(mass)-(1-mass)*Math.log2(1-mass) : 0;
      if (trait.group === 'category') gain *= this.history.length < 6 ? 0.08 : 0.52;
      if (trait.signature) gain *= 1.15 + Math.min(0.3, ranking[0].probability);
      if (trait.group === lastGroup && trait.group !== 'appearance') gain *= .7;
      return {trait, score:gain*(.94+this.random()*.12)};
    }).sort((a,b) => b.score-a.score);
    const trait = options[0]?.trait;
    if (!trait) { this.current = null; return; }
    this.current = {...trait, text:trait.lines[Math.floor(this.random()*trait.lines.length)]};
  }
  answer(value) {
    if (![-1,-.5,0,.5,1].includes(value) || !this.current) throw new Error('Invalid answer');
    const t = this.current;
    this.history.push({traitId:t.id, group:t.group, text:t.text, value});
    this.apply(t, value);
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
    this.logs = new Map(this.pokemon.map(p => [p.id, this.rejected.includes(p.id) ? -Infinity : 0]));
    for (const h of this.history) this.apply(this.traits.find(t => t.id === h.traitId), h.value);
    this.current = {...this.traits.find(t => t.id === last.traitId), text:last.text};
  }
  reject(id) {
    this.rejected.push(id);
    this.logs.set(id, -Infinity);
    this.next();
  }
  shouldGuess() {
    const informative = this.history.filter(h => h.value !== 0).length;
    return (informative >= 5 && this.ranking()[0].probability >= .88) || this.history.length >= 20 + this.rejected.length*5 || !this.current;
  }
  remaining() {
    const ranking = this.ranking();
    return ranking.filter(r => r.probability >= ranking[0].probability/15).length;
  }
}
