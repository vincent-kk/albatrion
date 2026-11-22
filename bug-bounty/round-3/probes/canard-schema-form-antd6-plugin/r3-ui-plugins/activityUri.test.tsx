import { Activity, type ReactNode, createRef, useState } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputUriDefinition } from '../../fieldInputs/FieldInputUri';

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

const schema = {
  type: 'object',
  properties: { link: { type: 'string', format: 'uri' } },
} as const;

let setMode: (mode: 'visible' | 'hidden') => void = () => {};
const Host = ({ children }: { children: ReactNode }) => {
  const [mode, set] = useState<'visible' | 'hidden'>('visible');
  setMode = set;
  return <Activity mode={mode}>{children}</Activity>;
};

const chooseProtocol = (label: string) => {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const option = Array.from(
    document.querySelectorAll('.ant-select-item-option'),
  ).find((element) => element.textContent === label)!;
  fireEvent.click(option);
};

const selectedProtocol = () =>
  document.querySelector('.ant-select')?.textContent;

describe('URI protocol across an Activity hide and show (antd6)', () => {
  it('keeps the protocol the user chose after the Activity is hidden and shown', () => {
    const formRef = createRef<FormHandle<typeof schema>>();
    render(
      <Host>
        <Form
          ref={formRef}
          fieldInputDefinitions={[FieldInputUriDefinition]}
          jsonSchema={schema}
          defaultValue={{ link: 'http://example.com' }}
        />
      </Host>,
    );
    chooseProtocol('https://');
    expect(formRef.current?.getValue()).toEqual({
      link: 'https://example.com',
    });
    expect(selectedProtocol()).toBe('https://');

    act(() => setMode('hidden'));
    act(() => setMode('visible'));

    // The form still holds https.
    expect(formRef.current?.getValue()).toEqual({
      link: 'https://example.com',
    });

    // A path edit must not rewrite the scheme the user chose.
    const input = document.querySelector('input#\\/link') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'example.com/x' } });
    expect(formRef.current?.getValue()).toEqual({
      link: 'https://example.com/x',
    });
  });

  it('shows the protocol the form holds after the Activity is hidden and shown', () => {
    const formRef = createRef<FormHandle<typeof schema>>();
    render(
      <Host>
        <Form
          ref={formRef}
          fieldInputDefinitions={[FieldInputUriDefinition]}
          jsonSchema={schema}
          defaultValue={{ link: 'http://example.com' }}
        />
      </Host>,
    );
    chooseProtocol('https://');
    expect(selectedProtocol()).toBe('https://');
    act(() => setMode('hidden'));
    act(() => setMode('visible'));
    expect(formRef.current?.getValue()).toEqual({
      link: 'https://example.com',
    });
    expect(selectedProtocol()).toBe('https://');
  });

  it('control: without the Activity toggle the chosen protocol survives a path edit', () => {
    const formRef = createRef<FormHandle<typeof schema>>();
    render(
      <Host>
        <Form
          ref={formRef}
          fieldInputDefinitions={[FieldInputUriDefinition]}
          jsonSchema={schema}
          defaultValue={{ link: 'http://example.com' }}
        />
      </Host>,
    );
    chooseProtocol('https://');
    const input = document.querySelector('input#\\/link') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'example.com/x' } });
    expect(formRef.current?.getValue()).toEqual({
      link: 'https://example.com/x',
    });
    expect(screen.getAllByText('https://').length).toBeGreaterThan(0);
  });
});
