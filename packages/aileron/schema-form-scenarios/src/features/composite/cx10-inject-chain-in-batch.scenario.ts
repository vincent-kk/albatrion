import type { CompositeCase } from './types';

/** A chain a → b → c of injections, an independent x, and a feedback c → a that only large values trigger. */
const chainSchema = {
  type: 'object',
  properties: {
    a: { type: 'number', controls: { injectTo: (value: unknown) => ({ '../b': Number(value) + 1 }) } },
    b: { type: 'number', controls: { injectTo: (value: unknown) => ({ '../c': Number(value) + 1 }) } },
    c: { type: 'number', controls: { injectTo: (value: unknown) => (Number(value) > 100 ? { '../a': Number(value) + 1 } : {}) } },
    x: { type: 'number' },
  },
};

/** CX-10: an injection chain settles inside one batch, re-injects from the middle, and degrades on feedback. */
export const cx10InjectChainInBatch: CompositeCase = {
  scenario: {
    name: 'composite.cx10-inject-chain-in-batch',
    description: 'controls.injectTo chains run inside one settle: a batch writing a and an unrelated x sends one onChange (EVENT-013, EVENT-026) and reaches c; editing b re-injects only c; writing a again re-runs the whole chain; a value large enough to close the c → a feedback exceeds the budget and the form reports degraded diagnostics while it keeps working (EVENT-020, ERROR-080).',
    schema: chainSchema,
    initialValue: { a: 0, b: 1, c: 2, x: 0 },
    steps: [
      { action: 'batch', steps: [{ action: 'setValue', path: '/a', value: 1 }, { action: 'setValue', path: '/x', value: 1 }], expect: {
        values: { '/b': 2, '/c': 3, '/x': 1 }, onChangeCount: 1,
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/b', value: 7 }], expect: { values: { '/a': 1, '/b': 7, '/c': 8 } } },
      { action: 'setValue', path: '/a', value: 4, expect: { values: { '/b': 5, '/c': 6 } } },
      // ERROR-070 the budget failure throws at the end of the write chain; a typed write would throw out of the input handler.
      { action: 'batch', steps: [{ action: 'setValue', path: '/a', value: 200 }], expect: { diagnostics: { status: 'degraded' } } },
    ],
  },
};
