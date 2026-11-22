import { createRef, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import type { FieldInputProps, InputRendererProps } from '@/schema-form/types';

afterEach(cleanup);

it.fails('round-2 schema-form 3 sibling: container swap keeps the previous ownership record', () => {
  const schema = {
    type: 'object',
    properties: { list: { type: 'array', items: { type: 'string' } } },
  } as const;

  const run = (replacement: 'container' | 'component') => {
    let drawChildrenAtBirth = true;
    let replaceContainer: () => void = () => {
      throw new Error('Expected list frame');
    };
    const Whole = ({ defaultValue, ChildFields }: FieldInputProps) => {
      const [drawChildren] = useState(drawChildrenAtBirth);
      const [text] = useState(() => JSON.stringify(defaultValue));
      return drawChildren ? (
        <>{ChildFields.map((Child) => <Child key={Child.key} />)}</>
      ) : (
        <output>{text}</output>
      );
    };
    const Frame = ({ children, path }: InputRendererProps) => {
      const [alternate, setAlternate] = useState(false);
      if (path === '/list') replaceContainer = () => setAlternate(true);
      return alternate ? <section>{children}</section> : <div>{children}</div>;
    };
    const Replacement = ({ children }: InputRendererProps) => (
      <section>{children}</section>
    );
    const ref = createRef<FormHandle>();
    const inputMap = { '/list': Whole };
    const form = (InputRenderer: typeof Frame) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ list: ['before'] }}
        validationMode={ValidationMode.None}
        fieldInputMap={inputMap}
        InputRenderer={InputRenderer}
      >
        <Form.Input path="/list" />
      </Form>
    );
    const view = render(form(Frame));
    drawChildrenAtBirth = false;
    if (replacement === 'container') act(replaceContainer);
    else view.rerender(form(Replacement));
    expect(view.container.querySelector('output')).not.toBeNull();
    act(() => {
      if (!ref.current) throw new Error('Expected form handle');
      ref.current.setValue({ list: ['after'] });
    });
    const result = view.container.querySelector('output')?.textContent;
    view.unmount();
    return result;
  };

  expect(run('container')).toBe(run('component'));
});
