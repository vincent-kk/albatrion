import { expect, it, vi } from 'vitest';

import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { DirtyPathSet } from '../utils/scratch/DirtyPathSet';
import { bulkConsumeCases } from './fixtures/bulkConsumeCases';
import { gateTableCases } from './fixtures/gate-table/gateTableCases';
import { observeGateTableModes } from './fixtures/gate-table/observeGateTableModes';
import { observeGateTableCase } from './fixtures/gate-table/observeGateTableCase';

it('bulk fixtures keep complete observations in off/table/verify with zero violations', async () => {
  const before = gateSelectionTable.violations;
  const tableBulk = gateTableCases.filter(fixture =>
    fixture.writes.some(write => write.path === undefined && typeof write.value === 'object'),
  );
  expect(tableBulk.some(fixture => fixture.name.includes('oneOf-80'))).toBe(true);
  for (const fixture of [...bulkConsumeCases, ...tableBulk])
    await observeGateTableModes(fixture, bulkConsumeCases.slice(0, 2).includes(fixture));
  expect(gateSelectionTable.violations).toBe(before);
}, 120000);

it('recreates /list/0 after /list was consumed within the same settlement', async () => {
  const consumed = new WeakSet<DirtyPathSet>();
  let recreated = 0;
  const add = DirtyPathSet.prototype.add;
  const clear = DirtyPathSet.prototype.clear;
  const remove = DirtyPathSet.prototype.delete;
  vi.spyOn(DirtyPathSet.prototype, 'add').mockImplementation(function (this: DirtyPathSet, path) {
    if (path === '/list/0' && consumed.has(this)) recreated++;
    return add.call(this, path);
  });
  vi.spyOn(DirtyPathSet.prototype, 'clear').mockImplementation(function (this: DirtyPathSet) {
    consumed.delete(this);
    return clear.call(this);
  });
  vi.spyOn(DirtyPathSet.prototype, 'delete').mockImplementation(function (this: DirtyPathSet, path) {
    const result = remove.call(this, path);
    if (result && path === '/list') consumed.add(this);
    return result;
  });
  if ('consume' in DirtyPathSet.prototype) {
    const consume = DirtyPathSet.prototype.consume;
    vi.spyOn(DirtyPathSet.prototype, 'consume').mockImplementation(function (this: DirtyPathSet, path) {
      const result = consume.call(this, path);
      if (result && path === '/list') consumed.add(this);
      return result;
    });
  }
  try {
    const before = gateSelectionTable.violations;
    await observeGateTableModes(bulkConsumeCases[2]);
    expect(gateSelectionTable.violations).toBe(before);
    expect(recreated).toBeGreaterThanOrEqual(6);
    console.log('DIRTY_CONSUME_RECREATED', JSON.stringify({ recreated }));
  } finally { vi.restoreAllMocks(); }
});

it('schema compaction leaves every other observation intact and default bytes unchanged', () => {
  const fixture = gateTableCases[2];
  const original = observeGateTableCase(fixture);
  expect(observeGateTableCase(fixture, false)).toBe(original);
  const compact = observeGateTableCase(fixture, true);
  expect(compact).toContain('$schemaHash');
  const omitSchemas = (value: string) => JSON.parse(value, (key, item) => key === 'schema' ? null : item);
  // This includes selections, deliveries, shapeDirty and all verification evidence.
  expect(omitSchemas(compact)).toEqual(omitSchemas(original));
});
