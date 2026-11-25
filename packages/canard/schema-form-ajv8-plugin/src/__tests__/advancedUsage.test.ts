import Ajv from 'ajv';
import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';

import { plugin } from '../default/index';

it('resolves the suffixed ajv Draft 2020-12 specifier from Node ESM and rejects the bare one', () => {
  const run = (specifier: string) =>
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const { default: Ajv2020 } = await import(${JSON.stringify(specifier)}); console.log(typeof Ajv2020);`,
      ],
      { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );

  expect(run('ajv/dist/2020.js').trim()).toBe('function');
  expect(() => run('ajv/dist/2020')).toThrow(/ERR_MODULE_NOT_FOUND/);
});

const formOnlySchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      customValidation: true,
      FormTypeInput: 'text',
      computed: { visible: '../kind === "a"' },
    },
  },
} as const;

it('keeps AJV strict mode on an instance without strict: false, so form-only keys fail to compile', () => {
  plugin.validator.bind(new Ajv({ allErrors: true, verbose: true }));
  try {
    expect(() => plugin.validator.compile(formOnlySchema)).toThrow(
      /strict mode: unknown keyword/,
    );
  } finally {
    plugin.validator.bind(new Ajv({ allErrors: true, strict: false }));
  }
});

it('validates form-only keys and a custom keyword through the advanced-usage instance', async () => {
  const ajv = new Ajv({ allErrors: true, verbose: true, strict: false });
  ajv.addKeyword({
    keyword: 'customValidation',
    validate: function (_schema: unknown, data: unknown) {
      return data !== 'forbidden';
    },
  });
  plugin.validator.bind(ajv);

  try {
    const validate = plugin.validator.compile(formOnlySchema);

    await expect(validate({ name: 'ok' })).resolves.toBeNull();
    await expect(validate({ name: 'forbidden' })).resolves.toMatchObject([
      { keyword: 'customValidation' },
    ]);
  } finally {
    plugin.validator.bind(new Ajv({ allErrors: true, strict: false }));
  }
});
