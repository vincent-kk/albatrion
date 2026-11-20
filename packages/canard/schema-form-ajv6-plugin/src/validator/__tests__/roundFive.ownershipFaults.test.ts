import { expect, it, vi } from 'vitest';
import Ajv from 'ajv';
import { createValidatorFactory } from '../createValidatorFactory';
import { createSchemaRootRegistry } from '../utils/createSchemaRootRegistry';
import { instanceIdRegistrationsOf } from '../utils/instanceIdRegistrationsOf';
import { registerSchemaRoot } from '../utils/registerSchemaRoot';

it('round-5 F03: the ledger finalizer owns each detached registration', () => {
  const instance = new Ajv({ allErrors: true });
  const ledger = instanceIdRegistrationsOf(instance);
  expect(ledger.finalizer).toBeDefined();
  if (!ledger.finalizer) throw new Error('FinalizationRegistry is required by this test');
  const register = vi.spyOn(ledger.finalizer, 'register');
  const root = { type: 'string' as const };
  const registration = registerSchemaRoot(createSchemaRootRegistry(), instance, root);
  expect(register).toHaveBeenCalledExactlyOnceWith(root, registration, registration);
  expect(registration.copy).not.toBe(root);
  register.mockRestore();
});

it('round-5 F19: private compilers leave application formats unchanged', async () => {
  const instance = new Ajv({ allErrors: true });
  instance.addFormat('application-format', /^accepted$/);
  const formats = Reflect.get(instance, '_formats');
  const descriptors = Object.getOwnPropertyDescriptors(formats);
  const validate = createValidatorFactory(instance)({ type: 'string', format: 'application-format' });
  expect(await validate('accepted')).toBeNull();
  expect(await validate('rejected')).not.toBeNull();
  expect(Reflect.get(instance, '_formats')).toBe(formats);
  expect(Object.getOwnPropertyDescriptors(formats)).toEqual(descriptors);
});
