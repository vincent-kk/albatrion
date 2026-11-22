import { cleanup, render } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type FieldRendererProps,
  Form,
  type JSONSchema,
} from '@canard/schema-form';

import { plugin } from '../../index';

// Probe for r5-ids: EQ11, IN3 and RG3 on the labelId contract of grouped inputs.
// Verification level: public API (@canard/schema-form dist, plugin source).

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const schema: JSONSchema = {
  type: 'object',
  properties: {
    plan: {
      type: 'string',
      enum: ['free', 'pro'],
      presentation: { inputType: 'radio' },
    },
    tags: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
  },
};

const pluginProps = {
  fieldInputDefinitions: plugin.fieldInputDefinitions,
  FieldRenderer: plugin.FieldRenderer,
  LabelRenderer: plugin.LabelRenderer,
  ErrorMessageRenderer: plugin.ErrorMessageRenderer,
};

/** Accessible names of the group ancestors of the first element matching selector. */
const groupNames = (container: HTMLElement, selector: string) => {
  const first = container.querySelector(selector);
  if (!first) throw new Error('no element for ' + selector);
  const names: string[] = [];
  for (
    let element = first.parentElement;
    element && element !== container;
    element = element.parentElement
  ) {
    const role =
      element.getAttribute('role') ??
      (element.tagName === 'FIELDSET' ? 'group' : null);
    if (role === 'radiogroup' || role === 'group')
      names.push(computeAccessibleName(element));
  }
  return names.filter(Boolean);
};

const duplicateIds = (container: HTMLElement) => {
  const ids = Array.from(container.querySelectorAll('[id]'), (e) => e.id);
  return ids.filter((id, index) => ids.indexOf(id) !== index);
};

/** The composite group renderer that field-input.md teaches for group titles. */
const ChoiceGroup = ({ labelId, Input }: FieldRendererProps) => (
  <fieldset aria-labelledby={labelId}>
    <legend id={labelId}>Choice</legend>
    <Input />
  </fieldset>
);

describe('MUI: grouped inputs and the title that Form.Label renders', () => {
  it('control: the plugin FieldRenderer keeps every id unique', () => {
    const { container } = render(<Form jsonSchema={schema} {...pluginProps} />);
    expect(duplicateIds(container)).toEqual([]);
  });

  it('Form.Label + Form.Input of a radio group keep every id unique', () => {
    const { container } = render(
      <Form jsonSchema={schema} {...pluginProps}>
        <Form.Label path="/plan" />
        <Form.Input path="/plan" />
      </Form>,
    );
    expect(duplicateIds(container)).toEqual([]);
  });

  it('Form.Label + Form.Input of a checkbox group keep every id unique', () => {
    const { container } = render(
      <Form jsonSchema={schema} {...pluginProps}>
        <Form.Label path="/tags" />
        <Form.Input path="/tags" />
      </Form>,
    );
    expect(duplicateIds(container)).toEqual([]);
  });

  it('the documented composite group renderer keeps every id unique around a MUI radio group', () => {
    const { container } = render(
      <Form
        jsonSchema={{ type: 'object', properties: { plan: schema.properties!.plan } }}
        {...pluginProps}
        FieldRenderer={ChoiceGroup}
      />,
    );
    expect(duplicateIds(container)).toEqual([]);
  });

  it('Form.Label + Form.Input hideLabel of a radio group keep every id unique', () => {
    const { container } = render(
      <Form jsonSchema={schema} {...pluginProps}>
        <Form.Label path="/plan" />
        <Form.Input path="/plan" hideLabel />
      </Form>,
    );
    expect(duplicateIds(container)).toEqual([]);
  });

  it('Form.Label + Form.Input hideLabel: the radio group is named "plan"', () => {
    const { container } = render(
      <Form jsonSchema={schema} {...pluginProps}>
        <Form.Label path="/plan" />
        <Form.Input path="/plan" hideLabel />
      </Form>,
    );
    expect(groupNames(container, 'input[type="radio"]')).toContain('plan');
  });

  it('Form.Label + Form.Input hideLabel: the checkbox group is named "tags"', () => {
    const { container } = render(
      <Form jsonSchema={schema} {...pluginProps}>
        <Form.Label path="/tags" />
        <Form.Input path="/tags" hideLabel />
      </Form>,
    );
    expect(groupNames(container, 'input[type="checkbox"]')).toContain('tags');
  });

  it('Form.Label + Form.Input hideLabel: the enum select combobox is named "choice"', () => {
    const { container } = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: { choice: { type: 'string', enum: ['a', 'b'] } },
        }}
        {...pluginProps}
      >
        <Form.Label path="/choice" />
        <Form.Input path="/choice" hideLabel />
      </Form>,
    );
    const combobox = container.querySelector('[role="combobox"]')!;
    expect(computeAccessibleName(combobox)).toContain('choice');
  });

  it('control: the plugin renderer names the date field and the enum combobox', () => {
    const { container } = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            day: { type: 'string', format: 'date' },
            choice: { type: 'string', enum: ['a', 'b'] },
          },
        }}
        defaultValue={{ day: '2024-01-02' }}
        {...pluginProps}
      />,
    );
    const spin = container.querySelector('[role="spinbutton"]')!.closest('[role="group"]')!;
    const combobox = container.querySelector('[role="combobox"]')!;
    expect([
      computeAccessibleName(spin),
      computeAccessibleName(combobox),
    ]).toEqual([expect.stringContaining('day'), expect.stringContaining('choice')]);
  });

  it('Form.Label + Form.Input hideLabel: the date field is named "day"', () => {
    const { container } = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: { day: { type: 'string', format: 'date' } },
        }}
        defaultValue={{ day: '2024-01-02' }}
        {...pluginProps}
      >
        <Form.Label path="/day" />
        <Form.Input path="/day" hideLabel />
      </Form>,
    );
    const sections = container.querySelector('[role="spinbutton"]')!.closest('[role="group"]')!;
    expect(computeAccessibleName(sections)).toContain('day');
  });

  it('control: the core built-in radio with Form.Label keeps ids unique and is named', () => {
    const { container } = render(
      <Form jsonSchema={schema}>
        <Form.Label path="/plan" />
        <Form.Input path="/plan" />
      </Form>,
    );
    expect(duplicateIds(container)).toEqual([]);
    expect(groupNames(container, 'input[type="radio"]')).toContain('plan');
  });
});
