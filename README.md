# Pokinator

A static Pokémon guessing game with 151 cached species, 200 explicit traits, and fact-bound procedural questions. The first engine uses Bayesian updates and information gain; it is not a trained neural model.

```sh
npm run dev
```

Open http://localhost:4173. Requires Python 3. No runtime packages or API keys are needed. Node.js 20+ runs the verification suite with `npm test`.

`dist/engine.js` holds the guessing policy, feature membership, and wording templates. `dist/app.js` manages the game, accessible dialogs, and browser-local round history. `dist/pokemon.json` and `dist/assets/pokemon/` cache data and sprites from [PokéAPI](https://pokeapi.co/docs/v2/), its [API data repository](https://github.com/PokeAPI/api-data), and [sprites](https://github.com/PokeAPI/sprites). `npm run data:refresh` refreshes the cached dataset with Python's standard library.

Only standard Kanto appearances are supported. Types use current classifications; evolution ancestry includes later pre-evolutions. The test suite verifies that perfect answers to the encoded facts identify all 151 Pokémon, alongside undo, neutral unknown answers, rejection, and probability normalization. Those simulations are not a measurement of human accuracy. Hunch strength is uncalibrated.

Up to 200 completed rounds stay in localStorage and can be exported or cleared from **Behind the hunch**. No game history is transmitted. Exports contain labeled targets and answers for later training experiments. A learned question selector can replace `Game.next()` without rewriting the interface.

Serve `dist/` with any static host. Sites deployment identity is in `.openai/hosting.json`. Google Fonts is optional; system fonts provide fallbacks. This is an unofficial fan project; Pokémon and character designs belong to their respective owners.
