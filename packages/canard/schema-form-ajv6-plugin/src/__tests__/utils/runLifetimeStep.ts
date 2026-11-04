import type { ValidatorPlugin } from '@canard/schema-form';
import type { LifetimeStep, ValidatorScenarioSchema } from '@aileron/schema-form-scenarios/validator';
import type Ajv from 'ajv';
import { expect } from 'vitest';

import { copyOf } from './copyOf';
import { readValidation } from './readValidation';

/**
 * Read the `$id` of a scenario root.
 * @param schema - A shared scenario root
 * @returns Its `$id`, or an empty string when it has none
 */
const idOf = (schema: ValidatorScenarioSchema): string =>
  typeof schema === 'object' && typeof schema.$id === 'string' ? schema.$id : '';

/**
 * Run one shared lifetime step against a freshly loaded validator and assert every check in it.
 * @param step - The step from `@aileron/schema-form-scenarios/validator`
 * @param validator - The entry's validator, loaded for this row only
 * @param instance - The consumer instance bound to it; required by the consumer-registration steps
 * @returns Resolves after the step's roots are released
 * @throws An assertion error naming the first check that differs
 */
export const runLifetimeStep = async (
  step: LifetimeStep,
  validator: ValidatorPlugin,
  instance: Ajv.Ajv | null,
): Promise<void> => {
  if (step.action === 'compileGuardBeforeCompile') {
    const root = copyOf(step.schema);
    const guard = validator.compileGuard(root, step.pointer);
    for (const check of step.guardChecks) expect(guard(check.hostValue)).toBe(check.expected);
    const validate = validator.compile(root);
    for (const check of step.validationChecks) expect(await readValidation(validate, check.value)).toEqual(check.expected);
    for (const check of step.guardChecks) expect(guard(check.hostValue)).toBe(check.expected);
    validator.release?.(root);
  } else if (step.action === 'releaseTwice') {
    const root = copyOf(step.schema);
    validator.release?.(root);
    validator.release?.(root);
    const validate = validator.compile(root);
    for (const check of step.validationChecks) expect(await readValidation(validate, check.value)).toEqual(check.expected);
    validator.release?.(root);
    validator.release?.(root);
    const recompiled = validator.compile(root);
    for (const check of step.validationChecks) expect(await readValidation(recompiled, check.value)).toEqual(check.expected);
    validator.release?.(root);
  } else if (step.action === 'twoRootsSameId') {
    const first = copyOf(step.first);
    const second = copyOf(step.second);
    const validateFirst = validator.compile(first);
    const validateSecond = validator.compile(second);
    expect(validator.compileGuard(first, step.pointer)(step.hostValue)).toBe(step.expected.first.guard);
    expect(validator.compileGuard(second, step.pointer)(step.hostValue)).toBe(step.expected.second.guard);
    expect(await readValidation(validateFirst, step.hostValue)).toEqual(step.expected.first.validation);
    expect(await readValidation(validateSecond, step.hostValue)).toEqual(step.expected.second.validation);
    validator.release?.(first);
    validator.release?.(second);
  } else if (step.action === 'recompileSameCopyAfterRegistrationFailure') {
    const invalid = copyOf(step.invalid);
    const failure = new RegExp(step.failure, 'i');
    expect(() => validator.compile(invalid)).toThrow(failure);
    expect(() => validator.compile(invalid)).toThrow(failure);
    validator.release?.(invalid);
    const valid = copyOf(step.valid);
    const validate = validator.compile(valid);
    for (const check of step.validationChecks) expect(await readValidation(validate, check.value)).toEqual(check.expected);
    validator.release?.(valid);
  } else if (step.action === 'keepConsumerSchemaAfterSameIdFailure') {
    if (!instance) throw new Error(`${step.action} needs the custom profile`);
    instance.addSchema(copyOf(step.consumer));
    const clash = copyOf(step.clash);
    expect(() => validator.compile(clash)).toThrow(new RegExp(step.failure, 'i'));
    expect(instance.getSchema(idOf(step.consumer))?.(step.consumerValue)).toBe(true);
    validator.release?.(clash);
  } else {
    if (!instance) throw new Error(`${step.action} needs the custom profile`);
    instance.addMetaSchema(copyOf(step.metaSchema));
    instance.addSchema(copyOf(step.user));
    const clash = copyOf(step.clash);
    expect(() => validator.compile(clash)).toThrow(new RegExp(step.failure, 'i'));
    expect(instance.getSchema(idOf(step.user))?.(step.userValue)).toBe(true);
    const siblings = [copyOf(step.sibling), copyOf(step.sibling)];
    for (const sibling of siblings) {
      expect(await readValidation(validator.compile(sibling), step.userValue)).toEqual({ valid: true, dataPaths: [] });
    }
    for (const sibling of siblings) validator.release?.(sibling);
    validator.release?.(clash);
  }
};
