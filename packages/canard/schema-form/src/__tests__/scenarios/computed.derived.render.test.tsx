import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * GAP-11 — Derived value propagation timing (`computed.derived`).
 *
 * A `derived` expression is applied by the `UpdateComputedProperties`
 * post-processor (`if (active && !equals(value, derived)) setValue(derived)`),
 * which enqueues a SECOND batched cascade. The node tree settles on the derived
 * value (often synchronously during the value getter), but the rendered DOM —
 * built from UNCONTROLLED inputs whose `defaultValue` was memorised at mount —
 * only shows the derived value once the cascade fully drains and a
 * `RequestRefresh` re-mounts the input. Every case below asserts BOTH layers:
 * the node tree (`node(path).value` / `getValue()`) AND the rendered DOM
 * (`value(path)` / `exists(path)`).
 *
 * Convergence guard: a damped circular pair settles (no caught errors); a
 * diverging pair trips `MAX_LOOP_COUNT=100` and throws a `SchemaFormError`
 * (`specific === 'INFINITE_LOOP_DETECTED'`) WITHOUT hanging. That throw happens
 * inside a `queueMicrotask` callback, so in the jsdom+node test environment it
 * escapes the harness's window `error` listener and surfaces as a process
 * `uncaughtException` instead — `captureProcessErrors` below isolates it so the
 * suite stays green while still asserting the loop was detected.
 *
 * Schemas mirror stories/36.DerivedValue.
 */

// ---------------------------------------------------------------------------
// Schemas (mirrored from stories/36.DerivedValue)
// ---------------------------------------------------------------------------

const arithmeticSchema = {
  type: 'object',
  properties: {
    price: { type: 'number', default: 1000 },
    quantity: { type: 'number', default: 2 },
    totalPrice: {
      type: 'number',
      computed: { derived: '../price * ../quantity' },
    },
  },
} satisfies JsonSchema;

const concatSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string', default: 'John' },
    lastName: { type: 'string', default: 'Doe' },
    fullName: {
      type: 'string',
      computed: { derived: '../lastName + " " + ../firstName' },
    },
  },
} satisfies JsonSchema;

const ternarySchema = {
  type: 'object',
  properties: {
    age: { type: 'number', default: 20 },
    ageGroup: {
      type: 'string',
      computed: { derived: '../age >= 18 ? "adult" : "minor"' },
    },
  },
} satisfies JsonSchema;

/** Nested parent reference: `../../` and `../`. */
const parentRefSchema = {
  type: 'object',
  properties: {
    basePrice: { type: 'number', default: 50000 },
    options: {
      type: 'object',
      properties: {
        discountPercent: { type: 'number', default: 10 },
        discountedPrice: {
          type: 'number',
          computed: {
            derived: '../../basePrice * (1 - ../discountPercent / 100)',
          },
        },
      },
    },
  },
} satisfies JsonSchema;

/** Absolute reference: `/config/taxRate`. */
const absoluteRefSchema = {
  type: 'object',
  properties: {
    config: {
      type: 'object',
      properties: { taxRate: { type: 'number', default: 10 } },
    },
    product: {
      type: 'object',
      properties: {
        price: { type: 'number', default: 10000 },
        priceWithTax: {
          type: 'number',
          computed: { derived: '../price * (1 + /config/taxRate / 100)' },
        },
      },
    },
  },
} satisfies JsonSchema;

const nullCoalesceSchema = {
  type: 'object',
  properties: {
    nickname: { type: 'string' },
    name: { type: 'string', default: 'anon' },
    displayName: {
      type: 'string',
      computed: { derived: '../nickname || ../name || "unknown"' },
    },
  },
} satisfies JsonSchema;

const optionalChainSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
    },
    displayName: {
      type: 'string',
      computed: { derived: '(../user)?.profile?.name ?? "anon"' },
    },
  },
} satisfies JsonSchema;

const arrayLengthSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { type: 'string' },
      default: ['a', 'b', 'c'],
    },
    itemCount: {
      type: 'number',
      computed: { derived: '(../items)?.length ?? 0' },
    },
  },
} satisfies JsonSchema;

/** `&derived` alias of `computed.derived`. */
const aliasSchema = {
  type: 'object',
  properties: {
    a: { type: 'number', default: 10 },
    b: { type: 'number', default: 20 },
    sum: { type: 'number', '&derived': '../a + ../b' },
  },
} satisfies JsonSchema;

/** `active:false` must suppress the derived computation entirely. */
const activeSchema = {
  type: 'object',
  properties: {
    isAdvancedMode: { type: 'boolean', default: false },
    price: { type: 'number', default: 1000 },
    advancedCalc: {
      type: 'number',
      computed: { active: '../isAdvancedMode', derived: '../price * 1.5' },
    },
  },
} satisfies JsonSchema;

/** A→B→C→D derived chain. */
const chainSchema = {
  type: 'object',
  properties: {
    input: { type: 'number', default: 100 },
    step1: { type: 'number', computed: { derived: '../input + 10' } },
    step2: { type: 'number', computed: { derived: '../step1 * 2' } },
    final: { type: 'number', computed: { derived: '../step2 + 100' } },
  },
} satisfies JsonSchema;

/** Converging cycle: a=b*0.5, b=a+10 → settles at a=10, b=20 (matching seeds). */
const convergingSchema = {
  type: 'object',
  properties: {
    a: { type: 'number', default: 10, computed: { derived: '../b * 0.5' } },
    b: { type: 'number', default: 20, computed: { derived: '../a + 10' } },
  },
} satisfies JsonSchema;

/** Diverging cycle: a=b+1, b=a+1 → never settles → INFINITE_LOOP_DETECTED. */
const divergingSchema = {
  type: 'object',
  properties: {
    a: { type: 'number', default: 0, computed: { derived: '(../b || 0) + 1' } },
    b: { type: 'number', default: 0, computed: { derived: '(../a || 0) + 1' } },
  },
} satisfies JsonSchema;

// ---------------------------------------------------------------------------
// Helper: isolate a process-level uncaughtException/unhandledRejection window
// (the infinite-loop throw escapes via queueMicrotask, not window 'error').
// ---------------------------------------------------------------------------

const captureProcessErrors = async (
  run: () => Promise<void>,
): Promise<any[]> => {
  const prevUncaught = process.listeners('uncaughtException');
  const prevRejection = process.listeners('unhandledRejection');
  for (const l of prevUncaught) process.removeListener('uncaughtException', l);
  for (const l of prevRejection)
    process.removeListener('unhandledRejection', l);
  const caught: any[] = [];
  const handler = (error: any) => caught.push(error);
  process.on('uncaughtException', handler);
  process.on('unhandledRejection', handler);
  try {
    await run();
  } finally {
    process.removeListener('uncaughtException', handler);
    process.removeListener('unhandledRejection', handler);
    for (const l of prevUncaught) process.on('uncaughtException', l as any);
    for (const l of prevRejection) process.on('unhandledRejection', l as any);
  }
  return caught;
};

// ---------------------------------------------------------------------------

describe('GAP-11 computed.derived — expression forms', () => {
  it('computes arithmetic (price * quantity) in DOM and tree, updating on setValue', async () => {
    const form = await renderForm(arithmeticSchema);

    // Settled initial derived: 1000 * 2.
    expect(form.node('/totalPrice')?.value).toBe(2000);
    expect(form.value('/totalPrice')).toBe('2000');

    await form.setValue({ price: 500, quantity: 3 });

    expect(form.getValue()?.totalPrice).toBe(1500);
    expect(form.node('/totalPrice')?.value).toBe(1500);
    expect(form.value('/totalPrice')).toBe('1500');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('computes string concatenation', async () => {
    const form = await renderForm(concatSchema);

    expect(form.node('/fullName')?.value).toBe('Doe John');
    expect(form.value('/fullName')).toBe('Doe John');

    await form.setValue({ firstName: 'Alice', lastName: 'Smith' });

    expect(form.getValue()?.fullName).toBe('Smith Alice');
    expect(form.node('/fullName')?.value).toBe('Smith Alice');
    expect(form.value('/fullName')).toBe('Smith Alice');
  });

  it('computes a ternary expression and flips it when the dependency changes', async () => {
    const form = await renderForm(ternarySchema);

    expect(form.node('/ageGroup')?.value).toBe('adult');
    expect(form.value('/ageGroup')).toBe('adult');

    await form.setValue({ age: 15 });

    expect(form.getValue()?.ageGroup).toBe('minor');
    expect(form.node('/ageGroup')?.value).toBe('minor');
    expect(form.value('/ageGroup')).toBe('minor');
  });
});

describe('GAP-11 computed.derived — reference resolution', () => {
  it('resolves parent (../../ and ../) references across nesting', async () => {
    const form = await renderForm(parentRefSchema);

    // 50000 * (1 - 10/100) = 45000.
    expect(form.node('/options/discountedPrice')?.value).toBe(45000);
    expect(form.value('/options/discountedPrice')).toBe('45000');

    await form.setValue({
      basePrice: 100000,
      options: { discountPercent: 20 },
    });

    expect(form.getValue()?.options?.discountedPrice).toBe(80000);
    expect(form.node('/options/discountedPrice')?.value).toBe(80000);
    expect(form.value('/options/discountedPrice')).toBe('80000');
  });

  it('resolves an absolute (/config/taxRate) reference', async () => {
    const form = await renderForm(absoluteRefSchema);

    // 10000 * (1 + 10/100) = 11000.
    expect(form.node('/product/priceWithTax')?.value).toBe(11000);
    expect(form.value('/product/priceWithTax')).toBe('11000');

    await form.setValue({ config: { taxRate: 20 }, product: { price: 10000 } });

    expect(form.getValue()?.product?.priceWithTax).toBe(12000);
    expect(form.node('/product/priceWithTax')?.value).toBe(12000);
    expect(form.value('/product/priceWithTax')).toBe('12000');
  });
});

describe('GAP-11 computed.derived — nullish / optional / array', () => {
  it('applies null-coalescing fallback then the live dependency', async () => {
    const form = await renderForm(nullCoalesceSchema);

    // nickname empty → falls back to name default 'anon'.
    expect(form.node('/displayName')?.value).toBe('anon');
    expect(form.value('/displayName')).toBe('anon');

    await form.type('/nickname', 'Nick');

    expect(form.getValue()?.displayName).toBe('Nick');
    expect(form.node('/displayName')?.value).toBe('Nick');
    expect(form.value('/displayName')).toBe('Nick');
  });

  it('applies optional chaining over a missing nested object', async () => {
    const form = await renderForm(optionalChainSchema);

    expect(form.node('/displayName')?.value).toBe('anon');
    expect(form.value('/displayName')).toBe('anon');

    await form.setValue({ user: { profile: { name: 'Bob' } } });

    expect(form.getValue()?.displayName).toBe('Bob');
    expect(form.node('/displayName')?.value).toBe('Bob');
    expect(form.value('/displayName')).toBe('Bob');
  });

  it('derives array length and recomputes it after adding an item', async () => {
    const form = await renderForm(arrayLengthSchema);

    expect(form.node('/itemCount')?.value).toBe(3);
    expect(form.value('/itemCount')).toBe('3');

    await form.addItem('/items');

    expect(form.getValue()?.itemCount).toBe(4);
    expect(form.node('/itemCount')?.value).toBe(4);
    expect(form.value('/itemCount')).toBe('4');
  });
});

describe('GAP-11 computed.derived — alias & active suppression', () => {
  it('honours the &derived alias the same as computed.derived', async () => {
    const form = await renderForm(aliasSchema);

    expect(form.node('/sum')?.value).toBe(30);
    expect(form.value('/sum')).toBe('30');

    await form.setValue({ a: 1, b: 2 });

    expect(form.getValue()?.sum).toBe(3);
    expect(form.node('/sum')?.value).toBe(3);
    expect(form.value('/sum')).toBe('3');
  });

  it('suppresses the derived value while active:false, computing it once activated', async () => {
    const form = await renderForm(activeSchema);

    // active:false → node disabled: absent from DOM and omitted from the value.
    expect(form.exists('/advancedCalc')).toBe(false);
    expect(form.renderedPaths()).not.toContain('/advancedCalc');
    expect(form.getValue()?.advancedCalc).toBeUndefined();

    // Activate via the sibling boolean → derived now computes (1000 * 1.5).
    await form.toggle('/isAdvancedMode');

    expect(form.exists('/advancedCalc')).toBe(true);
    expect(form.node('/advancedCalc')?.value).toBe(1500);
    expect(form.value('/advancedCalc')).toBe('1500');
    expect(form.getValue()?.advancedCalc).toBe(1500);
  });
});

describe('GAP-11 computed.derived — propagation timing (full drain)', () => {
  it('reflects the derived value in the DOM only after the cascade fully drains (two-phase)', async () => {
    const form = await renderForm(arithmeticSchema, { flushOnMount: false });

    // Synchronous snapshot: the node tree already holds the derived value, but
    // the uncontrolled input mounted before the RequestRefresh, so its DOM
    // value is still empty (pre-derive). This is the GAP-11 lag.
    expect(form.node('/totalPrice')?.value).toBe(2000);
    expect(form.value('/totalPrice')).toBe('');

    // After draining microtasks + a macrotask, the DOM catches up.
    await form.flush();
    expect(form.value('/totalPrice')).toBe('2000');
    expect(form.node('/totalPrice')?.value).toBe(2000);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('propagates a typed dependency through a derived chain after the drain', async () => {
    const form = await renderForm(chainSchema);

    // input 100 → step1 110 → step2 220 → final 320.
    expect(form.node('/final')?.value).toBe(320);
    expect(form.value('/final')).toBe('320');

    await form.type('/input', '200');

    // input 200 → step1 210 → step2 420 → final 520.
    expect(form.getValue()?.final).toBe(520);
    expect(form.node('/final')?.value).toBe(520);
    expect(form.value('/final')).toBe('520');
    expect(form.value('/step1')).toBe('210');
    expect(form.value('/step2')).toBe('420');
    expect(form.caughtErrors()).toEqual([]);
  });
});

describe('GAP-11 computed.derived — circular convergence guard', () => {
  it('settles a converging circular pair with no caught errors', async () => {
    const form = await renderForm(convergingSchema);

    // a = b * 0.5, b = a + 10 with seeds 10/20 is already at the fixed point.
    expect(form.node('/a')?.value).toBe(10);
    expect(form.node('/b')?.value).toBe(20);
    expect(form.value('/a')).toBe('10');
    expect(form.value('/b')).toBe('20');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('surfaces INFINITE_LOOP_DETECTED for a diverging circular pair without hanging', async () => {
    let form: Awaited<ReturnType<typeof renderForm>> | null = null;

    const caught = await captureProcessErrors(async () => {
      // bounded flush: if the loop guard regresses this resolves anyway and the
      // assertion below fails rather than hanging the runner.
      form = await renderForm(divergingSchema, { flushOnMount: false });
      await form.flush(50);
    });

    // The cascade tripped MAX_LOOP_COUNT and threw a SchemaFormError.
    expect(caught.length).toBeGreaterThan(0);
    expect(caught.some((e) => e?.specific === 'INFINITE_LOOP_DETECTED')).toBe(
      true,
    );
    // The form did not hang: it produced a handle and a bounded numeric state.
    expect(form).not.toBeNull();
    expect(typeof form!.node('/a')?.value).toBe('number');
  });
});
