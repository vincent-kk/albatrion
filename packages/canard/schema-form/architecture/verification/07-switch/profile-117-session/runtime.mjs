// Loaded by the session measurement workers; all evidence is transported to native writes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const directory = path.dirname(fileURLToPath(import.meta.url));
export const pkg = path.resolve(directory, '../../../..');
export const repo = path.resolve(pkg, '../../..');
export const bf = path.join(repo, 'packages/aileron/benchmark-form');
export const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
export const HEAD = '02026967958e29d1735848c39e79f76b94fe61e3';
export const req = createRequire(path.join(pkg, 'package.json'));
export const bfReq = createRequire(path.join(bf, 'package.json'));
export const hash = value => createHash('sha256').update(value).digest('hex');
export const git = args => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args],
  { cwd: repo, encoding: 'utf8', timeout: 10000, maxBuffer: 5_000_000 });
assert.equal(git(['rev-parse', 'HEAD']).trim(), HEAD);
process.env.NODE_ENV = 'production';
const errorText = error => String(error?.message ?? error).replace(/data:text\/javascript;base64,[A-Za-z0-9+/=]+/g, '<session adapter>');
process.on('uncaughtException', error => { console.error(errorText(error)); process.exitCode = 1; });
process.on('unhandledRejection', error => { console.error(errorText(error)); process.exitCode = 1; });
export const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
export const percentile = (values, p) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * p) - 1];
export const canonical = value => JSON.stringify(value, (_key, item) => item && !Array.isArray(item) && typeof item === 'object'
  ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);

/** Emit one bounded artifact for the tool orchestrator's native file write. */
export function emit(name, value) {
  const text = JSON.stringify({ name, value });
  assert(Buffer.byteLength(text) <= 5_000_000);
  console.log('ARTIFACT ' + text);
}

/** Return the unchanged canonical 95C-01 clocks with the requested FIFO pass count. */
export function clocks(passes) {
  const source = fs.readFileSync(path.join(directory, '../tools/measure-verdict-95c01.mjs'), 'utf8');
  const begin = source.indexOf('async function flushMicrotasks(');
  const end = source.indexOf("\nif (process.argv.includes('--self-check'))", begin);
  assert(begin >= 0 && end > begin);
  return new Function('immediate', 'clock', 'round', 'sentinelPasses',
    source.slice(begin, end) + '\nreturn { measure, measureCall, flushMicrotasks };')(
    setImmediate, () => performance.now(), value => Number(value.toFixed(6)), passes);
}

/** Apply a BF interaction through the same node API used by its public handle. */
export function apply(root, interaction) {
  const node = root.find(interaction.path);
  assert(node, interaction.path);
  if (interaction.kind === 'remove') node.remove(interaction.index);
  else if (interaction.kind === 'push') node.push(interaction.value);
  else node.setValue(interaction.value);
}

/** Match the canonical later-update input, retaining authored branch reversals. */
export function later(fixture) {
  const interaction = fixture.interactions[0];
  if (/oneOf|if-then/.test(fixture.name)) return { ...interaction };
  if (Array.isArray(interaction.value)) return { ...interaction,
    value: interaction.value.map((item, index) => index === 0 ? { ...item, name: `${item.name}-later` } : item) };
  return { ...interaction, value: typeof interaction.value === 'string' ? `${interaction.value}-later`
    : typeof interaction.value === 'number' ? interaction.value + 1 : !interaction.value };
}

/** Create the uninstrumented AJV adapter used by the canonical diagnosis harness. */
export function validatorServices() {
  const Ajv = req('ajv/dist/2020').default;
  const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
  const errors = validate => data => validate(data) ? null
    : validate.errors.map(error => ({ ...error, dataPath: error.instancePath }));
  const validator = {
    compile(schema) { return errors(ajv.compile(schema)); },
    compileGuard(schema, pointer) {
      if (!ajv.getSchema('diagnostic-root')) ajv.addSchema(schema, 'diagnostic-root');
      const validate = ajv.compile({ $ref: `diagnostic-root${pointer.startsWith('#') ? pointer : '#' + pointer}` });
      return data => validate(data);
    },
  };
  return { validator, validatorFactory: validator.compile };
}

/** Preserve the repository's deterministic pooled median bootstrap, exposing 99% endpoints. */
export function bootstrap(values, seed = 101, trials = 1999) {
  let state = seed >>> 0;
  const medians = [];
  for (let repeat = 0; repeat < trials; repeat++) {
    const sample = [];
    for (let index = 0; index < values.length; index++) {
      if (trials === 1999) {
        state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
        sample.push(values[(state >>> 0) % values.length]);
      } else {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        sample.push(values[Math.floor(state / 4294967296 * values.length)]);
      }
    }
    medians.push(median(sample));
  }
  const center = median(values), low = percentile(medians, .005), high = percentile(medians, .995);
  return { median: center, low, high, halfWidth: Math.max(center - low, high - center), trials, seed };
}
