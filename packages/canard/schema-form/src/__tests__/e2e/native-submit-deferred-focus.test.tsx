import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type JSONSchema,
  VirtualizationBackfill,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

// Native-submit and handle focus share the public contract; viewport and idle reveal stay off.

let form: FormHarness;

/** An observer that never reports an intersection. */
class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', SilentObserver);
  vi.stubGlobal('requestIdleCallback', () => 0);
  vi.stubGlobal('cancelIdleCallback', () => {});
});
afterEach(() => {
  form?.unmount();
  vi.unstubAllGlobals();
});

/** Root input: every child field, then the form's submit button. */
const RootWithSubmit = ({ ChildFields }: FieldInputProps) => (
  <>
    {ChildFields.map((Child) => (
      <Child key={Child.key} />
    ))}
    <button type="submit">submit</button>
  </>
);

/** Keep the first child mounted and every following child deferred. */
const virtualization = {
  threshold: 2,
  eagerCount: 1,
  backfill: VirtualizationBackfill.None,
};

/**
 * Seven filled text fields followed by one more property.
 * @param last - Name and schema of the eighth property.
 * @returns An object schema whose last property is deferred.
 */
const schemaEndingWith = (last: [string, object]): JSONSchema =>
  ({
    type: 'object',
    properties: Object.fromEntries([
      ...Array.from({ length: 7 }, (_, index) => [
        `f${index}`,
        { type: 'string', default: `v${index}` },
      ]),
      last,
    ]),
  }) as JSONSchema;

/** A branch whose first input differs from the requested invalid descendant. */
const lateBranch = {
  type: 'object',
  properties: {
    first: { type: 'string', default: 'first' },
    name: { type: 'string', minLength: 3, default: 'v' },
  },
} as const;

// filid:contract approximate-focus
describe.each([false, true])('deferred focus (StrictMode=%s)', (strictMode) => {
  it('focus(path) reveals an ancestor and approximately focuses inside it once', async () => {
    form = await renderForm(schemaEndingWith(['late', lateBranch]), {
      virtualization: { ...virtualization, threshold: 3 },
      strictMode,
    });
    expect(form.deferred('/late')).toBe(true);
    expect(form.field('/late/name')).toBeNull();
    const focuses: string[] = [];
    form.container.addEventListener('focusin', (event) =>
      focuses.push((event.target as HTMLElement).id),
    );
    await act(async () => form.handle.focus('/late/name'));
    await waitFor(() => expect(form.deferred('/late')).toBe(false));
    expect(form.field('/late/name')).not.toBeNull();
    expect(document.activeElement).toBe(form.field('/late/first'));
    expect(focuses).toEqual(['/late/first']);
    expect(form.sinkErrors()).toEqual([]);
    expect(form.errorRecords()).toEqual([]);
  });

  it('a native invalid submit reveals the ancestor and approximately focuses inside it', async () => {
    form = await renderForm(schemaEndingWith(['late', lateBranch]), {
      virtualization: { ...virtualization, threshold: 3 },
      validator: true,
      strictMode,
      fieldInputMap: { '': RootWithSubmit },
    });
    expect(form.deferred('/late')).toBe(true);
    expect(form.node('/late/name')?.errors.length).toBeGreaterThan(0);
    const focuses: string[] = [];
    form.container.addEventListener('focusin', (event) =>
      focuses.push((event.target as HTMLElement).id),
    );
    await form.user.click(form.field('/f0')!);
    await form.user.click(
      form.container.querySelector<HTMLButtonElement>('button[type="submit"]')!,
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(form.field('/late/first')),
    );
    expect(form.deferred('/late')).toBe(false);
    await form.flush();
    expect(focuses.filter((path) => path === '/late/first')).toEqual([
      '/late/first',
    ]);
    expect(form.sinkErrors()).toEqual([]);
    expect(form.errorRecords()).toEqual([]);
  });

  it('follows a virtual group child reference to a sibling field', async () => {
    const schema = schemaEndingWith(['startDate', { type: 'string' }]);
    schema.options = {
      virtual: { period: { fields: ['startDate'] } },
    };
    form = await renderForm(schema, { virtualization, strictMode });
    expect(form.deferred('/period')).toBe(true);
    expect(form.node('/period')?.children).toContain(form.node('/startDate'));
    expect(form.node('/startDate')?.parentNode).toBe(form.handle.node);
    await act(async () => form.handle.focus('/startDate'));
    await waitFor(() => expect(form.deferred('/period')).toBe(false));
    expect(document.activeElement).toBe(form.field('/startDate'));
  });

  it('reveals only the outer placeholder when the target is nested behind several gates', async () => {
    form = await renderForm(
      schemaEndingWith([
        'late',
        {
          type: 'object',
          properties: {
            first: { type: 'string' },
            inner: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
          },
        },
      ]),
      { virtualization, strictMode },
    );
    expect(form.deferred('/late')).toBe(true);
    expect(form.wrapper('/late/inner')).toBeNull();
    await act(async () => form.handle.focus('/late/inner/name'));
    await waitFor(() => expect(form.deferred('/late')).toBe(false));
    expect(form.deferred('/late/inner')).toBe(true);
    expect(form.field('/late/inner/name')).toBeNull();
    expect(document.activeElement).toBe(form.field('/late/first'));
    await form.flush();
    expect(form.deferred('/late/inner')).toBe(true);
  });

  it('ERROR-139 native submit keeps exact focus when the target itself is a placeholder', async () => {
    form = await renderForm(
      schemaEndingWith(['f7', { type: 'string', minLength: 3, default: 'v' }]),
      {
        virtualization,
        validator: true,
        strictMode,
        fieldInputMap: { '': RootWithSubmit },
      },
    );
    expect(form.deferred('/f7')).toBe(true);
    const focuses: string[] = [];
    form.container.addEventListener('focusin', (event) =>
      focuses.push((event.target as HTMLElement).id),
    );
    await form.user.click(
      form.container.querySelector<HTMLButtonElement>('button[type="submit"]')!,
    );
    await waitFor(() => expect(document.activeElement).toBe(form.field('/f7')));
    await form.flush();
    expect(focuses.filter((path) => path === '/f7')).toEqual(['/f7']);
    expect(form.sinkErrors()).toEqual([]);
    expect(form.errorRecords()).toEqual([]);
  });

  it('keeps direct focus on a mounted target and exact focus on a placeholder target', async () => {
    form = await renderForm(schemaEndingWith(['f7', { type: 'string' }]), {
      virtualization,
      strictMode,
    });
    expect(form.deferred('/f7')).toBe(true);
    await act(async () => form.handle.focus('/f0'));
    expect(document.activeElement).toBe(form.field('/f0'));
    expect(form.deferred('/f7')).toBe(true);
    await act(async () => form.handle.focus('/f7'));
    await waitFor(() => expect(document.activeElement).toBe(form.field('/f7')));
    expect(form.deferred('/f7')).toBe(false);
  });
});

it('does not confuse a placeholder path prefix with a child edge', async () => {
  const schema = schemaEndingWith(['late', { type: 'string' }]);
  schema.properties!.later = { type: 'string' };
  form = await renderForm(schema, { virtualization });
  expect(form.deferred('/late')).toBe(true);
  expect(form.deferred('/later')).toBe(true);
  await act(async () => form.handle.focus('/later'));
  await waitFor(() =>
    expect(document.activeElement).toBe(form.field('/later')),
  );
  expect(form.deferred('/late')).toBe(true);
});

it('skips a non-present target in a deferred ancestor child graph', async () => {
  form = await renderForm(
    schemaEndingWith([
      'late',
      {
        type: 'object',
        properties: {
          first: { type: 'string' },
          name: { type: 'string', controls: { visible: false } },
        },
      },
    ]),
    { virtualization },
  );
  expect(form.node('/late/name')?.isPresent).toBe(false);
  await act(async () => form.handle.focus('/f0'));
  await act(async () => form.handle.focus('/late/name'));
  await form.flush();
  expect(form.deferred('/late')).toBe(true);
  expect(document.activeElement).toBe(form.field('/f0'));
});

it('searches placeholders only inside the requesting form', async () => {
  const schema = schemaEndingWith(['late', lateBranch]);
  const other = await renderForm(schema, { virtualization });
  try {
    expect(other.deferred('/late')).toBe(true);
    form = await renderForm(schema);
    await act(async () => form.handle.focus('/late/name'));
    expect(document.activeElement).toBe(form.field('/late/name'));
    expect(other.deferred('/late')).toBe(true);
  } finally {
    other.unmount();
  }
});
