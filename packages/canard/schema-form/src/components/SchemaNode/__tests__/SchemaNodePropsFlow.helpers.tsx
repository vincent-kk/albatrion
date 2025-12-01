import type { PropsWithChildren, RefObject } from 'react';

import { expect, vi } from 'vitest';

import type { SchemaNode } from '@/schema-form/core';
import {
  ExternalFormContextProvider,
  FormTypeInputsContextProvider,
  FormTypeRendererContextProvider,
  InputControlContextProvider,
  WorkspaceContextProvider,
} from '@/schema-form/providers';
import { RootNodeContext } from '@/schema-form/providers/RootNodeContext/RootNodeContext';
import type {
  AttachedFilesMap,
  ChildNodeComponentProps,
  FormTypeInputDefinition,
  FormTypeInputMap,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import {
  MockFormTypeInput,
  MockFormTypeRenderer,
} from './SchemaNodePropsFlow.fixtures.js';

/**
 * Options for configuring the test wrapper
 */
export interface TestWrapperOptions {
  /** FormTypeInput definitions for custom input types */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** Path-based FormTypeInput mapping */
  formTypeInputMap?: FormTypeInputMap;
  /** Global read-only state */
  readOnly?: boolean;
  /** Global disabled state */
  disabled?: boolean;
  /** User-defined context */
  context?: Record<string, any>;
  /** Pre-populated attached files */
  attachedFilesMap?: AttachedFilesMap;
  /** Custom FormTypeRenderer */
  CustomFormTypeRenderer?: React.ComponentType<FormTypeRendererProps>;
  /** Show error configuration */
  showError?: boolean;
  /** Root node for RootNodeContext - provides mock node with find method */
  rootNode?: SchemaNode;
}

/**
 * Creates a mock root node with find method for RootNodeContext
 */
const createMockRootNode = (): SchemaNode => {
  const mockRootNode = {
    find: vi.fn(() => null),
    path: '',
    name: 'root',
    schemaType: 'object',
    type: 'object',
    jsonSchema: { type: 'object' },
    value: {},
    defaultValue: undefined,
    required: false,
    readOnly: false,
    disabled: false,
    nullable: false,
    enabled: true,
    isRoot: true,
    depth: 0,
    errors: [],
    state: {},
    watchValues: [],
    setValue: vi.fn(),
    clearExternalErrors: vi.fn(),
    setState: vi.fn(),
    publish: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    setExternalErrors: vi.fn(),
    validate: vi.fn(),
    reset: vi.fn(),
  } as unknown as SchemaNode;
  return mockRootNode;
};

/**
 * Creates a test wrapper component with all necessary providers.
 * This simulates the real form environment for testing SchemaNode components.
 */
export const createTestWrapper = (options: TestWrapperOptions = {}) => {
  const {
    formTypeInputDefinitions,
    formTypeInputMap,
    readOnly = false,
    disabled = false,
    context = {},
    attachedFilesMap = new Map(),
    CustomFormTypeRenderer,
    showError = true,
    rootNode = createMockRootNode(),
  } = options;

  // Default FormTypeInput definition if none provided
  const defaultDefinitions: FormTypeInputDefinition[] =
    formTypeInputDefinitions ?? [
      {
        test: () => true, // Match all types
        Component: MockFormTypeInput as any,
      },
    ];

  return ({ children }: PropsWithChildren) => (
    <ExternalFormContextProvider
      formTypeInputDefinitions={defaultDefinitions}
      FormGroupRenderer={MockFormTypeRenderer as any}
      showError={showError}
    >
      <FormTypeInputsContextProvider
        formTypeInputDefinitions={defaultDefinitions}
        formTypeInputMap={formTypeInputMap}
      >
        <FormTypeRendererContextProvider
          CustomFormTypeRenderer={CustomFormTypeRenderer as any}
          showError={showError}
        >
          <InputControlContextProvider readOnly={readOnly} disabled={disabled}>
            <WorkspaceContextProvider
              attachedFilesMap={attachedFilesMap}
              context={context}
            >
              <RootNodeContext.Provider value={rootNode}>
                {children}
              </RootNodeContext.Provider>
            </WorkspaceContextProvider>
          </InputControlContextProvider>
        </FormTypeRendererContextProvider>
      </FormTypeInputsContextProvider>
    </ExternalFormContextProvider>
  );
};

/**
 * Creates a minimal test wrapper with only essential providers.
 * Useful for unit testing specific components in isolation.
 */
export const createMinimalWrapper = (
  attachedFilesMap: AttachedFilesMap = new Map(),
) => {
  return ({ children }: PropsWithChildren) => (
    <WorkspaceContextProvider attachedFilesMap={attachedFilesMap} context={{}}>
      <InputControlContextProvider>
        <FormTypeInputsContextProvider>
          <FormTypeRendererContextProvider showError={true}>
            {children}
          </FormTypeRendererContextProvider>
        </FormTypeInputsContextProvider>
      </InputControlContextProvider>
    </WorkspaceContextProvider>
  );
};

/**
 * Helper type for trackable ref
 */
interface TrackableRef<T> {
  ref: RefObject<T>;
  accessLog: Array<{ timestamp: number; value: T | undefined }>;
  getAccessLog: () => Array<{ timestamp: number; value: T | undefined }>;
  updateValue: (newValue: T | undefined) => void;
  clearLog: () => void;
}

/**
 * Creates a ref object that can track access patterns.
 * Useful for verifying that refs are accessed at the correct times.
 */
export function createTrackableRef<T>(
  initialValue: T | undefined = undefined,
): TrackableRef<T> {
  const accessLog: Array<{ timestamp: number; value: T | undefined }> = [];
  const ref = { current: initialValue } as RefObject<T>;

  return {
    ref,
    accessLog,
    getAccessLog: () => [...accessLog],
    updateValue: (newValue: T | undefined) => {
      (ref as { current: T | undefined }).current = newValue;
      accessLog.push({ timestamp: Date.now(), value: newValue });
    },
    clearLog: () => {
      accessLog.length = 0;
    },
  };
}

/**
 * Creates a ref for onChange handler with tracking
 */
export const createOnChangeRef = (
  handler?: ChildNodeComponentProps['onChange'],
) => {
  const ref = { current: handler } as RefObject<
    ChildNodeComponentProps['onChange']
  >;
  return ref;
};

/**
 * Creates a ref for onFileAttach handler with tracking
 */
export const createOnFileAttachRef = (
  handler?: ChildNodeComponentProps['onFileAttach'],
) => {
  const ref = { current: handler } as RefObject<
    ChildNodeComponentProps['onFileAttach']
  >;
  return ref;
};

/**
 * Creates a ref for override props with tracking
 */
export const createOverridePropsRef = (
  props?: OverridableFormTypeInputProps,
) => {
  const ref = { current: props } as RefObject<OverridableFormTypeInputProps>;
  return ref;
};

/**
 * Utility to wait for async updates in React testing
 */
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Utility to wait for requestAnimationFrame
 */
export const waitForAnimationFrame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Utility to flush all pending timers and animations
 */
export const flushAllAsync = async () => {
  await waitForNextTick();
  await waitForAnimationFrame();
  await waitForNextTick();
};

/**
 * Creates a mock File for testing file attach functionality
 */
export const createMockFile = (
  name = 'test.txt',
  content = 'test content',
  type = 'text/plain',
): File => {
  return new File([content], name, { type });
};

/**
 * Creates multiple mock files for testing
 */
export const createMockFiles = (count: number): File[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockFile(`file${i + 1}.txt`, `content ${i + 1}`),
  );
};

/**
 * Helper to simulate onChange call with default options
 */
export const simulateOnChange = (
  node: SchemaNode,
  value: any,
  option?: number,
) => {
  const setValue = node.setValue as ReturnType<typeof vi.fn>;
  setValue(value, option);
};

/**
 * Helper to verify onChange was called with expected arguments
 */
export const expectOnChangeCalledWith = (
  mockFn: ReturnType<typeof vi.fn>,
  expectedValue: any,
  expectedOption?: number,
) => {
  expect(mockFn).toHaveBeenCalled();
  const [value, option] = mockFn.mock.calls[mockFn.mock.calls.length - 1];
  expect(value).toEqual(expectedValue);
  if (expectedOption !== undefined) {
    expect(option).toBe(expectedOption);
  }
};

/**
 * Helper to create FormTypeInput definition for specific type
 */
export const createFormTypeDefinition = (
  type: string,
  Component: React.ComponentType<any>,
): FormTypeInputDefinition => ({
  test: { type: type as any },
  Component,
});

/**
 * Helper to create FormTypeInput definition with custom test function
 */
export const createCustomFormTypeDefinition = (
  testFn: (hint: any) => boolean,
  Component: React.ComponentType<any>,
): FormTypeInputDefinition => ({
  test: testFn,
  Component,
});

/**
 * Test data for various scenarios
 */
export const testData = {
  /** Simple string value */
  stringValue: 'test string',
  /** Number value */
  numberValue: 42,
  /** Object value */
  objectValue: { key: 'value' },
  /** Array value */
  arrayValue: ['item1', 'item2'],
  /** Null value */
  nullValue: null,
  /** Undefined value */
  undefinedValue: undefined,
  /** Empty string */
  emptyString: '',
  /** Empty object */
  emptyObject: {},
  /** Empty array */
  emptyArray: [],
};

/**
 * Default test context
 */
export const defaultTestContext = {
  locale: 'en-US',
  theme: 'light',
};

/**
 * Helper to extract mock function call arguments
 */
export function getLastCallArgs<T extends (...args: any[]) => any>(
  mockFn: ReturnType<typeof vi.fn>,
): Parameters<T> | undefined {
  const calls = mockFn.mock.calls;
  return calls.length > 0
    ? (calls[calls.length - 1] as Parameters<T>)
    : undefined;
}

/**
 * Helper to get all call arguments from a mock function
 */
export function getAllCallArgs<T extends (...args: any[]) => any>(
  mockFn: ReturnType<typeof vi.fn>,
): Parameters<T>[] {
  return mockFn.mock.calls as Parameters<T>[];
}
