import Ajv from 'ajv';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

const id = 'https://example.test/ajv7/shared.json';
const oracle = (schema: object, value: unknown): boolean =>
  Boolean(new Ajv({ allErrors: true, strict: false, validateFormats: false }).compile(schema)(value));

describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
  beforeEach(() => { ajvValidatorPlugin.configure({ directGuardCompile }); });
  afterEach(async () => {
    ajvValidatorPlugin.configure({ directGuardCompile: true });
    (await import('../validatorPlugin')).ajvValidatorPlugin.configure({ directGuardCompile: true });
  });
describe.each(['default', 'bind'] as const)('VALIDATE-046 %s', (mode) => {
  const getPlugin = async () => {
    if (mode === 'default') {
      vi.resetModules();
      const plugin = (await import('../validatorPlugin')).ajvValidatorPlugin;
      plugin.configure({ directGuardCompile });
      return plugin;
    }
    ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true, strict: false, validateFormats: false }));
    return ajvValidatorPlugin;
  };

  it('case (i): separates two live roots with the same root $id', async () => {
    const plugin = await getPlugin();
    const first = { $id: id, type: 'string' } as const;
    const second = { $id: id, type: 'number' } as const;
    const one = plugin.compile(first);
    const two = plugin.compile(second);
    for (const value of ['text', 7]) {
      expect((await one(value)) === null).toBe(oracle(first, value));
      expect((await two(value)) === null).toBe(oracle(second, value));
      expect(plugin.compileGuard(first, '')(value)).toBe(oracle(first, value));
      expect(plugin.compileGuard(second, '')(value)).toBe(oracle(second, value));
    }
  });

  it('case (ii): separates nested IDs and absolute self references', async () => {
    const plugin = await getPlugin();
    const first = {
      $id: id, type: 'object', definitions: { item: { $id: 'nested.json', type: 'string' } },
      properties: { value: { $ref: `${id}#/definitions/item` } },
    } as const;
    const second = {
      $id: id, type: 'object', definitions: { item: { $id: 'nested.json', type: 'number' } },
      properties: { value: { $ref: `${id}#/definitions/item` } },
    } as const;
    const one = plugin.compile(first);
    const two = plugin.compile(second);
    expect((await one({ value: 'x' })) === null).toBe(oracle(first, { value: 'x' }));
    expect((await two({ value: 'x' })) === null).toBe(oracle(second, { value: 'x' }));
    expect(plugin.compileGuard(first, '/properties/value')('x'))
      .toBe(oracle(first.definitions.item, 'x'));
    expect(plugin.compileGuard(second, '/properties/value')('x'))
      .toBe(oracle(second.definitions.item, 'x'));
  });

  it('case (iii): keeps the old result until a replacement is ready', async () => {
    const plugin = await getPlugin();
    const oldRoot = { $id: id, type: 'string' } as const;
    const nextRoot = { $id: id, type: 'number' } as const;
    const old = plugin.compile(oldRoot);
    const next = plugin.compile(nextRoot);
    expect((await old('x')) === null).toBe(oracle(oldRoot, 'x'));
    expect((await next(7)) === null).toBe(oracle(nextRoot, 7));
    plugin.release(oldRoot);
    expect((await next(7)) === null).toBe(oracle(nextRoot, 7));
  });

  it('case (iv): compiles a surviving peer guard after release', async () => {
    const plugin = await getPlugin();
    const oldRoot = { $id: id, type: 'object', properties: { value: { type: 'string' } } } as const;
    const nextRoot = { $id: id, type: 'object', properties: { value: { type: 'number' } } } as const;
    plugin.compile(oldRoot);
    plugin.compile(nextRoot);
    plugin.release(oldRoot);
    for (const value of [7, 'x'])
      expect(plugin.compileGuard(nextRoot, '/properties/value')(value))
        .toBe(oracle(nextRoot.properties.value, value));
  });
});

it('VALIDATE-046 bind clone retains consumer formats and keywords', async () => {
  const instance = new Ajv({ allErrors: true, strict: false, validateFormats: true });
  instance.addFormat('onlyX', /^x$/);
  instance.addKeyword({
    keyword: 'oddNumber',
    type: 'number',
    validate: (_schema: unknown, value: unknown) => typeof value === 'number' && value % 2 === 1,
  });
  ajvValidatorPlugin.bind?.(instance);
  const first = { $id: id, type: 'string', format: 'onlyX' } as const;
  const second = { $id: id, type: 'number', oddNumber: true } as const;
  ajvValidatorPlugin.compile(first);
  const validate = ajvValidatorPlugin.compile(second);
  const independent = new Ajv({ allErrors: true, strict: false, validateFormats: true });
  independent.addFormat('onlyX', /^x$/);
  independent.addKeyword({
    keyword: 'oddNumber',
    type: 'number',
    validate: (_schema: unknown, value: unknown) => typeof value === 'number' && value % 2 === 1,
  });
  const expected = independent.compile(second);
  for (const value of [2, 3]) {
    expect((await validate(value)) === null).toBe(Boolean(expected(value)));
    expect(ajvValidatorPlugin.compileGuard(second, '')(value)).toBe(Boolean(expected(value)));
  }
});

});
