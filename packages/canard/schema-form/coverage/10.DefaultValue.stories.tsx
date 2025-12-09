import { useState } from 'react';

import { Form, type JsonSchema, type JsonSchemaError } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/10. DefaultValue',
};

export const DefaultValueBySchema = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      string: {
        type: 'string',
        default: 'default value',
      },
      number: {
        type: 'number',
        default: 10,
      },
      boolean: {
        type: 'boolean',
        default: true,
      },
      array: {
        type: 'array',
        items: { type: 'number', default: 0 },
        minItems: 2,
      },
      object: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'adult' },
          age: { type: 'number', default: 19 },
        },
      },
      objectArray: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'anonymous' },
            age: { type: 'number', default: 0 },
          },
        },
        minItems: 3,
      },
      null: {
        type: 'null',
        nullable: true,
        default: null,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
      <Form
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};
export const DefaultValueByValue = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      string: {
        type: 'string',
      },
      number: {
        type: 'number',
      },
      boolean: {
        type: 'boolean',
      },
      array: {
        type: 'array',
        items: { type: 'number' },
        minItems: 2,
      },
      object: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      },
      objectArray: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
        minItems: 3,
      },
      null: {
        type: 'null',
        nullable: true,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={{
          string: 'default value',
          number: 10,
          boolean: true,
          array: [0, 0],
          object: { name: 'adult', age: 19 },
          objectArray: [
            { name: 'anonymous', age: 0 },
            { name: 'anonymous', age: 0 },
            { name: 'anonymous', age: 0 },
          ],
          null: null,
        }}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

export const SetDefaultValueOnParentAndChild = () => {
  const schema = {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        default: {
          name: 'ron',
        },
        properties: {
          name: { type: 'string', default: 'harry' },
          age: { type: 'number', default: 9 },
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <StoryLayout jsonSchema={schema} errors={errors} value={value}>
        <Form jsonSchema={schema} onChange={setValue} onValidate={setErrors} />
      </StoryLayout>
    </div>
  );
};

/**
 * ArrayNode minItems Auto-fill Behavior
 *
 * This story demonstrates the behavior changes from commit 1ed54c09:
 * - When defaultValue or schema.default is provided → use that value, do NOT auto-fill minItems
 * - When no default is provided → auto-fill empty items up to minItems count
 *
 * The key change: hasDefault flag controls whether minItems auto-initialization occurs
 */
export const ArrayMinItemsAutoFillBehavior = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      // Case 1: No default → minItems auto-fill enabled
      autoFillArray: {
        type: 'array',
        title: 'Auto-fill Array (no default, minItems=3)',
        items: { type: 'string', default: 'auto-filled' },
        minItems: 3,
      },
      // Case 2: schema.default provided → minItems auto-fill disabled
      schemaDefaultArray: {
        type: 'array',
        title: 'Schema Default Array (default=["one"], minItems=3)',
        items: { type: 'string', default: 'item' },
        minItems: 3,
        default: ['one'],
      },
      // Case 3: Empty schema.default → minItems auto-fill disabled
      emptyDefaultArray: {
        type: 'array',
        title: 'Empty Default Array (default=[], minItems=3)',
        items: { type: 'string', default: 'item' },
        minItems: 3,
        default: [],
      },
      // Case 4: Object items with auto-fill
      objectArrayAutoFill: {
        type: 'array',
        title: 'Object Array Auto-fill (no default, minItems=2)',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'anonymous' },
            age: { type: 'number', default: 0 },
          },
        },
        minItems: 2,
      },
      // Case 5: Object items with schema.default
      objectArrayWithDefault: {
        type: 'array',
        title: 'Object Array with Default (default=[{name: "preset"}], minItems=3)',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'anonymous' },
            age: { type: 'number', default: 0 },
          },
        },
        minItems: 3,
        default: [{ name: 'preset' }],
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>ArrayNode minItems Auto-fill Behavior (commit 1ed54c09)</h3>
      <p>
        <strong>Rule:</strong> When <code>defaultValue</code> or{' '}
        <code>schema.default</code> is provided, minItems auto-fill is{' '}
        <strong>disabled</strong>.
      </p>
      <ul>
        <li>
          <strong>autoFillArray:</strong> No default → auto-fills 3 items
        </li>
        <li>
          <strong>schemaDefaultArray:</strong> Has default=["one"] → only 1 item
        </li>
        <li>
          <strong>emptyDefaultArray:</strong> Has default=[] → 0 items
        </li>
        <li>
          <strong>objectArrayAutoFill:</strong> No default → auto-fills 2
          objects
        </li>
        <li>
          <strong>objectArrayWithDefault:</strong> Has default → only 1 object
        </li>
      </ul>
      <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </StoryLayout>
    </div>
  );
};

/**
 * ArrayNode with defaultValue prop
 *
 * Demonstrates that providing defaultValue to Form component also prevents minItems auto-fill
 */
export const ArrayMinItemsWithDefaultValueProp = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      // minItems=5 but defaultValue provides partial array
      partialArray: {
        type: 'array',
        title: 'Partial Array (defaultValue=["a","b"], minItems=5)',
        items: { type: 'string', default: 'x' },
        minItems: 5,
      },
      // minItems=3 but defaultValue provides empty array
      emptyArray: {
        type: 'array',
        title: 'Empty Array (defaultValue=[], minItems=3)',
        items: { type: 'string', default: 'x' },
        minItems: 3,
      },
      // No defaultValue → auto-fill
      autoFillArray: {
        type: 'array',
        title: 'Auto-fill Array (no defaultValue, minItems=2)',
        items: { type: 'string', default: 'auto' },
        minItems: 2,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>ArrayNode with defaultValue prop</h3>
      <p>
        <strong>Rule:</strong> Form's <code>defaultValue</code> prop also
        controls minItems auto-fill.
      </p>
      <ul>
        <li>
          <strong>partialArray:</strong> defaultValue=["a","b"] → only 2 items
          (not 5)
        </li>
        <li>
          <strong>emptyArray:</strong> defaultValue=[] → 0 items (not 3)
        </li>
        <li>
          <strong>autoFillArray:</strong> No defaultValue → auto-fills 2 items
        </li>
      </ul>
      <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
        <Form
          jsonSchema={jsonSchema}
          defaultValue={{
            partialArray: ['a', 'b'],
            emptyArray: [],
            // autoFillArray is intentionally not provided
          }}
          onChange={setValue}
          onValidate={setErrors}
        />
      </StoryLayout>
    </div>
  );
};

/**
 * Nested ArrayNode Default Value Behavior
 *
 * Demonstrates how hasDefault flag works with nested arrays
 */
export const NestedArrayDefaultValueBehavior = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      // Nested array without default → both levels auto-fill
      nestedAutoFill: {
        type: 'array',
        title: 'Nested Auto-fill (no default)',
        items: {
          type: 'array',
          items: { type: 'number', default: 0 },
          minItems: 2,
        },
        minItems: 2,
      },
      // Nested array with inner default → outer auto-fills, inner uses default
      nestedInnerDefault: {
        type: 'array',
        title: 'Nested with Inner Default (inner default=[99])',
        items: {
          type: 'array',
          items: { type: 'number', default: 0 },
          minItems: 3,
          default: [99],
        },
        minItems: 2,
      },
      // Nested array with outer default → no auto-fill
      nestedOuterDefault: {
        type: 'array',
        title: 'Nested with Outer Default (default=[[1],[2,3]])',
        items: {
          type: 'array',
          items: { type: 'number', default: 0 },
          minItems: 3,
        },
        minItems: 3,
        default: [[1], [2, 3]],
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>Nested ArrayNode Default Value Behavior</h3>
      <p>
        <strong>Rule:</strong> Each array level independently checks for
        hasDefault.
      </p>
      <ul>
        <li>
          <strong>nestedAutoFill:</strong> No default → outer=2, inner=2 each →
          [[0,0],[0,0]]
        </li>
        <li>
          <strong>nestedInnerDefault:</strong> Inner has default=[99] →
          outer=2, inner=[99] each → [[99],[99]]
        </li>
        <li>
          <strong>nestedOuterDefault:</strong> Outer has default → [[1],[2,3]]
          (no auto-fill)
        </li>
      </ul>
      <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </StoryLayout>
    </div>
  );
};
