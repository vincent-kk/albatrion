import { expect, it, vi } from 'vitest';

import { FormWarningCode } from '../../../../errors';
import { blueprint } from '../blueprint';
import { EXPRESSION_CONTROL_KEYS } from '../utils/expressions/expressionControlKeys';

it.each(['retained', false, 0, null, { retained: true }])(
  'accepts an inactiveValue literal %j without compiling it',
  (inactiveValue) => {
    const analysis = blueprint({ type: 'string', controls: { inactiveValue } });
    expect(analysis.capabilities.hasExpressions).toBe(false);
    expect(EXPRESSION_CONTROL_KEYS).not.toContain('inactiveValue');
  },
);

it('accepts inactiveValue on fields controls and fragment controls', () => {
  expect(() =>
    blueprint({
      type: 'object',
      properties: { value: { type: 'string' } },
      controls: {
        fields: [{ targets: ['value'], controls: { inactiveValue: 'field' } }],
      },
      allOf: [{ controls: { inactiveValue: 'fragment' } }],
    }),
  ).not.toThrow();
});

it('treats an expression-shaped string as an opaque literal', () => {
  const analysis = blueprint({
    type: 'string',
    controls: { inactiveValue: 'not a valid expression !!! ../value' },
  });
  expect(analysis.capabilities.hasExpressions).toBe(false);
});

it('warns once for each same-layer literal clear and inactiveValue pair', () => {
  const collect = vi.fn();
  blueprint(
    {
      type: 'object',
      properties: { value: { type: 'string' } },
      controls: {
        inactiveValue: null,
        unsetOnInactive: true,
        fields: [
          {
            targets: ['value'],
            controls: { inactiveValue: 0, unsetOnInactive: true },
          },
        ],
      },
      allOf: [{ controls: { inactiveValue: false, unsetOnInactive: true } }],
    },
    { collect },
  );
  expect(
    collect.mock.calls.map(([record]) => [record.code, record.schemaPath]),
  ).toEqual([
    [FormWarningCode.InactiveValueWithUnsetOnInactive, '#/controls'],
    [
      FormWarningCode.InactiveValueWithUnsetOnInactive,
      '#/controls/fields/0/controls',
    ],
    [FormWarningCode.InactiveValueWithUnsetOnInactive, '#/allOf/0/controls'],
  ]);
});

it('does not warn for an expression clear or a clear on another layer', () => {
  const collect = vi.fn();
  blueprint(
    {
      type: 'object',
      properties: {
        value: { type: 'string', controls: { inactiveValue: 'held' } },
      },
      controls: {
        inactiveValue: null,
        unsetOnInactive: 'true',
        fields: [{ targets: ['value'], controls: { unsetOnInactive: true } }],
      },
    },
    { collect },
  );
  expect(collect).not.toHaveBeenCalled();
});
