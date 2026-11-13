import { StrictMode, createRef, useLayoutEffect, useRef } from 'react';

import { render } from '@testing-library/react';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { isArrayNode } from '@/schema-form/core';
import type { FieldInputProps } from '@/schema-form/types';

import type { ChildField } from '../../type';

/** Mounts real child proxies with an uncontrolled, composition-aware input and observable branch output. */
export function createChildCacheForm(strict: boolean) {
  const ref = createRef<FormHandle>();
  const events = { mounts: 0, unmounts: 0, compositionEnds: 0 };
  let fields: readonly ChildField[] = [];
  let mode: 'all' | 'none' | 'reverse' = 'all';
  let tick = 0;
  const Leaf = ({ path, defaultValue, onChange }: FieldInputProps) => {
    const composing = useRef(false);
    useLayoutEffect(() => {
      events.mounts++;
      return () => {
        events.unmounts++;
      };
    }, []);
    return (
      <input
        data-path={path}
        defaultValue={String(defaultValue ?? '')}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(event) => {
          events.compositionEnds++;
          composing.current = false;
          onChange(event.currentTarget.value);
        }}
        onChange={(event) => {
          if (!composing.current) onChange(event.currentTarget.value);
        }}
      />
    );
  };
  const Branch = ({ ChildFields }: FieldInputProps) => {
    fields = ChildFields;
    const visible =
      mode === 'none'
        ? []
        : mode === 'reverse'
          ? [...ChildFields].reverse()
          : ChildFields;
    return (
      <>
        {visible.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const schema = {
    type: 'array',
    options: { terminal: false },
    items: { type: 'string', presentation: { FieldInput: Leaf } },
    presentation: { FieldInput: Branch },
  } as const;
  const element = () => {
    const form = (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={['a', 'b', 'c']}
        validationMode={0}
        context={{ tick }}
      />
    );
    return strict ? <StrictMode>{form}</StrictMode> : form;
  };
  const view = render(element());
  const parent = ref.current!.node!;
  if (!isArrayNode(parent)) throw new Error('Expected an array parent');
  return {
    ...view,
    parent,
    events,
    fields: () => fields,
    input: (path: string) =>
      view.container.querySelector<HTMLInputElement>(
        `input[data-path="${path}"]`,
      )!,
    presentation: (next: typeof mode) => {
      mode = next;
      tick++;
      view.rerender(element());
    },
  };
}
