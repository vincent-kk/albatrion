import { describe, expect, it } from 'vitest';

import { assertEquivalent } from './fixtures/assertEquivalent';
import { scan } from './fixtures/scan';

describe('canonical cycles, branching and isolation', () => {
  it('follows a three-step replacement chain', () => {
    const schema = {
      $defs: {
        A: { $ref: '#/$defs/B' },
        B: { $ref: '#/$defs/C' },
        C: { type: 'string' },
      },
      properties: { x: { $ref: '#/$defs/A' } },
    };
    const { output, outcomes } = scan(schema);
    expect(output.properties.x).toEqual({ type: 'string' });
    expect(outcomes.get('#/properties/x')?.map((o) => o.uri)).toEqual([
      '#/$defs/A',
      '#/$defs/B',
      '#/$defs/C',
    ]);
    assertEquivalent(schema, output, [{ x: 's' }, { x: 1 }]);
  });
  it('stops mutual pure-reference chains at the active canonical location', () => {
    const schema = {
      properties: {
        a: { $ref: '#/properties/b' },
        b: { $ref: '#/properties/a' },
      },
    };
    const { output, outcomes } = scan(schema);
    expect(output).toEqual({
      properties: {
        a: { $ref: '#/properties/b' },
        b: { $ref: '#/properties/a' },
      },
    });
    expect(outcomes.get('#/properties/a')?.map((o) => o.skipped)).toEqual([
      undefined,
      undefined,
      'cycle',
    ]);
  });
  it('owns wrapper identities on only their appended branch', () => {
    const schema = {
      $defs: { A: { type: 'string' } },
      properties: { x: { $ref: '#/$defs/A', allOf: [{ $ref: '#/$defs/A' }] } },
    };
    const { output, outcomes } = scan(schema);
    expect(output.properties.x.allOf).toEqual([
      { type: 'string' },
      { type: 'string' },
    ]);
    expect(
      Array.from(outcomes.values())
        .flat()
        .some((o) => o.skipped === 'cycle'),
    ).toBe(false);
    assertEquivalent(schema, output, [{ x: 's' }, { x: 1 }]);
  });
  it('still detects a real cycle through an appended wrapper branch', () => {
    const schema = {
      $defs: {
        A: {
          type: 'object',
          properties: { next: { $ref: '#/$defs/A', title: 'next' } },
        },
      },
      properties: { x: { $ref: '#/$defs/A' } },
    };
    const { output, outcomes } = scan(schema);
    expect(output.properties.x.properties.next.$ref).toBe('#/$defs/A');
    expect(outcomes.get('#/properties/x/properties/next')).toMatchObject([
      { skipped: 'cycle' },
    ]);
    assertEquivalent(schema, output, [
      { x: {} },
      { x: { next: {} } },
      { x: { next: 1 } },
    ]);
  });
  it('copies the wrapper and child mutation paths without changing source or target', () => {
    const target = { type: 'string', minLength: 1 },
      schema = {
        $defs: { T: target },
        properties: {
          x: { $ref: '#/$defs/T', properties: { a: { type: 'number' } } },
        },
      };
    const before = JSON.stringify(schema);
    const { output } = scan(schema, {
      mutate: (e) =>
        e.path === '#/properties/x/properties/a'
          ? { type: 'integer' }
          : undefined,
    });
    expect(JSON.stringify(schema)).toBe(before);
    expect(target).toEqual({ type: 'string', minLength: 1 });
    expect(output.properties.x.properties.a.type).toBe('integer');
    expect(output.properties.x.allOf[0]).not.toBe(target);
  });
  it('does not register identifiers introduced by mutate', () => {
    const schema = { properties: { a: {}, b: { $ref: '#New' } } };
    const { outcomes } = scan(schema, {
      mutate: (e) =>
        e.path === '#/properties/a'
          ? { properties: { child: { $anchor: 'New', type: 'string' } } }
          : undefined,
    });
    expect(outcomes.get('#/properties/b')).toMatchObject([
      { skipped: 'unresolved' },
    ]);
  });
  it('bounds a forty-level binary reference graph before exponential materialization', () => {
    const $defs: Record<string, any> = { N40: { type: 'string' } };
    for (let index = 39; index >= 0; index--)
      $defs['N' + index] = {
        allOf: [
          { $ref: '#/$defs/N' + (index + 1) },
          { $ref: '#/$defs/N' + (index + 1) },
        ],
      };
    expect(() =>
      scan(
        { $defs, properties: { x: { $ref: '#/$defs/N0' } } },
        { limits: { inlinedNodes: 1000 } },
      ),
    ).toThrowError(expect.objectContaining({ code: 'inlined-node-limit' }));
  });
  it('keeps an invalid allOf wrapper intact with an invalid outcome', () => {
    const schema = {
      $defs: { A: { type: 'string' } },
      properties: { x: { $ref: '#/$defs/A', allOf: {} } },
    };
    const { output, outcomes } = scan(schema);
    expect(output).toEqual(schema);
    expect(outcomes.get('#/properties/x')).toMatchObject([
      { skipped: 'invalid' },
    ]);
  });
});
