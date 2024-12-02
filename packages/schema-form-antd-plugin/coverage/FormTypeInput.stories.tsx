import React, { useState } from 'react';

import type { Meta, StoryFn } from '@storybook/react';

import { Form, type JsonSchemaError } from '@lumy-pack/schema-form';

import { FormTypeInputArrayDefinition } from '../src/formTypeInputs/FormTypeInputArray';
import { FormTypeInputBooleanDefinition } from '../src/formTypeInputs/FormTypeInputBoolean';
import { FormTypeInputDateDefinition } from '../src/formTypeInputs/FormTypeInputDate';
import { FormTypeInputNumberDefinition } from '../src/formTypeInputs/FormTypeInputNumber';
import { FormTypeInputStringDefinition } from '../src/formTypeInputs/FormTypeInputString';
import { FormTypeInputUriDefinition } from '../src/formTypeInputs/FormTypeInputUri';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Components/FormTypeInput',
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
    formType: FormTypeInputBooleanDefinition.Component,
  },
};

export const String = Template.bind({});
String.args = {
  jsonSchema: {
    type: 'string',
    formType: FormTypeInputStringDefinition.Component,
  },
};

export const Password = Template.bind({});
Password.args = {
  jsonSchema: {
    type: 'string',
    format: 'password',
    formType: FormTypeInputStringDefinition.Component,
  },
};

export const Uri = Template.bind({});
Uri.args = {
  jsonSchema: {
    type: 'string',
    formType: FormTypeInputUriDefinition.Component,
    options: {
      protocols: ['http://', 'https://', 'ftp://', 'mailto:'],
    },
  },
};

// export const StringCheckbox = Template.bind({});
// StringCheckbox.args = {
//   jsonSchema: {
//     type: 'array',
//     items: {
//       type: 'string',
//       enum: ['a', 'b', 'c'],
//     },
//     formType: FormTypeInputStringCheckbox,
//   },
// };

// export const StringRadio = Template.bind({});
// StringRadio.args = {
//   jsonSchema: {
//     type: 'string',
//     enum: ['a', 'b', 'c'],
//     formType: FormTypeInputStringRadio,
//   },
// };

// export const StringEnum = Template.bind({});
// StringEnum.args = {
//   jsonSchema: {
//     type: 'string',
//     enum: ['', 'a', 'b', 'c'],
//     formType: FormTypeInputStringEnum,
//   },
// };

// export const DateTimeFormat = Template.bind({});
// DateTimeFormat.args = {
//   jsonSchema: {
//     type: 'string',
//     format: 'datetime-local',
//     formType: FormTypeInputDateFormant,
//   },
// };

// export const TimeFormat = Template.bind({});
// TimeFormat.args = {
//   jsonSchema: {
//     type: 'string',
//     format: 'time',
//     formType: FormTypeInputDateFormant,
//   },
// };

export const DateFormat = Template.bind({});
DateFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'date',
    formType: FormTypeInputDateDefinition.Component,
  },
};

// export const WeekFormat = Template.bind({});
// WeekFormat.args = {
//   jsonSchema: {
//     type: 'string',
//     format: 'week',
//     formType: FormTypeInputDateFormant,
//   },
// };

// export const MonthFormat = Template.bind({});
// MonthFormat.args = {
//   jsonSchema: {
//     type: 'string',
//     format: 'month',
//     formType: FormTypeInputDateFormant,
//   },
// };

export const Number = Template.bind({});
Number.args = {
  jsonSchema: {
    type: 'number',
    multipleOf: 0.1,
    formType: FormTypeInputNumberDefinition.Component,
  },
};

export const Integer = Template.bind({});
Integer.args = {
  jsonSchema: {
    type: 'integer',
    multipleOf: 3,
    formType: FormTypeInputNumberDefinition.Component,
  },
};

export const Array = Template.bind({});
Array.args = {
  jsonSchema: {
    type: 'array',
    items: {
      type: 'string',
      formType: FormTypeInputStringDefinition.Component,
      default: 'ARRAY_ITEM',
      disabled: true,
    },
    minItems: 3,
    formType: FormTypeInputArrayDefinition.Component,
  },
};
