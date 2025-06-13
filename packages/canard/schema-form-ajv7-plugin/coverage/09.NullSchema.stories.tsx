import { useState } from 'react';

import {
  Form,
  type JsonSchema,
  type JsonSchemaError,
  registerPlugin,
} from '@canard/schema-form';

import { plugin } from '../src';
import StoryLayout from './components/StoryLayout';

registerPlugin(plugin);

export default {
  title: 'Form/09. NullSchema',
};

export const NullSchema = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      string: {
        type: 'string',
      },
      null: {
        type: 'null',
        nullable: true,
        FormType: ({ value, onChange }) => {
          return (
            <div>
              this is {JSON.stringify(value, null, 2)}
              <div>
                <button onClick={() => onChange(undefined)}>unset</button>
                <button onClick={() => onChange(null)}>set null</button>
              </div>
            </div>
          );
        },
      },
      defaultNull: {
        type: 'null',
        nullable: true,
        default: null,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={{ null: null }}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};
