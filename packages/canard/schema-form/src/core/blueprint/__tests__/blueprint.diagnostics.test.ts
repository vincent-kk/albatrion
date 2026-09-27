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
      expect.objectContaining({ specific: BlueprintErrorCode.UnknownGroupKey }),
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
              inline: { type: 'string', controls: { visible: true } },
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
    expect(warnings.map((diagnostic) => diagnostic.schemaPath)).toEqual([
      '#/properties/value/properties/inline',
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
});
