import type { LifetimeScenario, ValidatorScenarioApplicability } from './types';

/** Default profile on every entry whose dialect the scenario lists. */
const onEveryEntry: ValidatorScenarioApplicability = {
  entries: ['default', '2019', '2020'],
  profiles: ['default'],
  directGuardCompile: true,
  features: [],
};

/** A consumer instance bound once before first use, which the step then inspects. */
const onConsumerInstance: ValidatorScenarioApplicability = { ...onEveryEntry, profiles: ['custom'] };

const everyDraft = ['07', '2019', '2020'] as const;

/** AJV's root meta-schema rejection, by message or by the offending keyword (IR-10). */
const META_VIOLATION = 'multipleOf|schema is invalid';

/** AJV's duplicate-id registration message (IR-11 PR-B). */
const ALREADY_EXISTS = 'already exists';

/** `same-id.test.ts` case (i): a stable URI whose condition differs between live roots. */
const sameIdRoot = (kind: string) => ({
  $id: 'https://example.test/shared-root',
  type: 'object',
  if: { type: 'object', properties: { kind: { const: kind } }, required: ['kind'] },
  then: { required: ['selected'] },
});

/** Registration and release sequences the form relies on. */
export const lifetimeScenarios: readonly LifetimeScenario[] = [
  { kind: 'lifetime', bundle: 'conformance', id: 'lifetime.guard-before-compile.self-contained', source: 'VALIDATE-017 G-PLUGIN-01', drafts: everyDraft, applies: onEveryEntry,
    steps: [{
      action: 'compileGuardBeforeCompile',
      schema: { $id: 'https://example.test/parity/guard-before-compile/direct', type: 'string', if: { type: 'string', minLength: 3 }, then: { pattern: '^yes' } },
      pointer: '/if',
      guardChecks: [{ hostValue: 'yes', expected: true }, { hostValue: 'nope', expected: true }, { hostValue: 'x', expected: false }, { hostValue: 2, expected: false }],
      validationChecks: [
        { value: 'yes', expected: { valid: true, dataPaths: [] } },
        { value: 'x', expected: { valid: true, dataPaths: [] } },
        { value: 'nope', expected: { valid: false, dataPaths: [''] } },
      ],
    }] },
  { kind: 'lifetime', bundle: 'conformance', id: 'lifetime.guard-before-compile.root-ref', source: 'VALIDATE-017 G-PLUGIN-02', drafts: everyDraft, applies: onEveryEntry,
    steps: [{
      action: 'compileGuardBeforeCompile',
      schema: {
        $id: 'https://example.test/parity/guard-before-compile/ref',
        type: 'string',
        definitions: { eligible: { type: 'string', minLength: 3 } },
        if: { $ref: '#/definitions/eligible' },
        then: { pattern: '^yes' },
      },
      pointer: '/if',
      guardChecks: [{ hostValue: 'yes', expected: true }, { hostValue: 'nope', expected: true }, { hostValue: 'x', expected: false }, { hostValue: 2, expected: false }],
      validationChecks: [
        { value: 'yes', expected: { valid: true, dataPaths: [] } },
        { value: 'x', expected: { valid: true, dataPaths: [] } },
        { value: 'nope', expected: { valid: false, dataPaths: [''] } },
      ],
    }] },
  { kind: 'lifetime', bundle: 'conformance', id: 'lifetime.release-twice', source: 'VALIDATE-019 G-PLUGIN-03', drafts: everyDraft, applies: onEveryEntry,
    steps: [{
      action: 'releaseTwice',
      schema: { $id: 'https://example.test/parity/release', type: 'string', minLength: 3 },
      validationChecks: [
        { value: 'yes', expected: { valid: true, dataPaths: [] } },
        { value: 'x', expected: { valid: false, dataPaths: [''] } },
      ],
    }] },
  { kind: 'lifetime', bundle: 'conformance', id: 'lifetime.two-roots-same-id', source: 'VALIDATE-046 (i)', drafts: everyDraft,
    applies: { ...onEveryEntry, directGuardCompile: 'both' },
    steps: [{
      action: 'twoRootsSameId',
      first: sameIdRoot('first'),
      second: sameIdRoot('second'),
      pointer: '/if',
      hostValue: { kind: 'first' },
      expected: {
        first: { guard: true, validation: { valid: false, dataPaths: ['', '/selected'] } },
        second: { guard: false, validation: { valid: true, dataPaths: [] } },
      },
    }] },
  { kind: 'lifetime', bundle: 'conformance', id: 'lifetime.recompile-after-registration-failure', source: 'IR-10 T8', drafts: everyDraft, applies: onEveryEntry,
    steps: [{
      action: 'recompileSameCopyAfterRegistrationFailure',
      invalid: { $id: 'https://example.test/ir10-a', type: 'object', properties: { count: { type: 'number', multipleOf: 0 } } },
      failure: META_VIOLATION,
      valid: { $id: 'https://example.test/ir10-a', type: 'object', properties: { count: { type: 'number' } } },
      validationChecks: [
        { value: { count: 'x' }, expected: { valid: false, dataPaths: ['/count'] } },
        { value: { count: 1 }, expected: { valid: true, dataPaths: [] } },
      ],
    }] },
  { kind: 'lifetime', bundle: 'conformance', id: 'lifetime.consumer-schema-kept', source: 'IR-10 T9 (a)', drafts: everyDraft, applies: onConsumerInstance,
    steps: [{
      action: 'keepConsumerSchemaAfterSameIdFailure',
      consumer: { $id: 'https://example.test/ir10-x', type: 'string' },
      clash: { $id: 'https://example.test/ir10-x', type: 'number' },
      failure: ALREADY_EXISTS,
      consumerValue: 'abc',
    }] },
  { kind: 'lifetime', bundle: 'conformance', id: 'lifetime.consumer-meta-schema-kept', source: 'IR-10 T9 (c)', drafts: ['07'], applies: onConsumerInstance,
    steps: [{
      action: 'keepConsumerMetaSchemaAfterSameIdFailure',
      metaSchema: { $id: 'https://example.test/ir10-meta', $schema: 'http://json-schema.org/draft-07/schema#', type: 'object' },
      user: { $id: 'https://example.test/ir10-s', $schema: 'https://example.test/ir10-meta', type: 'string' },
      clash: { $id: 'https://example.test/ir10-meta', type: 'number' },
      failure: ALREADY_EXISTS,
      userValue: 'abc',
      sibling: { $id: 'https://example.test/parity/meta-sibling', type: 'string' },
    }] },
];
