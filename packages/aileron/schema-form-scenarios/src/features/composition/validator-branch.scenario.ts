import type { FormScenario } from '../../types';

/** controls.active is invisible to the validator, so both open branches pass the oneOf. */
const untaggedSchema = {
  type: 'object', properties: { kind: { type: 'string' } },
  oneOf: [
    { controls: { active: './kind === "a"' }, properties: { a: { type: 'string' } } },
    { controls: { active: './kind === "b"' }, properties: { b: { type: 'string' } } },
  ],
};

/** FRAGMENT-031: each gated branch also states its tag const and required key for the validator. */
const taggedSchema = {
  type: 'object', properties: { kind: { type: 'string' } },
  oneOf: [
    { controls: { active: './kind === "a"' }, properties: { kind: { const: 'a' }, a: { type: 'string' } }, required: ['kind'] },
    { controls: { active: './kind === "b"' }, properties: { kind: { const: 'b' }, b: { type: 'string' } }, required: ['kind'] },
  ],
};

/** Both branches constrain the shared field; only the active branch's issues reach nodes. */
const filteredSchema = {
  type: 'object', properties: { kind: { type: 'string' }, shared: { type: 'string' } },
  oneOf: [
    { controls: { active: './kind === "a"' }, properties: { kind: { const: 'a' }, shared: { minLength: 3 }, a: { type: 'string' } }, required: ['kind', 'a'] },
    { controls: { active: './kind === "b"' }, properties: { kind: { const: 'b' }, shared: { maxLength: 1 } }, required: ['kind'] },
  ],
};

/** A validator verdict on the typed value reveals a dependent field. */
const revealSchema = {
  type: 'object', properties: { email: { type: 'string' } },
  if: { properties: { email: { pattern: '^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$' } }, required: ['email'] },
  then: { properties: { verifyCode: { type: 'string', minLength: 6 } }, required: ['verifyCode'] },
};

/** Validator-driven branch verdicts, attribution, and reveal cases. */
export const validatorBranchScenarios: readonly FormScenario[] = [
  {
    name: 'composition.oneof-active-without-const',
    description: 'FRAGMENT-031 controls.active alone lets the validator pass both branches, so oneOf rejects; VALIDATE-043 (6) the oneOf error stays on the host.',
    schema: untaggedSchema,
    initialValue: { kind: 'a', a: 'x' },
    steps: [
      { action: 'batch', steps: [], expect: {
        shape: { '/a': 'present', '/b': 'absent' }, outputValue: { kind: 'a', a: 'x' },
        errors: { '': [{ keyword: 'oneOf' }], '/kind': [], '/a': [] },
      } },
    ],
  },
  {
    name: 'composition.oneof-active-with-const-required',
    description: 'FRAGMENT-031 tag const and required make exactly one branch pass; VALIDATE-043 (6) an unmatched tag puts one const error per branch on the tag node and oneOf on the host.',
    schema: taggedSchema,
    initialValue: { kind: 'a', a: 'x' },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/a': 'present' }, errors: { '': [], '/kind': [] } } },
      { action: 'setValue', path: '/kind', value: 'b', expect: {
        shape: { '/a': 'absent', '/b': 'present' }, outputValue: { kind: 'b' }, errors: { '': [], '/kind': [] },
      } },
      { action: 'setValue', path: '/kind', value: 'c', expect: {
        shape: { '/a': 'absent', '/b': 'absent' }, outputValue: { kind: 'c' },
        errors: { '': [{ keyword: 'oneOf' }], '/kind': [{ keyword: 'const' }, { keyword: 'const' }] },
      } },
    ],
  },
  {
    name: 'composition.off-branch-error-filter',
    description: 'VALIDATE-043 (5) issues inside an inactive oneOf branch stay off nodes while a sibling branch is active; the filter follows the active branch after a switch.',
    schema: filteredSchema,
    initialValue: { kind: 'a', shared: 'xy' },
    steps: [
      { action: 'batch', steps: [], expect: {
        shape: { '/a': 'present' },
        errors: { '/shared': [{ keyword: 'minLength' }], '/kind': [], '/a': [{ keyword: 'required' }], '': [{ keyword: 'oneOf' }] },
      } },
      { action: 'batch', steps: [
        { action: 'setValue', path: '/a', value: 'A' },
        { action: 'setValue', path: '/shared', value: 'xyz' },
      ], expect: {
        outputValue: { kind: 'a', shared: 'xyz', a: 'A' },
        errors: { '/shared': [], '/kind': [], '/a': [], '': [] },
      } },
      { action: 'setValue', path: '/kind', value: 'b', expect: {
        shape: { '/a': 'absent' }, outputValue: { kind: 'b', shared: 'xyz' },
        errors: { '/shared': [{ keyword: 'maxLength' }], '/kind': [], '': [{ keyword: 'oneOf' }] },
      } },
    ],
  },
  {
    name: 'composition.guard-pattern-reveal',
    description: 'FRAGMENT-009 the validator guard judges a pattern on every keystroke; GOAL-034 the form does not interpret if; LANDING-018 the revealed field keeps its raw value while hidden.',
    schema: revealSchema,
    initialValue: {},
    steps: [
      { action: 'setValue', path: '/email', value: 'kim', expect: { shape: { '/verifyCode': 'absent' }, outputValue: { email: 'kim' } } },
      { action: 'setValue', path: '/email', value: 'kim@site.io', expect: {
        shape: { '/verifyCode': 'present' }, errors: { '/verifyCode': [{ keyword: 'required' }] },
      } },
      { action: 'setValue', path: '/verifyCode', value: '123', expect: {
        outputValue: { email: 'kim@site.io', verifyCode: '123' }, errors: { '/verifyCode': [{ keyword: 'minLength' }] },
      } },
      { action: 'setValue', path: '/email', value: 'kim@site', expect: {
        shape: { '/verifyCode': 'absent' }, outputValue: { email: 'kim@site' }, errors: { '': [] },
      } },
      { action: 'setValue', path: '/email', value: 'kim@site.dev', expect: {
        shape: { '/verifyCode': 'present' }, values: { '/verifyCode': '123' },
        outputValue: { email: 'kim@site.dev', verifyCode: '123' },
      } },
    ],
  },
];
