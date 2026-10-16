// Invoked by node run-terminal.mjs; this file is verification tooling.
// A2-3 timing: node run-terminal.mjs [--smoke] [--engine=current|legacy|both].
import { option, settings, metadata, loadEngine, terminalScenes, measure, ordered } from './bench-common.mjs';
const config = settings(), rows = [], selected = option('engine', 'both');
for (const name of ordered(selected === 'both' ? ['current', 'legacy'] : [selected])) {
  const engine = await loadEngine(name);
  for (const spec of ordered(terminalScenes())) rows.push(await measure(engine, spec, config));
}
console.log(JSON.stringify({ ...metadata('A2-3', config), rows }));
