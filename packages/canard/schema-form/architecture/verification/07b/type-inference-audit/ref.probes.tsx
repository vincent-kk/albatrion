import { useRef } from 'react';
import { Form, type FormHandle } from '@canard/schema-form_0.16.0';
import { schema, looseSchema, contextualSchema, nullableSchema, nullableFlagSchema, nullableStringSchema, initial, nullableInitial, type Profile, inspect } from './fixtures';

/** @audit ref R01 unparameterized handle ref without a default */
export function R01() {
  const ref = useRef<FormHandle>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={schema} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R02 schema-parameterized handle ref without a default */
export function R02() {
  const ref = useRef<FormHandle<typeof schema>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={schema} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R03 handle ref with schema without as const */
export function R03() {
  const ref = useRef<FormHandle<typeof looseSchema>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={looseSchema} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R04 CLAUDE caveat: concrete default plus schema ref without injection */
export function R04() {
  const ref = useRef<FormHandle<typeof schema>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={schema} defaultValue={initial} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R05 concrete default plus loose schema ref without injection */
export function R05() {
  const ref = useRef<FormHandle<typeof looseSchema>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={looseSchema} defaultValue={initial} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R06 Value-injected ref also infers Form Value */
export function R06() {
  const ref = useRef<FormHandle<typeof schema, Profile>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={schema} defaultValue={initial} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R07 Value injected into both Form and handle */
export function R07() {
  const ref = useRef<FormHandle<typeof schema, Profile>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof schema, Profile> jsonSchema={schema} defaultValue={initial} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R08 schema handle setValue rejects a wrong known property */
export function R08() {
  const ref = useRef<FormHandle<typeof schema>>(null);
  ref.current!.setValue({ name: 7 });
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={schema} ref={ref} />;
}

/** @audit ref R09 schema handle setValue permits missing required fields */
export function R09() {
  const ref = useRef<FormHandle<typeof schema>>(null);
  ref.current!.setValue({});
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={schema} ref={ref} />;
}

/** @audit ref R10 nullable object tuple handle */
export function R10() {
  const ref = useRef<FormHandle<typeof nullableSchema>>(null);
  ref.current!.setValue(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={nullableSchema} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R11 deprecated nullable flag handle */
export function R11() {
  const ref = useRef<FormHandle<typeof nullableFlagSchema>>(null);
  ref.current!.setValue(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={nullableFlagSchema} ref={ref} />;
}

/** @audit ref R12 zero-argument useRef from the brief */
export function R12() {
  const ref = useRef<FormHandle<typeof schema>>();
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={schema} ref={ref} />;
}

/** @audit ref R13 callback ref gets a concrete default Value */
export function R13() {
  return <Form jsonSchema={schema} defaultValue={initial} ref={handle => {
    if (handle) inspect('getValue', handle.getValue());
  }} />;
}

/** @audit ref R14 nullable scalar handle */
export function R14() {
  const ref = useRef<FormHandle<typeof nullableStringSchema>>(null);
  ref.current!.setValue(7);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={nullableStringSchema} ref={ref} />;
}

/** @audit ref R15 schema handle node value is secondary to getValue */
export function R15() {
  const ref = useRef<FormHandle<typeof schema>>(null);
  inspect('getValue', ref.current!.getValue());
  inspect('nodeValue', ref.current!.node!.value);
  return <Form jsonSchema={schema} ref={ref} />;
}

/** @audit ref R16 nullable Value injected into Form and handle */
export function R16() {
  const ref = useRef<FormHandle<typeof nullableSchema, Profile | null>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof nullableSchema, Profile | null> jsonSchema={nullableSchema} defaultValue={nullableInitial} ref={ref} />;
}

/** @audit ref R17 nullable scalar handle node mapping */
export function R17() {
  const ref = useRef<FormHandle<typeof nullableStringSchema>>(null);
  inspect('getValue', ref.current!.getValue());
  inspect('nodeValue', ref.current!.node!.value);
  return <Form jsonSchema={nullableStringSchema} ref={ref} />;
}

/** @audit ref R18 satisfies JSONSchema without as const and schema-parameterized ref */
export function R18() {
  const ref = useRef<FormHandle<typeof contextualSchema>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={contextualSchema} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R19 satisfies JSONSchema without as const and concrete default plus ref */
export function R19() {
  const ref = useRef<FormHandle<typeof contextualSchema>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={contextualSchema} defaultValue={initial} ref={ref} onChange={value => inspect('change', value)} />;
}

/** @audit ref R20 concrete default plus unparameterized handle ref */
export function R20() {
  const ref = useRef<FormHandle>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form jsonSchema={schema} defaultValue={initial} ref={ref} onChange={value => inspect('change', value)} />;
}
