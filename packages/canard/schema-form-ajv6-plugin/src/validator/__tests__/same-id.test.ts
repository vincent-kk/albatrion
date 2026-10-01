import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

const id = 'https://example.test/shared.json';

/** Compare plugin verdicts with independently compiled authored schemas. */
const oracle = (schema: object, value: unknown): boolean =>
  Boolean(new Ajv({ allErrors: true, format: false }).compile(schema)(value));

describe.each(['default', 'bind'] as const)('VALIDATE-046 %s', (mode) => {
  it('case (i): keeps two live roots with the same root $id independent', async () => {
    if (mode === 'default') {
      vi.resetModules();
      const { ajvValidatorPlugin: fresh } = await import('../validatorPlugin');
      const first = { $id: id, type: 'string' } as const;
      const second = { $id: id, type: 'number' } as const;
      const one = fresh.compile(first);
      const two = fresh.compile(second);
      expect((await one('text')) === null).toBe(oracle(first, 'text'));
      expect((await two('text')) === null).toBe(oracle(second, 'text'));
      expect(fresh.compileGuard(first, '')('text')).toBe(oracle(first, 'text'));
      expect(fresh.compileGuard(second, '')('text')).toBe(oracle(second, 'text'));
    } else {
      ajvValidatorPlugin.bind!(new Ajv({ allErrors: true, format: false }));
      const first = { $id: id, type: 'string' } as const;
      const second = { $id: id, type: 'number' } as const;
      const one = ajvValidatorPlugin.compile(first);
      const two = ajvValidatorPlugin.compile(second);
      expect((await one('text')) === null).toBe(oracle(first, 'text'));
      expect((await two('text')) === null).toBe(oracle(second, 'text'));
      expect(ajvValidatorPlugin.compileGuard(first, '')('text')).toBe(oracle(first, 'text'));
      expect(ajvValidatorPlugin.compileGuard(second, '')('text')).toBe(oracle(second, 'text'));
    }
  });

  it('case (ii): isolates overlapping inner IDs and absolute self references', async () => {
    const plugin = mode === 'default'
      ? (vi.resetModules(), (await import('../validatorPlugin')).ajvValidatorPlugin)
      : ajvValidatorPlugin;
    if (mode === 'bind') plugin.bind!(new Ajv({ allErrors: true, format: false }));
    const first = {
      $id: id, type: 'object', definitions: { item: { $id: 'nested.json', type: 'string' } },
      properties: { value: { $ref: `${id}#/definitions/item` } },
    } as const;
    const second = {
      $id: id, type: 'object', definitions: { item: { $id: 'nested.json', type: 'number' } },
      properties: { value: { $ref: `${id}#/definitions/item` } },
    } as const;
    const old = plugin.compile(first);
    const replacement = plugin.compile(second);
    expect((await old({ value: 'x' })) === null).toBe(oracle(first, { value: 'x' }));
    expect((await replacement({ value: 'x' })) === null)
      .toBe(oracle(second, { value: 'x' }));
    expect(plugin.compileGuard(first, '/properties/value')('x'))
      .toBe(oracle(first.definitions.item, 'x'));
    expect(plugin.compileGuard(second, '/properties/value')('x'))
      .toBe(oracle(second.definitions.item, 'x'));
  });

  it('case (iii): preserves the old verdict until a replacement is ready', async () => {
    const plugin = mode === 'default'
      ? (vi.resetModules(), (await import('../validatorPlugin')).ajvValidatorPlugin)
      : ajvValidatorPlugin;
    if (mode === 'bind') plugin.bind!(new Ajv({ allErrors: true, format: false }));
    const oldRoot = { $id: id, type: 'string' } as const;
    const nextRoot = { $id: id, type: 'number' } as const;
    const old = plugin.compile(oldRoot);
    const next = plugin.compile(nextRoot);
    expect((await old('x')) === null).toBe(oracle(oldRoot, 'x'));
    expect((await next(7)) === null).toBe(oracle(nextRoot, 7));
    expect((await old(7)) === null).toBe(oracle(oldRoot, 7));
    plugin.release(oldRoot);
    expect((await next(7)) === null).toBe(oracle(nextRoot, 7));
  });

  it('case (iv): compiles the survivor guard after releasing its same-ID peer', async () => {
    const plugin = mode === 'default'
      ? (vi.resetModules(), (await import('../validatorPlugin')).ajvValidatorPlugin)
      : ajvValidatorPlugin;
    if (mode === 'bind') plugin.bind!(new Ajv({ allErrors: true, format: false }));
    const oldRoot = { $id: id, type: 'object', properties: { value: { type: 'string' } } } as const;
    const nextRoot = { $id: id, type: 'object', properties: { value: { type: 'number' } } } as const;
    plugin.compile(oldRoot);
    plugin.compile(nextRoot);
    plugin.release(oldRoot);
    expect(plugin.compileGuard(nextRoot, '/properties/value')(7))
      .toBe(oracle(nextRoot.properties.value, 7));
    expect(plugin.compileGuard(nextRoot, '/properties/value')('x'))
      .toBe(oracle(nextRoot.properties.value, 'x'));
  });
});

it('VALIDATE-046 bind clone retains formats and keywords added by the consumer', async () => {
  const instance = new Ajv({ allErrors: true, strictKeywords: true });
  instance.addFormat('onlyX', /^x$/);
  instance.addKeyword('oddNumber', {
    type: 'number',
    validate: (_schema: unknown, value: unknown) => typeof value === 'number' && value % 2 === 1,
  });
  instance.addKeyword('annotation', undefined as unknown as Ajv.KeywordDefinition);
  ajvValidatorPlugin.bind!(instance);
  const first = { $id: id, type: 'string', format: 'onlyX' } as const;
  const second = { $id: id, type: 'number', oddNumber: true, annotation: true } as const;
  ajvValidatorPlugin.compile(first);
  const validate = ajvValidatorPlugin.compile(second);
  const independent = new Ajv({ allErrors: true, strictKeywords: true });
  independent.addFormat('onlyX', /^x$/);
  independent.addKeyword('oddNumber', {
    type: 'number',
    validate: (_schema: unknown, value: unknown) => typeof value === 'number' && value % 2 === 1,
  });
  independent.addKeyword('annotation', undefined as unknown as Ajv.KeywordDefinition);
  const expected = independent.compile(second);
  for (const value of [2, 3])
    expect((await validate(value)) === null).toBe(Boolean(expected(value)));
});
