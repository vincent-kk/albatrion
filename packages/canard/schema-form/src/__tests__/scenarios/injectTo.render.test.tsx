import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * injectTo value-injection render tests (GAP-9).
 *
 * `injectTo` lets a source field push values into other fields when its value
 * changes. The injected `setValue` carries `SetValueOption.Refresh`, so each
 * injected TARGET must remount its uncontrolled FormTypeInput and the DOM input
 * must show the injected value — not just the node tree.
 *
 * GAP-9 — a value written without `Refresh` updates `node.value` but leaves the
 *   uncontrolled DOM input stale. Every test here therefore asserts BOTH the
 *   node tree (`node(path)?.value` / `getValue()`) AND the rendered DOM
 *   (`value(path)` / `exists(path)`), so a refresh-gated divergence is caught.
 *
 * Schemas mirror stories/39.InjectTo.stories.tsx (default uncontrolled inputs;
 * no custom FormTypeInput, so the RequestRefresh remount path is exercised).
 */

// Single sibling injection: source → ../target.
const singleSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) => ({ '../target': `injected: ${value}` }),
    },
    target: { type: 'string' },
  },
} satisfies JsonSchema;

// One source fanning out to three sibling targets.
const multiSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) => ({
        '../target1': `${value}-1`,
        '../target2': `${value}-2`,
        '../target3': `${value}-3`,
      }),
    },
    target1: { type: 'string' },
    target2: { type: 'string' },
    target3: { type: 'string' },
  },
} satisfies JsonSchema;

// Chain: a → b → c (acyclic).
const chainSchema = {
  type: 'object',
  properties: {
    a: {
      type: 'string',
      injectTo: (value: string) => ({ '../b': `A→${value}` }),
    },
    b: {
      type: 'string',
      injectTo: (value: string) => ({ '../c': `B→${value}` }),
    },
    c: { type: 'string' },
  },
} satisfies JsonSchema;

// Injection that drives a oneOf discriminator, flipping the active branch.
const flipSchema = {
  type: 'object',
  properties: {
    trigger: {
      type: 'string',
      injectTo: (value: string) => ({
        '/category': value === 'switch' ? 'B' : 'A',
      }),
    },
    category: { type: 'string', enum: ['A', 'B'], default: 'A' },
  },
  oneOf: [
    {
      '&if': "./category === 'A'",
      properties: { fieldA: { type: 'string', default: 'A-default' } },
    },
    {
      '&if': "./category === 'B'",
      properties: { fieldB: { type: 'string', default: 'B-default' } },
    },
  ],
} satisfies JsonSchema;

// Conditional injection: returns null (skips) for short input.
const conditionalSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) =>
        value.length < 3 ? null : { '../target': `valid: ${value}` },
    },
    target: { type: 'string', default: 'waiting...' },
  },
} satisfies JsonSchema;

// Two sources into one target (last write wins).
const lastWriteSchema = {
  type: 'object',
  properties: {
    source1: {
      type: 'string',
      injectTo: (value: string) => ({ '../target': `from-source1: ${value}` }),
    },
    source2: {
      type: 'string',
      injectTo: (value: string) => ({ '../target': `from-source2: ${value}` }),
    },
    target: { type: 'string' },
  },
} satisfies JsonSchema;

// Absolute-path injection from a deeply nested source to a root field.
const absoluteSchema = {
  type: 'object',
  properties: {
    rootTarget: { type: 'string' },
    nested: {
      type: 'object',
      properties: {
        deep: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              injectTo: (value: string) => ({
                '/rootTarget': `from-deep: ${value}`,
              }),
            },
          },
        },
      },
    },
  },
} satisfies JsonSchema;

// Direct circular injection (A ↔ B) — must be loop-guarded.
const circularSchema = {
  type: 'object',
  properties: {
    fieldA: {
      type: 'string',
      injectTo: (value: string) => ({ '../fieldB': `fromA: ${value}` }),
    },
    fieldB: {
      type: 'string',
      injectTo: (value: string) => ({ '../fieldA': `fromB: ${value}` }),
    },
  },
} satisfies JsonSchema;

describe('injectTo single target', () => {
  it('injects into the sibling target on programmatic setValue (tree + DOM)', async () => {
    const form = await renderForm(singleSchema);

    await form.setValue({ source: 'hello' });

    // Node tree
    expect(form.node('/source')?.value).toBe('hello');
    expect(form.node('/target')?.value).toBe('injected: hello');
    expect(form.getValue().target).toBe('injected: hello');
    // DOM
    expect(form.value('/source')).toBe('hello');
    expect(form.value('/target')).toBe('injected: hello');
  });

  it('injects into the sibling target on real user typing (tree + DOM)', async () => {
    const form = await renderForm(singleSchema);

    await form.type('/source', 'world');

    expect(form.node('/source')?.value).toBe('world');
    expect(form.node('/target')?.value).toBe('injected: world');
    expect(form.value('/source')).toBe('world');
    expect(form.value('/target')).toBe('injected: world');
  });

  it('remounts the injected target input so the DOM reflects the value (instrument)', async () => {
    const form = await renderForm(singleSchema, { instrument: true });

    const baseOrdinal = form.mountOrdinal('/target');
    expect(baseOrdinal).toBeGreaterThan(0);
    expect(form.value('/target')).toBe('');

    await form.setValue({ source: 'hi' });

    // Tree updated AND the uncontrolled input remounted (RequestRefresh),
    // so the injected value is visible in the DOM rather than stale.
    expect(form.node('/target')?.value).toBe('injected: hi');
    expect(form.mountOrdinal('/target')).toBeGreaterThan(baseOrdinal);
    expect(form.value('/target')).toBe('injected: hi');
  });
});

describe('injectTo multiple targets', () => {
  it('injects into three sibling targets at once (tree + DOM)', async () => {
    const form = await renderForm(multiSchema);

    await form.setValue({ source: 'multi' });

    // Node tree
    expect(form.node('/target1')?.value).toBe('multi-1');
    expect(form.node('/target2')?.value).toBe('multi-2');
    expect(form.node('/target3')?.value).toBe('multi-3');
    // DOM
    expect(form.value('/source')).toBe('multi');
    expect(form.value('/target1')).toBe('multi-1');
    expect(form.value('/target2')).toBe('multi-2');
    expect(form.value('/target3')).toBe('multi-3');
  });
});

describe('injectTo chain A -> B -> C', () => {
  it('propagates through the chain on setValue (tree + DOM for all three)', async () => {
    const form = await renderForm(chainSchema);

    await form.setValue({ a: 'start' });
    await form.flush(50);

    // Node tree
    expect(form.node('/a')?.value).toBe('start');
    expect(form.node('/b')?.value).toBe('A→start');
    expect(form.node('/c')?.value).toBe('B→A→start');
    // DOM
    expect(form.value('/a')).toBe('start');
    expect(form.value('/b')).toBe('A→start');
    expect(form.value('/c')).toBe('B→A→start');
  });

  it('propagates through the chain on user typing (tree + DOM)', async () => {
    const form = await renderForm(chainSchema);

    await form.type('/a', 'go');
    await form.flush(50);

    expect(form.node('/b')?.value).toBe('A→go');
    expect(form.node('/c')?.value).toBe('B→A→go');
    expect(form.value('/b')).toBe('A→go');
    expect(form.value('/c')).toBe('B→A→go');
  });
});

describe('injectTo flips a oneOf discriminator', () => {
  it('renders the default branch A field before any injection (tree + DOM)', async () => {
    const form = await renderForm(flipSchema);

    expect(form.node('/category')?.value).toBe('A');
    expect(form.node('/fieldA')?.enabled).toBe(true);
    expect(form.exists('/fieldA')).toBe(true);
    expect(form.value('/fieldA')).toBe('A-default');
    expect(form.exists('/fieldB')).toBe(false);
  });

  it('flips category to B via injection and swaps the active branch (tree + DOM)', async () => {
    const form = await renderForm(flipSchema);

    await form.setValue({ trigger: 'switch' });
    await form.flush(50);

    // Node tree: discriminator flipped, branch swapped.
    expect(form.node('/category')?.value).toBe('B');
    expect(form.node('/fieldA')?.enabled).toBe(false);
    expect(form.node('/fieldB')?.enabled).toBe(true);
    expect(form.node('/fieldB')?.value).toBe('B-default');
    // DOM: branch A field gone, branch B field present with its default.
    expect(form.value('/trigger')).toBe('switch');
    expect(form.value('/category')).toBe('B');
    expect(form.exists('/fieldA')).toBe(false);
    expect(form.exists('/fieldB')).toBe(true);
    expect(form.value('/fieldB')).toBe('B-default');
  });

  it('flips back to branch A when the trigger is not "switch" (tree + DOM)', async () => {
    const form = await renderForm(flipSchema);

    await form.setValue({ trigger: 'switch' });
    await form.flush(50);
    expect(form.exists('/fieldB')).toBe(true);

    await form.setValue({ trigger: 'reset' });
    await form.flush(50);

    // Back on branch A.
    expect(form.node('/category')?.value).toBe('A');
    expect(form.node('/fieldB')?.enabled).toBe(false);
    expect(form.node('/fieldA')?.enabled).toBe(true);
    expect(form.value('/category')).toBe('A');
    expect(form.exists('/fieldB')).toBe(false);
    expect(form.exists('/fieldA')).toBe(true);
  });
});

describe('injectTo edge cases', () => {
  it('skips injection when the source returns null, then injects when valid (tree + DOM)', async () => {
    const form = await renderForm(conditionalSchema);

    // Short input (< 3 chars) → injectTo returns null → target keeps its default.
    await form.type('/source', 'ab');
    expect(form.node('/target')?.value).toBe('waiting...');
    expect(form.value('/target')).toBe('waiting...');

    // Long input → injection fires.
    await form.type('/source', 'abcd');
    expect(form.node('/target')?.value).toBe('valid: abcd');
    expect(form.value('/target')).toBe('valid: abcd');
  });

  it('applies last-write-wins when two sources target the same field (tree + DOM)', async () => {
    const form = await renderForm(lastWriteSchema);

    await form.type('/source1', 'one');
    expect(form.node('/target')?.value).toBe('from-source1: one');
    expect(form.value('/target')).toBe('from-source1: one');

    await form.type('/source2', 'two');
    expect(form.node('/target')?.value).toBe('from-source2: two');
    expect(form.value('/target')).toBe('from-source2: two');
  });

  it('injects across an absolute path from a deeply nested source (tree + DOM)', async () => {
    const form = await renderForm(absoluteSchema);

    await form.setValue({ nested: { deep: { source: 'x' } } });

    expect(form.node('/nested/deep/source')?.value).toBe('x');
    expect(form.node('/rootTarget')?.value).toBe('from-deep: x');
    expect(form.getValue().rootTarget).toBe('from-deep: x');
    expect(form.value('/nested/deep/source')).toBe('x');
    expect(form.value('/rootTarget')).toBe('from-deep: x');
  });

  it('guards a direct circular A<->B injection without an infinite loop (tree + DOM)', async () => {
    const form = await renderForm(circularSchema);

    await form.type('/fieldA', 'seed');
    await form.flush(50);

    // A → B injected; B → A is loop-guarded so A keeps the typed value.
    expect(form.caughtErrors()).toEqual([]);
    expect(form.node('/fieldA')?.value).toBe('seed');
    expect(form.node('/fieldB')?.value).toBe('fromA: seed');
    expect(form.value('/fieldA')).toBe('seed');
    expect(form.value('/fieldB')).toBe('fromA: seed');
  });
});
