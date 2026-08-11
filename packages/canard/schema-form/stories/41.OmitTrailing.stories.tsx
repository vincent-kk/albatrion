import { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  type JsonSchemaError,
  registerPlugin,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin as validatorPlugin } from './components/validator';

registerPlugin(validatorPlugin);

export default {
  title: 'Form/41. OmitTrailing',
};

/**
 * `options.omitTrailing` demo set. Every story mirrors an automated render
 * test — the `equivalent:` comment names the covering file#case — so the
 * manual demos and the CI checks describe the same contract:
 * trailing `undefined` items disappear from the emitted/validated value while
 * every empty input stays mounted, and leading/middle `undefined` keep their
 * indices.
 */

// equivalent: array.omit-trailing.render.test.tsx#1-4 (empty inputs stay, value trims)
export const BasicEmptyInputsFirst = () => {
  const schema = {
    type: 'object',
    properties: {
      tags: {
        type: 'array',
        items: { type: 'string' },
        minItems: 3,
        options: { omitTrailing: true },
      },
    },
  } satisfies JsonSchema;
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.render.test.tsx#8-12 (root array getValue/submit)
export const RootArrayForm = () => {
  const schema = {
    type: 'array',
    items: { type: 'number' },
    minItems: 3,
    options: { omitTrailing: true },
  } satisfies JsonSchema;
  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<unknown>();
  const [snapshot, setSnapshot] = useState<string>('');
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} ref={formHandle} />
      <button
        onClick={() =>
          setSnapshot(JSON.stringify(formHandle.current?.getValue()))
        }
      >
        getValue()
      </button>
      <pre>getValue snapshot: {snapshot}</pre>
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.conditional.render.test.tsx#1-3 (oneOf branch switching)
export const OneOfBranchSwitching = () => {
  const schema = {
    type: 'object',
    properties: {
      disc: { type: 'string', enum: ['a', 'b'], default: 'a' },
    },
    oneOf: [
      {
        computed: { if: "./disc === 'a'" },
        properties: {
          arr: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            options: { omitTrailing: true },
          },
        },
      },
      {
        computed: { if: "./disc === 'b'" },
        properties: { other: { type: 'string' } },
      },
    ],
  } satisfies JsonSchema;
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.conditional.render.test.tsx#4 (anyOf active branch)
export const AnyOfActiveBranch = () => {
  const schema = {
    type: 'object',
    properties: {
      mode: { type: 'string', enum: ['list', 'none'], default: 'list' },
    },
    anyOf: [
      {
        computed: { if: "./mode === 'list'" },
        properties: {
          arr: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            options: { omitTrailing: true },
          },
        },
      },
      {
        computed: { if: "./mode === 'none'" },
        properties: { note: { type: 'string' } },
      },
    ],
  } satisfies JsonSchema;
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.conditional.render.test.tsx#5 (if/then/else required sees the trim)
export const IfThenElseRequiredWithTrim = () => {
  const schema = {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['movie', 'game'], default: 'movie' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        options: { omitTrailing: true },
      },
    },
    if: { properties: { category: { enum: ['movie'] } } },
    then: { required: ['tags'] },
    else: {},
  } satisfies JsonSchema;
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form jsonSchema={schema} onChange={setValue} onValidate={setErrors} />
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.conditional.render.test.tsx#6 (&active exclude/restore)
export const ActiveToggleRestore = () => {
  const schema = {
    type: 'object',
    properties: {
      enabled: { type: 'boolean' },
      arr: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        options: { omitTrailing: true },
        '&active': '../enabled === true',
      },
    },
  } satisfies JsonSchema;
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.injection.render.test.tsx#1-3 (setValue injection)
export const SetValueInjection = () => {
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        items: { type: 'number' },
        options: { omitTrailing: true },
      },
    },
  } satisfies JsonSchema;
  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} ref={formHandle} />
      <button
        onClick={() =>
          formHandle.current?.setValue({ arr: [1, undefined, undefined] })
        }
      >
        inject [1, u, u]
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ arr: [undefined, 1, undefined] })
        }
      >
        inject [u, 1, u]
      </button>
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.injection.render.test.tsx#4-5 (defaultValue + reset)
export const DefaultValueAndReset = () => {
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        items: { type: 'number' },
        options: { omitTrailing: true },
      },
    },
  } satisfies JsonSchema;
  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        jsonSchema={schema}
        defaultValue={{ arr: [1, undefined] }}
        onChange={setValue}
        ref={formHandle}
      />
      <button onClick={() => formHandle.current?.reset()}>reset()</button>
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.injection.render.test.tsx#6, #10 (nullable + nested)
export const NullableAndNested = () => {
  const schema = {
    type: 'object',
    properties: {
      nullableArr: {
        type: ['array', 'null'],
        items: { type: 'number' },
        options: { omitTrailing: true },
      },
      nested: {
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'number' },
          options: { omitTrailing: true },
        },
      },
    },
  } satisfies JsonSchema;
  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} ref={formHandle} />
      <button
        onClick={() => formHandle.current?.setValue({ nullableArr: null })}
      >
        inject null
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ nested: [[1, undefined]] })
        }
      >
        inject nested [[1, u]]
      </button>
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.injection.render.test.tsx#7-8 (prefixItems + terminal)
export const PrefixItemsAndTerminal = () => {
  const schema = {
    type: 'object',
    properties: {
      tuple: {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        options: { omitTrailing: true },
      },
      terminal: {
        type: 'array',
        items: { type: 'number' },
        terminal: true,
        options: { omitTrailing: true },
      },
    },
  } satisfies JsonSchema;
  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} ref={formHandle} />
      <button
        onClick={() =>
          formHandle.current?.setValue({
            tuple: ['x', undefined],
            terminal: [1, undefined],
          })
        }
      >
        inject trailing-undefined values
      </button>
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.composite.render.test.tsx#1-4 (setValue × oneOf × nested)
export const SetValueCompositeBranchesNested = () => {
  const schema = {
    type: 'object',
    properties: {
      disc: { type: 'string', enum: ['a', 'b'], default: 'b' },
    },
    oneOf: [
      {
        computed: { if: "./disc === 'a'" },
        properties: {
          matrix: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'number' },
              options: { omitTrailing: true },
            },
          },
        },
      },
      {
        computed: { if: "./disc === 'b'" },
        properties: { other: { type: 'string' } },
      },
    ],
  } satisfies JsonSchema;
  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} ref={formHandle} />
      <button
        onClick={() =>
          formHandle.current?.setValue({
            disc: 'a',
            matrix: [
              [1, undefined],
              [undefined, 2, undefined],
            ],
          })
        }
      >
        select branch a + inject nested [[1, u], [u, 2, u]]
      </button>
      <button onClick={() => formHandle.current?.setValue({ disc: 'b' })}>
        switch to branch b
      </button>
    </StoryLayout>
  );
};

// equivalent: array.omit-trailing.composite.render.test.tsx#6-8 (injectTo composites)
export const InjectToComposite = () => {
  const schema = {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        injectTo: (value: string) => ({
          '../arr': [value, undefined, undefined],
        }),
      },
      arr: {
        type: 'array',
        items: { type: 'string' },
        options: { omitTrailing: true },
        injectTo: (value: string[]) => ({ '../mirror': value }),
      },
      mirror: { type: 'array', items: { type: 'string' } },
    },
  } satisfies JsonSchema;
  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};
