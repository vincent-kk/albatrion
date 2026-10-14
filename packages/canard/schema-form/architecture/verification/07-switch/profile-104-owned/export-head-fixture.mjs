// CLI-only generator; refuses a changed product tree and exits after synchronous esbuild.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const repo = path.resolve(pkg, '../../..');
const require = createRequire(path.join(repo, 'package.json'));
process.env.NODE_PATH = path.join(repo, 'node_modules');
require('node:module').Module._initPaths();
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const head = execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
assert(head.startsWith('baf4cacb6'));
assert.equal(execFileSync('git', ['diff', '--name-only', '--', 'packages/canard/schema-form/src/core/blueprint'], { cwd: repo, encoding: 'utf8' }).trim(), '');
const fixtures = path.join(pkg, 'src/core/blueprint/__tests__/fixtures');
const source = JSON.parse(fs.readFileSync(path.join(fixtures, 'coldBindingHead.json'), 'utf8'));
const entry = path.join(bundles, 'owned104-head-fixture.cjs');
require('esbuild').buildSync({ entryPoints: [path.join(fixtures, 'captureOwnedInlineObservables.ts')], outfile: entry,
  bundle: true, platform: 'node', format: 'cjs', packages: 'external',
  alias: { '@/schema-form': path.join(pkg, 'src') },
  define: { 'process.env.NODE_ENV': '"development"' } });
const { captureOwnedInlineObservables } = require(entry);
const cases = source.cases.map(sample => ({ label: sample.label, schema: sample.schema,
  captures: [false, true].map(collect => captureOwnedInlineObservables(structuredClone(sample.schema), collect)) }));
const value = { head, canonicalHead: source.head, corpus: source.corpus, edges: source.edges, cases };
const text = JSON.stringify(value, null, 2) + '\n';
assert(Buffer.byteLength(text) < 5_000_000);
const output = path.join(fixtures, 'ownedInlineHead.json');
assert(!fs.existsSync(output), 'HEAD fixture is immutable after generation');
fs.writeFileSync(output, text);
console.log(JSON.stringify({ head, captures: cases.length * 2, bytes: Buffer.byteLength(text),
  sha256: createHash('sha256').update(text).digest('hex'), output }));
