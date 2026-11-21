import { act, cleanup, render } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type FieldRendererProps,
  Form,
  type JSONSchema,
} from '@canard/schema-form';

import { plugin } from '../index';
import { fieldCases } from './utils/fieldCases';
import { fieldNameReference } from './utils/fieldNameReference';

const InputOnly = ({ Input }: FieldRendererProps) => <Input hideLabel />;

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

it('connects the fallback on every registered control without a title renderer', async () => {
  const entries = plugin.fieldInputDefinitions;
  const observed = new Set<string>();
  const placementClasses = new Set<string>();
  const sourceClasses = new Set<string>();
  const placements = ['input', 'bound'] as const;
  const sources = ['option', 'title', 'key'] as const;
  const pr = process.env.SCHEMA_FORM_TEST_PROFILE === 'pr';
  for (const [index, definition] of entries.entries()) {
    const kind = definition.Component.name;
    const fixture = fieldCases[kind];
    if (!fixture) throw new Error(`Missing fixture for ${kind}`);
    for (const [placementIndex, placement] of placements.entries())
      for (const [sourceIndex, source] of sources.entries()) {
        if (pr && (index % 2 !== placementIndex || index % 3 !== sourceIndex))
          continue;
        const title = source === 'key' ? undefined : 'Schema fallback';
        const ariaLabel = source === 'option' ? 'Spoken fallback' : undefined;
        const schema: JSONSchema = {
          type: 'object',
          properties: {
            field: {
              ...fixture.schema,
              title,
              options: { 'aria-label': ariaLabel },
              presentation: {
                ...fixture.schema.presentation,
                FieldInputProps: { hideLabel: true },
              },
            },
          },
        };
        const view = render(
          <Form
            jsonSchema={schema}
            fieldInputDefinitions={[definition]}
            FieldRenderer={InputOnly}
            LabelRenderer={plugin.LabelRenderer}
          >
            {placement === 'input' ? (
              <Form.Input path="/field" hideLabel />
            ) : (
              <Form.Field path="/field" />
            )}
          </Form>,
        );
        await act(async () => {});
        const controls = [
          ...view.container.querySelectorAll<HTMLElement>(fixture.primary),
        ].filter(
          (control) =>
            !control.closest('[aria-hidden="true"]') &&
            !control.matches('input[type="hidden"]') &&
            (!control.matches('[role="group"]') ||
              !control.closest('.MuiPickersInputBase-root') ||
              !!control.id),
        );
        const scenario = `${kind}/${placement}/${source}`;
        const name = fieldNameReference({
          visible: [],
          ariaLabel,
          title,
          key: 'field',
        });
        expect.soft(controls.length, scenario).toBeGreaterThan(0);
        for (const control of controls)
          expect.soft(computeAccessibleName(control), scenario).toBe(name);
        observed.add(scenario);
        placementClasses.add(placement);
        sourceClasses.add(source);
        view.unmount();
      }
  }
  expect(new Set([...observed].map((row) => row.split('/')[0]))).toEqual(
    new Set(entries.map(({ Component }) => Component.name)),
  );
  expect(observed.size).toBe(
    entries.length * (pr ? 1 : placements.length * sources.length),
  );
  expect(placementClasses).toEqual(new Set(placements));
  expect(sourceClasses).toEqual(new Set(sources));
}, 120000);
