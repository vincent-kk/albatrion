// Registered by failureLoader.mjs through module.register; runs on Node's loader thread.
import { readFileSync } from 'node:fs';

const mode = process.env.BENCHMARK_FAILURE;

/**
 * Replace the module a failure-path test targets with a faulty version.
 * @param url Resolved module URL being loaded.
 * @param context Loader context passed through to the next hook.
 * @param nextLoad Default loader, used for every module the mode does not target.
 * @returns The substituted module source, or the default load result.
 * @throws When the scanner injection target is missing from `_lib.mjs`.
 */
export async function load(url, context, nextLoad) {
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
        .replace('process.exit(failed.length > 0 ? 1 : 0);', 'process.exit(0);')
        .replace('process.exit(anyLeak ? 1 : 0);', 'process.exit(0);'),
    };
  }
  return nextLoad(url, context);
}
