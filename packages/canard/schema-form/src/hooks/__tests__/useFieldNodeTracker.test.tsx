import { StrictMode } from 'react';

import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FieldNodeEventType } from '@/schema-form/core';

import { hideCommittedForm } from '../../__tests__/helpers/hideCommittedForm';
import { useFieldNodeTracker } from '../fieldNode/useFieldNodeTracker';
import { createHookNode } from './createHookNode';

describe('useFieldNodeTracker with a new-engine node', () => {
  it('rechecks a reconnected snapshot after a render with an unchanged revision', () => {
    const node = createHookNode();
    node.setValue('initial');
    const Probe = ({ tick }: { tick: number }) => {
      const revision = useFieldNodeTracker(
        node,
        FieldNodeEventType.UpdateValue,
      );
      return (
        <output data-tick={tick} data-revision={revision}>
          {String(node.value)}
        </output>
      );
    };
    const view = render(hideCommittedForm(<Probe tick={0} />, false));
    const probe = <Probe tick={1} />;
    view.rerender(hideCommittedForm(probe, false));
    view.rerender(hideCommittedForm(probe, true));
    act(() => node.setValue('hidden'));
    view.rerender(hideCommittedForm(probe, false));
    expect(view.container.querySelector('output')!.textContent).toBe('hidden');
    view.unmount();
  });

  it('REACT-021 renders once per synchronous matching write and reads the masked revision', () => {
    const node = createHookNode();
    const renders: number[] = [];
    const Probe = () => {
      const revision = useFieldNodeTracker(
        node,
        FieldNodeEventType.UpdateValue,
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
    expect(renders[1]).toBe(node.revision(FieldNodeEventType.UpdateValue));
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
      const revision = useFieldNodeTracker(
        node,
        FieldNodeEventType.UpdateValue,
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
    expect(node.revision(FieldNodeEventType.UpdateValue)).toBe(1);
    view.unmount();
    expect(active).toBe(0);
  });
});
