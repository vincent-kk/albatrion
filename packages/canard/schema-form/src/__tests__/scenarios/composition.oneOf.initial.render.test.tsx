import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * Initial-mount priming of a default-selected oneOf branch.
 *
 * Two-phase pattern throughout: `renderForm(schema, { flushOnMount: false })`
 * captures the SYNCHRONOUS post-commit snapshot (before the microtask cascade
 * drains); `await form.flush()` then settles the cascade.
 *
 * What the probes established about this build (verified, not assumed):
 *  - The node tree is fully primed SYNCHRONOUSLY: the default-selected branch's
 *    child is already in `root.children`, the child node is `enabled`
 *    (scoped && active && visible), and its schema/default value is seeded
 *    (`getValue()` includes it). `__primeInitialBranch__` does its job at the
 *    tree level.
 *  - The branch children's `__scoped__`/enable settles via the microtask
 *    cascade (by design — synchronous priming was reverted for value-priority
 *    regressions), so the first RENDER pass necessarily reads a pre-settle
 *    snapshot. The DOM still converges at first paint because the tracker
 *    rides the delivery ledger (`node.revision` + useSyncExternalStore) and
 *    resyncs on the cascade's deliveries within the same microtask drain.
 *
 * → GAP-1 (resolved in CSR): the divergence window is closed by the delivery
 *   ledger — `useSchemaNodeTracker` consumes `node.revision(mask)` through
 *   `useSyncExternalStore`, so cascade deliveries force a sync-lane resync
 *   render within the same microtask drain (observable below: the branch
 *   field is already in the DOM at the post-render snapshot), and deliveries
 *   landing in a concurrent mount's render→commit gap are re-detected at
 *   commit instead of being lost (see
 *   composition.oneOf.concurrentMount.render.test.tsx for that repro).
 *   SSR/`renderToString` remains out of scope — no effects/stores run there,
 *   so a synchronous first-paint DOM still requires the model pre-settled
 *   before mount (option C). The post-flush behavior is unchanged: the DOM
 *   converges and the seeded branch defaults are NOT clobbered (GAP-2).
 *
 * Schemas mirror stories/17.OneOf and stories/06.IfThenElse, kept compact.
 * Inputs are the built-in uncontrolled FormTypeInputs (no custom definitions),
 * so DOM value assertions also exercise the RequestRefresh/defaultValue path.
 */
describe('composition.oneOf — initial branch priming', () => {
  // ---------------------------------------------------------------------------
  // GAP-1 (resolved in CSR) — tree primed synchronously AND the DOM converges
  // within the same microtask drain via the delivery-ledger resync. SSR still
  // needs option C (model pre-settled before mount) — no stores run there.
  // ---------------------------------------------------------------------------
  describe('default-selected branch primed in tree and present at first paint (GAP-1 resolved)', () => {
    it('first branch (index 0)', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'movie'],
            default: 'game',
          },
        },
        oneOf: [
          {
            computed: { if: "./category === 'game'" },
            properties: { gamePrice: { type: 'number' } },
          },
          {
            computed: { if: "./category === 'movie'" },
            properties: { moviePrice: { type: 'number', minimum: 50 } },
          },
        ],
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Node tree is correctly primed synchronously.
      expect(form.node('/gamePrice')).not.toBeNull();
      expect((form.node('/gamePrice') as any).enabled).toBe(true);
      expect(form.getValue()?.category).toBe('game');
      // Inactive branch correctly excluded from the value tree + DOM.
      expect(form.getValue()).not.toHaveProperty('moviePrice');
      expect(form.exists('/moviePrice')).toBe(false);

      // The active branch field reaches the DOM within the same drain.
      expect(form.exists('/gamePrice')).toBe(true);
    });

    it('non-first branch (index 2)', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'movie', 'console'],
            default: 'console',
          },
        },
        oneOf: [
          {
            computed: { if: "./category === 'game'" },
            properties: { gamePrice: { type: 'number' } },
          },
          {
            computed: { if: "./category === 'movie'" },
            properties: { moviePrice: { type: 'number', minimum: 50 } },
          },
          {
            computed: { if: "./category === 'console'" },
            properties: { consolePrice: { type: 'number', default: 100 } },
          },
        ],
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Tree: index-2 branch primed with its default value.
      expect(form.node('/consolePrice')?.value).toBe(100);
      expect(form.getValue()).toMatchObject({
        category: 'console',
        consolePrice: 100,
      });
      expect(form.getValue()).not.toHaveProperty('gamePrice');
      expect(form.exists('/gamePrice')).toBe(false);

      // Present at first paint (ledger resync).
      expect(form.exists('/consolePrice')).toBe(true);
    });

    it('const-discriminated branch (index 2)', async () => {
      const schema = {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['admin', 'editor', 'viewer'],
            default: 'viewer',
          },
        },
        oneOf: [
          {
            properties: {
              role: { const: 'admin' },
              adminLevel: { type: 'number', default: 5 },
            },
          },
          {
            properties: {
              role: { const: 'editor' },
              editGroup: { type: 'string', default: 'g1' },
            },
          },
          {
            properties: {
              role: { const: 'viewer' },
              viewMode: { type: 'string', default: 'compact' },
            },
          },
        ],
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Tree: const-matched 'viewer' branch primed with its default.
      expect(form.node('/viewMode')?.value).toBe('compact');
      expect(form.getValue()).not.toHaveProperty('adminLevel');
      expect(form.exists('/adminLevel')).toBe(false);

      // Present at first paint (ledger resync).
      expect(form.exists('/viewMode')).toBe(true);
    });

    it('nested object oneOf branch', async () => {
      const schema = {
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
                properties: { weight: { type: 'number', default: 0.25 } },
              },
              {
                computed: { if: "../productType === 'digital'" },
                properties: { fileSize: { type: 'number', default: 256 } },
              },
            ],
          },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Tree: nested physical branch primed; container DOM renders.
      expect(form.node('/product/weight')?.value).toBe(0.25);
      expect(form.getValue()?.product).not.toHaveProperty('fileSize');
      expect(form.exists('/product')).toBe(true);
      expect(form.exists('/product/fileSize')).toBe(false);

      // The nested branch child reaches the DOM within the same drain.
      expect(form.exists('/product/weight')).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // GAP-2 — after the cascade, the DOM converges and the seeded branch defaults
  // persist (no clobber to empty/schema-default). These pass.
  // ---------------------------------------------------------------------------
  describe('branch defaults converge to DOM and survive the cascade (GAP-2)', () => {
    it('keeps a single branch schema default through the cascade (no clobber)', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'console'],
            default: 'console',
          },
        },
        oneOf: [
          {
            computed: { if: "./category === 'game'" },
            properties: { gamePrice: { type: 'number' } },
          },
          {
            computed: { if: "./category === 'console'" },
            properties: { consolePrice: { type: 'number', default: 100 } },
          },
        ],
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Sync phase: tree already primed with the default.
      expect(form.node('/consolePrice')?.value).toBe(100);

      await form.flush();

      // DOM converged and value persisted (did not flip to empty).
      expect(form.exists('/consolePrice')).toBe(true);
      expect(form.value('/consolePrice')).toBe('100');
      expect(form.node('/consolePrice')?.value).toBe(100);
      expect(form.exists('/gamePrice')).toBe(false);

      // Second drain: still stable (clobber guard).
      await form.flush();
      expect(form.value('/consolePrice')).toBe('100');
      expect(form.getValue()).toMatchObject({
        category: 'console',
        consolePrice: 100,
      });
    });

    it('keeps multiple branch defaults (branch index 1) after flush', async () => {
      const schema = {
        type: 'object',
        properties: {
          profile: { type: 'string', enum: ['dev', 'prod'], default: 'prod' },
        },
        oneOf: [
          {
            '&if': "./profile === 'dev'",
            properties: {
              debug: { type: 'boolean', default: true },
              logLevel: { type: 'string', default: 'verbose' },
              port: { type: 'number', default: 3000 },
            },
          },
          {
            '&if': "./profile === 'prod'",
            properties: {
              debug: { type: 'boolean', default: false },
              logLevel: { type: 'string', default: 'error' },
              port: { type: 'number', default: 8080 },
              secure: { type: 'boolean', default: true },
            },
          },
        ],
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Sync phase: prod branch (index 1) primed in the tree.
      expect(form.node('/secure')?.value).toBe(true);
      expect(form.node('/logLevel')?.value).toBe('error');

      await form.flush();

      // DOM converged with all defaults intact.
      expect(form.exists('/secure')).toBe(true);
      expect(form.value('/logLevel')).toBe('error');
      expect(form.value('/port')).toBe('8080');
      expect(form.checked('/secure')).toBe(true);
      expect(form.checked('/debug')).toBe(false);
      expect(form.getValue()).toMatchObject({
        profile: 'prod',
        logLevel: 'error',
        port: 8080,
        secure: true,
        debug: false,
      });
    });

    it('keeps a form defaultValue-seeded branch field after flush', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'movie', 'console'],
            default: 'game',
          },
        },
        oneOf: [
          {
            computed: { if: "./category === 'game'" },
            properties: { gamePrice: { type: 'number' } },
          },
          {
            computed: { if: "./category === 'movie'" },
            properties: { moviePrice: { type: 'number', minimum: 50 } },
          },
          {
            computed: { if: "./category === 'console'" },
            properties: { consolePrice: { type: 'number', default: 100 } },
          },
        ],
      } satisfies JsonSchema;

      // defaultValue overrides the schema default and selects the movie branch.
      const form = await renderForm(schema, {
        flushOnMount: false,
        defaultValue: { category: 'movie', moviePrice: 75 },
      });

      // Sync phase: tree primed with the seeded branch value.
      expect(form.node('/moviePrice')?.value).toBe(75);
      expect(form.getValue()).not.toHaveProperty('gamePrice');

      await form.flush();

      // Seeded value survives the cascade and reaches the DOM.
      expect(form.exists('/moviePrice')).toBe(true);
      expect(form.value('/moviePrice')).toBe('75');
      expect(form.node('/moviePrice')?.value).toBe(75);
      expect(form.exists('/gamePrice')).toBe(false);
      expect(form.getValue()).toMatchObject({
        category: 'movie',
        moviePrice: 75,
      });
    });

    it('keeps a const-discriminated branch default through the cascade', async () => {
      const schema = {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['admin', 'viewer'],
            default: 'viewer',
          },
        },
        oneOf: [
          {
            properties: {
              role: { const: 'admin' },
              adminLevel: { type: 'number', default: 5 },
            },
          },
          {
            properties: {
              role: { const: 'viewer' },
              viewMode: { type: 'string', default: 'compact' },
            },
          },
        ],
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Sync phase: const-matched branch primed in the tree.
      expect(form.node('/viewMode')?.value).toBe('compact');

      await form.flush();

      // DOM converged; inactive branch absent.
      expect(form.exists('/viewMode')).toBe(true);
      expect(form.value('/viewMode')).toBe('compact');
      expect(form.exists('/adminLevel')).toBe(false);
      expect(form.getValue()).not.toHaveProperty('adminLevel');
      expect(form.getValue()).toMatchObject({
        role: 'viewer',
        viewMode: 'compact',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Nested oneOf — settled DOM + persisted defaults after the cascade.
  // ---------------------------------------------------------------------------
  describe('nested object oneOf settled render (GAP-1 recovery / GAP-2)', () => {
    it('converges a doubly-nested oneOf branch and persists its default', async () => {
      const schema = {
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
                  weight: { type: 'number', default: 0.25 },
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
                          cost: { type: 'number', default: 5.99 },
                        },
                      },
                      {
                        computed: { if: "./method === 'express'" },
                        properties: {
                          hours: { type: 'number', default: 24 },
                        },
                      },
                    ],
                  },
                },
              },
              {
                computed: { if: "../productType === 'digital'" },
                properties: { fileSize: { type: 'number', default: 256 } },
              },
            ],
          },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Sync phase: deepest nested branch primed in the tree.
      expect(form.node('/product/shipping/cost')?.value).toBe(5.99);

      await form.flush();

      // DOM converged at the deepest level; inactive sibling absent.
      expect(form.exists('/product/shipping')).toBe(true);
      expect(form.exists('/product/shipping/cost')).toBe(true);
      expect(form.value('/product/shipping/cost')).toBe('5.99');
      expect(form.exists('/product/shipping/hours')).toBe(false);
      expect(form.node('/product/shipping/cost')?.value).toBe(5.99);
      expect(form.getValue()?.product?.shipping).toMatchObject({
        method: 'standard',
        cost: 5.99,
      });
      expect(form.caughtErrors()).toEqual([]);
    });

    it('converges the active nested branch and omits the inactive one', async () => {
      const schema = {
        type: 'object',
        properties: {
          productType: {
            type: 'string',
            enum: ['physical', 'digital'],
            default: 'digital',
          },
          product: {
            type: 'object',
            oneOf: [
              {
                computed: { if: "../productType === 'physical'" },
                properties: { weight: { type: 'number', default: 0.25 } },
              },
              {
                computed: { if: "../productType === 'digital'" },
                properties: { fileSize: { type: 'number', default: 256 } },
              },
            ],
          },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Sync phase: digital branch (index 1) primed; physical excluded.
      expect(form.node('/product/fileSize')?.value).toBe(256);
      expect(form.getValue()?.product).not.toHaveProperty('weight');

      await form.flush();

      // DOM converged: only the digital branch field rendered.
      expect(form.exists('/product/fileSize')).toBe(true);
      expect(form.value('/product/fileSize')).toBe('256');
      expect(form.exists('/product/weight')).toBe(false);
      expect(form.getValue()?.product).not.toHaveProperty('weight');
      expect(form.getValue()?.product).toMatchObject({ fileSize: 256 });
      expect(form.caughtErrors()).toEqual([]);
    });
  });
});
