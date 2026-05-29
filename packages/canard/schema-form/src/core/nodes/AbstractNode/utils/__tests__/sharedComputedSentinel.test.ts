import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { needsRealComputedManager } from '../getComputedPropertiesManager/utils/needsRealComputedManager';
import { sharedComputedSentinel } from '../getComputedPropertiesManager/utils/sharedComputedSentinel';

const EMPTY_ROOT: JsonSchemaWithVirtual = { type: 'object' };

describe('needsRealComputedManager (gate)', () => {
  it('returns false for plain nodes (string/number/object) → sentinel eligible', () => {
    expect(
      needsRealComputedManager('string', { type: 'string' }, EMPTY_ROOT),
    ).toBe(false);
    expect(
      needsRealComputedManager('number', { type: 'number' }, EMPTY_ROOT),
    ).toBe(false);
    expect(
      needsRealComputedManager(
        'object',
        { type: 'object', properties: { a: { type: 'string' } } },
        EMPTY_ROOT,
      ),
    ).toBe(false);
  });

  it('clause 1: any computed.* key present forces a real manager', () => {
    expect(
      needsRealComputedManager(
        'string',
        { type: 'string', computed: { visible: '../a === 1' } },
        EMPTY_ROOT,
      ),
    ).toBe(true);
    /** boolean PRESENCE (false) still produces a defined fn → must be real */
    expect(
      needsRealComputedManager(
        'string',
        { type: 'string', computed: { disabled: false } },
        EMPTY_ROOT,
      ),
    ).toBe(true);
  });

  it('clause 2: `&`-aliased keys force a real manager', () => {
    expect(
      needsRealComputedManager(
        'string',
        { type: 'string', '&visible': '../a' } as JsonSchemaWithVirtual,
        EMPTY_ROOT,
      ),
    ).toBe(true);
    expect(
      needsRealComputedManager(
        'string',
        { type: 'string', '&if': '../a === 1' } as JsonSchemaWithVirtual,
        EMPTY_ROOT,
      ),
    ).toBe(true);
  });

  it('clause 3: plain top-level state keys force a real manager', () => {
    expect(
      needsRealComputedManager(
        'string',
        { type: 'string', readOnly: true } as JsonSchemaWithVirtual,
        EMPTY_ROOT,
      ),
    ).toBe(true);
  });

  it('clause 4: root-schema state keys are inherited by EVERY node', () => {
    const root = { type: 'object', readOnly: true } as JsonSchemaWithVirtual;
    /** a deeply-plain child schema with NO computed surface of its own */
    expect(needsRealComputedManager('string', { type: 'string' }, root)).toBe(
      true,
    );
  });

  it('clause 5: object nodes with oneOf/anyOf force a real manager (no `&if` needed)', () => {
    expect(
      needsRealComputedManager(
        'object',
        {
          type: 'object',
          properties: { kind: { type: 'string' } },
          oneOf: [{ properties: { a: { type: 'string' } } }],
        } as JsonSchemaWithVirtual,
        EMPTY_ROOT,
      ),
    ).toBe(true);
    /** a non-object with oneOf does NOT (conditions are object-only) */
    expect(
      needsRealComputedManager(
        'string',
        { type: 'string', oneOf: [{ const: 'a' }] } as JsonSchemaWithVirtual,
        EMPTY_ROOT,
      ),
    ).toBe(false);
  });
});

describe('sharedComputedSentinel (safety)', () => {
  it('exposes plain-node defaults', () => {
    expect(sharedComputedSentinel.active).toBe(true);
    expect(sharedComputedSentinel.visible).toBe(true);
    expect(sharedComputedSentinel.readOnly).toBe(false);
    expect(sharedComputedSentinel.disabled).toBe(false);
    expect(sharedComputedSentinel.oneOfIndex).toBe(-1);
    expect(sharedComputedSentinel.isEnabled).toBe(false);
    expect(sharedComputedSentinel.hasPostProcessor).toBe(false);
    expect(sharedComputedSentinel.dependencyPaths).toHaveLength(0);
  });

  it('is frozen, with frozen arrays, so it can never be mutated in place', () => {
    expect(Object.isFrozen(sharedComputedSentinel)).toBe(true);
    expect(Object.isFrozen(sharedComputedSentinel.anyOfIndices)).toBe(true);
    expect(Object.isFrozen(sharedComputedSentinel.watchValues)).toBe(true);
    expect(Object.isFrozen(sharedComputedSentinel.dependencyPaths)).toBe(true);
  });

  it('recalculate() is a safe no-op that leaves defaults intact', () => {
    expect(() => sharedComputedSentinel.recalculate()).not.toThrow();
    expect(sharedComputedSentinel.active).toBe(true);
    expect(sharedComputedSentinel.visible).toBe(true);
    expect(sharedComputedSentinel.getDerivedValue()).toBeUndefined();
    expect(sharedComputedSentinel.getPristine()).toBeUndefined();
  });
});
