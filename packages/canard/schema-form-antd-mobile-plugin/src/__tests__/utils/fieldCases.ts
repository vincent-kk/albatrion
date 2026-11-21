import type { JSONSchema } from '@canard/schema-form';

type Classification = {
  kind: 'primary' | 'range-end' | 'auxiliary';
  selector: string;
};
type InputCase = {
  choiceGroup?: boolean;
  schema: JSONSchema;
  primary: string;
  controls: Classification[];
};
const single: Classification[] = [
  {
    kind: 'primary',
    selector:
      'input:not([type="hidden"]),textarea,select,[role="combobox"],[role="switch"],[role="slider"]',
  },
  { kind: 'auxiliary', selector: 'button' },
];
const group: Classification[] = [
  {
    kind: 'auxiliary',
    selector: 'input,button,[role="checkbox"],[role="radio"]',
  },
];
export const fieldCases: Record<string, InputCase> = {
  FieldInputBooleanSwitch: {
    schema: { type: 'boolean', presentation: { inputType: 'switch' } },
    primary: '[role="switch"]',
    controls: single,
  },
  FieldInputStringSwitch: {
    schema: {
      type: 'string',
      enum: ['on', 'off'],
      presentation: { inputType: 'switch' },
    },
    primary: '[role="switch"]',
    controls: single,
  },
  FieldInputStringCheckbox: {
    choiceGroup: true,
    schema: {
      type: 'array',
      items: { type: 'string', enum: ['one', 'two'] },
      presentation: { inputType: 'checkbox' },
    },
    primary: '[role="group"],fieldset',
    controls: group,
  },
  FieldInputRadioGroup: {
    choiceGroup: true,
    schema: {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radio' },
    },
    primary: '[role="radiogroup"]',
    controls: group,
  },
  FieldInputStringEnum: {
    schema: { type: 'string', enum: ['one', 'two'] },
    primary: '[role="combobox"]',
    controls: single,
  },
  FieldInputUri: {
    schema: { type: 'string', format: 'uri' },
    primary: 'input:not([type="hidden"]):not([role="combobox"])',
    controls: [
      { kind: 'auxiliary', selector: '[role="combobox"],button' },
      { kind: 'primary', selector: 'input:not([type="hidden"])' },
    ],
  },
  FieldInputMonth: {
    schema: { type: 'string', format: 'month' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputDate: {
    schema: { type: 'string', format: 'date' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputTime: {
    schema: { type: 'string', format: 'time' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputMonthRange: {
    schema: {
      type: 'array',
      format: 'month-range',
      items: { type: 'string', format: 'month' },
      minItems: 2,
      maxItems: 2,
    },
    primary: 'input',
    controls: [{ kind: 'range-end', selector: 'input' }],
  },
  FieldInputDateRange: {
    schema: {
      type: 'array',
      format: 'date-range',
      items: { type: 'string', format: 'date' },
      minItems: 2,
      maxItems: 2,
    },
    primary: 'input',
    controls: [{ kind: 'range-end', selector: 'input' }],
  },
  FieldInputTimeRange: {
    schema: {
      type: 'array',
      format: 'time-range',
      items: { type: 'string', format: 'time' },
      minItems: 2,
      maxItems: 2,
    },
    primary: 'input',
    controls: [{ kind: 'range-end', selector: 'input' }],
  },
  FieldInputArray: {
    schema: { type: 'array', items: { type: 'string' } },
    primary: 'fieldset,[role="group"]',
    controls: [{ kind: 'auxiliary', selector: 'button,input' }],
  },
  FieldInputSlider: {
    schema: {
      type: 'number',
      format: 'slider',
      minimum: 0,
      maximum: 10,
      presentation: { inputType: 'slider' },
    },
    primary: '[role="slider"],input[type="range"]',
    controls: single,
  },
  FieldInputTextarea: {
    schema: { type: 'string', format: 'textarea' },
    primary: 'textarea',
    controls: single,
  },
  FieldInputString: {
    schema: { type: 'string' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputNumber: {
    schema: { type: 'number' },
    primary: 'input:not([type="hidden"])',
    controls: single,
  },
  FieldInputBoolean: {
    schema: { type: 'boolean' },
    primary: 'input[type="checkbox"],[role="checkbox"]',
    controls: single,
  },
};
