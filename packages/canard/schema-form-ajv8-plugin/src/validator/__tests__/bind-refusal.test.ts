import { FormErrorCode } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';
import { ajvValidatorPlugin } from '../../default/validatorPlugin';

describe('VALIDATE-050 bind refusal', () => {
  it.each([
    ['2019', () => plugin2019.bind(new Ajv2019({ useDefaults: true }))],
    ['2020', () => plugin2020.bind(new Ajv2020({ useDefaults: true }))],
  ] as const)('refuses a modifying instance in the %s entry', (_entry, bind) => {
    expect(bind).toThrowError(expect.objectContaining({ code: FormErrorCode.ValidatorBindRefused }));
  });

  it.each([
    [{ coerceTypes: true }, ['coerceTypes']],
    [{ useDefaults: true }, ['useDefaults']],
    [{ removeAdditional: true }, ['removeAdditional']],
    [
      { coerceTypes: true, useDefaults: true, removeAdditional: true },
      ['coerceTypes', 'useDefaults', 'removeAdditional'],
    ],
  ] as const)('refuses modifying options without replacing the bound instance', (options, names) => {
    const accepted = new Ajv({ strictSchema: false });
    ajvValidatorPlugin.bind(accepted);
    expect(() => ajvValidatorPlugin.bind(new Ajv(options))).toThrowError(
      expect.objectContaining({
        name: 'ValidatorBindRefusedError',
        group: 'UNHANDLED_ERROR',
        code: FormErrorCode.ValidatorBindRefused,
        details: { options: names },
      }),
    );
    const schema = { $id: `https://example.test/accepted-${names.join('-')}`, type: 'string' } as Parameters<typeof ajvValidatorPlugin.compile>[0];
    expect(ajvValidatorPlugin.compile(schema)).toBeTypeOf('function');
    accepted.addSchema({ $id: 'https://example.test/supplied', type: 'string' });
    expect(() => ajvValidatorPlugin.compile({ $ref: 'https://example.test/supplied' })).not.toThrow();
  });

  it('accepts disabled options and keeps the authored schema unchanged', async () => {
    ajvValidatorPlugin.bind(new Ajv({ coerceTypes: false, useDefaults: false, removeAdditional: false }));
    const schema = { type: ['string', 'number'] } as unknown as Parameters<typeof ajvValidatorPlugin.compile>[0];
    const original = structuredClone(schema);
    const validate = ajvValidatorPlugin.compile(schema);
    expect(await validate('ok')).toBeNull();
    expect(schema).toEqual(original);
  });

  it.each([
    ['Draft-07', Ajv, ajvValidatorPlugin],
    ['Draft 2019-09', Ajv2019, plugin2019],
    ['Draft 2020-12', Ajv2020, plugin2020],
  ] as const)('refuses defaults enabled after binding in %s', async (_dialect, Constructor, plugin) => {
    const instance = new Constructor();
    plugin.bind(instance);
    const root = {
      type: 'object',
      properties: { count: { type: 'number', default: 1 } },
    } as const;
    const input = {};
    const validate = plugin.compile(root);
    await expect(validate(input)).resolves.toBeNull();
    expect(input).toEqual({});

    instance.opts.useDefaults = true;
    expect(() => plugin.compile(root)).toThrowError(expect.objectContaining({
      code: FormErrorCode.ValidatorBindRefused,
      details: { options: ['useDefaults'] },
    }));
  });
});
