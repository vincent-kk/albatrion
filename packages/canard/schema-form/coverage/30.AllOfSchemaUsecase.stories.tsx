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
  title: 'Form/30. AllOf Schema Usecase',
};

export const BasicAllOf = () => {
  const schema = {
    type: 'object',
    allOf: [
      {
        properties: {
          firstName: { type: 'string', title: 'First Name' },
        },
      },
      {
        properties: {
          lastName: { type: 'string', title: 'Last Name' },
        },
      },
      {
        properties: {
          age: { type: 'number', title: 'Age', minimum: 0, maximum: 120 },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfWithRequired = () => {
  const schema = {
    type: 'object',
    allOf: [
      {
        properties: {
          firstName: { type: 'string', title: 'First Name' },
        },
        required: ['firstName'],
      },
      {
        properties: {
          lastName: { type: 'string', title: 'Last Name' },
        },
        required: ['lastName'],
      },
      {
        properties: {
          email: { type: 'string', format: 'email', title: 'Email' },
        },
        required: ['email'],
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfWithDefaultValues = () => {
  const schema = {
    type: 'object',
    allOf: [
      {
        properties: {
          firstName: {
            type: 'string',
            title: 'First Name',
            default: 'John',
          },
        },
      },
      {
        properties: {
          lastName: {
            type: 'string',
            title: 'Last Name',
            default: 'Doe',
          },
        },
      },
      {
        properties: {
          country: {
            type: 'string',
            title: 'Country',
            enum: ['USA', 'Canada', 'UK', 'Germany', 'France'],
            default: 'USA',
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfWithValidation = () => {
  const schema = {
    type: 'object',
    allOf: [
      {
        properties: {
          email: {
            type: 'string',
            format: 'email',
            title: 'Email Address',
          },
        },
      },
      {
        properties: {
          email: {
            minLength: 5,
            maxLength: 50,
          },
        },
      },
      {
        properties: {
          password: {
            type: 'string',
            title: 'Password',
            minLength: 8,
          },
        },
      },
      {
        properties: {
          password: {
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const NestedAllOf = () => {
  const schema = {
    type: 'object',
    allOf: [
      {
        properties: {
          user: {
            type: 'object',
            title: 'User Information',
            allOf: [
              {
                properties: {
                  name: { type: 'string', title: 'Name' },
                },
              },
              {
                properties: {
                  age: { type: 'number', title: 'Age', minimum: 0 },
                },
              },
            ],
          },
        },
      },
      {
        properties: {
          address: {
            type: 'object',
            title: 'Address Information',
            properties: {
              street: { type: 'string', title: 'Street' },
              city: { type: 'string', title: 'City' },
              zipCode: { type: 'string', title: 'ZIP Code' },
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfWithBaseProperties = () => {
  const schema = {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        title: 'ID',
        default: 1,
        readOnly: true,
      },
    },
    allOf: [
      {
        properties: {
          name: { type: 'string', title: 'Name' },
        },
        required: ['name'],
      },
      {
        properties: {
          email: { type: 'string', format: 'email', title: 'Email' },
        },
        required: ['email'],
      },
      {
        properties: {
          role: {
            type: 'string',
            title: 'Role',
            enum: ['admin', 'user', 'guest'],
            default: 'user',
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfWithAdditionalProperties = () => {
  const schema = {
    type: 'object',
    allOf: [
      {
        properties: {
          name: { type: 'string', title: 'Name' },
        },
        additionalProperties: false,
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfWithComputedProperties = () => {
  const schema = {
    type: 'object',
    allOf: [
      {
        properties: {
          firstName: { type: 'string', title: 'First Name' },
        },
      },
      {
        properties: {
          lastName: { type: 'string', title: 'Last Name' },
        },
      },
      {
        properties: {
          fullName: {
            type: 'string',
            title: 'Full Name',
            computed: {
              visible: '../firstName && ../lastName',
              value: '../firstName + " " + ../lastName',
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const ComplexAllOfUserProfile = () => {
  const schema = {
    type: 'object',
    title: 'User Profile',
    allOf: [
      {
        title: 'Personal Information',
        properties: {
          personalInfo: {
            type: 'object',
            title: 'Personal Information',
            properties: {
              firstName: { type: 'string', title: 'First Name', minLength: 1 },
              lastName: { type: 'string', title: 'Last Name', minLength: 1 },
              dateOfBirth: {
                type: 'string',
                format: 'date',
                title: 'Date of Birth',
              },
            },
            required: ['firstName', 'lastName'],
          },
        },
      },
      {
        title: 'Contact Information',
        properties: {
          contactInfo: {
            type: 'object',
            title: 'Contact Information',
            properties: {
              email: { type: 'string', format: 'email', title: 'Email' },
              phone: { type: 'string', pattern: '^[0-9-]+$', title: 'Phone' },
              address: {
                type: 'object',
                title: 'Address',
                properties: {
                  street: { type: 'string', title: 'Street' },
                  city: { type: 'string', title: 'City' },
                  state: { type: 'string', title: 'State' },
                  zipCode: { type: 'string', title: 'ZIP Code' },
                },
              },
            },
            required: ['email'],
          },
        },
      },
      {
        title: 'Preferences',
        properties: {
          preferences: {
            type: 'object',
            title: 'Preferences',
            properties: {
              newsletter: {
                type: 'boolean',
                title: 'Subscribe to Newsletter',
                default: false,
              },
              theme: {
                type: 'string',
                title: 'Theme',
                enum: ['light', 'dark', 'auto'],
                default: 'light',
              },
              language: {
                type: 'string',
                title: 'Language',
                enum: ['en', 'ko', 'ja', 'zh'],
                default: 'en',
              },
            },
          },
        },
      },
      {
        title: 'Professional Information',
        properties: {
          professional: {
            type: 'object',
            title: 'Professional Information',
            properties: {
              company: { type: 'string', title: 'Company' },
              position: { type: 'string', title: 'Position' },
              experience: {
                type: 'number',
                title: 'Years of Experience',
                minimum: 0,
                maximum: 50,
              },
              skills: {
                type: 'array',
                title: 'Skills',
                items: { type: 'string' },
                uniqueItems: true,
              },
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfTypeConflictHandling = () => {
  const schema = {
    type: 'object',
    allOf: [
      {
        type: 'object',
        properties: {
          value: { type: 'string', title: 'String Value' },
        },
      },
      {
        type: 'object',
        properties: {
          count: { type: 'number', title: 'Number Count', minimum: 0 },
        },
      },
    ],
  } as JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfWithRef = () => {
  const schema = {
    type: 'object',
    $defs: {
      PersonalInfo: {
        type: 'object',
        properties: {
          firstName: { type: 'string', title: 'First Name', minLength: 1 },
          lastName: { type: 'string', title: 'Last Name', minLength: 1 },
          age: { type: 'number', title: 'Age', minimum: 0, maximum: 120 },
        },
        required: ['firstName', 'lastName'],
      },
      ContactInfo: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', title: 'Email' },
          phone: { type: 'string', title: 'Phone Number' },
        },
        required: ['email'],
      },
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string', title: 'Street' },
          city: { type: 'string', title: 'City' },
          state: { type: 'string', title: 'State' },
          zipCode: { type: 'string', title: 'ZIP Code' },
        },
      },
    },
    allOf: [
      {
        $ref: '#/$defs/PersonalInfo',
      },
      {
        $ref: '#/$defs/ContactInfo',
      },
      {
        properties: {
          address: {
            $ref: '#/$defs/Address',
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfWithComplexRef = () => {
  const schema = {
    type: 'object',
    title: 'Employee Profile',
    $defs: {
      BaseEntity: {
        type: 'object',
        properties: {
          id: { type: 'string', title: 'ID', readOnly: true },
          createdAt: {
            type: 'string',
            format: 'date-time',
            title: 'Created At',
            readOnly: true,
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            title: 'Updated At',
            readOnly: true,
          },
        },
        required: ['id'],
      },
      Person: {
        type: 'object',
        properties: {
          firstName: { type: 'string', title: 'First Name', minLength: 1 },
          lastName: { type: 'string', title: 'Last Name', minLength: 1 },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            title: 'Date of Birth',
          },
          gender: {
            type: 'string',
            title: 'Gender',
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
          },
        },
        required: ['firstName', 'lastName'],
      },
      ContactDetails: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', title: 'Email Address' },
          phone: { type: 'string', title: 'Phone Number' },
          emergencyContact: {
            type: 'object',
            title: 'Emergency Contact',
            properties: {
              name: { type: 'string', title: 'Contact Name' },
              relationship: { type: 'string', title: 'Relationship' },
              phone: { type: 'string', title: 'Contact Phone' },
            },
          },
        },
        required: ['email'],
      },
      Employment: {
        type: 'object',
        properties: {
          employeeId: { type: 'string', title: 'Employee ID' },
          department: {
            type: 'string',
            title: 'Department',
            enum: ['engineering', 'marketing', 'sales', 'hr', 'finance'],
          },
          position: { type: 'string', title: 'Position' },
          salary: { type: 'number', title: 'Salary', minimum: 0 },
          startDate: { type: 'string', format: 'date', title: 'Start Date' },
          manager: {
            type: 'object',
            title: 'Manager',
            properties: {
              name: { type: 'string', title: 'Manager Name' },
              email: {
                type: 'string',
                format: 'email',
                title: 'Manager Email',
              },
            },
          },
        },
        required: ['employeeId', 'department', 'position', 'startDate'],
      },
    },
    allOf: [
      { $ref: '#/$defs/BaseEntity' },
      { $ref: '#/$defs/Person' },
      { $ref: '#/$defs/ContactDetails' },
      { $ref: '#/$defs/Employment' },
      {
        properties: {
          preferences: {
            type: 'object',
            title: 'Preferences',
            properties: {
              workFromHome: {
                type: 'boolean',
                title: 'Work From Home',
                default: false,
              },
              notifications: {
                type: 'object',
                title: 'Notification Settings',
                properties: {
                  email: {
                    type: 'boolean',
                    title: 'Email Notifications',
                    default: true,
                  },
                  sms: {
                    type: 'boolean',
                    title: 'SMS Notifications',
                    default: false,
                  },
                  slack: {
                    type: 'boolean',
                    title: 'Slack Notifications',
                    default: true,
                  },
                },
              },
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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

export const AllOfWithNestedRef = () => {
  const schema = {
    type: 'object',
    title: 'Product Catalog',
    $defs: {
      BaseProduct: {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Product Name', minLength: 1 },
          description: { type: 'string', title: 'Description' },
          price: { type: 'number', title: 'Price', minimum: 0 },
          category: {
            type: 'string',
            title: 'Category',
            enum: ['electronics', 'clothing', 'books', 'home', 'sports'],
          },
        },
        required: ['name', 'price', 'category'],
      },
      Inventory: {
        type: 'object',
        properties: {
          sku: { type: 'string', title: 'SKU' },
          stock: { type: 'number', title: 'Stock Quantity', minimum: 0 },
          warehouse: { type: 'string', title: 'Warehouse Location' },
        },
        required: ['sku', 'stock'],
      },
      Dimensions: {
        type: 'object',
        properties: {
          weight: { type: 'number', title: 'Weight (kg)', minimum: 0 },
          dimensions: {
            type: 'object',
            title: 'Dimensions',
            properties: {
              length: { type: 'number', title: 'Length (cm)' },
              width: { type: 'number', title: 'Width (cm)' },
              height: { type: 'number', title: 'Height (cm)' },
            },
          },
        },
      },
    },
    properties: {
      products: {
        type: 'array',
        title: 'Products',
        items: {
          type: 'object',
          allOf: [
            { $ref: '#/$defs/BaseProduct' },
            { $ref: '#/$defs/Inventory' },
            { $ref: '#/$defs/Dimensions' },
            {
              properties: {
                tags: {
                  type: 'array',
                  title: 'Tags',
                  items: { type: 'string' },
                  uniqueItems: true,
                },
                featured: {
                  type: 'boolean',
                  title: 'Featured Product',
                  default: false,
                },
              },
            },
          ],
        },
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
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
