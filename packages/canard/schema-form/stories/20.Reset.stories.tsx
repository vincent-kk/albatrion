import { useRef, useState } from 'react';

import type { FormHandle } from '../src';
import { Form, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/20. Reset',
};

export const ResetWithSchemaChange = () => {
  const [schemaVersion, setSchemaVersion] = useState(1);
  const [value, setValue] = useState<Record<string, unknown>>();

  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        default: `Schema v${schemaVersion} - Default Name`,
      },
      age: {
        type: 'number',
        default: schemaVersion * 10,
      },
      ...(schemaVersion === 2 && {
        email: {
          type: 'string',
          format: 'email',
          default: 'v2@example.com',
        },
      }),
      ...(schemaVersion === 3 && {
        email: {
          type: 'string',
          format: 'email',
          default: 'v3@example.com',
        },
        phone: {
          type: 'string',
          default: '010-1234-5678',
        },
      }),
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<any>>(null);

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => setSchemaVersion(1)}>Schema v1</button>
        <button onClick={() => setSchemaVersion(2)}>Schema v2</button>
        <button onClick={() => setSchemaVersion(3)}>Schema v3</button>
        <button
          onClick={() => formHandle.current?.reset()}
          style={{ backgroundColor: '#007bff', color: 'white' }}
        >
          Reset Form
        </button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Current Schema Version: {schemaVersion}</strong>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formHandle} jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const ResetWithDefaultValueChange = () => {
  const [defaultVersion, setDefaultVersion] = useState(1);
  const [value, setValue] = useState<Record<string, unknown>>();

  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
      city: {
        type: 'string',
      },
    },
  } satisfies JsonSchema;

  const defaultValues = [
    {
      name: 'John Doe',
      age: 25,
      city: 'New York',
    },
    {
      name: 'Jane Smith',
      age: 30,
      city: 'Los Angeles',
    },
    {
      name: 'Bob Johnson',
      age: 35,
      city: 'Chicago',
    },
  ];

  const formHandle = useRef<FormHandle<any>>(null);

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => setDefaultVersion(1)}>Default Set 1</button>
        <button onClick={() => setDefaultVersion(2)}>Default Set 2</button>
        <button onClick={() => setDefaultVersion(3)}>Default Set 3</button>
        <button
          onClick={() => formHandle.current?.reset()}
          style={{ backgroundColor: '#007bff', color: 'white' }}
        >
          Reset Form
        </button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Current Default Set: {defaultVersion}</strong>
        <pre
          style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}
        >
          {JSON.stringify(defaultValues[defaultVersion - 1], null, 2)}
        </pre>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={jsonSchema}
          defaultValue={defaultValues[defaultVersion - 1]}
          onChange={setValue}
        />
      </StoryLayout>
    </div>
  );
};

export const ResetWithBothChanges = () => {
  const [configVersion, setConfigVersion] = useState<
    'simple' | 'advanced' | 'expert'
  >('simple');
  const [value, setValue] = useState<Record<string, unknown>>();

  const configs = {
    simple: {
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      } as JsonSchema,
      defaultValue: {
        name: 'Simple User',
        age: 20,
      },
    },
    advanced: {
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string', format: 'email' },
          preferences: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark'] },
              notifications: { type: 'boolean' },
            },
          },
        },
      } as JsonSchema,
      defaultValue: {
        name: 'Advanced User',
        age: 25,
        email: 'advanced@example.com',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      },
    },
    expert: {
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string', format: 'email' },
          preferences: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark'] },
              notifications: { type: 'boolean' },
            },
          },
          skills: {
            type: 'array',
            items: { type: 'string' },
          },
          settings: {
            type: 'object',
            properties: {
              privacy: { type: 'string', enum: ['public', 'private'] },
              language: { type: 'string', default: 'en' },
            },
          },
        },
      } as JsonSchema,
      defaultValue: {
        name: 'Expert User',
        age: 35,
        email: 'expert@example.com',
        preferences: {
          theme: 'light',
          notifications: false,
        },
        skills: ['JavaScript', 'TypeScript', 'React'],
        settings: {
          privacy: 'private',
          language: 'ko',
        },
      },
    },
  };

  const currentConfig = configs[configVersion];
  const formHandle = useRef<FormHandle<any>>(null);

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setConfigVersion('simple')}
          style={{
            backgroundColor: configVersion === 'simple' ? '#28a745' : '#6c757d',
            color: 'white',
          }}
        >
          Simple Config
        </button>
        <button
          onClick={() => setConfigVersion('advanced')}
          style={{
            backgroundColor:
              configVersion === 'advanced' ? '#28a745' : '#6c757d',
            color: 'white',
          }}
        >
          Advanced Config
        </button>
        <button
          onClick={() => setConfigVersion('expert')}
          style={{
            backgroundColor: configVersion === 'expert' ? '#28a745' : '#6c757d',
            color: 'white',
          }}
        >
          Expert Config
        </button>
        <button
          onClick={() => formHandle.current?.reset()}
          style={{ backgroundColor: '#007bff', color: 'white' }}
        >
          Reset Form
        </button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Current Config: {configVersion}</strong>
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer' }}>Show Default Value</summary>
          <pre
            style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}
          >
            {JSON.stringify(currentConfig.defaultValue, null, 2)}
          </pre>
        </details>
      </div>
      <StoryLayout jsonSchema={currentConfig.schema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={currentConfig.schema}
          defaultValue={currentConfig.defaultValue}
          onChange={setValue}
        />
      </StoryLayout>
    </div>
  );
};

export const ResetBehaviorTest = () => {
  const [schemaType, setSchemaType] = useState<'user' | 'product'>('user');
  const [value, setValue] = useState<Record<string, unknown>>();
  const [userInput, setUserInput] = useState('');

  const schemas = {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string', default: 'Default User Name' },
        email: { type: 'string', format: 'email', default: 'user@example.com' },
        role: { type: 'string', enum: ['admin', 'user'], default: 'user' },
      },
    } as JsonSchema,
    product: {
      type: 'object',
      properties: {
        title: { type: 'string', default: 'Default Product Title' },
        price: { type: 'number', default: 99.99 },
        category: {
          type: 'string',
          enum: ['electronics', 'books', 'clothing'],
          default: 'electronics',
        },
        inStock: { type: 'boolean', default: true },
      },
    } as JsonSchema,
  };

  const formHandle = useRef<FormHandle<any>>(null);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3>Reset Behavior Test</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          1. Change schema type but notice form doesn't update
          <br />
          2. Modify form values
          <br />
          3. Click Reset to apply new schema and reset values
        </p>
      </div>

      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <label>
          <input
            type="radio"
            name="schemaType"
            checked={schemaType === 'user'}
            onChange={() => setSchemaType('user')}
          />
          User Schema
        </label>
        <label>
          <input
            type="radio"
            name="schemaType"
            checked={schemaType === 'product'}
            onChange={() => setSchemaType('product')}
          />
          Product Schema
        </label>
        <button
          onClick={() => formHandle.current?.reset()}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            marginLeft: '20px',
          }}
        >
          Reset Form
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Test Input (independent of form):
        </label>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type something..."
          style={{ padding: '5px', width: '200px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Current Schema Type: {schemaType}</strong>
      </div>

      <StoryLayout jsonSchema={schemas[schemaType]} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={schemas[schemaType]}
          onChange={setValue}
        />
      </StoryLayout>
    </div>
  );
};
