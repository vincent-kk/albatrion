import { describe, expect, test } from 'vitest';

import { JSON_POINTER_PATH_REGEX } from '../regex';

/**
 * JSON Pointer Path Expression Boundary Test
 *
 * Usage Guidelines:
 * 1. Use #/ for root references (recommended)
 * 2. / alone is treated as division operator
 * 3. /propertyName is an absolute path (property name required)
 * 4. #/ is a valid root reference
 * 5. All non-JavaScript variable characters act as path separators
 *
 * Division operator handling:
 * - "a / b" → / is division operator
 * - "/property" → absolute path
 * - "#/" → root reference
 */
describe('JSON_POINTER_REGEX 경계선 테스트', () => {
  // PathManager 목업
  class PathManager {
    private paths: string[] = [];

    set(path: string): void {
      if (!this.paths.includes(path)) {
        this.paths.push(path);
      }
    }

    findIndex(path: string): number {
      return this.paths.indexOf(path);
    }

    clear(): void {
      this.paths = [];
    }

    getPaths(): string[] {
      return [...this.paths];
    }
  }

  // Expression 변환 함수
  const transformExpression = (
    expression: string,
  ): { result: string; paths: string[] } => {
    const pathManager = new PathManager();
    const computedExpression = expression
      .replace(JSON_POINTER_PATH_REGEX, (path) => {
        pathManager.set(path);
        return `dependencies[${pathManager.findIndex(path)}]`;
      })
      .trim()
      .replace(/;$/, '');

    return {
      result: computedExpression,
      paths: pathManager.getPaths(),
    };
  };

  describe('Performance - deeply nested paths (ReDoS prevention)', () => {
    test('extremely deep parent references', () => {
      const deepParent = '../'.repeat(100) + 'target';
      const result = transformExpression(deepParent);
      expect(result.paths).toHaveLength(1);
      expect(result.paths[0]).toBe(deepParent);
    });

    test('extremely deep path segments', () => {
      const deepPath = '#/' + Array(200).fill('level').join('/');
      const result = transformExpression(deepPath);
      expect(result.paths).toHaveLength(1);
      expect(result.paths[0]).toBe(deepPath);
    });

    test('combined deep parent refs and segments', () => {
      const combinedPath =
        '../'.repeat(30) + Array(100).fill('segment').join('/');
      const result = transformExpression(combinedPath);
      expect(result.paths).toHaveLength(1);
      expect(result.paths[0]).toBe(combinedPath);
    });

    test('deeply nested paths should complete quickly', () => {
      const start = performance.now();

      transformExpression('../'.repeat(50) + 'a');
      transformExpression('#/' + 'a/'.repeat(200) + 'final');
      transformExpression('./' + 'path/'.repeat(100) + 'end');

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in < 100ms
    });

    test('multiple deep paths in single expression', () => {
      const expr = `${'../'.repeat(20)}a === "x" && #/${'b/'.repeat(50)}c > 0`;
      const result = transformExpression(expr);
      expect(result.paths).toHaveLength(2);
    });

    test('pathological nesting patterns should not cause ReDoS', () => {
      const start = performance.now();

      // Test various pathological patterns
      transformExpression('../'.repeat(200) + 'end');
      transformExpression('#/' + 'segment/'.repeat(300) + 'final');
      transformExpression(
        '../'.repeat(50) + 'a === "x" && ../' + 'b/'.repeat(50) + 'c > 0',
      );

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(200); // Should complete in < 200ms
    });
  });
});
