import { cleanup, render } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type FieldRendererProps,
  Form,
  type JSONSchema,
} from '@canard/schema-form';

import { plugin } from '../../index';

// Probe for r5-ids: EQ11 and RG3 on the labelId contract of grouped inputs.
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
    level: {
      type: 'number',
      minimum: 0,
      maximum: 10,
      presentation: { inputType: 'slider' },
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

const CustomGroup = ({ Label, Input }: FieldRendererProps) => (
  <div>
    <Label />
    <Input />
  </div>
);

describe('antd5: grouped inputs take the title that Form.Label renders', () => {
  it('control: the plugin FieldRenderer names the radio group "plan"', () => {
    const { container } = render(<Form jsonSchema={schema} {...pluginProps} />);
    expect(groupNames(container, 'input[type="radio"]')).toContain('plan');
  });

  it('Form.Label + Form.Input: the radio group is named "plan"', () => {
    const { container } = render(
      <Form jsonSchema={schema} {...pluginProps}>
        <Form.Label path="/plan" />
        <Form.Input path="/plan" />
      </Form>,
    );
    expect(duplicateIds(container)).toEqual([]);
    expect(groupNames(container, 'input[type="radio"]')).toContain('plan');
  });

  it('Form.Label + Form.Input: the checkbox group is named "tags"', () => {
    const { container } = render(
      <Form jsonSchema={schema} {...pluginProps}>
        <Form.Label path="/tags" />
        <Form.Input path="/tags" />
      </Form>,
    );
    expect(groupNames(container, 'input[type="checkbox"]')).toContain('tags');
  });

  it('control: the plugin FieldRenderer names the slider handle "level"', () => {
    const { container } = render(
      <Form jsonSchema={schema} defaultValue={{ level: 5 }} {...pluginProps} />,
    );
    const handle = container.querySelector('[role="slider"]')!;
    expect(computeAccessibleName(handle)).toBe('level');
  });

  it('Form.Label + Form.Input: the slider handle is named "level"', () => {
    const { container } = render(
      <Form jsonSchema={schema} defaultValue={{ level: 5 }} {...pluginProps}>
        <Form.Label path="/level" />
        <Form.Input path="/level" />
      </Form>,
    );
    const handle = container.querySelector('[role="slider"]')!;
    expect(computeAccessibleName(handle)).toBe('level');
  });

  it('custom FieldRenderer with the bound Label: the radio group is named "plan"', () => {
    const { container } = render(
      <Form jsonSchema={schema} {...pluginProps} FieldRenderer={CustomGroup} />,
    );
    expect(groupNames(container, 'input[type="radio"]')).toContain('plan');
  });

  it.each([
    ['plugin FieldRenderer', false],
    ['Form.Label + Form.Input', true],
  ])('%s: both date range inputs are named "period"', (_layout, custom) => {
    const rangeSchema: JSONSchema = {
      type: 'object',
      properties: {
        period: {
          type: 'array',
          format: 'date-range',
          items: { type: 'string', format: 'date' },
          minItems: 2,
          maxItems: 2,
        },
      },
    };
    const { container } = render(
      custom ? (
        <Form jsonSchema={rangeSchema} {...pluginProps}>
          <Form.Label path="/period" />
          <Form.Input path="/period" />
        </Form>
      ) : (
        <Form jsonSchema={rangeSchema} {...pluginProps} />
      ),
    );
    const inputs = Array.from(container.querySelectorAll('input'));
    expect(inputs.map((input) => computeAccessibleName(input))).toEqual([
      expect.stringContaining('period'),
      expect.stringContaining('period'),
    ]);
  });

  it('control: the core built-in radio in the same layout is named "plan"', () => {
    const { container } = render(
      <Form jsonSchema={schema}>
        <Form.Label path="/plan" />
        <Form.Input path="/plan" />
      </Form>,
    );
    expect(groupNames(container, 'input[type="radio"]')).toContain('plan');
  });
});
