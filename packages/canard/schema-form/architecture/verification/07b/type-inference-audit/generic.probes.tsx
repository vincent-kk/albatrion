import { useRef } from 'react';
import { Form, type FormHandle, type FormProps, type FormChildrenProps } from '@canard/schema-form_0.16.0';
import { schema, looseSchema, contextualSchema, nullableSchema, nullableFlagSchema, nullableStringSchema, initial, nullableInitial, type Profile, inspect } from './fixtures';

/** @audit generic G01 explicit object Value with as const schema */
export function G01() {
  const ref = useRef<FormHandle<typeof schema, Profile>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof schema, Profile> jsonSchema={schema} defaultValue={initial} ref={ref}
    onChange={value => inspect('change', value)} onSubmit={value => inspect('submit', value)} />;
}

/** @audit generic G02 explicit object Value without as const schema */
export function G02() {
  const ref = useRef<FormHandle<typeof looseSchema, Profile>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof looseSchema, Profile> jsonSchema={looseSchema} defaultValue={initial} ref={ref}
    onChange={value => inspect('change', value)} />;
}

/** @audit generic G03 explicit nullable object Value with type tuple */
export function G03() {
  const ref = useRef<FormHandle<typeof nullableSchema, Profile | null>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof nullableSchema, Profile | null> jsonSchema={nullableSchema} defaultValue={null} ref={ref}
    onChange={value => inspect('change', value)} />;
}

/** @audit generic G04 explicit nullable object Value with nullable flag */
export function G04() {
  const ref = useRef<FormHandle<typeof nullableFlagSchema, Profile | null>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof nullableFlagSchema, Profile | null> jsonSchema={nullableFlagSchema} defaultValue={nullableInitial} ref={ref}
    onChange={value => inspect('change', value)} />;
}

/** @audit generic G05 explicit nullable scalar Value */
export function G05() {
  const ref = useRef<FormHandle<typeof nullableStringSchema, string | null>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof nullableStringSchema, string | null> jsonSchema={nullableStringSchema} defaultValue={null} ref={ref}
    onChange={value => inspect('change', value)} />;
}

/** @audit generic G06 explicit Value rejects a mismatched default */
export function G06() {
  return <Form<typeof schema, Profile> jsonSchema={schema} defaultValue={{ name: 'Vincent', count: 'bad' }} />;
}

/** @audit generic G07 explicit Value rejects an incompatible handle */
export function G07() {
  const ref = useRef<FormHandle<typeof schema, string>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof schema, Profile> jsonSchema={schema} defaultValue={initial} ref={ref} />;
}

/** @audit generic G08 explicit handle Value rejects a mismatched setter */
export function G08() {
  const ref = useRef<FormHandle<typeof schema, Profile>>(null);
  ref.current!.setValue({ name: 'Vincent', count: 'bad' });
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof schema, Profile> jsonSchema={schema} ref={ref} />;
}

/** @audit generic G09 explicit FormProps retains exact callback values */
export function G09() {
  const props: FormProps<typeof schema, Profile> = {
    jsonSchema: schema, defaultValue: initial,
    onChange: value => inspect('change', value),
    onSubmit: value => inspect('submit', value),
    children: child => { inspect('childValue', child.value); return null; },
  };
  inspect('propDefault', props.defaultValue);
  return <Form<typeof schema, Profile> {...props} />;
}

/** @audit generic G10 explicit Value deliberately overrides schema shape */
export function G10() {
  const ref = useRef<FormHandle<typeof schema, string>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof schema, string> jsonSchema={schema} defaultValue="override" ref={ref}
    onChange={value => inspect('change', value)} />;
}

/** @audit generic G11 explicit Schema only leaves the default Value loose */
export function G11() {
  const ref = useRef<FormHandle<typeof schema>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof schema> jsonSchema={schema} defaultValue={initial} ref={ref}
    onChange={value => inspect('change', value)} />;
}

/** @audit generic G12 explicit FormChildrenProps Value */
export function G12() {
  const child: FormChildrenProps<typeof schema, Profile> = { jsonSchema: schema, defaultValue: initial, value: initial };
  inspect('childValue', child.value);
  inspect('childDefault', child.defaultValue);
}

/** @audit generic G13 explicit Value with satisfies JSONSchema without as const */
export function G13() {
  const ref = useRef<FormHandle<typeof contextualSchema, Profile>>(null);
  inspect('getValue', ref.current!.getValue());
  return <Form<typeof contextualSchema, Profile> jsonSchema={contextualSchema} defaultValue={initial} ref={ref}
    onChange={value => inspect('change', value)} onSubmit={value => inspect('submit', value)} />;
}
