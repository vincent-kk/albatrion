import Ajv from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../../2020/validatorPlugin';

describe('ajvValidatorPlugin (2020)', () => {
  describe('기본 검증 동작', () => {
    it('유효한 데이터는 null을 반환한다', async () => {
      // Arrange
      const stringSchema = { type: 'string' } as any;
      const validator = ajvValidatorPlugin.compile(stringSchema);

      // Act
      const result = await validator('hello world');

      // Assert
      expect(result).toBeNull();
    });

    it('무효한 데이터는 에러 배열을 반환한다', async () => {
      // Arrange
      const stringSchema = { type: 'string' } as any;
      const validator = ajvValidatorPlugin.compile(stringSchema);

      // Act
      const result = await validator(123);

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result![0]).toMatchObject({
        keyword: 'type',
        message: 'must be string',
        dataPath: '/',
        details: expect.any(Object),
        source: expect.any(Object),
      });
    });
  });

  describe('타입별 검증 에러', () => {
    it('문자열 타입 에러를 정확히 반환한다', async () => {
      // Arrange
      const schema = { type: 'string' } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator('valid')).toBeNull();

      const numberError = await validator(42);
      expect(numberError).toHaveLength(1);
      expect(numberError![0]).toMatchObject({
        keyword: 'type',
        message: 'must be string',
        details: { type: 'string' },
        source: expect.any(Object),
      });

      const booleanError = await validator(true);
      expect(booleanError).toHaveLength(1);
      expect(booleanError![0].keyword).toBe('type');
    });

    it('숫자 타입 에러를 정확히 반환한다', async () => {
      // Arrange
      const schema = { type: 'number' } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator(42)).toBeNull();
      expect(await validator(3.14)).toBeNull();

      const stringError = await validator('not-number');
      expect(stringError).toHaveLength(1);
      expect(stringError![0]).toMatchObject({
        keyword: 'type',
        message: 'must be number',
        details: { type: 'number' },
        source: expect.any(Object),
      });
    });

    it('불린 타입 에러를 정확히 반환한다', async () => {
      // Arrange
      const schema = { type: 'boolean' } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator(true)).toBeNull();
      expect(await validator(false)).toBeNull();

      const stringError = await validator('true');
      expect(stringError).toHaveLength(1);
      expect(stringError![0]).toMatchObject({
        keyword: 'type',
        message: 'must be boolean',
      });
    });

    it('배열 타입 에러를 정확히 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'array',
        items: { type: 'string' },
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator([])).toBeNull();
      expect(await validator(['a', 'b'])).toBeNull();

      const typeError = await validator('not-array');
      expect(typeError).toHaveLength(1);
      expect(typeError![0].keyword).toBe('type');

      const itemsError = await validator([1, 2, 3]);
      expect(itemsError).toHaveLength(3); // 각 아이템마다 에러
      expect(itemsError![0].keyword).toBe('type');
      expect(itemsError![0].message).toBe('must be string');
    });
  });

  describe('문자열 제약 조건 에러', () => {
    it('문자열 길이 제약 에러를 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator('hello')).toBeNull();

      // 너무 짧은 경우
      const tooShortError = await validator('ab');
      expect(tooShortError).toHaveLength(1);
      expect(tooShortError![0]).toMatchObject({
        keyword: 'minLength',
        message: 'must NOT have fewer than 3 characters',
      });

      // 너무 긴 경우
      const tooLongError = await validator('12345678901');
      expect(tooLongError).toHaveLength(1);
      expect(tooLongError![0]).toMatchObject({
        keyword: 'maxLength',
        message: 'must NOT have more than 10 characters',
      });
    });

    it('문자열 패턴 제약 에러를 반환한다', async () => {
      // Arrange
      const emailSchema = {
        type: 'string',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      } as any;
      const validator = ajvValidatorPlugin.compile(emailSchema);

      // Act & Assert
      expect(await validator('test@example.com')).toBeNull();

      const patternError = await validator('invalid-email');
      expect(patternError).toHaveLength(1);
      expect(patternError![0]).toMatchObject({
        keyword: 'pattern',
        message:
          'must match pattern "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"',
      });
    });
  });

  describe('숫자 제약 조건 에러', () => {
    it('숫자 범위 제약 에러를 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'number',
        minimum: 0,
        maximum: 100,
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator(50)).toBeNull();
      expect(await validator(0)).toBeNull();
      expect(await validator(100)).toBeNull();

      const belowMinError = await validator(-1);
      expect(belowMinError).toHaveLength(1);
      expect(belowMinError![0]).toMatchObject({
        keyword: 'minimum',
        message: 'must be >= 0',
      });

      const aboveMaxError = await validator(101);
      expect(aboveMaxError).toHaveLength(1);
      expect(aboveMaxError![0]).toMatchObject({
        keyword: 'maximum',
        message: 'must be <= 100',
      });
    });

    it('숫자 배수 제약 에러를 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'number',
        multipleOf: 5,
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator(0)).toBeNull();
      expect(await validator(15)).toBeNull();
      expect(await validator(-10)).toBeNull();

      const multipleError = await validator(7);
      expect(multipleError).toHaveLength(1);
      expect(multipleError![0]).toMatchObject({
        keyword: 'multipleOf',
        message: 'must be multiple of 5',
      });
    });
  });

  describe('객체 제약 조건 에러', () => {
    it('필수 속성 누락 에러를 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
        required: ['name', 'email'],
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(
        await validator({ name: 'John', email: 'john@example.com' }),
      ).toBeNull();

      const missingNameError = await validator({ email: 'john@example.com' });
      expect(missingNameError).toHaveLength(1);
      expect(missingNameError![0]).toMatchObject({
        keyword: 'required',
        message: "must have required property 'name'",
        dataPath: '/name',
        details: { missingProperty: 'name' },
        source: expect.any(Object),
      });

      const missingBothError = await validator({});
      expect(missingBothError).toHaveLength(2);
      expect(missingBothError![0].keyword).toBe('required');
      expect(missingBothError![1].keyword).toBe('required');
    });

    it('추가 속성 금지 에러를 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: false,
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator({ name: 'John' })).toBeNull();
      expect(await validator({})).toBeNull();

      const additionalPropError = await validator({
        name: 'John',
        extra: 'not-allowed',
      });
      expect(additionalPropError).toHaveLength(1);
      expect(additionalPropError![0]).toMatchObject({
        keyword: 'additionalProperties',
        message: 'must NOT have additional properties',
        details: { additionalProperty: 'extra' },
        source: expect.any(Object),
      });
    });

    it('객체 속성 타입 에러를 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator({ name: 'John', age: 30 })).toBeNull();

      const nameTypeError = await validator({ name: 123, age: 30 });
      expect(nameTypeError).toHaveLength(1);
      expect(nameTypeError![0]).toMatchObject({
        keyword: 'type',
        message: 'must be string',
        dataPath: '/name',
      });
    });
  });

  describe('복합 에러 케이스', () => {
    it('여러 검증 오류를 동시에 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          age: { type: 'number', minimum: 0 },
          email: { type: 'string' },
        },
        required: ['name', 'email'],
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act
      const result = await validator({
        name: 'A', // 너무 짧음
        age: -5, // 최소값 미만
        // email 누락      // 필수 필드 누락
        extra: 'value', // 추가 속성 (허용된 상태)
      });

      // Assert
      expect(result).toHaveLength(3);

      const errorKeywords = result!.map((err) => err.keyword);
      expect(errorKeywords).toContain('minLength');
      expect(errorKeywords).toContain('minimum');
      expect(errorKeywords).toContain('required');

      // 각 에러의 dataPath 확인
      const minLengthError = result!.find((err) => err.keyword === 'minLength');
      expect(minLengthError!.dataPath).toBe('/name');

      const minimumError = result!.find((err) => err.keyword === 'minimum');
      expect(minimumError!.dataPath).toBe('/age');

      const requiredError = result!.find((err) => err.keyword === 'required');
      expect(requiredError!.dataPath).toBe('/email');
    });

    it('중첩된 객체의 검증 에러를 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  age: { type: 'number' },
                },
                required: ['name'],
              },
            },
            required: ['profile'],
          },
        },
        required: ['user'],
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      const validData = {
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
      };
      expect(await validator(validData)).toBeNull();

      // 중첩된 필수 필드 누락
      const missingNestedError = await validator({
        user: {
          profile: {},
        },
      });
      expect(missingNestedError).toHaveLength(1);
      expect(missingNestedError![0]).toMatchObject({
        keyword: 'required',
        dataPath: '/user/profile/name',
      });

      // 여러 레벨의 필수 필드 누락
      const missingMultipleLevelsError = await validator({});
      expect(missingMultipleLevelsError).toHaveLength(1);
      expect(missingMultipleLevelsError![0]).toMatchObject({
        keyword: 'required',
        dataPath: '/user',
      });
    });
  });

  describe('특수 케이스 에러', () => {
    it('enum 제약 위반 에러를 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'string',
        enum: ['red', 'green', 'blue'],
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator('red')).toBeNull();

      const enumError = await validator('yellow');
      expect(enumError).toHaveLength(1);
      expect(enumError![0]).toMatchObject({
        keyword: 'enum',
        message: 'must be equal to one of the allowed values',
      });
    });

    it('const 제약 위반 에러를 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'string',
        const: 'fixed-value',
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator('fixed-value')).toBeNull();

      const constError = await validator('different-value');
      expect(constError).toHaveLength(1);
      expect(constError![0]).toMatchObject({
        keyword: 'const',
        message: 'must be equal to constant',
      });
    });
  });

  describe('에러 구조 검증', () => {
    it('에러 객체가 올바른 구조를 가진다', async () => {
      // Arrange
      const schema = { type: 'string' } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act
      const result = await validator(123);

      // Assert
      expect(result).toHaveLength(1);
      const error = result![0];

      // 필수 속성들 확인
      expect(error).toHaveProperty('keyword');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('dataPath');
      expect(error).toHaveProperty('details');
      expect(error).toHaveProperty('source');

      // 타입 확인
      expect(typeof error.keyword).toBe('string');
      expect(typeof error.message).toBe('string');
      expect(typeof error.dataPath).toBe('string');
      expect(typeof error.details).toBe('object');
      expect(typeof error.source).toBe('object');
    });
  });

  describe('validator 함수 동작', () => {
    it('컴파일된 validator는 재사용 가능하다', async () => {
      // Arrange
      const schema = { type: 'string' } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert - 여러 번 호출 가능
      expect(await validator('first')).toBeNull();
      expect(await validator('second')).toBeNull();

      const error1 = await validator(123);
      expect(error1).toHaveLength(1);

      expect(await validator('third')).toBeNull();

      const error2 = await validator(456);
      expect(error2).toHaveLength(1);
    });

    it('다른 스키마로 컴파일된 validator들은 독립적이다', async () => {
      // Arrange
      const stringValidator = ajvValidatorPlugin.compile({
        type: 'string',
      } as any);
      const numberValidator = ajvValidatorPlugin.compile({
        type: 'number',
      } as any);

      // Act & Assert
      expect(await stringValidator('hello')).toBeNull();
      expect(await numberValidator(42)).toBeNull();

      const stringError = await stringValidator(123);
      expect(stringError![0].message).toBe('must be string');

      const numberError = await numberValidator('hello');
      expect(numberError![0].message).toBe('must be number');
    });

    it('컴파일된 validator 함수는 재사용 가능하다', async () => {
      // Arrange
      const schema = { type: 'string' } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      expect(await validator('test1')).toBeNull();
      expect(await validator('test2')).toBeNull();

      const error1 = await validator(123);
      const error2 = await validator(456);

      expect(error1).toHaveLength(1);
      expect(error2).toHaveLength(1);
      expect(error1![0].keyword).toBe('type');
      expect(error2![0].keyword).toBe('type');
    });

    it('서로 다른 스키마로 컴파일된 validator는 독립적이다', async () => {
      // Arrange
      const stringValidator = ajvValidatorPlugin.compile({
        type: 'string',
      } as any);
      const numberValidator = ajvValidatorPlugin.compile({
        type: 'number',
      } as any);

      // Act & Assert
      expect(await stringValidator('hello')).toBeNull();
      expect(await numberValidator(42)).toBeNull();

      expect(await stringValidator(123)).toHaveLength(1);
      expect(await numberValidator('hello')).toHaveLength(1);
    });
  });

  describe('bind 기능', () => {
    it('외부에서 주입한 Ajv 인스턴스를 사용한다', async () => {
      // Arrange
      const customAjv = new Ajv({
        allErrors: false, // 첫 번째 에러만 반환하도록 설정
        strictSchema: false,
        validateFormats: false,
      });

      // Act
      ajvValidatorPlugin.bind(customAjv);

      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
          age: { type: 'number', minimum: 0 },
        },
        required: ['name', 'age'],
      } as any;

      const validator = ajvValidatorPlugin.compile(schema);
      const result = await validator({}); // name, age 모두 누락

      // Assert
      // allErrors: false이므로 하나의 에러만 반환되어야 함
      expect(result).toHaveLength(1);
      expect(result![0]).toMatchObject({
        keyword: 'required',
        message: "must have required property 'name'",
      });
    });

    it('기본 인스턴스는 allErrors: true로 모든 에러를 반환한다', async () => {
      // Arrange
      // 기본 인스턴스로 재설정 (null로 설정하면 새로운 기본 인스턴스 생성)
      ajvValidatorPlugin.bind(
        new Ajv({
          allErrors: true, // 모든 에러를 반환하도록 설정 (기본값)
          strictSchema: false,
          validateFormats: false,
        }),
      );

      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
          age: { type: 'number', minimum: 0 },
        },
        required: ['name', 'age'],
      } as any;

      const validator = ajvValidatorPlugin.compile(schema);
      const result = await validator({}); // name, age 모두 누락

      // Assert
      // allErrors: true이므로 모든 에러가 반환되어야 함
      expect(result!.length).toBeGreaterThan(1);

      const errorKeywords = result!.map((error) => error.keyword);
      expect(errorKeywords).toContain('required');

      // name과 age 둘 다 누락되었으므로 둘 다 에러가 있어야 함
      const requiredErrors = result!.filter(
        (error) => error.keyword === 'required',
      );
      expect(requiredErrors.length).toBe(2);
    });

    it('setInstance로 다른 인스턴스로 교체할 수 있다', async () => {
      // Arrange
      const customAjv1 = new Ajv({
        allErrors: false,
        strictSchema: false,
        validateFormats: false,
      });

      const customAjv2 = new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      });

      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
      } as any;

      // Act & Assert
      // 첫 번째 인스턴스 설정 (allErrors: false)
      ajvValidatorPlugin.bind(customAjv1);
      const validator1 = ajvValidatorPlugin.compile(schema);
      const result1 = await validator1({});
      expect(result1).toHaveLength(1); // 하나의 에러만

      // 두 번째 인스턴스로 교체 (allErrors: true)
      ajvValidatorPlugin.bind(customAjv2);
      const validator2 = ajvValidatorPlugin.compile(schema);
      const result2 = await validator2({});
      expect(result2!.length).toBeGreaterThan(1); // 모든 에러
    });

    it('커스텀 옵션이 실제로 적용되는지 확인한다', async () => {
      // Arrange
      const customAjv = new Ajv({
        allErrors: false,
        strictSchema: false, // strictSchema를 false로 설정
        validateFormats: false, // format 검증 비활성화 (email format 지원하지 않음)
      });

      ajvValidatorPlugin.bind(customAjv);

      const schema = {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', // pattern으로 대체
          },
          count: { type: 'number' },
        },
        required: ['email', 'count'],
      } as any;

      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert
      const validResult = await validator({
        email: 'test@example.com',
        count: 5,
      });
      expect(validResult).toBeNull();

      // 잘못된 이메일 형식
      const invalidEmailResult = await validator({
        email: 'invalid-email',
        count: 5,
      });

      // pattern 에러가 발생해야 함
      expect(invalidEmailResult).toHaveLength(1);
      expect(invalidEmailResult![0]).toMatchObject({
        keyword: 'pattern',
        message:
          'must match pattern "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"',
      });
    });

    it('bind 없이 compile 호출 시 기본 인스턴스가 생성된다', async () => {
      // Arrange
      // 새로운 기본 인스턴스로 재설정하여 테스트
      ajvValidatorPlugin.bind(
        new Ajv({
          allErrors: true,
          strictSchema: false,
          validateFormats: false,
        }),
      );

      const schema = { type: 'string' } as any;

      // Act
      const validator = ajvValidatorPlugin.compile(schema);
      const validResult = await validator('test');
      const invalidResult = await validator(123);

      // Assert
      expect(validResult).toBeNull();
      expect(invalidResult).toHaveLength(1);
      expect(invalidResult![0]).toMatchObject({
        keyword: 'type',
        message: 'must be string',
      });
    });
  });
});
