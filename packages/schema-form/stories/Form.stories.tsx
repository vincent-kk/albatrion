import React, { useState } from 'react';

import Form, { type JsonSchema } from '../src';

export const Common = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export default {
  title: 'Form/Common',
};
