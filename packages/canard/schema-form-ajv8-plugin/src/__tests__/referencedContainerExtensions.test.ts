import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createValidator as create2019Validator } from '../2019/index';
import { createValidator as create2020Validator } from '../2020/index';
import { createValidator } from '../default/index';

describe.each([
  [
    'draft-07',
    () => new Ajv({ allErrors: true, strict: false }),
    createValidator,
  ],
  [
    '2019-09',
    () => new Ajv2019({ allErrors: true, strict: false }),
    create2019Validator,
  ],
  [
    '2020-12',
    () => new Ajv2020({ allErrors: true, strict: false }),
    create2020Validator,
  ],
] as const)('%s', (_dialect, instance, adapterFor) => {
  it.each(['replace', 'remove', 'add'] as const)(
    'observes a keyword change after compile (%s)',
    async (operation) => {
      const ajv = instance();
      const install = (accepted: string) =>
        ajv.addKeyword({
          keyword: 'modelRule',
          validate: (_schema: boolean, value: string) => value === accepted,
        });
      if (operation !== 'add') install('one');
      const root: JSONSchema = {
        components: { value: { type: 'string', modelRule: true } },
        type: 'object',
        properties: { name: { $ref: '#/components/value' } },
      };
      const first = adapterFor(ajv);
      const second = adapterFor(ajv);
      const data = { name: 'two' };
      const before = first.compile(root);
      const other = second.compile(root);
      const prior = operation === 'add' ? null : [{ keyword: 'modelRule' }];
      if (prior) {
        expect(await before(data)).toMatchObject(prior);
        expect(await other(data)).toMatchObject(prior);
      } else {
        expect(await before(data)).toBeNull();
        expect(await other(data)).toBeNull();
      }
      ajv.removeKeyword('modelRule');
      if (operation === 'replace') install('two');
      if (operation === 'add') install('one');
      for (const adapter of [first, second]) {
        const result = await adapter.compile(root)(data);
        if (operation === 'add')
          expect(result).toMatchObject([{ keyword: 'modelRule' }]);
        else expect(result).toBeNull();
      }
      if (prior) expect(await before(data)).toMatchObject(prior);
      else expect(await before(data)).toBeNull();
    },
  );

  it('observes a format used only at a pointer target', async () => {
    const ajv = instance();
    ajv.addFormat('model-format', /^first$/);
    const root: JSONSchema = {
      components: { value: { type: 'string', format: 'model-format' } },
      type: 'object',
      properties: { name: { $ref: '#/components/value' } },
    };
    const adapter = adapterFor(ajv);
    const before = adapter.compile(root);
    expect(await before({ name: 'second' })).toMatchObject([
      { keyword: 'format' },
    ]);
    ajv.addFormat('model-format', /^second$/);
    expect(await adapter.compile(root)({ name: 'second' })).toBeNull();
  });
});
