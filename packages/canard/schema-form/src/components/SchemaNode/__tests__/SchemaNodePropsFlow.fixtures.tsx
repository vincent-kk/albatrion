import type { ComponentType } from 'react';
import { vi } from 'vitest';

import {
  NodeEventType,
  NodeState,
  type SchemaNode,
  SetValueOption,
} from '@/schema-form/core';
import type {
  FormTypeInputProps,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

/**
 * Type for mock node overrides.
 * Uses Record type to allow partial properties without union type conflicts.
 */
type MockSchemaNodeOverrides = {
  path?: string;
  name?: string;
  schemaType?: string;
  type?: string;
  jsonSchema?: JsonSchemaWithVirtual;
  value?: any;
  defaultValue?: any;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  nullable?: boolean;
  enabled?: boolean;
  isRoot?: boolean;
  depth?: number;
  parentNode?: SchemaNode | null;
  children?: any;
  group?: 'terminal' | 'branch';
  errors?: readonly any[];
  state?: Record<string, boolean>;
  watchValues?: readonly any[];
};

/**
 * Create a mock SchemaNode for testing purposes.
 * All methods are mocked with vi.fn() to allow tracking calls.
 */
export const createMockSchemaNode = (
  overrides?: MockSchemaNodeOverrides,
): SchemaNode => {
  const defaultState: Record<string, boolean> = {};

  const mockNode = {
    // Flag for isSchemaNode mock to identify mock nodes
    _isMockSchemaNode: true,

    // Identity properties
    path: 'test.field',
    name: 'field',

    // Schema type properties
    schemaType: 'string',
    type: 'string',
    jsonSchema: { type: 'string' } as JsonSchemaWithVirtual,

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
    children: undefined, // Terminal nodes have no children

    // Node group - used by isTerminalNode/isBranchNode
    group: 'terminal' as const,

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
    publish: vi.fn(),
    subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
    find: vi.fn(),
    setExternalErrors: vi.fn(),
    validate: vi.fn(),
    reset: vi.fn(),

    // Apply overrides
    ...overrides,
  } as unknown as SchemaNode;

  return mockNode;
};

/**
 * Create a mock SchemaNode for string type
 */
export const createStringNode = (
  overrides?: Partial<SchemaNode>,
): SchemaNode => {
  return createMockSchemaNode({
    schemaType: 'string',
    type: 'string',
    jsonSchema: { type: 'string' },
    ...overrides,
  });
};

/**
 * Create a mock SchemaNode for number type
 */
export const createNumberNode = (
  overrides?: Partial<SchemaNode>,
): SchemaNode => {
  return createMockSchemaNode({
    schemaType: 'number',
    type: 'number',
    jsonSchema: { type: 'number' },
    value: 0,
    ...overrides,
  });
};

/**
 * Create a mock SchemaNode for object type (branch node)
 */
export const createObjectNode = (
  overrides?: Partial<SchemaNode>,
): SchemaNode => {
  return createMockSchemaNode({
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
 * Create a mock SchemaNode for array type (branch node)
 */
export const createArrayNode = (
  overrides?: Partial<SchemaNode>,
): SchemaNode => {
  return createMockSchemaNode({
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
 * Mock FormTypeInput component for testing.
 * Renders a simple input element with data-testid for easy selection.
 */
export const MockFormTypeInput = vi.fn(
  ({ value, onChange, name, path, disabled, readOnly }: FormTypeInputProps) => {
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
) as unknown as ComponentType<FormTypeInputProps>;

/**
 * Alternative MockFormTypeInput with custom styling for differentiation.
 */
export const CustomFormTypeInput = vi.fn(
  ({ value, onChange, name, path }: FormTypeInputProps) => {
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
) as unknown as ComponentType<FormTypeInputProps>;

/**
 * Mock FormTypeInput that captures onFileAttach calls
 */
export const FileFormTypeInput = vi.fn(
  ({ name, path, onFileAttach }: FormTypeInputProps) => {
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
) as unknown as ComponentType<FormTypeInputProps>;

/**
 * Default FormTypeRenderer for testing
 */
export const MockFormTypeRenderer = vi.fn(({ Input, node }) => {
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
  (MockFormTypeInput as any).mockClear();
  (CustomFormTypeInput as any).mockClear();
  (FileFormTypeInput as any).mockClear();
  (MockFormTypeRenderer as any).mockClear();
};

/**
 * Default SetValueOption used by handleChange in SchemaNodeInput
 */
export const HANDLE_CHANGE_OPTION =
  SetValueOption.Replace |
  SetValueOption.Propagate |
  SetValueOption.EmitChange |
  SetValueOption.PublishUpdateEvent;

/**
 * Events that trigger re-rendering in SchemaNodeInput
 */
export const REACTIVE_RERENDERING_EVENTS =
  NodeEventType.UpdateValue |
  NodeEventType.UpdateError |
  NodeEventType.UpdateComputedProperties;

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
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
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
