/* eslint-disable react-refresh/only-export-components */
import type { ComponentType } from 'react';

import { vi } from 'vitest';

import {
  type FieldNode,
  FieldNodeEventType,
  SetValueOption,
} from '@/schema-form/core';
import type { FieldInputProps } from '@/schema-form/types';
import type { JSONSchemaWithVirtual } from '@/schema-form/types';

/**
 * Type for mock node overrides.
 * Uses Record type to allow partial properties without union type conflicts.
 */
type MockFieldNodeOverrides = {
  path?: string;
  name?: string;
  schemaType?: FieldNode['schemaType'];
  type?: FieldNode['type'];
  jsonSchema?: FieldNode['jsonSchema'];
  value?: any;
  defaultValue?: any;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  nullable?: boolean;
  enabled?: boolean;
  isRoot?: boolean;
  depth?: number;
  parentNode?: FieldNode | null;
  children?: any;
  group?: 'terminal' | 'branch';
  errors?: readonly any[];
  state?: Record<string, boolean>;
  watchValues?: readonly any[];
};

/**
 * Create a mock FieldNode for testing purposes.
 * All methods are mocked with vi.fn() to allow tracking calls.
 */
export const createMockFieldNode = (
  overrides?: MockFieldNodeOverrides,
): FieldNode => {
  const defaultState: Record<string, boolean> = {};

  const mockNode = {
    // Flag for isFieldNode mock to identify mock nodes
    _isMockFieldNode: true,

    // Identity properties
    path: 'test.field',
    name: 'field',

    // Schema type properties
    schemaType: 'string',
    type: 'string',
    jsonSchema: { type: 'string' } as JSONSchemaWithVirtual,

    // Value properties
    value: '',
    defaultValue: undefined,

    // State flags
    required: false,
    readOnly: false,
    disabled: false,
    nullable: false,
    enabled: true,

    // Tree properties
    isRoot: false,
    depth: 1,
    parentNode: undefined,
    children: null, // Terminal nodes have no children

    // Node group - used by isTerminalNode/isBranchNode
    strategy: 'terminal' as const,

    // Error & state
    errors: [] as any[],
    state: defaultState,
    watchValues: [] as any[],

    // Methods - all mocked
    setValue: vi.fn(),
    clearExternalErrors: vi.fn(),
    setState: vi.fn((newState: Record<string, boolean>) => {
      Object.assign(mockNode.state, newState);
    }),
    request: vi.fn(),
    batch: vi.fn((fn: () => void) => fn()),
    subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
    revision: vi.fn(() => 0), // Delivery-ledger revision (no deliveries on a mock)
    find: vi.fn(),
    setExternalErrors: vi.fn(),
    validate: vi.fn(),
    reset: vi.fn(),

    // Apply overrides
    ...overrides,
  } as unknown as FieldNode;

  return mockNode;
};

/**
 * Create a mock FieldNode for string type
 */
export const createStringNode = (overrides?: Partial<FieldNode>): FieldNode => {
  return createMockFieldNode({
    schemaType: 'string',
    type: 'string',
    jsonSchema: { type: 'string' },
    ...overrides,
  });
};

/**
 * Create a mock FieldNode for number type
 */
export const createNumberNode = (overrides?: Partial<FieldNode>): FieldNode => {
  return createMockFieldNode({
    schemaType: 'number',
    type: 'number',
    jsonSchema: { type: 'number' },
    value: 0,
    ...overrides,
  });
};

/**
 * Create a mock FieldNode for object type (branch node)
 */
export const createObjectNode = (overrides?: Partial<FieldNode>): FieldNode => {
  return createMockFieldNode({
    schemaType: 'object',
    type: 'object',
    jsonSchema: {
      type: 'object',
      properties: {},
    },
    value: {},
    ...overrides,
  });
};

/**
 * Create a mock FieldNode for array type (branch node)
 */
export const createArrayNode = (overrides?: Partial<FieldNode>): FieldNode => {
  return createMockFieldNode({
    schemaType: 'array',
    type: 'array',
    jsonSchema: {
      type: 'array',
      items: { type: 'string' },
    },
    value: [],
    ...overrides,
  });
};

/**
 * Mock FieldInput component for testing.
 * Renders a simple input element with data-testid for easy selection.
 */
export const MockFieldInput = vi.fn(
  ({ value, onChange, name, path, disabled, readOnly }: FieldInputProps) => {
    return (
      <input
        data-testid={`input-${name}`}
        data-path={path}
        value={(value as string) ?? ''}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
      />
    );
  },
) as unknown as ComponentType<FieldInputProps>;

/**
 * Alternative MockFieldInput with custom styling for differentiation.
 */
export const CustomFieldInput = vi.fn(
  ({ value, onChange, name, path }: FieldInputProps) => {
    return (
      <input
        data-testid={`custom-input-${name}`}
        data-path={path}
        value={(value as string) ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="custom-input"
      />
    );
  },
) as unknown as ComponentType<FieldInputProps>;

/**
 * Mock FieldInput that captures onFileAttach calls
 */
export const FileFieldInput = vi.fn(
  ({ name, path, onFileAttach }: FieldInputProps) => {
    return (
      <input
        data-testid={`file-input-${name}`}
        data-path={path}
        type="file"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            onFileAttach?.(files[0]);
          }
        }}
      />
    );
  },
) as unknown as ComponentType<FieldInputProps>;

/**
 * Default FieldRenderer for testing
 */
export const MockFieldRenderer = vi.fn(({ Input, node }) => {
  return (
    <div data-testid={`renderer-${node?.name}`}>
      <Input />
    </div>
  );
});

/**
 * Utility to reset all mock functions
 */
export const resetAllMocks = () => {
  vi.clearAllMocks();
  (MockFieldInput as any).mockClear();
  (CustomFieldInput as any).mockClear();
  (FileFieldInput as any).mockClear();
  (MockFieldRenderer as any).mockClear();
};

/**
 * Default SetValueOption used by handleChange in FieldInputSlot
 */
export const HANDLE_CHANGE_OPTION = SetValueOption.Overwrite;

/**
 * Events that trigger re-rendering in FieldInputSlot
 */
export const REACTIVE_RERENDERING_EVENTS =
  FieldNodeEventType.UpdateValue |
  FieldNodeEventType.UpdateError |
  FieldNodeEventType.UpdateControlledProperties;

/**
 * Pre-configured test scenarios for common testing patterns
 */
export const testScenarios = {
  /**
   * Basic editable string field
   */
  editableString: () =>
    createStringNode({
      path: 'user.name',
      name: 'name',
      value: 'John',
    }),

  /**
   * Read-only field
   */
  readOnlyField: () =>
    createStringNode({
      path: 'user.id',
      name: 'id',
      value: 'user-123',
      readOnly: true,
    }),

  /**
   * Disabled field
   */
  disabledField: () =>
    createStringNode({
      path: 'user.status',
      name: 'status',
      value: 'inactive',
      disabled: true,
    }),

  /**
   * Required field
   */
  requiredField: () =>
    createStringNode({
      path: 'user.email',
      name: 'email',
      value: '',
      required: true,
    }),

  /**
   * Field with errors
   */
  fieldWithErrors: () =>
    createStringNode({
      path: 'user.email',
      name: 'email',
      value: 'invalid',
      errors: [
        {
          keyword: 'format',
          message: 'Invalid email format',
          dataPath: 'user.email',
        },
      ],
    }),

  /**
   * Dirty and touched field
   */
  dirtyTouchedField: () =>
    createStringNode({
      path: 'user.name',
      name: 'name',
      value: 'modified',
      state: {
        [1]: true,
        [2]: true,
      },
    }),

  /**
   * Disabled node (not rendered)
   */
  disabledNode: () =>
    createStringNode({
      path: 'hidden.field',
      name: 'field',
      enabled: false,
    }),

  /**
   * Nullable field
   */
  nullableField: () =>
    createStringNode({
      path: 'user.nickname',
      name: 'nickname',
      nullable: true,
      value: null,
    }),
};
