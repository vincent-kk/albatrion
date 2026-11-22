import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { expect, it } from 'vitest';

import { createValidatorFactory as create2019Factory } from '../2019/index';
import { createValidatorFactory as create2020Factory } from '../2020/index';
import { createValidatorFactory } from '../default/index';

it.each([
  ['default', createValidatorFactory, () => new Ajv()],
  ['2019', create2019Factory, () => new Ajv2019()],
  ['2020', create2020Factory, () => new Ajv2020()],
] as const)('accepts a beta registry through the %s factory', async (_entry, factory, createAjv) => {
  type BetaRegistration = { baseAjv: Ajv; ids: readonly string[] };
  const validate = factory(createAjv(), {
    entries: new WeakMap<JSONSchema, BetaRegistration[]>(),
    active: [],
    finalizer: new FinalizationRegistry<BetaRegistration>(() => {}),
    compilerCount: 0,
  })({ type: 'string' });

  await expect(validate('x')).resolves.toBeNull();
});
