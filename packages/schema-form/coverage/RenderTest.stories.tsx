import React, { useRef, useState } from 'react';

import { useRenderCount } from '@lumy-pack/development-helper';
import {
  Form,
  type FormTypeRendererProps,
  type JsonSchema,
} from '@lumy-pack/schema-form/src';

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
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

export const Grid = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      email: { type: 'string' },
      password: { type: 'string', formType: 'password' },
      address: { type: 'string' },
      address2: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      zip: { type: 'string' },
    },
  } satisfies JsonSchema;
  const grid = [
    ['email', 'password'],
    [
      {
        element: (
          <div style={{ background: 'yellow', textAlign: 'center' }}>
            - divider -
          </div>
        ),
        grid: 3,
      },
      <div style={{ background: 'orange', textAlign: 'center' }}>
        - - - divider - - -
      </div>,
    ],
    [<h1>address</h1>],
  ];
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} gridFrom={grid} onChange={setValue} />
    </StoryLayout>
  );
};

export const InsertInputForm = () => {
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
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <Form.Input path=".name" />
        <Form.Render path=".password">
          {({ path, Input, value, errorMessage }: FormTypeRendererProps) => {
            return (
              <div>
                {path}
                <Input /> {value}
                <div>{errorMessage}</div>
              </div>
            );
          }}
        </Form.Render>
        <Form.Input
          path=".age"
          FormTypeInput={({ path, onChange, value }) => {
            const RenderCount = useRenderCount('FormTypeInput');
            return (
              <div>
                {path}
                <button
                  onClick={() => {
                    onChange((prev) => (prev || 0) + 1);
                  }}
                >
                  custom input {value}
                </button>
                {RenderCount}
              </div>
            );
          }}
        />
      </Form>
    </StoryLayout>
  );
};
