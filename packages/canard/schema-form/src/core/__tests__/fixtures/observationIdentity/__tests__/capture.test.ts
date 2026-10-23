// Loaded by Vitest; OBSERVATION_LEGACY=1 replays actual collector defects.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rolldown } from 'rolldown';
import { beforeAll, describe, expect, it } from 'vitest';

import { ObservationCodec } from '../../itemlessDeclarations/codec';
import { createStrictItemlessObserver } from '../../itemlessDeclarations/observe';
import {
  assertRuleIndexes,
  createRuleTargetIdentity,
} from '../../itemlessDeclarations/ruleTargetIdentity';
import { makeItemlessScene } from '../../itemlessDeclarations/scenes';
import type { TestPublicFieldNode } from '../../testFieldNode';
import { captureObservationState } from '../capture';
import type { ObservationEngine } from '../capture';

const core = fileURLToPath(new URL('../../../../', import.meta.url));
const packageRoot = path.resolve(core, '../..');
const producer = path.join(
  core,
  'engine/derive/utils/rules/getDeriveRuleKey.ts',
);
const require = createRequire(import.meta.url);
let engine: ObservationEngine & {
  __readExistingRuleOwnerId: (node: object) => number | undefined;
  observeArraySelection: (node: TestPublicFieldNode) => unknown;
  observeArraySettlement: (node: TestPublicFieldNode) => unknown;
};

/** Actual legacy collectors are loaded with the explicit private engine entry, without product exports. */
const observeArraySelection = (node: TestPublicFieldNode) =>
  engine.observeArraySelection(node);
const observeArraySettlement = (node: TestPublicFieldNode) =>
  engine.observeArraySettlement(node);

beforeAll(async () => {
  const graph: { id: string; imports: string[] }[] = [];
  const virtual = '\0observation-test-engine';
  const entry = [
    'export {buildFieldNodeTree,mountFieldNode} from ' +
      JSON.stringify(path.join(core, 'surface/index.ts')) +
      ';',
    'export {dispatchSetValue,dispatchPush,dispatchInsert,dispatchRemove,dispatchPop,dispatchClear,dispatchUpdate,dispatchBatch,subscribeFieldNode} from ' +
      JSON.stringify(path.join(core, 'engine/write/index.ts')) +
      ';',
    'export {getItemEntries} from ' +
      JSON.stringify(path.join(core, 'engine/blueprint/index.ts')) +
      ';',
    'export {__readExistingRuleOwnerId} from ' + JSON.stringify(producer) + ';',
    'export {observeArraySelection} from ' +
      JSON.stringify(
        path.join(
          core,
          'engine/settle/__tests__/fixtures/observeArraySelection.ts',
        ),
      ) +
      ';',
    'export {observeArraySettlement} from ' +
      JSON.stringify(
        path.join(
          core,
          'engine/settle/__tests__/fixtures/observeArraySettlement.ts',
        ),
      ) +
      ';',
  ].join('\n');
  const bundle = await rolldown({
    input: virtual,
    platform: 'node',
    tsconfig: path.join(packageRoot, 'tsconfig.json'),
    external: (id) =>
      !id.startsWith('@/') &&
      !id.startsWith('.') &&
      !path.isAbsolute(id) &&
      id !== virtual,
    plugins: [
      {
        name: 'test-only-readonly-owner',
        resolveId(id) {
          if (id === virtual) return virtual;
          return undefined;
        },
        load(id) {
          if (id === virtual) return entry;
          if (id === producer)
            return (
              fs.readFileSync(id, 'utf8') +
              '\nexport const __readExistingRuleOwnerId = (node: object) => TARGET_IDS.get(node);\n'
            );
          return undefined;
        },
        buildEnd() {
          for (const id of this.getModuleIds())
            graph.push({
              id,
              imports: [...(this.getModuleInfo(id)?.importedIds ?? [])],
            });
        },
      },
    ],
  });
  const output = await bundle.generate({
    format: 'cjs',
    exports: 'named',
    codeSplitting: false,
  });
  await bundle.close();
  const chunk = output.output[0];
  if (chunk.type !== 'chunk') throw new Error('Missing test engine chunk');
  const legacy = ['observeArraySelection', 'observeArraySettlement'].map(
    (name) => path.join(core, 'engine/settle/__tests__/fixtures', name + '.ts'),
  );
  for (const file of [producer, ...legacy]) {
    expect(graph.filter((module) => module.id === file)).toHaveLength(1);
    expect(graph.find((module) => module.id === virtual)!.imports).toContain(
      file,
    );
  }
  console.info(
    'OBSERVATION_TEST_MODULE_PROVENANCE',
    JSON.stringify({
      inputs: [producer, ...legacy].map((file) => ({
        path: file,
        sha256: createHash('sha256')
          .update(fs.readFileSync(file))
          .digest('hex'),
      })),
      entryEdges: graph.find((module) => module.id === virtual)!.imports,
      compiledSHA256: createHash('sha256').update(chunk.code).digest('hex'),
    }),
  );
  const compiled = { exports: {} };
  const execute = new Function('module', 'exports', 'require', chunk.code);
  execute(compiled, compiled.exports, require);
  engine = compiled.exports as typeof engine;
});

/** Build an actual same-module source-owner/injection-destination graph. */
function form() {
  const root = engine.buildFieldNodeTree({
    jsonSchema: {
      type: 'object',
      properties: {
        source: {
          type: 'number',
          controls: { injectTo: (value: unknown) => ({ '../target': value }) },
        },
        target: { type: 'number' },
      },
    },
    defaultValue: { source: 1, target: 0 },
  });
  engine.mountFieldNode(root);
  return root;
}

/** Bind actual known occurrences to this capture's codec and engine reader. */
function context(root: TestPublicFieldNode) {
  const known = [root, ...root.children!] as TestPublicFieldNode[];
  const codec = new ObservationCodec();
  known.forEach((node, index) => codec.nodes.set(node, index + 1));
  const capture = () =>
    captureObservationState(
      root,
      known,
      codec,
      engine.__readExistingRuleOwnerId,
    );
  return { known, codec, capture };
}

describe('complete observation oracle regression record', () => {
  it.each(['rules', 'ruleSources', 'ruleTargets'] as const)(
    'preserves actual %s omitted by the legacy selection collector',
    (channel) => {
      const root = form(),
        c = context(root);
      const complete = observeArraySettlement(root) as Record<
        string,
        unknown[]
      >;
      const selected = observeArraySelection(root) as Record<string, unknown[]>;
      expect(complete[channel].length).toBeGreaterThan(0);
      if (process.env.OBSERVATION_LEGACY === '1')
        expect(selected[channel]).toEqual(complete[channel]);
      const before = c.capture()[channel];
      const [key] = [...root.runtime.committedRuleValues!][0];
      root.runtime.committedRuleValues!.set(key, 999);
      if (channel === 'ruleSources')
        root.runtime.committedRuleKeysBySource!.clear();
      if (channel === 'ruleTargets')
        root.runtime.committedRuleKeysByTarget!.clear();
      expect(observeArraySelection(root)).toEqual(selected);
      if (channel === 'rules') expect(c.capture()[channel]).not.toEqual(before);
      else expect(c.capture).toThrow(/membership/);
    },
  );
  it('compares identical concrete graphs despite natural producer offsets', () => {
    const first = form(),
      second = form();
    expect(observeArraySettlement(first)).not.toEqual(
      observeArraySettlement(second),
    );
    if (process.env.OBSERVATION_LEGACY === '1')
      expect(observeArraySettlement(first)).toEqual(
        observeArraySettlement(second),
      );
    expect(context(first).capture()).toEqual(context(second).capture());
  });
  it('rejects an unknown actual runtime owner instead of dropping its stores', () => {
    const root = form(),
      runtime = root.runtime;
    const [key, value] = [...runtime.committedRuleValues!][0];
    const parts = JSON.parse(key);
    parts[7] = 900000000;
    const invalid = JSON.stringify(parts);
    runtime.committedRuleValues!.delete(key);
    runtime.committedRuleValues!.set(invalid, value);
    for (const keys of runtime.committedRuleKeysBySource!.values())
      if (keys.delete(key)) keys.add(invalid);
    for (const keys of runtime.committedRuleKeysByTarget!.values())
      if (keys.delete(key)) keys.add(invalid);
    if (process.env.OBSERVATION_LEGACY === '1')
      expect(() => observeArraySelection(root)).toThrow();
    expect(context(root).capture).toThrow(/owner/);
  });
  it('accepts absent optional stores and rejects missing actual rule indexes', () => {
    expect(() =>
      assertRuleIndexes(undefined, undefined, undefined),
    ).not.toThrow();
    expect(() =>
      assertRuleIndexes(
        form().runtime.committedRuleValues,
        undefined,
        undefined,
      ),
    ).toThrow(/membership/);
  });
  it.each([
    '[]',
    '["", "object", 1]',
    '["", "object", 1, "/x", null]',
    '["", "object", 1, "/x", null, "/a", "number", 0]',
  ])('rejects unsupported collector key domain %s', (key) => {
    expect(() =>
      assertRuleIndexes(new Map([[key, 1]]), undefined, undefined),
    ).toThrow(/shape|domain/);
  });
  it('rejects current detached attachment while retaining the recorded historical occurrence', () => {
    const root = form(),
      c = context(root);
    const [key] = [...root.runtime.committedRuleValues!][0];
    const owner = c.known.find(
      (node) => engine.__readExistingRuleOwnerId(node) === JSON.parse(key)[7],
    )!;
    const normalize = createRuleTargetIdentity(
      () => c.known,
      engine.__readExistingRuleOwnerId,
      c.codec.nodes,
    );
    const before = normalize(key);
    owner.detached = true;
    expect(normalize(key)).toBe(before);
    expect(c.capture).toThrow(/attachment/);
  });
  it('collects nineteen state and nine history channels with the actual original58 wrapper', () => {
    const observe = createStrictItemlessObserver(
      engine,
      engine.__readExistingRuleOwnerId,
    );
    const first = observe(makeItemlessScene('derive-inject-target'), undefined);
    expect(first.phase).toBe('completed');
    expect(Object.keys(first.observation!)).toHaveLength(28);
    expect(first).toEqual(
      observe(makeItemlessScene('derive-inject-target'), undefined),
    );
    expect(first.observation!.listenerHistory).not.toEqual([]);
  });
});
