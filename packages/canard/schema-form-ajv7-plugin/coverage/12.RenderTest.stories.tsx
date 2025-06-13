import { useRef, useState } from 'react';

import {
  Form,
  type FormTypeRendererProps,
  type JsonSchema,
  registerPlugin,
} from '@canard/schema-form';

import { useRenderCount } from '@aileron/development-helper';

import { plugin } from '../src';
import StoryLayout from './components/StoryLayout';

registerPlugin(plugin);

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
            path="./allowed"
            style={{ color: 'red' }}
            context={{ a: 1 }}
          />
        </div>
        <div>
          <Form.Render path="#/name">
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
          <Form.Label path="#/age" />
          <Form.Input path="#/age" />
        </div>
        <div>
          <Form.Label path="#/gender" />
          <Form.Input path="#/gender" />
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
      phone: {
        type: 'string',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <Form.Input path="#/name" />
        <Form.Render path="#/password">
          {({ path, Input, value, errorMessage }: FormTypeRendererProps) => {
            return (
              <div
                style={{
                  border: `1px solid ${value ? 'red' : 'blue'}`,
                }}
              >
                {path}
                <Input /> {value as string}
                <div>{errorMessage}</div>
              </div>
            );
          }}
        </Form.Render>
        <Form.Input
          path="#/age"
          FormTypeInput={({ path, onChange, value }) => {
            const RenderCount = useRenderCount('FormTypeInput');
            return (
              <div>
                {path}
                <button
                  onClick={() => {
                    onChange((prev: number) => (prev || 0) + 1);
                  }}
                >
                  custom input {value}
                </button>
                {RenderCount}
              </div>
            );
          }}
        />
        <Form.Input
          path="#/phone"
          readOnly={!!value?.age}
          disabled={value?.phone === '12345'}
        />
      </Form>
    </StoryLayout>
  );
};
