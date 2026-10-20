"""Refresh cached species #001–386. Runtime gameplay needs no external requests."""
import concurrent.futures
import json
from pathlib import Path
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache'
CACHE.mkdir(exist_ok=True)
GENERATION_LIMIT = 386

def download(url, target):
    if target.exists():
        return target.read_bytes()
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=40) as response:
                data = response.read()
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            return data
        except Exception:
            if attempt == 3:
                raise
            time.sleep(attempt + 1)

def get(endpoint, number):
    return json.loads(download(f'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2/{endpoint}/{number}/index.json', CACHE / f'{endpoint}-{number}.json'))

def fetch(number):
    p = get('pokemon', number)
    s = get('pokemon-species', number)
    name = next(n['name'] for n in s['names'] if n['language']['name'] == 'en')
    genus = next(n['genus'] for n in s['genera'] if n['language']['name'] == 'en')
    download(p['sprites']['front_default'], ROOT / 'dist' / 'assets' / 'pokemon' / f'{number}.png')
    generation = {'generation-i': 1, 'generation-ii': 2, 'generation-iii': 3}[s['generation']['name']]
    return dict(id=number, name=name, slug=s['name'], generation=generation, types=[t['type']['name'] for t in p['types']],
                color=s['color']['name'], shape=s['shape']['name'],
                habitat=s['habitat']['name'] if s['habitat'] else None,
                genus=genus, evolvesFrom=s['evolves_from_species']['name'] if s['evolves_from_species'] else None,
                legendary=s['is_legendary'], mythical=s['is_mythical'],
                abilities=[a['ability']['name'] for a in p['abilities']],
                height=p['height'], weight=p['weight'])

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    data = sorted(pool.map(fetch, range(1, GENERATION_LIMIT + 1)), key=lambda p: p['id'])
parents = {p['evolvesFrom'] for p in data if p['evolvesFrom']}
for p in data:
    p['evolvesWithinRoster'] = p['slug'] in parents
target = ROOT / 'dist' / 'pokemon.json'
temporary = target.with_suffix('.json.tmp')
temporary.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
temporary.replace(target)
print(f'Cached {len(data)} Pokémon and sprites.')
