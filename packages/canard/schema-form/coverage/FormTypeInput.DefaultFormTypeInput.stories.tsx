import { useState } from 'react';

import type { Meta, StoryFn } from '@storybook/react-vite';

import { Form, type JsonSchemaError } from '../src';
import { FormTypeInputArrayDefinition } from '../src/formTypeDefinitions/FormTypeInputArray';
import { FormTypeInputBooleanDefinition } from '../src/formTypeDefinitions/FormTypeInputBoolean';
import { FormTypeInputDateFormatDefinition } from '../src/formTypeDefinitions/FormTypeInputDateFormat';
import { FormTypeInputNumberDefinition } from '../src/formTypeDefinitions/FormTypeInputNumber';
import { FormTypeInputObjectDefinition } from '../src/formTypeDefinitions/FormTypeInputObject';
import { FormTypeInputStringDefinition } from '../src/formTypeDefinitions/FormTypeInputString';
import { FormTypeInputStringCheckboxDefinition } from '../src/formTypeDefinitions/FormTypeInputStringCheckbox';
import { FormTypeInputStringEnumDefinition } from '../src/formTypeDefinitions/FormTypeInputStringEnum';
import { FormTypeInputStringRadioDefinition } from '../src/formTypeDefinitions/FormTypeInputStringRadio';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Sub Components/FormTypeInput',
  component: Form,
  decorators: [
    (Story, context) => {
      const [value, setValue] = useState<any>();
      const [errors, setErrors] = useState<JsonSchemaError[]>([]);
      return (
        <StoryLayout
          jsonSchema={context.args.jsonSchema}
          value={value}
          errors={errors}
        >
          <Story
            args={{
              ...context.args,
              onChange: setValue,
              onValidate: setErrors,
            }}
          />
        </StoryLayout>
      );
    },
  ],
  argTypes: {
    jsonSchema: { control: 'object' }, // 컨트롤 패널에서 JSON 스키마 편집 가능
  },
} as Meta<typeof Form>;

const Template: StoryFn<typeof Form> = (args) => {
  return <Form {...args} />;
};

export const Boolean = Template.bind({});
Boolean.args = {
  jsonSchema: {
    type: 'boolean',
    FormTypeInput: FormTypeInputBooleanDefinition.Component,
  },
};

export const String = Template.bind({});
String.args = {
  jsonSchema: {
    type: 'string',
    FormTypeInput: FormTypeInputStringDefinition.Component,
  },
};

export const StringCheckbox = Template.bind({});
StringCheckbox.args = {
  jsonSchema: {
    type: 'array',
    items: {
      type: 'string',
      enum: ['a', 'b', 'c'],
    },
    FormTypeInput: FormTypeInputStringCheckboxDefinition.Component,
  },
};

export const StringRadio = Template.bind({});
StringRadio.args = {
  jsonSchema: {
    type: 'string',
    enum: ['a', 'b', 'c'],
    FormTypeInput: FormTypeInputStringRadioDefinition.Component,
  },
};

export const StringEnum = Template.bind({});
StringEnum.args = {
  jsonSchema: {
    type: 'string',
    enum: ['', 'a', 'b', 'c'],
    FormTypeInput: FormTypeInputStringEnumDefinition.Component,
  },
};

export const DateTimeFormat = Template.bind({});
DateTimeFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'datetime-local',
    FormTypeInput: FormTypeInputDateFormatDefinition.Component,
  },
};

export const TimeFormat = Template.bind({});
TimeFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'time',
    FormTypeInput: FormTypeInputDateFormatDefinition.Component,
  },
};

export const DateFormat = Template.bind({});
DateFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'date',
    FormTypeInput: FormTypeInputDateFormatDefinition.Component,
  },
};

export const WeekFormat = Template.bind({});
WeekFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'week',
    FormTypeInput: FormTypeInputDateFormatDefinition.Component,
  },
};

export const MonthFormat = Template.bind({});
MonthFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'month',
    FormTypeInput: FormTypeInputDateFormatDefinition.Component,
  },
};

export const Number = Template.bind({});
Number.args = {
  jsonSchema: {
    type: 'number',
    FormTypeInput: FormTypeInputNumberDefinition.Component,
  },
};

export const Array = Template.bind({});
Array.args = {
  jsonSchema: {
    type: 'array',
    items: {
      type: 'string',
      FormTypeInput: FormTypeInputStringDefinition.Component,
      default: 'ARRAY_ITEM',
      disabled: true,
    },
    minItems: 3,
    FormTypeInput: FormTypeInputArrayDefinition.Component,
  },
};

export const Object = Template.bind({});
Object.args = {
  jsonSchema: {
    type: 'object',
    FormTypeInput: FormTypeInputObjectDefinition.Component,
    properties: {
      a: {
        type: 'boolean',
        FormTypeInput: FormTypeInputBooleanDefinition.Component,
      },
      b: {
        type: 'string',
        FormTypeInput: FormTypeInputStringDefinition.Component,
      },
      c: {
        type: 'number',
        FormTypeInput: FormTypeInputNumberDefinition.Component,
      },
    },
  },
};
