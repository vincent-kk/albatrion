import { describe, expect, it } from 'vitest';

import { JsonSchemaError } from '@/schema-form/errors';
import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { getDerivedValueFactory } from '../getDerivedValueFactory/getDerivedValueFactory';
import { getPathManager } from '../getPathManager';

describe('getDerivedValueFactory', () => {
  describe('기본 동작', () => {
    it('computed.value 표현식을 파싱하여 함수를 반환해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './price * 1.1',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('./price');

      // price가 100일 때, 110을 반환해야 함 (부동 소수점 비교)
      expect(getDerivedValue!([100])).toBeCloseTo(110);
    });

    it('&value 별칭을 사용하여 표현식을 파싱해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        '&value': './quantity * ./unitPrice',
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('./quantity');
      expect(pathManager.get()).toContain('./unitPrice');

      // quantity=5, unitPrice=20일 때, 100을 반환해야 함
      expect(getDerivedValue!([5, 20])).toBe(100);
    });

    it('computed.value가 &value보다 우선되어야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './a + ./b',
        },
        '&value': './a - ./b',
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      // computed.value가 우선되므로 a + b를 계산해야 함
      expect(getDerivedValue!([10, 5])).toBe(15);
    });
  });

  describe('유효하지 않은 스키마 처리', () => {
    it('computed.value가 없는 경우 undefined를 반환해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeUndefined();
    });

    it('computed 객체가 비어있는 경우 undefined를 반환해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {},
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeUndefined();
    });

    it('표현식이 빈 문자열인 경우 undefined를 반환해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: '',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeUndefined();
    });

    it('표현식이 null인 경우 undefined를 반환해야 함', () => {
      const schema = {
        type: 'string',
        computed: {
          value: null,
        },
      } as unknown as JsonSchemaWithVirtual;

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeUndefined();
    });

    it('표현식이 숫자인 경우 undefined를 반환해야 함', () => {
      const schema = {
        type: 'string',
        computed: {
          value: 123,
        },
      } as unknown as JsonSchemaWithVirtual;

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeUndefined();
    });

    it('표현식이 boolean인 경우 undefined를 반환해야 함', () => {
      const schema = {
        type: 'string',
        computed: {
          value: true,
        },
      } as unknown as JsonSchemaWithVirtual;

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeUndefined();
    });
  });

  describe('다양한 JSON Pointer 경로 형식', () => {
    it('절대 경로 (/path)를 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: '/root/value * 2',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('/root/value');
      expect(getDerivedValue!([50])).toBe(100);
    });

    it('현재 경로 (./path)를 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './current + 10',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('./current');
      expect(getDerivedValue!([5])).toBe(15);
    });

    it('부모 경로 (../path)를 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: '../sibling - 5',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('../sibling');
      expect(getDerivedValue!([20])).toBe(15);
    });

    it('여러 단계의 부모 경로 (../../path)를 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: '../../ancestor + 100',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('../../ancestor');
      expect(getDerivedValue!([50])).toBe(150);
    });

    it('Fragment 경로 (#/path)를 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: '#/root/data * 3',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      // Fragment(#)는 제거되어 저장됨
      expect(pathManager.get()).toContain('/root/data');
      expect(getDerivedValue!([10])).toBe(30);
    });

    it('컨텍스트 참조 (@)를 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: '@ ? "active" : "inactive"',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('@');
      expect(getDerivedValue!([true])).toBe('active');
      expect(getDerivedValue!([false])).toBe('inactive');
    });

    it('컨텍스트 참조와 프로퍼티 접근 (@.prop)을 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: '@.name + " - " + @.role',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('@');
      expect(getDerivedValue!([{ name: 'Alice', role: 'Admin' }])).toBe(
        'Alice - Admin',
      );
    });

    it('Root 참조 (#)를 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: '# ? "has data" : "no data"',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!([{ some: 'data' }])).toBe('has data');
      expect(getDerivedValue!([null])).toBe('no data');
    });
  });

  describe('복잡한 표현식', () => {
    it('산술 연산자를 포함한 표현식을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: '(./price * ./quantity) + ./tax - ./discount',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('./price');
      expect(pathManager.get()).toContain('./quantity');
      expect(pathManager.get()).toContain('./tax');
      expect(pathManager.get()).toContain('./discount');

      // price=10, quantity=5, tax=5, discount=10 → (10*5) + 5 - 10 = 45
      expect(getDerivedValue!([10, 5, 5, 10])).toBe(45);
    });

    it('논리 연산자를 포함한 표현식을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'boolean',
        computed: {
          value: './isActive && ./hasPermission || ./isAdmin',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!([true, true, false])).toBe(true);
      expect(getDerivedValue!([true, false, false])).toBe(false);
      expect(getDerivedValue!([false, false, true])).toBe(true);
    });

    it('삼항 연산자를 포함한 표현식을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './age >= 18 ? "성인" : "미성년자"',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!([20])).toBe('성인');
      expect(getDerivedValue!([15])).toBe('미성년자');
    });

    it('문자열 연산을 포함한 표현식을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './firstName + " " + ./lastName',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!(['John', 'Doe'])).toBe('John Doe');
    });

    it('배열/객체 메서드를 포함한 표현식을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'number',
        computed: {
          // ./items는 경로로 인식되고, .length는 JS 프로퍼티 접근으로 처리됨
          value: '(./items).length',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('./items');
      expect(getDerivedValue!([[1, 2, 3, 4, 5]])).toBe(5);
    });

    it('비교 연산자를 포함한 표현식을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'boolean',
        computed: {
          value: './score >= 80 && ./score <= 100',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!([90])).toBe(true);
      expect(getDerivedValue!([70])).toBe(false);
      expect(getDerivedValue!([110])).toBe(false);
    });

    it('null 병합 연산자를 포함한 표현식을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './nickname ?? ./name ?? "Anonymous"',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!(['Nick', 'John'])).toBe('Nick');
      expect(getDerivedValue!([null, 'John'])).toBe('John');
      expect(getDerivedValue!([null, null])).toBe('Anonymous');
    });

    it('옵셔널 체이닝을 포함한 표현식을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          // ./user는 경로로 인식되고, ?.profile?.name은 JS 표현식으로 처리됨
          value: '(./user)?.profile?.name ?? "Unknown"',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('./user');
      expect(getDerivedValue!([{ profile: { name: 'Alice' } }])).toBe('Alice');
      expect(getDerivedValue!([{ profile: null }])).toBe('Unknown');
      expect(getDerivedValue!([null])).toBe('Unknown');
    });
  });

  describe('여러 의존성 경로', () => {
    it('동일한 경로가 여러 번 사용될 때 중복 없이 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'number',
        computed: {
          value: './value + ./value + ./value',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toEqual(['./value']);
      expect(getDerivedValue!([10])).toBe(30);
    });

    it('여러 다른 경로를 사용할 때 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './a + ../b + /c + ../../d + ./a', // ./a가 두 번 사용됨
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('./a');
      expect(pathManager.get()).toContain('../b');
      expect(pathManager.get()).toContain('/c');
      expect(pathManager.get()).toContain('../../d');
      expect(pathManager.get().length).toBe(4); // 중복 없이 4개

      // a=1, b=2, c=3, d=4 → 1 + 2 + 3 + 4 + 1 = 11
      expect(getDerivedValue!([1, 2, 3, 4])).toBe(11);
    });
  });

  describe('특수 문자 및 경계 케이스', () => {
    it('세미콜론이 포함된 표현식을 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'number',
        computed: {
          value: './value * 2;',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!([5])).toBe(10);
    });

    it('공백이 있는 표현식을 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'number',
        computed: {
          value: '  ./value   +   10   ',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!([5])).toBe(15);
    });

    it('중첩된 속성 경로를 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './user/profile/settings/theme',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(pathManager.get()).toContain('./user/profile/settings/theme');
      expect(getDerivedValue!(['dark'])).toBe('dark');
    });

    it('특수 문자가 포함된 값을 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './value === "특수문자!@#$%^&*()"',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!(['특수문자!@#$%^&*()'])).toBe(true);
      expect(getDerivedValue!(['other'])).toBe(false);
    });

    it('null과 undefined 값을 올바르게 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'boolean',
        computed: {
          value: './value === null',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!([null])).toBe(true);
      expect(getDerivedValue!([undefined])).toBe(false);
      expect(getDerivedValue!(['value'])).toBe(false);
    });

    it('배열 인덱스 접근을 포함한 표현식을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          // ./items[0]과 ./items[1]은 각각 별도의 경로로 인식됨
          value: './items[0] + ./items[1]',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      // 경로가 ./items[0], ./items[1]로 별도 인식됨
      expect(pathManager.get()).toContain('./items[0]');
      expect(pathManager.get()).toContain('./items[1]');
      // 각각의 값을 별도 의존성으로 전달
      expect(getDerivedValue!(['Hello', ' World'])).toBe('Hello World');
    });
  });

  describe('에러 처리', () => {
    it('잘못된 JavaScript 표현식은 에러를 발생시켜야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './value ===== "invalid"', // 잘못된 연산자
        },
      };

      const pathManager = getPathManager();

      expect(() =>
        getDerivedValueFactory(schema)(pathManager, 'value'),
      ).toThrow(JsonSchemaError);
    });

    it('불완전한 표현식은 에러를 발생시켜야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './value +', // 불완전한 표현식
        },
      };

      const pathManager = getPathManager();

      expect(() =>
        getDerivedValueFactory(schema)(pathManager, 'value'),
      ).toThrow(JsonSchemaError);
    });

    it('에러 메시지에 fieldName과 expression이 포함되어야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './invalid {{{{ syntax',
        },
      };

      const pathManager = getPathManager();

      try {
        getDerivedValueFactory(schema)(pathManager, 'value');
        expect.fail('에러가 발생해야 합니다');
      } catch (error) {
        expect(error).toBeInstanceOf(JsonSchemaError);
        expect((error as JsonSchemaError).message).toContain('value');
        expect((error as JsonSchemaError).message).toContain(
          './invalid {{{{ syntax',
        );
      }
    });
  });

  describe('실제 사용 사례', () => {
    it('가격 계산 (가격 * 수량 + 세금)을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'number',
        computed: {
          value: './price * ./quantity * (1 + ./taxRate / 100)',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      // price=100, quantity=2, taxRate=10 → 100 * 2 * 1.1 = 220 (부동 소수점 비교)
      expect(getDerivedValue!([100, 2, 10])).toBeCloseTo(220);
    });

    it('전체 이름 조합 (성 + 이름)을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value: './lastName + ./firstName',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!(['김', '철수'])).toBe('김철수');
    });

    it('상태 문자열 생성을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          value:
            './status === "active" ? "활성" : ./status === "pending" ? "대기" : "비활성"',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!(['active'])).toBe('활성');
      expect(getDerivedValue!(['pending'])).toBe('대기');
      expect(getDerivedValue!(['inactive'])).toBe('비활성');
    });

    it('조건부 표시 텍스트를 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          // 템플릿 리터럴 내에서 경로를 사용할 때는 문자열 연결을 사용
          value: './count > 0 ? ./count + "개의 항목" : "항목 없음"',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      expect(getDerivedValue!([5])).toBe('5개의 항목');
      expect(getDerivedValue!([0])).toBe('항목 없음');
    });

    it('할인율 적용 가격 계산을 처리해야 함', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'number',
        computed: {
          value: '../originalPrice * (1 - ./discountRate / 100)',
        },
      };

      const pathManager = getPathManager();
      const getDerivedValue = getDerivedValueFactory(schema)(
        pathManager,
        'value',
      );

      expect(getDerivedValue).toBeDefined();
      // originalPrice=1000, discountRate=20 → 1000 * 0.8 = 800
      expect(getDerivedValue!([1000, 20])).toBe(800);
    });
  });
});
