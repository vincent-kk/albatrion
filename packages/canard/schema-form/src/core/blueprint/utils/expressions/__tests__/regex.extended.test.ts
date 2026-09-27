import { describe, expect, test } from 'vitest';

import { JSON_POINTER_PATH_REGEX } from '../regex';

describe('Extended JSON_POINTER_REGEX - 연속된 path를 하나로 인식', () => {
  // 헬퍼 함수: 매칭된 결과 추출
  const extractMatches = (input: string): string[] => {
    JSON_POINTER_PATH_REGEX.lastIndex = 0;
    const matches: string[] = [];
    let match;
    while ((match = JSON_POINTER_PATH_REGEX.exec(input)) !== null) {
      matches.push(match[0]);
    }
    return matches;
  };

  describe('핵심 요구사항: ../../trigger를 하나의 토큰으로', () => {
    test('../../trigger가 하나로 매칭되어야 함', () => {
      const input = '../../trigger';
      const matches = extractMatches(input);
      expect(matches).toEqual(['../../trigger']);
      expect(matches).toHaveLength(1);
    });

    test('여러 레벨의 상위 경로 참조', () => {
      expect(extractMatches('../../../module')).toEqual(['../../../module']);
      expect(extractMatches('../../../../deep/nested')).toEqual([
        '../../../../deep/nested',
      ]);
      expect(extractMatches('../../../../../very/deep/path')).toEqual([
        '../../../../../very/deep/path',
      ]);
    });

    test('표현식 내에서도 올바르게 파싱', () => {
      const input = '../../trigger && ../condition';
      const matches = extractMatches(input);
      expect(matches).toEqual(['../../trigger', '../condition']);
      expect(matches).toHaveLength(2);
    });
  });

  describe('JavaScript 변수명 규칙', () => {
    test('유효한 변수명 문자들', () => {
      expect(extractMatches('../_private')).toEqual(['../_private']);
      expect(extractMatches('../$jquery')).toEqual(['../$jquery']);
      expect(extractMatches('../camelCase')).toEqual(['../camelCase']);
      expect(extractMatches('../PascalCase')).toEqual(['../PascalCase']);
      expect(extractMatches('../with_underscore')).toEqual([
        '../with_underscore',
      ]);
      expect(extractMatches('../with$dollar')).toEqual(['../with$dollar']);
      expect(extractMatches('../var123')).toEqual(['../var123']);
    });

    test('유효하지 않은 변수명 문자 처리', () => {
      // 숫자로 시작하는 경우
      expect(extractMatches('../123invalid')).toEqual(['../123invalid']);

      // 하이픈이 있는 경우 - 하이픈 앞까지만
      expect(extractMatches('../my-var')).toEqual(['../my-var']);

      // 특수문자가 있는 경우
      expect(extractMatches('../var@test')).toEqual(['../var@test']);

      // 공백이 있는 경우
      expect(extractMatches('../my var')).toEqual(['../my']);
    });
  });

  describe('다양한 prefix 패턴', () => {
    test('모든 prefix 타입 지원', () => {
      expect(extractMatches('#/fragment')).toEqual(['#/fragment']);
      expect(extractMatches('./current')).toEqual(['./current']);
      expect(extractMatches('../parent')).toEqual(['../parent']);
      expect(extractMatches('/absolute')).toEqual(['/absolute']);
      expect(extractMatches('../../grandparent')).toEqual([
        '../../grandparent',
      ]);
    });

    test('중첩된 경로 지원', () => {
      expect(extractMatches('#/a/b/c')).toEqual(['#/a/b/c']);
      expect(extractMatches('./a/b/c')).toEqual(['./a/b/c']);
      expect(extractMatches('../a/b/c')).toEqual(['../a/b/c']);
      expect(extractMatches('/a/b/c')).toEqual(['/a/b/c']);
      expect(extractMatches('../../a/b/c')).toEqual(['../../a/b/c']);
    });
  });

  describe('실제 사용 시나리오', () => {
    test('Form validation 표현식', () => {
      const input = '../../userType === "premium" && ../age >= 21';
      const matches = extractMatches(input);
      expect(matches).toEqual(['../../userType', '../age']);
    });

    test('조건부 로직', () => {
      const input = '../../../config/enabled ? ../../data/value : ../default';
      const matches = extractMatches(input);
      expect(matches).toEqual([
        '../../../config/enabled',
        '../../data/value',
        '../default',
      ]);
    });

    test('복잡한 표현식', () => {
      const input = '(../../price * 0.9) + ../tax - ./discount';
      const matches = extractMatches(input);
      expect(matches).toEqual(['../../price', '../tax', './discount']);
    });
  });

  describe('의존성 변환 테스트', () => {
    test('경로를 dependencies 배열로 변환', () => {
      const transform = (input: string) => {
        const pathManager: string[] = [];
        JSON_POINTER_PATH_REGEX.lastIndex = 0;
        return input.replace(JSON_POINTER_PATH_REGEX, (path) => {
          if (!pathManager.includes(path)) pathManager.push(path);
          return `dependencies[${pathManager.indexOf(path)}]`;
        });
      };

      expect(transform('../../trigger && ../condition')).toBe(
        'dependencies[0] && dependencies[1]',
      );
      expect(transform('../../../path === "value"')).toBe(
        'dependencies[0] === "value"',
      );
      expect(transform('../../same > 10 && ../../same < 100')).toBe(
        'dependencies[0] > 10 && dependencies[0] < 100',
      );
    });
  });
});
