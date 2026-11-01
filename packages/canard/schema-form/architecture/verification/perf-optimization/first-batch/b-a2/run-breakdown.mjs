// Invoked by node run-breakdown.mjs; this file is verification tooling.
// B-2/B-3 inclusive function timers + disjoint stage occupancy; never sum inclusive timers.
import { option, settings, metadata, loadEngine, scene, measure } from './bench-common.mjs';
import { pairing } from './config.mjs';
const config = settings(true), name = option('engine', 'current'), engine = await loadEngine(name, 'baseline', true);
const row = await measure(engine, scene('object', 'BN', 1000, 'all-keys'), config);
console.log(JSON.stringify({ ...metadata(name === 'legacy' ? 'B-3' : 'B-2', config), pairingIsEstimate: true, pairing, stageMethod: 'Disjoint elapsed intervals owned by innermost instrumented stage, plus other; inclusive per-symbol medians and counts are separate and must not be summed.', rows: [row] }));
