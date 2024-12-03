import React, { useState } from 'react';

import type { Meta, StoryFn } from '@storybook/react';

import { Form, type JsonSchemaError } from '@lumy-pack/schema-form';

import { FormTypeInputArrayDefinition } from '../src/formTypeInputs/FormTypeInputArray';
import { FormTypeInputBooleanDefinition } from '../src/formTypeInputs/FormTypeInputBoolean';
import { FormTypeInputBooleanSwitchDefinition } from '../src/formTypeInputs/FormTypeInputBooleanSwitch';
import { FormTypeInputDateDefinition } from '../src/formTypeInputs/FormTypeInputDate';
import { FormTypeInputDateRangeDefinition } from '../src/formTypeInputs/FormTypeInputDateRange';
import { FormTypeInputMonthDefinition } from '../src/formTypeInputs/FormTypeInputMonth';
import { FormTypeInputMonthRangeDefinition } from '../src/formTypeInputs/FormTypeInputMonthRange';
import { FormTypeInputNumberDefinition } from '../src/formTypeInputs/FormTypeInputNumber';
import { FormTypeInputRadioGroupDefinition } from '../src/formTypeInputs/FormTypeInputRadioGroup';
import { FormTypeInputSliderDefinition } from '../src/formTypeInputs/FormTypeInputSlider';
import { FormTypeInputStringDefinition } from '../src/formTypeInputs/FormTypeInputString';
import { FormTypeInputStringCheckboxDefinition } from '../src/formTypeInputs/FormTypeInputStringCheckbox';
import { FormTypeInputStringEnumDefinition } from '../src/formTypeInputs/FormTypeInputStringEnum';
import { FormTypeInputStringSwitchDefinition } from '../src/formTypeInputs/FormTypeInputStringSwitch';
import { FormTypeInputTimeDefinition } from '../src/formTypeInputs/FormTypeInputTime';
import { FormTypeInputUriDefinition } from '../src/formTypeInputs/FormTypeInputUri';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'FormTypeInput',
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

export const BooleanSwitch = Template.bind({});
BooleanSwitch.args = {
  jsonSchema: {
    type: 'boolean',
    formType: FormTypeInputBooleanSwitchDefinition.Component,
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

export const StringCheckbox = Template.bind({});
StringCheckbox.args = {
  jsonSchema: {
    type: 'array',
    items: {
      type: 'string',
      enum: ['a', 'b', 'c'],
      options: {
        alias: {
          a: 'alias a',
          b: 'alias b',
          c: 'alias c',
        },
      },
    },
    formType: FormTypeInputStringCheckboxDefinition.Component,
  },
};

export const StringRadio = Template.bind({});
StringRadio.args = {
  jsonSchema: {
    type: 'string',
    enum: ['a', 'b', 'c'],
    formType: FormTypeInputRadioGroupDefinition.Component,
    options: {
      alias: {
        a: 'alias a',
        b: 'alias b',
        c: 'alias c',
      },
    },
  },
};

export const StringEnum = Template.bind({});
StringEnum.args = {
  jsonSchema: {
    type: 'string',
    enum: ['a', 'b', 'c'],
    placeholder: 'select a value',
    formType: FormTypeInputStringEnumDefinition.Component,
    options: {
      alias: {
        a: 'alias a',
        b: 'alias b',
        c: 'alias c',
      },
    },
  },
};

export const StringSwitch = Template.bind({});
StringSwitch.args = {
  jsonSchema: {
    type: 'string',
    enum: ['on', 'off'],
    formType: FormTypeInputStringSwitchDefinition.Component,
    options: {
      alias: {
        on: 'alias on',
        off: 'alias off',
      },
    },
  },
};

export const TimeFormat = Template.bind({});
TimeFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'time',
    formType: FormTypeInputTimeDefinition.Component,
  },
};

export const DateFormat = Template.bind({});
DateFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'date',
    formType: FormTypeInputDateDefinition.Component,
  },
};

export const DateRangeFormat = Template.bind({});
DateRangeFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'date',
    formType: FormTypeInputDateRangeDefinition.Component,
  },
};

export const MonthFormat = Template.bind({});
MonthFormat.args = {
  jsonSchema: {
    type: 'string',
    format: 'month',
    formType: FormTypeInputMonthDefinition.Component,
  },
};

export const MonthRangeFormat = Template.bind({});
MonthRangeFormat.args = {
  jsonSchema: {
    type: 'array',
    items: {
      type: 'string',
    },
    formType: FormTypeInputMonthRangeDefinition.Component,
  },
};

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

export const NumberSliderLazy = Template.bind({});
NumberSliderLazy.args = {
  jsonSchema: {
    type: 'number',
    multipleOf: 1,
    default: 50,
    minimum: 20,
    maximum: 80,
    formType: FormTypeInputSliderDefinition.Component,
  },
};

export const NumberSlider = Template.bind({});
NumberSlider.args = {
  jsonSchema: {
    type: 'number',
    multipleOf: 1,
    default: 50,
    minimum: 20,
    maximum: 80,
    formType: FormTypeInputSliderDefinition.Component,
    options: {
      lazy: false,
    },
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
