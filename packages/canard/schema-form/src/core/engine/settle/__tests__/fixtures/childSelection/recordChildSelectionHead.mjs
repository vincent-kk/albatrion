// CLI-only recorder: run with `yarn --cwd packages/canard/schema-form node --import tsx <this file>`.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Immutable baseline revision; candidate sources must never supply observations. */
const HEAD = '3a637c4cd9679924063393cce5e7c59233bd8bef';
/** Recorder location also owns the generated fixture. */
const directory = dirname(fileURLToPath(import.meta.url));
/** Source package used to resolve the repository and corpus. */
const packageRoot = resolve(directory, '../../../../../../..');
/** Repository whose object store must contain the exact baseline commit. */
const worktree = resolve(packageRoot, '../../..');
/** Full resolved revision, checked before loading the runtime builder. */
const head = execFileSync(
  'git',
  ['rev-parse', '--verify', `${HEAD}^{commit}`],
  {
    cwd: worktree,
    encoding: 'utf8',
    timeout: 10000,
  },
).trim();
assert.equal(head, HEAD);
/** Canonical fixture is immutable; remove it explicitly before deliberate regeneration. */
const output = resolve(directory, 'childSelectionHead.json');
assert(!existsSync(output), 'HEAD fixture is immutable after generation');
/** TypeScript helpers are loaded by the tsx CLI import hook. */
const { buildChildSelectionRuntime } = await import(
  './buildChildSelectionRuntime.ts'
);
/** Same fixed-width schemas consumed by the differential test. */
const { createFixedBranchSchema } = await import(
  './createFixedBranchSchema.ts'
);
/** Stable authored corpus shared with the blueprint characterization. */
const source = JSON.parse(
  readFileSync(
    resolve(
      packageRoot,
      'src/core/engine/__tests__/fixtures/ownedInlineHead.json',
    ),
    'utf8',
  ),
);
/** Only the pinned source variant is built by this recorder. */
const runtime = await buildChildSelectionRuntime(HEAD);
/** Raw normalized corpus observations, before any assertion transformations. */
const corpus = [];
for (const sample of source.cases) {
  for (const allListeners of [false, true]) {
    const fixture = {
      label: sample.label,
      schema: sample.schema,
      input: undefined,
      writes: [
        { path: '', value: {} },
        { path: '', value: null },
        { path: '', value: undefined },
      ],
      allListeners,
    };
    corpus.push({
      label: sample.label,
      allListeners,
      observation: runtime.run(structuredClone(fixture)),
    });
  }
}
/** Fixed-branch comparisons discard only points, matching the test's contract. */
const oneOf = [];
for (const count of [5, 10, 20, 40]) {
  const fixture = {
    label: `oneOf-${count}`,
    schema: createFixedBranchSchema(count),
    input: { kind: 'kind_0' },
    allListeners: true,
    writes: ['kind_4', 'kind_0', 'kind_4', 'kind_0'].map((value) => ({
      path: '/kind',
      value,
    })),
  };
  const { points: _points, ...observation } = runtime.run(
    structuredClone(fixture),
  );
  oneOf.push({ count, observation });
}
/** Raw publication and failure observations for every authored guard mode. */
const ifThen = [];
for (const disabled of [false, true]) {
  for (const guardMode of [undefined, 'normal', 'throw', 'promise']) {
    for (const nested of [false, true]) {
      const host = {
        type: 'object',
        properties: { kind: { type: 'string' } },
        if: { properties: { kind: { const: 'on' } }, required: ['kind'] },
        then: { properties: { detail: { type: 'string', default: 'shown' } } },
        else: { properties: { fallback: { type: 'number', default: 7 } } },
      };
      const fixture = {
        label: `if-then; ${guardMode}; nested=${nested}`,
        guardMode,
        disableAutomaticWrites: disabled,
        allListeners: true,
        schema: nested
          ? { type: 'object', properties: { 'a/b~c': host } }
          : host,
        input: nested ? { 'a/b~c': { kind: 'off' } } : { kind: 'off' },
        writes: ['on', 'off', 'on'].map((kind) => ({
          path: nested ? '/a~1b~0c/kind' : '/kind',
          value: kind,
        })),
      };
      ifThen.push({
        disabled,
        guardMode: guardMode ?? null,
        nested,
        observation: runtime.run(structuredClone(fixture)),
      });
    }
  }
}
/** Compact serialization preserves every normalized field the assertions consume. */
const text = JSON.stringify({ head, corpus, oneOf, ifThen }) + '\n';
writeFileSync(output, text, { flag: 'wx' });
console.log(
  JSON.stringify({
    head,
    corpus: corpus.length,
    oneOf: oneOf.length,
    ifThen: ifThen.length,
    bytes: Buffer.byteLength(text),
    sha256: createHash('sha256').update(text).digest('hex'),
    output,
  }),
);
