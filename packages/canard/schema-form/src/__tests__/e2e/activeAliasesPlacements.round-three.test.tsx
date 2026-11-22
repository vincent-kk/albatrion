import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  FormProvider,
  type JSONSchema,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

it.each([
  ['node', 'relative'],
  ['node', 'absolute'],
  ['node', 'context'],
  ['fields', 'relative'],
  ['fields', 'absolute'],
  ['fields', 'context'],
  ['oneOf', 'relative'],
  ['oneOf', 'absolute'],
  ['oneOf', 'context'],
  ['anyOf', 'relative'],
  ['anyOf', 'absolute'],
  ['anyOf', 'context'],
] as const)(
  'round-3: %s active with %s reads matches inline at three hosts',
  async (placement, target) => {
    const run = async (ref: boolean, initial: boolean, provider: boolean) => {
      const expression =
        target === 'context'
          ? '@.on === true'
          : target === 'absolute'
            ? '/enabled === true'
            : placement === 'node'
              ? '../../flag === true'
              : '../flag === true';
      const value: JSONSchema = { type: 'string', default: 'v' };
      const template: JSONSchema =
        placement === 'node'
          ? {
              type: 'object',
              properties: {
                value: { ...value, controls: { active: expression } },
              },
            }
          : placement === 'fields'
            ? {
                type: 'object',
                properties: { value },
                controls: {
                  fields: [
                    { targets: ['value'], controls: { active: expression } },
                  ],
                },
              }
            : {
                type: 'object',
                [placement]: [
                  { controls: { active: expression }, properties: { value } },
                ],
              };
      const host: JSONSchema = {
        type: 'object',
        properties: {
          flag: { type: 'boolean', default: initial },
          contact: ref ? { $ref: '#/$defs/T' } : template,
        },
      };
      const jsonSchema: JSONSchema = {
        type: 'object',
        $defs: { T: template },
        properties: {
          enabled: { type: 'boolean', default: initial },
          first: host,
          second: host,
          third: host,
        },
      };
      const handle = createRef<FormHandle>();
      const form = (on: boolean) => (
        <FormProvider context={provider ? { on } : undefined}>
          <Form
            ref={handle}
            jsonSchema={jsonSchema}
            context={provider ? undefined : { on }}
            validationMode={ValidationMode.None}
          />
        </FormProvider>
      );
      const view = render(form(initial));
      const values: unknown[] = [handle.current!.getValue()];
      for (const on of [!initial, initial, true]) {
        await act(() => {
          if (target === 'context') view.rerender(form(on));
          else if (target === 'absolute')
            handle.current!.findNode('/enabled')!.setValue(on);
          else
            handle.current!.node!.batch(() => {
              for (const name of ['first', 'second', 'third'])
                handle.current!.findNode(`/${name}/flag`)!.setValue(on);
            });
        });
        for (const name of ['first', 'second', 'third'])
          expect(
            handle.current!.findNode(`/${name}/contact/value`) !== null,
          ).toBe(on);
        values.push(handle.current!.getValue());
      }
      view.unmount();
      return values;
    };
    for (const initial of [false, true])
      for (const provider of [false, true])
        expect(await run(true, initial, provider)).toEqual(
          await run(false, initial, provider),
        );
  },
);
