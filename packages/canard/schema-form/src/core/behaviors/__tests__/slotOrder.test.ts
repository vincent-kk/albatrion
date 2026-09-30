import { describe, expect, it } from 'vitest';

import { BEHAVIORS } from '../index';

/** Stable public row slot order shared by every kind and strategy. */
const SLOT_ORDER = [
  'interpret',
  'assemble',
  'project',
  'finishInput',
  'declareChildren',
  'type',
  'strategy',
];

describe('behavior slot order', () => {
  it('uses the identical fixed slot order in all eight rows', () => {
    const rows = Object.values(BEHAVIORS).flatMap((strategies) =>
      Object.values(strategies),
    );
    expect(rows).toHaveLength(8);
    for (const row of rows) expect(Object.keys(row)).toEqual(SLOT_ORDER);
  });
});
