import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import { ErrorVisibility } from '@/schema-form/types';
import type { FieldRendererProps } from '@/schema-form/types';

import { getRendererBoundary } from '../utils/getRendererBoundary';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('shares a boundary type per renderer across fields and A to B to A', () => {
  const A = ({ Input }: FieldRendererProps) => <Input />;
  const B = ({ Input }: FieldRendererProps) => <Input />;
  const first = getRendererBoundary(A);
  expect(getRendererBoundary(A)).toBe(first);
  expect(getRendererBoundary(B)).not.toBe(first);
  expect(getRendererBoundary(A)).toBe(first);
});

it('recovers A after B without retaining failed instance state', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let fails = true;
  const A = ({ path, Input }: FieldRendererProps) => {
    if (path === '/bad' && fails) throw new Error('renderer failed');
    return <Input />;
  };
  const B = ({ Input }: FieldRendererProps) => <Input />;
  const props = {
    jsonSchema: {
      type: 'object' as const,
      properties: {
        bad: { type: 'string' as const },
        good: { type: 'string' as const },
      },
    },
    onError: vi.fn(),
  };
  const view = render(<Form {...props} FieldRenderer={A} />);
  expect(view.container.querySelector('input[name="bad"]')).toBeNull();
  expect(view.container.querySelector('input[name="good"]')).not.toBeNull();
  view.rerender(<Form {...props} FieldRenderer={B} />);
  expect(view.container.querySelector('input[name="bad"]')).not.toBeNull();
  fails = false;
  view.rerender(<Form {...props} FieldRenderer={A} />);
  expect(view.container.querySelector('input[name="bad"]')).not.toBeNull();
});

it('retries only the failed sibling when its formatter changes', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const Renderer = ({ Input }: FieldRendererProps) => <Input />;
  const props = {
    jsonSchema: {
      type: 'object' as const,
      properties: {
        bad: { type: 'string' as const },
        good: { type: 'string' as const },
      },
    },
    FieldRenderer: Renderer,
    errorVisibility: ErrorVisibility.Always,
    errors: [{ dataPath: '/bad', keyword: 'external', message: 'bad' }],
    onError: vi.fn(),
  };
  const view = render(
    <Form
      {...props}
      formatError={(_error, node) => {
        if (node.path === '/bad') throw new Error('format failed');
        return null;
      }}
    />,
  );
  const peer = view.container.querySelector('input[name="good"]');
  expect(peer).not.toBeNull();
  expect(view.container.querySelector('input[name="bad"]')).toBeNull();
  view.rerender(<Form {...props} formatError={() => 'recovered'} />);
  expect(view.container.querySelector('input[name="bad"]')).not.toBeNull();
  expect(view.container.querySelector('input[name="good"]')).toBe(peer);
});
