import { describe, expect, it, vi } from 'vitest';

import { FieldNodeEventType } from '../../constants/FieldNodeEventType';
import { EMPTY_REVISION_LEDGER } from '../../constants/emptyRevisionLedger';
import { FieldNodeRevisionLedger } from '../FieldNodeRevisionLedger';

const reads = vi.hoisted(() => ({ bits: 0 }));

vi.mock('../../constants/emptyRevisionLedger', async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import('../../constants/emptyRevisionLedger')
    >();
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

describe('FieldNodeRevisionLedger initial previous reads', () => {
  it('counts previous bit reads per shared-empty first ledger', () => {
    reads.bits = 0;
    const nodes = 8;
    for (let node = 0; node < nodes; node++) {
      const ledger = new FieldNodeRevisionLedger(
        EMPTY_REVISION_LEDGER,
        FieldNodeEventType.Initialized | FieldNodeEventType.UpdateValue,
      );
      expect(ledger.read(-1)).toBe(2);
    }
    expect(reads.bits / nodes).toBe(0);
  });

  it('counts all 17 bit reads through the mocked constant for a distinct record inheriting it', () => {
    reads.bits = 0;
    const previous: Readonly<Record<number, number>> = Object.create(
      EMPTY_REVISION_LEDGER,
    );
    const ledger = new FieldNodeRevisionLedger(
      previous,
      FieldNodeEventType.UpdateValue,
    );
    expect(reads.bits).toBe(17);
    expect(ledger.read(-1)).toBe(1);
  });

  it('still reads all 17 bits from a distinct plain previous record', () => {
    let count = 0;
    const previous = new Proxy(
      { [FieldNodeEventType.UpdateValue]: 7 },
      {
        get(target, key, receiver) {
          if (typeof key === 'string' && /^\d+$/.test(key)) count++;
          return Reflect.get(target, key, receiver);
        },
      },
    );
    const ledger = new FieldNodeRevisionLedger(
      previous,
      FieldNodeEventType.UpdateValue,
    );
    expect(count).toBe(17);
    expect(ledger[FieldNodeEventType.UpdateValue]).toBe(8);
    expect(ledger.read(-1)).toBe(8);
    expect(previous[FieldNodeEventType.UpdateValue]).toBe(7);
  });
});
