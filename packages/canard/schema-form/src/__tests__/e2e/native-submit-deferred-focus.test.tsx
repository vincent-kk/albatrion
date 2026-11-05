import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type JSONSchema,
  VirtualizationBackfill,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

// Native-submit focus on virtualized fields (ERROR-139); intersection and idle backfill never reveal here.

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

const virtualization = {
  threshold: 2,
  eagerCount: 1,
  backfill: VirtualizationBackfill.None,
};

/**
 * Seven filled text fields `/f0`–`/f6` followed by one more property.
 * @param last - Name and schema of the eighth property.
 * @returns An object schema whose eighth property is deferred by {@link virtualization}.
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

it('ERROR-139 a native submit whose first invalid field is a placeholder reveals it and focuses its input', async () => {
  form = await renderForm(
    schemaEndingWith(['f7', { type: 'string', minLength: 3, default: 'v' }]),
    { virtualization, validator: true, fieldInputMap: { '': RootWithSubmit } },
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

it('focus(path) to a field inside an unrevealed placeholder reports nothing to the host', async () => {
  form = await renderForm(
    schemaEndingWith([
      'late',
      { type: 'object', properties: { name: { type: 'string' } } },
    ]),
    { virtualization },
  );
  expect(form.deferred('/late')).toBe(true);
  await act(async () => form.handle.focus('/late/name'));
  await form.flush();
  expect(form.sinkErrors()).toEqual([]);
});

// Known limit, fixed in the follow-up pull request "deferred-ancestor focus": Focus reaches only
// the target's own subscribers, and a placeholder mounts no child before it is revealed.
it.fails(
  'focus(path) to a field inside an unrevealed placeholder focuses its input',
  async () => {
    form = await renderForm(
      schemaEndingWith([
        'late',
        { type: 'object', properties: { name: { type: 'string' } } },
      ]),
      { virtualization },
    );
    await act(async () => form.handle.focus('/late/name'));
    await waitFor(() =>
      expect(document.activeElement).toBe(form.field('/late/name')),
    );
  },
);
