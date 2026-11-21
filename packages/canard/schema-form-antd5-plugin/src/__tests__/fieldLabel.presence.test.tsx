import { Suspense } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type JSONSchema,
  type LabelRendererProps,
} from '@canard/schema-form';

import { plugin } from '../index';
import { fieldLabelPresence } from './utils/fieldLabelPresence';
import { fieldNameReference } from './utils/fieldNameReference';

const ConsumerLabel = ({ children, id, htmlFor }: LabelRendererProps) => (
  <label id={id} htmlFor={htmlFor}>
    {children}
  </label>
);

const definition = plugin.fieldInputDefinitions.find(
  ({ Component }) => Component.name === 'FieldInputString',
);
if (!definition) throw new Error('Missing string input definition');

const TextControl = definition.Component;
const ReplaceableText = ({
  replace,
  ...props
}: FieldInputProps & { replace?: boolean }) => (
  <TextControl key={replace ? 'replacement' : 'original'} {...props} />
);

afterEach(cleanup);

it.each([
  ['Spoken caption', 'Schema title', 'registered'],
  [undefined, 'Schema title', 'consumer'],
  [undefined, undefined, 'registered'],
] as const)(
  'supplies a current name with options=%s, title=%s, renderer=%s',
  async (ariaLabel, title, renderer) => {
    const schema = {
      type: 'object',
      properties: {
        field: { type: 'string', title, options: { 'aria-label': ariaLabel } },
      },
    } satisfies JSONSchema;
    let resolveLabel = () => {};
    const promise = new Promise<void>((resolve) => {
      resolveLabel = resolve;
    });
    let ready = false;
    const AsyncLabel = () => {
      if (!ready) throw promise;
      return <Form.Label path="/field">Outer</Form.Label>;
    };
    const view = render(<div />);
    const observed = new Set<string>();
    let previous: HTMLElement | undefined;
    for (const state of fieldLabelPresence()) {
      if (state.pending && state.external) {
        await act(async () => {
          ready = true;
          resolveLabel();
        });
      }
      view.rerender(
        <Form
          jsonSchema={schema}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          LabelRenderer={
            renderer === 'consumer' ? ConsumerLabel : plugin.LabelRenderer
          }
        >
          {state.pending ? (
            <Suspense fallback={<span>Waiting for label</span>}>
              <AsyncLabel />
            </Suspense>
          ) : state.external ? (
            <Form.Label path="/field">Outer</Form.Label>
          ) : null}
          <Form.Input
            path="/field"
            hideLabel
            FieldInput={ReplaceableText}
            replace={state.replaced}
          />
        </Form>,
      );
      if (state.step === 'label pending')
        expect(view.getByText('Waiting for label')).toBeTruthy();
      const control = view.getByRole('textbox');
      if (previous && state.step === 'control replaced') {
        expect(control).not.toBe(previous);
        expect(control.id).toBe(previous.id);
      } else if (previous) {
        expect(control, state.step).toBe(previous);
      }
      previous = control;
      const name = fieldNameReference({
        visible: state.external ? ['Outer'] : [],
        ariaLabel,
        title,
        key: 'field',
      });
      if (state.external) await act(async () => {});
      expect(view.getByRole('textbox', { name }), state.step).toBe(control);
      observed.add(state.step);
    }
    expect(observed).toEqual(
      new Set([
        'control first',
        'label present',
        'control replaced',
        'label removed after replacement',
        'label pending',
        'label resolved',
      ]),
    );
  },
);
