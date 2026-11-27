import { act, fireEvent } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import type {
  FieldInputDefinition,
  FieldInputProps,
  JSONSchema,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
/** The onChange each rendered input received first, by path. */
const firstOnChange = new Map<string, FieldInputProps<string>['onChange']>();
afterEach(() => {
  form?.unmount();
  firstOnChange.clear();
});

/** Draws from `value` on every render and records its first onChange. */
const ValueInput = ({ path, value, onChange }: FieldInputProps<string>) => {
  if (!firstOnChange.has(path)) firstOnChange.set(path, onChange);
  return (
    <input
      id={path}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

/** One string field drawn by `ValueInput` through a definition. */
const definitionFor = (controlled?: boolean): FieldInputDefinition[] => [
  { test: { path: '/a' }, Component: ValueInput, controlled },
];

/** A source field whose value a `derived` rule copies into `/a`. */
const schema = (presentation?: JSONSchema['presentation']): JSONSchema => ({
  type: 'object',
  properties: {
    source: { type: 'string' },
    a: { type: 'string', controls: { derived: '../source' }, presentation },
  },
});

it('remounts an undeclared input for derived and caller writes', async () => {
  form = await renderForm(schema(), {
    fieldInputDefinitions: definitionFor(),
  });
  const mounted = form.field('/a');

  await form.type('/source', 'derived');

  expect(form.field('/a')).not.toBe(mounted);
  expect(form.value('/a')).toBe('derived');
  const afterDerived = form.field('/a');

  await form.setValue({ source: 'derived', a: 'set' });

  expect(form.field('/a')).not.toBe(afterDerived);
});

it('keeps a controlled input mounted across setValue, reset, refresh and derived writes', async () => {
  form = await renderForm(schema(), {
    defaultValue: { a: 'initial' },
    fieldInputDefinitions: definitionFor(true),
  });
  const input = form.field('/a');

  await form.setValue({ a: 'set' });
  expect(form.value('/a')).toBe('set');
  await form.reset();
  expect(form.value('/a')).toBe('initial');
  await act(async () => form.handle.refresh('/a'));
  await form.type('/source', 'derived');
  expect(form.value('/a')).toBe('derived');

  expect(form.field('/a')).toBe(input);
});

it('keeps an inline input mounted when the schema declares controlled true', async () => {
  form = await renderForm(schema({ FieldInput: ValueInput, controlled: true }));
  const input = form.field('/a');

  await form.setValue({ a: 'set' });

  expect(form.field('/a')).toBe(input);
  expect(form.value('/a')).toBe('set');
});

it.each([
  { definition: true, authored: false },
  { definition: false, authored: true },
])(
  'treats definition $definition with schema $authored as uncontrolled',
  async ({ definition, authored }) => {
    form = await renderForm(schema({ controlled: authored }), {
      fieldInputDefinitions: definitionFor(definition),
    });
    const input = form.field('/a');

    await form.type('/source', 'derived');

    expect(form.field('/a')).not.toBe(input);
    expect(form.value('/a')).toBe('derived');
  },
);

it('keeps accepting input on a controlled input when a Refresh arrives mid-composition', async () => {
  form = await renderForm(schema(), {
    fieldInputDefinitions: definitionFor(true),
  });
  const input = form.field('/a')!;

  fireEvent.compositionStart(input);
  await form.setValue({ a: 'set' });
  fireEvent.change(input, { target: { value: 'typed' } });
  fireEvent.compositionEnd(input);
  await form.flush();

  expect(form.getValue()).toEqual({ a: 'typed' });
  expect(form.field('/a')).toBe(input);
});

it.each([
  { controlled: true, expected: 'late' },
  { controlled: false, expected: 'set' },
])(
  'resolves a callback from before a caller write to $expected when controlled is $controlled',
  async ({ controlled, expected }) => {
    form = await renderForm(schema(), {
      fieldInputDefinitions: definitionFor(controlled),
    });
    const stale = firstOnChange.get('/a')!;

    await form.setValue({ a: 'set' });
    await act(async () => stale('late'));

    expect(form.getValue()).toEqual({ a: expected });
  },
);

it('remounts a controlled input on remount(path)', async () => {
  form = await renderForm(schema(), {
    fieldInputDefinitions: definitionFor(true),
  });
  const input = form.field('/a');

  await act(async () => form.handle.remount('/a'));

  expect(form.field('/a')).not.toBe(input);
});
