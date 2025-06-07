import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe('ajvValidatorPlugin - dataPath 정확성 검증', () => {
  describe('객체형태 유효성 검증에서 dataPath 반환', () => {
    it('루트 레벨 속성 에러의 dataPath를 정확히 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string' },
        },
        required: ['name'],
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert - 타입 에러
      const nameTypeError = await validator({ name: 123 });
      expect(nameTypeError).toHaveLength(1);
      expect(nameTypeError![0]).toMatchObject({
        keyword: 'type',
        dataPath: '.name',
      });

      const ageTypeError = await validator({ name: 'John', age: 'not-number' });
      expect(ageTypeError).toHaveLength(1);
      expect(ageTypeError![0]).toMatchObject({
        keyword: 'type',
        dataPath: '.age',
      });

      // Act & Assert - 필수 속성 누락
      const missingRequiredError = await validator({});
      expect(missingRequiredError).toHaveLength(1);
      expect(missingRequiredError![0]).toMatchObject({
        keyword: 'required',
        dataPath: '.name',
      });
    });

    it('2단계 중첩된 객체 속성 에러의 dataPath를 정확히 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
              active: { type: 'boolean' },
            },
            required: ['name'],
          },
        },
        required: ['user'],
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert - 중첩된 속성 타입 에러
      const nestedNameError = await validator({
        user: { name: 123, age: 30 },
      });
      expect(nestedNameError).toHaveLength(1);
      expect(nestedNameError![0]).toMatchObject({
        keyword: 'type',
        dataPath: '.user.name',
      });

      const nestedAgeError = await validator({
        user: { name: 'John', age: 'thirty' },
      });
      expect(nestedAgeError).toHaveLength(1);
      expect(nestedAgeError![0]).toMatchObject({
        keyword: 'type',
        dataPath: '.user.age',
      });

      // Act & Assert - 중첩된 필수 속성 누락
      const nestedMissingError = await validator({
        user: { age: 30 },
      });
      expect(nestedMissingError).toHaveLength(1);
      expect(nestedMissingError![0]).toMatchObject({
        keyword: 'required',
        dataPath: '.user.name',
      });

      // Act & Assert - 루트 레벨 필수 속성 누락
      const rootMissingError = await validator({});
      expect(rootMissingError).toHaveLength(1);
      expect(rootMissingError![0]).toMatchObject({
        keyword: 'required',
        dataPath: '.user',
      });
    });

    it('배열 내 객체 속성 에러의 dataPath를 정확히 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
              },
              required: ['name'],
            },
          },
        },
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert - 배열 첫 번째 요소의 속성 타입 에러
      const arrayItemError = await validator({
        users: [
          { name: 123, age: 30 }, // name 타입 에러
        ],
      });
      expect(arrayItemError).toHaveLength(1);
      expect(arrayItemError![0]).toMatchObject({
        keyword: 'type',
        dataPath: '.users[0].name',
      });

      // Act & Assert - 배열 여러 요소의 에러
      const multipleArrayErrors = await validator({
        users: [
          { name: 'John', age: 'thirty' }, // age 타입 에러
          { age: 25 }, // name 필수 필드 누락
        ],
      });
      expect(multipleArrayErrors).toHaveLength(2);
      expect(multipleArrayErrors![0]).toMatchObject({
        keyword: 'type',
        dataPath: '.users[0].age',
      });
      expect(multipleArrayErrors![1]).toMatchObject({
        keyword: 'required',
        dataPath: '.users[1].name',
      });
    });

    it('복합 에러 상황에서 각 에러의 dataPath를 정확히 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          personal: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2 },
              age: { type: 'number', minimum: 0, maximum: 150 },
            },
            required: ['name'],
          },
          work: {
            type: 'object',
            properties: {
              company: { type: 'string' },
              position: { type: 'string' },
              salary: { type: 'number', minimum: 0 },
            },
            required: ['company'],
          },
        },
        required: ['personal', 'work'],
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act
      const result = await validator({
        personal: {
          name: 'A', // minLength 위반
          age: -5, // minimum 위반
        },
        work: {
          // company 누락
          position: 'Developer',
          salary: -1000, // minimum 위반
        },
      });

      // Assert - 실제로는 4개의 에러가 발생
      expect(result).toHaveLength(4);

      const errorsByDataPath = result!.reduce(
        (acc, error) => {
          acc[error.dataPath] = error;
          return acc;
        },
        {} as Record<string, any>,
      );

      // 각 에러의 dataPath 검증
      expect(errorsByDataPath['.personal.name']).toMatchObject({
        keyword: 'minLength',
      });
      expect(errorsByDataPath['.personal.age']).toMatchObject({
        keyword: 'minimum',
      });
      expect(errorsByDataPath['.work.company']).toMatchObject({
        keyword: 'required',
      });
      expect(errorsByDataPath['.work.salary']).toMatchObject({
        keyword: 'minimum',
      });
    });

    it('숫자가 포함된 속성명의 dataPath 처리를 검증한다', async () => {
      // Arrange - 숫자가 포함된 속성명은 배열 인덱스로 변환됨
      const schema = {
        type: 'object',
        properties: {
          container: {
            type: 'object',
            properties: {
              item1: { type: 'string' },
              item2: { type: 'number' },
              item3: { type: 'boolean' },
            },
          },
        },
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert - 숫자가 포함된 속성명은 배열 인덱스 형태로 변환됨
      const result = await validator({
        container: {
          item1: 123, // 타입 에러
          item2: 'text', // 타입 에러
          item3: 'true', // 타입 에러
        },
      });

      expect(result).toHaveLength(3);

      // 숫자가 포함된 속성명은 [숫자] 형태로 변환됨
      const dataPaths = result!.map((err) => err.dataPath);
      expect(dataPaths).toContain('.container.item1');
      expect(dataPaths).toContain('.container.item2');
      expect(dataPaths).toContain('.container.item3');
    });

    it('깊은 중첩 구조에서 숫자 속성명의 dataPath 변환을 검증한다', async () => {
      // Arrange - 숫자가 포함된 속성명은 배열 인덱스로 변환됨
      const complexSchema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: {
                    type: 'object',
                    properties: {
                      level4: {
                        type: 'object',
                        properties: {
                          finalValue: { type: 'string', minLength: 5 },
                        },
                        required: ['finalValue'],
                      },
                    },
                    required: ['level4'],
                  },
                },
                required: ['level3'],
              },
            },
            required: ['level2'],
          },
        },
        required: ['level1'],
      } as any;
      const validator = ajvValidatorPlugin.compile(complexSchema);

      // Act & Assert - 숫자가 포함된 속성명은 배열 인덱스로 변환됨
      const deepError = await validator({
        level1: {
          level2: {
            level3: {
              level4: {
                finalValue: 'abc', // minLength 위반
              },
            },
          },
        },
      });
      expect(deepError).toHaveLength(1);
      expect(deepError![0]).toMatchObject({
        keyword: 'minLength',
        dataPath: '.level1.level2.level3.level4.finalValue',
      });

      // Act & Assert - 중간 레벨 누락
      const missingMidLevel = await validator({
        level1: {
          level2: {
            // level3 누락
          },
        },
      });
      expect(missingMidLevel).toHaveLength(1);
      expect(missingMidLevel![0]).toMatchObject({
        keyword: 'required',
        dataPath: '.level1.level2.level3',
      });
    });

    it('additionalProperties 에러의 dataPath를 검증한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          allowed: { type: 'string' },
        },
        additionalProperties: false,
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act
      const result = await validator({
        allowed: 'value',
        notAllowed: 'error',
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result![0]).toMatchObject({
        keyword: 'additionalProperties',
        dataPath: '', // additionalProperties 에러는 루트 레벨
      });
    });

    it('중첩된 배열과 객체의 복합 구조에서 dataPath를 정확히 반환한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          departments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                employees: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      info: {
                        type: 'object',
                        properties: {
                          firstName: { type: 'string' },
                          email: { type: 'string', pattern: '^[^@]+@[^@]+$' },
                        },
                        required: ['firstName'],
                      },
                    },
                    required: ['info'],
                  },
                },
              },
              required: ['name'],
            },
          },
        },
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert - 매우 깊은 중첩 구조의 에러
      const complexError = await validator({
        departments: [
          {
            name: 'Engineering',
            employees: [
              {
                info: {
                  firstName: 123, // 타입 에러
                  email: 'invalid-email', // pattern 에러
                },
              },
            ],
          },
        ],
      });
      expect(complexError).toHaveLength(2);

      const errorPaths = complexError!.map((err) => err.dataPath);
      expect(errorPaths).toContain(
        '.departments[0].employees[0].info.firstName',
      );
      expect(errorPaths).toContain('.departments[0].employees[0].info.email');

      // Act & Assert - 필수 필드 누락
      const missingFieldError = await validator({
        departments: [
          {
            name: 'Engineering',
            employees: [
              {
                info: {
                  // firstName 누락
                  email: 'valid@email.com',
                },
              },
            ],
          },
        ],
      });
      expect(missingFieldError).toHaveLength(1);
      expect(missingFieldError![0]).toMatchObject({
        keyword: 'required',
        dataPath: '.departments[0].employees[0].info.firstName',
      });
    });

    it('모든 JSON Schema 키워드별 dataPath가 정확히 설정되는지 검증한다', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                pattern: '^[a-zA-Z0-9_]+$',
                minLength: 3,
                maxLength: 20,
              },
              age: {
                type: 'number',
                multipleOf: 1,
                minimum: 13,
                maximum: 120,
              },
              role: {
                type: 'string',
                enum: ['admin', 'user', 'guest'],
              },
              status: {
                type: 'string',
                const: 'active',
              },
            },
            required: ['username'],
            additionalProperties: false,
          },
        },
      } as any;
      const validator = ajvValidatorPlugin.compile(schema);

      // Act & Assert - pattern 위반
      const patternError = await validator({
        profile: {
          username: 'invalid-name!',
        },
      });
      expect(patternError![0]).toMatchObject({
        keyword: 'pattern',
        dataPath: '.profile.username',
      });

      // Act & Assert - enum 위반
      const enumError = await validator({
        profile: {
          username: 'validname',
          role: 'invalid_role',
        },
      });
      expect(enumError![0]).toMatchObject({
        keyword: 'enum',
        dataPath: '.profile.role',
      });

      // Act & Assert - const 위반
      const constError = await validator({
        profile: {
          username: 'validname',
          status: 'inactive',
        },
      });
      expect(constError![0]).toMatchObject({
        keyword: 'const',
        dataPath: '.profile.status',
      });

      // Act & Assert - minimum 위반
      const minimumError = await validator({
        profile: {
          username: 'validname',
          age: 10,
        },
      });
      expect(minimumError![0]).toMatchObject({
        keyword: 'minimum',
        dataPath: '.profile.age',
      });

      // Act & Assert - multipleOf 위반
      const multipleOfError = await validator({
        profile: {
          username: 'validname',
          age: 25.5,
        },
      });
      expect(multipleOfError![0]).toMatchObject({
        keyword: 'multipleOf',
        dataPath: '.profile.age',
      });

      // Act & Assert - additionalProperties 위반
      const additionalPropsError = await validator({
        profile: {
          username: 'validname',
          extra: 'not-allowed',
        },
      });
      expect(additionalPropsError![0]).toMatchObject({
        keyword: 'additionalProperties',
        dataPath: '.profile',
      });
    });
  });
});
