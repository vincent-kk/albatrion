import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

const visibleOptions = () =>
  Array.from(document.querySelectorAll('.ant-select-item-option'), (option) =>
    option.textContent?.normalize('NFC'),
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

const schemaWith = (labels: Record<string, string>): JSONSchema => ({
  type: 'array',
  items: { type: 'string', enum: ['kr', 'fr'] },
  presentation: { FieldInputProps: { alias: labels } },
});

it.each([
  ['NFD labels, NFC query', 'NFD', 'NFC'],
  ['NFC labels, NFD query', 'NFC', 'NFD'],
] as const)('%s: typing a displayed label finds it', (_name, labelForm, queryForm) => {
  render(
    <Form
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={schemaWith({
        kr: '대한민국'.normalize(labelForm),
        fr: 'Café'.normalize(labelForm),
      })}
      onError={() => {}}
    />,
  );
  search('대한'.normalize(queryForm));
  const korean = visibleOptions();
  search('Café'.normalize(queryForm));
  expect({ korean, french: visibleOptions() }).toEqual({
    korean: ['대한민국'],
    french: ['Café'],
  });
});

it('control: matching normalization forms find the label', () => {
  render(
    <Form
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={schemaWith({ kr: '대한민국', fr: 'Café' })}
      onError={() => {}}
    />,
  );
  search('대한');
  expect(visibleOptions()).toEqual(['대한민국']);
});
