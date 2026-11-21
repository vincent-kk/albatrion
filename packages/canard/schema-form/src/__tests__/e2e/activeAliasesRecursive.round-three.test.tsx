import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  isArrayNode,
} from '../../index';

afterEach(cleanup);

it.each(['active', 'visible', 'readOnly', 'disabled', 'derived'] as const)(
  'round-3: recursive %s occurrences match finite inline expansion',
  async (control) => {
    const run = async (ref: boolean) => {
      const field: JSONSchema = {
        type: 'string',
        default: 'v',
        controls: {
          [control]:
            control === 'derived' ? '@.on ? "on" : "off"' : '@.on === true',
        },
      };
      const finite = (depth: number): JSONSchema => ({
        type: 'object',
        properties: {
          value: field,
          kids: {
            type: 'array',
            items: depth ? finite(depth - 1) : { type: 'object' },
          },
        },
      });
      const template: JSONSchema = {
        type: 'object',
        properties: {
          value: field,
          kids: { type: 'array', items: { $ref: '#/$defs/T' } },
        },
      };
      const jsonSchema: JSONSchema = {
        type: 'object',
        $defs: { T: template },
        properties: {
          root: ref ? { $ref: '#/$defs/T' } : finite(3),
        },
      };
      const handle = createRef<FormHandle>();
      const form = (on: boolean) => (
        <Form
          ref={handle}
          jsonSchema={jsonSchema}
          defaultValue={{ root: { kids: [{ kids: [{}] }] } }}
          context={{ on }}
          validationMode={ValidationMode.None}
        />
      );
      const view = render(form(false));
      const observations: unknown[] = [];
      for (const on of [false, true, false, true]) {
        await act(() => view.rerender(form(on)));
        observations.push({
          value: handle.current!.getValue(),
          states: [
            '/root/value',
            '/root/kids/0/value',
            '/root/kids/0/kids/0/value',
          ].map((path) => {
            const node = handle.current!.findNode(path);
            return node
              ? [node.isVisible, node.isReadOnly, node.isDisabled]
              : null;
          }),
        });
      }
      await act(() => handle.current!.reset());
      observations.push(handle.current!.getValue());
      view.unmount();
      return observations;
    };
    expect(await run(true)).toEqual(await run(false));
  },
);

it.each(['absolute', 'context'] as const)(
  'round-3: sibling arrays with %s active reads survive topology and subtree resets',
  async (target) => {
    const run = async (ref: boolean) => {
      const template: JSONSchema = {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            default: 'v',
            controls: {
              active:
                target === 'absolute' ? '/toggle === true' : '@.on === true',
            },
          },
        },
      };
      const list: JSONSchema = {
        type: 'array',
        items: ref ? { $ref: '#/$defs/T' } : template,
      };
      const schema: JSONSchema = {
        type: 'object',
        $defs: { T: template },
        properties: {
          toggle: { type: 'boolean', default: false },
          listA: list,
          listB: list,
        },
      };
      const handle = createRef<FormHandle>();
      const form = (on: boolean) => (
        <Form
          ref={handle}
          jsonSchema={schema}
          defaultValue={{ listA: [{}, {}], listB: [{}, {}] }}
          context={{ on }}
          validationMode={ValidationMode.None}
        />
      );
      const view = render(form(false));
      const seen: unknown[] = [handle.current!.getValue()];
      for (const on of [true, false, true]) {
        await act(() =>
          target === 'context'
            ? view.rerender(form(on))
            : handle.current!.findNode('/toggle')!.setValue(on),
        );
        seen.push(handle.current!.getValue());
      }
      for (const path of ['/listA', '/listB']) {
        const node = handle.current!.findNode(path);
        if (!isArrayNode(node)) throw new Error('Expected array');
        await act(() => node.insert(0, {}));
        seen.push(handle.current!.getValue());
        await act(() => node.insert(0, node.remove(2)));
        seen.push(handle.current!.getValue());
        await act(() => node.remove(1));
        seen.push(handle.current!.getValue());
        await act(() => node.setValue(undefined));
        seen.push(handle.current!.getValue());
        await act(() => node.resetSubtree());
        seen.push(handle.current!.getValue());
      }
      view.unmount();
      return seen;
    };
    expect(await run(true)).toEqual(await run(false));
  },
);
