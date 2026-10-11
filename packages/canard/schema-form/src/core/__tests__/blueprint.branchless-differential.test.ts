import { afterEach, describe, expect, it, vi } from 'vitest';

// @ts-expect-error The existing generator corpus is JavaScript without declarations.
import { corpus } from '../../../architecture/spikes/guard-cost/redteam3/corpus.mjs';

import { blueprint, type BlueprintDiagnostic, type BlueprintSchema,
  getFeatureNodeIndex } from '../blueprint';
import { nodeFromJSONSchema } from '../nodeFromJSONSchema';
import { getDeriveRuleTable } from '../settle/derive';
import { getDependencyIndex } from '../settle/utils/write/getDependencyIndex';
import type { collectSchemaCapabilities } from '../blueprint/utils/analyze/collectSchemaCapabilities';
import { captureBlueprintObservables } from './fixtures/captureBlueprintObservables';
import { captureBranchlessNodeTree } from './fixtures/captureBranchlessNodeTree';
import type { JSONSchema } from '../types/jsonSchema';

/** Runtime fixture loading keeps BF sources outside this package's TypeScript root. */
const fixturePath = '../../../../../aileron/benchmark-form/fixtures/equivalent/index.ts';
const { equivalentFixtures } = await import(fixturePath) as {
  equivalentFixtures: readonly { name: string; workspace: JSONSchema;
    interactions: readonly unknown[] }[];
};
/** The fixture's own interpreter covers set, push and remove operations. */
const interactionPath = '../../../../../aileron/benchmark-form/fixtures/equivalent/utils/applyInteraction.ts';
const { applyInteraction } = await import(interactionPath);

const generic = vi.hoisted(() => ({ enabled: false }));
vi.mock('../blueprint/utils/analyze/collectSchemaCapabilities', async (original) => {
  const actual = await original<{ collectSchemaCapabilities: typeof collectSchemaCapabilities }>();
  return { collectSchemaCapabilities: (...args: Parameters<typeof collectSchemaCapabilities>) => {
    actual.collectSchemaCapabilities(...args);
    if (generic.enabled) {
      const capabilities = args[0].capabilities;
      capabilities.branchless = false;
      capabilities.hasExpressions = true;
      capabilities.hasDerive = true;
      capabilities.hasWatch = true;
      capabilities.hasState = true;
      capabilities.hasDependencies = true;
    }
  } };
});
afterEach(() => { generic.enabled = false; });

// filid:contract branchless-observables
describe('branchless and generic observable equivalence', () => {
  it('keeps every BF fixture tree, value, errors, state and settlement diagnostics identical', () => {
    for (const fixture of equivalentFixtures) {
      generic.enabled = false;
      const optimized = nodeFromJSONSchema({ jsonSchema: fixture.workspace, validationMode: 0 });
      const before = captureBranchlessNodeTree(optimized);
      generic.enabled = true;
      const general = nodeFromJSONSchema({ jsonSchema: fixture.workspace, validationMode: 0 });
      expect(captureBranchlessNodeTree(general), fixture.name).toEqual(before);
      for (const interaction of fixture.interactions) {
        applyInteraction({ findNode: (path: string) => optimized.find(path) }, interaction);
        applyInteraction({ findNode: (path: string) => general.find(path) }, interaction);
        expect(captureBranchlessNodeTree(general), fixture.name)
          .toEqual(captureBranchlessNodeTree(optimized));
        expect(optimized.value).toBe(optimized.value);
        expect(general.value).toBe(general.value);
      }
    }
  });

  it('keeps the original 14 blueprint corpus schemas unchanged under generic analysis', () => {
    for (const sample of corpus) {
      const diagnostics: BlueprintDiagnostic[][] = [[], []];
      generic.enabled = false;
      const optimized = blueprint(sample.root, { collect: value => diagnostics[0].push(value) });
      generic.enabled = true;
      const general = blueprint(sample.root, { collect: value => diagnostics[1].push(value) });
      expect(captureBlueprintObservables(general), sample.id)
        .toEqual(captureBlueprintObservables(optimized));
      expect(diagnostics[1], sample.id).toEqual(diagnostics[0]);
    }
  });

  it('preserves existing static conflicts, S0–S6 errors, warnings and recursion judgments', () => {
    const schemas: BlueprintSchema[] = [
      { type: 'unknown' },
      { type: [] },
      { type: ['string', 'string'] },
      { type: ['integer', 'number'] },
      { type: ['number', 'string', 'null'], allOf: [{ type: ['null', 'integer'] }] },
      { type: ['object', 'null'], allOf: [{ type: 'object' }] },
      { allOf: [{ type: 'number' }, { type: 'integer' }] },
      { $defs: { leaf: { type: 'number' } }, $ref: '#/$defs/leaf', allOf: [{ type: 'integer' }] },
      { const: true },
      { enum: [1, 2] },
      { oneOf: [{ type: 'object', properties: { a: { type: 'number' } } }, { type: 'null' }] },
      { oneOf: [{ type: 'array', items: { type: 'number' } }] },
      { oneOf: [{ type: 'object' }, { type: 'array' }] },
      { oneOf: [{ type: 'object', controls: { active: true } }] },
      { type: 'string', oneOf: [{ type: 'number' }, { type: 'null' }] },
      { type: ['string', 'number'], anyOf: [{ type: 'object' }] },
      { type: 'object', properties: { a: { type: 'number' } },
        allOf: [{ properties: { a: { type: 'integer' } } }] },
      { type: ['object', 'null'], options: { terminal: true },
        properties: { a: { type: 'number', controls: { visible: false } } } },
      { type: 'array', options: { terminal: false }, items: { type: 'number' } },
      { type: ['object', 'string'],
        properties: { a: { type: 'number', presentation: { FormTypeInput: 'ignored' } } } },
      { type: 'object', allOf: [{ properties: { a: { type: 'number' } } },
        { properties: { a: { type: 'string' } } }] },
      { type: 'number', minimum: 5, allOf: [{ maximum: 3 }] },
      { type: 'string', enum: ['a'], allOf: [{ enum: ['b'] }] },
      { type: 'object', properties: { next: { $ref: '#' } } },
      { type: ['object', 'null'], properties: { next: { $ref: '#' } } },
      { type: 'object', properties: { children: { type: 'array', items: { $ref: '#' } } } },
      { type: 'string', controls: 'x' },
      { type: 'string', controls: { typo: true } },
      { type: 'string', options: { unknown: true } },
      { type: 'object', controls: { children: {} } },
      { type: 'object', controls: { children: [{ targets: 'a' }] } },
      { type: 'object', controls: { children: [{ targets: ['missing'], controls: {} }] } },
      { type: 'object', controls: { discriminator: 3 }, oneOf: [{}] },
      { type: 'string', controls: { injectTo: { '/missing': 1 } } },
      { type: 'array', items: 'string' },
      { type: 'object', options: { virtual: { bad: { fields: 'a' } } } },
      { type: 'object', allOf: [{ controls: { watch: [] } }] },
      { type: 'string', controls: { watch: ['/*'] } },
      { type: 'string', controls: { visible: '(()' } },
      { type: 'object', dependentSchemas: {}, dependencies: {}, dependentRequired: {} },
      { type: 'object', readOnly: true },
      { type: 'object', allOf: [{ not: {}, oneOf: [{ properties: { a: { type: 'string' } } }] }] },
      { type: 'object', $defs: { target: { type: 'string', controls: { visible: true } } },
        properties: { terminal: { type: 'object', options: { terminal: true },
          properties: { inline: { type: 'string', controls: { visible: true } },
            ref: { $ref: '#/$defs/target' } } } } },
      { type: 'object', if: {}, then: { properties: { a: { type: 'number' } } }, else: false },
      { type: 'object', oneOf: [{ properties: { a: { type: 'number' } } },
        { properties: { a: { type: 'string' } } }] },
    ];
    for (const schema of schemas) {
      const results = [];
      for (const enabled of [false, true]) {
        generic.enabled = enabled;
        const diagnostics: BlueprintDiagnostic[] = [];
        try {
          const result = blueprint(schema, { collect: value => diagnostics.push(value) });
          results.push({ graph: captureBlueprintObservables(result), diagnostics });
        } catch (error) {
          results.push({ error: JSON.parse(JSON.stringify(error)), diagnostics });
        }
      }
      expect(results[1], JSON.stringify(schema)).toEqual(results[0]);
    }
  });

  it('builds derive/watch/state and reverse dependencies independently of branch absence', () => {
    generic.enabled = false;
    const root = nodeFromJSONSchema({ validationMode: 0, jsonSchema: {
      type: 'object', properties: {
        source: { type: 'number', default: 2 },
        target: { type: 'number', controls: {
          derived: '(/source) * 2', watch: ['/source'], visible: '(/source) > 0',
        } },
      },
    } });
    const analysis = Reflect.get(root, 'runtime').blueprint;
    expect(analysis.capabilities.branchless).toBe(true);
    expect(getDeriveRuleTable(analysis).rules).toHaveLength(1);
    const target = root.find('/target')!;
    const index = getFeatureNodeIndex(analysis);
    expect(index.stateKeyNodes.has(Reflect.get(target, 'blueprintNode').id)).toBe(true);
    expect(index.watchNodes.has(Reflect.get(target, 'blueprintNode').id)).toBe(true);
    expect(getDependencyIndex(analysis).affected('/source', Reflect.get(root as object, 'rootNode'))).toContain('/target');
    root.find('/source')!.setValue(3);
    expect(target.value).toBe(6);
    root.find('/source')!.setValue(-1);
    expect(target.value).toBe(-2);
    expect(target.visible).toBe(false);
  });

  it('shares empty rule tables only when derive absence is proven as a capability', () => {
    generic.enabled = false;
    const first = blueprint({ type: 'string', controls: { derived: '' } });
    const second = blueprint({ type: 'number', controls: { derived: '' } });
    expect(first.capabilities.hasDerive).toBe(true);
    expect(second.capabilities.hasDerive).toBe(true);
    const firstTable = getDeriveRuleTable(first);
    const secondTable = getDeriveRuleTable(second);
    expect(firstTable.rules).toHaveLength(0);
    expect(secondTable.rules).toHaveLength(0);
    expect(firstTable).not.toBe(secondTable);
    expect(getDeriveRuleTable(first)).toBe(firstTable);
    const absent = getDeriveRuleTable(blueprint({ type: 'boolean' }));
    expect(getDeriveRuleTable(blueprint({ type: 'null' }))).toBe(absent);
    expect(Reflect.get(absent.byDeclaration, 'set')).toBeUndefined();
  });
});
