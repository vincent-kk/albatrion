// Invoked by node make-legacy.mjs; this file is verification tooling.
// Explicit entry point: node make-legacy.mjs (also Bun); stdout is one JSON record.
import { prepare, write, expose, instrumentLegacy, emit } from './build-common.mjs';
import { legacyStages, pairing } from './config.mjs';
const src = prepare('legacy');
const built = instrumentLegacy(src, legacyStages);
write('legacy-baseline.mjs', expose(src, 'legacy'));
write('legacy-instrumented.mjs', expose(built.source, 'legacy'));
emit('legacy', ['legacy-source.mjs', 'legacy-baseline.mjs', 'legacy-instrumented.mjs'], { instrumented: built.names, missing: built.missing, stages: legacyStages, pairing, pairingIsEstimate: true });
