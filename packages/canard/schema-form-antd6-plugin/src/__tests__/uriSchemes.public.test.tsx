import { Activity, type ReactNode, createRef, useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
let setMode: (mode: 'visible' | 'hidden') => void = () => {};
const Host = ({ children }: { children: ReactNode }) => {
  const [mode, set] = useState<'visible' | 'hidden'>('visible');
  setMode = set;
  return <Activity mode={mode}>{children}</Activity>;
};
const selectedProtocol = () =>
  document.querySelector('.ant-select')?.textContent ??
  screen.getByRole('combobox').textContent;
const input = () =>
  document.querySelector<HTMLInputElement>('input:not([role])')!;
const choose = (label: string) => {
  fireEvent.mouseDown(
    document.querySelector('.ant-select-selector') ??
      screen.getByRole('combobox'),
  );
  const option = Array.from(
    document.querySelectorAll('.ant-select-item-option'),
  ).find((e) => e.textContent === label);
  if (option) fireEvent.click(option);
  else fireEvent.click(within(screen.getByRole('listbox')).getByText(label));
};

it.each([
  ['http://host/a', 'http://', 'host/a'],
  ['https://host/a', 'https://', 'host/a'],
  ['ftp://host/a', 'ftp://', 'host/a'],
  ['mailto:user@example.com', 'mailto:', 'user@example.com'],
  ['tel:+1234', 'tel:', '+1234'],
  ['urn:isbn:0451450523', 'urn:', 'isbn:0451450523'],
  ['data:text/plain,hello', 'data:', 'text/plain,hello'],
  ['sms:+1234', 'sms:', '+1234'],
  ['geo:37.78,-122.4', 'geo:', '37.78,-122.4'],
  ['wss://host/a', 'wss://', 'host/a'],
  ['HTTP://host/a', 'HTTP://', 'host/a'],
  ['MaIlTo:user@example.com', 'MaIlTo:', 'user@example.com'],
  ['git+ssh://host/a', 'git+ssh://', 'host/a'],
  ['my-scheme:part', 'my-scheme:', 'part'],
  ['my.scheme:part', 'my.scheme:', 'part'],
  ['example.com:8080/p', 'example.com:', '8080/p'],
  ['123:456', '', '123:456'],
  [':abc', '', ':abc'],
  ['foo/bar:baz', '', 'foo/bar:baz'],
  ['data:text/plain;base64,SGVsbG8=', 'data:', 'text/plain;base64,SGVsbG8='],
  ['host/a', '', 'host/a'],
  ['', '', ''],
  ['localhost:3000', 'localhost:', '3000'],
  ['a:b', 'a:', 'b'],
  ['urn:', 'urn:', ''],
  ['HTTP://', 'HTTP://', ''],
  ['http:host/a', 'http:', 'host/a'],
  ['mailto://host/a', 'mailto://', 'host/a'],
])(
  'round-trips %j through mount, external write, reset, Activity and edits',
  async (value, scheme, path) => {
    const markup = renderToString(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: 'object',
          properties: {
            link: {
              type: 'string',
              format: 'uri',
              options: { omitEmpty: false },
              presentation: {
                FieldInputProps: { protocols: ['http', 'https'] },
              },
            },
          },
        }}
        defaultValue={{ link: value }}
      />,
    );
    const server = document.createElement('div');
    server.innerHTML = markup;
    const serverPrefix =
      server.querySelector('.ant-select')?.textContent ??
      server.querySelector('[role="combobox"]')?.textContent;
    expect(serverPrefix).toBe(scheme || 'No scheme');
    expect(
      server.querySelector<HTMLInputElement>('input:not([role])')?.value,
    ).toBe(path);
    const ref = createRef<FormHandle>();
    render(
      <Host>
        <Form
          ref={ref}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          jsonSchema={{
            type: 'object',
            properties: {
              link: {
                type: 'string',
                format: 'uri',
                options: { omitEmpty: false },
                presentation: {
                  FieldInputProps: { protocols: ['http', 'https'] },
                },
              },
            },
          }}
          defaultValue={{ link: value }}
        />
      </Host>,
    );
    const assertStored = () => {
      expect(ref.current!.getValue()).toEqual({ link: value });
      expect(input().value).toBe(path);
      expect(selectedProtocol()).toBe(scheme || 'No scheme');
      expect(
        (selectedProtocol() === 'No scheme' ? '' : selectedProtocol()) +
          input().value,
      ).toBe(value);
    };
    assertStored();
    act(() => {
      ref.current!.setValue({ link: 'https://external' });
    });
    act(() => {
      ref.current!.setValue({ link: value });
    });
    assertStored();
    fireEvent.change(input(), { target: { value: path + 'edit' } });
    expect(ref.current!.getValue()).toEqual({ link: scheme + path + 'edit' });
    await act(async () => {
      await ref.current!.reset();
    });
    assertStored();
    act(() => setMode('hidden'));
    act(() => setMode('visible'));
    assertStored();
    fireEvent.change(input(), { target: { value: path + 'edit' } });
    expect(ref.current!.getValue()).toEqual({ link: scheme + path + 'edit' });
    choose('https://');
    expect(input().value).toBe(path + 'edit');
    expect(ref.current!.getValue()).toEqual({
      link: 'https://' + path + 'edit',
    });
  },
);
