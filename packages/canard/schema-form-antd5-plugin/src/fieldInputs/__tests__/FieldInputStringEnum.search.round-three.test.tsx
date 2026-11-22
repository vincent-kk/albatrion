import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputStringEnumDefinition } from '../FieldInputStringEnum';

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
  it('typing a displayed non-Latin label finds that option', () => {
    render(
      <Form
        fieldInputDefinitions={[FieldInputStringEnumDefinition]}
        jsonSchema={schema}
      />,
    );
    search('대한');
    expect(visibleOptions()).toEqual(['대한민국']);
  });

  it('typing a displayed Latin label finds that option', () => {
    render(
      <Form
        fieldInputDefinitions={[FieldInputStringEnumDefinition]}
        jsonSchema={schema}
      />,
    );
    search('United');
    expect(visibleOptions()).toEqual(['United States']);
  });

  it('finds an original enum value that is absent from its label', () => {
    render(
      <Form
        fieldInputDefinitions={[FieldInputStringEnumDefinition]}
        jsonSchema={schema}
      />,
    );
    search('RAW-TOKEN');
    expect(visibleOptions()).toEqual(['café']);
  });

  it('finds an NFC label using an NFD query with different case', () => {
    render(
      <Form
        fieldInputDefinitions={[FieldInputStringEnumDefinition]}
        jsonSchema={schema}
      />,
    );
    search('CAFE\u0301');
    expect(visibleOptions()).toEqual(['café']);
  });
});
