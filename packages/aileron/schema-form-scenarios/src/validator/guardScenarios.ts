import type { GuardScenario, ValidatorScenarioApplicability } from './types';

/** Default profile on the scenario's own entries, self-contained guards compiled directly. */
const onEveryEntry: ValidatorScenarioApplicability = {
  entries: ['default', '2019', '2020'],
  profiles: ['default'],
  directGuardCompile: true,
  features: [],
};

/** The same with the root-pointer path forced. */
const onRootPointer: ValidatorScenarioApplicability = { ...onEveryEntry, directGuardCompile: false };

/** The 2019-09 dynamic vocabulary only: the Ajv2019 entry or binding. */
const on2019Vocabulary: ValidatorScenarioApplicability = { ...onEveryEntry, entries: ['2019'] };

/** The same on both guard compile paths. */
const onBothPaths: ValidatorScenarioApplicability = { ...onEveryEntry, directGuardCompile: 'both' };

const branches = {
  then: { required: ['accepted'] },
  else: { required: ['rejected'] },
} as const;

/** VALIDATE-047 case (i), ajv6 and ajv7 `guard-scope.test.ts`: a relative `$ref` inside an inner `$id`. */
const innerIdRoot = {
  $id: 'https://example.test/ajv7/guard.json',
  type: 'object',
  definitions: {
    branch: {
      $id: 'nested/',
      definitions: { eligible: { properties: { kind: { const: 'yes' } }, required: ['kind'] } },
      if: { $ref: '#/definitions/eligible' },
      ...branches,
    },
  },
  properties: { item: { $ref: 'nested/' } },
} as const;

/** VALIDATE-047 case (ii), ajv8 `guard-scope.test.ts`: a 2020-12 `$dynamicRef` reached through `$ref`. */
const dynamicRefRoot = {
  $id: 'https://example.test/dynamic',
  $dynamicAnchor: 'node',
  $defs: {
    base: {
      $id: 'base',
      $dynamicAnchor: 'node',
      type: 'object',
      properties: { value: { type: 'string' }, next: { $dynamicRef: '#node' } },
      required: ['value'],
    },
  },
  if: { $ref: 'base' },
  then: false,
  else: true,
} as const;

/** VALIDATE-047 case (iii), ajv8 `guard-scope.test.ts`: a 2019-09 `$recursiveRef` reached through `$ref`. */
const recursiveRefRoot = {
  $id: 'https://example.test/recursive',
  $recursiveAnchor: true,
  $defs: {
    base: {
      $id: 'base',
      $recursiveAnchor: true,
      type: 'object',
      properties: { value: { type: 'string' }, next: { $recursiveRef: '#' } },
      required: ['value'],
    },
  },
  if: { $ref: 'base' },
  then: false,
  else: true,
} as const;

/** Dynamic keywords of `guard-scope.dynamic-root.test.ts` and `.lexical-ancestors.test.ts` per dialect. */
const dynamic = {
  '2020': {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    outerAnchor: { $dynamicAnchor: 'outer' },
    anchor: { $dynamicAnchor: 'node' },
    reference: { $dynamicRef: '#node' },
  },
  '2019': {
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    outerAnchor: { $recursiveAnchor: false },
    anchor: { $recursiveAnchor: true },
    reference: { $recursiveRef: '#' },
  },
} as const;

type DynamicDraft = keyof typeof dynamic;

/** Defect A T1: a root `/if` guard is independent of the root's other assertions (`required: ['x']`). */
const rootAssertionsRoot = (draft: DynamicDraft) => ({
  $schema: dynamic[draft].$schema,
  $id: `https://example.test/ajv8/${draft}/root-assertions`,
  ...dynamic[draft].anchor,
  type: 'object',
  required: ['x'],
  $defs: { flag: { required: ['flag'] } },
  if: { $ref: '#/$defs/flag' },
  ...branches,
});

/** Defect A T2: a nested `if` resolves the root's dynamic scope. */
const nestedIfRoot = (draft: DynamicDraft) => ({
  $id: `https://example.test/ajv8/${draft}/nested-if`,
  ...dynamic[draft].anchor,
  type: 'object',
  properties: { kind: { type: 'string', const: 'yes' }, item: { $ref: '#/$defs/branch' } },
  required: ['kind'],
  $defs: { branch: { if: { properties: { next: dynamic[draft].reference }, required: ['next'] }, ...branches } },
});

/** Plan T8 (a): the anchor of a nested resource on the pointer path. */
const nestedResourceRoot = (draft: DynamicDraft) => ({
  $id: `https://example.test/ajv8/${draft}/chain/root`,
  ...dynamic[draft].outerAnchor,
  $ref: 'mid/',
  $defs: {
    mid: {
      $id: 'mid/',
      $ref: 'leaf',
      $defs: {
        leaf: {
          $id: 'leaf',
          ...dynamic[draft].anchor,
          type: 'object',
          required: ['ok'],
          if: { properties: { next: dynamic[draft].reference }, required: ['next'] },
          ...branches,
        },
      },
    },
  },
});

/** Plan T9: an asynchronous root whose anchor a synchronous `if` would use, at `/if`. */
const asyncRootIf = (draft: DynamicDraft) => ({
  $async: true,
  $id: `https://example.test/ajv8/${draft}/async-root-if`,
  ...dynamic[draft].anchor,
  type: 'object',
  if: { properties: { next: dynamic[draft].reference }, required: ['next'] },
  ...branches,
});

/** Plan T9: the same asynchronous root anchor used from a nested `if`. */
const asyncRootNested = (draft: DynamicDraft) => ({
  $async: true,
  $id: `https://example.test/ajv8/${draft}/async-root-nested`,
  ...dynamic[draft].anchor,
  type: 'object',
  properties: { item: { $ref: '#/$defs/branch' } },
  $defs: { branch: { if: { properties: { next: dynamic[draft].reference }, required: ['next'] }, ...branches } },
});

/** IR-10 condition of `guard-meta-schema.test.ts`: `kind` must equal `'a'`. */
const kindIsA = { properties: { kind: { const: 'a' } }, required: ['kind'] } as const;

/** IR-10 `unrelatedViolation('no-id', …)`: a valid condition beside a meta-schema violation (`multipleOf: 0`). */
const unrelatedViolationRoot = {
  type: 'object',
  properties: { kind: { type: 'string' }, count: { type: 'number', multipleOf: 0 } },
  if: kindIsA,
  then: { required: ['count'] },
} as const;

/** IR-10 T2: the same violation with a `$ref` condition that needs the root location. */
const unrelatedViolationRefRoot = {
  ...unrelatedViolationRoot,
  definitions: { isA: kindIsA },
  if: { $ref: '#/definitions/isA' },
} as const;

/** IR-10 T7: meta-only violations inside the condition (`minLength: 1.5`, a duplicate `required` item). */
const metaOnlyConditionRoot = {
  type: 'object',
  if: { properties: { kind: { type: 'string', minLength: 1.5 } }, required: ['kind', 'kind'] },
} as const;

/** `direct-guard-compile.test.ts`: a root `$schema` declaration sends the guard through the root pointer. */
const rootSchemaRoot = {
  type: 'object',
  if: { type: 'object', properties: { n: { type: 'number' } } },
  $schema: 'http://json-schema.org/draft-07/schema#',
} as const;

/** `direct-guard-compile.test.ts`: an asynchronous condition cannot back a synchronous guard. */
const asyncConditionRoot = { type: 'object', if: { $async: true, type: 'string' } } as const;

/** VALIDATE-047 case (iv), ajv8 shape: one location used from two dynamic scopes (unsupported). */
const twoScopesCommon = {
  $id: 'https://example.test/two-scopes',
  $defs: {
    shared: {
      $id: 'https://example.test/shared',
      $dynamicAnchor: 'node',
      if: { type: 'object', properties: { next: { $dynamicRef: '#node' } }, required: ['next'] },
      then: false,
      else: true,
    },
    stringScope: {
      $id: 'https://example.test/string-scope',
      $dynamicAnchor: 'node',
      type: 'object',
      required: ['stringKey'],
      $ref: 'https://example.test/shared',
    },
    numberScope: {
      $id: 'https://example.test/number-scope',
      $dynamicAnchor: 'node',
      type: 'object',
      required: ['numberKey'],
      $ref: 'https://example.test/shared',
    },
  },
} as const;

/** VALIDATE-047 case (iv), ajv7 shape: two off-chain resources reach one `if`; no chain resource binds `node`, so the guard refuses it. */
const twoScopesAjv7Root = {
  $id: 'https://example.test/ajv7/two-scopes.json',
  type: 'object',
  $defs: {
    common: {
      if: { properties: { next: { $dynamicRef: '#node' } }, required: ['next'] },
      ...branches,
    },
    left: {
      $id: 'left',
      $dynamicAnchor: 'node',
      type: 'object',
      properties: { kind: { type: 'string', const: 'left' }, item: { $ref: 'https://example.test/ajv7/two-scopes.json#/$defs/common' } },
      required: ['kind'],
    },
    right: {
      $id: 'right',
      $dynamicAnchor: 'node',
      type: 'object',
      properties: { kind: { type: 'string', const: 'right' }, item: { $ref: 'https://example.test/ajv7/two-scopes.json#/$defs/common' } },
      required: ['kind'],
    },
  },
  properties: { left: { $ref: '#/$defs/left' }, right: { $ref: '#/$defs/right' } },
} as const;

/** L8′, `guard-scope.lexical-ancestors.test.ts`: an off-chain `$id` wrapper binds the anchor first; the guard refuses it. */
const offChainWrapperRoot = {
  $id: 'https://example.test/ajv8/2019/l8/root',
  $ref: 'wrapper',
  $defs: {
    wrapper: { $id: 'wrapper', $recursiveAnchor: true, $ref: 'leaf' },
    leaf: {
      $id: 'leaf',
      type: 'object',
      required: ['ok'],
      if: { properties: { next: { $recursiveRef: '#' } }, required: ['next'] },
      ...branches,
    },
  },
} as const;

/**
 * L16, built from the ajv8 README description because no plugin test carries it (2019):
 * a non-root `$recursiveAnchor: true` outside the `if` together with an ancestor declaration
 * inside it (unsupported; whole validation and the guard can differ).
 */
const nonRootAnchorWithInnerAncestorRoot = {
  $id: 'https://example.test/parity/l16/root',
  type: 'object',
  properties: {
    host: {
      $recursiveAnchor: true,
      type: 'object',
      required: ['ok'],
      if: { $recursiveAnchor: true, properties: { next: { $recursiveRef: '#' } }, required: ['next'] },
      ...branches,
    },
  },
} as const;

/** Plan T8 (b), 2019: `$recursiveAnchor: true` below a resource root (L12); the guard refuses it. */
const nonRootRecursiveAnchorRoot = {
  $id: 'https://example.test/ajv8/2019/host-anchor',
  type: 'object',
  properties: {
    host: {
      $recursiveAnchor: true,
      type: 'object',
      required: ['ok'],
      if: { properties: { next: { $recursiveRef: '#' } }, required: ['next'] },
      ...branches,
    },
  },
} as const;

/**
 * Guard verdicts the form relies on, plus unsupported shapes recorded per plugin.
 * Conformance expected values are AJV whole-validation `if` verdicts of the source tests.
 */
export const guardScenarios: readonly GuardScenario[] = [
  { kind: 'guard', bundle: 'conformance', id: 'guard.inner-id-ref.eligible', source: 'VALIDATE-047 (i)', drafts: ['07'], applies: onEveryEntry,
    schema: innerIdRoot, pointer: '/definitions/branch/if', hostValue: { kind: 'yes', accepted: true }, expected: true },
  { kind: 'guard', bundle: 'conformance', id: 'guard.inner-id-ref.ineligible', source: 'VALIDATE-047 (i)', drafts: ['07'], applies: onEveryEntry,
    schema: innerIdRoot, pointer: '/definitions/branch/if', hostValue: { kind: 'no', rejected: true }, expected: false },
  { kind: 'guard', bundle: 'conformance', id: 'guard.dynamic-ref.through-ref', source: 'VALIDATE-047 (ii)', drafts: ['2020'], applies: onEveryEntry,
    schema: dynamicRefRoot, pointer: '/if', hostValue: { value: 'ok', next: { value: 1 } }, expected: true },
  { kind: 'guard', bundle: 'conformance', id: 'guard.recursive-ref.through-ref', source: 'VALIDATE-047 (iii)', drafts: ['2019'], applies: onEveryEntry,
    schema: recursiveRefRoot, pointer: '/if', hostValue: { value: 'ok', next: { value: 1 } }, expected: true },
  ...(['2020', '2019'] as const).flatMap((draft): GuardScenario[] => [
    { kind: 'guard', bundle: 'conformance', id: `guard.root-assertions.${draft}.empty`, source: 'IR-11 defect A T1', drafts: [draft], applies: onEveryEntry,
      schema: rootAssertionsRoot(draft), pointer: '/if', hostValue: {}, expected: false },
    { kind: 'guard', bundle: 'conformance', id: `guard.root-assertions.${draft}.flag`, source: 'IR-11 defect A T1', drafts: [draft], applies: onEveryEntry,
      schema: rootAssertionsRoot(draft), pointer: '/if', hostValue: { flag: true }, expected: true },
    { kind: 'guard', bundle: 'conformance', id: `guard.nested-if-root-scope.${draft}.yes`, source: 'IR-11 defect A T2', drafts: [draft], applies: onEveryEntry,
      schema: nestedIfRoot(draft), pointer: '/$defs/branch/if', hostValue: { next: { kind: 'yes' } }, expected: true },
    { kind: 'guard', bundle: 'conformance', id: `guard.nested-if-root-scope.${draft}.no`, source: 'IR-11 defect A T2', drafts: [draft], applies: onEveryEntry,
      schema: nestedIfRoot(draft), pointer: '/$defs/branch/if', hostValue: { next: { kind: 'no' } }, expected: false },
    { kind: 'guard', bundle: 'conformance', id: `guard.nested-resource-chain.${draft}`, source: 'IR-11 plan T8 (a)', drafts: [draft], applies: onEveryEntry,
      schema: nestedResourceRoot(draft), pointer: '/$defs/mid/$defs/leaf/if', hostValue: { ok: true, next: { ok: true, rejected: true } }, expected: true },
    { kind: 'guard', bundle: 'conformance', id: `guard.async-root-anchor.${draft}.root-if`, source: 'IR-11 plan T9', drafts: [draft], applies: onEveryEntry,
      schema: asyncRootIf(draft), pointer: '/if', hostValue: {}, expected: 'rejects' },
    { kind: 'guard', bundle: 'conformance', id: `guard.async-root-anchor.${draft}.nested`, source: 'IR-11 plan T9', drafts: [draft], applies: onEveryEntry,
      schema: asyncRootNested(draft), pointer: '/$defs/branch/if', hostValue: {}, expected: 'rejects' },
  ]),
  { kind: 'guard', bundle: 'conformance', id: 'guard.self-contained.unrelated-meta-violation.match', source: 'IR-10 T1', drafts: ['07'], applies: onEveryEntry,
    schema: unrelatedViolationRoot, pointer: '/if', hostValue: { kind: 'a' }, expected: true },
  { kind: 'guard', bundle: 'conformance', id: 'guard.self-contained.unrelated-meta-violation.other', source: 'IR-10 T1', drafts: ['07'], applies: onEveryEntry,
    schema: unrelatedViolationRoot, pointer: '/if', hostValue: { kind: 'b' }, expected: false },
  { kind: 'guard', bundle: 'conformance', id: 'guard.ref.unrelated-meta-violation', source: 'IR-10 T2', drafts: ['07'], applies: onEveryEntry,
    schema: unrelatedViolationRefRoot, pointer: '/if', hostValue: { kind: 'a' }, expected: true },
  { kind: 'guard', bundle: 'conformance', id: 'guard.root-pointer.unrelated-meta-violation', source: 'IR-10 T2', drafts: ['07'], applies: onRootPointer,
    schema: unrelatedViolationRoot, pointer: '/if', hostValue: { kind: 'b' }, expected: false },
  { kind: 'guard', bundle: 'conformance', id: 'guard.meta-only-condition.two-characters', source: 'IR-10 T7', drafts: ['07'], applies: onEveryEntry,
    schema: metaOnlyConditionRoot, pointer: '/if', hostValue: { kind: 'ab' }, expected: true },
  { kind: 'guard', bundle: 'conformance', id: 'guard.meta-only-condition.one-character', source: 'IR-10 T7', drafts: ['07'], applies: onEveryEntry,
    schema: metaOnlyConditionRoot, pointer: '/if', hostValue: { kind: 'a' }, expected: false },
  { kind: 'guard', bundle: 'conformance', id: 'guard.root-schema-declaration', source: 'IR-10 direct guard compile', drafts: ['07'], applies: onEveryEntry,
    schema: rootSchemaRoot, pointer: '/if', hostValue: { n: 'six' }, expected: false },
  { kind: 'guard', bundle: 'conformance', id: 'guard.async-condition', source: 'VALIDATE-047 asynchronous guard', drafts: ['07'], applies: onBothPaths,
    schema: asyncConditionRoot, pointer: '/if', hostValue: 'text', expected: 'rejects' },
  { kind: 'guard', bundle: 'conformance', id: 'guard.off-chain-wrapper.2019', source: 'IR-11 L8′', drafts: ['2019'], applies: on2019Vocabulary,
    schema: offChainWrapperRoot, pointer: '/$defs/leaf/if', hostValue: { ok: true, next: { ok: true, rejected: true } }, expected: 'rejects' },
  { kind: 'guard', bundle: 'conformance', id: 'guard.non-root-recursive-anchor.2019', source: 'IR-11 plan T8 (b), L12', drafts: ['2019'], applies: on2019Vocabulary,
    schema: nonRootRecursiveAnchorRoot, pointer: '/properties/host/if', hostValue: { ok: true, next: { ok: true, rejected: true } }, expected: 'rejects' },
  { kind: 'guard', bundle: 'observation', id: 'observe.two-scopes.2020', source: 'VALIDATE-047 (iv), ajv8 shape', drafts: ['2020'], applies: onEveryEntry,
    schema: { ...twoScopesCommon, $ref: '#/$defs/stringScope' }, pointer: '/$defs/shared/if',
    hostValue: { stringKey: true, numberKey: true, next: { stringKey: true } }, expected: null },
  { kind: 'guard', bundle: 'conformance', id: 'guard.two-scopes-off-chain.2019', source: 'VALIDATE-047 (iv), ajv7 shape', drafts: ['2019'], applies: on2019Vocabulary,
    schema: twoScopesAjv7Root, pointer: '/$defs/common/if', hostValue: { next: { kind: 'left' } }, expected: 'rejects' },
  { kind: 'guard', bundle: 'observation', id: 'observe.non-root-anchor-with-inner-ancestor.2019', source: 'IR-11 L16', drafts: ['2019'], applies: on2019Vocabulary,
    schema: nonRootAnchorWithInnerAncestorRoot, pointer: '/properties/host/if', hostValue: { ok: true, next: { ok: true, rejected: true } }, expected: null },
];
