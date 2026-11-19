// Port of round 2 `externalWrites.test.tsx` and `derivedAndBranches.test.tsx` (round 2 antd5 item 1,
// high; cause in the core's same-length array refresh). Only element lookup changed: the round 2
// probes found inputs by `getElementById('/<name>')`, which the round 4 identifier design replaced
// with opaque ids. Inputs are found through the core's `data-path` wrapper instead.
import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { fieldInputDefinitions } from '../../fieldInputs';

afterEach(cleanup);

const field = (container: HTMLElement, path: string) =>
  container.querySelector<HTMLElement>(`[data-path="${path}"]`)!;
const fieldInput = (container: HTMLElement, path: string) =>
  field(container, path).querySelector<HTMLInputElement>(
    'input:not(.ant-select-selection-search-input)',
  )!;

const schema = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    num: { type: 'number' },
    radio: {
      type: 'string',
      enum: ['a', 'b'],
      presentation: { inputType: 'radio' },
    },
    checks: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    pick: { type: 'string', enum: ['alpha', 'beta'] },
    slide: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      presentation: { inputType: 'slider' },
    },
    date: { type: 'string', format: 'date' },
    link: { type: 'string', format: 'uri' },
  },
} as const;

const initial = {
  text: 'one',
  num: 1,
  radio: 'a',
  checks: ['a'],
  pick: 'alpha',
  slide: 10,
  date: '2024-01-10',
  link: 'https://one.example',
};

const next = {
  text: 'two',
  num: 2,
  radio: 'b',
  checks: ['b'],
  pick: 'beta',
  slide: 20,
  date: '2024-02-20',
  link: 'ftp://two.example',
};

const readDisplay = (container: HTMLElement) => {
  const radios = container.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  );
  const boxes = container.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  return {
    text: fieldInput(container, '/text').value,
    num: fieldInput(container, '/num').value,
    radio: radios[0].checked ? 'a' : radios[1].checked ? 'b' : undefined,
    checks: [
      boxes[0].checked ? 'a' : null,
      boxes[1].checked ? 'b' : null,
    ].filter(Boolean),
    pick: field(container, '/pick').querySelector('.ant-select-selection-item')
      ?.textContent,
    slide: container
      .querySelector('[role="slider"]')
      ?.getAttribute('aria-valuenow'),
    date: fieldInput(container, '/date').value,
    link: fieldInput(container, '/link').value,
  };
};

const expected = (value: typeof initial) => ({
  text: value.text,
  num: '' + value.num,
  radio: value.radio,
  checks: value.checks,
  pick: value.pick,
  slide: '' + value.slide,
  date: value.date,
  link: value.link.replace(/^\w+:\/\//, ''),
});

it('every input shows a value written through FormHandle.setValue', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={schema}
      defaultValue={initial}
    />,
  );
  expect(readDisplay(container)).toEqual(expected(initial));
  await act(async () => ref.current!.setValue(next));
  expect(ref.current!.getValue()).toEqual(next);
  expect(readDisplay(container)).toEqual(expected(next));
});

it('every input shows the default again after FormHandle.reset', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={schema}
      defaultValue={initial}
    />,
  );
  await act(async () => ref.current!.setValue(next));
  await act(async () => ref.current!.reset());
  expect(ref.current!.getValue()).toEqual(initial);
  expect(readDisplay(container)).toEqual(expected(initial));
});

it('typed text is replaced after reset', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={schema}
      defaultValue={initial}
    />,
  );
  fireEvent.change(fieldInput(container, '/text'), { target: { value: 'oneX' } });
  fireEvent.change(fieldInput(container, '/num'), { target: { value: '15' } });
  fireEvent.change(fieldInput(container, '/link'), {
    target: { value: 'one.exampleZ' },
  });
  fireEvent.click(
    container.querySelectorAll<HTMLInputElement>('input[type="radio"]')[1],
  );
  expect(ref.current!.getValue()).toMatchObject({
    text: 'oneX',
    num: 15,
    radio: 'b',
    link: 'https://one.exampleZ',
  });
  await act(async () => ref.current!.reset());
  expect(readDisplay(container)).toEqual(expected(initial));
});

it('a uri written from outside with another listed protocol shows that protocol', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={schema}
      defaultValue={initial}
    />,
  );
  await act(async () => ref.current!.setValue(next));
  const selected = field(container, '/link').querySelector(
    '.ant-select-selection-item',
  )?.textContent;
  expect(selected).toBe('ftp://');
  fireEvent.change(fieldInput(container, '/link'), {
    target: { value: 'two.exampleZ' },
  });
  expect(ref.current!.getValue()).toMatchObject({ link: 'ftp://two.exampleZ' });
});

it('derived scalar values reach uncontrolled text, number and radio inputs', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: {
          source: { type: 'string' },
          copy: { type: 'string', controls: { derived: '../source' } },
          size: {
            type: 'number',
            controls: { derived: '(../source ?? "").length' },
          },
          pick: {
            type: 'string',
            enum: ['a', 'ab'],
            presentation: { inputType: 'radio' },
            controls: { derived: '../source' },
          },
        },
      }}
      defaultValue={{ source: 'a' }}
    />,
  );
  fireEvent.change(fieldInput(container, '/source'), { target: { value: 'ab' } });
  await act(async () => {});
  expect(ref.current!.getValue()).toEqual({
    source: 'ab',
    copy: 'ab',
    size: 2,
    pick: 'ab',
  });
  expect(fieldInput(container, '/copy').value).toBe('ab');
  expect(fieldInput(container, '/size').value).toBe('2');
  const radios = container.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  );
  expect(radios[1].checked).toBe(true);
});

it('derived array of the same length reaches the checkbox group', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: {
          source: { type: 'string' },
          checks: {
            type: 'array',
            items: { type: 'string', enum: ['a', 'b'] },
            presentation: { inputType: 'checkbox' },
            controls: { derived: '[../source]' },
          },
        },
      }}
      defaultValue={{ source: 'a' }}
    />,
  );
  fireEvent.change(fieldInput(container, '/source'), { target: { value: 'b' } });
  await act(async () => {});
  expect(ref.current!.getValue()).toEqual({ source: 'b', checks: ['b'] });
  const boxes = container.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  expect([boxes[0].checked, boxes[1].checked]).toEqual([false, true]);
});
