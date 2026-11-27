import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

const visibleOptions = () =>
  Array.from(document.querySelectorAll('.ant-select-item-option')).map(
    (option) => option.textContent,
  );

const search = (text: string) => {
  const input = document.querySelector<HTMLInputElement>(
    '.ant-select-selection-search-input',
  )!;
  fireEvent.mouseDown(document.querySelector('.ant-select-selector')!);
  act(() => {
    fireEvent.change(input, { target: { value: text } });
  });
};

const schema = {
  type: 'array',
  items: { type: 'string', enum: ['kr', 'us', 'jp', 'raw-token'] },
  presentation: {
    FieldInputProps: {
      alias: {
        kr: '대한민국',
        us: 'United States',
        jp: '日本',
        'raw-token': 'café',
      },
    },
  },
} as const;

describe('multiple enum search by the displayed label (antd5)', () => {
  it.each([
    ['a displayed non-Latin label', '대한', '대한민국'],
    ['a displayed Latin label', 'United', 'United States'],
    ['an original enum value absent from its label', 'RAW-TOKEN', 'café'],
    ['an NFD query with different case for an NFC label', 'CAFE\u0301', 'café'],
  ])('typing %s finds that option', (_, query, option) => {
    render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={schema}
      />,
    );
    search(query);
    expect(visibleOptions()).toEqual([option]);
  });
});
