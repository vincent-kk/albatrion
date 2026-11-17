import type { CompositeCase } from './types';

/** Amount form: a required amount, a price the consumer maps to a formatter input, a native number count, and a memo. */
const amountSchema = {
  type: 'object', required: ['amount'],
  properties: { amount: { type: 'number', minimum: 1 }, price: { type: 'number' }, count: { type: 'number' }, memo: { type: 'string' } },
};

/**
 * Story plan: text typed into the formatter input and the text and value it must show; then a native number draft that
 * becomes badInput after a valid digit, so the node keeps the last valid number (REACT-027).
 */
export const amountInputPlan = { typed: '1234', shown: '1,234', value: 1234, validDigit: '1', badSuffix: 'e', keptCount: 1 } as const;

/** CX-04: a formatter input and a native number input feed one form that submits only when valid. */
export const cx04AmountInput: CompositeCase = {
  scenario: {
    name: 'composite.cx04-amount-input',
    description: 'C4 amount input (G6, G5; browser parts in the story). The amount is required with minimum 1: clearing it reports required, writing 0 reports minimum, writing 1234 clears both. The story types into /price through a thousands-separator input (EVENT-003 caret recovery belongs to that input), types "1" then inserts "e" into the native number input so the draft becomes badInput and the node keeps 1 (REACT-027), and submits with Enter; the tail checks the rejected and the resolved submit.',
    schema: amountSchema,
    initialValue: { memo: 'm' },
    steps: [
      { action: 'batch', steps: [], expect: { values: { '/amount': undefined }, errors: { '/amount': [{ keyword: 'required' }] } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/amount', value: 0 }], expect: { errors: { '/amount': [{ keyword: 'minimum' }] } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/amount', value: 1234 }], expect: { values: { '/amount': 1234 }, errors: { '/amount': [] } } },
    ],
  },
  tailStart: { memo: 'm', amount: 1234 },
  tail: [
    { act: 'write', path: '/amount', value: 0 },
    { act: 'submit', rejected: 'SCHEMA_VALIDATION_FAILED' },
    { act: 'write', path: '/amount', value: 1234 },
    { act: 'submit', submitted: { memo: 'm', amount: 1234 } },
  ],
};
