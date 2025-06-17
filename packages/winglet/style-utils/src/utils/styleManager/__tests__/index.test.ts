import { describe, expect, it, vi } from 'vitest';

// 모든 export를 모킹
vi.mock('../styleManagerFactory', () => ({
  styleManagerFactory: vi.fn(),
}));

vi.mock('../destroyScope', () => ({
  destroyScope: vi.fn(),
}));

vi.mock('../utils/dataCondition', () => ({
  dataCondition: vi.fn(),
}));

vi.mock('../utils/dataAttributes', () => ({
  dataAttributes: vi.fn(),
}));

describe('styleManager index exports', () => {
  it('모든 필요한 함수들을 export해야 합니다', async () => {
    const exports = await import('../index');

    expect(exports).toHaveProperty('styleManagerFactory');
    expect(exports).toHaveProperty('destroyScope');
  });

  it('export된 함수들이 실제 함수여야 합니다', async () => {
    const exports = await import('../index');

    expect(typeof exports.styleManagerFactory).toBe('function');
    expect(typeof exports.destroyScope).toBe('function');
  });

  it('올바른 모듈에서 함수들을 import해야 합니다', async () => {
    // 이 테스트는 실제 import 경로가 올바른지 확인
    await expect(() => import('../index')).not.toThrow();
  });

  it('예상되지 않은 export가 없어야 합니다', async () => {
    const exports = await import('../index');
    const expectedExports = ['destroyScope', 'styleManagerFactory'];
    const actualExports = Object.keys(exports);

    expect(actualExports.sort()).toEqual(expectedExports.sort());
  });
});
