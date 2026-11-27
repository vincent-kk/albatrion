import { StrictMode, createRef, useLayoutEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);
const schema = { type: 'string' } as const;
const Visible = ({ Input }: FieldRendererProps) => <Input />;
const Hidden = () => null;

// Independent PR C recheck: deleted raw inputs must not write from layout cleanup.
it.each([false, true])(
  'rejects value and file writes from the replaced input layout cleanup (strict=%s)',
  (strict) => {
    let armed = false;
    let current!: FieldInputProps;
    const A = ({ onChange, onFileAttach }: FieldInputProps) => {
      useLayoutEffect(
        () => () => {
          if (armed) {
            onChange('cleanup');
            onFileAttach(new File(['old'], 'old'));
          }
        },
        [onChange, onFileAttach],
      );
      return <input aria-label="a" />;
    };
    const B = (props: FieldInputProps) => {
      current = props;
      return <input aria-label="b" />;
    };
    const ref = createRef<FormHandle>();
    const element = (Component: typeof A | typeof B) => {
      const form = (
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="kept"
          fieldInputMap={{ '#': Component }}
          validationMode={ValidationMode.None}
        />
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(element(A));
    const root = ref.current!.node;
    expect(ref.current!.getValue()).toBe('kept');
    armed = true;
    view.rerender(element(B));
    expect.soft(ref.current!.getValue()).toBe('kept');
    expect.soft(ref.current!.getAttachedFilesMap().size).toBe(0);
    expect(ref.current!.node).toBe(root);
    act(() => current.onChange('current'));
    expect(ref.current!.getValue()).toBe('current');
  },
);

it.each([false, true])(
  'rejects layout cleanup writes when the input unmounts with its node retained (strict=%s)',
  (strict) => {
    let armed = false;
    const Input = ({ onChange, onFileAttach }: FieldInputProps) => {
      useLayoutEffect(
        () => () => {
          if (armed) {
            onChange('cleanup');
            onFileAttach(new File(['old'], 'old'));
          }
        },
        [onChange, onFileAttach],
      );
      return <input />;
    };
    const ref = createRef<FormHandle>();
    const map = { '#': Input };
    const element = (FieldRenderer: typeof Visible | typeof Hidden) => {
      const form = (
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="kept"
          fieldInputMap={map}
          FieldRenderer={FieldRenderer}
          validationMode={ValidationMode.None}
        />
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(element(Visible));
    const root = ref.current!.node;
    armed = true;
    view.rerender(element(Hidden));
    expect.soft(ref.current!.getValue()).toBe('kept');
    expect.soft(ref.current!.getAttachedFilesMap().size).toBe(0);
    expect(ref.current!.node).toBe(root);
  },
);
