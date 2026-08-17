import { forwardRef, lazy, memo } from 'react';
import { describe, expect, it } from 'vitest';

import { isReactComponent } from '../isReactComponent';
import { renderComponent } from '../../render/renderComponent';

/**
 * React 가 컴포넌트로 인정하는 exotic 타입(forwardRef, lazy)도 컴포넌트로 판별되어야 한다.
 * 놓치면 renderComponent 가 오류 없이 null 을 돌려주어 화면에서 조용히 사라진다.
 */
describe('isReactComponent with exotic component types', () => {
  const Plain = () => null;
  const Memoized = memo(Plain);
  const Forwarded = forwardRef<HTMLDivElement>((_, ref) => (
    <div ref={ref} data-testid="forwarded" />
  ));
  const Lazied = lazy(async () => ({ default: Plain }));

  it('should recognise forwardRef and lazy components', () => {
    expect(isReactComponent(Forwarded)).toBe(true);
    expect(isReactComponent(Lazied)).toBe(true);
  });

  it('should keep recognising the component kinds it already handled', () => {
    expect(isReactComponent(Plain)).toBe(true);
    expect(isReactComponent(Memoized)).toBe(true);
  });

  it('should reject values that are not components at all', () => {
    expect(isReactComponent(null)).toBe(false);
    expect(isReactComponent({})).toBe(false);
    expect(isReactComponent('Button')).toBe(false);
  });

  it('should render a forwardRef component instead of dropping it', () => {
    expect(renderComponent(Forwarded)).not.toBeNull();
  });
});
