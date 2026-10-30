// Loaded by Vitest; beforeAll builds one source graph with its readonly rule-owner reader.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rolldown } from 'rolldown';
import { beforeAll, expect } from 'vitest';

import { createTestValidator } from '../../../__tests__/fixtures/createTestValidator';
import { assertObservationEqual } from '../../../__tests__/fixtures/itemlessDeclarations/codec';
import { runItemlessScene } from '../../../__tests__/fixtures/itemlessDeclarations/observe';
import type { ItemlessEngine } from '../../../__tests__/fixtures/itemlessDeclarations/observe';
import { makeItemlessScene } from '../../../__tests__/fixtures/itemlessDeclarations/scenes';

const core = fileURLToPath(new URL('../../../', import.meta.url));
const packageRoot = path.resolve(core, '../..');
const producer = path.join(
  core,
  'engine/derive/utils/rules/getDeriveRuleKey.ts',
);
const require = createRequire(import.meta.url);
let sourceEngine: ItemlessEngine;

beforeAll(async () => {
  const graph: { id: string; imports: string[] }[] = [];
  const virtual = '\0itemless-declaration-source-engine';
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
        name: 'itemless-test-only-readonly-owner',
        resolveId(id) {
          if (id === virtual) return virtual;
          return undefined;
        },
        load(id) {
          if (id === virtual) return entry;
          if (id === producer)
            return (
              fs.readFileSync(id, 'utf8') +
              '\nexport const __readExistingRuleOwnerId = (node: object) => node.runtime.deriveTargetIds?.get(node);\n'
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
  expect(graph.filter((module) => module.id === producer)).toHaveLength(1);
  expect(graph.find((module) => module.id === virtual)!.imports).toContain(
    producer,
  );
  console.info(
    'ITEMLESS_SOURCE_TEST_MODULE_PROVENANCE',
    JSON.stringify({
      inputs: [producer].map((file) => ({
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
  sourceEngine = compiled.exports as ItemlessEngine;
});

/** Exercise caller/retention assertions and reproducible complete histories on independently compiled forms. */
export function checkSourceScene(id: string): void {
  const first = runItemlessScene(
    sourceEngine,
    makeItemlessScene(id),
    createTestValidator(),
  );
  const second = runItemlessScene(
    sourceEngine,
    makeItemlessScene(id),
    createTestValidator(),
  );
  assertObservationEqual(first, second, id + '/fresh source history');
  if (first.phase !== 'completed') {
    if (
      ![
        'boolean-items-true',
        'boolean-items-false',
        'empty-tuple',
        'additional-boolean-no-items',
        'legacy-tuple-additional',
        'recursive-items',
      ].includes(id)
    )
      throw new Error(
        'Unexpected compile rejection: ' +
          id +
          ' ' +
          JSON.stringify(first.error),
      );
    return;
  }
  if (
    !first.observation?.callerOwnershipChecks ||
    !first.observation.listenerHistory
  )
    throw new Error('Missing real caller/event observations: ' + id);
}
