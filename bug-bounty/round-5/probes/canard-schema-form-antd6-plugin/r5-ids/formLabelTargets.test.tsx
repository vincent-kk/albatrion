import { cleanup, render } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

// Probe for r5-ids: EQ11 and RG3, Form.Label + Form.Input for every single-control input.
// Verification level: public API (@canard/schema-form dist, plugin source).

const PLUGIN_NAME = 'antd6';

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

const pluginProps = {
  fieldInputDefinitions: plugin.fieldInputDefinitions,
  FieldRenderer: plugin.FieldRenderer,
  LabelRenderer: plugin.LabelRenderer,
  ErrorMessageRenderer: plugin.ErrorMessageRenderer,
};

/** Where the Form.Label points, and whether that element is the field's focusable control. */
const describeTarget = (container: HTMLElement) => {
  const label = container.querySelector('label[for]');
  if (!label) return 'no label[for]';
  const target = document.getElementById(label.getAttribute('for')!);
  if (!target) return 'dangling for';
  const hidden =
    target.closest('[aria-hidden="true"]') !== null ||
    (target as HTMLInputElement).type === 'hidden';
  const focusable = target.tabIndex >= 0 && !hidden;
  return {
    tag: target.tagName.toLowerCase(),
    focusable,
    named: computeAccessibleName(target).includes('field'),
  };
};

describe(`${PLUGIN_NAME}: Form.Label targets the focusable control of a single-control input`, () => {
  it.each<[string, JSONSchema, unknown]>([
    ['text', { type: 'string' }, 'x'],
    ['number', { type: 'number' }, 1],
    ['boolean', { type: 'boolean' }, true],
    ['enum select', { type: 'string', enum: ['a', 'b'] }, 'a'],
    ['date', { type: 'string', format: 'date' }, '2024-01-02'],
    ['time', { type: 'string', format: 'time' }, '12:30:00Z'],
    ['month', { type: 'string', format: 'month' }, '2024-01'],
    ['uri', { type: 'string', format: 'uri' }, 'https://a.b'],
    [
      'string switch',
      { type: 'string', enum: ['on', 'off'], presentation: { inputType: 'switch' } },
      'on',
    ],
    ['boolean switch', { type: 'boolean', presentation: { inputType: 'switch' } }, true],
    [
      'multiple enum select',
      { type: 'array', items: { type: 'string', enum: ['a', 'b'] } },
      ['a'],
    ],
  ])('%s', (_kind, field, value) => {
    const { container } = render(
      <Form
        jsonSchema={{ type: 'object', properties: { field } }}
        defaultValue={{ field: value }}
        {...pluginProps}
      >
        <Form.Label path="/field" />
        <Form.Input path="/field" />
      </Form>,
    );
    expect(describeTarget(container)).toEqual(
      expect.objectContaining({ focusable: true, named: true }),
    );
  });
});
