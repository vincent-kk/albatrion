import React, { useState } from 'react';

import type { Meta, StoryFn } from '@storybook/react-vite';

import {
  Form,
  type JsonSchemaError,
  registerPlugin,
} from '@canard/schema-form';
import { plugin as ajv8Plugin } from '@canard/schema-form-ajv8-plugin';

import { FormTypeInputArrayDefinition } from '../src/formTypeInputs/FormTypeInputArray';
import { FormTypeInputBooleanDefinition } from '../src/formTypeInputs/FormTypeInputBoolean';
import { FormTypeInputBooleanSwitchDefinition } from '../src/formTypeInputs/FormTypeInputBooleanSwitch';
import { FormTypeInputNumberDefinition } from '../src/formTypeInputs/FormTypeInputNumber';
import { FormTypeInputRadioGroupDefinition } from '../src/formTypeInputs/FormTypeInputRadioGroup';
import { FormTypeInputSliderDefinition } from '../src/formTypeInputs/FormTypeInputSlider';
import { FormTypeInputStringDefinition } from '../src/formTypeInputs/FormTypeInputString';
import { FormTypeInputStringCheckboxDefinition } from '../src/formTypeInputs/FormTypeInputStringCheckbox';
import { FormTypeInputStringSwitchDefinition } from '../src/formTypeInputs/FormTypeInputStringSwitch';
import StoryLayout from './components/StoryLayout';

registerPlugin(ajv8Plugin);

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
} as Meta<typeof Form<any, Record<string, unknown>>>;

const Template: StoryFn<typeof Form> = (args) => {
  return <Form {...args} />;
};

export const Boolean = Template.bind({});
Boolean.args = {
  jsonSchema: {
    type: 'boolean',
    FormType: FormTypeInputBooleanDefinition.Component,
  },
};

export const BooleanSwitch = Template.bind({});
BooleanSwitch.args = {
  jsonSchema: {
    type: 'boolean',
    FormType: FormTypeInputBooleanSwitchDefinition.Component,
  },
};

export const String = Template.bind({});
String.args = {
  jsonSchema: {
    type: 'string',
    FormType: FormTypeInputStringDefinition.Component,
  },
};

export const Password = Template.bind({});
Password.args = {
  jsonSchema: {
    type: 'string',
    format: 'password',
    FormType: FormTypeInputStringDefinition.Component,
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
    FormType: FormTypeInputStringCheckboxDefinition.Component,
  },
};

export const StringRadio = Template.bind({});
StringRadio.args = {
  jsonSchema: {
    type: 'string',
    enum: ['a', 'b', 'c'],
    FormType: FormTypeInputRadioGroupDefinition.Component,
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
    FormType: FormTypeInputStringSwitchDefinition.Component,
    options: {
      alias: {
        on: 'alias on',
        off: 'alias off',
      },
    },
  },
};

export const Number = Template.bind({});
Number.args = {
  jsonSchema: {
    type: 'number',
    multipleOf: 0.1,
    FormType: FormTypeInputNumberDefinition.Component,
  },
};

export const Integer = Template.bind({});
Integer.args = {
  jsonSchema: {
    type: 'integer',
    multipleOf: 3,
    FormType: FormTypeInputNumberDefinition.Component,
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
    FormType: FormTypeInputSliderDefinition.Component,
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
    FormType: FormTypeInputSliderDefinition.Component,
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
      FormType: FormTypeInputStringDefinition.Component,
      default: 'ARRAY_ITEM',
      disabled: true,
    },
    minItems: 3,
    FormType: FormTypeInputArrayDefinition.Component,
  },
};
