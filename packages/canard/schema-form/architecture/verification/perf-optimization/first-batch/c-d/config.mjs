// Imported by the C/D runners, classifier, summarizer and guards for measurement paths and pinned identities.
// Scratch-only configuration; every generated path is rooted beside this file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
export const SC = path.dirname(fileURLToPath(import.meta.url));
export const W = process.env.MEASURE_WORKTREE ?? path.resolve(SC, '../../../../../../../..');
export const P = path.join(W, 'packages/canard/schema-form');
export const NODE = process.env.NODE_BIN ?? 'node';
export const sourcePaths = { current: path.join(P, 'dist/index.mjs'), legacy: path.join(W, 'node_modules/@canard/schema-form_0.16.1/dist/index.mjs') };
export const expected = { current: 'e27de23ccc14a8bf9c91e49007ee0f1751c2b7ccc53cf0924f07ae2c4a29040a', legacy: '5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46' };
export const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export const runtime = () => ({ name: typeof Bun === 'undefined' ? 'node' : 'bun', version: typeof Bun === 'undefined' ? process.version : Bun.version, node: process.version, arch: process.arch, v8PointerCompression:process.config?.variables?.v8_enable_pointer_compression??null });
export const outputPath = name => {
  const result = path.resolve(SC, name);
  if (!result.startsWith(SC + path.sep)) throw new Error('Output escapes SC: ' + name);
  return result;
};
export const save = (name, data) => { const target = outputPath(name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, data); };
export const option = (key, fallback) => process.argv.find(arg => arg.startsWith('--' + key + '='))?.slice(key.length + 3) ?? fallback;
export const reverse = values => process.argv.includes('--reverse') ? [...values].reverse() : values;
export const settings = instrumented => {
  const smoke = process.argv.includes('--smoke');
  const warmups = Number(option('warmups', smoke ? 2 : 20)), samples = Number(option('samples', smoke ? 3 : instrumented ? 40 : 100));
  if (!Number.isInteger(warmups) || warmups < 0 || !Number.isInteger(samples) || samples < 1) throw new Error('Invalid sample counts');
  return { smoke, warmups, samples };
};
export const median = values => { const sorted = [...values].sort((a,b) => a-b), mid = (sorted.length-1)/2; return sorted.length ? (sorted[Math.floor(mid)] + sorted[Math.ceil(mid)])/2 : null; };
export const identity = bundle => ({ bundle, sha256: sha(fs.readFileSync(outputPath(bundle))) });
export const json = value => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? String(v) : v);
