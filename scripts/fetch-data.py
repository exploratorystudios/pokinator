"""Refresh the cached Kanto dataset. Runtime gameplay needs no external requests."""
import concurrent.futures
import json
from pathlib import Path
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache'
CACHE.mkdir(exist_ok=True)

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
    return dict(id=number, name=name, slug=p['name'], types=[t['type']['name'] for t in p['types']],
                color=s['color']['name'], shape=s['shape']['name'],
                habitat=s['habitat']['name'] if s['habitat'] else None,
                genus=genus, evolvesFrom=s['evolves_from_species']['name'] if s['evolves_from_species'] else None,
                legendary=s['is_legendary'], mythical=s['is_mythical'],
                abilities=[a['ability']['name'] for a in p['abilities']],
                height=p['height'], weight=p['weight'])

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    data = sorted(pool.map(fetch, range(1, 152)), key=lambda p: p['id'])
(ROOT / 'dist' / 'pokemon.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'Cached {len(data)} Pokémon and sprites.')
