import { Activity, type ReactNode, createRef, useState } from 'react';
import { renderToString } from 'react-dom/server';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputUriDefinition } from '../../fieldInputs/FieldInputUri';

afterEach(cleanup);

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
  const listbox = screen.getByRole('listbox');
  fireEvent.click(within(listbox).getByText(label));
};

const selectedProtocol = () => screen.getByRole('combobox').textContent;

describe('URI protocol across an Activity hide and show (mui)', () => {
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

    act(() => setMode('hidden'));
    act(() => setMode('visible'));
    expect(formRef.current?.getValue()).toEqual({
      link: 'https://example.com',
    });

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
  });
});

describe('URI protocol in the server render (mui)', () => {
  it('server markup shows the stored scheme, not the first protocol', () => {
    const html = renderToString(
      <Form
        fieldInputDefinitions={[FieldInputUriDefinition]}
        jsonSchema={schema}
        defaultValue={{ link: 'https://example.com' }}
      />,
    );
    const container = document.createElement('div');
    container.innerHTML = html;
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox?.textContent).toBe('https://');
  });

  it('control: the first client render shows the stored scheme', () => {
    render(
      <Form
        fieldInputDefinitions={[FieldInputUriDefinition]}
        jsonSchema={schema}
        defaultValue={{ link: 'https://example.com' }}
      />,
    );
    expect(selectedProtocol()).toBe('https://');
  });
});
