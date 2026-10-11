import { beforeEach, describe, expect, it, vi } from 'vitest';

import { blueprint } from '../blueprint';
import type { BlueprintDiagnostic, BlueprintSchema, EffectiveSchemaMemo } from '../type';
import { mergeEffectiveSchema } from '../utils/effectiveSchema/mergeEffectiveSchema';
import type { mergeSchemaContributions } from '../utils/effectiveSchema/utils/mergeSchemaContributions';

const counts = vi.hoisted(() => ({ runtime: 0, static: 0 }));
vi.mock('../utils/effectiveSchema/utils/mergeSchemaContributions', async (original) => {
  const actual = await original<{ mergeSchemaContributions: typeof mergeSchemaContributions }>();
  return { mergeSchemaContributions: (...args: Parameters<typeof mergeSchemaContributions>) => {
    counts[args[2].mode === 'static' ? 'static' : 'runtime']++;
    return actual.mergeSchemaContributions(...args);
  } };
});
beforeEach(() => { counts.runtime = 0; counts.static = 0; });

// filid:contract unconditional-effective-schema
describe('unconditional normalization and conservative fallback', () => {
  it('preserves normalized hints, raw references, freeze and equivalent active-set identity', () => {
    const options = { trim: true }, presentation = { label: { text: 'name' } };
    const schema = { type: 'string', title: 'name', options, presentation, minLength: 1 } as const;
    const node = blueprint(schema).root;
    const effective = mergeEffectiveSchema(node, []);
    const oracle = mergeEffectiveSchema(node, [], {}, new WeakMap());
    expect(effective).toEqual(oracle);
    expect(effective.schema).toMatchObject({ type: 'string', minLength: 1 });
    expect((effective.schema as Record<string, unknown>).options).toBe(options);
    expect((effective.schema as Record<string, unknown>).presentation).toBe(presentation);
    expect(Object.isFrozen(effective)).toBe(true);
    expect(Object.isFrozen(effective.schema)).toBe(true);
    expect(mergeEffectiveSchema(node, [node.declarations[0].id, 999])).toBe(effective);
    expect(mergeEffectiveSchema(node, [])).toBe(effective);
    expect(schema).toEqual({ type: 'string', title: 'name', options, presentation, minLength: 1 });
  });

  it('retains single inverted bounds and literal empty enum for the validator', () => {
    const node = blueprint({ type: 'number', minimum: 5, maximum: 3, enum: [] }).root;
    expect(mergeEffectiveSchema(node, []).schema).toMatchObject({ minimum: 5, maximum: 3, enum: [] });
  });

  it('still merges type intersections in authored conjunctions', () => {
    const node = blueprint({ type: 'number', allOf: [{ type: 'integer' }] }).root;
    expect(mergeEffectiveSchema(node, []).schema).toMatchObject({ type: 'integer' });
    expect(counts.runtime).toBe(1);
  });

  it('still merges a nullable singleton and an explicit false nullable hint', () => {
    for (const schema of [{ type: ['string', 'null'] }, { type: 'string', nullable: false }] as const) {
      const node = blueprint(schema).root;
      const before = counts.runtime;
      expect(mergeEffectiveSchema(node, [])).toEqual(mergeEffectiveSchema(node, [], {}, new WeakMap()));
      expect(counts.runtime - before).toBe(2);
    }
  });

  it('still merges union type arrays without changing static type identity', () => {
    const node = blueprint({ type: ['string', 'number'] }).root;
    expect((mergeEffectiveSchema(node, []).schema as Record<string, unknown>).type).toBe(node.schemaType);
    expect(counts.runtime).toBe(1);
  });

  it('still merges a singleton pattern and retains multiple pattern order', () => {
    const single = blueprint({ type: 'string', pattern: '^a' }).root;
    expect(mergeEffectiveSchema(single, []).schema).toMatchObject({ pattern: '^a' });
    expect(counts.runtime).toBe(1);
    const node = blueprint({ type: 'string', pattern: '^a', allOf: [{ pattern: 'z$' }, { pattern: '^a' }] }).root;
    expect(mergeEffectiveSchema(node, []).schema).toMatchObject({ pattern: '^a', allOf: expect.arrayContaining([{ pattern: 'z$' }]) });
    expect(counts.runtime).toBe(2);
  });

  it('still merges atomic groups with the original predicate and later value identity', () => {
    const earlier = { opaque: true, a: 1 }, later = { opaque: true, b: 2 };
    const isAtomic = (value: unknown) => !!value && typeof value === 'object' && 'opaque' in value;
    const schema = { type: 'string', presentation: { input: earlier }, allOf: [{ presentation: { input: later } }] } as const;
    const node = blueprint(schema, { isAtomic }).root;
    const effective = mergeEffectiveSchema(node, [], { isAtomic });
    expect((effective.schema as Record<string, any>).presentation.input).toBe(later);
    expect(counts.runtime).toBe(1);
    const single = blueprint({ type: 'string', presentation: { input: earlier } }, { isAtomic }).root;
    expect((mergeEffectiveSchema(single, [], { isAtomic }).schema as Record<string, any>).presentation.input).toBe(earlier);
    expect(counts.runtime).toBe(2);
  });

  it('preserves collected warnings and their authored order while using the merger', () => {
    const warnings: BlueprintDiagnostic[] = [];
    const collect = (diagnostic: BlueprintDiagnostic) => warnings.push(diagnostic);
    const node = blueprint({ type: 'string', dependentSchemas: {}, dependencies: {} }, { collect }).root;
    expect(warnings.map(({ code, schemaPath, details }) => [code, schemaPath, details.keyword])).toEqual([
      ['DEPENDENT_SCHEMAS_IGNORED_FOR_FORM', '#', 'dependentSchemas'],
      ['DEPENDENT_SCHEMAS_IGNORED_FOR_FORM', '#', 'dependencies'],
    ]);
    const original = [...warnings];
    mergeEffectiveSchema(node, [], { collect });
    expect(counts.runtime).toBe(1);
    expect(warnings).toEqual(original);
  });

  it('delivers late warnings once even after the no-collector fast path', () => {
    const schema: BlueprintSchema = { type: 'string', dependentSchemas: {}, dependencies: {} };
    const cache = new WeakMap(), warnings: BlueprintDiagnostic[] = [];
    const first = blueprint(schema, { cache });
    const effective = mergeEffectiveSchema(first.root, []);
    const collect = (diagnostic: BlueprintDiagnostic) => warnings.push(diagnostic);
    expect(blueprint(schema, { cache, collect })).toBe(first);
    blueprint(schema, { cache, collect });
    expect(warnings.map(d => d.details.keyword)).toEqual(['dependentSchemas', 'dependencies']);
    expect(mergeEffectiveSchema(first.root, [], { collect }).schema).toEqual(effective.schema);
  });

  it('still merges declarations in total order and keeps required union and later hints', () => {
    const node = blueprint({ type: 'object', title: 'first', required: ['a'], properties: { a: { type: 'string' }, b: { type: 'string' } },
      allOf: [{ title: 'second', required: ['b'] }, { title: 'third', required: ['a'] }] }).root;
    const reversed = { ...node, declarations: [...node.declarations].reverse() };
    const result = mergeEffectiveSchema(reversed, []);
    expect(result.schema).toMatchObject({ title: 'third', required: ['a', 'b'] });
    expect(result).toEqual(mergeEffectiveSchema(node, [], {}, new WeakMap()));
    expect(counts.runtime).toBe(2);
  });

  it('keeps explicit memo and static policies separate from pre-normalized runtime hints', () => {
    const node = blueprint({ type: 'string', title: 'name' }).root;
    const effective = mergeEffectiveSchema(node, []);
    const memo: EffectiveSchemaMemo = new WeakMap();
    const isolated = mergeEffectiveSchema(node, [], {}, memo);
    expect(isolated).toEqual(effective);
    expect(isolated).not.toBe(effective);
    expect(mergeEffectiveSchema(node, [], {}, memo)).toBe(isolated);
    expect(mergeEffectiveSchema(node, [], { mode: 'static' })).toEqual(effective);
    expect(mergeEffectiveSchema(node, [], { mode: 'static' })).not.toBe(effective);
  });
});
