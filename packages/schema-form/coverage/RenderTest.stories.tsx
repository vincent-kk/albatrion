import React, { useRef, useState } from 'react';

import { Form, JsonSchema } from '@lumy-pack/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/12. RenderTest',
};

export const FunctionalChildren = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      allowed: {
        type: 'boolean',
      },
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
      gender: {
        type: 'string',
        enum: ['male', 'female'],
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
          INPUT
          <Form.Input
            path=".allowed"
            name="allowed"
            style={{ color: 'red' }}
            context={{ a: 1 }}
          />
        </div>
        <div>
          <Form.Render path=".name">
            {({ Input, node }) => {
              return (
                <div>
                  {node.name}
                  <Input />
                </div>
              );
            }}
          </Form.Render>
        </div>
        <div>
          <Form.Label path=".age" />
          <Form.Input path=".age" />
        </div>
        <div>
          <Form.Label path=".gender" />
          <Form.Input path=".gender" />
        </div>
      </Form>
    </StoryLayout>
  );
};

export const Common = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      password: {
        type: 'string',
        format: 'password',
      },
      age: {
        type: 'number',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <Form jsonSchema={jsonSchema} onChange={setValue} />
      </div>
      <div style={{ flex: 1 }}>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>
    </div>
  );
};
