import { createRef, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { FormTypeInputProps } from '@/schema-form/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('EVENT-065 REACT-024 defers Refresh until compositionend and rejects the old draft', () => {
  let mounts = 0;
  let unmounts = 0;
  let compositionEnds = 0;
  let oldChange: FormTypeInputProps['onChange'];
  const Input = ({ value, onChange }: FormTypeInputProps) => {
    const [draft, setDraft] = useState(String(value ?? ''));
    const composing = useRef(false);
    useEffect(() => {
      mounts++;
      return () => {
        unmounts++;
      };
    }, []);
    useLayoutEffect(() => {
      if (!composing.current) setDraft(String(value ?? ''));
    }, [value]);
    oldChange ??= onChange;
    return (
      <input
        value={draft}
        onInput={(event) => setDraft(event.currentTarget.value)}
        onChange={(event) => {
          if (!composing.current) onChange(event.currentTarget.value);
        }}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(event) => {
          compositionEnds++;
          composing.current = false;
          setDraft(event.currentTarget.value);
          onChange(event.currentTarget.value);
        }}
      />
    );
  };
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', presentation: { FormTypeInput: Input } }}
      defaultValue=""
    />,
  );
  const input = view.container.querySelector('input')!;
  const node = ref.current!.node!;
  expect(node.value).toBe('');
  const setValue = vi.spyOn(input, 'value', 'set');
  fireEvent.compositionStart(input);
  for (const text of ['ㄱ', '가']) {
    fireEvent.input(input, { target: { value: text } });
    expect(input.value).toBe(text);
  }
  act(() => {
    ref.current!.refresh();
    ref.current!.refresh();
  });
  expect(view.container.querySelector('input')).toBe(input);
  expect(mounts).toBe(1);
  expect(unmounts).toBe(0);
  expect(input.value).toBe('가');
  fireEvent.input(input, { target: { value: '각' } });
  expect(input.value).toBe('각');
  expect(setValue).not.toHaveBeenCalled();
  expect(node.value).toBe('');

  fireEvent.compositionEnd(input, { data: '각' });
  const replacement = view.container.querySelector('input')!;
  expect(replacement).not.toBe(input);
  expect(mounts).toBe(2);
  expect(unmounts).toBe(1);
  expect(compositionEnds).toBe(1);
  expect(replacement.value).toBe('');
  expect(node.value).toBe('');
  act(() => oldChange!('late draft'));
  expect(node.value).toBe('');
});

it('EVENT-065 publishes completed text without remounting when no Refresh intervenes', () => {
  const ref = createRef<FormHandle>();
  const Input = ({ onChange }: FormTypeInputProps) => (
    <input onCompositionEnd={(event) => onChange(event.currentTarget.value)} />
  );
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', presentation: { FormTypeInput: Input } }}
      defaultValue=""
    />,
  );
  const input = view.container.querySelector('input')!;
  fireEvent.compositionStart(input);
  fireEvent.input(input, { target: { value: '각' } });
  fireEvent.compositionEnd(input, { data: '각' });
  expect(view.container.querySelector('input')).toBe(input);
  expect(ref.current!.getValue()).toBe('각');
});
