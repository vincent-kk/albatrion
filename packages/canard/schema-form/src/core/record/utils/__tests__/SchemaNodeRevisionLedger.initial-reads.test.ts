import { describe, expect, it, vi } from 'vitest';

import { SchemaNodeEventType } from '../../SchemaNodeEventType';
import { EMPTY_REVISION_LEDGER } from '../../type';
import { SchemaNodeRevisionLedger } from '../SchemaNodeRevisionLedger';

const reads = vi.hoisted(() => ({ bits: 0 }));

vi.mock('../../type', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../type')>();
  return {
    ...original,
    EMPTY_REVISION_LEDGER: new Proxy(original.EMPTY_REVISION_LEDGER, {
      get(target, key, receiver) {
        if (typeof key === 'string' && /^\d+$/.test(key)) reads.bits++;
        return Reflect.get(target, key, receiver);
      },
    }),
  };
});

describe('SchemaNodeRevisionLedger initial previous reads', () => {
  it('counts previous bit reads per shared-empty first ledger', () => {
    reads.bits = 0;
    const nodes = 8;
    for (let node = 0; node < nodes; node++) {
      const ledger = new SchemaNodeRevisionLedger(EMPTY_REVISION_LEDGER,
        SchemaNodeEventType.Initialized | SchemaNodeEventType.UpdateValue);
      expect(ledger.read(-1)).toBe(2);
    }
    expect(reads.bits / nodes).toBe(17);
  });

  it('still reads all 17 bits from a distinct plain previous record', () => {
    let count = 0;
    const previous = new Proxy({ [SchemaNodeEventType.UpdateValue]: 7 }, {
      get(target, key, receiver) {
        if (typeof key === 'string' && /^\d+$/.test(key)) count++;
        return Reflect.get(target, key, receiver);
      },
    });
    const ledger = new SchemaNodeRevisionLedger(previous, SchemaNodeEventType.UpdateValue);
    expect(count).toBe(17);
    expect(ledger[SchemaNodeEventType.UpdateValue]).toBe(8);
    expect(ledger.read(-1)).toBe(8);
    expect(previous[SchemaNodeEventType.UpdateValue]).toBe(7);
  });
});
