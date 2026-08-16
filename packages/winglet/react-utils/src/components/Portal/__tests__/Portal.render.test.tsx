import { useEffect } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Portal } from '../index';

/**
 * Portal 이 anchor 위치에 렌더되는 동안 서브트리 identity 를 유지하는지 검증한다.
 * withPortal.test.tsx 는 provider 래핑만 다루고 포털링 자체는 검증하지 않는다.
 */
describe('Portal rendering', () => {
  const onMount = vi.fn();
  const onUnmount = vi.fn();

  const Tracked = () => {
    useEffect(() => {
      onMount();
      return onUnmount;
    }, []);
    return <span data-testid="content">tracked</span>;
  };

  const Counting = Portal.with(({ tick }: { tick: number }) => (
    <div>
      <span data-testid="tick">{tick}</span>
      <Portal>
        <Tracked />
      </Portal>
      <Portal.Anchor />
    </div>
  ));

  /** 참조가 고정된 콘텐츠 — Portal 의 memo 가 걸려 register 재실행이 일어나지 않는다. */
  const stableContent = <span data-testid="content">portaled</span>;

  const Swapping = Portal.with(({ swapped }: { swapped: boolean }) => (
    <div>
      <Portal>{stableContent}</Portal>
      {swapped ? (
        <div key="second" data-testid="second">
          <Portal.Anchor />
        </div>
      ) : (
        <div key="first" data-testid="first">
          <Portal.Anchor />
        </div>
      )}
    </div>
  ));

  const Labelled = Portal.with(({ label }: { label: string }) => (
    <div>
      <Portal>
        <span data-testid="content">{label}</span>
      </Portal>
      <Portal.Anchor />
    </div>
  ));

  const Toggling = Portal.with(({ shown }: { shown: boolean }) => (
    <div>
      {shown && (
        <Portal>
          <span data-testid="content">portaled</span>
        </Portal>
      )}
      <Portal.Anchor />
    </div>
  ));

  it('부모가 리렌더해도 포털 서브트리가 리마운트되지 않아야 합니다', () => {
    onMount.mockClear();
    onUnmount.mockClear();

    const { rerender } = render(<Counting tick={0} />);
    expect(onMount).toHaveBeenCalledTimes(1);

    rerender(<Counting tick={1} />);
    rerender(<Counting tick={2} />);
    rerender(<Counting tick={3} />);

    expect(screen.getByTestId('tick').textContent).toBe('3');
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onUnmount).not.toHaveBeenCalled();
  });

  it('anchor 가 교체되면 콘텐츠가 새 anchor 로 따라가야 합니다', () => {
    const { rerender } = render(<Swapping swapped={false} />);
    expect(
      screen.getByTestId('first').contains(screen.getByTestId('content')),
    ).toBe(true);

    rerender(<Swapping swapped={true} />);

    expect(screen.queryByTestId('content')).not.toBeNull();
    expect(
      screen.getByTestId('second').contains(screen.getByTestId('content')),
    ).toBe(true);
  });

  it('children 이 바뀌면 포털 내용이 갱신되어야 합니다', () => {
    const { rerender } = render(<Labelled label="first" />);
    expect(screen.getByTestId('content').textContent).toBe('first');

    rerender(<Labelled label="second" />);

    expect(screen.getByTestId('content').textContent).toBe('second');
  });

  it('Portal 이 언마운트되면 콘텐츠가 제거되어야 합니다', () => {
    const { rerender } = render(<Toggling shown={true} />);
    expect(screen.queryByTestId('content')).not.toBeNull();

    rerender(<Toggling shown={false} />);

    expect(screen.queryByTestId('content')).toBeNull();
  });
});
