import { act } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { FieldInputProps } from '@/schema-form/types';
import { isArrayNode } from '@/schema-form/core';
import { type FormHarness, renderForm } from '@/schema-form/__tests__/renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

const Upload = (props: FieldInputProps) => {
  return (
    <input
      id={props.path}
      data-testid={props.path}
      type="file"
      onChange={(event) =>
        props.onFileAttach(Array.from(event.target.files ?? []))
      }
    />
  );
};

it('keeps the surviving attachment at its current path after array removal', async () => {
  form = await renderForm(
    {
      type: 'array',
      items: {
        type: 'string',
        presentation: { FieldInput: Upload },
      },
    },
    { defaultValue: ['first', 'second'] },
  );

  const file0 = new File(['zero'], 'zero.txt');
  const file1 = new File(['one'], 'one.txt');
  await form.user.upload(form.field('/0') as HTMLInputElement, file0);
  await form.user.upload(form.field('/1') as HTMLInputElement, file1);

  expect(form.attachedFilesMap().get('/0')).toEqual([file0]);
  expect(form.attachedFilesMap().get('/1')).toEqual([file1]);

  const map = form.attachedFilesMap();
  const rootNode = form.node('');
  if (!isArrayNode(rootNode)) throw new Error('Expected array');
  act(() => {
    rootNode.remove(0);
  });

  expect(form.attachedFilesMap().get('/0')).toEqual([file1]);
  expect(form.attachedFilesMap().has('/1')).toBe(false);
  expect(form.attachedFilesMap()).toBe(map);
  act(() => rootNode.insert(0));
  expect(map.get('/1')).toEqual([file1]);
  expect(map.has('/0')).toBe(false);
  await form.reset();
  expect(map.size).toBe(0);
});
