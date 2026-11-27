import Ajv from 'ajv';
import type { Options } from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

/** Constructor isolation includes caches and code-generation state, not only schema registries. */
it('isolation constructors refuse shared mutable compilation state before compiling a guard', () => {
  for (const key of ['_cache', '_opts']) {
    let shared: unknown;
    class AliasingConstructor extends Ajv {
      constructor(options?: Options) {
        super(options);
        if (shared === undefined) shared = Reflect.get(this, key);
        else Reflect.set(this, key, shared);
      }
    }
    const source = new AliasingConstructor({
      meta: false,
      validateSchema: false,
      allErrors: true,
      logger: false,
    });
    expect(typeof shared, key).toBe('object');
    const applicationSchema = { type: 'number', minimum: 3 };
    const control = source.compile(applicationSchema);
    const options = Reflect.get(source, '_opts') ?? Reflect.get(source, 'opts');
    if (!options || typeof options !== 'object')
      throw new Error('Native options are missing');
    const adapter = createValidator(source, { directGuardCompile: false });
    expect
      .soft(
        () =>
          adapter.compileGuard(
            {
              type: 'number',
              definitions: { condition: { type: 'number', minimum: 3 } },
              if: { $ref: '#/definitions/condition' },
              then: { minimum: 4 },
            },
            '/if',
          ),
        key,
      )
      .toThrow(/isolation compiler creation failed/);
    expect.soft(source.compile(applicationSchema), key).toBe(control);
    expect.soft(Reflect.get(options, 'allErrors'), key).toBe(true);
  }
});
