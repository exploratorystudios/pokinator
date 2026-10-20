# Pokinator

[Play Pokinator online](https://exploratorystudios.github.io/pokinator/)

A static Pokémon guessing game covering all 386 species introduced in Gens 1–3. Play all regions or filter to species that debuted in Kanto (151), Johto (100), or Hoenn (135). Fact-bound procedural questions combine logical elimination with probability-weighted question selection; this is not a trained neural model.

Definite **Yes / No** answers rule out incompatible candidates. **Probably / Probably not** affect ranking while leaving alternatives possible; **Not sure** is neutral. Known facts carry their implications across regions, types, families, and visual clues. Questions that are already settled or repeat the same binary distinction are skipped, including after a rejected guess. If the clues and rejected guesses leave no candidate, the game offers answer editing or restoration of a rejected guess instead of silently dropping earlier clues. Active rounds allow editing any earlier answer; completed rounds remain a record of the original game.

The most identifying visual clues are reserved for a **One last hunch** confirmation when available. Broad clues narrow the field first; then details such as Delibird’s present sack lead into the reveal. A positive **Yes** or **Probably** on that confirmation reveals the leading Pokémon immediately, with its actual confidence score. Negative and unknown answers can continue the investigation. A final visual confirmation may intentionally check a deduction already established by other facts; ordinary questions still skip settled information.

```sh
npm run dev
```

Open http://localhost:4173. Requires Python 3. No runtime packages or API keys are needed. Node.js 20+ runs the verification suite with `npm test`.

`dist/engine.js` holds the guessing policy and core traits. `dist/clues.js` adds Johto/Hoenn visual clues and cross-generation membership extensions. `dist/config.js` defines the roster and region filters. `dist/app.js` manages the game, accessible dialogs, and browser-local round history. `dist/pokemon.json` and `dist/assets/pokemon/` cache data and sprites from [PokéAPI](https://pokeapi.co/docs/v2/), its [API data repository](https://github.com/PokeAPI/api-data), and [sprites](https://github.com/PokeAPI/sprites). `npm run data:refresh` refreshes the cached dataset with Python's standard library; the dataset is replaced atomically after all downloads succeed.

Original regional appearances are supported, including standard Unown, normal-weather Castform, and Normal Forme Deoxys. Shiny, Mega, and alternate regional forms are not separate guesses. Types use current classifications; evolution ancestry includes later pre-evolutions. Evolution-availability questions count every evolution introduced in Gens 1–3, even if it is outside the selected region. Tests verify all 386 species in full and regional games, cross-generation facts, question variation, dataset validation, undo, neutral unknown answers, rejection, and probability normalization. These perfect-answer simulations are not a measurement of human accuracy. Hunch strength is uncalibrated.

Up to 200 completed rounds stay in localStorage and can be exported or cleared from **Behind the hunch**. No game history is transmitted. New rounds use roster `gen1-3-386` and engine `deduction-v4`, with a region label and a `finisher` flag on each answer. Older rounds retain their original labels and can coexist in the export; training code must respect each round's roster and engine version. A learned question selector can replace `Game.next()` without rewriting the interface.

Serve `dist/` with any static host. Sites deployment identity is in `.openai/hosting.json`. Google Fonts is optional; system fonts provide fallbacks. This is an unofficial fan project; Pokémon and character designs belong to their respective owners.
