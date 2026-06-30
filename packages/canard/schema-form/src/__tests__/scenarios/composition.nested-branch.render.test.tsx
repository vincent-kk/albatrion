import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { SetValueOption } from '@/schema-form/core';

import { renderForm } from '../renderForm';

/**
 * GAP-14 — `__locked__`-suppressed UpdateChildren during nested/cascading
 * branch ops.
 *
 * Structure mirrored from stories/17.OneOf.tsx `ComplexNestedOneOf` and
 * stories/36.DerivedValue.tsx `NestedOneOfWithDerived`:
 *
 *   object
 *    └─ product : oneOf( physical | digital )           (OUTER discriminator)
 *         └─ (physical) shipping : object
 *              └─ oneOf( standard | express )            (INNER discriminator)
 *
 * When the OUTER discriminator flips, the parent (`product`) runs its reset
 * loop with `__locked__ = true`. While locked, the freshly-activated inner
 * `shipping` ObjectNode rebuilds its own oneOf children, and its
 * `__publishChildrenChange__` is dropped (early-returns when `__locked__`).
 * The inner React `useChildNodeComponents` snapshot therefore only recovers if
 * the inner node later runs an UNLOCKED cascade. These tests assert the inner
 * branch fields rendered in the DOM (`[data-path]` prefixed under
 * `/product/shipping/`) match the inner node tree's active branch — a dropped
 * inner UpdateChildren shows up as the wrong (or missing) inner field set.
 */

const PRODUCT = '/product';
const NAME = '/product/name';
const FILE_SIZE = '/product/fileSize';
const METHOD = '/product/shipping/method';
const COST = '/product/shipping/cost';
const DAYS = '/product/shipping/days';
const HOURS = '/product/shipping/hours';

const nestedSchema = {
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
          computed: { if: "../productType === 'physical'" },
          properties: {
            name: { type: 'string', default: 'Box' },
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
                  computed: { if: "./method === 'standard'" },
                  properties: {
                    cost: { type: 'number', default: 5 },
                    days: { type: 'number', default: 7 },
                  },
                },
                {
                  computed: { if: "./method === 'express'" },
                  properties: {
                    cost: { type: 'number', default: 15 },
                    hours: { type: 'number', default: 24 },
                  },
                },
              ],
            },
          },
        },
        {
          computed: { if: "../productType === 'digital'" },
          properties: {
            name: { type: 'string', default: 'License' },
            fileSize: { type: 'number', default: 256 },
          },
        },
      ],
    },
  },
} satisfies JsonSchema;

describe('GAP-14 nested composition: object -> oneOf -> (object -> oneOf)', () => {
  describe('initial mount priming', () => {
    it('primes the outer physical branch AND its inner standard branch on first render (two-phase)', async () => {
      const form = await renderForm(nestedSchema, { flushOnMount: false });

      // Synchronous snapshot: the root terminal is always primed.
      expect(form.field('/productType')).not.toBeNull();
      expect(form.value('/productType')).toBe('physical');

      // Settle the composition cascade.
      await form.flush();

      // DOM: outer physical branch + inner standard branch fully rendered.
      expect(form.exists(PRODUCT)).toBe(true);
      expect(form.exists(NAME)).toBe(true);
      expect(form.exists(METHOD)).toBe(true);
      expect(form.exists(COST)).toBe(true);
      expect(form.exists(DAYS)).toBe(true);
      // Inner inactive (express) + outer inactive (digital) fields absent.
      expect(form.exists(HOURS)).toBe(false);
      expect(form.exists(FILE_SIZE)).toBe(false);

      // DOM values reflect schema defaults (uncontrolled inputs).
      expect(form.value('/productType')).toBe('physical');
      expect(form.value(NAME)).toBe('Box');
      expect(form.value(METHOD)).toBe('standard');
      expect(form.value(COST)).toBe('5');
      expect(form.value(DAYS)).toBe('7');

      // Node tree agrees.
      expect(form.getValue()).toEqual({
        productType: 'physical',
        product: {
          name: 'Box',
          shipping: { method: 'standard', cost: 5, days: 7 },
        },
      });
      expect(form.node(METHOD)?.value).toBe('standard');
      expect(form.node(DAYS)?.value).toBe(7);
      // The inner express-branch node is retained in the tree but disabled.
      expect(form.node(HOURS)?.enabled).toBe(false);
      expect(form.caughtErrors()).toEqual([]);

      form.unmount();
    });
  });

  describe('outer discriminator switch', () => {
    it('removes the entire inner nested oneOf subtree when switching physical -> digital', async () => {
      const form = await renderForm(nestedSchema);

      expect(form.exists(METHOD)).toBe(true);
      expect(form.exists(COST)).toBe(true);

      await form.selectOption('/productType', 'digital');

      // Inner nested branch (and its discriminator) gone from DOM and tree.
      expect(form.exists(METHOD)).toBe(false);
      expect(form.exists(COST)).toBe(false);
      expect(form.exists(DAYS)).toBe(false);
      // The whole physical shipping subtree is disabled in the tree.
      expect(form.node('/product/shipping')?.enabled).toBe(false);

      // Outer digital branch present instead.
      expect(form.exists(FILE_SIZE)).toBe(true);
      expect(form.value(FILE_SIZE)).toBe('256');

      const value = form.getValue();
      expect(value.productType).toBe('digital');
      expect(value.product.fileSize).toBe(256);
      expect(value.product.shipping).toBeUndefined();
      expect(form.caughtErrors()).toEqual([]);

      form.unmount();
    });

    it('re-primes the inner standard branch in the DOM when re-entering the outer physical branch', async () => {
      const form = await renderForm(nestedSchema);

      // Leave physical for digital, then come back.
      await form.selectOption('/productType', 'digital');
      expect(form.exists(METHOD)).toBe(false);

      await form.selectOption('/productType', 'physical');

      // Core GAP-14: the inner standard branch must reappear in the DOM, not
      // stay stale/empty due to a dropped inner UpdateChildren.
      expect(form.exists(METHOD)).toBe(true);
      expect(form.exists(COST)).toBe(true);
      expect(form.exists(DAYS)).toBe(true);
      expect(form.exists(HOURS)).toBe(false);
      expect(form.exists(FILE_SIZE)).toBe(false);

      expect(form.value(METHOD)).toBe('standard');
      expect(form.value(COST)).toBe('5');
      expect(form.value(DAYS)).toBe('7');

      expect(form.node(METHOD)?.value).toBe('standard');
      expect(form.node(DAYS)?.value).toBe(7);
      expect(form.node(HOURS)?.enabled).toBe(false);
      expect(form.caughtErrors()).toEqual([]);

      form.unmount();
    });

    it('renders the inner EXPRESS branch when an outer switch carries an express selection (locked-reset re-prime)', async () => {
      // Start on the digital branch so the physical+express activation happens
      // entirely through the locked parent reset triggered by setValue.
      const form = await renderForm(nestedSchema, {
        defaultValue: { productType: 'digital' },
      });
      expect(form.exists(METHOD)).toBe(false);
      expect(form.exists(FILE_SIZE)).toBe(true);

      await form.setValue(
        {
          productType: 'physical',
          product: {
            name: 'Crate',
            shipping: { method: 'express', cost: 30, hours: 12 },
          },
        },
        SetValueOption.Overwrite,
      );

      // Inner active branch is EXPRESS: cost + hours, NOT days.
      expect(form.exists(METHOD)).toBe(true);
      expect(form.exists(COST)).toBe(true);
      expect(form.exists(HOURS)).toBe(true);
      expect(form.exists(DAYS)).toBe(false);
      expect(form.exists(FILE_SIZE)).toBe(false);

      expect(form.value(METHOD)).toBe('express');
      expect(form.value(COST)).toBe('30');
      expect(form.value(HOURS)).toBe('12');

      const value = form.getValue();
      expect(value.product.shipping).toEqual({
        method: 'express',
        cost: 30,
        hours: 12,
      });
      expect(form.node(DAYS)?.enabled).toBe(false);
      expect(form.node(HOURS)?.value).toBe(12);
      expect(form.caughtErrors()).toEqual([]);

      form.unmount();
    });
  });

  describe('inner discriminator switch (outer fixed on physical)', () => {
    it('swaps inner standard -> express fields without leaving duplicates', async () => {
      const form = await renderForm(nestedSchema);

      expect(form.exists(DAYS)).toBe(true);
      expect(form.exists(HOURS)).toBe(false);

      await form.selectOption(METHOD, 'express');

      // Exactly one cost field, days removed, hours added.
      expect(form.exists(DAYS)).toBe(false);
      expect(form.exists(HOURS)).toBe(true);
      expect(
        form.container.querySelectorAll(`[data-path="${COST}"]`).length,
      ).toBe(1);
      expect(
        form.container.querySelectorAll(`[data-path="${DAYS}"]`).length,
      ).toBe(0);

      // Inner discriminator stays under physical; outer untouched.
      expect(form.exists(NAME)).toBe(true);
      expect(form.value(METHOD)).toBe('express');

      const value = form.getValue();
      expect(value.productType).toBe('physical');
      expect(value.product.shipping.method).toBe('express');
      expect(value.product.shipping.days).toBeUndefined();
      expect(form.node(DAYS)?.enabled).toBe(false);
      expect(form.node(HOURS)?.enabled).toBe(true);
      expect(form.caughtErrors()).toEqual([]);

      form.unmount();
    });

    it('switches inner express -> standard back again, restoring the standard field set', async () => {
      const form = await renderForm(nestedSchema);

      await form.selectOption(METHOD, 'express');
      expect(form.exists(HOURS)).toBe(true);

      await form.selectOption(METHOD, 'standard');

      expect(form.exists(DAYS)).toBe(true);
      expect(form.exists(HOURS)).toBe(false);
      expect(form.node(HOURS)?.enabled).toBe(false);
      expect(form.node(DAYS)?.enabled).toBe(true);
      expect(form.getValue().product.shipping.method).toBe('standard');
      expect(form.caughtErrors()).toEqual([]);

      form.unmount();
    });
  });

  describe('remount identity (instrument)', () => {
    it('remounts the inner branch inputs when the outer discriminator toggles away and back', async () => {
      const form = await renderForm(nestedSchema, { instrument: true });

      const before = form.mountOrdinal(COST);
      expect(Number.isNaN(before)).toBe(false);

      // Toggle outer away (inner subtree unmounts) and back via programmatic
      // setValue. The re-entered inner input must be a fresh mount.
      await form.setValue({ productType: 'digital' }, SetValueOption.Overwrite);
      expect(form.exists(COST)).toBe(false);

      await form.setValue(
        { productType: 'physical' },
        SetValueOption.Overwrite,
      );

      expect(form.exists(COST)).toBe(true);
      const after = form.mountOrdinal(COST);
      expect(Number.isNaN(after)).toBe(false);
      expect(after).toBeGreaterThan(before);

      // Tree still consistent after the remount.
      expect(form.node(COST)?.value).toBe(5);
      expect(form.getValue().product.shipping.method).toBe('standard');
      expect(form.caughtErrors()).toEqual([]);

      form.unmount();
    });
  });

  describe('convergence and StrictMode', () => {
    it('converges with no infinite-loop errors across repeated outer/inner switches', async () => {
      const form = await renderForm(nestedSchema);

      await form.selectOption(METHOD, 'express');
      await form.selectOption('/productType', 'digital');
      await form.selectOption('/productType', 'physical');
      await form.selectOption(METHOD, 'express');
      await form.selectOption(METHOD, 'standard');

      // Steady state: physical + inner standard.
      expect(form.exists(DAYS)).toBe(true);
      expect(form.exists(HOURS)).toBe(false);
      expect(form.exists(FILE_SIZE)).toBe(false);
      expect(form.getValue().product.shipping.method).toBe('standard');
      expect(
        form.caughtErrors().some((m) => m.includes('INFINITE_LOOP_DETECTED')),
      ).toBe(false);
      expect(form.caughtErrors()).toEqual([]);

      form.unmount();
    });

    it('renders the inner standard branch after an outer switch under StrictMode', async () => {
      const form = await renderForm(nestedSchema, { strictMode: true });

      await form.selectOption('/productType', 'digital');
      expect(form.exists(METHOD)).toBe(false);

      await form.selectOption('/productType', 'physical');

      // Subscribe-before-microtask race (double-invoked layout effects) must
      // still deliver the inner branch UpdateChildren.
      expect(form.exists(METHOD)).toBe(true);
      expect(form.exists(COST)).toBe(true);
      expect(form.exists(DAYS)).toBe(true);
      expect(form.exists(HOURS)).toBe(false);

      expect(form.value(METHOD)).toBe('standard');
      expect(form.value(COST)).toBe('5');
      expect(form.node(DAYS)?.value).toBe(7);
      expect(form.node(HOURS)?.enabled).toBe(false);
      expect(form.caughtErrors()).toEqual([]);

      form.unmount();
    });
  });
});
