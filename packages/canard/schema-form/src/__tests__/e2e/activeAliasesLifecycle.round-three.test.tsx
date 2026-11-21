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
  'round-3: %s matches inline at three occurrences through topology and load changes',
  async (control) => {
    const run = async (ref: boolean, nested: boolean, array: boolean) => {
      const field: JSONSchema = {
        type: 'string',
        default: 'v',
        controls: {
          [control]:
            control === 'derived' ? '@.on ? "on" : "off"' : '@.on === true',
        },
      };
      const template: JSONSchema = {
        type: 'object',
        properties: { value: field },
      };
      const use: JSONSchema = ref ? { $ref: '#/$defs/T' } : template;
      const host: JSONSchema = nested
        ? { type: 'object', properties: { inner: use } }
        : use;
      const jsonSchema: JSONSchema = {
        type: 'object',
        $defs: { T: template },
        properties: {
          enabled: { type: 'boolean', default: true },
          first: host,
          second: host,
          third: host,
          ...(array ? { list: { type: 'array', items: host } } : {}),
          gated: { ...host, controls: { active: '../enabled === true' } },
        },
      };
      const handle = createRef<FormHandle>();
      const form = (on: boolean) => (
        <Form
          ref={handle}
          jsonSchema={jsonSchema}
          defaultValue={{ list: [{}, {}, {}] }}
          context={{ on }}
          validationMode={ValidationMode.None}
        />
      );
      const view = render(form(false));
      const observations: unknown[] = [];
      const snapshot = () => {
        const paths = [
          'first',
          'second',
          'third',
          'gated',
          ...(array ? ['list/0', 'list/1', 'list/2'] : []),
        ];
        observations.push({
          value: handle.current!.getValue(),
          states: paths.map((path) => {
            const node = handle.current!.findNode(
              `/${path}/${nested ? 'inner/' : ''}value`,
            );
            return node
              ? [node.value, node.isVisible, node.isReadOnly, node.isDisabled]
              : null;
          }),
        });
      };
      snapshot();
      for (const on of [true, false, true]) {
        await act(() => view.rerender(form(on)));
        snapshot();
      }
      await act(() => handle.current!.findNode('/enabled')!.setValue(false));
      snapshot();
      await act(() => handle.current!.findNode('/enabled')!.setValue(true));
      snapshot();
      await act(() =>
        handle.current!.node!.batch(() => {
          handle.current!.findNode('/first')!.setValue({});
          handle.current!.findNode('/second')!.setValue({});
        }),
      );
      snapshot();
      if (array) {
        const list = handle.current!.findNode('/list');
        if (!isArrayNode(list)) throw new Error('Expected list');
        await act(() => list.insert(0, {}));
        snapshot();
        await act(() => list.insert(0, list.remove(2)));
        snapshot();
        await act(() => list.remove(1));
        snapshot();
      }
      await act(() => handle.current!.reset());
      snapshot();
      view.unmount();
      return observations;
    };
    for (const nested of [false, true])
      for (const array of [false, true])
        expect(await run(true, nested, array)).toEqual(
          await run(false, nested, array),
        );
  },
);
