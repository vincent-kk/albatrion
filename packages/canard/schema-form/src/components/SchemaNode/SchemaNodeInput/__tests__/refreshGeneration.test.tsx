import { useState } from 'react';

import { act, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { registerPlugin, type FormTypeInputProps } from '@/schema-form';
import { SchemaNodeEventType } from '@/schema-form/core';

import { INPUT_SUPPLIES, renderInputSupply } from './helpers/renderInputSupply';

afterEach(() => {
  cleanup();
  registerPlugin(null);
  vi.restoreAllMocks();
});

it.each(INPUT_SUPPLIES)('EVENT-039 Refresh remounts only the uncontrolled input and discards its caret (%s)', (supply) => {
  let mounts = 0;
  let props: FormTypeInputProps;
  const Field = (input: FormTypeInputProps) => {
    props = input;
    const [mount] = useState(() => ++mounts);
    return <input id={input.path} data-mount={mount} defaultValue={input.defaultValue} />;
  };
  const view = renderInputSupply(Field, supply);
  const peer = view.container.querySelector('[id="/peer"]');
  const initial = view.container.querySelector('[id="/field"]') as HTMLInputElement;
  initial.focus();
  initial.value = 'uncommitted';
  initial.setSelectionRange(2, 5);
  act(() => view.ref.current!.findNode('/field')!.setValue('committed'));
  const committed = view.container.querySelector('[id="/field"]') as HTMLInputElement;
  expect(committed).not.toBe(initial);
  expect(committed.value).toBe('committed');
  committed.focus();
  committed.value = 'another draft';
  committed.setSelectionRange(1, 4);
  act(() => view.ref.current!.refresh('/field'));
  const refreshed = view.container.querySelector('[id="/field"]') as HTMLInputElement;
  expect(refreshed).not.toBe(committed);
  expect(refreshed.value).toBe('committed');
  expect(refreshed.selectionStart).toBe(refreshed.selectionEnd);
  expect(document.activeElement).not.toBe(refreshed);
  expect(mounts).toBe(3);
  expect(view.container.querySelector('[id="/peer"]')).toBe(peer);
  expect(view.ref.current!.findNode('/field')!.value).toBe('committed');
  expect(props!).not.toHaveProperty('inputGeneration');
});

it.each(INPUT_SUPPLIES)('EVENT-065 Refresh keys the applied generation after composition ends (%s)', (supply) => {
  let mounts = 0;
  const Field = ({ path, defaultValue }: FormTypeInputProps) => {
    useState(() => ++mounts);
    return <input id={path} defaultValue={defaultValue} />;
  };
  const view = renderInputSupply(Field, supply);
  const initial = view.container.querySelector('[id="/field"]') as HTMLInputElement;
  const node = view.ref.current!.findNode('/field')!;
  const revision = node.revision(SchemaNodeEventType.RequestRefresh);
  fireEvent.compositionStart(initial);
  initial.value = 'composing';
  act(() => {
    node.setValue('committed');
    view.ref.current!.refresh('/field');
  });
  expect(node.revision(SchemaNodeEventType.RequestRefresh)).toBeGreaterThan(revision);
  expect(view.container.querySelector('[id="/field"]')).toBe(initial);
  expect(initial.value).toBe('composing');
  expect(mounts).toBe(1);
  fireEvent.compositionEnd(initial);
  const replacement = view.container.querySelector('[id="/field"]') as HTMLInputElement;
  expect(replacement).not.toBe(initial);
  expect(replacement.value).toBe('committed');
  expect(mounts).toBe(2);
});

it.each(INPUT_SUPPLIES)('REACT-028 container holds its input generation through Refresh and value delivery (%s)', (supply) => {
  let mounts = 0;
  const Container = ({ path, ChildNodeComponents }: FormTypeInputProps) => {
    const [mount] = useState(() => ++mounts);
    return <section data-container={path} data-mount={mount}>{ChildNodeComponents.map((Child) => <Child key={Child.key} />)}</section>;
  };
  const view = renderInputSupply(Container, supply, { type: 'object', options: { terminal: false }, properties: { child: { type: 'string' } } }, { child: 'initial' });
  const container = view.container.querySelector('[data-container="/field"]');
  const child = view.container.querySelector('[id="/field/child"]');
  expect(child, view.container.innerHTML).not.toBeNull();
  act(() => view.ref.current!.refresh('/field'));
  expect(view.container.querySelector('[data-container="/field"]')).toBe(container);
  act(() => view.ref.current!.findNode('/field')!.setValue({ child: 'committed' }));
  expect(view.container.querySelector('[data-container="/field"]')).toBe(container);
  expect(mounts).toBe(1);
  expect((view.container.querySelector('[id="/field/child"]') as HTMLInputElement).value).toBe('committed');
  expect(view.ref.current!.findNode('/field')!.value).toEqual({ child: 'committed' });
});
