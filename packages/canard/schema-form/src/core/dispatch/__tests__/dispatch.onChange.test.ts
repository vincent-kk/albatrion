import { describe, expect, it } from 'vitest';

import { dispatchBatch, dispatchMount, dispatchResetForm,
  dispatchSetValue, subscribeSchemaNode } from '../index';
import { ValidationMode } from '../../types/state';
import { createDispatchTree } from './fixtures/createDispatchTree';

// filid:contract dispatch-onchange
describe('dispatcher onChange', () => {
  it('EVENT-026 invokes once after the final wave with final emit', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const order: string[] = [];
    subscribeSchemaNode(root, () => order.push('listener'));
    runtime.onChange = (value) => order.push(`change:${value}`);
    dispatchBatch(root, () => {
      dispatchSetValue(root, 'first');
      dispatchSetValue(root, 'last');
    });
    expect(order).toEqual(['listener', 'change:last']);
  });

  it('EVENT-031 omits onChange when emitted reference stays the same', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: unknown[] = [];
    runtime.onChange = (value) => seen.push(value);
    dispatchSetValue(root, 'same');
    dispatchSetValue(root, 'same');
    expect(seen).toEqual(['same']);
  });

  it('EVENT-032 reset with unchanged emit does not call onChange', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' }, 'same');
    dispatchMount(root, 'same');
    const seen: unknown[] = [];
    runtime.onChange = (value) => seen.push(value);
    runtime.validationMode = ValidationMode.OnChange;
    const before = runtime.validationStamp ?? 0;
    dispatchResetForm(root, 'same');
    expect(seen).toEqual([]);
    expect(runtime.validationStamp).toBe(before + 1);
    expect(runtime.validationPendingTargets?.has(root)).toBe(true);
  });

  it('EVENT-027 requests validation after delivery and before onChange', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const order: string[] = [];
    runtime.validationMode = ValidationMode.OnChange;
    subscribeSchemaNode(root, () => order.push('delivery'));
    const before = runtime.validationStamp ?? 0;
    runtime.onChange = () => {
      expect(runtime.validationStamp).toBe(before + 1);
      order.push('change');
    };
    dispatchSetValue(root, 'changed');
    expect(order).toEqual(['delivery', 'change']);
    expect(runtime.validationPendingTargets?.has(root)).toBe(true);
  });

  it('EVENT-033 treats a write inside onChange as a new entry', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: string[] = [];
    runtime.onChange = (value) => {
      seen.push(`${runtime.entryDepth}:${value}`);
      if (value === 'first') dispatchSetValue(root, 'second');
    };
    dispatchSetValue(root, 'first');
    expect(seen).toEqual(['0:first', '0:second']);
  });
});
