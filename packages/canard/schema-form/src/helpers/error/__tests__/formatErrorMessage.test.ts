import { describe, expect, it } from 'vitest';

import type { SchemaFormPlugin } from '@/schema-form/app/plugin';
import type { JsonSchema, JsonSchemaError } from '@/schema-form/types';

import {
  formatAllOfTypeRedefinitionError,
  formatCircularReferenceError,
  formatCompositionPropertyExclusivenessError,
  formatCompositionPropertyRedefinitionError,
  formatCompositionTypeRedefinitionError,
  formatConditionIndexError,
  formatConditionIndicesError,
  formatConflictingConstValuesError,
  formatCreateDynamicFunctionError,
  formatEmptyEnumIntersectionError,
  formatFormTypeInputMapError,
  formatInfiniteLoopError,
  formatInjectValueToError,
  formatInvalidRangeError,
  formatInvalidVirtualNodeValuesError,
  formatItemsFalseWithoutPrefixItemsError,
  formatMaxItemsExceedsPrefixItemsError,
  formatMinItemsExceedsPrefixItemsError,
  formatMissingItemsAndPrefixItemsError,
  formatObservedValuesError,
  formatRegisterPluginError,
  formatSchemaValidationFailedError,
  formatUnknownJsonSchemaError,
  formatVirtualFieldsNotInPropertiesError,
  formatVirtualFieldsNotValidError,
} from '../index';

describe('formatErrorMessage', () => {
  describe('formatInfiniteLoopError', () => {
    it('무한 루프 에러 메시지를 포맷해야 합니다', () => {
      const result = formatInfiniteLoopError(
        '/path/to/field',
        ['../dep1', '../dep2'],
        100,
        50,
      );

      expect(result).toContain('Infinite loop detected');
      expect(result).toContain('/path/to/field');
      expect(result).toContain('100');
      expect(result).toContain('How to fix');
    });
  });

  describe('formatCircularReferenceError', () => {
    it('순환 참조 에러 메시지를 포맷해야 합니다', () => {
      const jsonSchema = {
        $ref: '#/definitions/User',
        type: 'object' as const,
      };
      const result = formatCircularReferenceError(
        'Original error message',
        jsonSchema,
      );

      expect(result).toContain('Circular reference detected');
      expect(result).toContain('$ref');
      expect(result).toContain('How to fix');
    });
  });

  describe('formatDynamicFunctionError', () => {
    describe('formatCreateDynamicFunctionError', () => {
      it('동적 함수 생성 에러 메시지를 포맷해야 합니다', () => {
        const result = formatCreateDynamicFunctionError(
          'visible',
          "./category === 'premium'",
          "return value === 'test'",
          new SyntaxError('Unexpected token'),
        );

        expect(result).toContain('Failed to create dynamic function');
        expect(result).toContain('visible');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatConditionIndexError', () => {
      it('조건 인덱스 에러 메시지를 포맷해야 합니다', () => {
        const result = formatConditionIndexError(
          'oneOf',
          ["./type === 'A'", "./type === 'B'"],
          ['if (type === "A") return 0;', 'if (type === "B") return 1;'],
          new Error('Cannot access property'),
        );

        expect(result).toContain('Failed to create condition index');
        expect(result).toContain('oneOf');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatObservedValuesError', () => {
      it('관찰 값 에러 메시지를 포맷해야 합니다', () => {
        const result = formatObservedValuesError(
          'computedField',
          '../siblingField',
          [0],
          new Error('Cannot find path'),
        );

        expect(result).toContain('Failed to create observed values');
        expect(result).toContain('computedField');
        expect(result).toContain('../siblingField');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatConditionIndicesError', () => {
      it('조건 인덱스 배열 에러 메시지를 포맷해야 합니다', () => {
        const result = formatConditionIndicesError(
          'anyOf',
          ['./flag1 === true', './flag2 === true'],
          ['const results = [];', 'if (flag1) results.push(0);'],
          new Error('Invalid expression'),
        );

        expect(result).toContain('Failed to create condition indices');
        expect(result).toContain('anyOf');
        expect(result).toContain('How to fix');
      });
    });
  });

  describe('formatArraySchemaError', () => {
    const mockJsonSchema = {
      type: 'array' as const,
      prefixItems: [{ type: 'string' as const }],
    };

    describe('formatItemsFalseWithoutPrefixItemsError', () => {
      it('items: false 에러 메시지를 포맷해야 합니다', () => {
        const result = formatItemsFalseWithoutPrefixItemsError(mockJsonSchema);

        expect(result).toContain('items');
        expect(result).toContain('false');
        expect(result).toContain('prefixItems');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatMissingItemsAndPrefixItemsError', () => {
      it('items와 prefixItems 누락 에러 메시지를 포맷해야 합니다', () => {
        const result = formatMissingItemsAndPrefixItemsError(mockJsonSchema);

        expect(result).toContain('items');
        expect(result).toContain('prefixItems');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatMaxItemsExceedsPrefixItemsError', () => {
      it('maxItems 초과 에러 메시지를 포맷해야 합니다', () => {
        const result = formatMaxItemsExceedsPrefixItemsError(
          mockJsonSchema,
          5,
          1,
        );

        expect(result).toContain('maxItems');
        expect(result).toContain('5');
        expect(result).toContain('1');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatMinItemsExceedsPrefixItemsError', () => {
      it('minItems 초과 에러 메시지를 포맷해야 합니다', () => {
        const result = formatMinItemsExceedsPrefixItemsError(
          mockJsonSchema,
          3,
          1,
        );

        expect(result).toContain('minItems');
        expect(result).toContain('3');
        expect(result).toContain('1');
        expect(result).toContain('How to fix');
      });
    });
  });

  describe('formatUnknownJsonSchemaError', () => {
    it('알 수 없는 스키마 타입 에러 메시지를 포맷해야 합니다', () => {
      const jsonSchema = { type: 'unknown' } as unknown as JsonSchema;
      const result = formatUnknownJsonSchemaError('unknown', jsonSchema);

      expect(result).toContain('Unknown JSON Schema type');
      expect(result).toContain('unknown');
      expect(result).toContain('How to fix');
    });

    it('undefined 타입도 처리해야 합니다', () => {
      const jsonSchema = {} as JsonSchema;
      const result = formatUnknownJsonSchemaError(undefined, jsonSchema);

      expect(result).toContain('Unknown JSON Schema type');
      expect(result).toContain('undefined');
    });
  });

  describe('formatAllOfTypeRedefinitionError', () => {
    it('allOf 타입 재정의 에러 메시지를 포맷해야 합니다', () => {
      const baseSchema = { type: 'object' as const };
      const allOfSchema = { type: 'string' as const };
      const result = formatAllOfTypeRedefinitionError(baseSchema, allOfSchema);

      expect(result).toContain('allOf');
      expect(result).toContain('type');
      expect(result).toContain('How to fix');
    });
  });

  describe('formatInvalidVirtualNodeValuesError', () => {
    it('가상 노드 값 에러 메시지를 포맷해야 합니다', () => {
      const result = formatInvalidVirtualNodeValuesError(3, 2, [
        'value1',
        'value2',
      ]);

      expect(result).toContain('Invalid values for virtual node');
      expect(result).toContain('3');
      expect(result).toContain('How to fix');
    });

    it('undefined 값도 처리해야 합니다', () => {
      const result = formatInvalidVirtualNodeValuesError(
        2,
        undefined,
        undefined,
      );

      expect(result).toContain('Invalid values for virtual node');
      expect(result).toContain('undefined');
    });
  });

  describe('formatCompositionSchemaError', () => {
    describe('formatCompositionTypeRedefinitionError', () => {
      it('composition 타입 재정의 에러 메시지를 포맷해야 합니다', () => {
        const result = formatCompositionTypeRedefinitionError(
          'oneOf',
          { type: 'object' as const },
          '/path/to/object',
          'object',
          'string',
        );

        expect(result).toContain('oneOf');
        expect(result).toContain('type');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatCompositionPropertyExclusivenessError', () => {
      it('속성 배타성 에러 메시지를 포맷해야 합니다', () => {
        const result = formatCompositionPropertyExclusivenessError(
          'anyOf',
          '/path/to/object',
          'duplicateProperty',
        );

        expect(result).toContain('anyOf');
        expect(result).toContain('duplicateProperty');
        expect(result).toContain('/path/to/object');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatCompositionPropertyRedefinitionError', () => {
      it('속성 재정의 에러 메시지를 포맷해야 합니다', () => {
        const result = formatCompositionPropertyRedefinitionError(
          'oneOf',
          '/path/to/object',
          'existingProperty',
        );

        expect(result).toContain('oneOf');
        expect(result).toContain('existingProperty');
        expect(result).toContain('/path/to/object');
        expect(result).toContain('How to fix');
      });
    });
  });

  describe('formatSchemaIntersectionError', () => {
    describe('formatInvalidRangeError', () => {
      it('범위 에러 메시지를 포맷해야 합니다', () => {
        const result = formatInvalidRangeError(10, 5, 'minimum/maximum');

        expect(result).toContain('Invalid range');
        expect(result).toContain('10');
        expect(result).toContain('5');
        expect(result).toContain('minimum');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatConflictingConstValuesError', () => {
      it('const 충돌 에러 메시지를 포맷해야 합니다', () => {
        const result = formatConflictingConstValuesError('value1', 'value2');

        expect(result).toContain('Conflicting const');
        expect(result).toContain('value1');
        expect(result).toContain('value2');
        expect(result).toContain('How to fix');
      });

      it('객체 값도 처리해야 합니다', () => {
        const result = formatConflictingConstValuesError({ a: 1 }, { b: 2 });

        expect(result).toContain('Conflicting const');
      });
    });

    describe('formatEmptyEnumIntersectionError', () => {
      it('빈 enum 교집합 에러 메시지를 포맷해야 합니다', () => {
        const result = formatEmptyEnumIntersectionError(['a', 'b'], ['c', 'd']);

        expect(result).toContain('Empty enum intersection');
        expect(result).toContain('a');
        expect(result).toContain('c');
        expect(result).toContain('How to fix');
      });
    });
  });

  describe('formatVirtualFieldsError', () => {
    describe('formatVirtualFieldsNotValidError', () => {
      it('가상 필드 유효성 에러 메시지를 포맷해야 합니다', () => {
        const result = formatVirtualFieldsNotValidError(
          'virtualKey',
          { fields: 'not-an-array' as any },
          'nodeName',
        );

        expect(result).toContain('virtual.fields');
        expect(result).toContain('virtualKey');
        expect(result).toContain('nodeName');
        expect(result).toContain('How to fix');
      });
    });

    describe('formatVirtualFieldsNotInPropertiesError', () => {
      it('속성에 없는 가상 필드 에러 메시지를 포맷해야 합니다', () => {
        const result = formatVirtualFieldsNotInPropertiesError(
          'virtualKey',
          { fields: ['field1', 'field2', 'notFound1', 'notFound2'] },
          ['notFound1', 'notFound2'],
        );

        expect(result).toContain('Virtual fields');
        expect(result).toContain('virtualKey');
        expect(result).toContain('notFound1');
        expect(result).toContain('notFound2');
        expect(result).toContain('How to fix');
      });
    });
  });

  describe('formatFormTypeInputMapError', () => {
    it('FormTypeInputMap 에러 메시지를 포맷해야 합니다', () => {
      const result = formatFormTypeInputMapError(
        '/invalid[pattern',
        new SyntaxError('Invalid regular expression'),
      );

      expect(result).toContain('FormTypeInputMap');
      expect(result).toContain('/invalid[pattern');
      expect(result).toContain('How to fix');
    });
  });

  describe('formatSchemaValidationFailedError', () => {
    it('스키마 검증 실패 에러 메시지를 포맷해야 합니다', () => {
      const value = { name: 'a' };
      const errors: JsonSchemaError[] = [
        {
          dataPath: '/email',
          message: 'is required',
          keyword: 'required',
        },
        {
          dataPath: '/name',
          message: 'must be at least 3 characters',
          keyword: 'minLength',
        },
      ];
      const jsonSchema = { type: 'object' as const };
      const result = formatSchemaValidationFailedError(
        value,
        errors,
        jsonSchema,
      );

      expect(result).toContain('Form submission rejected');
      expect(result).toContain('2');
      expect(result).toContain('How to fix');
    });

    it('빈 에러 배열도 처리해야 합니다', () => {
      const result = formatSchemaValidationFailedError({}, [], {
        type: 'object' as const,
      });

      expect(result).toContain('Form submission rejected');
      expect(result).toContain('0');
    });
  });

  describe('formatRegisterPluginError', () => {
    it('플러그인 등록 에러 메시지를 포맷해야 합니다', () => {
      const plugin = {
        renderKit: { FormInput: () => null },
      } as SchemaFormPlugin;
      const error = new Error('Invalid component');
      const result = formatRegisterPluginError(plugin, error);

      expect(result).toContain('Failed to register');
      expect(result).toContain('Invalid component');
      expect(result).toContain('How to fix');
    });

    it('빈 플러그인도 처리해야 합니다', () => {
      const result = formatRegisterPluginError(
        {} as SchemaFormPlugin,
        new Error('Unknown'),
      );

      expect(result).toContain('Failed to register');
    });
  });

  describe('formatInjectValueToError', () => {
    it('injectValueTo 실행 에러 메시지를 포맷해야 합니다', () => {
      const result = formatInjectValueToError(
        'test-value',
        '/source',
        { source: 'test-value', target: '' },
        {},
        { type: 'string' as const },
        '/properties/source',
        new Error('Cannot read property of undefined'),
      );

      expect(result).toContain('injectValueTo');
      expect(result).toContain('/properties/source');
      expect(result).toContain('/source');
      expect(result).toContain('How to fix');
    });

    it('복잡한 값도 처리해야 합니다', () => {
      const result = formatInjectValueToError(
        { nested: { value: 123 } },
        '/config',
        { config: { nested: { value: 123 } } },
        { contextData: 'some-context' },
        {
          type: 'object' as const,
          properties: { nested: { type: 'object' as const } },
        },
        '/properties/config',
        new TypeError('Invalid operation'),
      );

      expect(result).toContain('injectValueTo');
      expect(result).toContain('Invalid operation');
    });
  });

  describe('에러 메시지 일관성 테스트', () => {
    it('모든 포맷터가 "How to fix" 섹션을 포함해야 합니다', () => {
      const formatters = [
        formatInfiniteLoopError('/path', ['../dep'], 100, 50),
        // @ts-expect-error - JsonSchemaWithVirtual is not JsonSchema
        formatCircularReferenceError('error', {
          $ref: '#/',
          type: 'object',
        } as JsonSchema),
        formatCreateDynamicFunctionError(
          'visible',
          'expr',
          'body',
          new Error(),
        ),
        formatConditionIndexError('oneOf', ['expr1'], ['line1'], new Error()),
        formatObservedValuesError('field', 'watch', [0], new Error()),
        formatConditionIndicesError('anyOf', ['expr1'], ['line1'], new Error()),
        formatItemsFalseWithoutPrefixItemsError({ type: 'array' }),
        formatMissingItemsAndPrefixItemsError({ type: 'array' }),
        formatMaxItemsExceedsPrefixItemsError(
          { type: 'array', prefixItems: [{ type: 'string' }] },
          5,
          1,
        ),
        formatMinItemsExceedsPrefixItemsError(
          { type: 'array', prefixItems: [{ type: 'string' }] },
          5,
          1,
        ),
        formatUnknownJsonSchemaError('unknown', {} as JsonSchema),
        formatAllOfTypeRedefinitionError(
          { type: 'object' },
          { type: 'string' },
        ),
        formatInvalidVirtualNodeValuesError(3, 2, []),
        formatCompositionTypeRedefinitionError(
          'oneOf',
          { type: 'object' },
          '/path',
          'object',
          'string',
        ),
        formatCompositionPropertyExclusivenessError('anyOf', '/path', 'prop'),
        formatCompositionPropertyRedefinitionError('oneOf', '/path', 'prop'),
        formatInvalidRangeError(10, 5, 'range'),
        formatConflictingConstValuesError('a', 'b'),
        formatEmptyEnumIntersectionError(['a'], ['b']),
        formatVirtualFieldsNotValidError(
          'key',
          { fields: null as any },
          'name',
        ),
        formatVirtualFieldsNotInPropertiesError('key', { fields: ['f1'] }, [
          'f1',
        ]),
        formatFormTypeInputMapError('/path', new Error()),
        formatSchemaValidationFailedError({}, [], { type: 'object' as const }),
        formatRegisterPluginError({} as SchemaFormPlugin, new Error()),
        formatInjectValueToError(
          'value',
          '/path',
          {},
          {},
          { type: 'string' },
          '/path',
          new Error(),
        ),
      ];

      for (const message of formatters) {
        expect(message).toContain('How to fix');
      }
    });

    it('모든 포맷터가 박스 그리기 문자를 사용해야 합니다', () => {
      const formatters = [
        formatInfiniteLoopError('/path', ['../dep'], 100, 50),
        // @ts-expect-error - JsonSchemaWithVirtual is not JsonSchema
        formatCircularReferenceError('error', {
          $ref: '#/',
          type: 'object',
        } as JsonSchema),
        formatUnknownJsonSchemaError('unknown', {} as JsonSchema),
      ];

      for (const message of formatters) {
        expect(message).toMatch(/[╭╰│├─]/);
      }
    });
  });

  /**
   * 에러 메시지 스냅샷 테스트
   * 이 테스트들은 실제 에러 메시지가 어떻게 보이는지 확인할 수 있습니다.
   * `yarn test src/helpers/error -u` 로 스냅샷을 업데이트할 수 있습니다.
   */
  describe('에러 메시지 스냅샷', () => {
    it('formatInfiniteLoopError 스냅샷', () => {
      const result = formatInfiniteLoopError(
        '/form/computed/derived',
        ['../price', '../quantity', '../discount'],
        150,
        100,
      );
      expect(result).toMatchSnapshot();
    });

    it('formatCircularReferenceError 스냅샷', () => {
      const result = formatCircularReferenceError(
        'Circular structure in JSON',
        {
          type: 'object',
          $ref: '#/definitions/RecursiveType',
          properties: {
            name: { type: 'string' },
            children: { $ref: '#/definitions/RecursiveType' },
          },
        },
      );
      expect(result).toMatchSnapshot();
    });

    it('formatCreateDynamicFunctionError 스냅샷', () => {
      const result = formatCreateDynamicFunctionError(
        'computed.visible',
        "../category === 'premium' && ../price > 100",
        "return values[0] === 'premium' && values[1] > 100",
        new SyntaxError("Unexpected token '>'"),
      );
      expect(result).toMatchSnapshot();
    });

    it('formatConditionIndexError 스냅샷', () => {
      const result = formatConditionIndexError(
        'oneOf',
        [
          "./type === 'personal'",
          "./type === 'business'",
          "./type === 'admin'",
        ],
        [
          'if (values[0] === "personal") return 0;',
          'if (values[0] === "business") return 1;',
          'if (values[0] === "admin") return 2;',
        ],
        new ReferenceError('values is not defined'),
      );
      expect(result).toMatchSnapshot();
    });

    it('formatObservedValuesError 스냅샷', () => {
      const result = formatObservedValuesError(
        'discountedPrice',
        ['../price', '../discount', '../taxRate'],
        [0, 1, 2],
        new Error('Invalid watch path: ../taxRate does not exist'),
      );
      expect(result).toMatchSnapshot();
    });

    it('formatConditionIndicesError 스냅샷', () => {
      const result = formatConditionIndicesError(
        'anyOf',
        ['./hasEmail === true', './hasPhone === true', './hasAddress === true'],
        [
          'const results = [];',
          'if (values[0]) results.push(0);',
          'if (values[1]) results.push(1);',
          'if (values[2]) results.push(2);',
          'return results;',
        ],
        new TypeError('Cannot read property "push" of undefined'),
      );
      expect(result).toMatchSnapshot();
    });

    it('formatItemsFalseWithoutPrefixItemsError 스냅샷', () => {
      const result = formatItemsFalseWithoutPrefixItemsError({
        type: 'array',
        items: false,
        minItems: 1,
        maxItems: 5,
      });
      expect(result).toMatchSnapshot();
    });

    it('formatMissingItemsAndPrefixItemsError 스냅샷', () => {
      const result = formatMissingItemsAndPrefixItemsError({
        type: 'array',
        minItems: 1,
      });
      expect(result).toMatchSnapshot();
    });

    it('formatMaxItemsExceedsPrefixItemsError 스냅샷', () => {
      const result = formatMaxItemsExceedsPrefixItemsError(
        {
          type: 'array',
          prefixItems: [
            { type: 'string', title: 'First Name' },
            { type: 'string', title: 'Last Name' },
          ],
          maxItems: 5,
        },
        5,
        2,
      );
      expect(result).toMatchSnapshot();
    });

    it('formatMinItemsExceedsPrefixItemsError 스냅샷', () => {
      const result = formatMinItemsExceedsPrefixItemsError(
        {
          type: 'array',
          prefixItems: [{ type: 'number' }],
          minItems: 3,
        },
        3,
        1,
      );
      expect(result).toMatchSnapshot();
    });

    it('formatUnknownJsonSchemaError 스냅샷', () => {
      const result = formatUnknownJsonSchemaError('customType', {
        type: 'customType',
        title: 'Custom Field',
        properties: {
          value: { type: 'string' },
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('formatAllOfTypeRedefinitionError 스냅샷', () => {
      const result = formatAllOfTypeRedefinitionError(
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        {
          type: 'array',
          items: { type: 'string' },
        },
      );
      expect(result).toMatchSnapshot();
    });

    it('formatInvalidVirtualNodeValuesError 스냅샷', () => {
      const result = formatInvalidVirtualNodeValuesError(3, 1, [
        'onlyOneValue',
      ]);
      expect(result).toMatchSnapshot();
    });

    it('formatCompositionTypeRedefinitionError 스냅샷', () => {
      const result = formatCompositionTypeRedefinitionError(
        'oneOf',
        {
          type: 'object',
          properties: {
            userType: { type: 'string' },
            email: { type: 'string', format: 'email' },
            age: { type: 'number' },
          },
        },
        '/user/profile',
        'object',
        'string',
      );
      expect(result).toMatchSnapshot();
    });

    it('formatCompositionPropertyExclusivenessError 스냅샷', () => {
      const result = formatCompositionPropertyExclusivenessError(
        'anyOf',
        '/registration/form',
        'email',
      );
      expect(result).toMatchSnapshot();
    });

    it('formatCompositionPropertyRedefinitionError 스냅샷', () => {
      const result = formatCompositionPropertyRedefinitionError(
        'oneOf',
        '/user/settings',
        'theme',
      );
      expect(result).toMatchSnapshot();
    });

    it('formatInvalidRangeError 스냅샷', () => {
      const result = formatInvalidRangeError(
        100,
        50,
        'minimum (100) exceeds maximum (50)',
      );
      expect(result).toMatchSnapshot();
    });

    it('formatConflictingConstValuesError 스냅샷', () => {
      const result = formatConflictingConstValuesError(
        { status: 'active', role: 'admin' },
        { status: 'inactive', role: 'user' },
      );
      expect(result).toMatchSnapshot();
    });

    it('formatEmptyEnumIntersectionError 스냅샷', () => {
      const result = formatEmptyEnumIntersectionError(
        ['draft', 'pending', 'review'],
        ['approved', 'rejected', 'archived'],
      );
      expect(result).toMatchSnapshot();
    });

    it('formatVirtualFieldsNotValidError 스냅샷', () => {
      const result = formatVirtualFieldsNotValidError(
        'fullAddress',
        { fields: 'street,city,zip' as any },
        'addressForm',
      );
      expect(result).toMatchSnapshot();
    });

    it('formatVirtualFieldsNotInPropertiesError 스냅샷', () => {
      const result = formatVirtualFieldsNotInPropertiesError(
        'contactInfo',
        { fields: ['email', 'phone', 'fax', 'telegram'] },
        ['fax', 'telegram'],
      );
      expect(result).toMatchSnapshot();
    });

    it('formatFormTypeInputMapError 스냅샷', () => {
      const result = formatFormTypeInputMapError(
        '/users/*/profile/[invalid',
        new SyntaxError(
          'Invalid regular expression: /\\/users\\/.*\\/profile\\/[invalid/: Unterminated character class',
        ),
      );
      expect(result).toMatchSnapshot();
    });

    it('formatSchemaValidationFailedError 스냅샷', () => {
      const result = formatSchemaValidationFailedError(
        {
          name: 'J',
          email: 'not-an-email',
          age: -5,
          tags: 'should-be-array',
        },
        [
          {
            dataPath: '/name',
            message: 'must be at least 2 characters',
            keyword: 'minLength',
          },
          {
            dataPath: '/email',
            message: 'must be a valid email address',
            keyword: 'format',
          },
          { dataPath: '/age', message: 'must be >= 0', keyword: 'minimum' },
          { dataPath: '/tags', message: 'must be array', keyword: 'type' },
          { dataPath: '/phone', message: 'is required', keyword: 'required' },
          { dataPath: '/address', message: 'is required', keyword: 'required' },
        ],
        { type: 'object' },
      );
      expect(result).toMatchSnapshot();
    });

    it('formatRegisterPluginError 스냅샷', () => {
      const mockPlugin: SchemaFormPlugin = {
        FormInput: () => null,
        FormLabel: () => null,
        formTypeInputDefinitions: [
          { test: { type: 'string' }, Component: () => null },
        ],
        validator: {
          bind: () => {},
          compile: () => () => null,
        },
      };
      const result = formatRegisterPluginError(
        mockPlugin,
        new Error(
          'Plugin conflict: formTypeInputDefinitions[0] conflicts with existing definition',
        ),
      );
      expect(result).toMatchSnapshot();
    });

    it('formatInjectValueToError 스냅샷', () => {
      const result = formatInjectValueToError(
        'current-value',
        '/sourceField',
        {
          sourceField: 'current-value',
          targetField: '',
          otherField: 123,
        },
        { userId: 'user-123', sessionId: 'session-456' },
        {
          type: 'string',
          title: 'Source Field',
          injectValueTo: () => ({ '/targetField': 'injected-value' }),
        },
        '/properties/sourceField',
        new TypeError("Cannot read properties of undefined (reading 'map')"),
      );
      expect(result).toMatchSnapshot();
    });
  });
});
