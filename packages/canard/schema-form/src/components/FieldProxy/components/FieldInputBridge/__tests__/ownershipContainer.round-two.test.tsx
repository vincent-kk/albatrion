import * as React from 'react';
import {
  type ComponentType,
  StrictMode,
  Suspense,
  createRef,
  lazy,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { HiddenFormGate } from '@/schema-form/__tests__/helpers/HiddenFormGate';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import type { FieldInputProps, InputRendererProps } from '@/schema-form/types';

afterEach(cleanup);

it('round-2 schema-form 3 sibling: container swap keeps the previous ownership record', () => {
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

/** Item input that exposes its path, so a test can follow one child's DOM element. */
const Leaf = ({ path, defaultValue }: FieldInputProps) => (
  <input data-path={path} defaultValue={String(defaultValue ?? '')} />
);

/** Array whose items render through `Leaf` under the bound `/list` input. */
const listSchema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: { type: 'string', presentation: { FieldInput: Leaf } },
    },
  },
} as const;

/** Draws every child field of the bound array in order. */
const Children = ({ ChildFields }: Pick<FieldInputProps, 'ChildFields'>) => (
  <>
    {ChildFields.map((Child) => (
      <Child key={Child.key} />
    ))}
  </>
);

/**
 * Bind `/list` to `Input` inside a frame that swaps its own inner element through its own state.
 * @param Input - Raw input bound to `/list`; the swap remounts it without remounting the bridge.
 * @param list - Initial array value.
 * @returns The view, a checked form handle, the swap action and a lookup of one item's input.
 */
const renderSwappableList = (
  Input: ComponentType<FieldInputProps>,
  list: string[],
) => {
  const ref = createRef<FormHandle>();
  let swapFrame: () => void = () => {
    throw new Error('Expected list frame');
  };
  const Frame = ({ children, path }: InputRendererProps) => {
    const [alternate, setAlternate] = useState(false);
    if (path === '/list') swapFrame = () => setAlternate(true);
    return alternate ? <section>{children}</section> : <div>{children}</div>;
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={listSchema}
      defaultValue={{ list }}
      validationMode={ValidationMode.None}
      fieldInputMap={{ '/list': Input }}
      InputRenderer={Frame}
    >
      <Form.Input path="/list" />
    </Form>,
  );
  return {
    view,
    handle: () => {
      if (!ref.current) throw new Error('Expected form handle');
      return ref.current;
    },
    swap: () => act(() => swapFrame()),
    item: (index: number) => {
      const input = view.container.querySelector<HTMLInputElement>(
        `input[data-path="/list/${index}"]`,
      );
      if (!input) throw new Error(`Expected the /list/${index} input`);
      return input;
    },
  };
};

// Attached children hold the input's Refresh generation by themselves; the record decides only
// while none is attached, so each case hides the children before the external write.
it.each([
  'the swap commit',
  'a passive effect',
  'a lazy Suspense retry',
] as const)(
  'keeps child DOM across an external write while hidden, when the swapped input attaches its children in %s',
  async (timing) => {
    let birth = true;
    let hide: (hidden: boolean) => void = () => {
      throw new Error('Expected the list input');
    };
    const LateChildren = lazy(async () => ({ default: Children }));
    const Branch = ({ ChildFields }: FieldInputProps) => {
      const [isBirth] = useState(birth);
      const [shown, show] = useState(isBirth || timing !== 'a passive effect');
      const [hidden, setHidden] = useState(false);
      hide = setHidden;
      useEffect(() => show(true), []);
      const Drawn =
        timing === 'a lazy Suspense retry' && !isBirth
          ? LateChildren
          : Children;
      return (
        <Suspense fallback={<span>hidden</span>}>
          {shown && <Drawn ChildFields={ChildFields} />}
          <HiddenFormGate hidden={hidden} />
        </Suspense>
      );
    };
    const form = renderSwappableList(Branch, ['kept', 'old']);
    birth = false;
    form.swap();
    await act(async () => {});
    const kept = form.item(0);
    act(() => hide(true));

    act(() => form.handle().setValue({ list: ['kept', 'new'] }));
    act(() => hide(false));

    expect(form.item(0)).toBe(kept);
    expect(form.item(1).value).toBe('new');
  },
);

it('lets a whole editor that replaced child drawing show an external write and drop its stale edit', () => {
  let birth = true;
  let latest: FieldInputProps['onChange'] | undefined;
  const Editor = ({ defaultValue, onChange, ChildFields }: FieldInputProps) => {
    const [drawChildren] = useState(birth);
    latest = onChange;
    return drawChildren ? (
      <Children ChildFields={ChildFields} />
    ) : (
      <input
        aria-label="whole list"
        defaultValue={JSON.stringify(defaultValue)}
        onChange={(event) => onChange(JSON.parse(event.target.value))}
      />
    );
  };
  const form = renderSwappableList(Editor, ['before']);
  const editor = () => {
    const input = form.view.getByLabelText('whole list');
    if (!(input instanceof HTMLInputElement))
      throw new Error('Expected the whole-list editor');
    return input;
  };
  birth = false;
  form.swap();
  expect(editor().value).toBe('["before"]');
  const stale = latest;
  if (!stale) throw new Error('Expected the swapped editor');

  act(() => form.handle().setValue({ list: ['after'] }));
  act(() => stale(['stale edit']));

  expect(editor().value).toBe('["after"]');
  expect(form.handle().getValue()).toEqual({ list: ['after'] });
});

it('mounts the swapped input once for the swap and once for the next external write', () => {
  let birth = true;
  let mounts = 0;
  const Whole = ({ defaultValue, ChildFields }: FieldInputProps) => {
    const [drawChildren] = useState(birth);
    useLayoutEffect(() => {
      mounts++;
    }, []);
    return drawChildren ? (
      <Children ChildFields={ChildFields} />
    ) : (
      <output>{JSON.stringify(defaultValue)}</output>
    );
  };
  const form = renderSwappableList(Whole, ['before']);
  birth = false;
  form.swap();
  const afterSwap = mounts;

  act(() => form.handle().setValue({ list: ['after'] }));

  expect([afterSwap, mounts]).toEqual([2, 3]);
});

it.skipIf(!React.Activity).each([false, true])(
  'keeps a sticky record without attached children across Activity hide and show, StrictMode=%s',
  (strict) => {
    const ref = createRef<FormHandle>();
    let toggle: () => void = () => {
      throw new Error('Expected the list input');
    };
    const Parent = ({ defaultValue, ChildFields }: FieldInputProps) => {
      const [owned] = useState(() => JSON.stringify(defaultValue));
      const [visible, setVisible] = useState(false);
      toggle = () => setVisible((value) => !value);
      return (
        <section>
          <output>{owned}</output>
          {visible && <Children ChildFields={ChildFields} />}
        </section>
      );
    };
    const tree = (mode: 'hidden' | 'visible') => {
      const form = (
        <Form
          ref={ref}
          jsonSchema={listSchema}
          defaultValue={{ list: ['old'] }}
          validationMode={ValidationMode.None}
          fieldInputMap={{ '/list': Parent }}
        >
          <React.Activity mode={mode}>
            <Form.Input path="/list" />
          </React.Activity>
        </Form>
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(tree('visible'));
    act(() => toggle());
    act(() => toggle());
    const section = view.container.querySelector('section');
    act(() => view.rerender(tree('hidden')));
    act(() => view.rerender(tree('visible')));

    act(() => {
      if (!ref.current) throw new Error('Expected form handle');
      ref.current.setValue({ list: ['external'] });
    });

    expect(view.container.querySelector('section')).toBe(section);
    expect(view.container.querySelector('output')?.textContent).toBe('["old"]');
  },
);
