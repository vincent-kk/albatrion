import { useRef, useState } from 'react';

import { Form, type FormHandle, type JsonSchema, SetValueOption } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/29. Nullable Array Syntax',
};

/**
 * Basic Nullable Types using Array Syntax: type: ['string', 'null']
 * Demonstrates the new nullable type array syntax for primitive types
 */

export const BasicNullableString = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: {
        type: ['string', 'null'],
        title: 'Name (nullable via array syntax)',
        default: null,
      },
      email: {
        type: ['string', 'null'],
        format: 'email',
        title: 'Email (nullable with format)',
        default: null,
      },
      description: {
        type: ['string', 'null'],
        title: 'Description (nullable with constraints)',
        minLength: 10,
        maxLength: 200,
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <h3>Basic Nullable String - Array Syntax</h3>
      <p>
        Using <code>{`type: ['string', 'null']`}</code> syntax for nullable
        strings
      </p>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue(
              {
                name: 'John Doe',
                email: 'john@example.com',
                description: 'A detailed description about something',
              },
              SetValueOption.Merge,
            )
          }
        >
          Set All Values
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue(
              { name: null, email: null, description: null },
              SetValueOption.Merge,
            )
          }
        >
          Set All to null
        </button>
        <button
          onClick={() => formHandle.current?.setValue({ name: 'Jane Smith' })}
        >
          Set Name Only
        </button>
        <button onClick={() => formHandle.current?.setValue({ name: null })}>
          Set Name to null
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const BasicNullableNumber = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      age: {
        type: ['number', 'null'],
        title: 'Age (nullable number)',
        minimum: 0,
        maximum: 150,
        default: null,
      },
      score: {
        type: ['integer', 'null'],
        title: 'Score (nullable integer)',
        minimum: 0,
        maximum: 100,
        default: null,
      },
      price: {
        type: ['number', 'null'],
        title: 'Price (nullable with decimals)',
        minimum: 0,
        multipleOf: 0.01,
      },
      quantity: {
        type: ['integer', 'null'],
        title: 'Quantity (nullable with step)',
        minimum: 1,
        maximum: 999,
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <h3>Basic Nullable Number/Integer - Array Syntax</h3>
      <p>
        Using <code>{`type: ['number', 'null']`}</code> and{' '}
        <code>{`type: ['integer', 'null']`}</code> syntax
      </p>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue({
              age: 25,
              score: 85,
              price: 99.99,
              quantity: 5,
            })
          }
        >
          Set All Values
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              age: null,
              score: null,
              price: null,
              quantity: null,
            })
          }
        >
          Set All to null
        </button>
        <button
          onClick={() => formHandle.current?.setValue({ age: 30, score: 90 })}
        >
          Set Age & Score
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({ price: 149.99, quantity: 10 })
          }
        >
          Set Price & Quantity
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const BasicNullableBoolean = () => {
  const [value, setValue] = useState<any>({});
  const schema = {
    type: 'object',
    properties: {
      consent: {
        type: ['boolean', 'null'],
        title: 'Terms & Conditions (null = not answered)',
        default: null,
      },
      newsletter: {
        type: ['boolean', 'null'],
        title: 'Newsletter Subscription (null = not decided)',
        default: null,
      },
      notifications: {
        type: ['boolean', 'null'],
        title: 'Push Notifications (null = ask later)',
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <h3>Basic Nullable Boolean - Array Syntax</h3>
      <p>
        Using <code>{`type: ['boolean', 'null']`}</code> syntax to distinguish
        null (unanswered) from false (declined)
      </p>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue({
              consent: true,
              newsletter: true,
              notifications: true,
            })
          }
        >
          Accept All
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              consent: false,
              newsletter: false,
              notifications: false,
            })
          }
        >
          Decline All
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              consent: null,
              newsletter: null,
              notifications: null,
            })
          }
        >
          Set All to null (Undecided)
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              consent: true,
              newsletter: false,
              notifications: null,
            })
          }
        >
          Mixed States
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <h4>Current State Interpretation:</h4>
        <div>
          Consent: <strong>{interpretBoolean(value?.consent)}</strong>
        </div>
        <div>
          Newsletter: <strong>{interpretBoolean(value?.newsletter)}</strong>
        </div>
        <div>
          Notifications:{' '}
          <strong>{interpretBoolean(value?.notifications)}</strong>
        </div>
      </div>
    </div>
  );
};

function interpretBoolean(val: boolean | null | undefined): string {
  if (val === null) return 'Not decided (null)';
  if (val === undefined) return 'Not answered (undefined)';
  if (val === true) return 'Accepted (true)';
  return 'Declined (false)';
}

/**
 * Complex Nullable Types using Array Syntax
 * Demonstrates nullable arrays and objects with nested structures
 */

export const ComplexNullableArray = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      tags: {
        type: ['array', 'null'],
        title: 'Tags (nullable array)',
        items: { type: 'string' },
        default: null,
      },
      scores: {
        type: ['array', 'null'],
        title: 'Scores (nullable array with nullable items)',
        items: { type: ['number', 'null'] },
        minItems: 1,
        maxItems: 5,
      },
      items: {
        type: ['array', 'null'],
        title: 'Items (nullable array with object items)',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: ['string', 'null'] },
            active: { type: ['boolean', 'null'], default: null },
          },
        },
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <h3>Complex Nullable Arrays - Array Syntax</h3>
      <p>
        Using <code>{`type: ['array', 'null']`}</code> for nullable arrays with
        various item types
      </p>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue({
              tags: ['react', 'typescript', 'vitest'],
              scores: [85, null, 92, 78, null],
              items: [
                { id: '1', name: 'Item 1', active: true },
                { id: '2', name: null, active: null },
                { id: '3', name: 'Item 3', active: false },
              ],
            })
          }
        >
          Set All Arrays
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              tags: null,
              scores: null,
              items: null,
            })
          }
        >
          Set All to null
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({ tags: ['new', 'tags'] })
          }
        >
          Set Tags Only
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({ scores: [100, 95, 90] })
          }
        >
          Set Scores Only
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const ComplexNullableObject = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      profile: {
        type: ['object', 'null'],
        title: 'User Profile (nullable object)',
        properties: {
          firstName: { type: ['string', 'null'], default: null },
          lastName: { type: ['string', 'null'], default: null },
          age: { type: ['number', 'null'], minimum: 0, maximum: 150 },
        },
        default: null,
      },
      address: {
        type: ['object', 'null'],
        title: 'Address (nested nullable)',
        properties: {
          street: { type: ['string', 'null'] },
          city: { type: ['string', 'null'] },
          zipCode: { type: ['string', 'null'], pattern: '^[0-9]{5}$' },
          country: {
            type: ['object', 'null'],
            properties: {
              code: { type: ['string', 'null'] },
              name: { type: ['string', 'null'] },
            },
          },
        },
      },
      metadata: {
        type: ['object', 'null'],
        title: 'Metadata (flexible object)',
        additionalProperties: true,
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <h3>Complex Nullable Objects - Array Syntax</h3>
      <p>
        Using <code>{`type: ['object', 'null']`}</code> for nullable objects
        with nested nullable properties
      </p>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue({
              profile: {
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
              },
              address: {
                street: '123 Main St',
                city: 'New York',
                zipCode: '10001',
                country: {
                  code: 'US',
                  name: 'United States',
                },
              },
              metadata: {
                created: '2024-01-01',
                source: 'web',
              },
            })
          }
        >
          Set All Objects
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              profile: null,
              address: null,
              metadata: null,
            })
          }
        >
          Set All to null
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              profile: { firstName: 'Jane', lastName: null, age: null },
            })
          }
        >
          Set Profile (partial)
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              address: {
                street: null,
                city: 'Los Angeles',
                zipCode: '90001',
                country: null,
              },
            })
          }
        >
          Set Address (mixed null)
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const EdgeCasesNullableTypes = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      // Pure null type
      placeholder: {
        type: 'null',
        title: 'Pure Null Type (always null)',
      },
      // Nullable with default null
      optionalField: {
        type: ['string', 'null'],
        title: 'Optional Field (default null)',
        default: null,
      },
      // Nullable with default value
      withDefault: {
        type: ['string', 'null'],
        title: 'With Default Value',
        default: 'default value',
      },
      // Nullable enum
      category: {
        type: ['string', 'null'],
        enum: ['A', 'B', 'C', null],
        title: 'Category (nullable enum)',
      },
      // Complex nullable array
      complexArray: {
        type: ['array', 'null'],
        title: 'Nullable Array with Nullable Object Items',
        items: {
          type: ['object', 'null'],
          properties: {
            value: { type: ['string', 'null'] },
          },
        },
      },
      // Nullable with validation
      validatedField: {
        type: ['string', 'null'],
        title: 'Validated Field (email format when not null)',
        format: 'email',
        minLength: 5,
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <h3>Edge Cases - Nullable Types</h3>
      <p>Testing edge cases and special scenarios with nullable array syntax</p>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue({
              placeholder: null,
              optionalField: 'filled',
              withDefault: 'custom value',
              category: 'A',
              complexArray: [
                { value: 'item1' },
                null,
                { value: null },
                { value: 'item2' },
              ],
              validatedField: 'test@example.com',
            })
          }
        >
          Set All Values
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              placeholder: null,
              optionalField: null,
              withDefault: null,
              category: null,
              complexArray: null,
              validatedField: null,
            })
          }
        >
          Set All to null
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              category: 'B',
              complexArray: [null, null, { value: 'only one' }],
            })
          }
        >
          Set Edge Case Values
        </button>
        <button
          onClick={() => formHandle.current?.setValue({ withDefault: null })}
        >
          Override Default with null
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffc107',
        }}
      >
        <h4>Edge Case Notes:</h4>
        <ul style={{ marginBottom: 0 }}>
          <li>
            <strong>Pure null type</strong>: <code>{`type: 'null'`}</code>{' '}
            always holds null
          </li>
          <li>
            <strong>Default null</strong>: <code>{`default: null`}</code>{' '}
            initializes as null
          </li>
          <li>
            <strong>Nullable enum</strong>: Can include null in enum values
          </li>
          <li>
            <strong>Nested nullable</strong>: Arrays/objects can contain null
            items
          </li>
          <li>
            <strong>Validation</strong>: Applied only when value is not null
          </li>
        </ul>
      </div>
    </div>
  );
};
