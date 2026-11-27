import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it('observes a replaced keyword in a nonstandard application fragment', async () => {
  const ajv = new Ajv({ strict: false });
  const install = (allowed: string) => {
    const definition = { compile: () => (value: unknown) => value === allowed };
    ajv.addKeyword({ keyword: 'fieldRule', ...definition });
  };
  const doc = 'https://example.test/keyword-document';
  install('one');
  ajv.addSchema({ $id: doc, components: { value: { fieldRule: true } } });
  const validator = createValidator(ajv);
  const schema = { $ref: doc + '#/components/value' };
  const previous = validator.compile(schema);

  ajv.removeKeyword('fieldRule');
  install('two');

  await expect(previous('two')).resolves.toMatchObject([
    { keyword: 'fieldRule' },
  ]);
  await expect(validator.compile(schema)('two')).resolves.toBeNull();
});
