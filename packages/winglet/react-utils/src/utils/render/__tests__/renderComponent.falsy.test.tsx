import { describe, expect, it } from 'vitest';

import { renderComponent } from '../renderComponent';

/**
 * renderComponent 는 엘리먼트와 컴포넌트만 렌더한다 — 맨 텍스트는 그리지 않는다는 것이
 * renderComponent.test.tsx 가 고정한 계약이며, 그래서 `0` 과 `''` 도 통과하지 않는다.
 * 감사(L13)는 이 둘을 유효한 ReactNode 로 보아 버그로 분류했으나, 이 함수의 계약에서는
 * 문자열도 같은 취급이므로 일관된 동작이다.
 */
describe('renderComponent with non-component values', () => {
  it('should render nothing for bare text or numbers', () => {
    expect(renderComponent(0)).toBeNull();
    expect(renderComponent('')).toBeNull();
    expect(renderComponent('not a component')).toBeNull();
    expect(renderComponent(42)).toBeNull();
  });

  it('should render nothing for values React itself treats as nothing', () => {
    expect(renderComponent(null)).toBeNull();
    expect(renderComponent(undefined)).toBeNull();
    expect(renderComponent(false)).toBeNull();
  });
});
