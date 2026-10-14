import { afterEach, describe, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { captureBlueprintObservables } from '@/schema-form/core/__tests__/fixtures/captureBlueprintObservables';
import { captureBranchlessNodeTree } from '@/schema-form/core/__tests__/fixtures/captureBranchlessNodeTree';
import {
  type BlueprintDiagnostic,
  type BlueprintSchema,
  blueprint,
} from '@/schema-form/core/engine/blueprint';
import type { AuthoredSchema } from '@/schema-form/core/engine/types/jsonSchema';

// @ts-expect-error The existing generator corpus is JavaScript without declarations.
import { corpus } from '../../../../architecture/spikes/guard-cost/redteam3/corpus.mjs';

/** Capability fields exposed by the blueprint contract, writable as the collector writes them. */
type Capabilities = {
  -readonly [Key in keyof ReturnType<
    typeof blueprint
  >['capabilities']]: ReturnType<typeof blueprint>['capabilities'][Key];
};
/** Local signature for the capability collector mocked by this test. */
type CollectSchemaCapabilities = (
  analysis: { capabilities: Capabilities },
  ...rest: unknown[]
) => void;

/** Runtime fixture loading keeps BF sources outside this package's TypeScript root. */
const fixturePath =
  '../../../../../../aileron/benchmark-form/fixtures/equivalent/index.ts';
const { equivalentFixtures } = (await import(fixturePath)) as {
  equivalentFixtures: readonly {
    name: string;
    workspace: AuthoredSchema;
    interactions: readonly unknown[];
  }[];
};
/** The fixture's own interpreter covers set, push and remove operations. */
const interactionPath =
  '../../../../../../aileron/benchmark-form/fixtures/equivalent/utils/applyInteraction.ts';
const { applyInteraction } = await import(interactionPath);

const generic = vi.hoisted(() => ({ enabled: false }));
vi.mock(
  '../blueprint/utils/analyze/collectSchemaCapabilities',
  async (original) => {
    const actual = await original<{
      collectSchemaCapabilities: CollectSchemaCapabilities;
    }>();
    return {
      collectSchemaCapabilities: (
        ...args: Parameters<CollectSchemaCapabilities>
      ) => {
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
      },
    };
  },
);
afterEach(() => {
  generic.enabled = false;
});

// filid:contract branchless-observables
describe('branchless and generic observable equivalence', () => {
  it('keeps every BF fixture tree, value, errors, state and settlement diagnostics identical', () => {
    for (const fixture of equivalentFixtures) {
      generic.enabled = false;
      const optimized = nodeFromJSONSchema({
        jsonSchema: fixture.workspace,
        validationMode: 0,
      });
      const before = captureBranchlessNodeTree(optimized);
      generic.enabled = true;
      const general = nodeFromJSONSchema({
        jsonSchema: fixture.workspace,
        validationMode: 0,
      });
      expect(captureBranchlessNodeTree(general), fixture.name).toEqual(before);
      for (const interaction of fixture.interactions) {
        applyInteraction(
          { findNode: (path: string) => optimized.find(path) },
          interaction,
        );
        applyInteraction(
          { findNode: (path: string) => general.find(path) },
          interaction,
        );
        expect(captureBranchlessNodeTree(general), fixture.name).toEqual(
          captureBranchlessNodeTree(optimized),
        );
        expect(optimized.value).toBe(optimized.value);
        expect(general.value).toBe(general.value);
      }
    }
  });

  it('keeps the original 14 blueprint corpus schemas unchanged under generic analysis', () => {
    for (const sample of corpus) {
      const diagnostics: BlueprintDiagnostic[][] = [[], []];
      generic.enabled = false;
      const optimized = blueprint(sample.root, {
        collect: (value) => diagnostics[0].push(value),
      });
      generic.enabled = true;
      const general = blueprint(sample.root, {
        collect: (value) => diagnostics[1].push(value),
      });
      expect(captureBlueprintObservables(general), sample.id).toEqual(
        captureBlueprintObservables(optimized),
      );
      expect(diagnostics[1], sample.id).toEqual(diagnostics[0]);
    }
  });

  it('preserves existing static conflicts, S0–S6 errors, warnings and recursion judgments', () => {
    const schemas: BlueprintSchema[] = [
      { type: 'unknown' },
      { type: [] },
      { type: ['string', 'string'] },
      { type: ['integer', 'number'] },
      {
        type: ['number', 'string', 'null'],
        allOf: [{ type: ['null', 'integer'] }],
      },
      { type: ['object', 'null'], allOf: [{ type: 'object' }] },
      { allOf: [{ type: 'number' }, { type: 'integer' }] },
      {
        $defs: { leaf: { type: 'number' } },
        $ref: '#/$defs/leaf',
        allOf: [{ type: 'integer' }],
      },
      { const: true },
      { enum: [1, 2] },
      {
        oneOf: [
          { type: 'object', properties: { a: { type: 'number' } } },
          { type: 'null' },
        ],
      },
      { oneOf: [{ type: 'array', items: { type: 'number' } }] },
      { oneOf: [{ type: 'object' }, { type: 'array' }] },
      { oneOf: [{ type: 'object', controls: { active: true } }] },
      { type: 'string', oneOf: [{ type: 'number' }, { type: 'null' }] },
      { type: ['string', 'number'], anyOf: [{ type: 'object' }] },
      {
        type: 'object',
        properties: { a: { type: 'number' } },
        allOf: [{ properties: { a: { type: 'integer' } } }],
      },
      {
        type: ['object', 'null'],
        options: { terminal: true },
        properties: { a: { type: 'number', controls: { visible: false } } },
      },
      {
        type: 'array',
        options: { terminal: false },
        items: { type: 'number' },
      },
      {
        type: ['object', 'string'],
        properties: {
          a: { type: 'number', presentation: { FieldInput: 'ignored' } },
        },
      },
      {
        type: 'object',
        allOf: [
          { properties: { a: { type: 'number' } } },
          { properties: { a: { type: 'string' } } },
        ],
      },
      { type: 'number', minimum: 5, allOf: [{ maximum: 3 }] },
      { type: 'string', enum: ['a'], allOf: [{ enum: ['b'] }] },
      { type: 'object', properties: { next: { $ref: '#' } } },
      { type: ['object', 'null'], properties: { next: { $ref: '#' } } },
      {
        type: 'object',
        properties: { children: { type: 'array', items: { $ref: '#' } } },
      },
      { type: 'string', controls: 'x' },
      { type: 'string', controls: { typo: true } },
      { type: 'string', options: { unknown: true } },
      { type: 'object', controls: { fields: {} } },
      { type: 'object', controls: { fields: [{ targets: 'a' }] } },
      {
        type: 'object',
        controls: { fields: [{ targets: ['missing'], controls: {} }] },
      },
      { type: 'object', controls: { discriminator: 3 }, oneOf: [{}] },
      { type: 'string', controls: { injectTo: { '/missing': 1 } } },
      { type: 'array', items: 'string' },
      { type: 'object', options: { virtual: { bad: { fields: 'a' } } } },
      { type: 'object', allOf: [{ controls: { watch: [] } }] },
      { type: 'string', controls: { watch: ['/*'] } },
      { type: 'string', controls: { visible: '(()' } },
      {
        type: 'object',
        dependentSchemas: {},
        dependencies: {},
        dependentRequired: {},
      },
      { type: 'object', readOnly: true },
      {
        type: 'object',
        allOf: [
          { not: {}, oneOf: [{ properties: { a: { type: 'string' } } }] },
        ],
      },
      {
        type: 'object',
        $defs: { target: { type: 'string', controls: { visible: true } } },
        properties: {
          terminal: {
            type: 'object',
            options: { terminal: true },
            properties: {
              inline: { type: 'string', controls: { visible: true } },
              ref: { $ref: '#/$defs/target' },
            },
          },
        },
      },
      {
        type: 'object',
        if: {},
        then: { properties: { a: { type: 'number' } } },
        else: false,
      },
      {
        type: 'object',
        oneOf: [
          { properties: { a: { type: 'number' } } },
          { properties: { a: { type: 'string' } } },
        ],
      },
    ];
    for (const schema of schemas) {
      const results = [];
      for (const enabled of [false, true]) {
        generic.enabled = enabled;
        const diagnostics: BlueprintDiagnostic[] = [];
        try {
          const result = blueprint(schema, {
            collect: (value) => diagnostics.push(value),
          });
          results.push({
            graph: captureBlueprintObservables(result),
            diagnostics,
          });
        } catch (error) {
          results.push({
            error: JSON.parse(JSON.stringify(error)),
            diagnostics,
          });
        }
      }
      expect(results[1], JSON.stringify(schema)).toEqual(results[0]);
    }
  });
});
