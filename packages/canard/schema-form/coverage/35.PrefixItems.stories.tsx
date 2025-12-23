import { useState } from 'react';

import {
  Form,
  type JsonSchema,
  type JsonSchemaError,
  registerPlugin,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin } from './components/validator';

registerPlugin(plugin);

export default {
  title: 'Form/35. PrefixItems',
};

/**
 * prefixItems Only (Fixed-Length Tuple)
 *
 * JSON Schema `prefixItems` keyword defines schemas for each position in a tuple.
 * When only `prefixItems` is defined (without `items`), the array is implicitly
 * limited to the length of prefixItems.
 *
 * Expected Behavior:
 * - Each array position uses its corresponding prefixItems schema
 * - push() uses the correct prefixItems schema for each position
 * - Array length is limited to prefixItems.length
 * - Default values come from each prefixItems schema
 */
export const PrefixItemsOnly_FixedLengthTuple = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      coordinate: {
        type: 'array',
        title: 'Coordinate [x, y, z]',
        prefixItems: [
          { type: 'number', title: 'X', default: 0 },
          { type: 'number', title: 'Y', default: 0 },
          { type: 'number', title: 'Z', default: 0 },
        ],
        minItems: 3,
      },
      person: {
        type: 'array',
        title: 'Person [name, age, active]',
        prefixItems: [
          { type: 'string', title: 'Name', default: 'Anonymous' },
          { type: 'number', title: 'Age', default: 0 },
          { type: 'boolean', title: 'Active', default: true },
        ],
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems Only (Fixed-Length Tuple)</h3>
      <p>
        <strong>Expected:</strong> Each position in the array uses its own
        schema from <code>prefixItems</code>.
      </p>
      <ul>
        <li>
          <strong>coordinate:</strong> [number, number, number] - 3D coordinate
        </li>
        <li>
          <strong>person:</strong> [string, number, boolean] - heterogeneous
          tuple
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
 * prefixItems + items: false (Explicit Fixed-Length Tuple)
 *
 * When `items: false` is set along with `prefixItems`, it explicitly
 * prevents any additional items beyond the prefixItems length.
 *
 * Expected Behavior:
 * - Array is strictly limited to prefixItems.length
 * - push() is blocked after reaching prefixItems.length
 * - No additional items can be added beyond the tuple
 */
export const PrefixItemsWithItemsFalse_ExplicitFixedTuple = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      rgb: {
        type: 'array',
        title: 'RGB Color [R, G, B]',
        prefixItems: [
          {
            type: 'number',
            title: 'Red (0-255)',
            default: 128,
            minimum: 0,
            maximum: 255,
          },
          {
            type: 'number',
            title: 'Green (0-255)',
            default: 128,
            minimum: 0,
            maximum: 255,
          },
          {
            type: 'number',
            title: 'Blue (0-255)',
            default: 128,
            minimum: 0,
            maximum: 255,
          },
        ],
        items: false,
        minItems: 3,
      },
      address: {
        type: 'array',
        title: 'Address [street, city, zipcode]',
        prefixItems: [
          { type: 'string', title: 'Street', default: '' },
          { type: 'string', title: 'City', default: '' },
          { type: 'string', title: 'Zipcode', default: '' },
        ],
        items: false,
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems + items: false (Explicit Fixed-Length Tuple)</h3>
      <p>
        <strong>Expected:</strong> Array is strictly limited to exactly{' '}
        <code>prefixItems.length</code> items.
      </p>
      <ul>
        <li>
          <strong>rgb:</strong> Exactly 3 numbers (0-255 each) for RGB color
        </li>
        <li>
          <strong>address:</strong> Exactly 3 strings for address components
        </li>
        <li>
          <strong>Note:</strong> push() button should be disabled or blocked
          after reaching the limit
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
 * prefixItems + items Schema (Open Tuple)
 *
 * When both `prefixItems` and `items` schema are defined, the array becomes
 * an "open tuple" - first positions use prefixItems schemas, additional
 * positions use the items schema.
 *
 * Expected Behavior:
 * - Positions 0 to prefixItems.length-1 use prefixItems schemas
 * - Position prefixItems.length onwards use items schema
 * - Array can grow beyond prefixItems.length
 * - push() uses items schema after prefixItems are filled
 */
export const PrefixItemsWithItemsSchema_OpenTuple = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      header_and_data: {
        type: 'array',
        title: 'Header + Data Rows',
        prefixItems: [
          {
            type: 'object',
            title: 'Header Row',
            properties: {
              isHeader: { type: 'boolean', default: true, readOnly: true },
              label: { type: 'string', default: 'Header' },
            },
          },
        ],
        items: {
          type: 'object',
          title: 'Data Row',
          properties: {
            isHeader: { type: 'boolean', default: false, readOnly: true },
            value: { type: 'number', default: 0 },
          },
        },
        minItems: 1,
      },
      command_with_args: {
        type: 'array',
        title: 'Command [name, ...args]',
        prefixItems: [
          { type: 'string', title: 'Command Name', default: 'echo' },
        ],
        items: { type: 'string', title: 'Argument', default: '' },
        minItems: 1,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems + items Schema (Open Tuple)</h3>
      <p>
        <strong>Expected:</strong> First items use <code>prefixItems</code>{' '}
        schemas, additional items use <code>items</code> schema.
      </p>
      <ul>
        <li>
          <strong>header_and_data:</strong> First item is always a header
          (isHeader=true), additional items are data rows (isHeader=false)
        </li>
        <li>
          <strong>command_with_args:</strong> First item is command name,
          subsequent items are arguments
        </li>
        <li>
          <strong>Note:</strong> push() should add data rows after the header,
          not more headers
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
 * Terminal Strategy with prefixItems
 *
 * When the array uses terminal strategy (primitive items), prefixItems
 * still works correctly for each position's default value.
 *
 * Expected Behavior:
 * - Each position uses its prefixItems default value
 * - push() adds values with correct position-based defaults
 * - Terminal strategy means no child nodes are created
 */
export const TerminalStrategyWithPrefixItems = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      mixedPrimitives: {
        type: 'array',
        title: 'Mixed Primitives [string, number, boolean]',
        terminal: true,
        prefixItems: [
          { type: 'string', default: 'hello' },
          { type: 'number', default: 42 },
          { type: 'boolean', default: true },
        ],
        items: false,
        minItems: 3,
      },
      numbersWithDefaults: {
        type: 'array',
        title: 'Numbers with Different Defaults',
        terminal: true,
        prefixItems: [
          { type: 'number', default: 10 },
          { type: 'number', default: 20 },
          { type: 'number', default: 30 },
        ],
        items: { type: 'number', default: 0 },
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>Terminal Strategy with prefixItems</h3>
      <p>
        <strong>Expected:</strong> Terminal strategy uses prefixItems for
        position-based default values.
      </p>
      <ul>
        <li>
          <strong>mixedPrimitives:</strong> ["hello", 42, true] - each position
          has different default
        </li>
        <li>
          <strong>numbersWithDefaults:</strong> [10, 20, 30] initially, push()
          adds 0 (from items.default)
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
 * BranchStrategy with prefixItems (Object Items)
 *
 * When array items are objects, each position can have a completely
 * different object schema using prefixItems.
 *
 * Expected Behavior:
 * - Each position creates child nodes with its own prefixItems schema
 * - Different object structures for each tuple position
 * - Useful for heterogeneous data structures
 */
export const BranchStrategyWithPrefixItems_ObjectItems = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      form_row: {
        type: 'array',
        title: 'Form Row [Label, Input, Button]',
        prefixItems: [
          {
            type: 'object',
            title: 'Label Config',
            properties: {
              text: { type: 'string', default: 'Field:' },
              required: { type: 'boolean', default: false },
            },
          },
          {
            type: 'object',
            title: 'Input Config',
            properties: {
              placeholder: { type: 'string', default: 'Enter value...' },
              maxLength: { type: 'number', default: 100 },
            },
          },
          {
            type: 'object',
            title: 'Button Config',
            properties: {
              label: { type: 'string', default: 'Submit' },
              disabled: { type: 'boolean', default: false },
            },
          },
        ],
        items: false,
        minItems: 3,
      },
      api_config: {
        type: 'array',
        title: 'API Config [Auth, Request, Response]',
        prefixItems: [
          {
            type: 'object',
            title: 'Auth Settings',
            properties: {
              type: {
                type: 'string',
                default: 'bearer',
                enum: ['bearer', 'basic', 'api-key'],
              },
              token: { type: 'string', default: '' },
            },
          },
          {
            type: 'object',
            title: 'Request Settings',
            properties: {
              method: {
                type: 'string',
                default: 'GET',
                enum: ['GET', 'POST', 'PUT', 'DELETE'],
              },
              timeout: { type: 'number', default: 30000 },
            },
          },
          {
            type: 'object',
            title: 'Response Handler',
            properties: {
              parseJson: { type: 'boolean', default: true },
              throwOnError: { type: 'boolean', default: true },
            },
          },
        ],
        items: false,
        minItems: 3,
      },
    },
  } as JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>BranchStrategy with prefixItems (Object Items)</h3>
      <p>
        <strong>Expected:</strong> Each tuple position has a completely
        different object schema.
      </p>
      <ul>
        <li>
          <strong>form_row:</strong> [LabelConfig, InputConfig, ButtonConfig] -
          form element tuple
        </li>
        <li>
          <strong>api_config:</strong> [AuthSettings, RequestSettings,
          ResponseHandler] - API configuration tuple
        </li>
        <li>
          <strong>Note:</strong> Each child node has different properties based
          on its position
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
 * prefixItems Default Value Behavior
 *
 * Demonstrates how default values work with prefixItems:
 * - Each prefixItems schema can have its own default
 * - minItems auto-fill uses position-specific defaults
 * - Open tuples use items.default for positions beyond prefixItems
 *
 * Expected Behavior:
 * - Position 0: uses prefixItems[0].default
 * - Position 1: uses prefixItems[1].default
 * - Position N (> prefixItems.length): uses items.default
 */
export const PrefixItemsDefaultValues = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      // Fixed tuple with different defaults per position
      fixedTupleDefaults: {
        type: 'array',
        title: 'Fixed Tuple Defaults [first=100, second=200, third=300]',
        prefixItems: [
          { type: 'number', default: 100 },
          { type: 'number', default: 200 },
          { type: 'number', default: 300 },
        ],
        items: false,
        minItems: 3,
      },
      // Open tuple: prefixItems defaults + items default for additional
      openTupleDefaults: {
        type: 'array',
        title: 'Open Tuple [first=A, second=B, additional=X]',
        prefixItems: [
          { type: 'string', default: 'A' },
          { type: 'string', default: 'B' },
        ],
        items: { type: 'string', default: 'X' },
        minItems: 2,
      },
      // Object tuple with nested defaults
      objectTupleDefaults: {
        type: 'array',
        title: 'Object Tuple with Nested Defaults',
        prefixItems: [
          {
            type: 'object',
            default: { name: 'First', priority: 1 },
            properties: {
              name: { type: 'string', default: 'Item' },
              priority: { type: 'number', default: 0 },
            },
          },
          {
            type: 'object',
            default: { name: 'Second', priority: 2 },
            properties: {
              name: { type: 'string', default: 'Item' },
              priority: { type: 'number', default: 0 },
            },
          },
        ],
        items: false,
        minItems: 2,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems Default Value Behavior</h3>
      <p>
        <strong>Expected:</strong> Each position uses its own default from{' '}
        <code>prefixItems</code>.
      </p>
      <ul>
        <li>
          <strong>fixedTupleDefaults:</strong> [100, 200, 300] - each position
          has unique default
        </li>
        <li>
          <strong>openTupleDefaults:</strong> ["A", "B"] initially, push() adds
          "X" (from items.default)
        </li>
        <li>
          <strong>objectTupleDefaults:</strong> Uses object-level defaults from
          each prefixItems schema
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
 * prefixItems with Validation Constraints
 *
 * Each prefixItems schema can have its own validation rules,
 * allowing different constraints per tuple position.
 *
 * Expected Behavior:
 * - Position-specific validation rules apply
 * - Errors show for the specific position that fails validation
 * - Open tuple validation uses items schema for additional positions
 */
export const PrefixItemsWithValidation = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      date_range: {
        type: 'array',
        title: 'Date Range [start (required), end (optional)]',
        prefixItems: [
          {
            type: 'string',
            title: 'Start Date',
            format: 'date',
            default: '2024-01-01',
          },
          {
            type: 'string',
            title: 'End Date',
            format: 'date',
            default: '2024-12-31',
          },
        ],
        items: false,
        minItems: 2,
      },
      score_range: {
        type: 'array',
        title: 'Score Range [min (0-100), max (0-100)]',
        prefixItems: [
          {
            type: 'number',
            title: 'Min Score',
            default: 0,
            minimum: 0,
            maximum: 100,
          },
          {
            type: 'number',
            title: 'Max Score',
            default: 100,
            minimum: 0,
            maximum: 100,
          },
        ],
        items: false,
        minItems: 2,
      },
      contact_info: {
        type: 'array',
        title: 'Contact [email, phone, website?]',
        prefixItems: [
          { type: 'string', title: 'Email', format: 'email', default: '' },
          {
            type: 'string',
            title: 'Phone',
            pattern: '^[0-9-+()\\s]+$',
            default: '',
          },
        ],
        items: { type: 'string', title: 'Website', format: 'uri', default: '' },
        minItems: 2,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems with Validation Constraints</h3>
      <p>
        <strong>Expected:</strong> Each position has its own validation rules.
      </p>
      <ul>
        <li>
          <strong>date_range:</strong> Both positions validate as dates
        </li>
        <li>
          <strong>score_range:</strong> Both positions validate 0-100 range
        </li>
        <li>
          <strong>contact_info:</strong> Email validation, phone pattern,
          optional URI
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
 * prefixItems Constraints: maxItems and minItems
 *
 * When using prefixItems without items schema:
 * - maxItems cannot exceed prefixItems.length
 * - minItems cannot exceed prefixItems.length
 *
 * With items schema defined:
 * - maxItems and minItems can exceed prefixItems.length
 *
 * Expected Behavior:
 * - prefixItems-only: array length bounded by prefixItems.length
 * - prefixItems + items: array can grow beyond prefixItems.length
 */
export const PrefixItemsWithMinMaxItems = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      // Fixed tuple: maxItems = prefixItems.length = 3
      fixedLength: {
        type: 'array',
        title: 'Fixed Length Tuple (exactly 3)',
        prefixItems: [
          { type: 'string', default: 'first' },
          { type: 'string', default: 'second' },
          { type: 'string', default: 'third' },
        ],
        items: false,
        minItems: 3,
        maxItems: 3,
      },
      // Open tuple: can exceed prefixItems.length
      openWithMax: {
        type: 'array',
        title: 'Open Tuple (2 prefixItems, max 5)',
        prefixItems: [
          { type: 'number', default: 1 },
          { type: 'number', default: 2 },
        ],
        items: { type: 'number', default: 0 },
        minItems: 2,
        maxItems: 5,
      },
      // Partial fill allowed
      partialTuple: {
        type: 'array',
        title: 'Partial Tuple (3 prefixItems, min 1, max 2)',
        prefixItems: [
          { type: 'string', default: 'a' },
          { type: 'string', default: 'b' },
          { type: 'string', default: 'c' },
        ],
        minItems: 1,
        maxItems: 2,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems with minItems/maxItems Constraints</h3>
      <p>
        <strong>Expected:</strong> Constraints work with prefixItems correctly.
      </p>
      <ul>
        <li>
          <strong>fixedLength:</strong> Exactly 3 items, cannot add or remove
        </li>
        <li>
          <strong>openWithMax:</strong> Starts with 2, can grow to 5 total
        </li>
        <li>
          <strong>partialTuple:</strong> Only uses first 1-2 of 3 prefixItems
          schemas
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
 * prefixItems with $ref (Reusable Schema Definitions)
 *
 * Each prefixItems element can reference a schema defined in $defs,
 * allowing for reusable and maintainable tuple definitions.
 *
 * Expected Behavior:
 * - Each tuple position uses the referenced schema from $defs
 * - Validation rules from referenced schemas apply correctly
 * - Default values from referenced schemas are used
 */
export const PrefixItemsWithRef_ReusableDefinitions = () => {
  const jsonSchema = {
    type: 'object',
    $defs: {
      StringField: {
        type: 'string',
        minLength: 1,
        default: '',
      },
      NumberField: {
        type: 'number',
        minimum: 0,
        default: 0,
      },
      BooleanField: {
        type: 'boolean',
        default: false,
      },
      EmailField: {
        type: 'string',
        format: 'email',
        default: '',
      },
      PhoneField: {
        type: 'string',
        pattern: '^[0-9-+()\\s]+$',
        default: '',
      },
    },
    properties: {
      contact_tuple: {
        type: 'array',
        title: 'Contact [Name, Email, Phone]',
        prefixItems: [
          { $ref: '#/$defs/StringField', title: 'Name' },
          { $ref: '#/$defs/EmailField', title: 'Email' },
          { $ref: '#/$defs/PhoneField', title: 'Phone' },
        ],
        items: false,
        minItems: 3,
      },
      mixed_tuple: {
        type: 'array',
        title: 'Mixed Types [String, Number, Boolean]',
        prefixItems: [
          { $ref: '#/$defs/StringField', title: 'Label' },
          { $ref: '#/$defs/NumberField', title: 'Value' },
          { $ref: '#/$defs/BooleanField', title: 'Active' },
        ],
        items: false,
        minItems: 3,
      },
    },
  } as JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems with $ref (Reusable Schema Definitions)</h3>
      <p>
        <strong>Expected:</strong> Each tuple position uses a referenced schema
        from <code>$defs</code>.
      </p>
      <ul>
        <li>
          <strong>contact_tuple:</strong> [StringField, EmailField, PhoneField]
          with proper validation
        </li>
        <li>
          <strong>mixed_tuple:</strong> [String, Number, Boolean] from reusable
          definitions
        </li>
        <li>
          <strong>Note:</strong> Schemas can be reused across multiple tuples
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
 * prefixItems with $ref (Object Schema References)
 *
 * prefixItems can reference complex object schemas from $defs,
 * creating tuples with different object structures per position.
 *
 * Expected Behavior:
 * - Each position creates a complex object using its referenced schema
 * - Nested properties are correctly validated
 * - Different object shapes for each tuple position
 */
export const PrefixItemsWithRef_ObjectSchemas = () => {
  const jsonSchema = {
    type: 'object',
    $defs: {
      PersonInfo: {
        type: 'object',
        properties: {
          name: { type: 'string', default: '' },
          age: { type: 'number', minimum: 0, default: 0 },
        },
        required: ['name'],
      },
      AddressInfo: {
        type: 'object',
        properties: {
          street: { type: 'string', default: '' },
          city: { type: 'string', default: '' },
          zipcode: { type: 'string', pattern: '^[0-9]{5}$', default: '' },
        },
        required: ['city'],
      },
      ContactInfo: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', default: '' },
          phone: { type: 'string', default: '' },
          preferred: {
            type: 'string',
            enum: ['email', 'phone'],
            default: 'email',
          },
        },
      },
    },
    properties: {
      user_record: {
        type: 'array',
        title: 'User Record [Person, Address, Contact]',
        prefixItems: [
          { $ref: '#/$defs/PersonInfo', title: 'Personal Information' },
          { $ref: '#/$defs/AddressInfo', title: 'Address' },
          { $ref: '#/$defs/ContactInfo', title: 'Contact Details' },
        ],
        items: false,
        minItems: 3,
      },
    },
  } as JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems with $ref (Object Schema References)</h3>
      <p>
        <strong>Expected:</strong> Each tuple position uses a different object
        schema from <code>$defs</code>.
      </p>
      <ul>
        <li>
          <strong>Position 0:</strong> PersonInfo - name (required) and age
        </li>
        <li>
          <strong>Position 1:</strong> AddressInfo - street, city (required),
          zipcode
        </li>
        <li>
          <strong>Position 2:</strong> ContactInfo - email, phone, preferred
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
 * prefixItems with $ref + items $ref (Open Tuple with References)
 *
 * Combines prefixItems references with an items reference for open tuples.
 * First positions use specific schemas, additional items use a common schema.
 *
 * Expected Behavior:
 * - First N positions use prefixItems references
 * - Additional positions use items reference
 * - All schemas come from $defs for consistency
 */
export const PrefixItemsWithRef_OpenTuple = () => {
  const jsonSchema = {
    type: 'object',
    $defs: {
      Header: {
        type: 'object',
        properties: {
          title: { type: 'string', default: 'Untitled' },
          createdAt: { type: 'string', format: 'date', default: '' },
        },
        required: ['title'],
      },
      Summary: {
        type: 'object',
        properties: {
          description: { type: 'string', default: '' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
        },
      },
      DataRow: {
        type: 'object',
        properties: {
          id: { type: 'number', default: 0 },
          value: { type: 'string', default: '' },
          active: { type: 'boolean', default: true },
        },
        required: ['id'],
      },
    },
    properties: {
      document: {
        type: 'array',
        title: 'Document [Header, Summary, ...DataRows]',
        prefixItems: [
          { $ref: '#/$defs/Header', title: 'Document Header' },
          { $ref: '#/$defs/Summary', title: 'Document Summary' },
        ],
        items: { $ref: '#/$defs/DataRow', title: 'Data Row' },
        minItems: 2,
      },
    },
  } as JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems with $ref + items $ref (Open Tuple)</h3>
      <p>
        <strong>Expected:</strong> Fixed header positions + unlimited data rows.
      </p>
      <ul>
        <li>
          <strong>Position 0:</strong> Header (title, createdAt)
        </li>
        <li>
          <strong>Position 1:</strong> Summary (description, tags)
        </li>
        <li>
          <strong>Position 2+:</strong> DataRow (id, value, active) - can add
          many
        </li>
        <li>
          <strong>Note:</strong> push() adds DataRow items after the fixed
          header/summary
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
 * prefixItems with Nested $ref
 *
 * Demonstrates nested references where prefixItems schemas themselves
 * contain $ref to other definitions.
 *
 * Expected Behavior:
 * - Nested references are resolved correctly
 * - Deep schema structures work with prefixItems
 * - Validation applies at all nesting levels
 */
export const PrefixItemsWithRef_NestedReferences = () => {
  const jsonSchema = {
    type: 'object',
    $defs: {
      Timestamp: {
        type: 'string',
        format: 'date-time',
        default: '',
      },
      Money: {
        type: 'object',
        properties: {
          amount: { type: 'number', minimum: 0, default: 0 },
          currency: { type: 'string', enum: ['USD', 'EUR', 'KRW'], default: 'USD' },
        },
        required: ['amount', 'currency'],
      },
      OrderHeader: {
        type: 'object',
        properties: {
          orderId: { type: 'string', default: '' },
          createdAt: { $ref: '#/$defs/Timestamp' },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'shipped', 'delivered'],
            default: 'pending',
          },
        },
        required: ['orderId'],
      },
      OrderPayment: {
        type: 'object',
        properties: {
          subtotal: { $ref: '#/$defs/Money' },
          tax: { $ref: '#/$defs/Money' },
          total: { $ref: '#/$defs/Money' },
          paidAt: { $ref: '#/$defs/Timestamp' },
        },
      },
      OrderShipping: {
        type: 'object',
        properties: {
          address: { type: 'string', default: '' },
          trackingNumber: { type: 'string', default: '' },
          estimatedDelivery: { $ref: '#/$defs/Timestamp' },
          shippingCost: { $ref: '#/$defs/Money' },
        },
      },
    },
    properties: {
      order: {
        type: 'array',
        title: 'Order [Header, Payment, Shipping]',
        prefixItems: [
          { $ref: '#/$defs/OrderHeader', title: 'Order Information' },
          { $ref: '#/$defs/OrderPayment', title: 'Payment Details' },
          { $ref: '#/$defs/OrderShipping', title: 'Shipping Information' },
        ],
        items: false,
        minItems: 3,
      },
    },
  } as JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems with Nested $ref</h3>
      <p>
        <strong>Expected:</strong> Nested references resolve correctly within
        prefixItems.
      </p>
      <ul>
        <li>
          <strong>OrderHeader:</strong> Contains Timestamp reference for
          createdAt
        </li>
        <li>
          <strong>OrderPayment:</strong> Contains multiple Money and Timestamp
          references
        </li>
        <li>
          <strong>OrderShipping:</strong> Contains Money and Timestamp
          references
        </li>
        <li>
          <strong>Note:</strong> All nested $ref are resolved and validated
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
 * prefixItems with Self-Referencing $ref
 *
 * Demonstrates recursive structures where prefixItems can reference
 * schemas that contain self-references.
 *
 * Expected Behavior:
 * - Recursive schemas work within prefixItems
 * - Tree-like structures can be built
 * - No infinite loops in schema resolution
 */
export const PrefixItemsWithRef_SelfReferencing = () => {
  const jsonSchema = {
    type: 'object',
    $defs: {
      TreeNode: {
        type: 'object',
        properties: {
          id: { type: 'string', default: '' },
          label: { type: 'string', default: '' },
          children: {
            type: 'array',
            items: { $ref: '#/$defs/TreeNode' },
            default: [],
          },
        },
        required: ['id', 'label'],
      },
      Metadata: {
        type: 'object',
        properties: {
          version: { type: 'string', default: '1.0' },
          author: { type: 'string', default: '' },
        },
      },
    },
    properties: {
      tree_document: {
        type: 'array',
        title: 'Tree Document [Metadata, RootNode]',
        prefixItems: [
          { $ref: '#/$defs/Metadata', title: 'Document Metadata' },
          { $ref: '#/$defs/TreeNode', title: 'Root Node' },
        ],
        items: false,
        minItems: 2,
      },
    },
  } as JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <h3>prefixItems with Self-Referencing $ref</h3>
      <p>
        <strong>Expected:</strong> Recursive schemas work within prefixItems.
      </p>
      <ul>
        <li>
          <strong>Position 0:</strong> Metadata (version, author)
        </li>
        <li>
          <strong>Position 1:</strong> TreeNode with recursive children
        </li>
        <li>
          <strong>Note:</strong> TreeNode.children can contain more TreeNodes
          recursively
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
