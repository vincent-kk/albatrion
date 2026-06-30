import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import type { NumberNode, StringNode } from '@/schema-form';
import { SetValueOption } from '@/schema-form/core';

import { renderForm } from '../renderForm';

/**
 * Uncontrolled-input refresh contract (GAP-9 / GAP-12).
 *
 * The built-in (and instrumented) FormTypeInputs are UNCONTROLLED — they read
 * `node.value` into `defaultValue`, which is only re-captured when the input
 * remounts via the `RequestRefresh` cascade. `RequestRefresh` is published only
 * when `SetValueOption.Refresh` is part of the option set (Overwrite / Merge /
 * StableReset). A value change that lacks `Refresh` updates `node.value` but
 * leaves the uncontrolled DOM input untouched — an INTENTIONAL divergence this
 * suite pins.
 *
 * Every test asserts BOTH the node tree (node(path).value / getValue) AND the
 * rendered DOM (value / mountOrdinal / exists). `instrument: true` exposes the
 * `data-mount` ordinal so remount-vs-reuse is observable, not just final values.
 */
describe('uncontrolled-value refresh contract', () => {
  // ---------------------------------------------------------------------------
  // GAP-9 — RequestRefresh-gated uncontrolled value via external setValue
  // ---------------------------------------------------------------------------
  describe('GAP-9: external setValue refresh gating', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', default: 'initial' },
        count: { type: 'number', default: 5 },
      },
    };

    it('Overwrite remounts the input and the DOM reflects the new value', async () => {
      const form = await renderForm(schema, { instrument: true });

      // baseline: uncontrolled DOM seeded from the schema default
      expect(form.value('/name')).toBe('initial');
      expect(form.node('/name')?.value).toBe('initial');
      const before = form.mountOrdinal('/name');
      expect(Number.isNaN(before)).toBe(false);

      await act(async () => {
        (form.node('/name')! as StringNode).setValue(
          'overwritten',
          SetValueOption.Overwrite,
        );
        await new Promise((r) => setTimeout(r, 0));
      });

      // tree updated AND DOM updated because Refresh remounted the input
      expect(form.node('/name')?.value).toBe('overwritten');
      expect(form.getValue()?.name).toBe('overwritten');
      expect(form.value('/name')).toBe('overwritten');
      expect(form.mountOrdinal('/name')).toBeGreaterThan(before);
      expect(form.caughtErrors()).toEqual([]);
    });

    it('a non-Refresh setValue updates the node value but the uncontrolled DOM keeps the old value', async () => {
      const form = await renderForm(schema, { instrument: true });

      expect(form.value('/name')).toBe('initial');
      const before = form.mountOrdinal('/name');

      // SetValueOption.Default carries EmitChange|PublishUpdateEvent but NOT Refresh
      await act(async () => {
        (form.node('/name')! as StringNode).setValue(
          'quiet',
          SetValueOption.Default,
        );
        await new Promise((r) => setTimeout(r, 0));
      });

      // node tree advanced...
      expect(form.node('/name')?.value).toBe('quiet');
      // ...but the uncontrolled DOM input was NOT remounted, so it is stale.
      expect(form.value('/name')).toBe('initial');
      expect(form.mountOrdinal('/name')).toBe(before);
      expect(form.caughtErrors()).toEqual([]);
    });

    it('Overwrite on a number field remounts and updates the numeric DOM value', async () => {
      const form = await renderForm(schema, { instrument: true });

      expect(form.value('/count')).toBe('5');
      expect(form.node('/count')?.value).toBe(5);
      const before = form.mountOrdinal('/count');

      await act(async () => {
        (form.node('/count')! as NumberNode).setValue(
          42,
          SetValueOption.Overwrite,
        );
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(form.node('/count')?.value).toBe(42);
      expect(form.value('/count')).toBe('42');
      expect(form.mountOrdinal('/count')).toBeGreaterThan(before);
    });

    it('reset restores the default DOM value by remounting the input', async () => {
      const form = await renderForm(schema, { instrument: true });

      await form.type('/name', 'edited');
      expect(form.value('/name')).toBe('edited');
      expect(form.node('/name')?.value).toBe('edited');
      const beforeReset = form.mountOrdinal('/name');

      await form.reset();

      // StableReset carries Refresh → input remounted with the default again
      expect(form.node('/name')?.value).toBe('initial');
      expect(form.value('/name')).toBe('initial');
      expect(form.mountOrdinal('/name')).toBeGreaterThan(beforeReset);
    });
  });

  // ---------------------------------------------------------------------------
  // GAP-9 — user typing must NOT remount (identity preserved)
  // ---------------------------------------------------------------------------
  describe('GAP-9: user typing identity', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string', default: 'initial' } },
    };

    it('user typing updates the node value without remounting the input', async () => {
      const form = await renderForm(schema, { instrument: true });
      const before = form.mountOrdinal('/name');

      await form.type('/name', 'typed');

      // typing publishes UpdateValue (no Refresh) → same component instance
      expect(form.node('/name')?.value).toBe('typed');
      expect(form.value('/name')).toBe('typed');
      expect(form.mountOrdinal('/name')).toBe(before);
    });

    it('Overwrite after typing remounts and replaces the typed DOM value', async () => {
      const form = await renderForm(schema, { instrument: true });

      await form.type('/name', 'typed');
      const afterTyping = form.mountOrdinal('/name');
      expect(form.value('/name')).toBe('typed');

      await act(async () => {
        (form.node('/name')! as StringNode).setValue(
          'forced',
          SetValueOption.Overwrite,
        );
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(form.node('/name')?.value).toBe('forced');
      expect(form.value('/name')).toBe('forced');
      expect(form.mountOrdinal('/name')).toBeGreaterThan(afterTyping);
    });
  });

  // ---------------------------------------------------------------------------
  // GAP-12 — default-value seeding on branch entry reaches freshly mounted DOM
  // ---------------------------------------------------------------------------
  describe('GAP-12: branch-entry default seeding', () => {
    const branchSchema: JsonSchema = {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['game', 'movie'], default: 'game' },
      },
      oneOf: [
        {
          '&if': "./category === 'game'",
          properties: { platform: { type: 'string', default: 'switch' } },
        },
        {
          '&if': "./category === 'movie'",
          properties: { director: { type: 'string', default: 'nolan' } },
        },
      ],
    };

    it('initial active branch fields mount with their schema defaults in the DOM', async () => {
      const form = await renderForm(branchSchema, { instrument: true });

      // 'game' branch active by default
      expect(form.exists('/platform')).toBe(true);
      expect(form.exists('/director')).toBe(false);
      // freshly mounted uncontrolled input shows the branch default
      expect(form.node('/platform')?.value).toBe('switch');
      expect(form.value('/platform')).toBe('switch');
      expect(form.getValue()?.platform).toBe('switch');
    });

    it('entering a branch via condition change mounts inputs showing the branch default', async () => {
      const form = await renderForm(branchSchema, { instrument: true });

      await form.setValue({ category: 'movie' }, SetValueOption.Overwrite);
      await form.flush();

      // old branch gone, new branch mounted
      expect(form.exists('/platform')).toBe(false);
      expect(form.exists('/director')).toBe(true);
      // newly mounted input seeded with the branch default (uncontrolled)
      expect(form.node('/director')?.value).toBe('nolan');
      expect(form.value('/director')).toBe('nolan');
      expect(form.getValue()?.director).toBe('nolan');
      expect(form.caughtErrors()).toEqual([]);
    });

    it('switching back and forth re-seeds each branch default into freshly mounted inputs', async () => {
      const form = await renderForm(branchSchema, { instrument: true });

      await form.setValue({ category: 'movie' }, SetValueOption.Overwrite);
      await form.flush();
      expect(form.value('/director')).toBe('nolan');

      await form.setValue({ category: 'game' }, SetValueOption.Overwrite);
      await form.flush();

      // re-entering 'game' remounts platform with its default once more
      expect(form.exists('/director')).toBe(false);
      expect(form.exists('/platform')).toBe(true);
      expect(form.node('/platform')?.value).toBe('switch');
      expect(form.value('/platform')).toBe('switch');
    });

    it('entering a branch seeds nested object field defaults into the DOM', async () => {
      const nestedSchema: JsonSchema = {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['off', 'on'], default: 'off' },
        },
        oneOf: [
          {
            '&if': "./mode === 'on'",
            properties: {
              profile: {
                type: 'object',
                properties: {
                  name: { type: 'string', default: 'harry' },
                  age: { type: 'number', default: 9 },
                },
              },
            },
          },
        ],
      };

      const form = await renderForm(nestedSchema, { instrument: true });

      // branch inactive at start → nested fields absent
      expect(form.exists('/profile/name')).toBe(false);

      await form.setValue({ mode: 'on' }, SetValueOption.Overwrite);
      await form.flush();

      // nested branch fields mounted with their schema defaults
      expect(form.exists('/profile/name')).toBe(true);
      expect(form.node('/profile/name')?.value).toBe('harry');
      expect(form.node('/profile/age')?.value).toBe(9);
      expect(form.value('/profile/name')).toBe('harry');
      expect(form.value('/profile/age')).toBe('9');
      expect(form.getValue()?.profile).toEqual({ name: 'harry', age: 9 });
    });
  });
});
