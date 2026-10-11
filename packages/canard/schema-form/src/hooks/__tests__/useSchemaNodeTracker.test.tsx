import { StrictMode } from 'react';

import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SchemaNodeEventType } from '@/schema-form/core';

import { useSchemaNodeTracker } from '../useSchemaNodeTracker';
import { createHookNode } from './createHookNode';

describe('useSchemaNodeTracker with a new-engine node', () => {
  it('REACT-021 renders once per synchronous matching write and reads the masked revision', () => {
    const node = createHookNode();
    const renders: number[] = [];
    const Probe = () => {
      const revision = useSchemaNodeTracker(
        node,
        SchemaNodeEventType.UpdateValue,
      );
      renders.push(revision);
      return <output data-testid="revision">{revision}</output>;
    };

    render(<Probe />);
    expect(renders).toEqual([0]);
    act(() => node.setState({ touched: true }));
    expect(renders).toEqual([0]);
    act(() => node.setValue('written'));
    expect(renders).toEqual([0, 1]);
    expect(screen.getByTestId('revision').textContent).toBe('1');
    expect(renders[1]).toBe(node.revision(SchemaNodeEventType.UpdateValue));
  });

  it('REACT-021 retains one active subscription through StrictMode replay and cleans it up', () => {
    const node = createHookNode();
    const subscribe = node.subscribe.bind(node);
    let active = 0;
    vi.spyOn(node, 'subscribe').mockImplementation((listener) => {
      active += 1;
      const unsubscribe = subscribe(listener);
      return () => {
        active -= 1;
        unsubscribe();
      };
    });
    const renders: number[] = [];
    const Probe = () => {
      const revision = useSchemaNodeTracker(
        node,
        SchemaNodeEventType.UpdateValue,
      );
      renders.push(revision);
      return <output>{revision}</output>;
    };

    const view = render(
      <StrictMode>
        <Probe />
      </StrictMode>,
    );
    expect(active).toBe(1);
    const before = renders.length;
    act(() => node.setValue('written'));
    expect(renders.slice(before)).toEqual([1, 1]);
    expect(node.revision(SchemaNodeEventType.UpdateValue)).toBe(1);
    view.unmount();
    expect(active).toBe(0);
  });
});
