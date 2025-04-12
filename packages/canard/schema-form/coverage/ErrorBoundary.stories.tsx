import React, { useRef, useState } from 'react';

import { Form, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/13. ErrorBoundary',
};

export const FunctionalChildren = () => {
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

  const defaultValue = useRef<Record<string, any>>({
    allowed: false,
  });

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={defaultValue.current}
        onChange={setValue}
      >
        <div>
          <Form.Group
            path=".name"
            FormTypeInput={() => {
              throw new Error('Error accord from Input');
              return <div>Input</div>;
            }}
          />
        </div>
        <div>
          <Form.Render path=".age">
            {({ Input, node }) => {
              throw new Error('Error accord from Renderer');
              return (
                <div>
                  {node.name}
                  <Input />
                </div>
              );
            }}
          </Form.Render>
        </div>
      </Form>
    </StoryLayout>
  );
};
