// Loaded with Node --import only by failure-path tests; mode selects the injected faulty input.
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

const mode = process.env.BENCHMARK_FAILURE;
if (mode === 'leak') {
  let heapUsed = 0;
  process.memoryUsage = () => ({ heapUsed: (heapUsed += 1024 * 1024) });
}

registerHooks({
  load(url, context, nextLoad) {
    if (mode === 'slow' && url.endsWith('/compare/measurePair.mjs'))
      return {
        format: 'module',
        shortCircuit: true,
        source:
          'export async function measurePair() { return { baselineMs: 1, currentMs: 2, iterations: 1, rounds: 31 }; }',
      };
    if (mode === 'verify' && url.endsWith('/benchmark/_lib.mjs')) {
      const source = readFileSync(new URL(url), 'utf8');
      const original = 'JSONSchemaScanner: sync.JSONSchemaScanner,';
      if (!source.includes(original))
        throw new Error('Scanner injection target missing');
      return {
        format: 'module',
        shortCircuit: true,
        source: source.replace(
          original,
          'JSONSchemaScanner: class extends sync.JSONSchemaScanner { getValue() { return undefined; } },',
        ),
      };
    }
    if (process.env.BENCHMARK_PRE_FIX && /\/(verify|memleak)\.mjs$/.test(url)) {
      const source = readFileSync(new URL(url), 'utf8');
      return {
        format: 'module',
        shortCircuit: true,
        source: source
          .replace(
            'process.exit(failed.length > 0 ? 1 : 0);',
            'process.exit(0);',
          )
          .replace('process.exit(anyLeak ? 1 : 0);', 'process.exit(0);'),
      };
    }
    return nextLoad(url, context);
  },
});
