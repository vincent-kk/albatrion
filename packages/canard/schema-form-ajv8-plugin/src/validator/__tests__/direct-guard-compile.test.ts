import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../../default/validatorPlugin';
import { isSelfContainedGuard } from '../utils/isSelfContainedGuard';
import { resolveGuardSchema } from '../utils/resolveGuardSchema';
import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';

describe.each([
  { dialect: 'default', plugin: ajvValidatorPlugin, Constructor: Ajv },
  { dialect: '2019', plugin: plugin2019, Constructor: Ajv2019 },
  { dialect: '2020', plugin: plugin2020, Constructor: Ajv2020 },
] as const)('direct guard $dialect', ({ dialect, plugin: ajvValidatorPlugin, Constructor }) => {

afterEach(() => {
  ajvValidatorPlugin.configure({ directGuardCompile: true });
  vi.restoreAllMocks();
});

it('directGuardCompile uses the copy subschema identity and release frees it', () => {
  ajvValidatorPlugin.bind?.(new Constructor({ allErrors: true, strict: false, validateFormats: true }));
  const copy = { type: 'object', if: { type: 'string' } } as const;
  const compile = vi.spyOn(Constructor.prototype, 'compile');
  const remove = vi.spyOn(Constructor.prototype, 'removeSchema');
  const predicate = ajvValidatorPlugin.compileGuard(copy, '/if');
  expect(predicate('ok')).toBe(true);
  expect(predicate(1)).toBe(false);
  const index = compile.mock.calls.findIndex(([schema]) => schema === copy.if);
  expect(index).toBeGreaterThanOrEqual(0);
  expect(compile.mock.calls.some(([schema]) => schema !== copy.if && typeof schema === 'object' && schema !== null && '$ref' in schema)).toBe(false);
  const guard = compile.mock.contexts[index];
  if (typeof guard !== 'object' || guard === null) throw new Error('Missing guard instance');
  expect(guard).toMatchObject({ opts: { allErrors: false } });
  ajvValidatorPlugin.release(copy);
  expect(remove).toHaveBeenCalledWith(copy.if);
  expect(Reflect.get(guard, '_cache').has(copy.if)).toBe(false);
});

it('directGuardCompile gives the root-pointer verdict', () => {
  const instance = new Constructor({ allErrors: true, strict: false, validateFormats: true });
  instance.addFormat('only-x', /^x$/);
  ajvValidatorPlugin.bind?.(instance);
  const schemas: unknown[] = [
    { type: 'string' }, { const: 'x' }, { enum: ['x', 1] },
    { type: 'object', properties: { kind: { const: 'x' } }, required: ['kind'] },
    { type: 'string', pattern: '^x' }, { type: 'string', format: 'only-x' },
    { allOf: [{ anyOf: [{ type: 'string' }, { type: 'number' }] }, { not: { const: 1 } }] },
    true, false, { $ref: '#/definitions/eligible' },
    { properties: { value: { $id: 'nested', type: 'string' } } },
    { $anchor: 'condition', type: 'string' },
  ];
  const values = [null, true, 1, 2, 'x', 'xyz', 'no', {}, { kind: 'x' }, { kind: 'y' }, { value: 1 }];
  for (const schema of schemas) {
    const copy: JSONSchema = { type: 'object' };
    Object.assign(copy, { definitions: { eligible: { type: 'string' } }, if: schema, then: false, else: true });
    ajvValidatorPlugin.configure({ directGuardCompile: true });
    const direct = ajvValidatorPlugin.compileGuard(copy, '/if');
    ajvValidatorPlugin.configure({ directGuardCompile: false });
    const pointer = ajvValidatorPlugin.compileGuard(copy, '/if');
    for (const value of values) expect(direct(value)).toBe(pointer(value));
    ajvValidatorPlugin.release(copy);
  }
});

it('uses the root-pointer path for contextual guards and when configured off', () => {
  ajvValidatorPlugin.bind?.(new Constructor({ allErrors: true, strict: false, validateFormats: true }));
  const compile = vi.spyOn(Constructor.prototype, 'compile');
  for (const [schema, enabled] of [
    [{ $ref: '#/definitions/eligible' }, true],
    [{ properties: { value: { $id: 'inner', type: 'string' } } }, true],
    [{ $anchor: 'condition', type: 'string' }, true],
    [{ type: 'string' }, false],
  ] as const) {
    const copy = { type: 'object', definitions: { eligible: { type: 'string' } }, if: schema } as JSONSchema;
    ajvValidatorPlugin.configure({ directGuardCompile: enabled });
    compile.mockClear();
    ajvValidatorPlugin.compileGuard(copy, '/if');
    expect(compile.mock.calls.some(([candidate]) => candidate === schema)).toBe(false);
    expect(compile.mock.calls.some(([candidate]) => typeof candidate === 'object' && candidate !== null && '$ref' in candidate)).toBe(true);
    ajvValidatorPlugin.release(copy);
  }
});

it.each([true, false])('refuses asynchronous guard schemas with directGuardCompile=%s', (directGuardCompile) => {
  ajvValidatorPlugin.bind?.(new Constructor({ strict: false }));
  ajvValidatorPlugin.configure({ directGuardCompile });
  const copy: JSONSchema = { type: 'object' };
  Object.assign(copy, { if: { $async: true, type: 'string' } });
  expect(() => ajvValidatorPlugin.compileGuard(copy, '/if')).toThrow('async schema in sync schema');
  ajvValidatorPlugin.release(copy);
});

it('caches recursive self-containment checks per subschema object', () => {
  const cache = new WeakMap<object, boolean>();
  const keys = vi.fn(() => ['type']);
  const schema = { allOf: [new Proxy({ type: 'string' }, { ownKeys: keys })] };
  expect(isSelfContainedGuard(schema, cache)).toBe(true);
  expect(isSelfContainedGuard(schema, cache)).toBe(true);
  expect(keys).toHaveBeenCalledTimes(1);
  for (const key of ['$ref', '$dynamicRef', '$recursiveRef', '$id', '$anchor', '$dynamicAnchor', '$recursiveAnchor'])
    expect(isSelfContainedGuard({ annotation: [{ [key]: 'value' }] }, cache)).toBe(false);
});

it('resolves escaped pointers to the original guard object', () => {
  const schema = { type: 'string' };
  const copy = { type: 'object', definitions: { 'a/b~c': { if: schema } } };
  expect(resolveGuardSchema(copy, '#/definitions/a~1b~0c/if')).toBe(schema);
  expect(resolveGuardSchema(copy, '')).toBe(copy);
  expect(resolveGuardSchema({ if: false }, '/if')).toBe(false);
  expect(resolveGuardSchema(copy, '/missing/if')).toBeUndefined();
});

it('release of a boolean guard keeps other live roots\' guards', () => {
  ajvValidatorPlugin.bind?.(new Constructor({ allErrors: true, strict: false, validateFormats: true }));
  const remove = vi.spyOn(Constructor.prototype, 'removeSchema');
  for (const schema of [true, false]) {
    const live: JSONSchema = { type: 'object' };
    Object.assign(live, { if: { type: 'string' } });
    const boolean: JSONSchema = { type: 'object' };
    Object.assign(boolean, { if: schema });
    const livePredicate = ajvValidatorPlugin.compileGuard(live, '/if');
    expect(ajvValidatorPlugin.compileGuard(boolean, '/if')(1)).toBe(schema);
    ajvValidatorPlugin.release(boolean);
    expect(remove.mock.calls.some((args) => args.length === 0 || args[0] === undefined)).toBe(false);
    expect(livePredicate('x')).toBe(true);
    expect(livePredicate(1)).toBe(false);
    const fresh = ajvValidatorPlugin.compileGuard(live, '/if');
    expect(fresh('x')).toBe(true);
    expect(fresh(1)).toBe(false);
    ajvValidatorPlugin.release(live);
  }
});

if (dialect !== 'default') {
  it('preserves dialect-specific dynamic and recursive root-pointer verdicts', () => {
    ajvValidatorPlugin.bind(new Constructor({ allErrors: true, strict: false, validateFormats: true }));
    const schemas = dialect === '2020'
      ? [{ properties: { next: { $dynamicRef: '#node' } }, required: ['next'] }]
      : [{ properties: { next: { $recursiveRef: '#' } }, required: ['next'] },
        { properties: { next: { $dynamicRef: '#node' } }, required: ['next'] }];
    for (const schema of schemas) {
      const copy: JSONSchema = {
        type: 'object', properties: { kind: { type: 'string', const: 'x' } }, required: ['kind'],
      };
      Object.assign(copy, {
        $id: 'https://example.test/direct-context',
        ...(dialect === '2020' ? { $dynamicAnchor: 'node' } : { $recursiveAnchor: true, $dynamicAnchor: 'node' }),
        $defs: { branch: { if: schema } },
      });
      ajvValidatorPlugin.configure({ directGuardCompile: true });
      const direct = ajvValidatorPlugin.compileGuard(copy, '/$defs/branch/if');
      ajvValidatorPlugin.configure({ directGuardCompile: false });
      const pointer = ajvValidatorPlugin.compileGuard(copy, '/$defs/branch/if');
      for (const value of [{}, { next: { kind: 'x' } }, { next: { kind: 'y' } }, { next: 1 }])
        expect(direct(value)).toBe(pointer(value));
      ajvValidatorPlugin.release(copy);
    }
  });
}
});
