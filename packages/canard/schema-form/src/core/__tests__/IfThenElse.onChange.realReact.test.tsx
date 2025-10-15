/**
 * Real React Component Tests for If-Then-Else onChange Bug
 *
 * This test uses actual React components to reproduce the Storybook bug
 * where onChange values don't match node.value when toggling type field.
 *
 * The bug occurs due to:
 * - React 18 automatic batching
 * - Multiple onChange calls being batched
 * - State updates not reflecting latest node values
 */
import { useState } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { Form, type JsonSchema } from '@/schema-form';

describe('If-Then-Else onChange Real React Bug', () => {
  it('should update React state correctly when toggling adult <-> none', async () => {
    const schema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              default: 'Anonymous',
            },
            profile: {
              type: 'object',
              if: {
                properties: {
                  type: { enum: ['adult', 'child'] },
                },
              },
              then: {
                required: ['age', 'gender', 'preferences'],
              },
              properties: {
                type: {
                  type: 'string',
                  enum: ['adult', 'child', 'none'],
                  default: 'adult',
                },
                age: {
                  type: 'integer',
                  minimum: 0,
                  default: 18,
                },
                gender: {
                  type: 'string',
                  enum: ['male', 'female', 'other'],
                  default: 'male',
                },
                preferences: {
                  type: 'object',
                  properties: {
                    theme: {
                      type: 'string',
                      enum: ['light', 'dark'],
                      default: 'light',
                    },
                    notifications: {
                      type: 'object',
                      properties: {
                        email: {
                          type: 'boolean',
                          default: true,
                        },
                        sms: {
                          type: 'boolean',
                          default: false,
                        },
                      },
                      required: ['email', 'sms'],
                    },
                  },
                  required: ['theme', 'notifications'],
                },
              },
              required: ['type'],
            },
          },
          required: ['name'],
        },
      },
      required: ['user'],
    } satisfies JsonSchema;

    // Component that mimics Storybook usage exactly
    const TestComponent = () => {
      const [value, setValue] = useState<any>({});
      const [onChangeLog, setOnChangeLog] = useState<any[]>([]);

      const handleChange = (newValue: any) => {
        // Log ALL onChange calls
        setOnChangeLog((prev) => [...prev, structuredClone(newValue)]);
        // Update state like Storybook does
        setValue(newValue);
      };

      return (
        <div>
          <Form jsonSchema={schema} onChange={handleChange} />

          {/* Display current state for debugging */}
          <div data-testid="current-value">
            {JSON.stringify(value?.user?.profile)}
          </div>

          <div data-testid="onChange-count">{onChangeLog.length}</div>

          <div data-testid="current-type">
            {value?.user?.profile?.type || 'undefined'}
          </div>

          <div data-testid="current-age">
            {value?.user?.profile?.age !== undefined
              ? value.user.profile.age
              : 'undefined'}
          </div>

          <div data-testid="current-preferences">
            {value?.user?.profile?.preferences !== undefined
              ? 'exists'
              : 'undefined'}
          </div>
        </div>
      );
    };

    render(<TestComponent />);

    // Wait for initial render and value
    await waitFor(
      () => {
        expect(screen.getByTestId('current-type').textContent).toBe('adult');
      },
      { timeout: 1000 },
    );

    // Verify initial state
    expect(screen.getByTestId('current-age').textContent).toBe('18');
    expect(screen.getByTestId('current-preferences').textContent).toBe(
      'exists',
    );

    const initialCount = parseInt(
      screen.getByTestId('onChange-count').textContent || '0',
    );

    // Find the type dropdown
    const typeSelect = screen.getByDisplayValue('adult');

    // Step 1: Change adult -> none
    const user = userEvent.setup();
    await user.selectOptions(typeSelect, 'none');

    await waitFor(
      () => {
        const count = parseInt(
          screen.getByTestId('onChange-count').textContent || '0',
        );
        expect(count).toBeGreaterThan(initialCount);
      },
      { timeout: 1000 },
    );

    // CRITICAL: Verify state updated correctly
    await waitFor(
      () => {
        expect(screen.getByTestId('current-type').textContent).toBe('none');
      },
      { timeout: 1000 },
    );

    // Log current state for debugging
    console.log('After none:');
    console.log('  type:', screen.getByTestId('current-type').textContent);
    console.log('  age:', screen.getByTestId('current-age').textContent);
    console.log(
      '  preferences:',
      screen.getByTestId('current-preferences').textContent,
    );
    console.log('  value:', screen.getByTestId('current-value').textContent);

    // THIS IS THE BUG: age and preferences should be undefined when type='none'
    expect(screen.getByTestId('current-age').textContent).toBe('undefined');
    expect(screen.getByTestId('current-preferences').textContent).toBe(
      'undefined',
    );

    const noneCount = parseInt(
      screen.getByTestId('onChange-count').textContent || '0',
    );

    // Step 2: Change none -> adult
    const noneSelect = screen.getByDisplayValue('none');
    await user.selectOptions(noneSelect, 'adult');

    await waitFor(
      () => {
        const count = parseInt(
          screen.getByTestId('onChange-count').textContent || '0',
        );
        expect(count).toBeGreaterThan(noneCount);
      },
      { timeout: 1000 },
    );

    // CRITICAL: Verify state updated correctly back to adult
    await waitFor(
      () => {
        expect(screen.getByTestId('current-type').textContent).toBe('adult');
      },
      { timeout: 1000 },
    );

    console.log('After adult:');
    console.log('  type:', screen.getByTestId('current-type').textContent);
    console.log('  age:', screen.getByTestId('current-age').textContent);
    console.log(
      '  preferences:',
      screen.getByTestId('current-preferences').textContent,
    );
    console.log('  value:', screen.getByTestId('current-value').textContent);

    expect(screen.getByTestId('current-age').textContent).toBe('18');
    expect(screen.getByTestId('current-preferences').textContent).toBe(
      'exists',
    );

    console.log('✅ React state updates correctly with adult <-> none toggle');
  });

  it('should handle rapid toggles without state corruption', async () => {
    const schema = {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          if: {
            properties: {
              type: { enum: ['adult'] },
            },
          },
          then: {
            required: ['age'],
          },
          properties: {
            type: {
              type: 'string',
              enum: ['adult', 'none'],
              default: 'adult',
            },
            age: {
              type: 'integer',
              default: 18,
            },
          },
          required: ['type'],
        },
      },
    } satisfies JsonSchema;

    const TestComponent = () => {
      const [value, setValue] = useState<any>({});

      return (
        <div>
          <Form jsonSchema={schema} onChange={setValue} />

          <div data-testid="type">{value?.profile?.type || 'undefined'}</div>
          <div data-testid="age">
            {value?.profile?.age !== undefined
              ? value.profile.age
              : 'undefined'}
          </div>
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(
      () => {
        expect(screen.getByTestId('type').textContent).toBe('adult');
      },
      { timeout: 1000 },
    );

    const user = userEvent.setup();

    // Rapid toggles: adult -> none -> adult -> none -> adult
    for (const target of ['none', 'adult', 'none', 'adult']) {
      const currentSelect = screen.getByDisplayValue(
        target === 'none' ? 'adult' : 'none',
      );
      await user.selectOptions(currentSelect, target);

      await waitFor(
        () => {
          expect(screen.getByTestId('type').textContent).toBe(target);
        },
        { timeout: 1000 },
      );

      // Verify age is correct for the type
      if (target === 'adult') {
        expect(screen.getByTestId('age').textContent).toBe('18');
      } else {
        expect(screen.getByTestId('age').textContent).toBe('undefined');
      }

      // Small delay between toggles
      await delay(100);
    }

    console.log('✅ Rapid toggles handled correctly');
  });
});
