import { useState } from 'react';

import {
  Form,
  type FormTypeInputProps,
  type FormTypeRendererProps,
  type JsonSchema,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/23. JsonSchemaPropsUsecase',
};

// Custom Renderer: reads extra props from jsonSchema.FormTypeRendererProps
const BadgeRenderer = ({
  name,
  Input,
  errorMessage,
  // extra props via jsonSchema.FormTypeRendererProps
  highlightColor = '#1677ff',
  caption,
  padding = 6,
}: FormTypeRendererProps & {
  highlightColor?: string;
  caption?: string;
  padding?: number;
}) => {
  return (
    <div
      style={{
        border: `2px solid ${highlightColor}`,
        borderRadius: 6,
        padding,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 12, color: highlightColor }}>{name}</div>
      {caption && (
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>
          {caption}
        </div>
      )}
      <Input />
      {errorMessage && (
        <div style={{ color: '#d4380d', fontSize: 12 }}>{errorMessage}</div>
      )}
    </div>
  );
};

// Custom FormTypeInput: reads extra props from jsonSchema.FormTypeInputProps
const FancyInput = ({
  value,
  onChange,
  // extra props via jsonSchema.FormTypeInputProps
  prefix = '',
  placeholder,
  maxLength = 50,
}: FormTypeInputProps<string> & {
  prefix?: string;
  placeholder?: string;
  maxLength?: number;
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {prefix ? <span style={{ opacity: 0.7 }}>{prefix}</span> : null}
      <input
        type="text"
        value={value ?? ''}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1 }}
      />
    </div>
  );
};

// Story 1: Renderer props only
export const RendererProps_Basic = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        FormTypeRendererProps: {
          highlightColor: 'tomato',
          caption: 'renderer caption from jsonSchema.FormTypeRendererProps',
          padding: 10,
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form
        jsonSchema={jsonSchema}
        onChange={setValue}
        // Use custom renderer to verify schema-level renderer props are injected
        CustomFormTypeRenderer={BadgeRenderer}
      >
        <Form.Group path="/title" />
      </Form>
    </StoryLayout>
  );
};

// Story 2: Input props only
export const InputProps_Basic = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        // Provide custom input at schema level
        FormType: FancyInput,
        // Pass extra props to the input via jsonSchema.FormTypeInputProps
        FormTypeInputProps: {
          prefix: '👤',
          placeholder: '이름을 입력하세요',
          maxLength: 20,
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <Form.Group path="/name" />
      </Form>
    </StoryLayout>
  );
};

// Story 3: Combined usage across multiple fields
export const Combined_InputAndRendererProps_MultiFields = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        FormType: FancyInput,
        FormTypeInputProps: {
          prefix: '📧',
          placeholder: 'example@domain.com',
        },
        FormTypeRendererProps: {
          highlightColor: '#52c41a',
          caption: '이메일 입력 필드 (renderer props 적용)',
        },
      },
      age: {
        type: 'number',
        FormType: FancyInput as unknown as FormTypeInputProps<number>['Input'],
        FormTypeInputProps: {
          prefix: '🔢',
          placeholder: '나이',
          // maxLength will be ignored by number input, but included to test prop passthrough
          maxLength: 3,
        },
        FormTypeRendererProps: {
          highlightColor: '#faad14',
          caption: '나이 입력 필드 (renderer props 적용)',
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form
        jsonSchema={jsonSchema}
        onChange={setValue}
        CustomFormTypeRenderer={BadgeRenderer}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Form.Group path="/email" />
          <Form.Group path="/age" />
        </div>
      </Form>
    </StoryLayout>
  );
};
