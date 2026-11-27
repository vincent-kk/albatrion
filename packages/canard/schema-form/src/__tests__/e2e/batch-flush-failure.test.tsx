import { afterEach, expect, it, vi } from 'vitest';

import { type FieldInputProps, SetValueOption } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Each scenario owns the public Form and its error observers. */
let form: FormHarness;
afterEach(() => form?.unmount());

it('reports a throwing input Merge and delivers onChange for the next field edit', async () => {
  const failure = new Error('input ownKeys failure');
  const onChange = vi.fn();
  const BrokenInput = ({
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <button
      type="button"
      onClick={() =>
        onChange(
          new Proxy(
            {},
            {
              ownKeys() {
                throw failure;
              },
            },
          ),
          SetValueOption.Merge,
        )
      }
    >
      Fail Merge
    </button>
  );
  form = await renderForm(
    {
      type: 'object',
      properties: {
        bad: {
          type: 'object',
          options: { terminal: true },
          presentation: { FieldInput: BrokenInput },
        },
        other: { type: 'string' },
      },
    },
    { defaultValue: { bad: {}, other: '' }, onChange },
  );
  onChange.mockClear();
  await form.user.click(form.container.querySelector('button')!);
  expect(form.sinkErrors()).toContain(failure);
  expect(
    form.errorRecords().filter((record) => record.error === failure),
  ).toHaveLength(1);
  await form.type('/other', 'x');
  expect(onChange).toHaveBeenCalledExactlyOnceWith({ other: 'x' });
  expect(form.value('/other')).toBe('x');
});
