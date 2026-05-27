import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

/**
 * Reproduction tests for BranchStrategy oneOf initial-render race.
 *
 * The thesis under test:
 *   1. `nodeFromJsonSchema` is called synchronously inside `useMemo` during React render.
 *   2. Inside the BranchStrategy constructor, `__children__` is initialised to
 *      `__propertyChildren__` (regular props only) BEFORE the oneOf branch is wired in.
 *   3. The oneOf branch children are appended later, when the
 *      `UpdateComputedProperties` listener fires inside a microtask.
 *   4. React captures `node.children` via `useState(node.children)` during render —
 *      i.e. SYNCHRONOUSLY, before that microtask runs.
 *   5. If anything dropped or delayed the follow-up `UpdateChildren` event, the form
 *      would render with only the property children and the oneOf branch fields
 *      would never appear.
 *
 * Production builds compress timing windows; dev mode (StrictMode double mount +
 * slower JS) often hides this race. That matches the user's report.
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
  it('SYNC immediately after construction: shows the bug snapshot', () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: employmentSchema,
    }) as ObjectNode;

    const syncChildren = node.children?.map((c) => c.node.name) ?? [];
    const syncOneOfIndex = node.oneOfIndex;

    // What React sees when capturing initial state via useState(node.children):
    //   - oneOf branch children NOT yet present
    //   - oneOfIndex still -1 (BranchStrategy listener hasn't run yet)
    // This snapshot documents the race window.
    // eslint-disable-next-line no-console
    console.log(
      '[SYNC] children:',
      syncChildren,
      'oneOfIndex:',
      syncOneOfIndex,
    );

    // The bug surface: salary/bonus (oneOf branch 0 fields) are NOT in children
    // immediately after construction even though employmentType defaults to full_time.
    expect(syncChildren).not.toContain('salary');
    expect(syncChildren).not.toContain('bonus');
    expect(syncOneOfIndex).toBe(-1);
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

    // Sync snapshot — both outer and inner BranchStrategy are still on initial children
    const product = node.find('product') as ObjectNode | null;
    expect(product).not.toBeNull();
    const productSyncChildren =
      product?.children?.map((c) => c.node.name) ?? [];
    // eslint-disable-next-line no-console
    console.log('[SYNC] product.children:', productSyncChildren);

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
