import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { clone } from '@/common-utils';

/** A bounded cache built on Map: the bound lives in an instance field set by the constructor. */
class BoundedMap<K, V> extends Map<K, V> {
  readonly limit: number;
  constructor(limit: number) {
    super();
    this.limit = limit;
  }
  set(key: K, value: V) {
    super.set(key, value);
    if (this.size > this.limit) this.delete(this.keys().next().value as K);
    return this;
  }
}

/** The same bound on an ordinary class that wraps a Map. */
class BoundedStore<K, V> {
  readonly entries = new Map<K, V>();
  constructor(readonly limit: number) {}
  set(key: K, value: V) {
    this.entries.set(key, value);
    if (this.entries.size > this.limit) this.entries.delete(this.entries.keys().next().value as K);
    return this;
  }
}

describe('clone of built-in subclasses with instance fields (RG3 of the round 4 subclass decision)', () => {
  it('control: an ordinary class instance keeps its constructor-set field', () => {
    const copy = clone(new BoundedStore<string, number>(2));
    expect(copy.limit).toBe(2);
    copy.set('a', 1).set('b', 2).set('c', 3);
    expect(copy.entries.size).toBe(2);
  });

  it('a Map subclass keeps its constructor-set field, so its overridden method still bounds the map', () => {
    const copy = clone(new BoundedMap<string, number>(2));
    copy.set('a', 1).set('b', 2).set('c', 3);
    expect({ limit: copy.limit, size: copy.size }).toEqual({ limit: 2, size: 2 });
  });

  it('the consumer-facing clone JSDoc lists the dropped own properties of built-in subclasses among its known limits', () => {
    const text = readFileSync(fileURLToPath(new URL('../../utils/object/clone.ts', import.meta.url)), 'utf8');
    const limits = text.slice(text.indexOf('**Known Limits:**'), text.indexOf('**Performance Considerations:**'));
    expect(limits).toMatch(/own (properties|fields)/i);
  });
});
