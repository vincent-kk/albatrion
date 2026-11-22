import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it('a later format on a bound instance reaches later guards of an existing root', () => {
  const verdict = (late: boolean) => {
    const ajv = new Ajv({ allErrors: true, format: 'full' });
    const validator = createValidator(ajv);
    const root = {
      type: 'object',
      properties: {
        first: { if: { type: 'string' } },
        second: { if: { type: 'string', format: 'onlyA' } },
      },
    } as const;
    if (!late) ajv.addFormat('onlyA', /^a+$/);
    validator.compileGuard(root, '/properties/first/if');
    if (late) ajv.addFormat('onlyA', /^a+$/);
    return validator.compileGuard(root, '/properties/second/if')('bbb');
  };
  expect(verdict(false)).toBe(false);
  expect(verdict(true)).toBe(verdict(false));
});

it('uses a keyword added after the first compile', async () => {
  const ajv = new Ajv({ allErrors: true });
  const validator = createValidator(ajv);
  const root = { type: 'number', even: true } as const;
  await expect(validator.compile(root)(1)).resolves.toBeNull();

  ajv.addKeyword('even', { type: 'number', validate: (_schema: unknown, value: number) => value % 2 === 0 });

  await expect(validator.compile(root)(1)).resolves.toMatchObject([{ keyword: 'even' }]);
});
