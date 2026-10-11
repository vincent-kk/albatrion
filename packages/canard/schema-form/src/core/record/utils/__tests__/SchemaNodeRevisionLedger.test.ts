import { describe, expect, it } from 'vitest';

import { SchemaNodeEventType } from '../../SchemaNodeEventType';
import { EMPTY_REVISION_LEDGER } from '../../type';
import { SchemaNodeRevisionLedger } from '../SchemaNodeRevisionLedger';

describe('SchemaNodeRevisionLedger counters', () => {
  it('keeps shared-empty and plain-record bit reads, sums and snapshots identical', () => {
    let shared = new SchemaNodeRevisionLedger(EMPTY_REVISION_LEDGER, 0);
    let plain = new SchemaNodeRevisionLedger({}, 0);
    for (let index = 0; index < 17; index++) {
      const before = shared;
      const saved = Array.from({ length: 17 }, (_, bit) => before[1 << bit]);
      const mask = (1 << index) | SchemaNodeEventType.Initialized;
      shared = new SchemaNodeRevisionLedger(shared, mask);
      plain = new SchemaNodeRevisionLedger(plain, mask);
      for (let bit = 0; bit < 17; bit++) {
        expect(shared[1 << bit]).toBe(plain[1 << bit]);
        expect(shared.read((1 << bit) | mask)).toBe(plain.read((1 << bit) | mask));
        expect(before[1 << bit]).toBe(saved[bit]);
      }
      expect(shared.read(-1)).toBe(plain.read(-1));
      expect(shared.read(0)).toBe(0);
    }
    expect(Object.isFrozen(EMPTY_REVISION_LEDGER)).toBe(true);
    expect(Object.keys(EMPTY_REVISION_LEDGER)).toHaveLength(0);
  });

  it('maps all 17 event bits to independent counters and bit getters', () => {
    let ledger = new SchemaNodeRevisionLedger({}, 0);
    for (let index = 0; index < 17; index++) {
      const bit = 1 << index;
      ledger = new SchemaNodeRevisionLedger(ledger, bit);
      expect(ledger[bit]).toBe(1);
      expect(ledger.read(bit)).toBe(1);
      expect(ledger.read((1 << 17) - 1)).toBe(index + 1);
      for (let other = index + 1; other < 17; other++)
        expect(ledger[1 << other]).toBeUndefined();
    }
  });

  it('ignores unknown positive and sign bits in writes and reads', () => {
    const ledger = new SchemaNodeRevisionLedger({},
      SchemaNodeEventType.UpdateValue | (1 << 17) | (1 << 30) | (1 << 31));
    expect(ledger.read(-1)).toBe(1);
    expect(ledger.read((1 << 17) | (1 << 30) | (1 << 31))).toBe(0);
    expect(ledger[1 << 17]).toBeUndefined();
    expect(ledger[0]).toBeUndefined();
  });

  it('copies plain counters and preserves old ledgers across combined writes', () => {
    const value = SchemaNodeEventType.UpdateValue;
    const path = SchemaNodeEventType.UpdatePath;
    const input = { [value]: 7, [path]: 3 };
    const first = new SchemaNodeRevisionLedger(input, value);
    const second = new SchemaNodeRevisionLedger(first, value | path);
    input[value] = 100;
    expect(first[value]).toBe(8);
    expect(first[path]).toBe(3);
    expect(second[value]).toBe(9);
    expect(second[path]).toBe(4);
    expect(second.read(value | path)).toBe(13);
    expect(new SchemaNodeRevisionLedger(second, 0).read(-1)).toBe(13);
    expect(first.read(value | path)).toBe(11);
  });
});
