import Ajv2020 from 'ajv/dist/2020.js';
import { expect, it } from 'vitest';

import { createValidator } from '../2020/index';

it.each(['ordinary', 'toString'] as const)(
  'rejects an undeclared dynamic anchor named %s',
  (name) => {
    const validator = createValidator(new Ajv2020({ strict: false }));
    const root = {
      type: 'object',
      if: { properties: { value: { $dynamicRef: '#' + name } } },
    } as const;

    expect(() => validator.compileGuard(root, '/if')).toThrow(/is not bound/);
  },
);

it.each(['ordinary', 'toString'] as const)('binds the declared anchor %s in a root-pointer guard', (name) => {
  const validator = createValidator(new Ajv2020({ strict: false }));
  const root = {
    $defs: { box: { $dynamicAnchor: name, type: 'number', minimum: 2 } },
    if: { $dynamicRef: '#' + name },
  } as const;

  const guard = validator.compileGuard(root, '/if');
  expect([guard(1), guard(2)]).toEqual([false, true]);
});
