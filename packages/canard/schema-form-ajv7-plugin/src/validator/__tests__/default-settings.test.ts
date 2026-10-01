import Ajv from 'ajv';
import { expect, it, vi } from 'vitest';

it('VALIDATE-003 keeps the documented Ajv 7 default profile', async () => {
  vi.resetModules();
  const compile = vi.spyOn(Ajv.prototype, 'compile');
  const { ajvValidatorPlugin } = await import('../validatorPlugin');
  ajvValidatorPlugin.compile({ type: 'string' });
  expect(compile.mock.contexts[0]).toMatchObject({
    opts: { allErrors: true, strict: false, validateFormats: false },
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

it('keeps a bound format after the shared compiler rolls over', async () => {
  vi.resetModules();
  const { ajvValidatorPlugin } = await import('../validatorPlugin');
  const instance = new Ajv({ strict: false, validateFormats: true });
  instance.addFormat('only-x', /^x$/);
  ajvValidatorPlugin.bind?.(instance);
  for (let index = 0; index < 65; index++)
    ajvValidatorPlugin.compile({ type: 'string' });
  const validate = ajvValidatorPlugin.compile({ type: 'string', format: 'only-x' });
  expect(await validate('y')).not.toBeNull();
  expect(await validate('x')).toBeNull();
});
