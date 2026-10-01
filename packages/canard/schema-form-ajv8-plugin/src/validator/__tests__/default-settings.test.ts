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
