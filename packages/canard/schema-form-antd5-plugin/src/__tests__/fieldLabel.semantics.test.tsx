import { createContext, useContext, useLayoutEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type JSONSchema,
  type LabelRendererProps,
} from '@canard/schema-form';

import { plugin } from '../index';
import { fieldLabelSemantics } from './utils/fieldLabelSemantics';
import { fieldNameReference } from './utils/fieldNameReference';

const schema = {
  type: 'object',
  properties: {
    field: { type: 'string', options: { 'aria-label': 'Spoken fallback' } },
  },
} satisfies JSONSchema;
const stringInput = plugin.fieldInputDefinitions.find(
  ({ Component }) => Component.name === 'FieldInputString',
);
if (!stringInput) throw new Error('The string definition is required');
const Native = stringInput.Component;
const Scenario = createContext<string>('regular');

const Caption = ({ id, htmlFor }: LabelRendererProps) => {
  const kind = useContext(Scenario);
  return (
    <div hidden={kind === 'hidden ancestor'}>
      <label
        id={id}
        htmlFor={htmlFor}
        hidden={kind === 'hidden'}
        aria-hidden={kind === 'aria hidden' || undefined}
        className={kind === 'CSS class' ? 'fixture-hidden-title' : undefined}
        style={{
          display: kind === 'CSS display' ? 'none' : undefined,
          visibility: kind === 'CSS visibility' ? 'hidden' : undefined,
        }}
      >
        {kind === 'decorative only' ? null : 'Outer'}
        <span aria-hidden="true">*</span>
        <span hidden>Decoration</span>
      </label>
    </div>
  );
};

const ConsumerInput = ({
  inputId,
  'aria-label': authored,
  ...props
}: FieldInputProps & { 'aria-label'?: string }) => {
  useLayoutEffect(() => {
    if (authored)
      document.getElementById(inputId)?.setAttribute('aria-label', authored);
  }, [authored, inputId]);
  return <Native inputId={inputId} {...props} />;
};

afterEach(cleanup);

it('uses the attribute-based rendering model for an external caption', async () => {
  const view = render(<div />);
  const observed = new Set<string>();
  for (const state of fieldLabelSemantics().labels) {
    await act(async () => {
      view.rerender(
        <Scenario.Provider value={state.kind}>
          <style>{'.fixture-hidden-title { display: none }'}</style>
          <Form
            jsonSchema={schema}
            fieldInputDefinitions={[stringInput]}
            LabelRenderer={Caption}
          >
            <Form.Label path="/field" />
            <Form.Input path="/field" hideLabel />
          </Form>
        </Scenario.Provider>,
      );
    });
    const name = fieldNameReference({
      visible: state.caption ? [state.caption] : [],
      ariaLabel: 'Spoken fallback',
      key: 'field',
    });
    expect
      .soft(view.queryByRole('textbox', { name }), state.kind)
      .toBe(view.getByRole('textbox'));
    observed.add(state.kind);
  }
  expect([...observed]).toEqual([
    'regular',
    'decorative only',
    'hidden',
    'aria hidden',
    'hidden ancestor',
    'CSS display',
    'CSS visibility',
    'CSS class',
  ]);
});

it('names a root switch through an otherwise decorative external label', async () => {
  const root = {
    type: 'boolean',
    presentation: { inputType: 'switch' },
  } satisfies JSONSchema;
  const view = render(
    <Scenario.Provider value="decorative only">
      <Form
        jsonSchema={root}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        LabelRenderer={Caption}
      >
        <Form.Label path="" />
        <Form.Input path="" hideLabel />
      </Form>
    </Scenario.Provider>,
  );
  await act(async () => {});
  expect(view.getByRole('switch', { name: 'Field' })).toBeTruthy();
});

it('keeps consumer names written before and during generation and after unmount', async () => {
  const view = render(<div />);
  const observed = new Set<string>();
  let control: HTMLElement | undefined;
  for (const state of fieldLabelSemantics().ownership) {
    if (state.kind === 'cleanup') {
      view.unmount();
    } else {
      await act(async () => {
        view.rerender(
          <Form
            jsonSchema={schema}
            fieldInputDefinitions={[stringInput]}
            LabelRenderer={Caption}
          >
            {state.outer && <Form.Label path="/field" />}
            <Form.Input
              path="/field"
              hideLabel
              FieldInput={ConsumerInput}
              aria-label={state.caption}
            />
          </Form>,
        );
      });
      control = view.getByRole('textbox');
    }
    expect
      .soft(control?.getAttribute('aria-label'), state.kind)
      .toBe(state.caption);
    observed.add(state.kind);
  }
  expect([...observed]).toEqual([
    'authored before',
    'authored after',
    'authored changed',
    'cleanup',
  ]);
});
