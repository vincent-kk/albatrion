import { describe, expect, test } from 'vitest';

import { JsonSchemaError } from '@/schema-form/errors';
import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { checkComputedOptionFactory } from '../checkComputedOptionFactory';
import { getConditionIndexFactory } from '../getConditionIndexFactory';
import { getObservedValuesFactory } from '../getObservedValuesFactory';
import { getPathManager } from '../getPathManager';

describe('Error Handling in Dynamic Function Creation', () => {
  describe('checkComputedOptionFactory', () => {
    test('should throw SchemaNodeError for invalid JavaScript expression', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        computed: {
          active: 'dependencies[0] === "value" &&', // 잘못된 문법 (끝에 &&)
        },
      };
      const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };

      const factory = checkComputedOptionFactory(jsonSchema, rootJsonSchema);
      const pathManager = getPathManager();

      expect(() => {
        factory(pathManager, 'active');
      }).toThrow(JsonSchemaError);
    });

    test('should throw SchemaNodeError with detailed context for syntax errors', () => {
      const invalidExpression = 'dependencies[0] === "test" {{{ invalid';
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        computed: {
          active: invalidExpression,
        },
      };
      const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };

      const factory = checkComputedOptionFactory(jsonSchema, rootJsonSchema);
      const pathManager = getPathManager();

      try {
        factory(pathManager, 'active');
        expect.fail('Should have thrown SchemaNodeError');
      } catch (error) {
        expect(error).toBeInstanceOf(JsonSchemaError);
        expect((error as JsonSchemaError).code).toBe(
          'JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION',
        );
        expect((error as JsonSchemaError).message).toContain(
          'Failed to create dynamic function',
        );
        expect((error as JsonSchemaError).message).toContain(
          `active -> '${invalidExpression}'`,
        );
        expect((error as JsonSchemaError).details).toMatchObject({
          fieldName: 'active',
          expression: invalidExpression,
          functionBody: expect.stringContaining('dependencies[0]'),
          error: expect.any(Error),
        });
      }
    });

    test('should throw SchemaNodeError for unclosed brackets', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        computed: {
          active: 'dependencies[0] === "test" && (dependencies[1] === "value"', // 닫히지 않은 괄호
        },
      };
      const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };

      const factory = checkComputedOptionFactory(jsonSchema, rootJsonSchema);
      const pathManager = getPathManager();

      expect(() => {
        factory(pathManager, 'active');
      }).toThrow(JsonSchemaError);
    });

    test('should throw SchemaNodeError for malformed expressions', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        computed: {
          active: 'dependencies[0] === "test" }}}', // 잘못된 닫는 괄호
        },
      };
      const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };

      const factory = checkComputedOptionFactory(jsonSchema, rootJsonSchema);
      const pathManager = getPathManager();

      expect(() => {
        factory(pathManager, 'active');
      }).toThrow(JsonSchemaError);
    });
  });

  describe('getConditionIndexFactory', () => {
    test('should throw SchemaNodeError for invalid condition expressions', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        oneOf: [
          {
            type: 'string',
            computed: {
              if: 'dependencies[0] === "test" {{{ invalid', // 잘못된 문법
            },
          },
          {
            type: 'number',
            computed: {
              if: 'dependencies[0] === "number"',
            },
          },
        ],
      };

      const factory = getConditionIndexFactory(
        jsonSchema.type as any,
        jsonSchema,
      );
      const pathManager = getPathManager();

      expect(() => {
        factory(pathManager, 'oneOf', 'if');
      }).toThrow(JsonSchemaError);
    });

    test('should throw SchemaNodeError with context for condition index creation failure', () => {
      const invalidExpression = 'dependencies[0] === "test" }}}';
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        oneOf: [
          {
            type: 'string',
            computed: {
              if: invalidExpression,
            },
          },
        ],
      };

      const factory = getConditionIndexFactory(
        jsonSchema.type as any,
        jsonSchema,
      );
      const pathManager = getPathManager();

      try {
        factory(pathManager, 'oneOf', 'if');
        expect.fail('Should have thrown SchemaNodeError');
      } catch (error) {
        expect(error).toBeInstanceOf(JsonSchemaError);
        expect((error as JsonSchemaError).code).toBe(
          'JSON_SCHEMA_ERROR.CONDITION_INDEX',
        );
        expect((error as JsonSchemaError).message).toContain(
          'Failed to create dynamic function',
        );
        expect((error as JsonSchemaError).message).toContain(
          `oneOf -> '${invalidExpression}'`,
        );
        expect((error as JsonSchemaError).details).toMatchObject({
          fieldName: 'oneOf',
          expressions: expect.arrayContaining([
            expect.stringContaining('dependencies[0]'),
          ]),
          lines: expect.any(Array),
          error: expect.any(Error),
        });
      }
    });

    test('should throw SchemaNodeError for multiple invalid expressions', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        oneOf: [
          {
            type: 'string',
            computed: {
              if: 'dependencies[0] === "a" &&',
            },
          },
          {
            type: 'number',
            computed: {
              if: 'dependencies[1] === "b" ||',
            },
          },
          {
            type: 'boolean',
            computed: {
              if: 'dependencies[2] === "c" {{{',
            },
          },
        ],
      };

      const factory = getConditionIndexFactory(
        jsonSchema.type as any,
        jsonSchema,
      );
      const pathManager = getPathManager();

      expect(() => {
        factory(pathManager, 'oneOf', 'if');
      }).toThrow(JsonSchemaError);
    });

    test('should throw SchemaNodeError for unmatched brackets', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        oneOf: [
          {
            type: 'object',
            computed: {
              if: 'dependencies[0] === "value" ) invalid', // 잘못된 괄호
            },
          },
        ],
      };

      const factory = getConditionIndexFactory(
        jsonSchema.type as any,
        jsonSchema,
      );
      const pathManager = getPathManager();

      expect(() => {
        factory(pathManager, 'oneOf', 'if');
      }).toThrow(JsonSchemaError);
    });
  });

  describe('getObservedValuesFactory', () => {
    test('should handle normal watch values correctly', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          watch: ['/user/name', '/user/email'],
        },
      };

      const factory = getObservedValuesFactory(schema);
      const pathManager = getPathManager();

      const getObservedValues = factory(pathManager, 'watch');
      expect(getObservedValues).toBeDefined();
      expect(typeof getObservedValues).toBe('function');

      // 함수 실행 테스트
      const result = getObservedValues!(['John', 'john@example.com']);
      expect(result).toEqual(['John', 'john@example.com']);
    });

    test('should throw SchemaNodeError when Function constructor fails', () => {
      // Function constructor가 실패하는 경우를 시뮬레이션하기 위해
      // 원본 Function을 일시적으로 대체
      const originalFunction = globalThis.Function;

      try {
        // Function constructor를 에러를 발생시키도록 오버라이드
        (globalThis as any).Function = function () {
          throw new SyntaxError('Simulated Function constructor error');
        };

        const schema: JsonSchemaWithVirtual = {
          type: 'string',
          computed: {
            watch: ['/test'],
          },
        };

        const factory = getObservedValuesFactory(schema);
        const pathManager = getPathManager();

        try {
          factory(pathManager, 'watch');
          expect.fail('Should have thrown SchemaNodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(JsonSchemaError);
          expect((error as JsonSchemaError).code).toBe(
            'JSON_SCHEMA_ERROR.OBSERVED_VALUES',
          );
          expect((error as JsonSchemaError).message).toContain(
            'Failed to create dynamic function',
          );
          expect((error as JsonSchemaError).message).toContain(
            `watch -> '["/test"]'`,
          );
          console.log(
            (error as JsonSchemaError).message,
            (error as JsonSchemaError).details,
          );
          expect((error as JsonSchemaError).details).toMatchObject({
            fieldName: 'watch',
            watch: ['/test'],
            watchValueIndexes: expect.any(Array),
            error: expect.any(Error),
          });
        }
      } finally {
        // Function constructor 복원
        globalThis.Function = originalFunction;
      }
    });
  });

  describe('Edge Cases and Integration', () => {
    test('should provide meaningful error messages for debugging', () => {
      const jsonSchema = {
        type: 'object',
        computed: {
          active: 'dependencies[0] === "test" { malformed expression',
        },
      } satisfies JsonSchemaWithVirtual;
      const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };

      const factory = checkComputedOptionFactory(jsonSchema, rootJsonSchema);
      const pathManager = getPathManager();

      try {
        factory(pathManager, 'active');
        expect.fail('Should have thrown SchemaNodeError');
      } catch (error) {
        expect(error).toBeInstanceOf(JsonSchemaError);

        const schemaError = error as JsonSchemaError;

        // 에러 코드 확인
        expect(schemaError.code).toBe(
          'JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION',
        );

        // 메시지에 유용한 정보 포함 확인
        expect(schemaError.message).toContain(
          'Failed to create dynamic function',
        );
        expect(schemaError.message).toContain(
          `active -> '${jsonSchema.computed.active}'`,
        );
        expect(schemaError.message).toContain(
          'dependencies[0] === "test" { malformed expression',
        );

        // 컨텍스트에 디버깅 정보 포함 확인
        expect(schemaError.details).toHaveProperty('fieldName');
        expect(schemaError.details).toHaveProperty('expression');
        expect(schemaError.details).toHaveProperty('functionBody');
        expect(schemaError.details).toHaveProperty('error');
        expect(schemaError.details.fieldName).toBe('active');
        expect(schemaError.details.error).toBeInstanceOf(Error);
      }
    });

    test('should handle various types of JavaScript syntax errors', () => {
      const testCases = [
        'dependencies[0] === "test" &&', // 끝에 연산자
        'dependencies[0] === "test" ||', // 끝에 연산자
        'dependencies[0] === "test" {', // 잘못된 블록
        'dependencies[0] === "test" }', // 잘못된 블록
        'dependencies[0] === "test" ]', // 잘못된 배열
        'dependencies[0] === "test" ) invalid', // 잘못된 괄호
      ];

      for (const invalidExpression of testCases) {
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          computed: {
            active: invalidExpression,
          },
        };
        const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };

        const factory = checkComputedOptionFactory(jsonSchema, rootJsonSchema);
        const pathManager = getPathManager();

        expect(() => {
          factory(pathManager, 'active');
        }, `Expression "${invalidExpression}" should throw error`).toThrow(
          JsonSchemaError,
        );
      }
    });

    test('should not throw errors for valid expressions', () => {
      const validExpressions = [
        'dependencies[0] === "test"',
        'dependencies[0] === "test" && dependencies[1] === "value"',
        'dependencies[0] === "test" || dependencies[1] === "value"',
        '(dependencies[0] === "test") && (dependencies[1] === "value")',
        'dependencies[0] === "test" ? true : false',
        'dependencies[0] && dependencies[1]',
        '!dependencies[0]',
        'dependencies[0] !== null && dependencies[0] !== undefined',
      ];

      for (const validExpression of validExpressions) {
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          computed: {
            active: validExpression,
          },
        };
        const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };

        const factory = checkComputedOptionFactory(jsonSchema, rootJsonSchema);
        const pathManager = getPathManager();

        expect(() => {
          const result = factory(pathManager, 'active');
          expect(result).toBeDefined();
          expect(typeof result).toBe('function');
        }, `Expression "${validExpression}" should not throw error`).not.toThrow();
      }
    });
  });

  describe('Error Output Verification', () => {
    test('should demonstrate actual error output for debugging', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        computed: {
          active: 'dependencies[0] === "test" { invalid syntax',
        },
      };
      const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };

      const factory = checkComputedOptionFactory(jsonSchema, rootJsonSchema);
      const pathManager = getPathManager();

      try {
        factory(pathManager, 'active');
        expect.fail('Should have thrown SchemaNodeError');
      } catch (error) {
        console.log('\n=== Error Output Sample ===');
        console.log('Code:', (error as JsonSchemaError).code);
        console.log('Message:', (error as JsonSchemaError).message);
        console.log(
          'Details:',
          JSON.stringify((error as JsonSchemaError).details, null, 2),
        );
        console.log('========================\n');

        expect(error).toBeInstanceOf(JsonSchemaError);
      }
    });

    test('should demonstrate getConditionIndexFactory error output', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        oneOf: [
          {
            type: 'string',
            computed: {
              if: 'dependencies[0] === "a" &&',
            },
          },
          {
            type: 'number',
            computed: {
              if: 'dependencies[1] === "b" }}}',
            },
          },
        ],
      };

      const factory = getConditionIndexFactory(
        jsonSchema.type as any,
        jsonSchema,
      );
      const pathManager = getPathManager();

      try {
        factory(pathManager, 'oneOf', 'if');
        expect.fail('Should have thrown SchemaNodeError');
      } catch (error) {
        console.log('\n=== Condition Index Error Output ===');
        console.log('Code:', (error as JsonSchemaError).code);
        console.log('Message:', (error as JsonSchemaError).message);
        console.log(
          'Details fieldName:',
          (error as JsonSchemaError).details.fieldName,
        );
        console.log(
          'Details expressions:',
          (error as JsonSchemaError).details.expressions,
        );
        console.log('================================\n');

        expect(error).toBeInstanceOf(JsonSchemaError);
      }
    });

    test('should demonstrate getObservedValuesFactory error output', () => {
      // Function constructor를 에러를 발생시키도록 오버라이드
      const originalFunction = globalThis.Function;

      try {
        (globalThis as any).Function = function () {
          throw new SyntaxError('Simulated Function constructor error');
        };

        const schema: JsonSchemaWithVirtual = {
          type: 'string',
          computed: {
            watch: ['/user/name', '/user/email'],
          },
        };

        const factory = getObservedValuesFactory(schema);
        const pathManager = getPathManager();

        try {
          factory(pathManager, 'watch');
          expect.fail('Should have thrown SchemaNodeError');
        } catch (error) {
          console.log('\n=== Observed Values Error Output ===');
          console.log('Code:', (error as JsonSchemaError).code);
          console.log('Message:', (error as JsonSchemaError).message);
          console.log(
            'Details fieldName:',
            (error as JsonSchemaError).details.fieldName,
          );
          console.log(
            'Details watch:',
            (error as JsonSchemaError).details.watch,
          );
          console.log('===============================\n');

          expect(error).toBeInstanceOf(JsonSchemaError);
        }
      } finally {
        globalThis.Function = originalFunction;
      }
    });
  });
});
