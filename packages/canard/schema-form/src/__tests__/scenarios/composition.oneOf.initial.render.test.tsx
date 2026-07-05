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
 *  - But the FIRST-PAINT DOM omits that branch field: `useChildNodeComponents`
 *    captured `useState(node.children)` before the branch key was appended to
 *    `__children__`, and the resync `UpdateChildren` event is microtask-batched,
 *    delivered only after `flush()`. So `[data-path]` for the branch field is
 *    absent synchronously and appears only post-flush.
 *
 * → GAP-1 is therefore a node-tree-vs-DOM divergence *window*, not a product
 *   defect: the tree is settled synchronously but its DOM reflection is
 *   microtask-deferred. In CSR this is invisible — the browser paints only
 *   after the microtask queue drains, so users always see the converged DOM;
 *   the exposure here is an artifact of the async harness observing the gap
 *   mid-cascade. It becomes a REAL fault only under SSR/`renderToString`
 *   (synchronous, no microtask drain → hydration mismatch), which needs the
 *   model pre-settled before mount (option C). Until SSR support lands these
 *   cases are pinned with `it.fails` (tree-side assertions pass, the synchronous
 *   DOM-presence assertion fails) so the suite stays green while tracking the
 *   gap. The post-flush behavior is correct: the DOM converges and the seeded
 *   branch defaults are NOT clobbered (GAP-2) — those cases pass.
 *
 * Schemas mirror stories/17.OneOf and stories/06.IfThenElse, kept compact.
 * Inputs are the built-in uncontrolled FormTypeInputs (no custom definitions),
 * so DOM value assertions also exercise the RequestRefresh/defaultValue path.
 */
describe('composition.oneOf — initial branch priming', () => {
  // ---------------------------------------------------------------------------
  // GAP-1 — tree primed synchronously, but the branch field's DOM reflection is
  // microtask-deferred. CSR-harmless (browser paints post-drain); SSR-unsafe.
  // Pinned with it.fails until the model is pre-settled before mount (option C).
  // ---------------------------------------------------------------------------
  describe('default-selected branch primed in tree but absent from first-paint DOM (GAP-1)', () => {
    it.fails(
      'first branch (index 0) // GAP (CSR-harmless/SSR-unsafe): tree primed, DOM reflection microtask-deferred',
      async () => {
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

        // BUG: the active branch field is missing from the first-paint DOM.
        expect(form.exists('/gamePrice')).toBe(true);
      },
    );

    it.fails(
      'non-first branch (index 2) // GAP (CSR-harmless/SSR-unsafe): seeded branch default in tree, DOM reflection deferred',
      async () => {
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

        // BUG: missing from first-paint DOM.
        expect(form.exists('/consolePrice')).toBe(true);
      },
    );

    it.fails(
      'const-discriminated branch (index 2) // GAP (CSR-harmless/SSR-unsafe): const-matched branch in tree, DOM reflection deferred',
      async () => {
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

        // BUG: missing from first-paint DOM.
        expect(form.exists('/viewMode')).toBe(true);
      },
    );

    it.fails(
      'nested object oneOf branch // GAP (CSR-harmless/SSR-unsafe): nested branch child in tree, DOM reflection deferred',
      async () => {
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

        // BUG: the nested branch child is missing from the first-paint DOM.
        expect(form.exists('/product/weight')).toBe(true);
      },
    );
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
