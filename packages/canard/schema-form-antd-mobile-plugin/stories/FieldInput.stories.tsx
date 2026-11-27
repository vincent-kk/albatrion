import { useState } from 'react';

import type { Meta, StoryFn } from '@storybook/react-vite';

import {
  Form,
  type ValidationIssue,
  registerPlugin,
} from '@canard/schema-form';
import { plugin as ajv8Plugin } from '@canard/schema-form-ajv8-plugin';

import { FieldInputArrayDefinition } from '../src/fieldInputs/FieldInputArray';
import { FieldInputBooleanDefinition } from '../src/fieldInputs/FieldInputBoolean';
import { FieldInputBooleanSwitchDefinition } from '../src/fieldInputs/FieldInputBooleanSwitch';
import { FieldInputNumberDefinition } from '../src/fieldInputs/FieldInputNumber';
import { FieldInputRadioGroupDefinition } from '../src/fieldInputs/FieldInputRadioGroup';
import { FieldInputSliderDefinition } from '../src/fieldInputs/FieldInputSlider';
import { FieldInputStringDefinition } from '../src/fieldInputs/FieldInputString';
import { FieldInputStringCheckboxDefinition } from '../src/fieldInputs/FieldInputStringCheckbox';
import { FieldInputStringSwitchDefinition } from '../src/fieldInputs/FieldInputStringSwitch';
import StoryLayout from './components/StoryLayout';

registerPlugin(ajv8Plugin);

export default {
  title: 'FieldInput',
  component: Form,
  decorators: [
    (Story, context) => {
      const [value, setValue] = useState<Record<string, unknown>>({});
      const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);
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
    presentation: {
      FieldInput: FieldInputBooleanDefinition.Component,
    },
  },
};

export const BooleanSwitch = Template.bind({});
BooleanSwitch.args = {
  jsonSchema: {
    type: 'boolean',
    presentation: {
      FieldInput: FieldInputBooleanSwitchDefinition.Component,
    },
  },
};

export const String = Template.bind({});
String.args = {
  jsonSchema: {
    type: 'string',
    presentation: {
      FieldInput: FieldInputStringDefinition.Component,
    },
  },
};

export const Password = Template.bind({});
Password.args = {
  jsonSchema: {
    type: 'string',
    format: 'password',
    presentation: {
      FieldInput: FieldInputStringDefinition.Component,
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
      presentation: {
        FieldInputProps: {
          alias: {
            a: 'alias a',
            b: 'alias b',
            c: 'alias c',
          },
        },
      },
    },
    presentation: {
      FieldInput: FieldInputStringCheckboxDefinition.Component,
    },
  },
};

export const StringRadio = Template.bind({});
StringRadio.args = {
  jsonSchema: {
    type: 'string',
    enum: [null, 'a', 'b', 'c'],
    nullable: true,
    presentation: {
      FieldInput: FieldInputRadioGroupDefinition.Component,
      FieldInputProps: {
        alias: {
          a: 'alias a',
          b: 'alias b',
          c: 'alias c',
        },
      },
    },
  },
};

export const StringSwitch = Template.bind({});
StringSwitch.args = {
  jsonSchema: {
    type: 'string',
    enum: ['on', 'off'],
    presentation: {
      FieldInput: FieldInputStringSwitchDefinition.Component,
      FieldInputProps: {
        alias: {
          on: 'alias on',
          off: 'alias off',
        },
      },
    },
  },
};

export const Number = Template.bind({});
Number.args = {
  jsonSchema: {
    type: 'number',
    multipleOf: 0.1,
    presentation: {
      FieldInput: FieldInputNumberDefinition.Component,
    },
  },
};

export const Integer = Template.bind({});
Integer.args = {
  jsonSchema: {
    type: 'integer',
    multipleOf: 3,
    presentation: {
      FieldInput: FieldInputNumberDefinition.Component,
    },
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
    presentation: {
      FieldInput: FieldInputSliderDefinition.Component,
    },
  },
};

export const NumberSlider = Template.bind({});
NumberSlider.args = {
  jsonSchema: {
    type: 'number',
    format: 'slider',
    multipleOf: 1,
    default: 50,
    minimum: 20,
    maximum: 80,
    presentation: {
      FieldInputProps: {
        lazy: false,
      },
    },
  },
  fieldInputDefinitions: [FieldInputSliderDefinition],
};

export const Array = Template.bind({});
Array.args = {
  jsonSchema: {
    type: 'array',
    items: {
      type: 'string',
      default: 'ARRAY_ITEM',
      disabled: true,
      presentation: {
        FieldInput: FieldInputStringDefinition.Component,
      },
    },
    minItems: 3,
    presentation: {
      FieldInput: FieldInputArrayDefinition.Component,
    },
  },
};
