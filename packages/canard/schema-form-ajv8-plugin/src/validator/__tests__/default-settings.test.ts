import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { expect, it, vi } from 'vitest';

it.each([
  ['default', Ajv, () => import('../../default/validatorPlugin')],
  ['2019', Ajv2019, () => import('../../2019/validatorPlugin')],
  ['2020', Ajv2020, () => import('../../2020/validatorPlugin')],
] as const)('VALIDATE-003 keeps the documented Ajv 8 %s default profile', async (_dialect, Constructor, load) => {
  vi.resetModules();
  const compile = vi.spyOn(Constructor.prototype, 'compile');
  const { ajvValidatorPlugin } = await load();
  ajvValidatorPlugin.compile({ type: 'string' });
  expect(compile.mock.contexts[0]).toMatchObject({
    opts: { allErrors: true, strictSchema: false, validateFormats: false, allowUnionTypes: true },
  });
  compile.mockRestore();
});

it('does not register or retain an ID-free legacy root in Ajv', async () => {
  vi.resetModules();
  const { ajvValidatorPlugin } = await import('../../default/validatorPlugin');
  ajvValidatorPlugin.compile({ type: 'string' });
  const addSchema = vi.spyOn(Ajv.prototype, 'addSchema');
  ajvValidatorPlugin.compile({ type: 'number' });
  expect(addSchema).not.toHaveBeenCalled();
  addSchema.mockRestore();
});

it('keeps a bound format after the shared compiler rolls over', async () => {
  vi.resetModules();
  const { ajvValidatorPlugin } = await import('../../default/validatorPlugin');
  const instance = new Ajv({ strictSchema: false, validateFormats: true });
  instance.addFormat('only-x', /^x$/);
  ajvValidatorPlugin.bind(instance);
  for (let index = 0; index < 65; index++)
    ajvValidatorPlugin.compile({ type: 'string' });
  const validate = ajvValidatorPlugin.compile({ type: 'string', format: 'only-x' });
  expect(await validate('y')).not.toBeNull();
  expect(await validate('x')).toBeNull();
});

it('keeps bound schemas and bare keywords after 65 fresh compiles', async () => {
  const { ajvValidatorPlugin } = await import('../../default/validatorPlugin');
  const instance = new Ajv({ allErrors: true, strict: true });
  const definitionId = 'https://example.test/ajv8/bound-definition';
  instance.addSchema({ $id: definitionId, $defs: { word: { type: 'string' } } });
  instance.addKeyword('x-annot');
  ajvValidatorPlugin.bind(instance);
  for (let index = 0; index < 65; index++)
    ajvValidatorPlugin.compile({ type: 'string' });
  const validate = ajvValidatorPlugin.compile({
    type: 'object',
    'x-annot': 'note',
    properties: { value: { $ref: `${definitionId}#/$defs/word` } },
  });
  expect(await validate({ value: 'ok' })).toBeNull();
  expect(await validate({ value: 1 })).not.toBeNull();
});

it('VALIDATE-033 resolves a bound schema in a first-error guard sibling', async () => {
  const { ajvValidatorPlugin } = await import('../../default/validatorPlugin');
  const instance = new Ajv({ allErrors: true, strict: true });
  const definitionId = 'https://example.test/ajv8/guard-definition';
  instance.addSchema({ $id: definitionId, type: 'string' });
  const root = { type: 'object', properties: { value: { $ref: definitionId } } } as const;
  ajvValidatorPlugin.bind(instance);
  const guard = ajvValidatorPlugin.compileGuard(root, '/properties/value');
  expect(guard('ok')).toBe(true);
  expect(guard(1)).toBe(false);
});

it('VALIDATE-046 resolves a bound schema in a same-id conflict sibling', async () => {
  const { ajvValidatorPlugin } = await import('../../default/validatorPlugin');
  const instance = new Ajv({ allErrors: true, strict: true });
  const definitionId = 'https://example.test/ajv8/conflict-definition';
  instance.addSchema({ $id: definitionId, type: 'string' });
  ajvValidatorPlugin.bind(instance);
  const id = 'https://example.test/ajv8/conflicting-root';
  const first = { $id: id, type: 'number' } as const;
  const second = { $id: id, $ref: definitionId };
  const old = ajvValidatorPlugin.compile(first);
  const current = ajvValidatorPlugin.compile(second);
  expect(await old(1)).toBeNull();
  expect(await current('ok')).toBeNull();
  expect(await current(1)).not.toBeNull();
});
