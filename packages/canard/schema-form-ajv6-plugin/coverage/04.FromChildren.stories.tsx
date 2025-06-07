import React, { useRef, useState } from 'react';

import { Form, type JsonSchema, registerPlugin } from '@canard/schema-form';

import { plugin } from '../src';
import StoryLayout from './components/StoryLayout';

registerPlugin(plugin);

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

  const defaultValue = useRef<Record<string, any>>({
    allowed: false,
  });

  const [value, setValue] = useState<Record<string, any>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={defaultValue.current}
        onChange={setValue}
      >
        {({ defaultValue, value, errors }) => (
          <>
            <div>
              {!defaultValue?.allowed && <Form.Input path=".allowed" />}
            </div>
            <div>
              <Form.Label path=".name" />
              {!!value?.allowed && <Form.Input path=".name" />}
            </div>
            <div>
              <Form.Label path=".age" />
              {!!value?.name?.length && <Form.Input path=".age" />}
            </div>
            <div>
              <Form.Label path=".gender" />
              {typeof value?.age === 'number' && <Form.Input path=".gender" />}
            </div>
            {defaultValue && <div>{JSON.stringify(defaultValue, null, 2)}</div>}
            {value && <div>{JSON.stringify(value, null, 2)}</div>}
            {errors?.length && <div>{JSON.stringify(errors, null, 2)}</div>}
          </>
        )}
      </Form>
    </StoryLayout>
  );
};

export const FunctionalArrayChildren = () => {
  const jsonSchema = {
    type: 'array',
    items: {
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
    },
  } satisfies JsonSchema;

  const defaultValue = useRef<Record<string, any>[]>([
    {
      allowed: false,
    },
  ]);

  const [value, setValue] = useState<Record<string, unknown>[]>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={defaultValue.current}
        onChange={setValue}
      >
        {({ node, defaultValue, value, errors }) => (
          <>
            <button
              onClick={() => {
                node?.push();
              }}
            >
              push new element
            </button>
            <Form.Input />
            {defaultValue && <div>{JSON.stringify(defaultValue, null, 2)}</div>}
            {value && <div>{JSON.stringify(value, null, 2)}</div>}
            {errors?.length && <div>{JSON.stringify(errors, null, 2)}</div>}
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

export const FormWithSeparatedChildren = () => {
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
          <Form.Label path=".allowed" style={{ color: 'red' }} />
          <Form.Input path=".allowed" style={{ color: 'blue' }} />
          <Form.Error path=".allowed" style={{ color: 'green' }} />
        </div>
        <div>
          <Form.Label path=".name" style={{ color: 'red' }} />
          <Form.Input path=".name" style={{ color: 'blue' }} />
          <Form.Error path=".name" style={{ color: 'green' }} />
        </div>
        <div>
          <Form.Render path=".age" style={{ color: 'orange' }}>
            {({ Input, path, style }) => {
              return (
                <div style={style}>
                  <label htmlFor={path}>{path}</label>
                  <Input />
                </div>
              );
            }}
          </Form.Render>
        </div>
        <div>
          <Form.Group path=".gender" style={{ color: 'purple' }} />
        </div>
      </Form>
    </StoryLayout>
  );
};
