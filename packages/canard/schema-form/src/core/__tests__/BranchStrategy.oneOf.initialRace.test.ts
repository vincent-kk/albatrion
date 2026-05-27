import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

/**
 * Regression guards for the BranchStrategy oneOf initial-render race.
 *
 * Background — what the race was:
 *   1. `nodeFromJsonSchema` is called synchronously inside `useMemo` during
 *      React render.
 *   2. `host.oneOfIndex` is computed synchronously inside
 *      `super.__initialize__()`.
 *   3. Prior to the fix, the listener that rebuilt `__children__` from that
 *      index was registered against `UpdateComputedProperties`, whose
 *      dispatch is deferred to a microtask.
 *   4. React captures `node.children` via `useState(node.children)`
 *      synchronously during render — BEFORE that microtask drains. In
 *      hydration-recovery renders (React #418), the cascading `UpdateChildren`
 *      could arrive after the subscription had already taken its snapshot,
 *      so the oneOf branch never appeared until the user changed a value.
 *
 * The fix: `BranchStrategy.initialize()` now calls
 * `__settleInitialCompositionChildren__()` synchronously after the children
 * are initialised, so `node.children` is complete by the time it is exposed
 * to React. These tests guard that contract.
 */

const employmentSchema: JsonSchema = {
  type: 'object',
  properties: {
    employmentType: {
      type: 'string',
      enum: ['full_time', 'part_time', 'contractor'],
      default: 'full_time',
    },
    commonField: { type: 'string' },
  },
  oneOf: [
    {
      properties: {
        employmentType: { const: 'full_time' },
        salary: { type: 'number', default: 60000 },
        bonus: { type: 'number', default: 5000 },
      },
    },
    {
      properties: {
        employmentType: { const: 'part_time' },
        contractType: { type: 'string', default: 'fixed_term' },
        workingHours: { type: 'number', default: 20 },
      },
    },
  ],
};

describe('BranchStrategy oneOf - initial-render race', () => {
  it('SYNC immediately after construction: oneOf children are already wired in', () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: employmentSchema,
    }) as ObjectNode;

    const syncChildren = node.children?.map((c) => c.node.name) ?? [];
    const syncOneOfIndex = node.oneOfIndex;

    // After the fix, `node.children` exposed to React during the first render
    // already includes the active oneOf branch — no microtask drain needed.
    // eslint-disable-next-line no-console
    console.log(
      '[SYNC] children:',
      syncChildren,
      'oneOfIndex:',
      syncOneOfIndex,
    );

    expect(syncOneOfIndex).toBe(0);
    expect(syncChildren).toContain('employmentType');
    expect(syncChildren).toContain('commonField');
    expect(syncChildren).toContain('salary');
    expect(syncChildren).toContain('bonus');
  });

  it('AFTER microtask drain: BranchStrategy resolves children correctly', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: employmentSchema,
    }) as ObjectNode;

    // Microtasks fire — BranchStrategy's UpdateComputedProperties listener runs,
    // __processChildren__ rebuilds __children__ with the active oneOf branch.
    await delay();

    const settledChildren = node.children?.map((c) => c.node.name) ?? [];
    const settledOneOfIndex = node.oneOfIndex;

    // eslint-disable-next-line no-console
    console.log(
      '[SETTLED] children:',
      settledChildren,
      'oneOfIndex:',
      settledOneOfIndex,
    );

    expect(settledOneOfIndex).toBe(0);
    expect(settledChildren).toContain('employmentType');
    expect(settledChildren).toContain('salary');
    expect(settledChildren).toContain('bonus');
  });

  it('SIMULATED REACT MOUNT: subscriber attached after the cascading UpdateChildren', async () => {
    // This simulates what useChildNodeComponents does:
    //   1) const [children, setChildren] = useState(node.children); // sync capture
    //   2) useLayoutEffect(() => node.subscribe(handler), []);       // attach after commit
    //
    // Between (1) and (2), only synchronous code runs in React's render+commit cycle,
    // so the microtask-deferred UpdateChildren has NOT fired yet by the time we
    // attach. We then verify that the subscriber receives the event and that
    // `node.children` carries the oneOf children at that point.

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: employmentSchema,
    }) as ObjectNode;

    // (1) React captures initial children sync
    const initialChildren = node.children?.map((c) => c.node.name) ?? [];
    // (2) React commits, useLayoutEffect runs — attach subscriber
    let observedUpdateChildren = false;
    let childrenAfterEvent: string[] = [];
    const unsubscribe = node.subscribe(({ type }) => {
      // NodeEventType.UpdateChildren = BIT_FLAG_07 = 1 << 7 = 128
      if (type & 128) {
        observedUpdateChildren = true;
        childrenAfterEvent = node.children?.map((c) => c.node.name) ?? [];
      }
    });

    // Drain microtasks (this is where the cascading UpdateChildren is dispatched)
    await delay();
    unsubscribe();

    // eslint-disable-next-line no-console
    console.log('initial:', initialChildren);
    // eslint-disable-next-line no-console
    console.log('observed UpdateChildren:', observedUpdateChildren);
    // eslint-disable-next-line no-console
    console.log('children after event:', childrenAfterEvent);

    // Subscriber MUST receive UpdateChildren so the React component can refresh.
    expect(observedUpdateChildren).toBe(true);
    expect(childrenAfterEvent).toContain('salary');
  });

  it('NESTED oneOf (product-catalog shape): nested BranchStrategy must also recover', async () => {
    // Reproduces the product-catalog scenario: outer oneOf at root,
    // inner oneOf on a nested object (`shipping`).
    const productSchema: JsonSchema = {
      type: 'object',
      properties: {
        productType: {
          type: 'string',
          enum: ['physical', 'digital'],
          default: 'physical',
        },
        product: {
          type: 'object',
          oneOf: [
            {
              '&if': "../productType === 'physical'",
              properties: {
                name: { type: 'string', default: 'Headphones' },
                shipping: {
                  type: 'object',
                  properties: {
                    method: {
                      type: 'string',
                      enum: ['standard', 'express'],
                      default: 'standard',
                    },
                  },
                  oneOf: [
                    {
                      '&if': "./method === 'standard'",
                      properties: {
                        days: { type: 'number', default: 7 },
                      },
                    },
                    {
                      '&if': "./method === 'express'",
                      properties: {
                        hours: { type: 'number', default: 24 },
                      },
                    },
                  ],
                },
              },
            },
            {
              '&if': "../productType === 'digital'",
              properties: {
                name: { type: 'string', default: 'Pack' },
                fileSize: { type: 'number', default: 256 },
              },
            },
          ],
        },
      },
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: productSchema,
    }) as ObjectNode;

    // Sync snapshot — fix ensures both outer and inner BranchStrategy have
    // their oneOf branch already settled before the constructor returns.
    const product = node.find('product') as ObjectNode | null;
    expect(product).not.toBeNull();
    const productSyncChildren =
      product?.children?.map((c) => c.node.name) ?? [];
    // eslint-disable-next-line no-console
    console.log('[SYNC] product.children:', productSyncChildren);
    expect(productSyncChildren).toContain('name');
    expect(productSyncChildren).toContain('shipping');

    await delay();

    const productSettled = product?.children?.map((c) => c.node.name) ?? [];
    // eslint-disable-next-line no-console
    console.log('[SETTLED] product.children:', productSettled);
    expect(productSettled).toContain('name');
    expect(productSettled).toContain('shipping');

    const shipping = product?.find('shipping') as ObjectNode | null;
    const shippingChildren = shipping?.children?.map((c) => c.node.name) ?? [];
    // eslint-disable-next-line no-console
    console.log('[SETTLED] shipping.children:', shippingChildren);
    expect(shippingChildren).toContain('method');
    expect(shippingChildren).toContain('days');
  });
});
