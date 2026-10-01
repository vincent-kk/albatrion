import type { JSONSchema } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it, vi } from 'vitest';

/** Loads a fresh Draft 2020 plugin for each default or custom binding case. */
const load2020Plugin = async (mode: 'default' | 'bind') => {
  vi.resetModules();
  const { ajvValidatorPlugin } = await import('../../2020/validatorPlugin');
  if (mode === 'bind') ajvValidatorPlugin.bind(new Ajv2020({ strictSchema: false }));
  return ajvValidatorPlugin;
};

/** Loads a fresh Draft 2019 plugin for each default or custom binding case. */
const load2019Plugin = async (mode: 'default' | 'bind') => {
  vi.resetModules();
  const { ajvValidatorPlugin } = await import('../../2019/validatorPlugin');
  if (mode === 'bind') ajvValidatorPlugin.bind(new Ajv2019({ strictSchema: false }));
  return ajvValidatorPlugin;
};

describe('VALIDATE-047 guard scope', () => {
  it('VALIDATE-033 carries custom formats and keywords into guard instances', async () => {
    const plugin2020 = await load2020Plugin('default');
    const instance = new Ajv2020({ strictSchema: false, validateFormats: true });
    instance.addFormat('only-x', /^x$/);
    instance.addKeyword({ keyword: 'isOdd', type: 'number', schemaType: 'boolean', validate: (enabled: boolean, value: number) => !enabled || value % 2 === 1 });
    plugin2020.bind(instance);
    const formatRoot = {
      $id: 'https://example.test/custom-format',
      if: { type: 'string', format: 'only-x' },
      then: false,
      else: true,
    } as unknown as JSONSchema;
    const keywordRoot = {
      $id: 'https://example.test/custom-keyword',
      if: { type: 'number', isOdd: true },
      then: false,
      else: true,
    } as unknown as JSONSchema;
    const direct = new Ajv2020({ strictSchema: false, validateFormats: true });
    direct.addFormat('only-x', /^x$/);
    direct.addKeyword({ keyword: 'isOdd', type: 'number', schemaType: 'boolean', validate: (enabled: boolean, value: number) => !enabled || value % 2 === 1 });
    for (const [schema, values] of [[formatRoot, ['x', 'y']], [keywordRoot, [1, 2]]] as const) {
      const full = direct.compile(schema);
      const guard = plugin2020.compileGuard(schema, '/if');
      for (const value of values) expect(guard(value)).toBe(!full(value));
      plugin2020.release(schema);
    }
  });

  it.each(['default', 'bind'] as const)('(i) resolves a relative ref from a nested $id with %s', async (mode) => {
    const plugin2020 = await load2020Plugin(mode);
    const schema = {
      $id: 'https://example.test/outer',
      $defs: {
        condition: { $id: 'condition', type: 'string' },
        nested: { $id: 'nested', if: { $ref: '../condition' }, then: false, else: true },
      },
      $ref: 'nested',
    } as unknown as JSONSchema;
    const direct = new Ajv2020({ strictSchema: false }).compile(schema);
    const guard = plugin2020.compileGuard(schema, '/$defs/nested/if');
    for (const value of ['text', 42]) expect(guard(value)).toBe(!direct(value));
    plugin2020.release(schema);
  });

  it.each(['default', 'bind'] as const)('(ii) follows a 2020-12 $dynamicRef with %s', async (mode) => {
    const plugin2020 = await load2020Plugin(mode);
    const schema = {
      $id: 'https://example.test/dynamic',
      $dynamicAnchor: 'node',
      $defs: {
        base: {
          $id: 'base',
          $dynamicAnchor: 'node',
          type: 'object',
          properties: { value: { type: 'string' }, next: { $dynamicRef: '#node' } },
          required: ['value'],
        },
      },
      if: { $ref: 'base' },
      then: false,
      else: true,
    } as unknown as JSONSchema;
    const direct = new Ajv2020({ strictSchema: false }).compile(schema);
    const guard = plugin2020.compileGuard(schema, '/if');
    for (const value of [{ value: 'ok' }, { value: 'ok', next: { value: 1 } }]) {
      expect(guard(value)).toBe(!direct(value));
    }
    plugin2020.release(schema);
  });

  it.each(['default', 'bind'] as const)('(iii) follows a 2019-09 $recursiveRef with %s', async (mode) => {
    const plugin2019 = await load2019Plugin(mode);
    const schema = {
      $id: 'https://example.test/recursive',
      $recursiveAnchor: true,
      $defs: {
        base: {
          $id: 'base',
          $recursiveAnchor: true,
          type: 'object',
          properties: { value: { type: 'string' }, next: { $recursiveRef: '#' } },
          required: ['value'],
        },
      },
      if: { $ref: 'base' },
      then: false,
      else: true,
    } as unknown as JSONSchema;
    const direct = new Ajv2019({ strictSchema: false }).compile(schema);
    const guard = plugin2019.compileGuard(schema, '/if');
    for (const value of [{ value: 'ok' }, { value: 'ok', next: { value: 1 } }]) {
      expect(guard(value)).toBe(!direct(value));
    }
    plugin2019.release(schema);
  });

  it.each(['default', 'bind'] as const)('(iv) observes a shared dynamic location from two scopes with %s', async (mode) => {
    const plugin2020 = await load2020Plugin(mode);
    const common = {
      $id: 'https://example.test/two-scopes',
      $defs: {
        shared: {
          $id: 'https://example.test/shared',
          $dynamicAnchor: 'node',
          if: { type: 'object', properties: { next: { $dynamicRef: '#node' } }, required: ['next'] },
          then: false,
          else: true,
        },
        stringScope: {
          $id: 'https://example.test/string-scope',
          $dynamicAnchor: 'node',
          type: 'object',
          required: ['stringKey'],
          $ref: 'https://example.test/shared',
        },
        numberScope: {
          $id: 'https://example.test/number-scope',
          $dynamicAnchor: 'node',
          type: 'object',
          required: ['numberKey'],
          $ref: 'https://example.test/shared',
        },
      },
    } as unknown as JSONSchema;
    const stringRoot = { ...common, $ref: '#/$defs/stringScope' } as JSONSchema;
    const numberRoot = { ...common, $ref: '#/$defs/numberScope' } as JSONSchema;
    const value = { stringKey: true, numberKey: true, next: { stringKey: true } };
    const directString = new Ajv2020({ strictSchema: false }).compile(stringRoot);
    const directNumber = new Ajv2020({ strictSchema: false }).compile(numberRoot);
    const verdicts = [directString(value), directNumber(value)];
    expect(verdicts[0]).not.toBe(verdicts[1]);
    const guard = plugin2020.compileGuard(stringRoot, '/$defs/shared/if');
    expect(guard(value)).not.toBe(!directString(value));
    expect(guard(value)).toBe(!directNumber(value));
    plugin2020.release(stringRoot);
  });
});
