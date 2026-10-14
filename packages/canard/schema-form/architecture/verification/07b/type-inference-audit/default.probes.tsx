import { Form, type FormProps } from '@canard/schema-form_0.16.0';
import { schema, looseSchema, contextualSchema, closedSchema, nullableSchema, nullableFlagSchema, nullableStringSchema, literalSchema, branchSchema, initial, readonlyInitial, nullableInitial, type Profile, inspect } from './fixtures';

/** @audit default D01 as const schema without a default */
export function D01() {
  return <Form jsonSchema={schema} onChange={value => inspect('change', value)} />;
}

/** @audit default D02 schema without as const and without a default */
export function D02() {
  return <Form jsonSchema={looseSchema} onChange={value => inspect('change', value)} />;
}

/** @audit default D03 concrete object default with as const schema */
export function D03() {
  return <Form jsonSchema={schema} defaultValue={initial} onChange={value => inspect('change', value)} />;
}

/** @audit default D04 concrete object default without as const schema */
export function D04() {
  return <Form jsonSchema={looseSchema} defaultValue={initial} onChange={value => inspect('change', value)} />;
}

/** @audit default D05 schema-mismatched default with no Value injection */
export function D05() {
  return <Form jsonSchema={schema} defaultValue={{ name: 7, count: 'bad' }} onChange={value => inspect('change', value)} />;
}

/** @audit default D06 schema-mismatched default with explicit Value */
export function D06() {
  return <Form<typeof schema, Profile> jsonSchema={schema} defaultValue={{ name: 7, count: 'bad' }} />;
}

/** @audit default D07 nullable object tuple without a default */
export function D07() {
  return <Form jsonSchema={nullableSchema} onChange={value => inspect('change', value)} />;
}

/** @audit default D08 deprecated nullable flag without a default */
export function D08() {
  return <Form jsonSchema={nullableFlagSchema} onChange={value => inspect('change', value)} />;
}

/** @audit default D09 nullable string tuple without a default */
export function D09() {
  return <Form jsonSchema={nullableStringSchema} onChange={value => inspect('change', value)} />;
}

/** @audit default D10 readonly literal object default */
export function D10() {
  return <Form jsonSchema={schema} defaultValue={readonlyInitial} onChange={value => inspect('change', value)} />;
}

/** @audit default D11 nullable schema with null-only default */
export function D11() {
  return <Form jsonSchema={nullableSchema} defaultValue={null} onChange={value => inspect('change', value)} />;
}

/** @audit default D12 nullable schema with a typed object-or-null default */
export function D12() {
  return <Form jsonSchema={nullableSchema} defaultValue={nullableInitial} onChange={value => inspect('change', value)} />;
}

/** @audit default D13 FormProps schema default rejects a wrong known property */
export function D13() {
  const props: FormProps<typeof schema> = { jsonSchema: schema, defaultValue: { name: 7 } };
  inspect('propDefault', props.defaultValue);
}

/** @audit default D14 closed FormProps rejects an extra property */
export function D14() {
  const props: FormProps<typeof closedSchema> = { jsonSchema: closedSchema, defaultValue: { name: 'Vincent', extra: true } };
  inspect('propDefault', props.defaultValue);
}

/** @audit default D15 nullable FormProps default accepts null */
export function D15() {
  const props: FormProps<typeof nullableSchema> = { jsonSchema: nullableSchema, defaultValue: null };
  inspect('propDefault', props.defaultValue);
}

/** @audit default D16 literal-only schema without a default */
export function D16() {
  return <Form jsonSchema={literalSchema} onChange={value => inspect('change', value)} />;
}

/** @audit default D17 inline oneOf without a default */
export function D17() {
  return <Form jsonSchema={branchSchema} onChange={value => inspect('change', value)} />;
}

/** @audit default D18 schema-only FormProps permits a missing required field */
export function D18() {
  const props: FormProps<typeof schema> = { jsonSchema: schema, defaultValue: {} };
  inspect('propDefault', props.defaultValue);
}

/** @audit default D19 satisfies JSONSchema without as const and without default */
export function D19() {
  return <Form jsonSchema={contextualSchema} onChange={value => inspect('change', value)} />;
}

/** @audit default D20 satisfies JSONSchema without as const and with concrete default */
export function D20() {
  return <Form jsonSchema={contextualSchema} defaultValue={initial} onChange={value => inspect('change', value)} />;
}

/** @audit default D21 nullable object FormProps rejects a mismatched known property */
export function D21() {
  const props: FormProps<typeof nullableSchema> = { jsonSchema: nullableSchema, defaultValue: { name: 7 } };
  inspect('propDefault', props.defaultValue);
}

/** @audit default D22 nullable string FormProps rejects a mismatched number */
export function D22() {
  const props: FormProps<typeof nullableStringSchema> = { jsonSchema: nullableStringSchema, defaultValue: 7 };
  inspect('propDefault', props.defaultValue);
}
