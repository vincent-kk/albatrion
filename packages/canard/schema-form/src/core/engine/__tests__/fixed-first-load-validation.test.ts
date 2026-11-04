import { expect, it, vi } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';

import { engineModes } from '../utils/cache/engineModes';
import { dispatchMount, dispatchValidate, subscribeFieldNode } from '../write';
import { createTestTree } from './fixtures/createTestTree';

/** Report whether the active engine modes admit the fixed-first mount route. */
const isFixedFirstLoadAdmissible = (): boolean =>
  engineModes.gateSelection !== 'verify' &&
  engineModes.gateWheel !== 'shadow' &&
  !engineModes.deriveShadow;

// filid:contract fixed-first-load-validation
it('T9 selects synchronous guards while whole compilation stays deferred on the authored copy', async () => {
  const schema = {
    type: 'object',
    properties: {
      kind: { type: 'string', default: 'a' },
      value: { type: 'string', default: 'x' },
    },
    if: { properties: { kind: { const: 'a' } } },
    then: { properties: { value: { minLength: 2 } } },
    else: { properties: { value: { maxLength: 0 } } },
  };
  const run = async (general: boolean) => {
    const validator = createTestValidator();
    const compile = vi.spyOn(validator, 'compile');
    const compileGuard = vi.spyOn(validator, 'compileGuard');
    const { root, visits } = createTestTree(schema, validator);
    const plan = Reflect.get(root.runtime.blueprint, 'fixedFirstLoadPlan');
    if (general)
      root.runtime.blueprint = Object.create(root.runtime.blueprint, {
        fixedFirstLoadPlan: { value: undefined },
      });
    root.runtime.validationMode = 2;
    const deliveries: unknown[] = [];
    subscribeFieldNode(root, (event) => deliveries.push(event));
    dispatchMount(root, undefined, undefined, { deferValidation: true });
    const selectedSlots = visits.filter((visit) =>
      visit.startsWith('select:'),
    ).length;
    expect(compile).not.toHaveBeenCalled();
    expect(compileGuard).toHaveBeenCalledTimes(1);
    expect(root.structure!.value.schema.schema).toMatchObject({ minLength: 2 });
    const issues = await dispatchValidate(root);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(compile.mock.calls[0][0]).toMatchObject({
      if: schema.if,
      then: schema.then,
      else: schema.else,
    });
    expect(issues.some((issue) => issue.keyword === 'minLength')).toBe(true);
    await dispatchValidate(root);
    expect(compile).toHaveBeenCalledTimes(1);
    return {
      issues,
      deliveries,
      selectedSlots,
      plan,
      value: root.emit,
      schema: root.structure!.value.schema.schema,
      revision: root.revisionLedger,
      commit: root.runtime.commitNumber,
    };
  };
  const { selectedSlots, plan, ...actual } = await run(false);
  const {
    selectedSlots: generalSlots,
    plan: _plan,
    ...oracle
  } = await run(true);
  expect(actual).toEqual(oracle);
  expect(plan).toBeDefined();
  if (isFixedFirstLoadAdmissible())
    expect(selectedSlots).toBeLessThan(generalSlots);
  else
    expect(
      selectedSlots,
      'Verifier fallback retains general selection work',
    ).toBe(generalSlots);
});
