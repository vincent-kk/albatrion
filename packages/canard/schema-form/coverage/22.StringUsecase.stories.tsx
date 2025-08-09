import { useEffect, useState } from 'react';

import { Form, type FormTypeInputProps, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/22. StringUsecase',
};

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
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

// Trim on blur - Uncontrolled input
export const TrimOnBlur_Uncontrolled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        options: { trim: true },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/text" />
          <Form.Input path="/text" FormTypeInput={UncontrolledInput} />
        </div>
        {/* Focusing here will trigger blur on the field above */}
        <input placeholder="focus here to blur above input" />
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Trim on blur - Controlled input
export const TrimOnBlur_Controlled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        options: { trim: true },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/text" />
          <Form.Input path="/text" FormTypeInput={ControlledInput} />
        </div>
        <input placeholder="focus here to blur above input" />
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// No trim - Uncontrolled input
export const NoTrimOnBlur_Uncontrolled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        // options.trim is undefined -> no trimming on blur
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/text" />
          <Form.Input path="/text" FormTypeInput={UncontrolledInput} />
        </div>
        <input placeholder="focus here to blur above input" />
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// No trim - Controlled input
export const NoTrimOnBlur_Controlled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        // options.trim is undefined -> no trimming on blur
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/text" />
          <Form.Input path="/text" FormTypeInput={ControlledInput} />
        </div>
        <input placeholder="focus here to blur above input" />
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

const ControlledInput = ({ value, onChange }: FormTypeInputProps<string>) => {
  useEffect(() => {
    console.log('ControlledInput 마운트됨');
    return () => console.log('ControlledInput 언마운트됨');
  }, []);
  console.log('ControlledInput 렌더링됨', { value });
  return (
    <input
      type="text"
      placeholder="type with spaces then blur"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const UncontrolledInput = ({
  defaultValue,
  onChange,
}: FormTypeInputProps<string>) => {
  useEffect(() => {
    console.log('ControlledInput 마운트됨');
    return () => console.log('ControlledInput 언마운트됨');
  }, []);
  console.log('UncontrolledInput 렌더링됨', { defaultValue });
  return (
    <input
      type="text"
      placeholder="type with spaces then blur"
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
