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

  describe('💡 실제 사용 예제', () => {
    test('나누기 연산자 사용법', () => {
      const cases = [
        {
          input: '(../value) / 2', // 괄호로 경로를 감싼 후 나누기
          expected: '(dependencies[0]) / 2',
          paths: ['../value'],
        },
        {
          input: '../value/2', // 띄어쓰기 없이 /2는 경로의 일부
          expected: 'dependencies[0]',
          paths: ['../value/2'],
        },
        {
          input: 'Math.floor(../value / 2)', // 함수 안에서 / 사용
          expected: 'Math.floor(dependencies[0] / 2)',
          paths: ['../value'],
        },
        {
          input: '(../a)*(../b)', // 곱셈 연산자는 문제 없음
          expected: '(dependencies[0])*(dependencies[1])',
          paths: ['../a', '../b'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('루트 참조 방법', () => {
      const cases = [
        {
          input: '#/config/value', // 추천: 명확한 루트 참조
          expected: 'dependencies[0]',
          paths: ['#/config/value'],
        },
        {
          input: '(#/) || ../fallback', // 괄호로 감싼 루트
          expected: '(dependencies[0]) || dependencies[1]',
          paths: ['#/', '../fallback'],
        },
        {
          input: '/absolutePath', // 절대 경로 (속성명 필수)
          expected: 'dependencies[0]',
          paths: ['/absolutePath'],
        },
        {
          input: '../value / 2', // 나누기 연산자 사용
          expected: 'dependencies[0] / 2',
          paths: ['../value'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('Form validation 규칙', () => {
      const validationRule = `
        (../../userType === "premium" || ../subscriptionLevel >= 2) &&
        ../age >= 18 &&
        ../age <= 120 &&
        ((../email).includes("@") && (../email).length > 5) &&
        (!../country || ../country === "US" || (#/allowedCountries).includes(../country))
      `;

      const result = transformExpression(validationRule);
      expect(result.paths).toEqual([
        '../../userType',
        '../subscriptionLevel',
        '../age',
        '../email',
        '../country',
        '#/allowedCountries',
      ]);
    });

    test('가격 계산 로직', () => {
      const priceCalculation = `
        (../../basePrice * ../quantity) * 
        (1 - (../discountRate || 0)) + 
        ../shippingFee - 
        (../loyaltyPoints > 100 ? ./loyaltyDiscount : 0)
      `;

      const result = transformExpression(priceCalculation);
      expect(result.paths).toEqual([
        '../../basePrice',
        '../quantity',
        '../discountRate',
        '../shippingFee',
        '../loyaltyPoints',
        './loyaltyDiscount',
      ]);
    });

    test('조건부 필드 표시 로직', () => {
      const displayLogic = `
        (../showAdvanced) &&
        ((../../role) === "admin" ||
         ((../permissions).includes("edit") && (../permissions).includes("view"))) &&
        !(#/config/maintenanceMode)
      `;

      const result = transformExpression(displayLogic);
      expect(result.paths).toEqual([
        '../showAdvanced',
        '../../role',
        '../permissions',
        '#/config/maintenanceMode',
      ]);
    });
  });
});
