import { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  type JsonSchemaError,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/29. Visible Usecase',
};

export const VisibleVsActiveComparison = () => {
  const schema = {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['visible', 'active'],
        default: 'visible',
        title: 'Control Mode',
      },
      visibleField: {
        type: 'string',
        title: 'Visible Field (Hidden when mode=active)',
        '&visible': '../mode === "visible"',
      },
      activeField: {
        type: 'string',
        title: 'Active Field (Deactivated when mode=active)',
        '&active': '../mode === "visible"',
      },
      alwaysVisible: {
        type: 'string',
        title: 'Always Visible Reference',
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              mode: 'visible',
              visibleField: 'This will stay in data',
              activeField: 'This will be removed',
              alwaysVisible: 'Reference value',
            })
          }
        >
          Set All Values with mode=visible
        </button>
        <button
          style={{ marginLeft: 10 }}
          onClick={() =>
            formHandle.current?.setValue({
              mode: 'active',
              visibleField: 'This will stay in data',
              activeField: 'This will be removed',
              alwaysVisible: 'Reference value',
            })
          }
        >
          Set All Values with mode=active
        </button>
      </div>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 20, padding: 10, background: '#f0f0f0' }}>
        <strong>Notice:</strong>
        <ul>
          <li>visibleField: Hidden but value preserved when mode=active</li>
          <li>activeField: Hidden AND value removed when mode=active</li>
        </ul>
      </div>
    </StoryLayout>
  );
};

export const VisibleFieldPreservesValue = () => {
  const schema = {
    type: 'object',
    properties: {
      showOptional: {
        type: 'boolean',
        title: 'Show Optional Fields',
        default: true,
      },
      requiredField: {
        type: 'string',
        title: 'Required Field (Always Visible)',
      },
      optionalVisibleField: {
        type: 'string',
        title: 'Optional Visible Field (Value Preserved)',
        '&visible': '../showOptional === true',
        default: 'Initial visible value',
      },
      readOnlyValue: {
        type: 'string',
        title: 'Read Only Value Display',
        description: 'Shows the value of optionalVisibleField',
        readOnly: true,
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({
    showOptional: true,
    requiredField: '',
    optionalVisibleField: 'Initial visible value',
    readOnlyValue: 'Initial readOnly value',
  });
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => {
            const currentValue = formHandle.current?.getValue();
            formHandle.current?.setValue({
              ...currentValue,
              optionalVisibleField: 'New value set while visible',
            });
          }}
        >
          Set Value While Visible
        </button>
        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            const currentValue = formHandle.current?.getValue();
            formHandle.current?.setValue({
              ...currentValue,
              showOptional: false,
              optionalVisibleField: 'Value set while hidden',
            });
          }}
        >
          Hide Field & Set Value
        </button>
      </div>
      <Form
        jsonSchema={schema}
        defaultValue={value}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 20, padding: 10, background: '#e8f5e9' }}>
        <strong>Visible Field Behavior:</strong>
        <p>
          The optionalVisibleField value is:{' '}
          <code>{String(value?.optionalVisibleField || 'undefined')}</code>
        </p>
        <p>✓ Value persists even when field is hidden (showOptional=false)</p>
      </div>
    </StoryLayout>
  );
};

export const ActiveFieldRemovesValue = () => {
  const schema = {
    type: 'object',
    properties: {
      enableOptional: {
        type: 'boolean',
        title: 'Enable Optional Fields',
        default: true,
      },
      requiredField: {
        type: 'string',
        title: 'Required Field (Always Active)',
      },
      optionalActiveField: {
        type: 'string',
        title: 'Optional Active Field (Value Removed)',
        '&active': '../enableOptional === true',
        default: 'Initial active value',
      },
      readOnlyValue: {
        type: 'string',
        title: 'Removed Value Display',
        description: 'Shows the value of optionalActiveField',
        readOnly: true,
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({
    enableOptional: true,
    requiredField: '',
    optionalActiveField: 'Initial active value',
    readOnlyValue: 'Initial readOnly value',
  });
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => {
            const currentValue = formHandle.current?.getValue();
            formHandle.current?.setValue({
              ...currentValue,
              optionalActiveField: 'New value set while active',
            });
          }}
        >
          Set Value While Active
        </button>
        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            formHandle.current?.setValue((prev: any) => ({
              ...prev,
              enableOptional: false,
              requiredField: prev?.requiredField || '',
              optionalActiveField: 'This will be removed',
            }));
          }}
        >
          Deactivate Field & Try Set Value
        </button>
      </div>
      <Form
        jsonSchema={schema}
        defaultValue={value}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 20, padding: 10, background: '#ffebee' }}>
        <strong>Active Field Behavior:</strong>
        <p>
          The optionalActiveField value is:{' '}
          <code>{String(value?.optionalActiveField || 'undefined')}</code>
        </p>
        <p>
          ✗ Value is removed when field is deactivated (enableOptional=false)
        </p>
      </div>
    </StoryLayout>
  );
};

export const ComplexFieldDependencies = () => {
  const schema = {
    type: 'object',
    properties: {
      userType: {
        type: 'string',
        enum: ['guest', 'member', 'admin'],
        default: 'guest',
        title: 'User Type',
      },
      name: {
        type: 'string',
        title: 'Name (Always Required)',
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Email (Visible for members/admins)',
        '&visible': '../userType !== "guest"',
      },
      phoneNumber: {
        type: 'string',
        title: 'Phone (Active for members/admins)',
        '&active': '../userType !== "guest"',
      },
      membershipLevel: {
        type: 'string',
        enum: ['basic', 'premium', 'vip'],
        title: 'Membership Level (Visible for members)',
        '&visible': '../userType === "member"',
        default: 'basic',
      },
      membershipExpiry: {
        type: 'string',
        format: 'date',
        title: 'Membership Expiry (Active for members)',
        '&active': '../userType === "member"',
      },
      adminPermissions: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['read', 'write', 'delete', 'manage'],
        },
        title: 'Admin Permissions (Visible for admins)',
        '&visible': '../userType === "admin"',
        default: ['read', 'write'],
      },
      adminCode: {
        type: 'string',
        title: 'Admin Code (Active for admins)',
        '&active': '../userType === "admin"',
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({
    userType: 'guest',
    name: '',
  });
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              userType: 'guest',
              name: 'Guest User',
              email: 'guest@example.com',
              phoneNumber: '123-456-7890',
              membershipLevel: 'premium',
              membershipExpiry: '2025-12-31',
              adminPermissions: ['read', 'write', 'delete'],
              adminCode: 'ADMIN123',
            })
          }
        >
          Set All Fields (Guest)
        </button>
        <button
          style={{ marginLeft: 10 }}
          onClick={() =>
            formHandle.current?.setValue({
              userType: 'member',
              name: 'Member User',
              email: 'member@example.com',
              phoneNumber: '234-567-8901',
              membershipLevel: 'vip',
              membershipExpiry: '2026-12-31',
              adminPermissions: ['manage'],
              adminCode: 'ADMIN456',
            })
          }
        >
          Set All Fields (Member)
        </button>
        <button
          style={{ marginLeft: 10 }}
          onClick={() =>
            formHandle.current?.setValue({
              userType: 'admin',
              name: 'Admin User',
              email: 'admin@example.com',
              phoneNumber: '345-678-9012',
              membershipLevel: 'basic',
              membershipExpiry: '2024-12-31',
              adminPermissions: ['read', 'write', 'delete', 'manage'],
              adminCode: 'ADMIN789',
            })
          }
        >
          Set All Fields (Admin)
        </button>
      </div>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
      <div style={{ marginTop: 20, padding: 10, background: '#f3e5f5' }}>
        <strong>Field Dependencies:</strong>
        <ul style={{ marginTop: 10, fontSize: '0.9em' }}>
          <li>
            <strong>Guest:</strong> Only name is active
          </li>
          <li>
            <strong>Member:</strong>
            <ul>
              <li>email: visible (preserved)</li>
              <li>phoneNumber: active (removed when not member)</li>
              <li>membershipLevel: visible (preserved)</li>
              <li>membershipExpiry: active (removed when not member)</li>
            </ul>
          </li>
          <li>
            <strong>Admin:</strong>
            <ul>
              <li>email: visible (preserved)</li>
              <li>phoneNumber: active (removed when not admin)</li>
              <li>adminPermissions: visible (preserved)</li>
              <li>adminCode: active (removed when not admin)</li>
            </ul>
          </li>
        </ul>
        <p style={{ marginTop: 10 }}>
          <strong>Current Data Keys:</strong>{' '}
          {Object.keys(value || {}).join(', ')}
        </p>
      </div>
    </StoryLayout>
  );
};

export const ConditionalSchema = () => {
  const schema = {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
      openingDate: {
        type: 'string',
        format: 'date',
        '&visible': '../category === "game"',
      },
      openingDate2: {
        type: 'string',
        format: 'date',
        '&active': '../category === "game"',
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        '&visible': '../category === "movie"',
      },
      releaseDate2: {
        type: 'string',
        format: 'date',
        '&active': '../category === "movie"',
      },
      numOfPlayers: { type: 'number' },
      price: {
        type: 'number',
        minimum: 50,
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            category: 'movie',
            title: 'ABC',
            openingDate: '1999-01-01',
            openingDate2: '1231-01-01',
            releaseDate: '2020-02-01',
            releaseDate2: '2020-02-01',
            numOfPlayers: 10,
            price: 100,
          })
        }
      >
        Set Movie
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            category: 'game',
            title: 'DEF',
            openingDate: '2030-02-01',
            openingDate2: '3452-02-01',
            releaseDate: '2030-03-01',
            releaseDate2: '2342-03-01',
            numOfPlayers: 20,
            price: 200,
          })
        }
      >
        Set Game
      </button>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};
