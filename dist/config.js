export const ROSTER_SIZE = 386;
export const ROSTER_ID = 'gen1-3-386';
export const REGIONS = [
  {id:'all', name:'All three regions', generation:null, count:386},
  {id:'kanto', name:'Kanto · Gen 1', generation:1, count:151},
  {id:'johto', name:'Johto · Gen 2', generation:2, count:100},
  {id:'hoenn', name:'Hoenn · Gen 3', generation:3, count:135},
];

export function filterRoster(pokemon, region = 'all') {
  const scope = REGIONS.find(r => r.id === region) || REGIONS[0];
  return scope.generation ? pokemon.filter(p => p.generation === scope.generation) : pokemon;
}

export function validRoster(data) {
  return Array.isArray(data) && data.length === ROSTER_SIZE &&
    new Set(data.map(p => p.id)).size === ROSTER_SIZE &&
    data.every(p => Number.isInteger(p.id) && p.id >= 1 && p.id <= ROSTER_SIZE &&
      p.generation === (p.id <= 151 ? 1 : p.id <= 251 ? 2 : 3) &&
      typeof p.name === 'string' && typeof p.slug === 'string' && typeof p.genus === 'string' &&
      Array.isArray(p.types) && p.types.length > 0);
}
