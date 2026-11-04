import { expect, it } from 'vitest';

import { blueprint } from '../blueprint';

// filid:contract fixed-first-load-fallback
it.each([
  ['new child', { properties: { added: { type: 'string', minLength: 2 } } }],
  [
    'required',
    { required: ['value'], properties: { value: { minLength: 2 } } },
  ],
  ['empty required', { required: [], properties: { value: { minLength: 2 } } }],
  ['type', { properties: { value: { type: 'string' } } }],
  ['nullable', { properties: { value: { nullable: true } } }],
  ['const', { properties: { value: { const: 'a' } } }],
  ['enum', { properties: { value: { enum: ['a'] } } }],
  ['default', { properties: { value: { default: 'a' } } }],
  ['active', { properties: { value: { controls: { active: true } } } }],
  ['visible', { properties: { value: { controls: { visible: true } } } }],
  ['options', { properties: { value: { options: { omitEmpty: true } } } }],
  ['presentation', { properties: { value: { presentation: { label: 'x' } } } }],
  [
    'reference',
    { $ref: '#/$defs/fragment', properties: { value: { minLength: 2 } } },
  ],
  [
    'nested gate',
    {
      properties: { value: { minLength: 2 } },
      if: {},
      then: { properties: { value: { minLength: 2 } } },
    },
  ],
  ['unknown', { properties: { value: { customConstraint: 2 } } }],
] as const)('T2 rejects %s before allocating a plan', (_name, fragment) => {
  expect(
    Reflect.get(
      blueprint({
        type: 'object',
        $defs: { fragment: { properties: { value: { minLength: 2 } } } },
        required: ['value'],
        properties: { value: { type: 'string' } },
        if: {},
        then: { properties: { value: { minLength: 2 } } },
      }),
      'fixedFirstLoadPlan',
    ),
  ).toBeDefined();
  const result = blueprint({
    type: 'object',
    $defs: { fragment: { properties: { value: { minLength: 2 } } } },
    required: ['value'],
    properties: { value: { type: 'string' } },
    if: {},
    then: fragment,
  });
  expect(Reflect.get(result, 'fixedFirstLoadPlan')).toBeUndefined();
});
