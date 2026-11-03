import { describe, expect, it } from 'vitest';

import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';

import { clone } from '../clone';

/** A JSON Schema fragment whose `properties` map may carry an own `__proto__` key. */
interface ProtoKeySchema {
  $id?: string;
  type: string;
  properties: Record<string, ProtoKeySchema | { type: string }>;
}

/**
 * Parses JSON text into a schema; JSON.parse creates `__proto__` as an own key,
 * whereas an object literal would set the prototype instead.
 *
 * @param text - JSON text describing a schema with a `properties` map
 * @returns The parsed schema with every `__proto__` key kept as an own key
 */
const parseSchema = (text: string): ProtoKeySchema => JSON.parse(text);

describe('clone — own __proto__ key', () => {
  it('keeps an own __proto__ key one level deep as an own enumerable key', () => {
    const source = parseSchema(
      '{"$id":"x","type":"object","properties":{"__proto__":{"type":"string"}}}',
    );

    const copy = clone(source);

    expect(Object.getOwnPropertyNames(copy.properties)).toContain('__proto__');
    expect(
      Object.getOwnPropertyDescriptor(copy.properties, '__proto__')?.enumerable,
    ).toBe(true);
    expect(Object.getPrototypeOf(copy.properties)).toBe(Object.prototype);
    expect(copy).toEqual(source);
  });

  it('keeps an own __proto__ key two levels deep as an own enumerable key', () => {
    const source = parseSchema(
      '{"type":"object","properties":{"outer":{"type":"object","properties":{"__proto__":{"type":"string"}}}}}',
    );

    const copy = clone(source);
    const inner = copy.properties.outer;

    expect(Object.getOwnPropertyNames(copy.properties)).toEqual(['outer']);
    expect('properties' in inner).toBe(true);
    if (!('properties' in inner)) return;
    expect(Object.getOwnPropertyNames(inner.properties)).toContain('__proto__');
    expect(
      Object.getOwnPropertyDescriptor(inner.properties, '__proto__')
        ?.enumerable,
    ).toBe(true);
    expect(Object.getPrototypeOf(inner.properties)).toBe(Object.prototype);
    expect(copy).toEqual(source);
  });

  it('matches the source own keys when __proto__ sits beside a sibling key', () => {
    const source = parseSchema(
      '{"type":"object","properties":{"__proto__":{"type":"string"},"a":{"type":"number"}}}',
    );

    const copy = clone(source);

    expect(hasOwnProperty(source.properties, '__proto__')).toBe(true);
    expect(hasOwnProperty(copy.properties, '__proto__')).toBe(true);
    expect(Object.keys(copy.properties)).toEqual(
      Object.keys(source.properties),
    );
    expect(Object.keys(copy.properties)).toEqual(['__proto__', 'a']);
    expect(Object.getPrototypeOf(copy.properties)).toBe(Object.prototype);
  });

  it('shares no reference with the source for the __proto__ value', () => {
    const source = parseSchema(
      '{"type":"object","properties":{"__proto__":{"type":"object","properties":{"leaf":{"type":"string"}}}}}',
    );

    const copy = clone(source);
    const sourceValue = Object.getOwnPropertyDescriptor(
      source.properties,
      '__proto__',
    )?.value;
    const copyValue = Object.getOwnPropertyDescriptor(
      copy.properties,
      '__proto__',
    )?.value;

    expect(copyValue).toEqual(sourceValue);
    expect(copyValue).not.toBe(sourceValue);
    expect(copyValue.properties).not.toBe(sourceValue.properties);
    expect(copyValue.properties.leaf).not.toBe(sourceValue.properties.leaf);
  });
});
