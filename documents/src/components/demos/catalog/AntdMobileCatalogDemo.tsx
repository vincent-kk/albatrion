import React from 'react';

import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

import InputShowcase from '../InputShowcase';

registerPlugin(plugin);

const sections = [
  {
    title: 'Text Inputs',
    items: [
      {
        name: 'FieldInputString',
        trigger: 'type: "string"',
        schema: { type: 'string', title: 'Text Input' },
      },
      {
        name: 'FieldInputTextarea',
        trigger: 'format: "textarea"',
        schema: { type: 'string', title: 'Textarea', format: 'textarea' },
      },
    ],
  },
  {
    title: 'Numbers',
    items: [
      {
        name: 'FieldInputNumber',
        trigger: 'type: "number" | "integer"',
        schema: { type: 'number', title: 'Stepper' },
      },
      {
        name: 'FieldInputSlider',
        trigger: 'format: "slider"',
        schema: {
          type: 'number',
          title: 'Slider',
          format: 'slider',
          minimum: 0,
          maximum: 100,
        },
      },
    ],
  },
  {
    title: 'Booleans',
    items: [
      {
        name: 'FieldInputBoolean',
        trigger: 'type: "boolean"',
        schema: { type: 'boolean', title: 'Checkbox' },
      },
      {
        name: 'FieldInputBooleanSwitch',
        trigger: 'type: "boolean", presentation.inputType: "switch"',
        schema: { type: 'boolean', title: 'Switch', presentation: { inputType: 'switch' } },
      },
      {
        name: 'FieldInputStringSwitch',
        trigger: 'type: "string", presentation.inputType: "switch", enum (2 values)',
        schema: {
          type: 'string',
          title: 'Toggle',
          presentation: { inputType: 'switch' },
          enum: ['ON', 'OFF'],
        },
      },
    ],
  },
  {
    title: 'Selections',
    items: [
      {
        name: 'FieldInputRadioGroup',
        trigger: 'presentation.inputType: "radio", enum',
        schema: {
          type: 'string',
          title: 'Radio Group',
          presentation: { inputType: 'radio' },
          enum: ['Small', 'Medium', 'Large'],
        },
      },
      {
        name: 'FieldInputStringCheckbox',
        trigger: 'type: "array", presentation.inputType: "checkbox", items.enum',
        schema: {
          type: 'array',
          title: 'Checkbox Group',
          presentation: { inputType: 'checkbox' },
          items: {
            type: 'string',
            enum: ['React', 'Vue', 'Angular', 'Svelte'],
          },
        },
      },
    ],
  },
  {
    title: 'Collections',
    items: [
      {
        name: 'FieldInputArray',
        trigger: 'type: "array"',
        schema: {
          type: 'array',
          title: 'Dynamic List',
          items: { type: 'string' },
        },
      },
    ],
  },
];

export default function AntdMobileCatalogDemo() {
  return (
    <div>
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: 32 }}>
          <h4
            style={{
              borderBottom: '1px solid var(--ifm-color-emphasis-200)',
              paddingBottom: 8,
              marginBottom: 16,
            }}
          >
            {section.title}
          </h4>
          {section.items.map((item) => (
            <InputShowcase key={item.name} {...item} />
          ))}
        </div>
      ))}
    </div>
  );
}
