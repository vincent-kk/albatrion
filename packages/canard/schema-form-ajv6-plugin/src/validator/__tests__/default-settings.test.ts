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
