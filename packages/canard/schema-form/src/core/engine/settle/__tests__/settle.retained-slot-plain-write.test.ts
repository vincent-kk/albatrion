import { afterEach, expect, it, vi } from 'vitest';

import { pinSlotShipping } from '../../../__tests__/fixtures/pinSlotShipping';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as publication from '../utils/slots/commitSlotChanges';
import * as eligibility from '../utils/slots/isSlotEligible';
import { getDispatchNode } from './fixtures/getDispatchNode';

afterEach(() => vi.restoreAllMocks());

it('skips source bookkeeping when a plain write changes no inactive source', () => {
  // These call bounds cover the shipping kernel without shadow replay work.
  pinSlotShipping();
  const { root } = createDispatchTree({
    type: 'object',
    properties: { value: { type: 'string' } },
  });
  dispatchMount(root, { value: 'held' });
  const select = vi.spyOn(eligibility, 'isSlotEligible');
  const publish = vi.spyOn(publication, 'commitSlotChanges');
  const value = getDispatchNode(root, 'value');
  dispatchSetValue(value, 'next');
  expect(select).not.toHaveBeenCalled();
  expect(publish).not.toHaveBeenCalled();
  expect(root.local).toEqual({ value: 'next' });
  expect(getDispatchNode(root, 'value')).toBe(value);
});

it('leaves a fresh active occurrence without an unused inactive item memo', () => {
  // Sparse source bookkeeping is a shipping allocation contract.
  pinSlotShipping();
  const { root } = createDispatchTree({
    type: 'object',
    properties: { value: { type: 'string' } },
  });
  dispatchMount(root, { value: 'held' });
  expect(
    Object.prototype.hasOwnProperty.call(
      getDispatchNode(root, 'value'),
      'inactiveValueMemo',
    ),
  ).toBe(false);
});
