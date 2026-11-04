// Invoked by node run-b.mjs; this file is verification tooling.
// B-1 timing: node run-b.mjs [--smoke] [--engine=current|legacy|both].
import { option, settings, metadata, loadEngine, bScenes, measure, ordered } from './bench-common.mjs';
const config = settings(), rows = [];
const selected = option('engine', 'both');
for (const name of ordered(selected === 'both' ? ['current', 'legacy'] : [selected])) {
  const engine = await loadEngine(name);
  for (const spec of ordered(bScenes())) rows.push(await measure(engine, spec, config));
}
console.log(JSON.stringify({ ...metadata('B-1', config), rows }));
