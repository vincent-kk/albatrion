import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import * as api from '../index';

const profiles = [{ Constructor: Ajv, api }];

it('option-key replacement resolves like a fresh native profile even when the key count stays constant', async () => {
  for (const { Constructor, api } of profiles)
    for (const entry of ['validation', 'factory', 'direct', 'context'])
      for (const sameRoot of [false, true]) {
        const source = new Constructor({ logger: false, allErrors: undefined });
        const options =
          Reflect.get(source, '_opts') ?? Reflect.get(source, 'opts');
        const adapter = api.createValidator(source, {
          directGuardCompile: entry === 'direct',
        });
        const factory = api.createValidatorFactory(source);
        const compile = (root: JSONSchema) => {
          if (entry === 'direct' || entry === 'context') {
            const guard = adapter.compileGuard?.(root, '/properties/value');
            if (!guard) throw new Error('Expected a public guard compiler');
            return async () => await guard(0.3);
          }
          const validate =
            entry === 'factory' ? factory(root) : adapter.compile(root);
          return async () => (await validate({ value: 0.3 })) === null;
        };
        const root = {
          type: 'object',
          title: 'before',
          properties: { value: { type: 'number', multipleOf: 0.1 } },
        } satisfies JSONSchema;
        const previous = compile(root);
        expect(await previous()).toBe(false);
        const beforeKeys = Object.keys(options);
        expect(Object.prototype.hasOwnProperty.call(options, 'allErrors')).toBe(
          true,
        );
        expect(
          Object.prototype.hasOwnProperty.call(options, 'multipleOfPrecision'),
        ).toBe(false);
        Reflect.deleteProperty(options, 'allErrors');
        Reflect.set(options, 'multipleOfPrecision', 12);
        expect(Object.keys(options).length).toBe(beforeKeys.length);
        const currentRoot = sameRoot ? root : { ...root, title: 'after' };
        if (sameRoot) currentRoot.title = 'after';
        const current = compile(currentRoot);
        const native = source.compile(currentRoot);
        const input = { value: 0.3 };
        const expected = native(input);
        expect(expected).toBe(true);
        expect
          .soft(
            await current(),
            `${entry}, sameRoot=${sameRoot}: current option keys`,
          )
          .toBe(expected);
        expect(await previous()).toBe(false);
      }
});
