import React, { useState } from 'react';

import { Meta, StoryFn } from '@storybook/react';

import { Form, type JsonSchemaError } from '@lumy-pack/schema-form/src';
import { FormTypeInputArray } from '@lumy-pack/schema-form/src/formTypeDefinitions/FormTypeInputArray';
import { FormTypeInputBoolean } from '@lumy-pack/schema-form/src/formTypeDefinitions/FormTypeInputBoolean';
import { FormTypeInputDateFormant } from '@lumy-pack/schema-form/src/formTypeDefinitions/FormTypeInputDateFormant';
import { FormTypeInputNumber } from '@lumy-pack/schema-form/src/formTypeDefinitions/FormTypeInputNumber';
import { FormTypeInputObject } from '@lumy-pack/schema-form/src/formTypeDefinitions/FormTypeInputObject';
import { FormTypeInputString } from '@lumy-pack/schema-form/src/formTypeDefinitions/FormTypeInputString';
import { FormTypeInputStringCheckbox } from '@lumy-pack/schema-form/src/formTypeDefinitions/FormTypeInputStringCheckbox';
import { FormTypeInputStringEnum } from '@lumy-pack/schema-form/src/formTypeDefinitions/FormTypeInputStringEnum';
import { FormTypeInputStringRadio } from '@lumy-pack/schema-form/src/formTypeDefinitions/FormTypeInputStringRadio';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Sub Components/FormTypeInput',
  component: Form,
  decorators: [
    (Story, context) => {
      const [value, setValue] = useState<Record<string, unknown>>({});
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
    formType: FormTypeInputBoolean,
  },
};

export const String = Template.bind({});
String.args = {
  jsonSchema: {
    type: 'string',
    formType: FormTypeInputString,
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
    formType: FormTypeInputStringCheckbox,
  },
};

export const StringRadio = Template.bind({});
StringRadio.args = {
  jsonSchema: {
    type: 'string',
    enum: ['a', 'b', 'c'],
    formType: FormTypeInputStringRadio,
  },
};

export const StringEnum = Template.bind({});
StringEnum.args = {
  jsonSchema: {
    type: 'string',
    enum: ['', 'a', 'b', 'c'],
    formType: FormTypeInputStringEnum,
  },
};

export const DateTimeFormat = Template.bind({});
DateTimeFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'datetime-local',
    formType: FormTypeInputDateFormant,
  },
};

export const TimeFormat = Template.bind({});
TimeFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'time',
    formType: FormTypeInputDateFormant,
  },
};

export const DateFormat = Template.bind({});
DateFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'date',
    formType: FormTypeInputDateFormant,
  },
};

export const WeekFormat = Template.bind({});
WeekFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'week',
    formType: FormTypeInputDateFormant,
  },
};

export const MonthFormat = Template.bind({});
MonthFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'month',
    formType: FormTypeInputDateFormant,
  },
};

export const Number = Template.bind({});
Number.args = {
  jsonSchema: {
    type: 'number',
    formType: FormTypeInputNumber,
  },
};

export const Array = Template.bind({});
Array.args = {
  jsonSchema: {
    type: 'array',
    items: {
      type: 'string',
      formType: FormTypeInputString,
      default: 'ARRAY_ITEM',
      disabled: true,
    },
    minItems: 3,
    formType: FormTypeInputArray,
  },
};

export const Object = Template.bind({});
Object.args = {
  jsonSchema: {
    type: 'object',
    formType: FormTypeInputObject,
    properties: {
      a: {
        type: 'boolean',
        formType: FormTypeInputBoolean,
      },
      b: {
        type: 'string',
        formType: FormTypeInputString,
      },
      c: {
        type: 'number',
        formType: FormTypeInputNumber,
      },
    },
  },
};
