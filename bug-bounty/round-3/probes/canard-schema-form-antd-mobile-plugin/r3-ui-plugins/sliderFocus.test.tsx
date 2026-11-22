import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../../fieldInputs/FieldInputSlider';
import { FieldInputStringDefinition } from '../../fieldInputs/FieldInputString';

afterEach(cleanup);

describe('focus(path) on a slider (antd-mobile)', () => {
  it('focus(path) reaches the slider thumb', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        jsonSchema={{
          type: 'object',
          properties: {
            level: {
              type: 'number',
              format: 'slider',
              minimum: 0,
              maximum: 10,
            },
          },
        }}
        onError={() => {}}
      />,
    );
    await act(async () => {
      ref.current!.focus('/level');
    });
    await act(async () => {});
    const thumb = container.querySelector('[role="slider"]');
    expect(thumb).not.toBeNull();
    expect(document.activeElement).toBe(thumb);
  });

  it('control: focus(path) reaches a text input in the same plugin', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[FieldInputStringDefinition]}
        jsonSchema={{
          type: 'object',
          properties: { name: { type: 'string' } },
        }}
        onError={() => {}}
      />,
    );
    await act(async () => {
      ref.current!.focus('/name');
    });
    await act(async () => {});
    expect(document.activeElement).toBe(container.querySelector('input'));
  });
});

describe('slider label association (antd-mobile)', () => {
  it('the field label names the slider thumb', () => {
    const { container } = render(
      <Form
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        jsonSchema={{
          type: 'object',
          properties: {
            level: { type: 'number', format: 'slider', minimum: 0, maximum: 10 },
          },
        }}
        onError={() => {}}
      />,
    );
    const label = container.querySelector('label');
    const thumb = container.querySelector('[role="slider"]')!;
    const labelTarget = label?.htmlFor
      ? document.getElementById(label.htmlFor)
      : null;
    const labelledBy = thumb.getAttribute('aria-labelledby');
    const ariaLabel = thumb.getAttribute('aria-label');
    const namedByField =
      labelTarget === thumb ||
      (!!labelledBy && labelledBy === label?.id) ||
      ariaLabel === 'level';
    expect({ namedByField, ariaLabel, labelFor: label?.htmlFor }).toEqual({
      namedByField: true,
      ariaLabel: 'level',
      labelFor: '/level',
    });
  });
});
