import type { ValidationScenario, ValidatorScenarioApplicability } from './types';

/** Default profile on every entry whose dialect the scenario lists. */
const onEveryEntry: ValidatorScenarioApplicability = {
  entries: ['default', '2019', '2020'],
  profiles: ['default'],
  directGuardCompile: true,
  features: [],
};

/** Every dialect: these cases use no dialect-specific keyword. */
const everyDraft = ['07', '2019', '2020'] as const;

/**
 * Whole-validation verdicts the form relies on. The first three are the same-ajv
 * comparison cases of each plugin's `differential.test.ts`; their data paths are
 * the AJV whole-validation issue paths with `required` pointing at the missing key.
 */
export const wholeValidationScenarios: readonly ValidationScenario[] = [
  { kind: 'validation', bundle: 'conformance', id: 'validation.if-only-oneof-invalid', source: 'VALIDATE-036', drafts: everyDraft, applies: onEveryEntry,
    schema: {
      type: 'object',
      properties: { kind: { type: 'string' } },
      oneOf: [
        { if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
          then: { properties: { a: { type: 'string' } }, required: ['a'] } },
        { if: { properties: { kind: { const: 'b' } }, required: ['kind'] },
          then: { properties: { b: { type: 'string' } }, required: ['b'] } },
      ],
    },
    value: { kind: 'a', a: 'A' }, expected: { valid: false, dataPaths: [''] } },
  { kind: 'validation', bundle: 'conformance', id: 'validation.union-type-error-path', source: 'VALIDATE-051', drafts: everyDraft, applies: onEveryEntry,
    schema: { type: 'object', properties: { choice: { type: ['string', 'number'] } } },
    value: { choice: { wrong: true } }, expected: { valid: false, dataPaths: ['/choice'] } },
  { kind: 'validation', bundle: 'conformance', id: 'validation.valid-authored-value', source: 'differential comparison', drafts: everyDraft, applies: onEveryEntry,
    schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
    value: { name: 'Ada' }, expected: { valid: true, dataPaths: [] } },
  { kind: 'validation', bundle: 'conformance', id: 'validation.format-off-by-default', source: 'VALIDATE-003 default profile', drafts: everyDraft, applies: onEveryEntry,
    schema: { type: 'string', format: 'email' },
    value: 'not-an-email', expected: { valid: true, dataPaths: [] } },
  { kind: 'validation', bundle: 'conformance', id: 'validation.allow-union-types', source: 'VALIDATE-051 union types', drafts: everyDraft,
    applies: { ...onEveryEntry, features: ['allowUnionTypes'] },
    schema: { type: ['string', 'number'] },
    value: 'text', expected: { valid: true, dataPaths: [] } },
];
