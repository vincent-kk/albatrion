import { createRef } from 'react';

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
  type LabelRendererProps,
} from '@canard/schema-form';

import { plugin } from '../index';
import { fieldLabelLifecycle } from './utils/fieldLabelLifecycle';
import { fieldNameReference } from './utils/fieldNameReference';
import { sliderReference } from './utils/sliderReference';

const ConsumerLabel = ({ children, id, htmlFor }: LabelRendererProps) => (
  <label id={id} htmlFor={htmlFor}>
    {children}
  </label>
);

const textDefinition = plugin.fieldInputDefinitions.find(
  ({ Component }) => Component.name === 'FieldInputString',
);
if (!textDefinition) throw new Error('Missing plugin text definition');

const NativeText = textDefinition.Component;
const NativeCaptionInput = ({
  fixtureLabel,
  ...props
}: FieldInputProps & { fixtureLabel?: string }) => (
  <>
    {fixtureLabel === undefined ? null : (
      <label id={props.getInputId('fixture-caption')} htmlFor={props.inputId}>
        {fixtureLabel}
      </label>
    )}
    <NativeText {...props} />
  </>
);

const schema = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    level: {
      type: 'number',
      format: 'slider',
      minimum: 0,
      maximum: 10,
      presentation: { inputType: 'slider' },
    },
  },
} satisfies JSONSchema;

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

it.each([
  ['label first', 'registered'],
  ['label first', 'consumer'],
  ['control first', 'registered'],
  ['control first', 'consumer'],
] as const)(
  'resolves present labels and read-only values (%s, %s renderer)',
  async (order, renderer) => {
    const ref = createRef<FormHandle>();
    const reference = sliderReference({
      type: 'number',
      minimum: 0,
      maximum: 10,
    });
    const view = render(<div />);
    let previous: HTMLElement | undefined;
    let generation = 0;
    const observed = new Set<string>();
    for (const step of fieldLabelLifecycle(order)) {
      view.rerender(
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue={{ level: 2.4 }}
          readOnly
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          FieldRenderer={plugin.FieldRenderer}
          LabelRenderer={
            renderer === 'registered' ? plugin.LabelRenderer : ConsumerLabel
          }
        >
          {step.outer === undefined ? null : (
            <Form.Label path="/text">{step.outer}</Form.Label>
          )}
          {step.outer === undefined ? null : (
            <Form.Label path="/level">{step.outer}</Form.Label>
          )}
          {step.control === 0 ? null : (
            <>
              <Form.Input
                key={`text-${step.control}`}
                path="/text"
                FieldInput={NativeCaptionInput}
                fixtureLabel={step.inner}
              />
              <Form.Input
                key={`level-${step.control}`}
                path="/level"
                label={step.inner}
                hideLabel={step.inner === undefined}
              />
            </>
          )}
        </Form>,
      );
      act(() => ref.current?.setValue({ level: step.stored }));
      expect(ref.current?.getValue(), step.step).toEqual({
        level: step.stored,
      });
      if (step.control === 0) {
        expect(screen.queryByRole('textbox'), step.step).toBeNull();
        expect(screen.queryByRole('slider'), step.step).toBeNull();
      } else {
        const control = screen.getByRole('textbox');
        if (previous && generation === step.control)
          expect(control, step.step).toBe(previous);
        const name = fieldNameReference({
          visible: [step.outer, step.inner].filter(
            (label) => label !== undefined,
          ),
          key: '',
        });
        await waitFor(() =>
          expect(screen.getByRole('textbox', { name }), step.step).toBe(
            control,
          ),
        );
        expect(
          screen.getByRole('slider').getAttribute('aria-valuenow'),
          step.step,
        ).toBe(String(reference.displayed(step.stored, true)));
        previous = control;
      }
      generation = step.control;
      observed.add(step.step);
    }
    expect(observed).toEqual(
      new Set([
        order,
        'two labels',
        'external text changed',
        'built-in text changed',
        'external removed',
        'external re-mounted',
        'built-in removed',
        'built-in re-mounted',
        'control removed while label stays',
        'control re-mounted while label stays',
      ]),
    );
  },
);
