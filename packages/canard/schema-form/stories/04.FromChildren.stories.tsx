import { useRef, useState } from 'react';

import { Form, type FormTypeInputProps, type JsonSchema } from '../src';
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
              {!defaultValue?.allowed && <Form.Input path="/allowed" />}
            </div>
            <div>
              <Form.Label path="/name" />
              {!!value?.allowed && <Form.Input path="/name" />}
            </div>
            <div>
              <Form.Label path="/age" />
              {!!value?.name?.length && <Form.Input path="/age" />}
            </div>
            <div>
              <Form.Label path="/gender" />
              {typeof value?.age === 'number' && <Form.Input path="/gender" />}
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
          <Form.Input path="/allowed" />
        </div>
        <div>
          <Form.Label path="/name" />
          <Form.Input path="/name" />
        </div>
        <div>
          <Form.Render path="/age">
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
          <Form.Group path="/gender" />
        </div>
        <div>
          name error:
          <Form.Error path="/name" style={{ display: 'inline' }} />
        </div>
      </Form>
    </StoryLayout>
  );
};

export const FormWithSubComponentProps = () => {
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
      alt_name: {
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
  const [readOnly, setReadOnly] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const Input = useRef(
    ({
      defaultValue,
      onChange,
      readOnly,
      disabled,
    }: FormTypeInputProps<string>) => (
      <input
        style={{ border: 'solid red 1px' }}
        readOnly={readOnly}
        disabled={disabled}
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
  );

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <button onClick={() => setReadOnly((prev) => !prev)}>
        readOnly: {readOnly ? 'true' : 'false'}
      </button>
      <button onClick={() => setDisabled((prev) => !prev)}>
        disabled: {disabled ? 'true' : 'false'}
      </button>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={defaultValue.current}
        onChange={setValue}
      >
        <div>
          <Form.Input path="/allowed" readOnly={readOnly} disabled={disabled} />
        </div>
        <div>
          <Form.Label path="/name" />
          <Form.Input path="/name" readOnly={readOnly} disabled={disabled} />
          <Form.Input
            path="/alt_name"
            FormTypeInput={Input.current}
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
        <div>
          <Form.Render path="/age" readOnly={readOnly} disabled={disabled}>
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
          <Form.Group path="/gender" readOnly={readOnly} disabled={disabled} />
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
          <Form.Label path="/allowed" style={{ color: 'red' }} />
          <Form.Input path="/allowed" style={{ color: 'blue' }} />
          <Form.Error path="/allowed" style={{ color: 'green' }} />
        </div>
        <div>
          <Form.Label path="/name" style={{ color: 'red' }} />
          <Form.Input path="/name" style={{ color: 'blue' }} />
          <Form.Error path="/name" style={{ color: 'green' }} />
        </div>
        <div>
          <Form.Render path="/age" style={{ color: 'orange' }}>
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
          <Form.Group path="/gender" style={{ color: 'purple' }} />
        </div>
      </Form>
    </StoryLayout>
  );
};
