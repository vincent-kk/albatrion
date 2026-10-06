import { afterEach, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { finishSettlement } from '../utils/settlement/finishSettlement';
import { getSettlementScratch } from '../utils/write/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/write/releaseSettlementScratch';
import { markWrite } from '../utils/write/markWrite';
import { registerRecalculation } from '../utils/write/registerRecalculation';
import { computeNode } from '../utils/compute/computeNode';
import * as selections from '../utils/compute/selectChildren';
import { createTestTree } from './fixtures/createTestTree';

afterEach(() => vi.restoreAllMocks());

it('keeps dirty work and child post-order without per-node shape or appearance membership checks', () => {
  const { root, visits } = createTestTree({ type: 'object', properties: {
    value: { type: 'string' }, sibling: { type: 'number', default: 3 },
  } });
  loadSchemaNodeAtMount(root, { value: 'before' }, SetValueOption.Overwrite);
  const leaf = root.structure!.value;
  for (let index = 0; index < 2; index++) {
    const value = index === 0 ? 'first' : 'later';
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(leaf, 'input', SetValueOption.Overwrite, scratch);
    markWrite(leaf, value, context);
    registerRecalculation(context);
    const shape = vi.spyOn(context.shapeDirtyPaths, 'has');
    const entered = vi.spyOn(context.entered, 'has');
    visits.length = 0;
    computeNode(root, context);
    expect(shape).not.toHaveBeenCalled();
    expect(entered).not.toHaveBeenCalled();
    expect(visits).toEqual(['/value', '']);
    expect([...context.stateDirtyNodes]).toEqual([root, leaf]);
    expect(context.dirtyPaths.size).toBe(0);
    expect(root.emit).toEqual({ value, sibling: 3 });
    shape.mockRestore();
    entered.mockRestore();
    finishSettlement(context, scratch);
    releaseSettlementScratch(scratch);
    expect(root.runtime.commitNumber).toBe(index + 2);
  }
});

it('retains child selection and fills for a branchless shape change', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    rows: { type: 'array', items: { type: 'object', properties: {
      value: { type: 'string', default: 'filled' },
    } } },
  } });
  loadSchemaNodeAtMount(root, { rows: [] }, SetValueOption.Overwrite);
  const select = vi.spyOn(selections, 'selectChildren');
  writeSchemaNode(root.structure!.rows, [{}], 'callerReplace', SetValueOption.Overwrite);
  expect(select.mock.calls.length).toBeGreaterThan(0);
  expect(root.emit).toEqual({ rows: [{ value: 'filled' }] });
});

it('retains gate visits, appearance fills and exit when a declaration changes', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    flag: { type: 'boolean' }, gated: { type: 'string', default: 'filled',
      controls: { active: '../flag' } },
  } });
  loadSchemaNodeAtMount(root, { flag: false }, SetValueOption.Overwrite);
  const select = vi.spyOn(selections, 'selectChildren');
  writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
  expect(select.mock.calls.length).toBeGreaterThan(0);
  expect(root.emit).toEqual({ flag: true, gated: 'filled' });
  const gated = root.structure!.gated;
  writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
  expect(gated.detached).toBe(true);
  expect(root.emit).toEqual({ flag: false });
});
