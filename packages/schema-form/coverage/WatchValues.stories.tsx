import React from 'react';

import Form, {
  type FormTypeInputDefinition,
  type FormTypeInputProps,
  type JsonSchema,
} from '@lumy-pack/schema-form/src';

export default {
  title: 'Form/5. WatchValues',
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
  const formTypes = [
    {
      test: {
        type: 'string',
        formType: 'greeting',
      },
      Component: ({ watchValues }: FormTypeInputProps) => {
        return (
          <>
            <strong>hello '{watchValues[0]}'</strong>
            <pre>{JSON.stringify(watchValues, null, 2)}</pre>
          </>
        );
      },
    },
  ] as FormTypeInputDefinition[];
  return (
    <div>
      <Form jsonSchema={schema} formTypeInputDefinitions={formTypes} />
    </div>
  );
};
