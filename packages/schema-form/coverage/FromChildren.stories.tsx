import React, { useRef, useState } from 'react';

import { Form, type JsonSchema } from '@lumy-pack/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/04. FromChildren',
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

  const defaultValue = useRef({
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
        {({ defaultValue, value }) => (
          <>
            <div>
              {!defaultValue?.allowed && <Form.Input path=".allowed" />}
            </div>
            <div>
              <Form.Label path=".name" />
              {value?.allowed && <Form.Input path=".name" />}
            </div>
            <div>
              <Form.Label path=".age" />
              {value?.name?.length && <Form.Input path=".age" />}
            </div>
            <div>
              <Form.Label path=".gender" />
              {typeof value?.age === 'number' && <Form.Input path=".gender" />}
            </div>
          </>
        )}
      </Form>
    </StoryLayout>
  );
};

export const IterableChildren = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      allowed: {
        type: 'boolean',
      },
      name: {
        type: 'string',
        maxLength: 3,
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

  const defaultValue = useRef({
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
          <Form.Input path=".allowed" />
        </div>
        <div>
          <Form.Label path=".name" />
          <Form.Input path=".name" />
        </div>
        <div>
          <Form.Render path=".age">
            {({ Input, path }) => {
              return (
                <div>
                  <label htmlFor={path}>{path}</label>
                  <Input />
                </div>
              );
            }}
          </Form.Render>
        </div>
        <div>
          <Form.Group path=".gender" />
        </div>
        <div>
          name error:
          <Form.Error path=".name" style={{ display: 'inline' }} />
        </div>
      </Form>
    </StoryLayout>
  );
};
