import React from 'react';
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import InputShowcase from '../InputShowcase';

registerPlugin(plugin);

const sections = [
  {
    title: 'Text Inputs',
    items: [
      {
        name: 'FormTypeInputString',
        trigger: 'type: "string"',
        schema: { type: 'string', title: 'Text Input' },
      },
      {
        name: 'FormTypeInputTextarea',
        trigger: 'format: "textarea"',
        schema: { type: 'string', title: 'Textarea', format: 'textarea' },
      },
      {
        name: 'FormTypeInputUri',
        trigger: 'format: "uri"',
        schema: { type: 'string', title: 'Website URL', format: 'uri' },
      },
    ],
  },
  {
    title: 'Numbers',
    items: [
      {
        name: 'FormTypeInputNumber',
        trigger: 'type: "number" | "integer"',
        schema: { type: 'number', title: 'Number' },
      },
      {
        name: 'FormTypeInputSlider',
        trigger: 'formType: "slider"',
        schema: {
          type: 'number',
          title: 'Slider',
          formType: 'slider',
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
        name: 'FormTypeInputBoolean',
        trigger: 'type: "boolean"',
        schema: { type: 'boolean', title: 'Checkbox' },
      },
      {
        name: 'FormTypeInputBooleanSwitch',
        trigger: 'type: "boolean", formType: "switch"',
        schema: { type: 'boolean', title: 'Switch', formType: 'switch' },
      },
      {
        name: 'FormTypeInputStringSwitch',
        trigger: 'type: "string", formType: "switch", enum (2 values)',
        schema: {
          type: 'string',
          title: 'Toggle',
          formType: 'switch',
          enum: ['ON', 'OFF'],
        },
      },
    ],
  },
  {
    title: 'Selections',
    items: [
      {
        name: 'FormTypeInputStringEnum',
        trigger: 'type: "string", enum',
        schema: {
          type: 'string',
          title: 'Select',
          enum: ['Option A', 'Option B', 'Option C'],
        },
      },
      {
        name: 'FormTypeInputRadioGroup',
        trigger: 'formType: "radio", enum',
        schema: {
          type: 'string',
          title: 'Radio Group',
          formType: 'radio',
          enum: ['Small', 'Medium', 'Large'],
        },
      },
      {
        name: 'FormTypeInputStringCheckbox',
        trigger: 'type: "array", formType: "checkbox", items.enum',
        schema: {
          type: 'array',
          title: 'Checkbox Group',
          formType: 'checkbox',
          items: {
            type: 'string',
            enum: ['React', 'Vue', 'Angular', 'Svelte'],
          },
        },
      },
    ],
  },
  {
    title: 'Date & Time',
    items: [
      {
        name: 'FormTypeInputDate',
        trigger: 'format: "date"',
        schema: { type: 'string', title: 'Date', format: 'date' },
      },
      {
        name: 'FormTypeInputTime',
        trigger: 'format: "time"',
        schema: { type: 'string', title: 'Time', format: 'time' },
      },
      {
        name: 'FormTypeInputMonth',
        trigger: 'format: "month"',
        schema: { type: 'string', title: 'Month', format: 'month' },
      },
    ],
  },
  {
    title: 'Collections',
    items: [
      {
        name: 'FormTypeInputArray',
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

export default function MuiCatalogDemo() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        {sections.map(section => (
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
            {section.items.map(item => (
              <InputShowcase key={item.name} {...item} />
            ))}
          </div>
        ))}
      </div>
    </LocalizationProvider>
  );
}
