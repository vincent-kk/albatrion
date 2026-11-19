import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  isArrayNode,
} from '@canard/schema-form';

import { plugin } from '../../index';

// Probe for r5-ids: IN3, EQ11 and RG3 on label and ARIA references after array item moves.
// Verification level: public API (@canard/schema-form dist, plugin source).

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const PLUGIN_NAME = 'antd5';

const schema: JSONSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: ['a', 'b'],
            presentation: { inputType: 'radio' },
          },
          note: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string', enum: ['x', 'y'] },
            presentation: { inputType: 'checkbox' },
          },
        },
      },
    },
  },
};

/** Problems with ids and id references inside container. */
const referenceProblems = (container: HTMLElement) => {
  const problems: string[] = [];
  const ids = Array.from(container.querySelectorAll('[id]'), (e) => e.id);
  for (const [index, id] of ids.entries())
    if (ids.indexOf(id) !== index) problems.push('duplicate ' + id);
  const fieldOf = (element: Element | null) =>
    element?.closest('[data-path]')?.getAttribute('data-path');
  for (const label of Array.from(container.querySelectorAll('label[for]'))) {
    const target = document.getElementById(label.getAttribute('for')!);
    if (!target) continue;
    if (fieldOf(target) !== fieldOf(label))
      problems.push(
        `label in ${fieldOf(label)} targets control in ${fieldOf(target)}`,
      );
  }
  for (const attribute of ['aria-labelledby', 'aria-describedby']) {
    for (const element of Array.from(
      container.querySelectorAll(`[${attribute}]`),
    )) {
      for (const token of element.getAttribute(attribute)!.split(/\s+/)) {
        const target = document.getElementById(token);
        if (!target) continue;
        const from = fieldOf(element);
        const to = fieldOf(target);
        if (from !== to && !(from ?? '').startsWith((to ?? '') + '/'))
          problems.push(`${attribute} in ${from} resolves into ${to}`);
      }
    }
  }
  return problems;
};

const checkedKinds = (container: HTMLElement, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const row = container.querySelector(`[data-path="/items/${index}/kind"]`);
    const radios = Array.from(
      row?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [],
    );
    const position = radios.findIndex((radio) => radio.checked);
    return position === -1 ? null : ['a', 'b'][position];
  });

const mount = () => {
  const handle = createRef<FormHandle>();
  const view = render(
    <Form
      ref={handle}
      jsonSchema={schema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
      ErrorMessageRenderer={plugin.ErrorMessageRenderer}
      validationMode={ValidationMode.None}
      defaultValue={{
        items: [
          { kind: 'a', tags: ['x'] },
          { kind: 'b', tags: ['y'] },
        ],
      }}
    />,
  );
  const list = handle.current!.findNode('/items');
  if (!isArrayNode(list)) throw new Error('expected array');
  return { view, handle, list };
};

describe(`${PLUGIN_NAME}: references stay inside their row after array moves`, () => {
  it('control: mount', () => {
    const { view } = mount();
    expect(referenceProblems(view.container)).toEqual([]);
    expect(checkedKinds(view.container, 2)).toEqual(['a', 'b']);
  });

  it('insert(0) keeps references inside each row', async () => {
    const { view, list } = mount();
    await act(async () => {
      list.insert(0, { kind: 'b', tags: [] });
    });
    expect(referenceProblems(view.container)).toEqual([]);
    expect(checkedKinds(view.container, 3)).toEqual(['b', 'a', 'b']);
  });

  it('remove(0) keeps references inside each row', async () => {
    const { view, list } = mount();
    await act(async () => {
      list.remove(0);
    });
    expect(referenceProblems(view.container)).toEqual([]);
    expect(checkedKinds(view.container, 1)).toEqual(['b']);
  });

  it('insert(1) then remove(0) keeps references inside each row', async () => {
    const { view, list } = mount();
    await act(async () => {
      list.insert(1, { kind: 'a', tags: [] });
    });
    await act(async () => {
      list.remove(0);
    });
    expect(referenceProblems(view.container)).toEqual([]);
    expect(checkedKinds(view.container, 2)).toEqual(['a', 'b']);
  });
});
