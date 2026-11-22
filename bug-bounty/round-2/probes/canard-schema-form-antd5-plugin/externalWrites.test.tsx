import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { fieldInputDefinitions } from '../../fieldInputs';

afterEach(cleanup);

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
  const byId = (id: string) => container.ownerDocument.getElementById(id);
  const radios = container.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  );
  const boxes = container.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  return {
    text: (byId('/text') as HTMLInputElement).value,
    num: (byId('/num') as HTMLInputElement).value,
    radio: radios[0].checked ? 'a' : radios[1].checked ? 'b' : undefined,
    checks: [
      boxes[0].checked ? 'a' : null,
      boxes[1].checked ? 'b' : null,
    ].filter(Boolean),
    pick: container.querySelector('.ant-select-selection-item')?.textContent,
    slide: container
      .querySelector('[role="slider"]')
      ?.getAttribute('aria-valuenow'),
    date: (byId('/date') as HTMLInputElement).value,
    link: (byId('/link') as HTMLInputElement).value,
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
  const doc = container.ownerDocument;
  fireEvent.change(doc.getElementById('/text')!, { target: { value: 'oneX' } });
  fireEvent.change(doc.getElementById('/num')!, { target: { value: '15' } });
  fireEvent.change(doc.getElementById('/link')!, {
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
  const selected = container
    .ownerDocument.getElementById('/link')!
    .closest('.ant-input-group-wrapper')!
    .querySelector('.ant-select-selection-item')?.textContent;
  expect(selected).toBe('ftp://');
  fireEvent.change(container.ownerDocument.getElementById('/link')!, {
    target: { value: 'two.exampleZ' },
  });
  expect(ref.current!.getValue()).toMatchObject({ link: 'ftp://two.exampleZ' });
});
