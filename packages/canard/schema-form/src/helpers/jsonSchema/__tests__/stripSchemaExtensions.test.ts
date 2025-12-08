import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { stripSchemaExtensions } from '../stripSchemaExtensions';

describe('stripSchemaExtensions', () => {
  describe('기본 동작', () => {
    it('확장 속성이 없는 스키마는 그대로 반환해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        title: 'Name',
        description: 'User name',
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'string',
        title: 'Name',
        description: 'User name',
      });
    });

    it('빈 객체 스키마도 처리할 수 있어야 한다', () => {
      const schema = { type: 'object' } as JsonSchemaWithVirtual;

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({ type: 'object' });
    });
  });

  describe('원본 참조 유지 (제거 동작이 없는 경우)', () => {
    it('확장 속성이 없는 스키마는 원본 객체를 그대로 반환해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        title: 'Name',
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toBe(schema);
    });

    it('중첩된 스키마에서 확장 속성이 없으면 원본을 반환해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toBe(schema);
    });

    it('배열 스키마에서 확장 속성이 없으면 원본을 반환해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toBe(schema);
    });

    it('조건부 스키마에서 확장 속성이 없으면 원본을 반환해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        oneOf: [
          { properties: { type: { type: 'string', enum: ['A'] } } },
          { properties: { type: { type: 'string', enum: ['B'] } } },
        ],
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toBe(schema);
    });

    it('undefined 확장 속성만 있는 경우에도 원본을 반환해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        FormTypeInputProps: undefined,
        FormTypeRendererProps: undefined,
        errorMessages: undefined,
        options: undefined,
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toBe(schema);
    });
  });

  describe('FormTypeInputProps 제거', () => {
    it('FormTypeInputProps를 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        FormTypeInputProps: {
          placeholder: 'Enter name',
          className: 'custom-input',
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({ type: 'string' });
      expect(result).not.toHaveProperty('FormTypeInputProps');
    });
  });

  describe('FormTypeRendererProps 제거', () => {
    it('FormTypeRendererProps를 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'number',
        FormTypeRendererProps: {
          label: 'Age',
          className: 'form-field',
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({ type: 'number' });
      expect(result).not.toHaveProperty('FormTypeRendererProps');
    });
  });

  describe('errorMessages 제거', () => {
    it('errorMessages를 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        minLength: 1,
        errorMessages: {
          minLength: 'This field is required',
          default: 'Invalid value',
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'string',
        minLength: 1,
      });
      expect(result).not.toHaveProperty('errorMessages');
    });
  });

  describe('options 제거', () => {
    it('options를 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        options: {
          trim: true,
          omitEmpty: true,
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({ type: 'string' });
      expect(result).not.toHaveProperty('options');
    });
  });

  describe('여러 확장 속성 동시 제거', () => {
    it('모든 확장 속성을 동시에 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        title: 'Email',
        format: 'email',
        FormTypeInputProps: {
          placeholder: 'Enter email',
        },
        FormTypeRendererProps: {
          label: 'Email Address',
        },
        errorMessages: {
          format: 'Invalid email format',
        },
        options: {
          trim: true,
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'string',
        title: 'Email',
        format: 'email',
      });
      expect(result).not.toHaveProperty('FormTypeInputProps');
      expect(result).not.toHaveProperty('FormTypeRendererProps');
      expect(result).not.toHaveProperty('errorMessages');
      expect(result).not.toHaveProperty('options');
    });
  });

  describe('중첩된 스키마 처리', () => {
    it('object 스키마의 properties 내부 확장 속성을 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            FormTypeInputProps: { placeholder: 'Name' },
          },
          age: {
            type: 'number',
            errorMessages: { minimum: 'Must be positive' },
          },
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      });
    });

    it('array 스키마의 items 내부 확장 속성을 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'array',
        items: {
          type: 'string',
          FormTypeInputProps: { placeholder: 'Item' },
          options: { trim: true },
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'array',
        items: { type: 'string' },
      });
    });

    it('깊게 중첩된 스키마의 확장 속성을 모두 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        FormTypeRendererProps: { label: 'User Form' },
        properties: {
          profile: {
            type: 'object',
            options: { omitEmpty: true },
            properties: {
              contacts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      FormTypeInputProps: { placeholder: 'Email' },
                      errorMessages: { format: 'Invalid email' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: {
              contacts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  });

  describe('조건부 스키마 처리', () => {
    it('oneOf 내부 스키마의 확장 속성을 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        oneOf: [
          {
            properties: {
              type: { type: 'string', enum: ['A'] },
              fieldA: {
                type: 'string',
                FormTypeInputProps: { placeholder: 'Field A' },
              },
            },
          },
          {
            properties: {
              type: { type: 'string', enum: ['B'] },
              fieldB: {
                type: 'number',
                errorMessages: { minimum: 'Too small' },
              },
            },
          },
        ],
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'object',
        oneOf: [
          {
            properties: {
              type: { type: 'string', enum: ['A'] },
              fieldA: { type: 'string' },
            },
          },
          {
            properties: {
              type: { type: 'string', enum: ['B'] },
              fieldB: { type: 'number' },
            },
          },
        ],
      });
    });

    it('allOf 내부 스키마의 확장 속성을 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        allOf: [
          {
            properties: {
              name: {
                type: 'string',
                FormTypeInputProps: { placeholder: 'Name' },
              },
            },
          },
          {
            required: ['name'],
          },
        ],
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'object',
        allOf: [
          {
            properties: {
              name: { type: 'string' },
            },
          },
          {
            required: ['name'],
          },
        ],
      });
    });

    it('anyOf 내부 스키마의 확장 속성을 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        anyOf: [
          {
            properties: {
              option1: {
                type: 'string',
                options: { trim: true },
              },
            },
          },
          {
            properties: {
              option2: {
                type: 'number',
                FormTypeRendererProps: { label: 'Option 2' },
              },
            },
          },
        ],
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'object',
        anyOf: [
          {
            properties: {
              option1: { type: 'string' },
            },
          },
          {
            properties: {
              option2: { type: 'number' },
            },
          },
        ],
      });
    });

    it('if-then-else 내부 스키마의 확장 속성을 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        properties: {
          toggle: { type: 'boolean' },
        },
        if: {
          properties: {
            toggle: { const: true },
          },
        },
        then: {
          properties: {
            extra: {
              type: 'string',
              FormTypeInputProps: { placeholder: 'Extra field' },
            },
          },
        },
        else: {
          properties: {
            basic: {
              type: 'string',
              errorMessages: { minLength: 'Required' },
            },
          },
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'object',
        properties: {
          toggle: { type: 'boolean' },
        },
        if: {
          properties: {
            toggle: { const: true },
          },
        },
        then: {
          properties: {
            extra: { type: 'string' },
          },
        },
        else: {
          properties: {
            basic: { type: 'string' },
          },
        },
      });
    });
  });

  describe('표준 JSON Schema 속성 보존', () => {
    it('validation 관련 속성들을 보존해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z]+$',
        format: 'email',
        FormTypeInputProps: { placeholder: 'Email' },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z]+$',
        format: 'email',
      });
    });

    it('메타데이터 속성들을 보존해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        title: 'User',
        description: 'User object',
        $id: 'user-schema',
        $schema: 'http://json-schema.org/draft-07/schema#',
        FormTypeRendererProps: { label: 'User Form' },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'object',
        title: 'User',
        description: 'User object',
        $id: 'user-schema',
        $schema: 'http://json-schema.org/draft-07/schema#',
      });
    });

    it('number 스키마의 제약 조건들을 보존해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
        errorMessages: { minimum: 'Too small' },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
      });
    });

    it('array 스키마의 제약 조건들을 보존해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
        options: { omitEmpty: true },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
      });
    });

    it('object 스키마의 제약 조건들을 보존해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
        minProperties: 1,
        maxProperties: 5,
        FormTypeRendererProps: { label: 'Form' },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
        minProperties: 1,
        maxProperties: 5,
      });
    });
  });

  describe('엣지 케이스', () => {
    it('undefined 확장 속성은 스키마에 영향을 주지 않아야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        FormTypeInputProps: undefined,
        FormTypeRendererProps: undefined,
        errorMessages: undefined,
        options: undefined,
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'string',
        FormTypeInputProps: undefined,
        FormTypeRendererProps: undefined,
        errorMessages: undefined,
        options: undefined,
      });
    });

    it('nullable 타입 스키마도 올바르게 처리해야 한다', () => {
      const schema = {
        type: ['string', 'null'] as const,
        FormTypeInputProps: { placeholder: 'Optional' },
      } as JsonSchemaWithVirtual;

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: ['string', 'null'],
      });
    });

    it('enum과 const가 있는 스키마를 올바르게 처리해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        enum: ['option1', 'option2', 'option3'],
        FormTypeInputProps: {
          alias: {
            option1: 'First Option',
            option2: 'Second Option',
            option3: 'Third Option',
          },
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'string',
        enum: ['option1', 'option2', 'option3'],
      });
    });

    it('default 값이 있는 스키마를 보존해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        default: 'default value',
        FormTypeInputProps: { placeholder: 'Enter value' },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'string',
        default: 'default value',
      });
    });

    it('additionalProperties가 스키마인 경우도 처리해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: {
          type: 'string',
          FormTypeInputProps: { placeholder: 'Additional' },
        },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: {
          type: 'string',
        },
      });
    });
  });

  describe('virtual 스키마 처리', () => {
    it('virtual 타입 스키마의 확장 속성을 제거해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'virtual',
        fields: ['./field1', './field2'],
        FormTypeInputProps: { className: 'virtual-field' },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'virtual',
        fields: ['./field1', './field2'],
      });
    });
  });

  describe('computed 속성 처리', () => {
    it('computed 속성은 보존해야 한다 (확장 속성이 아님)', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        computed: {
          visible: '../toggle === true',
          disabled: '../locked === true',
        },
        FormTypeInputProps: { placeholder: 'Conditional' },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'string',
        computed: {
          visible: '../toggle === true',
          disabled: '../locked === true',
        },
      });
    });

    it('&if, &watch 등의 별칭 속성도 보존해야 한다', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
        '&if': './type === "advanced"',
        '&visible': '../showAdvanced === true',
        FormTypeRendererProps: { label: 'Advanced Field' },
      };

      const result = stripSchemaExtensions(schema);

      expect(result).toEqual({
        type: 'string',
        '&if': './type === "advanced"',
        '&visible': '../showAdvanced === true',
      });
    });
  });
});
