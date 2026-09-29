import { describe, expect, it, vi } from 'vitest';

import {
  type BlueprintCacheEntry,
  type BlueprintDiagnostic,
  blueprint,
} from '../index';
import {
  BlueprintErrorCode,
  BlueprintWarningCode,
} from '../utils/diagnostics/constant';

// filid:contract diagnostics
describe('blueprint diagnostic data and late collection', () => {
  it('rejects unknown node, fragment, and children control keys', () => {
    for (const schema of [
      { type: 'string', controls: { typo: true } },
      { type: 'object', allOf: [{ controls: { watch: [] } }] },
      {
        type: 'object',
        controls: {
          children: [{ targets: [], controls: { injectTo: () => ({}) } }],
        },
      },
      { type: 'string', options: { unknown: true } },
    ])
      expect(() => blueprint(schema)).toThrow(
        expect.objectContaining({
          specific: BlueprintErrorCode.UnknownGroupKey,
        }),
      );
  });
  it('accepts function injectTo and rejects a static mapping', () => {
    expect(() =>
      blueprint({
        type: 'string',
        controls: { injectTo: () => ({ '/missing': 1 }) },
      }),
    ).not.toThrow();
    expect(() =>
      blueprint({ type: 'string', controls: { injectTo: { '/missing': 1 } } }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.InvalidControlShape,
      }),
    );
  });
  it('validates children targets after gathering conditional and virtual names', () => {
    expect(() =>
      blueprint({
        type: 'object',
        properties: { a: { type: 'string' } },
        if: {},
        then: { properties: { b: { type: 'string' } } },
        options: { virtual: { pair: { fields: ['a', 'b'] } } },
        controls: {
          children: [
            { targets: ['a', 'b', 'pair'], controls: { visible: true } },
          ],
        },
      }),
    ).not.toThrow();
    expect(() =>
      blueprint({
        type: 'object',
        controls: { children: [{ targets: ['missing'], controls: {} }] },
      }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.ChildrenTargetNotFound,
      }),
    );
  });
  it('rejects children declarations on terminal hosts', () => {
    expect(() =>
      blueprint({
        type: 'object',
        options: { terminal: true },
        properties: { a: { type: 'string' } },
        controls: { children: [{ targets: ['a'], controls: {} }] },
      }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.ChildrenTargetNotFound,
      }),
    );
  });
  it('reports invalid array and virtual declarations with domain codes', () => {
    expect(() => blueprint({ type: 'array', items: 'string' })).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.UnexpectedArraySchema,
      }),
    );
    expect(() =>
      blueprint({
        type: 'object',
        options: { virtual: { bad: { fields: 'a' } } },
      }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.VirtualFieldsNotValid,
      }),
    );
  });
  it('collects errors with authored schema paths before throwing', () => {
    const collect = vi.fn();
    expect(() =>
      blueprint(
        { type: 'object', properties: { a: { type: [] } } },
        { collect },
      ),
    ).toThrow();
    expect(collect).toHaveBeenCalledWith(
      expect.objectContaining({
        code: BlueprintErrorCode.UnknownJsonSchema,
        level: 'error',
        schemaPath: '#/properties/a',
      }),
    );
  });
  it('emits dependency warnings separately from dependentRequired', () => {
    const diagnostics: BlueprintDiagnostic[] = [];
    blueprint(
      {
        type: 'object',
        dependentSchemas: {},
        dependencies: {},
        dependentRequired: {},
      },
      { collect: (diagnostic) => diagnostics.push(diagnostic) },
    );
    expect(diagnostics.map((diagnostic) => diagnostic.details.keyword)).toEqual(
      ['dependentSchemas', 'dependencies'],
    );
    expect(
      diagnostics.every(
        (diagnostic) =>
          diagnostic.code ===
          BlueprintWarningCode.DependentSchemasIgnoredForForm,
      ),
    ).toBe(true);
  });
  it('warns about branch if without false else and ignored null properties', () => {
    const collect = vi.fn();
    blueprint(
      {
        type: 'object',
        oneOf: [
          { if: {}, then: {} },
          { type: 'null', properties: { ignored: { type: 'string' } } },
        ],
      },
      { collect },
    );
    expect(collect).toHaveBeenCalledWith(
      expect.objectContaining({
        code: BlueprintWarningCode.IfWithoutElseFalse,
        schemaPath: '#/oneOf/0',
      }),
    );
    expect(collect).toHaveBeenCalledWith(
      expect.objectContaining({
        code: BlueprintWarningCode.NullBranchIgnoredForForm,
        schemaPath: '#/oneOf/1',
      }),
    );
  });
  it('warns for branch object locks', () => {
    const collect = vi.fn();
    blueprint({ type: 'object', readOnly: true }, { collect });
    expect(collect).toHaveBeenCalledWith(
      expect.objectContaining({
        code: BlueprintWarningCode.LockOnNonTerminalObject,
      }),
    );
  });
  it('inspects terminal inline schema groups without following reference targets or literal data', () => {
    const collect = vi.fn();
    blueprint(
      {
        type: 'object',
        $defs: { target: { type: 'string', controls: { visible: true } } },
        properties: {
          value: {
            type: 'object',
            options: { terminal: true },
            properties: {
              inline: {
                type: 'object',
                controls: { visible: true },
                properties: {
                  deep: {
                    type: 'string',
                    presentation: { FormTypeInput: 'inline' },
                  },
                },
              },
              other: { type: 'string', options: { trim: true } },
              ref: { $ref: '#/$defs/target' },
            },
            default: { controls: true },
          },
        },
      },
      { collect },
    );
    const warnings = collect.mock.calls
      .map(([diagnostic]) => diagnostic)
      .filter(
        (diagnostic) =>
          diagnostic.code ===
          BlueprintWarningCode.TerminalSubtreeKeyIgnoredForForm,
      );
    expect(warnings).toEqual([
      expect.objectContaining({
        schemaPath: '#/properties/value',
        details: {
          keys: ['controls', 'options', 'presentation'],
          paths: [
            '#/properties/value/properties/inline',
            '#/properties/value/properties/inline/properties/deep',
            '#/properties/value/properties/other',
          ],
        },
      }),
    ]);
  });
  it('defers warning scans and collects once when a cached root gains a collector', () => {
    const cache = new WeakMap<object, BlueprintCacheEntry[]>();
    const collect = vi.fn();
    const schema = { type: 'object', dependentSchemas: {} };
    const first = blueprint(schema, { cache });
    expect(cache.get(schema)![0].warningsCollected).toBe(false);
    expect(blueprint(schema, { cache, collect })).toBe(first);
    expect(blueprint(schema, { cache, collect })).toBe(first);
    expect(collect).toHaveBeenCalledTimes(1);
    expect(cache.get(schema)![0].warningsCollected).toBe(true);
  });
  it('separates cached predicate identities', () => {
    const cache = new WeakMap<object, BlueprintCacheEntry[]>();
    const schema = { type: 'object' };
    expect(
      blueprint(schema, { cache, isTerminal: () => true }).root.strategy,
    ).toBe('terminal');
    expect(
      blueprint(schema, { cache, isTerminal: () => false }).root.strategy,
    ).toBe('branch');
  });
  it('warns when tag literals are outside the declared key type', () => {
    const collect = vi.fn();
    blueprint(
      {
        type: 'object',
        controls: { discriminator: 'kind' },
        oneOf: [
          {
            properties: {
              kind: { type: 'string', const: 4 },
              value: { type: 'number' },
            },
          },
        ],
      },
      { collect },
    );
    expect(collect).toHaveBeenCalledWith(
      expect.objectContaining({
        code: BlueprintWarningCode.DiscriminatorBranchUnreachable,
      }),
    );
  });

  it('resolves discriminator tags through child edges with escaped names and reference sharing', () => {
    const collect = vi.fn();
    blueprint(
      {
        type: 'object',
        $defs: {
          tag: { type: 'string', const: 4 },
          host: {
            type: 'object',
            controls: { discriminator: 'kind/name' },
            oneOf: [
              {
                properties: {
                  'kind/name': { $ref: '#/$defs/tag' },
                  value: { type: 'number' },
                },
              },
            ],
          },
        },
        properties: {
          a: { $ref: '#/$defs/host' },
          b: { $ref: '#/$defs/host' },
        },
      },
      { collect },
    );
    const warnings = collect.mock.calls
      .map(([diagnostic]) => diagnostic)
      .filter(
        (diagnostic) =>
          diagnostic.code ===
          BlueprintWarningCode.DiscriminatorBranchUnreachable,
      );
    expect(warnings).toHaveLength(1);
    expect(warnings[0].details.propertyName).toBe('kind/name');
  });

  it('warns only about ignored allOf keywords while nested composition is analyzed', () => {
    const collect = vi.fn();
    const root = blueprint(
      {
        type: 'object',
        allOf: [
          {
            not: { required: ['forbidden'] },
            oneOf: [{ properties: { a: { type: 'string' } } }],
          },
        ],
      },
      { collect },
    ).root;
    expect(root.childEntries.map((edge) => edge.name)).toEqual(['a']);
    const warnings = collect.mock.calls
      .map(([diagnostic]) => diagnostic)
      .filter(
        (diagnostic) =>
          diagnostic.code === BlueprintWarningCode.AllOfKeywordIgnoredForForm,
      );
    expect(warnings.map((diagnostic) => diagnostic.details.keyword)).toEqual([
      'not',
    ]);
  });
  it.each([
    [
      'a group that is not an object',
      { type: 'string', controls: 'x' },
      '#/controls',
      { group: 'controls', key: 'controls', expected: 'object' },
    ],
    [
      'an injectTo that is not a function',
      { type: 'string', controls: { injectTo: { '/missing': 1 } } },
      '#/controls/injectTo',
      { group: 'controls', key: 'injectTo', expected: 'function' },
    ],
    [
      'children that is not an array',
      { type: 'object', controls: { children: {} } },
      '#/controls/children',
      { group: 'controls', key: 'children', expected: 'array' },
    ],
    [
      'a children entry with the wrong shape',
      { type: 'object', controls: { children: [{ targets: 'a' }] } },
      '#/controls/children/0',
      {
        group: 'controls',
        key: 'children',
        expected: '{ targets: string[], controls? }',
      },
    ],
    [
      'a discriminator that is not a non-empty string',
      { type: 'object', controls: { discriminator: 3 }, oneOf: [{}] },
      '#/controls/discriminator',
      { group: 'controls', key: 'discriminator', expected: 'string' },
    ],
  ])(
    'reports %s as INVALID_CONTROL_SHAPE',
    (_name, schema, schemaPath, details) => {
      const collect = vi.fn();
      expect(() => blueprint(schema, { collect })).toThrow(
        expect.objectContaining({
          specific: BlueprintErrorCode.InvalidControlShape,
        }),
      );
      expect(collect).toHaveBeenCalledWith({
        code: BlueprintErrorCode.InvalidControlShape,
        level: 'error',
        schemaPath,
        details,
      });
    },
  );
  it('reports a key outside the closed list as UNKNOWN_GROUP_KEY with group and key', () => {
    const collect = vi.fn();
    expect(() =>
      blueprint({ type: 'string', options: { unknown: true } }, { collect }),
    ).toThrow(
      expect.objectContaining({ specific: BlueprintErrorCode.UnknownGroupKey }),
    );
    expect(collect).toHaveBeenCalledWith({
      code: BlueprintErrorCode.UnknownGroupKey,
      level: 'error',
      schemaPath: '#/options/unknown',
      details: { group: 'options', key: 'unknown' },
    });
  });
  it('warns once for a union host whose inline subtree carries reserved keys, never through a reference', () => {
    const collect = vi.fn();
    blueprint(
      {
        type: 'object',
        $defs: { target: { type: 'string', controls: { visible: true } } },
        properties: {
          value: {
            type: ['object', 'string'],
            properties: {
              inline: { type: 'string', controls: { visible: true } },
              ref: { $ref: '#/$defs/target' },
            },
          },
        },
      },
      { collect },
    );
    const warnings = collect.mock.calls
      .map(([diagnostic]) => diagnostic)
      .filter(
        (diagnostic) =>
          diagnostic.code ===
          BlueprintWarningCode.TerminalSubtreeKeyIgnoredForForm,
      );
    expect(warnings).toHaveLength(1);
    expect(warnings[0].schemaPath).toBe('#/properties/value');
    expect(warnings[0].details.paths).toEqual([
      '#/properties/value/properties/inline',
    ]);
  });
});
