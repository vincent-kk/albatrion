import { describe, expect, it } from 'vitest';

import type {
  FormTypeTestFn,
  FormTypeTestObject,
  Hint,
} from '../formTypeInput';

/**
 * Test utility to check if a FormTypeTestObject matches a Hint
 * This simulates the internal matching logic used by schema-form
 */
const testMatches = (test: FormTypeTestObject, hint: Hint): boolean => {
  // Type matching
  if (test.type !== undefined) {
    const testTypes = Array.isArray(test.type) ? test.type : [test.type];
    if (!testTypes.includes(hint.type)) {
      return false;
    }
  }

  // Nullable matching
  if (test.nullable !== undefined) {
    if (test.nullable !== hint.nullable) {
      return false;
    }
  }

  // Path matching
  if (test.path !== undefined) {
    const testPaths = Array.isArray(test.path) ? test.path : [test.path];
    if (!testPaths.includes(hint.path)) {
      return false;
    }
  }

  // Format matching
  if (test.format !== undefined) {
    const testFormats = Array.isArray(test.format)
      ? test.format
      : [test.format];
    if (!testFormats.includes(hint.format)) {
      return false;
    }
  }

  // FormType matching
  if (test.formType !== undefined) {
    const testFormTypes = Array.isArray(test.formType)
      ? test.formType
      : [test.formType];
    if (!testFormTypes.includes(hint.formType)) {
      return false;
    }
  }

  return true;
};

describe('FormTypeInput - Nullable Type Matching', () => {
  describe('nullable property in FormTypeTestObject', () => {
    it('should match nullable string types', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        nullable: true,
      };

      const hint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/name',
        jsonSchema: { type: ['string', 'null'] },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should match non-nullable string types', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        nullable: false,
      };

      const hint: Hint = {
        type: 'string',
        nullable: false,
        required: true,
        path: '/name',
        jsonSchema: { type: 'string' },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should not match when nullable property differs', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        nullable: true,
      };

      const nonNullableHint: Hint = {
        type: 'string',
        nullable: false,
        required: true,
        path: '/name',
        jsonSchema: { type: 'string' },
      };

      expect(testMatches(test, nonNullableHint)).toBe(false);
    });

    it('should match when nullable is undefined (wildcard)', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        // nullable is undefined, matches both nullable and non-nullable
      };

      const nullableHint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/name',
        jsonSchema: { type: ['string', 'null'] },
      };

      const nonNullableHint: Hint = {
        type: 'string',
        nullable: false,
        required: true,
        path: '/name',
        jsonSchema: { type: 'string' },
      };

      expect(testMatches(test, nullableHint)).toBe(true);
      expect(testMatches(test, nonNullableHint)).toBe(true);
    });
  });

  describe('type-specific nullable matching', () => {
    it('should match nullable number types', () => {
      const test: FormTypeTestObject = {
        type: 'number',
        nullable: true,
      };

      const hint: Hint = {
        type: 'number',
        nullable: true,
        required: false,
        path: '/age',
        jsonSchema: { type: ['number', 'null'] },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should match nullable integer types', () => {
      const test: FormTypeTestObject = {
        type: 'integer',
        nullable: true,
      };

      const hint: Hint = {
        type: 'integer',
        nullable: true,
        required: false,
        path: '/count',
        jsonSchema: { type: ['integer', 'null'] },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should match nullable boolean types', () => {
      const test: FormTypeTestObject = {
        type: 'boolean',
        nullable: true,
      };

      const hint: Hint = {
        type: 'boolean',
        nullable: true,
        required: false,
        path: '/active',
        jsonSchema: { type: ['boolean', 'null'] },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should match nullable object types', () => {
      const test: FormTypeTestObject = {
        type: 'object',
        nullable: true,
      };

      const hint: Hint = {
        type: 'object',
        nullable: true,
        required: false,
        path: '/address',
        jsonSchema: { type: ['object', 'null'], properties: {} },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should match nullable array types', () => {
      const test: FormTypeTestObject = {
        type: 'array',
        nullable: true,
      };

      const hint: Hint = {
        type: 'array',
        nullable: true,
        required: false,
        path: '/items',
        jsonSchema: {
          type: ['array', 'null'],
          items: {
            type: 'string',
          },
        },
      };

      expect(testMatches(test, hint)).toBe(true);
    });
  });

  describe('multiple type matching with nullable', () => {
    it('should match multiple types with nullable', () => {
      const test: FormTypeTestObject = {
        type: ['string', 'number'],
        nullable: true,
      };

      const stringHint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/value',
        jsonSchema: { type: ['string', 'null'] },
      };

      const numberHint: Hint = {
        type: 'number',
        nullable: true,
        required: false,
        path: '/value',
        jsonSchema: { type: ['number', 'null'] },
      };

      expect(testMatches(test, stringHint)).toBe(true);
      expect(testMatches(test, numberHint)).toBe(true);
    });

    it('should not match when nullable differs even with matching type', () => {
      const test: FormTypeTestObject = {
        type: ['string', 'number'],
        nullable: true,
      };

      const nonNullableHint: Hint = {
        type: 'string',
        nullable: false,
        required: true,
        path: '/value',
        jsonSchema: { type: 'string' },
      };

      expect(testMatches(test, nonNullableHint)).toBe(false);
    });
  });

  describe('combined nullable and format matching', () => {
    it('should match nullable string with format', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        format: 'email',
        nullable: true,
      };

      const hint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/email',
        format: 'email',
        jsonSchema: {
          type: ['string', 'null'],
          format: 'email',
        },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should not match when format matches but nullable differs', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        format: 'email',
        nullable: true,
      };

      const hint: Hint = {
        type: 'string',
        nullable: false,
        required: true,
        path: '/email',
        format: 'email',
        jsonSchema: {
          type: 'string',
          format: 'email',
        },
      };

      expect(testMatches(test, hint)).toBe(false);
    });
  });

  describe('combined nullable and path matching', () => {
    it('should match nullable type with specific path', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        path: '/user/name',
        nullable: true,
      };

      const hint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/user/name',
        jsonSchema: { type: ['string', 'null'] },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should not match when path differs even with matching nullable', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        path: '/user/name',
        nullable: true,
      };

      const hint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/user/email',
        jsonSchema: { type: ['string', 'null'] },
      };

      expect(testMatches(test, hint)).toBe(false);
    });
  });

  describe('complex scenarios', () => {
    it('should match complex nullable pattern with all properties', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        format: 'date',
        path: '/user/birthdate',
        nullable: true,
      };

      const hint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/user/birthdate',
        format: 'date',
        jsonSchema: {
          type: ['string', 'null'],
          format: 'date',
        },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should not match when any property differs', () => {
      const baseHint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/field',
        format: 'email',
        jsonSchema: { type: ['string', 'null'], format: 'email' },
      };

      const tests = [
        { type: 'number', format: 'email', path: '/field', nullable: true }, // type differs
        { type: 'string', format: 'url', path: '/field', nullable: true }, // format differs
        { type: 'string', format: 'email', path: '/other', nullable: true }, // path differs
        { type: 'string', format: 'email', path: '/field', nullable: false }, // nullable differs
      ] as const;

      tests.forEach((test) => {
        expect(testMatches(test, baseHint)).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null type (pure null schema)', () => {
      const test: FormTypeTestObject = {
        type: 'null',
        nullable: true,
      };

      const hint: Hint = {
        type: 'null',
        nullable: true,
        required: false,
        path: '/nullField',
        jsonSchema: { type: 'null' },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should distinguish between integer and number with nullable', () => {
      const integerTest: FormTypeTestObject = {
        type: 'integer',
        nullable: true,
      };

      const numberTest: FormTypeTestObject = {
        type: 'number',
        nullable: true,
      };

      const integerHint: Hint = {
        type: 'integer',
        nullable: true,
        required: false,
        path: '/count',
        jsonSchema: { type: ['integer', 'null'] },
      };

      const numberHint: Hint = {
        type: 'number',
        nullable: true,
        required: false,
        path: '/amount',
        jsonSchema: { type: ['number', 'null'] },
      };

      // Integer test should match integer hint
      expect(testMatches(integerTest, integerHint)).toBe(true);
      expect(testMatches(integerTest, numberHint)).toBe(false);

      // Number test should match number hint
      expect(testMatches(numberTest, numberHint)).toBe(true);
      expect(testMatches(numberTest, integerHint)).toBe(false);
    });

    it('should handle empty FormTypeTestObject (matches all)', () => {
      const test: FormTypeTestObject = {};

      const hints: Hint[] = [
        {
          type: 'string',
          nullable: true,
          required: false,
          path: '/a',
          jsonSchema: { type: ['string', 'null'] },
        },
        {
          type: 'number',
          nullable: false,
          required: true,
          path: '/b',
          jsonSchema: { type: 'number' },
        },
        {
          type: 'boolean',
          nullable: true,
          required: false,
          path: '/c',
          jsonSchema: { type: ['boolean', 'null'] },
        },
      ];

      hints.forEach((hint) => {
        expect(testMatches(test, hint)).toBe(true);
      });
    });

    it('should handle undefined format in both test and hint', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        nullable: true,
        // format is undefined
      };

      const hint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/field',
        // format is undefined
        jsonSchema: { type: ['string', 'null'] },
      };

      expect(testMatches(test, hint)).toBe(true);
    });

    it('should handle formType matching with nullable', () => {
      const test: FormTypeTestObject = {
        type: 'string',
        formType: 'custom-input',
        nullable: true,
      };

      const hint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/custom',
        formType: 'custom-input',
        jsonSchema: {
          type: ['string', 'null'],
          formType: 'custom-input',
        },
      };

      expect(testMatches(test, hint)).toBe(true);
    });
  });

  describe('FormTypeTestFn integration', () => {
    it('should support custom function testing nullable', () => {
      const customTest: FormTypeTestFn = (hint: Hint) => {
        return hint.type === 'string' && hint.nullable === true;
      };

      const nullableStringHint: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/field',
        jsonSchema: { type: ['string', 'null'] },
      };

      const nonNullableStringHint: Hint = {
        type: 'string',
        nullable: false,
        required: true,
        path: '/field',
        jsonSchema: { type: 'string' },
      };

      expect(customTest(nullableStringHint)).toBe(true);
      expect(customTest(nonNullableStringHint)).toBe(false);
    });

    it('should support complex nullable logic in function', () => {
      const complexTest: FormTypeTestFn = (hint: Hint) => {
        // Match nullable strings with email format OR non-nullable numbers
        return (
          (hint.type === 'string' &&
            hint.nullable === true &&
            hint.format === 'email') ||
          (hint.type === 'number' && hint.nullable === false)
        );
      };

      const matchingHints: Hint[] = [
        {
          type: 'string',
          nullable: true,
          required: false,
          path: '/email',
          format: 'email',
          jsonSchema: { type: ['string', 'null'], format: 'email' },
        },
        {
          type: 'number',
          nullable: false,
          required: true,
          path: '/age',
          jsonSchema: { type: 'number' },
        },
      ];

      const nonMatchingHints: Hint[] = [
        {
          type: 'string',
          nullable: false,
          required: true,
          path: '/email',
          format: 'email',
          jsonSchema: { type: 'string', format: 'email' },
        },
        {
          type: 'number',
          nullable: true,
          required: false,
          path: '/age',
          jsonSchema: { type: ['number', 'null'] },
        },
      ];

      matchingHints.forEach((hint) => {
        expect(complexTest(hint)).toBe(true);
      });

      nonMatchingHints.forEach((hint) => {
        expect(complexTest(hint)).toBe(false);
      });
    });
  });

  describe('real-world usage patterns', () => {
    it('should match nullable email input component', () => {
      const emailInputTest: FormTypeTestObject = {
        type: 'string',
        format: 'email',
        nullable: false, // Only for required emails
      };

      const optionalEmailInputTest: FormTypeTestObject = {
        type: 'string',
        format: 'email',
        nullable: true, // For optional emails
      };

      const requiredEmail: Hint = {
        type: 'string',
        nullable: false,
        required: true,
        path: '/contact/email',
        format: 'email',
        jsonSchema: { type: 'string', format: 'email' },
      };

      const optionalEmail: Hint = {
        type: 'string',
        nullable: true,
        required: false,
        path: '/contact/secondaryEmail',
        format: 'email',
        jsonSchema: { type: ['string', 'null'], format: 'email' },
      };

      // Required email should match only emailInputTest
      expect(testMatches(emailInputTest, requiredEmail)).toBe(true);
      expect(testMatches(optionalEmailInputTest, requiredEmail)).toBe(false);

      // Optional email should match only optionalEmailInputTest
      expect(testMatches(emailInputTest, optionalEmail)).toBe(false);
      expect(testMatches(optionalEmailInputTest, optionalEmail)).toBe(true);
    });

    it('should match nullable number slider component', () => {
      const sliderTest: FormTypeTestObject = {
        type: 'number',
        nullable: false, // Slider requires value
      };

      const optionalSliderTest: FormTypeTestObject = {
        type: 'number',
        nullable: true, // Optional slider with "not set" state
      };

      const requiredNumber: Hint = {
        type: 'number',
        nullable: false,
        required: true,
        path: '/settings/volume',
        jsonSchema: { type: 'number', minimum: 0, maximum: 100 },
      };

      const optionalNumber: Hint = {
        type: 'number',
        nullable: true,
        required: false,
        path: '/settings/optionalVolume',
        jsonSchema: {
          type: ['number', 'null'],
          minimum: 0,
          maximum: 100,
        },
      };

      expect(testMatches(sliderTest, requiredNumber)).toBe(true);
      expect(testMatches(sliderTest, optionalNumber)).toBe(false);

      expect(testMatches(optionalSliderTest, requiredNumber)).toBe(false);
      expect(testMatches(optionalSliderTest, optionalNumber)).toBe(true);
    });
  });
});
