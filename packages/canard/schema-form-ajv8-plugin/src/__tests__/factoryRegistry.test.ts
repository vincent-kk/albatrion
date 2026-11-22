import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { createValidatorFactory as create2019Factory } from '../2019/index';
import { createValidatorFactory as create2020Factory } from '../2020/index';
import { createValidatorFactory } from '../default/index';

interface BetaRegistration {
  readonly directGuards: (object | boolean)[];
  readonly guardChecks: WeakMap<object, boolean>;
  readonly baseAjv: Ajv;
  readonly validationAjv: Ajv;
  guardAjv?: Ajv;
  readonly validationCopy?: JSONSchema;
  guardCopy?: JSONSchema;
  validationRefs: readonly string[];
  validationRegistered: boolean;
  guardRefs?: readonly string[];
  readonly key: string;
  readonly ids: readonly string[];
  readonly hasDynamicKeywords: boolean;
}

interface BetaRegistry {
  readonly entries: WeakMap<JSONSchema, BetaRegistration[]>;
  readonly active: WeakRef<BetaRegistration>[];
  readonly finalizer: FinalizationRegistry<BetaRegistration>;
  compilerBase?: Ajv;
  compilerCurrent?: Ajv;
  compilerCount: number;
}

describe.each([
  ['default', createValidatorFactory, Ajv],
  ['2019', create2019Factory, Ajv2019],
  ['2020', create2020Factory, Ajv2020],
] as const)('%s standalone factory', (_entry, factory, Constructor) => {
  it('accepts the beta registry argument and declaration', async () => {
    expectTypeOf<Parameters<typeof factory>[1]>().toEqualTypeOf<
      BetaRegistry | undefined
    >();
    const registry: BetaRegistry = {
      entries: new WeakMap(),
      active: [],
      finalizer: new FinalizationRegistry(() => {}),
      compilerCount: 0,
    };
    const validate = factory(new Constructor(), registry)({ type: 'string' });

    await expect(validate('x')).resolves.toBeNull();
  });

  it('rejects a direct WeakMap carrying an entries array', () => {
    const registry = Object.assign(new WeakMap(), { entries: [] });
    expect(() =>
      Reflect.apply(factory, undefined, [new Constructor(), registry])({
        type: 'string',
      }),
    ).toThrow(TypeError);
  });

  it('refuses a mutating instance at factory creation', () => {
    expect(() => factory(new Constructor({ coerceTypes: true }))).toThrow(
      expect.objectContaining({ name: 'ValidatorBindRefusedError' }),
    );
  });
});
