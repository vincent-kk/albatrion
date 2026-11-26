import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createValidatorFactory as create2019Factory } from '../2019/index';
import { createValidatorFactory as create2020Factory } from '../2020/index';
import { createValidatorFactory } from '../default/index';

describe.each([
  ['default', createValidatorFactory, Ajv],
  ['2019', create2019Factory, Ajv2019],
  ['2020', create2020Factory, Ajv2020],
] as const)('%s standalone factory', (_entry, factory, Constructor) => {
  it('refuses a mutating instance at factory creation', () => {
    expect(() => factory(new Constructor({ coerceTypes: true }))).toThrow(
      expect.objectContaining({ name: 'ValidatorBindRefusedError' }),
    );
  });
});
