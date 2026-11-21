import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputStringEnumDefinition } from '../FieldInputStringEnum';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const visibleOptions = () =>
  Array.from(document.querySelectorAll('.ant-select-item-option')).map(
    (option) => option.textContent,
  );

const search = (text: string) => {
  const input = document.querySelector('[role="combobox"]') as HTMLInputElement;
  fireEvent.mouseDown(input);
  act(() => {
    fireEvent.change(input, { target: { value: text } });
  });
};

const schema = {
  type: 'array',
  items: { type: 'string', enum: ['kr', 'us', 'jp'] },
  presentation: {
    FieldInputProps: {
      alias: { kr: '대한민국', us: 'United States', jp: '日本' },
    },
  },
} as const;

describe('multiple enum search by the displayed label (antd6)', () => {
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

  it('control: typing the raw enum value finds that option', () => {
    render(
      <Form
        fieldInputDefinitions={[FieldInputStringEnumDefinition]}
        jsonSchema={schema}
      />,
    );
    search('us');
    expect(visibleOptions()).toEqual(['United States']);
  });
});
