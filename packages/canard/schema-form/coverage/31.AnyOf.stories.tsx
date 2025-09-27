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
  title: 'Form/31. AnyOf',
};

export const BasicAnyOf = () => {
  const schema = {
    type: 'object',
    anyOf: [
      {
        computed: {
          if: "./category === 'game'",
        },
        properties: {
          date1: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price1: { type: 'number' },
        },
      },
      {
        computed: {
          if: "./category === 'movie' || ./category === 'console'",
        },
        properties: {
          date2: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price2: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        computed: {
          if: "./category === 'console'",
        },
        properties: {
          date3: {
            type: 'string',
            format: 'date',
            '&active': '../title === "wow"',
          },
          price3: {
            type: 'number',
            minimum: 50,
          },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie', 'console'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const SimpleConditionalAnyOf = () => {
  const schema = {
    type: 'object',
    anyOf: [
      {
        computed: {
          if: "./mode === 'basic'",
        },
        properties: {
          name: { type: 'string', minLength: 2 },
        },
      },
      {
        computed: {
          if: "./mode === 'advanced'",
        },
        properties: {
          firstName: { type: 'string', minLength: 2 },
        },
      },
      {
        computed: {
          if: "./mode === 'advanced'",
        },
        properties: {
          lastName: { type: 'string', minLength: 2 },
        },
      },
      {
        computed: {
          if: "./mode === 'advanced'",
        },
        properties: {
          phone: { type: 'string', pattern: '^[0-9-+()\\s]+$' },
        },
      },
    ],
    properties: {
      mode: {
        type: 'string',
        enum: ['basic', 'advanced'],
        default: 'basic',
      },
      email: { type: 'string', format: 'email' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 20, gap: 10, display: 'flex' }}>
        <button
          onClick={() => {
            formHandle.current?.setValue({
              mode: 'basic',
              name: 'John Doe',
              email: 'john@example.com',
            });
          }}
        >
          Fill Basic Mode
        </button>
        <button
          onClick={() => {
            formHandle.current?.setValue({
              mode: 'advanced',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
              phone: '+1-555-0123',
            });
          }}
        >
          Fill Advanced Mode
        </button>
      </div>
    </StoryLayout>
  );
};

export const NestedObjectAnyOf = () => {
  const schema = {
    type: 'object',
    properties: {
      userType: {
        type: 'string',
        enum: ['individual', 'company'],
        default: 'individual',
      },
      details: {
        type: 'object',
        anyOf: [
          {
            computed: {
              if: "../userType === 'individual'",
            },
            properties: {
              firstName: { type: 'string', minLength: 2 },
            },
            required: ['firstName'],
          },
          {
            computed: {
              if: "../userType === 'individual'",
            },
            properties: {
              lastName: { type: 'string', minLength: 2 },
            },
            required: ['lastName'],
          },
          {
            computed: {
              if: "../userType === 'individual'",
            },
            properties: {
              age: { type: 'number', minimum: 0, maximum: 150 },
            },
          },
          {
            computed: {
              if: "../userType === 'company'",
            },
            properties: {
              companyName: { type: 'string', minLength: 3 },
            },
            required: ['companyName'],
          },
          {
            computed: {
              if: "../userType === 'company'",
            },
            properties: {
              registrationNumber: { type: 'string', pattern: '^[A-Z0-9]{8,}$' },
            },
            required: ['registrationNumber'],
          },
          {
            computed: {
              if: "../userType === 'company'",
            },
            properties: {
              employees: { type: 'number', minimum: 1 },
            },
          },
        ],
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 20, gap: 10, display: 'flex' }}>
        <button
          onClick={() => {
            formHandle.current?.setValue({
              userType: 'individual',
              details: {
                firstName: 'John',
                lastName: 'Doe',
                age: 30,
              },
            });
          }}
        >
          Fill Individual
        </button>
        <button
          onClick={() => {
            formHandle.current?.setValue({
              userType: 'company',
              details: {
                companyName: 'Tech Corp',
                registrationNumber: 'TC123456789',
                employees: 100,
              },
            });
          }}
        >
          Fill Company
        </button>
      </div>
    </StoryLayout>
  );
};

export const ArrayWithAnyOf = () => {
  const schema = {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['text', 'number', 'date'],
              default: 'text',
            },
          },
          anyOf: [
            {
              computed: {
                if: "./type === 'text'",
              },
              properties: {
                content: { type: 'string', minLength: 1 },
              },
              required: ['content'],
            },
            {
              computed: {
                if: "./type === 'number'",
              },
              properties: {
                value: { type: 'number' },
              },
              required: ['value'],
            },
            {
              computed: {
                if: "./type === 'number'",
              },
              properties: {
                unit: { type: 'string' },
              },
            },
            {
              computed: {
                if: "./type === 'date'",
              },
              properties: {
                date: { type: 'string', format: 'date' },
              },
              required: ['date'],
            },
            {
              computed: {
                if: "./type === 'date'",
              },
              properties: {
                label: { type: 'string' },
              },
            },
          ],
        },
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <button
        onClick={() => {
          formHandle.current?.setValue({
            items: [
              { type: 'text', content: 'Sample text item' },
              { type: 'number', value: 42, unit: 'kg' },
              { type: 'date', date: '2024-01-15', label: 'Important date' },
            ],
          });
        }}
      >
        Add Sample Items
      </button>
    </StoryLayout>
  );
};

export const ConditionalAnyOf = () => {
  const schema = {
    type: 'object',
    properties: {
      paymentMethod: {
        type: 'string',
        enum: ['creditCard', 'paypal', 'bankTransfer'],
        default: 'creditCard',
      },
      paymentDetails: {
        type: 'object',
        anyOf: [
          {
            computed: {
              if: "../paymentMethod === 'creditCard'",
            },
            properties: {
              cardNumber: {
                type: 'string',
                pattern: '^[0-9]{16}$',
                title: 'Card Number (16 digits)',
              },
            },
            required: ['cardNumber'],
          },
          {
            computed: {
              if: "../paymentMethod === 'creditCard'",
            },
            properties: {
              expiryDate: {
                type: 'string',
                pattern: '^(0[1-9]|1[0-2])/[0-9]{2}$',
                title: 'MM/YY',
              },
            },
            required: ['expiryDate'],
          },
          {
            computed: {
              if: "../paymentMethod === 'creditCard'",
            },
            properties: {
              cvv: {
                type: 'string',
                pattern: '^[0-9]{3,4}$',
                title: 'CVV',
              },
            },
            required: ['cvv'],
          },
          {
            computed: {
              if: "../paymentMethod === 'paypal'",
            },
            properties: {
              email: {
                type: 'string',
                format: 'email',
              },
            },
            required: ['email'],
          },
          {
            computed: {
              if: "../paymentMethod === 'paypal'",
            },
            properties: {
              password: {
                type: 'string',
                minLength: 8,
              },
            },
          },
          {
            computed: {
              if: "../paymentMethod === 'bankTransfer'",
            },
            properties: {
              accountNumber: {
                type: 'string',
                pattern: '^[0-9]{10,}$',
              },
            },
            required: ['accountNumber'],
          },
          {
            computed: {
              if: "../paymentMethod === 'bankTransfer'",
            },
            properties: {
              routingNumber: {
                type: 'string',
                pattern: '^[0-9]{9}$',
              },
            },
            required: ['routingNumber'],
          },
          {
            computed: {
              if: "../paymentMethod === 'bankTransfer'",
            },
            properties: {
              bankName: { type: 'string' },
            },
          },
        ],
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  const sampleData = {
    creditCard: {
      paymentMethod: 'creditCard',
      paymentDetails: {
        cardNumber: '1234567812345678',
        expiryDate: '12/25',
        cvv: '123',
      },
    },
    paypal: {
      paymentMethod: 'paypal',
      paymentDetails: {
        email: 'user@example.com',
        password: 'password123',
      },
    },
    bankTransfer: {
      paymentMethod: 'bankTransfer',
      paymentDetails: {
        accountNumber: '1234567890',
        routingNumber: '123456789',
        bankName: 'Example Bank',
      },
    },
  };

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div
        style={{ marginTop: 20, gap: 10, display: 'flex', flexWrap: 'wrap' }}
      >
        <button
          onClick={() => formHandle.current?.setValue(sampleData.creditCard)}
        >
          Fill Credit Card
        </button>
        <button onClick={() => formHandle.current?.setValue(sampleData.paypal)}>
          Fill PayPal
        </button>
        <button
          onClick={() => formHandle.current?.setValue(sampleData.bankTransfer)}
        >
          Fill Bank Transfer
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset Form</button>
        <button
          onClick={async () => {
            const isValid = await formHandle.current?.validate();
            console.log('Form is valid:', isValid);
            console.log('Current value:', formHandle.current?.getValue());
          }}
        >
          Validate
        </button>
      </div>
    </StoryLayout>
  );
};

export const MixedAnyOfWithAllOf = () => {
  const schema = {
    type: 'object',
    properties: {
      entityType: {
        type: 'string',
        enum: ['person', 'organization'],
        default: 'person',
      },
      data: {
        type: 'object',
        allOf: [
          {
            properties: {
              id: { type: 'string' },
              createdAt: { type: 'string', format: 'date' },
            },
            required: ['id'],
          },
          {
            anyOf: [
              {
                computed: {
                  if: "../entityType === 'person'",
                },
                properties: {
                  firstName: { type: 'string' },
                },
                required: ['firstName'],
              },
              {
                computed: {
                  if: "../entityType === 'person'",
                },
                properties: {
                  lastName: { type: 'string' },
                },
                required: ['lastName'],
              },
              {
                computed: {
                  if: "../entityType === 'person'",
                },
                properties: {
                  dateOfBirth: { type: 'string', format: 'date' },
                },
              },
              {
                computed: {
                  if: "../entityType === 'organization'",
                },
                properties: {
                  organizationName: { type: 'string' },
                },
                required: ['organizationName'],
              },
              {
                computed: {
                  if: "../entityType === 'organization'",
                },
                properties: {
                  taxId: { type: 'string' },
                },
              },
              {
                computed: {
                  if: "../entityType === 'organization'",
                },
                properties: {
                  foundedYear: { type: 'number', minimum: 1800, maximum: 2100 },
                },
              },
            ],
          },
        ],
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 20 }}>
        <h4>RefHandle Operations</h4>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              const node = formHandle.current?.node;
              console.log('Root node:', node);
              console.log('Current value:', formHandle.current?.getValue());
              console.log('Is valid:', await formHandle.current?.validate());
            }}
          >
            Log Form State
          </button>
          <button
            onClick={() => {
              formHandle.current?.setValue({
                entityType: 'person',
                data: {
                  id: 'PERS-001',
                  createdAt: '2024-01-01',
                  firstName: 'Jane',
                  lastName: 'Smith',
                  dateOfBirth: '1990-05-15',
                },
              });
            }}
          >
            Set Person
          </button>
          <button
            onClick={() => {
              formHandle.current?.setValue({
                entityType: 'organization',
                data: {
                  id: 'ORG-001',
                  createdAt: '2024-01-01',
                  organizationName: 'Tech Solutions Inc',
                  taxId: 'TAX-12345',
                  foundedYear: 2010,
                },
              });
            }}
          >
            Set Organization
          </button>
          <button
            onClick={() => {
              const currentValue = formHandle.current?.getValue() || {};
              const updatedValue = {
                ...currentValue,
                data: {
                  ...currentValue.data,
                  id: `ID-${Date.now()}`,
                  createdAt: new Date().toISOString().split('T')[0],
                },
              };
              formHandle.current?.setValue(updatedValue);
            }}
          >
            Update ID & Date
          </button>
          <button onClick={() => formHandle.current?.reset()}>Reset</button>
        </div>
      </div>
    </StoryLayout>
  );
};

export const AnyOfValuePreservationDemo = () => {
  const schema = {
    type: 'object',
    properties: {
      enableFeatureA: {
        type: 'boolean',
        default: true,
        title: 'Enable Feature A',
      },
      enableFeatureB: {
        type: 'boolean',
        default: false,
        title: 'Enable Feature B',
      },
      enableFeatureC: {
        type: 'boolean',
        default: false,
        title: 'Enable Feature C',
      },
    },
    anyOf: [
      {
        computed: {
          if: './enableFeatureA === true',
        },
        properties: {
          featureAConfig: {
            type: 'object',
            title: 'Feature A Configuration',
            properties: {
              settingA1: {
                type: 'string',
                title: 'A1 Setting',
                default: 'default A1',
              },
              settingA2: { type: 'number', title: 'A2 Setting', default: 100 },
              settingA3: {
                type: 'boolean',
                title: 'A3 Setting',
                default: false,
              },
            },
          },
        },
      },
      {
        computed: {
          if: './enableFeatureB === true',
        },
        properties: {
          featureBConfig: {
            type: 'object',
            title: 'Feature B Configuration',
            properties: {
              settingB1: { type: 'string', title: 'B1 Setting' },
              settingB2: { type: 'number', title: 'B2 Setting', default: 50 },
              settingB3: {
                type: 'boolean',
                title: 'B3 Setting',
                default: true,
              },
            },
          },
        },
      },
      {
        computed: {
          if: './enableFeatureC === true',
        },
        properties: {
          featureCConfig: {
            type: 'object',
            title: 'Feature C Configuration',
            properties: {
              settingC1: {
                type: 'string',
                title: 'C1 Setting',
                default: 'C default',
              },
              settingC2: {
                type: 'array',
                title: 'C2 Items',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div
        style={{
          marginBottom: 20,
          padding: 15,
          border: '1px solid #ccc',
          borderRadius: 5,
          backgroundColor: '#f9f9f9',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>
          AnyOf Value Preservation Demo
        </h4>
        <p style={{ margin: '0 0 10px 0', fontSize: 14, color: '#666' }}>
          This demo shows how values are preserved when anyOf conditions change.
          Values in currently active anyOf indices (__anyOfIndices__) are
          preserved, while others are reset.
        </p>
        <ul style={{ margin: 0, fontSize: 14, color: '#666', paddingLeft: 20 }}>
          <li>Enable Feature A and set some values</li>
          <li>Enable Feature B - Feature A values should be preserved</li>
          <li>Disable Feature A - Feature A values should be cleared</li>
          <li>
            Re-enable Feature A - Feature A values should reset to defaults
          </li>
        </ul>
      </div>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div
        style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}
      >
        <button
          onClick={() => {
            formHandle.current?.setValue({
              enableFeatureA: true,
              enableFeatureB: false,
              enableFeatureC: false,
              featureAConfig: {
                settingA1: 'Custom A1',
                settingA2: 200,
                settingA3: true,
              },
            });
          }}
        >
          Set Feature A Only
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({
              ...current,
              enableFeatureB: true,
              featureBConfig: {
                settingB1: 'Custom B1',
                settingB2: 75,
                settingB3: false,
              },
            });
          }}
        >
          Enable Feature B (preserve A)
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({
              ...current,
              enableFeatureC: true,
              featureCConfig: {
                settingC1: 'Custom C1',
                settingC2: ['item1', 'item2'],
              },
            });
          }}
        >
          Enable Feature C
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({
              ...current,
              enableFeatureA: false,
            });
          }}
        >
          Disable Feature A
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({
              ...current,
              enableFeatureB: false,
            });
          }}
        >
          Disable Feature B
        </button>
        <button
          onClick={() => {
            const current = formHandle.current?.getValue() || {};
            formHandle.current?.setValue({
              ...current,
              enableFeatureC: false,
            });
          }}
        >
          Disable Feature C
        </button>
        <button
          onClick={() => {
            formHandle.current?.setValue({
              enableFeatureA: true,
              enableFeatureB: true,
              enableFeatureC: true,
            });
          }}
        >
          Enable All Features
        </button>
        <button
          onClick={() => {
            formHandle.current?.setValue({
              enableFeatureA: false,
              enableFeatureB: false,
              enableFeatureC: false,
            });
          }}
        >
          Disable All Features
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset Form</button>
        <button
          onClick={() => {
            console.log(
              'Current Value:',
              JSON.stringify(formHandle.current?.getValue(), null, 2),
            );
            const node = formHandle.current?.node;
            console.log('Current anyOf indices:', node?.anyOfIndices);
          }}
        >
          Log State & AnyOf Indices
        </button>
      </div>
    </StoryLayout>
  );
};

export const SimpleAnyOfValuePreservation = () => {
  const schema = {
    type: 'object',
    properties: {
      showA: { type: 'boolean', default: true, title: 'Show Section A' },
      showB: { type: 'boolean', default: false, title: 'Show Section B' },
    },
    anyOf: [
      {
        computed: { if: './showA === true' },
        properties: {
          valueA: { type: 'string', title: 'Value A' },
        },
      },
      {
        computed: { if: './showB === true' },
        properties: {
          valueB: { type: 'number', title: 'Value B' },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div
        style={{
          marginBottom: 15,
          padding: 10,
          backgroundColor: '#f0f8ff',
          borderRadius: 5,
        }}
      >
        <h4 style={{ margin: '0 0 5px 0' }}>AnyOf Value Preservation Test</h4>
        <p style={{ margin: 0, fontSize: 12 }}>
          ✅ Values preserved when anyOf condition remains active
          <br />❌ Values cleared when anyOf condition becomes inactive
        </p>
      </div>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              showA: true,
              showB: false,
              valueA: 'Test A',
            })
          }
        >
          Enable A Only
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              showA: true,
              showB: true,
              valueA: 'Test A',
              valueB: 123,
            })
          }
        >
          Enable Both
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              showA: false,
              showB: true,
              valueB: 456,
            })
          }
        >
          Enable B Only
        </button>
      </div>
    </StoryLayout>
  );
};

export const CombinedAnyOfAndOneOf = () => {
  const schema = {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['electronics', 'clothing', 'food'],
        default: 'electronics',
        title: 'Product Category',
      },
      enableDiscount: {
        type: 'boolean',
        default: false,
        title: 'Enable Discount',
      },
      enableWarranty: {
        type: 'boolean',
        default: false,
        title: 'Enable Warranty',
      },
    },
    oneOf: [
      {
        computed: { if: "./category === 'electronics'" },
        properties: {
          model: { type: 'string', title: 'Model' },
          voltage: { type: 'number', title: 'Voltage (V)' },
        },
      },
      {
        computed: { if: "./category === 'clothing'" },
        properties: {
          size: { type: 'string', enum: ['S', 'M', 'L', 'XL'], title: 'Size' },
          color: { type: 'string', title: 'Color' },
        },
      },
      {
        computed: { if: "./category === 'food'" },
        properties: {
          expiryDate: { type: 'string', format: 'date', title: 'Expiry Date' },
          weight: { type: 'number', title: 'Weight (g)' },
        },
      },
    ],
    anyOf: [
      {
        computed: { if: './enableDiscount === true' },
        properties: {
          discountPercent: {
            type: 'number',
            title: 'Discount (%)',
            minimum: 0,
            maximum: 100,
            default: 10,
          },
        },
      },
      {
        computed: { if: './enableWarranty === true' },
        properties: {
          warrantyMonths: {
            type: 'number',
            title: 'Warranty (months)',
            minimum: 1,
            default: 12,
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div
        style={{
          marginBottom: 15,
          padding: 10,
          backgroundColor: '#e7f3ff',
          borderRadius: 5,
        }}
      >
        <h4 style={{ margin: '0 0 5px 0' }}>Combined AnyOf + OneOf Demo</h4>
        <p style={{ margin: 0, fontSize: 12 }}>
          <strong>OneOf</strong>: Category-specific fields (only one active at a
          time)
          <br />
          <strong>AnyOf</strong>: Optional features (multiple can be active)
        </p>
      </div>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              category: 'electronics',
              model: 'iPhone 15',
              voltage: 220,
              enableDiscount: true,
              enableWarranty: true,
              discountPercent: 15,
              warrantyMonths: 24,
            })
          }
        >
          Electronics + All Features
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              category: 'clothing',
              size: 'M',
              color: 'Blue',
              enableDiscount: true,
              discountPercent: 20,
            })
          }
        >
          Clothing + Discount
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              category: 'food',
              expiryDate: '2025-12-31',
              weight: 500,
              enableWarranty: false,
              enableDiscount: false,
            })
          }
        >
          Food (No Features)
        </button>
      </div>
    </StoryLayout>
  );
};
