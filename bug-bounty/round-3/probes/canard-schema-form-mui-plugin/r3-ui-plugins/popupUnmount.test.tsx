import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['a', 'b'] },
    color: {
      type: 'string',
      enum: ['red', 'green'],
      controls: { visible: '../kind === "a"' },
    },
  },
} as const;

const leftovers = () => ({
  menus: document.querySelectorAll('[role="listbox"]').length,
  overflow: document.body.style.overflow,
  hiddenSiblings: Array.from(document.body.children).filter(
    (child) => child.getAttribute('aria-hidden') === 'true',
  ).length,
});

describe('select popup after its field goes away (mui)', () => {
  it('unmounting the form with an open select leaves no menu, scroll lock or aria-hidden', () => {
    const view = render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={schema}
        defaultValue={{ kind: 'a' }}
      />,
    );
    const comboboxes = document.querySelectorAll('[role="combobox"]');
    fireEvent.mouseDown(comboboxes[comboboxes.length - 1]);
    expect(leftovers().menus).toBe(1);
    view.unmount();
    expect(leftovers()).toEqual({ menus: 0, overflow: '', hiddenSiblings: 0 });
  });

  it('a field that becomes inactive with its select open leaves no menu, scroll lock or aria-hidden', () => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={schema}
        defaultValue={{ kind: 'a' }}
      />,
    );
    const comboboxes = document.querySelectorAll('[role="combobox"]');
    expect(comboboxes).toHaveLength(2);
    fireEvent.mouseDown(comboboxes[1]);
    expect(leftovers().menus).toBe(1);
    act(() => {
      ref.current!.setValue({ kind: 'b' });
    });
    expect(document.querySelectorAll('[role="combobox"]')).toHaveLength(1);
    expect(leftovers()).toEqual({ menus: 0, overflow: '', hiddenSiblings: 0 });
  });
});
