import { Profiler } from 'react';

import { act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form, type JSONSchema, type ValidationIssue } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

// An OnChange validation whose result deep-equals the previous root result keeps the error lists and sends no
// error wave (EVENT-046, GOAL-011, SURFACE-053, 207C-01); a changed result publishes as before.

/** Form whose `/name` fails below three characters. */
const schema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
} satisfies JSONSchema;

/** Harness of the current case, unmounted after each case. */
let form: FormHarness | undefined;
afterEach(() => form?.unmount());

/**
 * Render the schema with the AJV render validator, a children function and a commit counter.
 * @param defaultValue - Initial form value
 * @returns The harness, the onValidate spy and a reader of the commit count below the group
 */
const renderCounted = async (defaultValue: { name: string }) => {
  let commits = 0;
  const onValidate = vi.fn((_errors: readonly ValidationIssue[]) => undefined);
  form = await renderForm(schema, {
    defaultValue,
    validator: true,
    onValidate,
    children: () => (
      <Profiler
        id="group"
        onRender={() => {
          commits++;
        }}
      >
        <Form.Group />
      </Profiler>
    ),
  });
  return { harness: form, onValidate, commits: () => commits };
};

/**
 * Write one value and wait for the validation wave.
 * @param harness - Rendered form
 * @param name - Next value of `/name`
 * @returns Completion after the validation microtask and its wave
 */
const write = async (harness: FormHarness, name: string) => {
  act(() => {
    harness.handle.setValue({ name });
  });
  await harness.flush();
};

describe('207C-01 unchanged validation result', () => {
  it('calls onValidate only when the error aggregate changes', async () => {
    const { harness, onValidate } = await renderCounted({ name: 'ab' });
    const mounted = onValidate.mock.calls.length;
    for (const name of ['ac', 'ad', 'ae']) await write(harness, name);
    expect(onValidate.mock.calls.length - mounted).toBe(0);
    await write(harness, 'abcd');
    expect(onValidate.mock.calls.length - mounted).toBe(1);
    expect(onValidate.mock.lastCall?.[0]).toEqual([]);
    await write(harness, 'abcde');
    expect(onValidate.mock.calls.length - mounted).toBe(1);
  });

  it('keeps globalErrors and the node errors by reference for an unchanged non-empty result', async () => {
    const { harness } = await renderCounted({ name: 'ab' });
    const globalErrors = harness.getErrors();
    const nodeErrors = harness.node('/name')!.errors;
    expect(nodeErrors).toHaveLength(1);
    await write(harness, 'ac');
    expect(harness.getErrors()).toBe(globalErrors);
    expect(harness.node('/name')!.errors).toBe(nodeErrors);
  });

  it('commits once per write when the result stays the same and twice when it changes', async () => {
    const { harness, commits } = await renderCounted({ name: 'ab' });
    let start = commits();
    await write(harness, 'ac');
    expect(commits() - start).toBe(1);
    start = commits();
    await write(harness, 'abcd');
    expect(commits() - start).toBe(2);
  });

  it('publishes the same result again after reset', async () => {
    const { harness, onValidate } = await renderCounted({ name: 'ab' });
    await write(harness, 'ac');
    const before = onValidate.mock.calls.length;
    await harness.reset();
    await harness.flush();
    expect(onValidate.mock.calls.length).toBeGreaterThan(before);
  });

  it('keeps external errors displayed when the validation result is unchanged', async () => {
    const { harness } = await renderCounted({ name: 'ab' });
    const external: ValidationIssue = {
      dataPath: '',
      message: 'server says no',
    };
    act(() => {
      harness.handle.node!.setExternalErrors([external]);
    });
    await harness.flush();
    const withExternal = harness.getErrors();
    expect(withExternal).toContain(external);
    await write(harness, 'ac');
    expect(harness.getErrors()).toBe(withExternal);
    expect(harness.getErrors()).toContain(external);
  });
});
