import Ajv from 'ajv';
import { expect, it, vi } from 'vitest';

it('VALIDATE-003 keeps the documented Ajv 6 default profile', async () => {
  vi.resetModules();
  const compile = vi.spyOn(Ajv.prototype, 'compile');
  const { ajvValidatorPlugin } = await import('../validatorPlugin');
  ajvValidatorPlugin.compile({ type: 'string' });
  expect(compile.mock.contexts[0]).toMatchObject({
    _opts: { allErrors: true, nullable: true, verbose: true, format: false },
  });
  compile.mockRestore();
});

it('does not register or retain an ID-free legacy root in Ajv', async () => {
  vi.resetModules();
  const { ajvValidatorPlugin } = await import('../validatorPlugin');
  ajvValidatorPlugin.compile({ type: 'string' });
  const addSchema = vi.spyOn(Ajv.prototype, 'addSchema');
  ajvValidatorPlugin.compile({ type: 'number' });
  expect(addSchema).not.toHaveBeenCalled();
  addSchema.mockRestore();
});

it('keeps bound schemas and bare keywords after 65 fresh compiles', async () => {
  const { ajvValidatorPlugin } = await import('../validatorPlugin');
  const instance = new Ajv({ allErrors: true, strictKeywords: true });
  const definitionId = 'https://example.test/ajv6/bound-definition';
  instance.addSchema({ $id: definitionId, definitions: { word: { type: 'string' } } });
  instance.addKeyword('x-annot');
  ajvValidatorPlugin.bind?.(instance);
  for (let index = 0; index < 65; index++)
    ajvValidatorPlugin.compile({ type: 'string' });
  const validate = ajvValidatorPlugin.compile({
    type: 'object',
    'x-annot': 'note',
    properties: { value: { $ref: `${definitionId}#/definitions/word` } },
  });
  expect(await validate({ value: 'ok' })).toBeNull();
  expect(await validate({ value: 1 })).not.toBeNull();
});

it('VALIDATE-033 resolves a bound schema in a first-error guard sibling', async () => {
  const { ajvValidatorPlugin } = await import('../validatorPlugin');
  const instance = new Ajv({ allErrors: true, strictKeywords: true });
  const definitionId = 'https://example.test/ajv6/guard-definition';
  instance.addSchema({ $id: definitionId, type: 'string' });
  ajvValidatorPlugin.bind?.(instance);
  const root = { type: 'object', properties: { value: { $ref: definitionId } } } as const;
  const guard = ajvValidatorPlugin.compileGuard(root, '/properties/value');
  expect(guard('ok')).toBe(true);
  expect(guard(1)).toBe(false);
});

it('VALIDATE-046 resolves a bound schema in a same-id conflict sibling', async () => {
  const { ajvValidatorPlugin } = await import('../validatorPlugin');
  const instance = new Ajv({ allErrors: true, strictKeywords: true });
  const definitionId = 'https://example.test/ajv6/conflict-definition';
  instance.addSchema({ $id: definitionId, type: 'string' });
  ajvValidatorPlugin.bind?.(instance);
  const id = 'https://example.test/ajv6/conflicting-root';
  const first = { $id: id, type: 'number' } as const;
  const second = { $id: id, $ref: definitionId };
  const old = ajvValidatorPlugin.compile(first);
  const current = ajvValidatorPlugin.compile(second);
  expect(await old(1)).toBeNull();
  expect(await current('ok')).toBeNull();
  expect(await current(1)).not.toBeNull();
});
