import { afterEach, expect, it } from 'vitest';

import {
  branchExitScenario,
  exitScenarios,
  playScenario,
  presenceReadersScenario,
} from '@aileron/schema-form-scenarios';

import type { JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

it('SETTLE-020·045 presence readers follow child exits and reentries on screen', async () => {
  form = await renderForm(presenceReadersScenario.schema as JSONSchema, {
    defaultValue: presenceReadersScenario.initialValue,
  });
  await playScenario(presenceReadersScenario, form.container);
});

for (const scenario of exitScenarios)
  it(`LANDING-018 ${scenario.name}`, async () => {
    form = await renderForm(scenario.schema as JSONSchema, {
      defaultValue: scenario.initialValue,
    });
    await playScenario(scenario, form.container);
    expect(form.value('/secret')).toBe(
      scenario.name.includes('retain') ? 'held' : '',
    );
  });

it(branchExitScenario.name, async () => {
  form = await renderForm(branchExitScenario.schema as JSONSchema, {
    defaultValue: branchExitScenario.initialValue,
  });
  await playScenario(branchExitScenario, form.container);
  expect(form.value('/a')).toBe('edited');
  expect(form.node('/b')).toBeNull();
});

it('LANDING-148 reset leaves no inactive branch residue and find returns null', async () => {
  form = await renderForm(branchExitScenario.schema as JSONSchema, {
    defaultValue: branchExitScenario.initialValue,
  });
  await form.type('/kind', 'b');
  await form.type('/b', 'edited-b');
  await form.reset();
  expect(form.node('/b')).toBeNull();
  expect(form.exists('/b')).toBe(false);
  expect(form.getValue()).toEqual({ kind: 'a', a: 'seed-a' });
  expect(form.value('/a')).toBe('seed-a');
});
