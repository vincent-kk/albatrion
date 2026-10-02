import { act } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import type { FormTypeInputProps } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
let input: FormTypeInputProps;
afterEach(() => form?.unmount());

/** Files cross the public consumer callback rather than a synthetic node mock. */
const Upload = (props: FormTypeInputProps) => {
  input = props;
  return <input id={props.path} type="file" multiple onChange={(event) => props.onFileAttach(Array.from(event.target.files ?? []))} />;
};

it('TEST-023 single file attachment is visible through the form handle', async () => {
  form = await renderForm({ type: 'string', presentation: { FormTypeInput: Upload } });
  const file = new File(['one'], 'one.txt', { type: 'text/plain' });
  await form.user.upload(form.field('') as HTMLInputElement, file);
  expect(form.attachedFilesMap().get('')).toEqual([file]);
});

it('TEST-023 multiple attachments retain their File identities', async () => {
  form = await renderForm({ type: 'string', presentation: { FormTypeInput: Upload } });
  const files = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')];
  await form.user.upload(form.field('') as HTMLInputElement, files);
  expect(form.attachedFilesMap().get('')).toEqual(files);
  expect(form.attachedFilesMap().get('')?.[0]).toBe(files[0]);
});

it('LANDING-148 branch exit removes attachments and find returns null', async () => {
  form = await renderForm({ type: 'object', properties: { enabled: { type: 'boolean' } }, oneOf: [
    { controls: { active: './enabled' }, properties: { file: { type: 'string', presentation: { FormTypeInput: Upload } } } },
    { controls: { active: '!./enabled' }, properties: { other: { type: 'string' } } },
  ] }, { defaultValue: { enabled: true } });
  const late = input.onFileAttach;
  await act(async () => input.onFileAttach(new File(['a'], 'a.txt')));
  expect(form.attachedFilesMap().has('/file')).toBe(true);
  await form.toggle('/enabled');
  expect(form.node('/file')).toBeNull();
  expect(form.attachedFilesMap().has('/file')).toBe(false);
  await act(async () => late(new File(['late'], 'late.txt')));
  expect(form.attachedFilesMap().has('/file')).toBe(false);
});

it('TEST-020 reset clears the same attachment map and rejects late attachments', async () => {
  form = await renderForm({ type: 'string', presentation: { FormTypeInput: Upload } });
  const map = form.attachedFilesMap();
  const late = input.onFileAttach;
  await act(async () => input.onFileAttach(new File(['a'], 'a.txt')));
  await form.reset();
  expect(form.attachedFilesMap()).toBe(map);
  expect(map.size).toBe(0);
  await act(async () => late(new File(['late'], 'late.txt')));
  expect(map.size).toBe(0);
});

it('LANDING-042 external replacement rejects attachments from the replaced input', async () => {
  form = await renderForm({ type: 'string', presentation: { FormTypeInput: Upload } }, { defaultValue: 'old' });
  const late = input.onFileAttach;
  await form.setValue('new');
  await act(async () => late(new File(['late'], 'late.txt')));
  expect(form.attachedFilesMap().size).toBe(0);
});
