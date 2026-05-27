import { useState } from 'react';

import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { Form } from '../Form';

/**
 * Reproduction of the production issue:
 *   - employment-contract: oneOf at ROOT, with `const`-based branch matching.
 *     Default value is `full_time`; on initial mount the oneOf branch fields
 *     (salary/bonus/benefits/probationPeriod) MUST be rendered without any
 *     user interaction.
 *
 *   - product-catalog: oneOf at NESTED level (`product` sub-object).
 *     This case is reported as also affected.
 *
 * The unit-level race tests in `BranchStrategy.oneOf.initialRace.test.ts`
 * already show that `node.children` SYNCHRONOUSLY after construction does NOT
 * yet contain the oneOf branch — they are appended later, via the
 * `UpdateComputedProperties → __processChildren__ → UpdateChildren` cascade
 * that runs in a microtask AFTER `nodeFromJsonSchema` returns.
 *
 * The React layer (`useChildNodeComponents`) is supposed to:
 *   1. Capture `node.children` via `useState(node.children)` synchronously
 *      during render — i.e. BEFORE the microtask drains.
 *   2. Attach the subscription in `useLayoutEffect` — i.e. AFTER React commits
 *      the first render.
 *   3. Receive the cascading `UpdateChildren` event from the microtask, and
 *      re-render with the now-complete children list.
 *
 * If step 3 does NOT trigger a re-render, the oneOf branch fields are
 * permanently invisible until the user changes a value (which fires its own
 * `UpdateChildren` cascade). The deployed pages match that symptom exactly.
 */

describe('BranchStrategy oneOf - React initial-mount visibility', () => {
  it('renders root-level oneOf branch fields on initial mount (employment-contract)', async () => {
    const schema: JsonSchema = {
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

    const Wrapper = () => {
      const [values, setValues] = useState<unknown>({});
      return <Form jsonSchema={schema as any} onChange={setValues} />;
    };

    await act(async () => {
      render(<Wrapper />);
    });

    // Wait for any pending microtasks to drain (mimics what should be done by
    // the subscription cascade — if React doesn't pick up the event, this
    // delay alone does NOT fix it).
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const labels = screen
      .queryAllByText(/employmentType|commonField|salary|bonus/i)
      .map((el) => el.textContent?.trim());
    // eslint-disable-next-line no-console
    console.log('[employment-contract] rendered labels:', labels);

    // The actual contract: salary and bonus from the full_time branch must
    // be in the DOM after mount.
    expect(screen.queryByText('salary')).not.toBeNull();
    expect(screen.queryByText('bonus')).not.toBeNull();
  });

  it('renders nested oneOf branch fields on initial mount (product-catalog shape)', async () => {
    const schema: JsonSchema = {
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
                weight: { type: 'number', default: 0.25 },
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

    const Wrapper = () => {
      const [values, setValues] = useState<unknown>({});
      return <Form jsonSchema={schema as any} onChange={setValues} />;
    };

    await act(async () => {
      render(<Wrapper />);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const labels = screen
      .queryAllByText(/productType|name|weight|fileSize/i)
      .map((el) => el.textContent?.trim());
    // eslint-disable-next-line no-console
    console.log('[product-catalog shape] rendered labels:', labels);

    expect(screen.queryByText('name')).not.toBeNull();
    expect(screen.queryByText('weight')).not.toBeNull();
  });
});
