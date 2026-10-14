import { describe, expect, it } from 'vitest';

import { BEHAVIORS } from '../index';

/** Stable public row slot order shared by every kind and strategy. */
const SLOT_ORDER = [
  'interpret',
  'assemble',
  'project',
  'finishInput',
  'declareChildren',
  'arrange',
  'type',
  'strategy',
];

describe('behavior slot order', () => {
  it('NODE-006 uses the identical fixed slot order in all ten rows', () => {
    const rows = Object.values(BEHAVIORS).flatMap((strategies) =>
      Object.values(strategies),
    );
    expect(rows).toHaveLength(10);
    for (const row of rows) expect(Object.keys(row)).toEqual(SLOT_ORDER);
    const nonArrays = rows.filter((row) => row.type !== 'array');
    for (const row of nonArrays) expect(row.arrange).toBe(nonArrays[0].arrange);
  });
});
