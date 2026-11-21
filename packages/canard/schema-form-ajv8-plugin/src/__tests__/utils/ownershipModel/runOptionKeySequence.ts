import type { JSONSchema, ValidatorFactory } from '@canard/schema-form';
import { expect } from 'vitest';

import { compileOracle } from './compileOracle';
import { outcomeOf } from './outcomeOf';
import type { ModelApplication, ModelProfile } from './types';

/**
 * Replace an undefined option with another name at equal key count, then restore the application profile.
 * @param app - Application receiving only read-only plugin compilation between option operations.
 * @param twin - Application-only oracle receiving the same option operations.
 * @param profile - Native version, adapter and fresh-oracle constructors.
 * @param variation - Seeded choice of factory, root identity and harmless key reordering.
 * @param context - Original seed and operation position printed with failed equivalences.
 * @returns Weak caller roots and retained snapshot functions for the collection oracle.
 */
export const runOptionKeySequence = async <T extends ModelApplication>(
  app: T,
  twin: T,
  profile: ModelProfile<T>,
  variation: number,
  context: string,
) => {
  const states = [app, twin].map((instance) => {
    const options: unknown =
      Reflect.get(instance, '_opts') ?? Reflect.get(instance, 'opts');
    if (!options || typeof options !== 'object')
      throw new Error('Native options are missing');
    return {
      options,
      comment: Object.getOwnPropertyDescriptor(options, '$comment'),
      precision: Object.getOwnPropertyDescriptor(
        options,
        'multipleOfPrecision',
      ),
    };
  });
  const root = {
    type: 'object',
    title: 'before option replacement',
    properties: { value: { type: 'number', multipleOf: 0.1 } },
  } satisfies JSONSchema;
  const after =
    variation & 1 ? root : { ...root, title: 'after option replacement' };
  const adapter = profile.adapter(app);
  const compile =
    variation & 4 && profile.factory ? profile.factory(app) : adapter.compile;
  const data = { value: 0.3 };
  const functions: unknown[] = [];
  let current: ReturnType<ValidatorFactory['compile']> | undefined;
  let currentGuard:
    | ReturnType<NonNullable<ValidatorFactory['compileGuard']>>
    | undefined;
  try {
    for (const { options } of states) {
      Reflect.deleteProperty(options, 'multipleOfPrecision');
      Reflect.set(options, '$comment', undefined);
    }
    const previous = compile(root);
    const previousGuard = adapter.compileGuard?.(root, '/properties/value');
    const before = await outcomeOf(() => previous(data));
    expect(before, `${context}: precision absent`).toHaveProperty('issues');
    expect(
      previousGuard?.(0.3),
      `${context}: guard before key replacement`,
    ).toBe(false);
    const count = Object.keys(states[0].options).length;
    for (const { options } of states) {
      Reflect.deleteProperty(options, '$comment');
      Reflect.set(options, 'multipleOfPrecision', 12);
    }
    expect(
      Object.keys(states[0].options).length,
      `${context}: equal option-key count`,
    ).toBe(count);
    after.title = 'after option replacement';
    current = compile(after);
    const expected = await compileOracle(twin, profile, after, data);
    expect(expected, `${context}: native current profile`).toEqual({
      value: null,
    });
    expect(
      await outcomeOf(() => current?.(data)),
      `${context}: current option-key equivalence`,
    ).toEqual(expected);
    currentGuard = adapter.compileGuard?.(after, '/properties/value');
    expect(currentGuard?.(0.3), `${context}: guard current profile`).toBe(true);
    expect(
      await outcomeOf(() => previous(data)),
      `${context}: old validator snapshot`,
    ).toEqual(before);
    expect(previousGuard?.(0.3), `${context}: old guard snapshot`).toBe(false);
    functions.push(previous, previousGuard, current, currentGuard);
    if (variation & 8) {
      for (const { options } of states) {
        const key = Object.keys(options)[0];
        const descriptor = Object.getOwnPropertyDescriptor(options, key);
        if (descriptor) {
          Reflect.deleteProperty(options, key);
          Object.defineProperty(options, key, descriptor);
        }
      }
      const reordered = compile(after);
      expect(
        await outcomeOf(() => reordered(data)),
        `${context}: reordered option keys`,
      ).toEqual(expected);
      functions.push(reordered);
    }
  } finally {
    for (const state of states)
      for (const name of ['$comment', 'multipleOfPrecision']) {
        const descriptor =
          name === '$comment' ? state.comment : state.precision;
        if (descriptor) Object.defineProperty(state.options, name, descriptor);
        else Reflect.deleteProperty(state.options, name);
      }
    adapter.release?.(root);
    adapter.release?.(after);
  }
  expect(
    await outcomeOf(() => current?.(data)),
    `${context}: retained new validator snapshot`,
  ).toEqual({ value: null });
  expect(currentGuard?.(0.3), `${context}: retained new guard snapshot`).toBe(
    true,
  );
  return {
    references: [profile.observe(root), profile.observe(after)],
    functions,
  };
};
