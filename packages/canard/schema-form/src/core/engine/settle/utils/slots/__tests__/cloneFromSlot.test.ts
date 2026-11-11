import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import * as blueprints from '../../../../blueprint';
import { WriteOption } from '../../../../types/value';
import {
  dispatchMount,
  dispatchSetState,
  dispatchSetValue,
} from '../../../../write';
import { getDispatchNode } from '../../../__tests__/fixtures/getDispatchNode';
import { getSettlementScratch } from '../../scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../settlement/createSettlementContext';
import { cloneFromSlot } from '../cloneFromSlot';
import { getRetainedChildEntry } from '../getRetainedChildEntry';

afterEach(() => vi.restoreAllMocks());

it('copies source channels and rebinds every active and inactive parent', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          childOpen: { type: 'boolean' },
          leaf: { type: 'string' },
          hidden: { type: 'string', controls: { active: '../childOpen' } },
          list: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  });
  dispatchMount(root, {
    open: true,
    group: {
      childOpen: true,
      leaf: 'kept',
      hidden: 'hidden',
      list: ['item'],
      extra: 7,
    },
  });
  const instance = getDispatchNode(root, 'group');
  const hidden = getDispatchNode(instance, 'hidden');
  const oldItem = getDispatchNode(instance, 'list', '0');
  dispatchSetState(getDispatchNode(instance, 'leaf'), { edited: true });
  dispatchSetValue(getDispatchNode(instance, 'childOpen'), false);
  const hiddenEntry = getRetainedChildEntry(
    instance,
    hidden.name,
    hidden.blueprintNode,
  );
  const entry = getRetainedChildEntry(
    root,
    instance.name,
    instance.blueprintNode,
  );
  if (!hiddenEntry || !entry) throw new Error('Expected declared bindings');
  instance.inactiveSlots = new Map([[hiddenEntry, hidden]]);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  root.inactiveSlots = new Map([[entry, instance]]);
  const scratch = getSettlementScratch(runtime);
  const context = createSettlementContext(
    root,
    'callerReplace',
    WriteOption.Overwrite,
    scratch,
  );
  const merge = vi.spyOn(blueprints, 'mergeEffectiveSchema');
  try {
    const clone = cloneFromSlot(root, entry, instance, context);
    expect(clone).not.toBe(instance);
    expect(clone.parent).toBe(root);
    expect(clone.extras).toEqual({ extra: 7 });
    expect(getDispatchNode(clone, 'leaf').source).toBe('kept');
    expect(getDispatchNode(clone, 'leaf').interactionState).toEqual({});
    expect(context.entered.has(getDispatchNode(clone, 'list', '0'))).toBe(true);
    expect(getDispatchNode(clone, 'list', '0').itemKey).toBeGreaterThan(
      oldItem.itemKey!,
    );
    const candidate = clone.inactiveSlots?.get(hiddenEntry);
    expect(candidate).not.toBe(hidden);
    expect(candidate?.parent).toBe(clone);
    expect(candidate?.source).toBe('hidden');
    expect(candidate?.detached).toBe(true);
    expect(instance.inactiveSlots.get(hiddenEntry)).toBe(hidden);
    expect(instance.detached).toBe(true);
    expect(hidden.parent).toBe(instance);
    expect(merge).not.toHaveBeenCalled();
  } finally {
    releaseSettlementScratch(scratch);
  }
});
