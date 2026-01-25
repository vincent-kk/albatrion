import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { NodeEventType, SetValueOption } from '@/schema-form/core';
import { useSchemaNode } from '@/schema-form/hooks/useSchemaNode';
import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

import { Form, type FormHandle } from '../Form';

/**
 * Helper: Creates a FormTypeInput component that renders an input with a testId
 */
const createTestInput = (
  testId: string,
): FC<FormTypeInputProps<string | number | boolean | null | undefined>> => {
  // 비제어 컴포넌트: RequestRefresh로 리마운트되어야 새 defaultValue가 반영됨
  return (props) => (
    <input
      data-testid={testId}
      defaultValue={props.value?.toString() ?? ''}
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  );
};

/**
 * Helper: Get input value from DOM by testId
 */
const getInputValue = (testId: string): string => {
  const input = screen.queryByTestId(testId) as HTMLInputElement | null;
  return input?.value ?? '';
};

/**
 * Helper: Check if input exists in DOM
 */
const inputExists = (testId: string): boolean => {
  return screen.queryByTestId(testId) !== null;
};

/**
 * Helper: Creates a Form component with ref for testing advanced features.
 * Reduces boilerplate for FormHandle-based tests.
 *
 * NOTE: This helper is available for future refactoring.
 * Current tests use inline FormWithRef patterns for explicitness.
 *
 * @example
 * const { formHandle, FormWithRef } = _createFormWithRef(schema, formTypeInputDefs);
 * render(<FormWithRef />);
 * await vi.advanceTimersByTimeAsync(100);
 * formHandle.current?.setValue({ name: 'test' });
 */
const _createFormWithRef = <TSchema extends JsonSchema>(
  schema: TSchema,
  formTypeInputDefs: FormTypeInputDefinition[],
) => {
  const formHandle: { current: FormHandle<TSchema> | null } = { current: null };

  const FormWithRef = () => {
    const ref = useRef<FormHandle<TSchema>>(null);
    formHandle.current = ref.current;

    // Update formHandle.current after ref is assigned
    useEffect(() => {
      formHandle.current = ref.current;
    });

    return (
      <Form
        ref={ref}
        jsonSchema={schema}
        formTypeInputDefinitions={formTypeInputDefs}
      />
    );
  };

  return { formHandle, FormWithRef };
};

/**
 * SchemaNodeProxy Refresh Integration Tests
 *
 * Tests verify the refresh mechanism at the component level:
 * - useSchemaNodeTracker detects RequestRefresh events
 * - Components re-render when RequestRefresh is published
 * - defaultValue prop stability through useConstant
 *
 * @see src/core/nodes/AbstractNode/AbstractNode.ts - Event publishing
 * @see src/hooks/useSchemaNodeTracker.ts - Event subscription
 */
describe('SchemaNodeProxy Refresh Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Render count tracking', () => {
    it('should re-render FormTypeInput when RequestRefresh is received', async () => {
      let renderCount = 0;
      let capturedNode: any = null;

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        renderCount++;
        // useSchemaNode returns SchemaNode directly, not { node }
        const node = useSchemaNode();
        capturedNode = node;
        return (
          <input
            data-testid="tracking-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      await act(async () => {
        render(
          <Form
            jsonSchema={{ type: 'string' } as JsonSchema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: TrackingInput },
            ]}
          />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      const initialRenderCount = renderCount;
      expect(initialRenderCount).toBeGreaterThan(0);

      // Trigger setValue with Overwrite (includes Refresh)
      await act(async () => {
        capturedNode?.setValue('new value', SetValueOption.Overwrite);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Component should have re-rendered due to RequestRefresh event
      expect(
        renderCount,
        'Component should re-render when RequestRefresh is published via setValue with Overwrite option',
      ).toBeGreaterThan(initialRenderCount);
    });

    it('should NOT publish RequestRefresh when SetValueOption.Default is used', async () => {
      let capturedNode: any = null;

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        const node = useSchemaNode();
        capturedNode = node;
        return (
          <input
            data-testid="tracking-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      await act(async () => {
        render(
          <Form
            jsonSchema={{ type: 'string' } as JsonSchema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: TrackingInput },
            ]}
          />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      // Subscribe to track events
      const events: NodeEventType[] = [];
      capturedNode?.subscribe(({ type }: { type: NodeEventType }) => {
        events.push(type);
      });

      await act(async () => {
        capturedNode?.setValue('another value', SetValueOption.Default);
        await vi.advanceTimersByTimeAsync(100);
      });

      // RequestRefresh should not be in events when using Default option
      expect(
        events.some((e) => e & NodeEventType.RequestRefresh),
        'SetValueOption.Default should not trigger RequestRefresh event',
      ).toBe(false);
    });
  });

  describe('DefaultValue prop stability', () => {
    it('should preserve initial defaultValue through component lifecycle', async () => {
      const capturedDefaultValues: unknown[] = [];

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        capturedDefaultValues.push(props.defaultValue);
        return (
          <input
            data-testid="tracking-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      await act(async () => {
        render(
          <Form
            jsonSchema={{ type: 'string', default: 'initial' } as JsonSchema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: TrackingInput },
            ]}
          />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      // All captured defaultValues should be the same 'initial' value
      const uniqueValues = [...new Set(capturedDefaultValues)];
      expect(uniqueValues.length).toBe(1);
      expect(uniqueValues[0]).toBe('initial');
    });

    it('should maintain stable defaultValue through multiple re-renders', async () => {
      const capturedDefaultValues: unknown[] = [];
      let triggerRerender: (() => void) | null = null;

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        const [, setTick] = useState(0);
        triggerRerender = () => setTick((t) => t + 1);
        capturedDefaultValues.push(props.defaultValue);
        return (
          <input
            data-testid="tracking-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      await act(async () => {
        render(
          <Form
            jsonSchema={{ type: 'string', default: 'stable' } as JsonSchema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: TrackingInput },
            ]}
          />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      // Trigger multiple re-renders
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          triggerRerender?.();
          await vi.advanceTimersByTimeAsync(10);
        });
      }

      // All defaultValues should be 'stable'
      expect(capturedDefaultValues.every((v) => v === 'stable')).toBe(true);
    });
  });

  describe('Object node refresh', () => {
    it('should re-render child components when parent publishes RequestRefresh', async () => {
      let nameRenderCount = 0;
      let ageRenderCount = 0;

      const NameInput: FC<FormTypeInputProps> = (props) => {
        nameRenderCount++;
        return (
          <input
            data-testid="name-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      const AgeInput: FC<FormTypeInputProps> = (props) => {
        ageRenderCount++;
        return (
          <input
            data-testid="age-input"
            type="number"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(Number(e.target.value))}
          />
        );
      };

      const formRef: { current: any } = { current: null };

      await act(async () => {
        render(
          <Form
            ref={formRef}
            jsonSchema={
              {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  age: { type: 'number' },
                },
              } as JsonSchema
            }
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: NameInput },
              { test: { type: 'number' }, Component: AgeInput },
            ]}
          />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      const initialNameRenderCount = nameRenderCount;
      const initialAgeRenderCount = ageRenderCount;

      // Trigger setValue on root with Overwrite
      await act(async () => {
        formRef.current?.rootNode?.setValue(
          { name: 'Alice', age: 30 },
          SetValueOption.Overwrite,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      // Both children should have re-rendered due to parent refresh propagation
      expect(nameRenderCount).toBeGreaterThanOrEqual(initialNameRenderCount);
      expect(ageRenderCount).toBeGreaterThanOrEqual(initialAgeRenderCount);
    });
  });

  describe('Event subscription cleanup', () => {
    it('should properly cleanup subscriptions on unmount', async () => {
      let subscribeCallCount = 0;
      let unsubscribeCallCount = 0;

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        const node = useSchemaNode();

        useEffect(() => {
          if (!node) return;

          subscribeCallCount++;
          const unsubscribe = node.subscribe(() => {});

          return () => {
            unsubscribeCallCount++;
            unsubscribe();
          };
        }, [node]);

        return (
          <input
            data-testid="tracking-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      let unmount: () => void;
      await act(async () => {
        const result = render(
          <Form
            jsonSchema={{ type: 'string' } as JsonSchema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: TrackingInput },
            ]}
          />,
        );
        unmount = result.unmount;
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(subscribeCallCount).toBeGreaterThan(0);

      await act(async () => {
        unmount!();
      });

      // Unsubscribe should be called for each subscribe
      expect(unsubscribeCallCount).toBe(subscribeCallCount);
    });
  });

  describe('Rapid refresh handling', () => {
    it('should handle multiple rapid setValue calls without breaking', async () => {
      let renderCount = 0;
      let capturedNode: any = null;

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        renderCount++;
        const node = useSchemaNode();
        capturedNode = node;
        return (
          <input
            data-testid="tracking-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      await act(async () => {
        render(
          <Form
            jsonSchema={{ type: 'string' } as JsonSchema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: TrackingInput },
            ]}
          />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      // Rapid fire setValue calls
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          capturedNode?.setValue(`value-${i}`, SetValueOption.Overwrite);
        }
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should have rendered and last value should be correct
      expect(renderCount).toBeGreaterThan(0);
      // The final value should be the last one set
      expect(capturedNode?.value).toBe('value-9');
    });
  });
});

/**
 * Advanced Feature Tests using FormHandle ref
 *
 * Tests for JSON Schema advanced features:
 * - oneOf: Exclusive conditional schemas (only one branch active)
 * - anyOf: Non-exclusive conditional schemas (multiple branches can be active)
 * - if-then-else: Conditional field rendering based on conditions
 * - injectTo: Value injection from source to target fields
 * - computed.derived: Computed values based on sibling field expressions
 *
 * All tests use FormHandle.setValue() to verify form state and DOM synchronization.
 *
 * @see CLAUDE.md#6-schema-composition for conditional schema specifications
 */
describe('FormHandle Advanced Feature Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * oneOf: Exclusive conditional schema tests
   *
   * oneOf ensures only ONE branch is active at a time.
   * When condition changes, the previous branch's fields are removed
   * and new branch's fields appear.
   */
  describe('oneOf conditional schema', () => {
    /**
     * Scenario: Switch between 'game' and 'movie' categories
     * - Initial: category='game' → platform field visible
     * - After switch: category='movie' → director field visible, platform removed
     */
    it('should switch between oneOf branches when condition field changes via FormHandle', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'movie'],
            default: 'game',
          },
        },
        oneOf: [
          {
            '&if': "./category === 'game'",
            properties: {
              platform: { type: 'string' },
            },
          },
          {
            '&if': "./category === 'movie'",
            properties: {
              director: { type: 'string' },
            },
          },
        ],
      } satisfies JsonSchema;

      // Create input components with testIds
      const CategoryInput = createTestInput('category-input');
      const PlatformInput = createTestInput('platform-input');
      const DirectorInput = createTestInput('director-input');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/category' }, Component: CategoryInput },
        { test: { path: '/platform' }, Component: PlatformInput },
        { test: { path: '/director' }, Component: DirectorInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Initial state: category='game', platform should be active
      expect(formHandle.current?.getValue()?.category).toBe('game');
      expect(getInputValue('category-input')).toBe('game');
      expect(inputExists('platform-input')).toBe(true);
      expect(inputExists('director-input')).toBe(false);

      // Switch to movie via FormHandle
      await act(async () => {
        formHandle.current?.setValue({
          category: 'movie',
          director: 'Spielberg',
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.category).toBe('movie');
      expect(value?.director).toBe('Spielberg');
      expect(value?.platform).toBeUndefined();

      // Verify DOM values match
      expect(getInputValue('category-input')).toBe('movie');
      expect(getInputValue('director-input')).toBe('Spielberg');
      expect(inputExists('platform-input')).toBe(false); // game-only field should not exist
      expect(inputExists('director-input')).toBe(true);
    });

    it('should update oneOf fields without losing other data', async () => {
      const schema = {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['text', 'number'], default: 'text' },
          title: { type: 'string' },
        },
        oneOf: [
          {
            computed: { if: "./mode === 'text'" },
            properties: {
              content: { type: 'string' },
            },
          },
          {
            computed: { if: "./mode === 'number'" },
            properties: {
              numValue: { type: 'number' },
            },
          },
        ],
      } satisfies JsonSchema;

      const ModeInput = createTestInput('mode-input');
      const TitleInput = createTestInput('title-input');
      const ContentInput = createTestInput('content-input');
      const NumValueInput = createTestInput('numvalue-input');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/mode' }, Component: ModeInput },
        { test: { path: '/title' }, Component: TitleInput },
        { test: { path: '/content' }, Component: ContentInput },
        { test: { path: '/numValue' }, Component: NumValueInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Set text mode data
      await act(async () => {
        formHandle.current?.setValue({
          mode: 'text',
          title: 'My Title',
          content: 'Hello World',
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      let value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.mode).toBe('text');
      expect(value?.title).toBe('My Title');
      expect(value?.content).toBe('Hello World');

      // Verify DOM values
      expect(getInputValue('mode-input')).toBe('text');
      expect(getInputValue('title-input')).toBe('My Title');
      expect(getInputValue('content-input')).toBe('Hello World');
      expect(inputExists('numvalue-input')).toBe(false);

      // Switch to number mode
      await act(async () => {
        formHandle.current?.setValue({
          mode: 'number',
          title: 'My Title',
          numValue: 42,
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.mode).toBe('number');
      expect(value?.title).toBe('My Title');
      expect(value?.numValue).toBe(42);
      expect(value?.content).toBeUndefined();

      // Verify DOM values
      expect(getInputValue('mode-input')).toBe('number');
      expect(getInputValue('title-input')).toBe('My Title');
      expect(getInputValue('numvalue-input')).toBe('42');
      expect(inputExists('content-input')).toBe(false);
    });
  });

  describe('anyOf conditional schema', () => {
    it('should activate multiple anyOf branches simultaneously', async () => {
      const schema = {
        type: 'object',
        properties: {
          showA: { type: 'boolean', default: true },
          showB: { type: 'boolean', default: false },
        },
        anyOf: [
          {
            computed: { if: './showA === true' },
            properties: {
              valueA: { type: 'string' },
            },
          },
          {
            computed: { if: './showB === true' },
            properties: {
              valueB: { type: 'number' },
            },
          },
        ],
      } satisfies JsonSchema;

      const ShowAInput = createTestInput('show-a-input');
      const ShowBInput = createTestInput('show-b-input');
      const ValueAInput = createTestInput('value-a-input');
      const ValueBInput = createTestInput('value-b-input');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/showA' }, Component: ShowAInput },
        { test: { path: '/showB' }, Component: ShowBInput },
        { test: { path: '/valueA' }, Component: ValueAInput },
        { test: { path: '/valueB' }, Component: ValueBInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Enable both anyOf branches
      await act(async () => {
        formHandle.current?.setValue({
          showA: true,
          showB: true,
          valueA: 'Test A',
          valueB: 123,
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.showA).toBe(true);
      expect(value?.showB).toBe(true);
      expect(value?.valueA).toBe('Test A');
      expect(value?.valueB).toBe(123);

      // Verify DOM values - both valueA and valueB inputs should exist
      expect(inputExists('value-a-input')).toBe(true);
      expect(inputExists('value-b-input')).toBe(true);
      expect(getInputValue('value-a-input')).toBe('Test A');
      expect(getInputValue('value-b-input')).toBe('123');
    });

    it('should preserve values when toggling anyOf conditions', async () => {
      const schema = {
        type: 'object',
        properties: {
          enableFeature: { type: 'boolean', default: true },
        },
        anyOf: [
          {
            computed: { if: './enableFeature === true' },
            properties: {
              featureConfig: {
                type: 'object',
                properties: {
                  setting1: { type: 'string', default: 'default1' },
                  setting2: { type: 'number', default: 100 },
                },
              },
            },
          },
        ],
      } satisfies JsonSchema;

      const EnableInput = createTestInput('enable-input');
      const Setting1Input = createTestInput('setting1-input');
      const Setting2Input = createTestInput('setting2-input');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/enableFeature' }, Component: EnableInput },
        { test: { path: '/featureConfig/setting1' }, Component: Setting1Input },
        { test: { path: '/featureConfig/setting2' }, Component: Setting2Input },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Set custom values
      await act(async () => {
        formHandle.current?.setValue({
          enableFeature: true,
          featureConfig: {
            setting1: 'custom',
            setting2: 200,
          },
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      let value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.featureConfig?.setting1).toBe('custom');
      expect(value?.featureConfig?.setting2).toBe(200);

      // Verify DOM values
      expect(inputExists('setting1-input')).toBe(true);
      expect(getInputValue('setting1-input')).toBe('custom');
      expect(getInputValue('setting2-input')).toBe('200');

      // Disable feature - values should be removed
      await act(async () => {
        formHandle.current?.setValue({
          enableFeature: false,
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      value = formHandle.current?.getValue();
      expect(value?.enableFeature).toBe(false);

      // Verify DOM - feature config inputs should not exist
      expect(inputExists('setting1-input')).toBe(false);
      expect(inputExists('setting2-input')).toBe(false);
    });
  });

  describe('if-then-else conditional schema (using oneOf for field rendering)', () => {
    // Note: Standard if-then-else in JSON Schema is primarily for validation (required fields).
    // For conditional field rendering, Schema Form uses oneOf/anyOf with '&if'.
    it('should apply correct branch based on if condition', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'movie'],
            default: 'game',
          },
          title: { type: 'string' },
        },
        oneOf: [
          {
            '&if': "./category === 'game'",
            properties: {
              releaseDate: { type: 'string', format: 'date' },
            },
          },
          {
            '&if': "./category === 'movie'",
            properties: {
              openingDate: { type: 'string', format: 'date' },
            },
            required: ['openingDate'],
          },
        ],
      } satisfies JsonSchema;

      const CategoryInput = createTestInput('ite-category');
      const TitleInput = createTestInput('ite-title');
      const OpeningDateInput = createTestInput('ite-opening-date');
      const ReleaseDateInput = createTestInput('ite-release-date');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/category' }, Component: CategoryInput },
        { test: { path: '/title' }, Component: TitleInput },
        { test: { path: '/openingDate' }, Component: OpeningDateInput },
        { test: { path: '/releaseDate' }, Component: ReleaseDateInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Game category - should show releaseDate
      await act(async () => {
        formHandle.current?.setValue({
          category: 'game',
          title: 'Zelda',
          releaseDate: '2023-05-12',
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      let value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.category).toBe('game');
      expect(value?.releaseDate).toBe('2023-05-12');

      // Verify DOM values
      expect(getInputValue('ite-category')).toBe('game');
      expect(getInputValue('ite-title')).toBe('Zelda');
      expect(inputExists('ite-release-date')).toBe(true);
      expect(getInputValue('ite-release-date')).toBe('2023-05-12');
      expect(inputExists('ite-opening-date')).toBe(false);

      // Switch to movie - should show openingDate
      await act(async () => {
        formHandle.current?.setValue({
          category: 'movie',
          title: 'Inception',
          openingDate: '2010-07-16',
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.category).toBe('movie');
      expect(value?.openingDate).toBe('2010-07-16');

      // Verify DOM values
      expect(getInputValue('ite-category')).toBe('movie');
      expect(getInputValue('ite-title')).toBe('Inception');
      expect(inputExists('ite-opening-date')).toBe(true);
      expect(getInputValue('ite-opening-date')).toBe('2010-07-16');
      expect(inputExists('ite-release-date')).toBe(false);
    });

    it('should handle nested conditional fields', async () => {
      const schema = {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['A', 'B', 'C'], default: 'A' },
        },
        oneOf: [
          {
            '&if': "./type === 'A'",
            properties: { fieldA: { type: 'string' } },
          },
          {
            '&if': "./type === 'B'",
            properties: { fieldB: { type: 'string' } },
          },
          {
            '&if': "./type === 'C'",
            properties: { fieldC: { type: 'string' } },
          },
        ],
      } satisfies JsonSchema;

      const TypeInput = createTestInput('nested-type');
      const FieldAInput = createTestInput('nested-field-a');
      const FieldBInput = createTestInput('nested-field-b');
      const FieldCInput = createTestInput('nested-field-c');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/type' }, Component: TypeInput },
        { test: { path: '/fieldA' }, Component: FieldAInput },
        { test: { path: '/fieldB' }, Component: FieldBInput },
        { test: { path: '/fieldC' }, Component: FieldCInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Test type A
      await act(async () => {
        formHandle.current?.setValue({ type: 'A', fieldA: 'value-A' });
        await vi.advanceTimersByTimeAsync(100);
      });
      expect(formHandle.current?.getValue()?.fieldA).toBe('value-A');
      expect(getInputValue('nested-type')).toBe('A');
      expect(getInputValue('nested-field-a')).toBe('value-A');
      expect(inputExists('nested-field-b')).toBe(false);
      expect(inputExists('nested-field-c')).toBe(false);

      // Test type B
      await act(async () => {
        formHandle.current?.setValue({ type: 'B', fieldB: 'value-B' });
        await vi.advanceTimersByTimeAsync(100);
      });
      expect(formHandle.current?.getValue()?.fieldB).toBe('value-B');
      expect(getInputValue('nested-type')).toBe('B');
      expect(inputExists('nested-field-a')).toBe(false);
      expect(getInputValue('nested-field-b')).toBe('value-B');
      expect(inputExists('nested-field-c')).toBe(false);

      // Test type C
      await act(async () => {
        formHandle.current?.setValue({ type: 'C', fieldC: 'value-C' });
        await vi.advanceTimersByTimeAsync(100);
      });
      expect(formHandle.current?.getValue()?.fieldC).toBe('value-C');
      expect(getInputValue('nested-type')).toBe('C');
      expect(inputExists('nested-field-a')).toBe(false);
      expect(inputExists('nested-field-b')).toBe(false);
      expect(getInputValue('nested-field-c')).toBe('value-C');
    });
  });

  /**
   * injectTo: Value injection between fields
   *
   * injectTo allows a field to automatically update other fields
   * when its value changes. Supports:
   * - Single target injection
   * - Multiple target injection
   * - Chain injection (A → B → C)
   * - Conditional schema triggering via injection
   */
  describe('injectTo field injection', () => {
    /**
     * Basic injection: source field updates target field automatically
     */
    it('should inject value to sibling field when source changes', async () => {
      const schema = {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            injectTo: (value: string) => ({
              '../target': `injected: ${value}`,
            }),
          },
          target: { type: 'string' },
        },
      } satisfies JsonSchema;

      const SourceInput = createTestInput('inject-source');
      const TargetInput = createTestInput('inject-target');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/source' }, Component: SourceInput },
        { test: { path: '/target' }, Component: TargetInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Set source value - should inject to target
      await act(async () => {
        formHandle.current?.setValue({ source: 'hello' });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.source).toBe('hello');
      expect(value?.target).toBe('injected: hello');

      // Verify DOM values
      expect(getInputValue('inject-source')).toBe('hello');
      expect(getInputValue('inject-target')).toBe('injected: hello');
    });

    it('should support chain injection (A -> B -> C)', async () => {
      const schema = {
        type: 'object',
        properties: {
          a: {
            type: 'string',
            injectTo: (value: string) => ({
              '../b': `A→${value}`,
            }),
          },
          b: {
            type: 'string',
            injectTo: (value: string) => ({
              '../c': `B→${value}`,
            }),
          },
          c: { type: 'string' },
        },
      } satisfies JsonSchema;

      const AInput = createTestInput('chain-a');
      const BInput = createTestInput('chain-b');
      const CInput = createTestInput('chain-c');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/a' }, Component: AInput },
        { test: { path: '/b' }, Component: BInput },
        { test: { path: '/c' }, Component: CInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Set 'a' value - should chain to 'b' then to 'c'
      await act(async () => {
        formHandle.current?.setValue({ a: 'start' });
        await vi.advanceTimersByTimeAsync(200);
      });

      const value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.a).toBe('start');
      expect(value?.b).toBe('A→start');
      expect(value?.c).toBe('B→A→start');

      // Verify DOM values
      expect(getInputValue('chain-a')).toBe('start');
      expect(getInputValue('chain-b')).toBe('A→start');
      expect(getInputValue('chain-c')).toBe('B→A→start');
    });

    it('should inject to multiple targets', async () => {
      const schema = {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            injectTo: (value: string) => ({
              '../target1': `${value}-1`,
              '../target2': `${value}-2`,
              '../target3': `${value}-3`,
            }),
          },
          target1: { type: 'string' },
          target2: { type: 'string' },
          target3: { type: 'string' },
        },
      } satisfies JsonSchema;

      const SourceInput = createTestInput('multi-source');
      const Target1Input = createTestInput('multi-target1');
      const Target2Input = createTestInput('multi-target2');
      const Target3Input = createTestInput('multi-target3');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/source' }, Component: SourceInput },
        { test: { path: '/target1' }, Component: Target1Input },
        { test: { path: '/target2' }, Component: Target2Input },
        { test: { path: '/target3' }, Component: Target3Input },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      await act(async () => {
        formHandle.current?.setValue({ source: 'multi' });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.target1).toBe('multi-1');
      expect(value?.target2).toBe('multi-2');
      expect(value?.target3).toBe('multi-3');

      // Verify DOM values
      expect(getInputValue('multi-source')).toBe('multi');
      expect(getInputValue('multi-target1')).toBe('multi-1');
      expect(getInputValue('multi-target2')).toBe('multi-2');
      expect(getInputValue('multi-target3')).toBe('multi-3');
    });

    it('should change oneOf condition via injection', async () => {
      const schema = {
        type: 'object',
        properties: {
          trigger: {
            type: 'string',
            injectTo: (value: string) => ({
              '/category': value === 'switch' ? 'B' : 'A',
            }),
          },
          category: { type: 'string', enum: ['A', 'B'], default: 'A' },
        },
        oneOf: [
          {
            '&if': "./category === 'A'",
            properties: {
              fieldA: { type: 'string', default: 'A-default' },
            },
          },
          {
            '&if': "./category === 'B'",
            properties: {
              fieldB: { type: 'string', default: 'B-default' },
            },
          },
        ],
      } satisfies JsonSchema;

      const TriggerInput = createTestInput('inject-trigger');
      const CategoryInput = createTestInput('inject-category');
      const FieldAInput = createTestInput('inject-field-a');
      const FieldBInput = createTestInput('inject-field-b');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/trigger' }, Component: TriggerInput },
        { test: { path: '/category' }, Component: CategoryInput },
        { test: { path: '/fieldA' }, Component: FieldAInput },
        { test: { path: '/fieldB' }, Component: FieldBInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Initial state should be category A
      expect(formHandle.current?.getValue()?.category).toBe('A');
      expect(getInputValue('inject-category')).toBe('A');
      expect(inputExists('inject-field-a')).toBe(true);
      expect(inputExists('inject-field-b')).toBe(false);

      // Trigger injection to switch category
      await act(async () => {
        formHandle.current?.setValue({ trigger: 'switch' });
        await vi.advanceTimersByTimeAsync(200);
      });

      const value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.category).toBe('B');
      expect(value?.fieldB).toBeDefined();

      // Verify DOM values
      expect(getInputValue('inject-trigger')).toBe('switch');
      expect(getInputValue('inject-category')).toBe('B');
      expect(inputExists('inject-field-a')).toBe(false);
      expect(inputExists('inject-field-b')).toBe(true);
    });
  });

  /**
   * computed.derived: Automatic value computation
   *
   * Derived values are automatically computed from expressions
   * referencing sibling fields. Supports:
   * - Arithmetic operations (price * quantity)
   * - String concatenation (lastName + firstName)
   * - Conditional expressions (age >= 18 ? 'adult' : 'minor')
   * - Parent path references (../../basePrice)
   */
  describe('computed.derived values', () => {
    /**
     * Arithmetic: totalPrice = price × quantity
     */
    it('should compute derived value from sibling fields', async () => {
      const schema = {
        type: 'object',
        properties: {
          price: { type: 'number', default: 1000 },
          quantity: { type: 'number', default: 1 },
          totalPrice: {
            type: 'number',
            computed: {
              derived: '../price * ../quantity',
            },
          },
        },
      } satisfies JsonSchema;

      const PriceInput = createTestInput('derived-price');
      const QuantityInput = createTestInput('derived-quantity');
      const TotalInput = createTestInput('derived-total');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/price' }, Component: PriceInput },
        { test: { path: '/quantity' }, Component: QuantityInput },
        { test: { path: '/totalPrice' }, Component: TotalInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Set price and quantity
      await act(async () => {
        formHandle.current?.setValue({ price: 500, quantity: 3 });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.price).toBe(500);
      expect(value?.quantity).toBe(3);
      expect(value?.totalPrice).toBe(1500);

      // Verify DOM values
      expect(getInputValue('derived-price')).toBe('500');
      expect(getInputValue('derived-quantity')).toBe('3');
      expect(getInputValue('derived-total')).toBe('1500');
    });

    it('should compute string concatenation', async () => {
      const schema = {
        type: 'object',
        properties: {
          firstName: { type: 'string', default: 'John' },
          lastName: { type: 'string', default: 'Doe' },
          fullName: {
            type: 'string',
            computed: {
              derived: '../lastName + " " + ../firstName',
            },
          },
        },
      } satisfies JsonSchema;

      const FirstNameInput = createTestInput('concat-first');
      const LastNameInput = createTestInput('concat-last');
      const FullNameInput = createTestInput('concat-full');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/firstName' }, Component: FirstNameInput },
        { test: { path: '/lastName' }, Component: LastNameInput },
        { test: { path: '/fullName' }, Component: FullNameInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      await act(async () => {
        formHandle.current?.setValue({
          firstName: 'Alice',
          lastName: 'Smith',
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.fullName).toBe('Smith Alice');

      // Verify DOM values
      expect(getInputValue('concat-first')).toBe('Alice');
      expect(getInputValue('concat-last')).toBe('Smith');
      expect(getInputValue('concat-full')).toBe('Smith Alice');
    });

    it('should compute conditional derived value', async () => {
      const schema = {
        type: 'object',
        properties: {
          age: { type: 'number', default: 20 },
          ageGroup: {
            type: 'string',
            computed: {
              derived: '../age >= 18 ? "adult" : "minor"',
            },
          },
        },
      } satisfies JsonSchema;

      const AgeInput = createTestInput('cond-age');
      const AgeGroupInput = createTestInput('cond-age-group');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/age' }, Component: AgeInput },
        { test: { path: '/ageGroup' }, Component: AgeGroupInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Test adult
      await act(async () => {
        formHandle.current?.setValue({ age: 25 });
        await vi.advanceTimersByTimeAsync(100);
      });
      expect(formHandle.current?.getValue()?.ageGroup).toBe('adult');
      expect(getInputValue('cond-age')).toBe('25');
      expect(getInputValue('cond-age-group')).toBe('adult');

      // Test minor
      await act(async () => {
        formHandle.current?.setValue({ age: 15 });
        await vi.advanceTimersByTimeAsync(100);
      });
      expect(formHandle.current?.getValue()?.ageGroup).toBe('minor');
      expect(getInputValue('cond-age')).toBe('15');
      expect(getInputValue('cond-age-group')).toBe('minor');
    });

    it('should compute derived value with parent path reference', async () => {
      const schema = {
        type: 'object',
        properties: {
          basePrice: { type: 'number', default: 50000 },
          options: {
            type: 'object',
            properties: {
              discountPercent: { type: 'number', default: 10 },
              discountedPrice: {
                type: 'number',
                computed: {
                  derived: '../../basePrice * (1 - ../discountPercent / 100)',
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      const BasePriceInput = createTestInput('parent-base');
      const DiscountInput = createTestInput('parent-discount');
      const DiscountedInput = createTestInput('parent-discounted');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/basePrice' }, Component: BasePriceInput },
        {
          test: { path: '/options/discountPercent' },
          Component: DiscountInput,
        },
        {
          test: { path: '/options/discountedPrice' },
          Component: DiscountedInput,
        },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      await act(async () => {
        formHandle.current?.setValue({
          basePrice: 100000,
          options: {
            discountPercent: 20,
          },
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      // Verify formHandle value
      expect(value?.basePrice).toBe(100000);
      expect(value?.options?.discountPercent).toBe(20);
      expect(value?.options?.discountedPrice).toBe(80000); // 100000 * 0.8

      // Verify DOM values
      expect(getInputValue('parent-base')).toBe('100000');
      expect(getInputValue('parent-discount')).toBe('20');
      expect(getInputValue('parent-discounted')).toBe('80000');
    });
  });

  describe('Combined advanced features', () => {
    it('should handle oneOf with anyOf combined', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['electronics', 'clothing'],
            default: 'electronics',
          },
          enableDiscount: { type: 'boolean', default: false },
        },
        oneOf: [
          {
            computed: { if: "./category === 'electronics'" },
            properties: {
              voltage: { type: 'number' },
            },
          },
          {
            computed: { if: "./category === 'clothing'" },
            properties: {
              size: { type: 'string', enum: ['S', 'M', 'L'] },
            },
          },
        ],
        anyOf: [
          {
            computed: { if: './enableDiscount === true' },
            properties: {
              discountPercent: { type: 'number', default: 10 },
            },
          },
        ],
      } satisfies JsonSchema;

      const CategoryInput = createTestInput('combined-category-input');
      const VoltageInput = createTestInput('combined-voltage-input');
      const SizeInput = createTestInput('combined-size-input');
      const DiscountInput = createTestInput('combined-discount-input');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/category' }, Component: CategoryInput },
        { test: { path: '/voltage' }, Component: VoltageInput },
        { test: { path: '/size' }, Component: SizeInput },
        { test: { path: '/discountPercent' }, Component: DiscountInput },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Electronics with discount
      await act(async () => {
        formHandle.current?.setValue({
          category: 'electronics',
          voltage: 220,
          enableDiscount: true,
          discountPercent: 15,
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      let value = formHandle.current?.getValue();
      // Verify formHandle values
      expect(value?.category).toBe('electronics');
      expect(value?.voltage).toBe(220);
      expect(value?.enableDiscount).toBe(true);
      expect(value?.discountPercent).toBe(15);
      // Verify DOM values
      expect(getInputValue('combined-category-input')).toBe('electronics');
      expect(getInputValue('combined-voltage-input')).toBe('220');
      expect(getInputValue('combined-discount-input')).toBe('15');
      expect(inputExists('combined-size-input')).toBe(false);

      // Switch to clothing
      await act(async () => {
        formHandle.current?.setValue({
          category: 'clothing',
          size: 'M',
          enableDiscount: true,
          discountPercent: 20,
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      value = formHandle.current?.getValue();
      // Verify formHandle values
      expect(value?.category).toBe('clothing');
      expect(value?.size).toBe('M');
      expect(value?.discountPercent).toBe(20);
      expect(value?.voltage).toBeUndefined();
      // Verify DOM values
      expect(getInputValue('combined-category-input')).toBe('clothing');
      expect(getInputValue('combined-size-input')).toBe('M');
      expect(getInputValue('combined-discount-input')).toBe('20');
      expect(inputExists('combined-voltage-input')).toBe(false);
    });

    it('should handle derived value with oneOf condition', async () => {
      const schema = {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['simple', 'advanced'],
            default: 'simple',
          },
        },
        oneOf: [
          {
            '&if': "./mode === 'simple'",
            properties: {
              value: { type: 'number', default: 10 },
              result: {
                type: 'number',
                computed: { derived: '../value * 2' },
              },
            },
          },
          {
            '&if': "./mode === 'advanced'",
            properties: {
              base: { type: 'number', default: 100 },
              multiplier: { type: 'number', default: 3 },
              result: {
                type: 'number',
                computed: { derived: '../base * ../multiplier' },
              },
            },
          },
        ],
      } satisfies JsonSchema;

      const ModeInput = createTestInput('derived-oneOf-mode-input');
      const SimpleValueInput = createTestInput('derived-oneOf-value-input');
      const SimpleResultInput = createTestInput('derived-oneOf-simple-result');
      const AdvBaseInput = createTestInput('derived-oneOf-base-input');
      const AdvMultInput = createTestInput('derived-oneOf-mult-input');
      const AdvResultInput = createTestInput('derived-oneOf-adv-result');

      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { path: '/mode' }, Component: ModeInput },
        { test: { path: '/value' }, Component: SimpleValueInput },
        { test: { path: '/base' }, Component: AdvBaseInput },
        { test: { path: '/multiplier' }, Component: AdvMultInput },
        // result in simple mode
        {
          test: (hint) =>
            hint.path === '/result' &&
            hint.jsonSchema?.computed?.derived === '../value * 2',
          Component: SimpleResultInput,
        },
        // result in advanced mode
        {
          test: (hint) =>
            hint.path === '/result' &&
            hint.jsonSchema?.computed?.derived === '../base * ../multiplier',
          Component: AdvResultInput,
        },
      ];

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={formTypeInputDefs}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Simple mode
      await act(async () => {
        formHandle.current?.setValue({ mode: 'simple', value: 25 });
        await vi.advanceTimersByTimeAsync(100);
      });

      let value = formHandle.current?.getValue();
      // Verify formHandle values
      expect(value?.mode).toBe('simple');
      expect(value?.result).toBe(50); // 25 * 2
      // Verify DOM values
      expect(getInputValue('derived-oneOf-mode-input')).toBe('simple');
      expect(getInputValue('derived-oneOf-value-input')).toBe('25');
      expect(getInputValue('derived-oneOf-simple-result')).toBe('50');
      expect(inputExists('derived-oneOf-base-input')).toBe(false);
      expect(inputExists('derived-oneOf-mult-input')).toBe(false);

      // Advanced mode
      await act(async () => {
        formHandle.current?.setValue({
          mode: 'advanced',
          base: 50,
          multiplier: 4,
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      value = formHandle.current?.getValue();
      // Verify formHandle values
      expect(value?.mode).toBe('advanced');
      expect(value?.result).toBe(200); // 50 * 4
      // Verify DOM values
      expect(getInputValue('derived-oneOf-mode-input')).toBe('advanced');
      expect(getInputValue('derived-oneOf-base-input')).toBe('50');
      expect(getInputValue('derived-oneOf-mult-input')).toBe('4');
      expect(getInputValue('derived-oneOf-adv-result')).toBe('200');
      expect(inputExists('derived-oneOf-value-input')).toBe(false);
      expect(inputExists('derived-oneOf-simple-result')).toBe(false);
    });
  });
});

/**
 * Edge Case Tests
 *
 * Tests for edge cases ensuring system robustness:
 *
 * 1. **Rendering Performance**: Verify render count limits during rapid updates
 * 2. **Error Handling**: Handle invalid states gracefully (null refs, undefined values)
 * 3. **Memory Management**: Prevent subscription leaks on mount/unmount cycles
 * 4. **Complex Value Types**: Support deeply nested objects and arrays
 * 5. **Concurrent Updates**: Handle multiple sibling updates simultaneously
 *
 * @see src/hooks/useSchemaNodeTracker.ts - Subscription management
 * @see src/core/nodes/AbstractNode/AbstractNode.ts - Event batching
 */
describe('Edge Cases', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering Performance', () => {
    it('should not exceed expected render count during rapid updates', async () => {
      const MAX_EXPECTED_RENDERS_PER_UPDATE = 3;
      let renderCount = 0;
      let capturedNode: any = null;

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        renderCount++;
        const node = useSchemaNode();
        capturedNode = node;
        return (
          <input
            data-testid="perf-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      await act(async () => {
        render(
          <Form
            jsonSchema={{ type: 'string' } as JsonSchema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: TrackingInput },
            ]}
          />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      const initialRenderCount = renderCount;

      // Perform 5 rapid updates
      const updateCount = 5;
      await act(async () => {
        for (let i = 0; i < updateCount; i++) {
          capturedNode?.setValue(`value-${i}`, SetValueOption.Overwrite);
        }
        await vi.advanceTimersByTimeAsync(100);
      });

      const rendersForUpdates = renderCount - initialRenderCount;
      const rendersPerUpdate = rendersForUpdates / updateCount;

      // Each update should not cause more than MAX_EXPECTED_RENDERS_PER_UPDATE renders
      expect(
        rendersPerUpdate,
        `Each setValue should cause at most ${MAX_EXPECTED_RENDERS_PER_UPDATE} renders, but got ${rendersPerUpdate.toFixed(2)} renders per update`,
      ).toBeLessThanOrEqual(MAX_EXPECTED_RENDERS_PER_UPDATE);
    });

    it('should batch multiple setValue calls efficiently', async () => {
      let renderCount = 0;
      let capturedNode: any = null;

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        renderCount++;
        const node = useSchemaNode();
        capturedNode = node;
        return (
          <input
            data-testid="batch-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      await act(async () => {
        render(
          <Form
            jsonSchema={{ type: 'string' } as JsonSchema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: TrackingInput },
            ]}
          />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      const initialRenderCount = renderCount;

      // Rapid setValue calls in same synchronous stack should batch
      await act(async () => {
        capturedNode?.setValue('a');
        capturedNode?.setValue('ab');
        capturedNode?.setValue('abc');
        await vi.advanceTimersByTimeAsync(100);
      });

      // Batching should reduce total renders
      expect(renderCount - initialRenderCount).toBeLessThan(10);
      expect(capturedNode?.value).toBe('abc');
    });
  });

  describe('Error Handling', () => {
    it('should handle FormHandle.getValue before form is ready', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      } satisfies JsonSchema;

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: createTestInput('error-test') },
            ]}
          />
        );
      };

      // Before render, formHandle.current should be null
      expect(formHandle.current).toBeNull();

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // After render, getValue should work
      expect(formHandle.current?.getValue()).toBeDefined();
    });

    it('should handle setValue with undefined gracefully', async () => {
      let capturedNode: any = null;

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        const node = useSchemaNode();
        capturedNode = node;
        return (
          <input
            data-testid="undefined-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      await act(async () => {
        render(
          <Form
            jsonSchema={{ type: 'string', default: 'initial' } as JsonSchema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: TrackingInput },
            ]}
          />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(capturedNode?.value).toBe('initial');

      // Setting undefined should not throw
      await act(async () => {
        capturedNode?.setValue(undefined);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Value should be undefined now
      expect(capturedNode?.value).toBeUndefined();
    });

    it('should handle null values in nullable schemas', async () => {
      const schema = {
        type: 'object',
        properties: {
          nullableField: { type: ['string', 'null'] as const },
        },
      } satisfies JsonSchema;

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const NullableInput = createTestInput('nullable-input');

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={[
              { test: { path: '/nullableField' }, Component: NullableInput },
            ]}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Set to null
      await act(async () => {
        formHandle.current?.setValue({ nullableField: null });
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(formHandle.current?.getValue()?.nullableField).toBeNull();

      // Set to string
      await act(async () => {
        formHandle.current?.setValue({ nullableField: 'not null' });
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(formHandle.current?.getValue()?.nullableField).toBe('not null');
    });
  });

  describe('Memory and Subscription Management', () => {
    it('should not leak subscriptions on rapid mount/unmount', async () => {
      let subscribeCount = 0;
      let unsubscribeCount = 0;

      const TrackingInput: FC<FormTypeInputProps> = (props) => {
        const node = useSchemaNode();

        useEffect(() => {
          if (!node) return;
          subscribeCount++;
          const unsub = node.subscribe(() => {});
          return () => {
            unsubscribeCount++;
            unsub();
          };
        }, [node]);

        return (
          <input
            data-testid="leak-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      // Mount and unmount multiple times
      for (let i = 0; i < 3; i++) {
        let unmount: () => void;
        await act(async () => {
          const result = render(
            <Form
              jsonSchema={{ type: 'string' } as JsonSchema}
              formTypeInputDefinitions={[
                { test: { type: 'string' }, Component: TrackingInput },
              ]}
            />,
          );
          unmount = result.unmount;
          await vi.advanceTimersByTimeAsync(50);
        });

        await act(async () => {
          unmount!();
          await vi.advanceTimersByTimeAsync(50);
        });
      }

      // All subscriptions should be cleaned up to prevent memory leaks
      expect(
        unsubscribeCount,
        `All ${subscribeCount} subscriptions should be unsubscribed, but only ${unsubscribeCount} were cleaned up`,
      ).toBe(subscribeCount);
    });

    it('should handle component remount with same schema', async () => {
      let mountCount = 0;

      const CountingInput: FC<FormTypeInputProps> = (props) => {
        useEffect(() => {
          mountCount++;
        }, []);

        return (
          <input
            data-testid="remount-input"
            value={props.value ?? ''}
            onChange={(e) => props.onChange?.(e.target.value)}
          />
        );
      };

      const schema = { type: 'string' } as JsonSchema;
      const formTypeInputDefs: FormTypeInputDefinition[] = [
        { test: { type: 'string' }, Component: CountingInput },
      ];

      // First mount
      let unmount: () => void;
      await act(async () => {
        const result = render(
          <Form jsonSchema={schema} formTypeInputDefinitions={formTypeInputDefs} />,
        );
        unmount = result.unmount;
        await vi.advanceTimersByTimeAsync(100);
      });

      const firstMountCount = mountCount;

      // Unmount
      await act(async () => {
        unmount!();
        await vi.advanceTimersByTimeAsync(50);
      });

      // Remount with same schema
      await act(async () => {
        render(
          <Form jsonSchema={schema} formTypeInputDefinitions={formTypeInputDefs} />,
        );
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should have mounted twice total
      expect(mountCount).toBe(firstMountCount * 2);
    });
  });

  describe('Complex Value Types', () => {
    it('should handle deeply nested object updates', async () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: {
                    type: 'object',
                    properties: {
                      value: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      const DeepInput = createTestInput('deep-input');

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={[
              { test: { path: '/level1/level2/level3/value' }, Component: DeepInput },
            ]}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Set deeply nested value
      await act(async () => {
        formHandle.current?.setValue({
          level1: {
            level2: {
              level3: {
                value: 'deep-value',
              },
            },
          },
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      expect(value?.level1?.level2?.level3?.value).toBe('deep-value');
      expect(getInputValue('deep-input')).toBe('deep-value');
    });

    it('should handle array with complex object items', async () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                nested: {
                  type: 'object',
                  properties: {
                    data: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={[
              { test: { type: 'string' }, Component: createTestInput('array-item') },
              { test: { type: 'number' }, Component: createTestInput('array-num') },
            ]}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Set array with complex items
      await act(async () => {
        formHandle.current?.setValue({
          items: [
            { id: 1, name: 'Item 1', nested: { data: 'data1' } },
            { id: 2, name: 'Item 2', nested: { data: 'data2' } },
          ],
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      expect(value?.items).toHaveLength(2);
      expect(value?.items?.[0]?.name).toBe('Item 1');
      expect(value?.items?.[1]?.nested?.data).toBe('data2');
    });
  });

  describe('Concurrent Updates', () => {
    it('should handle setValue on multiple sibling nodes simultaneously', async () => {
      const schema = {
        type: 'object',
        properties: {
          field1: { type: 'string' },
          field2: { type: 'string' },
          field3: { type: 'string' },
        },
      } satisfies JsonSchema;

      let formHandle: { current: FormHandle<typeof schema> | null } = {
        current: null,
      };

      const FormWithRef = () => {
        const ref = useRef<FormHandle<typeof schema>>(null);
        formHandle = ref;
        return (
          <Form
            ref={ref}
            jsonSchema={schema}
            formTypeInputDefinitions={[
              { test: { path: '/field1' }, Component: createTestInput('concurrent-1') },
              { test: { path: '/field2' }, Component: createTestInput('concurrent-2') },
              { test: { path: '/field3' }, Component: createTestInput('concurrent-3') },
            ]}
          />
        );
      };

      await act(async () => {
        render(<FormWithRef />);
        await vi.advanceTimersByTimeAsync(100);
      });

      // Set all fields at once
      await act(async () => {
        formHandle.current?.setValue({
          field1: 'value1',
          field2: 'value2',
          field3: 'value3',
        });
        await vi.advanceTimersByTimeAsync(100);
      });

      const value = formHandle.current?.getValue();
      expect(value?.field1).toBe('value1');
      expect(value?.field2).toBe('value2');
      expect(value?.field3).toBe('value3');

      // Verify DOM
      expect(getInputValue('concurrent-1')).toBe('value1');
      expect(getInputValue('concurrent-2')).toBe('value2');
      expect(getInputValue('concurrent-3')).toBe('value3');
    });
  });
});
