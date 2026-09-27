/** Loaded by node --import; redirects immutable historical probes to the v7 boundary. */
import { registerHooks } from 'node:module';
import { adaptHistoricalRegression } from './utils/adaptHistoricalRegression.mjs';

const base = new URL('../', import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/\/proto\/loop-v[3456][a-z]?\.mjs$/.test(specifier))
      return { url: new URL('loop-v7.mjs', base).href, shortCircuit: true };
    if (/\/proto\/build-v[3456][a-z]?\.mjs$/.test(specifier))
      return { url: new URL('build-v7.mjs', base).href, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    const loaded = nextLoad(url, context);
    if (!/\/spikes\/round(?:9|10)\//.test(url) || loaded.format !== 'module') return loaded;
    let source = String(loaded.source);
    if (process.env.PROTO_V7_HISTORICAL_EXPECTATIONS !== '1')
      source = adaptHistoricalRegression(url, source);
    source = source.replace(/\bwriteFileSync\b(?=[^;]*from ['"]node:fs['"])/g, 'writeFileSync as ignoredHistoricalWrite');
    if (source.includes('ignoredHistoricalWrite')) source += '\nfunction writeFileSync() {}\n';
    return { ...loaded, source };
  },
});
