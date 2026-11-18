import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '../../index';

afterEach(cleanup);
describe('round-2 schema-form 1: referenced own active controls', () => {
  it.each(['../on === true', '/a/on === true'])(
    'matches inline evaluation for %s',
    async (active) => {
      const field: JSONSchema = {
        type: 'string',
        default: 'd',
        controls: { active },
      };
      const run = async (ref: boolean) => {
        const handle = createRef<FormHandle>();
        const view = render(
          <Form
            ref={handle}
            validationMode={ValidationMode.None}
            jsonSchema={{
              type: 'object',
              $defs: { S: field },
              properties: {
                a: {
                  type: 'object',
                  properties: {
                    on: { type: 'boolean', default: true },
                    s: ref ? { $ref: '#/$defs/S' } : field,
                  },
                },
              },
            }}
          />,
        );
        const initial = handle.current!.getValue();
        await act(() => handle.current!.findNode('/a/on')!.setValue(false));
        const off = handle.current!.getValue();
        await act(() => handle.current!.findNode('/a/on')!.setValue(true));
        const on = handle.current!.getValue();
        view.unmount();
        return { initial, off, on };
      };
      const inline = await run(false);
      expect(inline.initial).toEqual({ a: { on: true, s: 'd' } });
      expect(await run(true)).toEqual(inline);
    },
  );
});
describe('round-2 schema-form 2: reused template dependencies', () => {
  it.each(['derived', 'visible', 'readOnly', 'disabled'] as const)(
    'matches inline %s at another host',
    async (key) => {
      const field: JSONSchema = {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'v' },
          b: {
            type: 'string',
            controls: {
              [key]: key === 'derived' ? '(../a) + "!"' : '../a === "v"',
            },
          },
        },
      };
      const run = async (ref: boolean) => {
        const handle = createRef<FormHandle>();
        const view = render(
          <Form
            ref={handle}
            validationMode={ValidationMode.None}
            jsonSchema={{
              type: 'object',
              $defs: { P: field },
              properties: {
                x: ref ? { $ref: '#/$defs/P' } : field,
                g: {
                  type: 'object',
                  properties: { y: ref ? { $ref: '#/$defs/P' } : field },
                },
              },
            }}
          />,
        );
        await act(() =>
          handle.current!.findNode('/g/y/a')!.setValue('changed'),
        );
        const node = handle.current!.findNode('/g/y/b')!;
        const result = {
          value: node.value,
          visible: node.isVisible,
          readOnly: node.isReadOnly,
          disabled: node.isDisabled,
        };
        view.unmount();
        return result;
      };
      expect(await run(true)).toEqual(await run(false));
    },
  );
  it('rebinds derived reads at recursive array depths', async () => {
    const handle = createRef<FormHandle>();
    render(
      <Form
        ref={handle}
        validationMode={ValidationMode.None}
        jsonSchema={{
          $defs: {
            n: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                label: {
                  type: 'string',
                  controls: { derived: '(../name) + "#"' },
                },
                kids: { type: 'array', items: { $ref: '#/$defs/n' } },
              },
            },
          },
          $ref: '#/$defs/n',
        }}
        defaultValue={{
          name: 'r',
          kids: [{ name: 'c', kids: [{ name: 'g' }] }],
        }}
      />,
    );
    await act(() =>
      handle.current!.findNode('/kids/0/kids/0/name')!.setValue('h'),
    );
    expect(handle.current!.findNode('/kids/0/kids/0/label')!.value).toBe('h#');
  });
});
