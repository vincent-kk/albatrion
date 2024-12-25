import React, { useMemo, useState } from 'react';

import {
  Form,
  type FormTypeInputDefinition,
  type FormTypeInputProps,
  type JsonSchema,
} from '@canard/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/05. WatchValues',
};

export const Watch = () => {
  const schema = {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'harry' },
          age: { type: 'number', default: 10 },
        },
      },
      greeting: {
        type: 'string',
        formType: 'greeting',
        options: {
          watch: ['$.profile.name', '$.profile.age', '$.profile'],
        },
      },
    },
  } satisfies JsonSchema;
  const formTypes = useMemo<FormTypeInputDefinition[]>(
    () => [
      {
        test: {
          type: 'string',
          formType: 'greeting',
        },
        Component: ({ watchValues }: FormTypeInputProps) => {
          return (
            <>
              <strong>
                hello '{watchValues[0]}', {watchValues[1]} years old
              </strong>
              <pre>{JSON.stringify(watchValues, null, 2)}</pre>
            </>
          );
        },
      },
    ],
    [],
  );
  const [value, setValue] = useState({});
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        jsonSchema={schema}
        formTypeInputDefinitions={formTypes}
        onChange={setValue}
      />
    </StoryLayout>
  );
};
