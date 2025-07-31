import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StyleManager } from '../StyleManager';
import { destroyScope } from '../destroyScope';

// StyleManager 모킹
vi.mock('../StyleManager', () => {
  const mockInstance = {
    add: vi.fn(),
    remove: vi.fn(),
    destroy: vi.fn(),
  };

  return {
    StyleManager: {
      get: vi.fn(() => mockInstance),
    },
  };
});

describe('destroyScope', () => {
  const mockStyleManager = {
    add: vi.fn(),
    remove: vi.fn(),
    destroy: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (StyleManager.get as any).mockReturnValue(mockStyleManager);
  });

  it('주어진 scopeId로 StyleManager.get을 호출해야 합니다', () => {
    const scopeId = 'test-scope';

    destroyScope(scopeId);

    expect(StyleManager.get).toHaveBeenCalledWith(scopeId);
  });

  it('StyleManager 인스턴스의 destroy 메서드를 호출해야 합니다', () => {
    const scopeId = 'test-scope';

    destroyScope(scopeId);

    expect(mockStyleManager.destroy).toHaveBeenCalledTimes(1);
  });

  it('여러 다른 scope를 독립적으로 destroy할 수 있어야 합니다', () => {
    const scope1 = 'scope-1';
    const scope2 = 'scope-2';
    const scope3 = 'scope-3';

    destroyScope(scope1);
    destroyScope(scope2);
    destroyScope(scope3);

    expect(StyleManager.get).toHaveBeenCalledWith(scope1);
    expect(StyleManager.get).toHaveBeenCalledWith(scope2);
    expect(StyleManager.get).toHaveBeenCalledWith(scope3);
    expect(mockStyleManager.destroy).toHaveBeenCalledTimes(3);
  });

  it('같은 scope를 여러 번 destroy해도 문제없이 작동해야 합니다', () => {
    const scopeId = 'test-scope';

    destroyScope(scopeId);
    destroyScope(scopeId);
    destroyScope(scopeId);

    expect(StyleManager.get).toHaveBeenCalledTimes(3);
    expect(mockStyleManager.destroy).toHaveBeenCalledTimes(3);
  });

  it('빈 문자열 scopeId도 처리할 수 있어야 합니다', () => {
    const scopeId = '';

    destroyScope(scopeId);

    expect(StyleManager.get).toHaveBeenCalledWith('');
    expect(mockStyleManager.destroy).toHaveBeenCalledTimes(1);
  });

  it('특수 문자가 포함된 scopeId를 처리할 수 있어야 합니다', () => {
    const scopeId = 'scope-with-special-chars_123.component@version1';

    destroyScope(scopeId);

    expect(StyleManager.get).toHaveBeenCalledWith(scopeId);
    expect(mockStyleManager.destroy).toHaveBeenCalledTimes(1);
  });

  it('void를 반환해야 합니다', () => {
    const scopeId = 'test-scope';

    const result = destroyScope(scopeId);

    expect(result).toBeUndefined();
  });

  it('StyleManager.destroy에서 에러가 발생해도 예외가 전파되어야 합니다', () => {
    const scopeId = 'test-scope';
    const error = new Error('Destroy failed');

    mockStyleManager.destroy.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => destroyScope(scopeId)).toThrow('Destroy failed');
  });

  it('실제 사용 시나리오: 컴포넌트 언마운트 시 cleanup', () => {
    const componentScope = 'my-component-instance-123';

    // 컴포넌트가 마운트되어 스타일이 있다고 가정
    destroyScope(componentScope);

    expect(StyleManager.get).toHaveBeenCalledWith(componentScope);
    expect(mockStyleManager.destroy).toHaveBeenCalledTimes(1);
  });
});
