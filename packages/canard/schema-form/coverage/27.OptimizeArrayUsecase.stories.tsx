import { useState } from 'react';

import { Form, type FormTypeInputProps, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/27. OptimizeArrayUsecase',
};
export const FormTypeInputArrayTerminal_Controlled = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        FormTypeInput: ({ value, onChange }: FormTypeInputProps<string[]>) => {
          return (
            <input
              type="text"
              value={value.join('')}
              onChange={(e) => {
                onChange(e.target.value.split(''));
              }}
            />
          );
        },
        items: {
          type: 'string',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputArrayTerminal_Uncontrolled = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        FormTypeInput: ({
          defaultValue,
          onChange,
        }: FormTypeInputProps<string[]>) => {
          return (
            <input
              type="text"
              defaultValue={defaultValue?.join('')}
              onChange={(e) => {
                onChange(e.target.value.split(''));
              }}
            />
          );
        },
        items: {
          type: 'string',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputArrayNotTerminal_Controlled = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        terminal: false,
        FormTypeInput: ({ value, onChange }: FormTypeInputProps<string[]>) => {
          return (
            <input
              type="text"
              value={value?.join('')}
              onChange={(e) => {
                onChange(e.target.value.split(''));
              }}
            />
          );
        },
        items: {
          type: 'string',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputArrayNotTerminal_Uncontrolled = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        terminal: false,
        FormTypeInput: ({
          defaultValue,
          onChange,
        }: FormTypeInputProps<string[]>) => {
          return (
            <input
              type="text"
              defaultValue={defaultValue?.join('')}
              onChange={(e) => {
                onChange(e.target.value.split(''));
              }}
            />
          );
        },
        items: {
          type: 'string',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

const BENCHMARK_COUNT = 100;

export const FormTypeInputArrayTerminal = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        FormTypeInput: ({ node, value }: FormTypeInputProps<number[]>) => {
          const [inputValue, setInputValue] = useState<number[]>([]);
          return (
            <div>
              <button
                onClick={async () => {
                  node.clear();
                  setInputValue([]);
                  const vs = [];
                  for (let i = 0; i < BENCHMARK_COUNT; i++) {
                    const v = node.push(i * 10);
                    vs.push(v);
                  }
                  setInputValue(await Promise.all(vs));
                }}
              >
                benchmark
              </button>
              <button
                onClick={async () => {
                  const v = await node.push();
                  setInputValue((prev) => [...prev, v]);
                }}
              >
                push
              </button>
              <button
                onClick={async () => {
                  node.clear();
                  setInputValue([]);
                }}
              >
                clear
              </button>
              <pre>{JSON.stringify(inputValue, null, 2)}</pre>
              <pre>{JSON.stringify(value, null, 2)}</pre>
            </div>
          );
        },
        items: {
          type: 'number',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputArrayNotTerminal = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        terminal: false,
        FormTypeInput: ({ node, value }: FormTypeInputProps<number[]>) => {
          const [inputValue, setInputValue] = useState<number[]>([]);
          return (
            <div>
              <button
                onClick={async () => {
                  node.clear();
                  setInputValue([]);
                  const vs = [];
                  for (let i = 0; i < BENCHMARK_COUNT; i++) {
                    const v = node.push(i * 10);
                    vs.push(v);
                  }
                  setInputValue(await Promise.all(vs));
                }}
              >
                benchmark
              </button>
              <button
                onClick={async () => {
                  const v = await node.push();
                  setInputValue((prev) => [...prev, v]);
                }}
              >
                push
              </button>
              <button
                onClick={async () => {
                  node.clear();
                  setInputValue([]);
                }}
              >
                clear
              </button>
              <pre>{JSON.stringify(inputValue, null, 2)}</pre>
              <pre>{JSON.stringify(value, null, 2)}</pre>
            </div>
          );
        },
        items: {
          type: 'number',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};
