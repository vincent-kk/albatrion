import { act, cleanup, render } from '@testing-library/react';
import { createRef, useEffect } from 'react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);

/** LC1: an input whose asynchronous work finishes after its owner moved on. */
const pending: Array<() => void> = [];

const AsyncUpload = ({ onChange, onFileAttach }: FieldInputProps<string>) => {
  useEffect(() => {
    // Simulate a read/compress step started at mount that resolves later.
    pending.push(() => {
      onFileAttach(new File(['x'], 'late.png'));
      onChange('late.png');
    });
  }, [onChange, onFileAttach]);
  return <input type="file" />;
};

const schema = {
  type: 'object',
  properties: {
    show: { type: 'boolean', default: true },
    photo: {
      type: 'string',
      presentation: { FieldInput: AsyncUpload },
      controls: { active: '../show === true' },
    },
  },
} as const;

const flush = () => {
  for (const run of pending.splice(0)) run();
};

it('a callback from an input instance retired by reset writes neither value nor file', () => {
  pending.length = 0;
  const ref = createRef<FormHandle<typeof schema>>();
  render(<Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None} />);
  const stale = pending.splice(0);
  act(() => {
    ref.current!.reset();
  });
  act(() => {
    for (const run of stale) run();
  });
  expect({
    value: ref.current!.getValue(),
    files: [...ref.current!.getAttachedFilesMap().keys()],
  }).toEqual({ value: { show: true }, files: [] });
});

it('a callback from an input unmounted by an inactive gate writes neither value nor file', () => {
  pending.length = 0;
  const ref = createRef<FormHandle<typeof schema>>();
  render(<Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None} />);
  act(() => {
    ref.current!.findNode('/show')!.setValue(false);
  });
  act(() => {
    ref.current!.findNode('/show')!.setValue(true);
  });
  const stale = pending.splice(0, 1);
  act(() => {
    for (const run of stale) run();
  });
  expect({
    value: ref.current!.getValue(),
    files: [...ref.current!.getAttachedFilesMap().keys()],
  }).toEqual({ value: { show: true }, files: [] });
  act(flush);
  expect(ref.current!.getValue()).toEqual({ show: true, photo: 'late.png' });
});

it('a callback from an input whose Form unmounted writes nothing and calls no onChange', () => {
  pending.length = 0;
  const ref = createRef<FormHandle<typeof schema>>();
  const changes: unknown[] = [];
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={ValidationMode.None}
      onChange={(value) => changes.push(value)}
    />,
  );
  const handle = ref.current!;
  changes.length = 0;
  view.unmount();
  act(flush);
  expect({ value: handle.getValue(), changes }).toEqual({
    value: { show: true },
    changes: [],
  });
});
