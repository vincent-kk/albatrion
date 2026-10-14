import { Form } from '@canard/schema-form_0.16.0';
import { schema, looseSchema, contextualSchema, nullableSchema, nullableFlagSchema, nullableStringSchema, singleTypeArraySchema, literalSchema, branchSchema, initial, type Profile, inspect } from './fixtures';

/** @audit handlers H01 as const schema and all inline callbacks */
export function H01() {
  return <Form jsonSchema={schema} 
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H02 schema without as const and all inline callbacks */
export function H02() {
  return <Form jsonSchema={looseSchema} 
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H03 as const schema and concrete default */
export function H03() {
  return <Form jsonSchema={schema} defaultValue={initial}
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H04 schema without as const and concrete default */
export function H04() {
  return <Form jsonSchema={looseSchema} defaultValue={initial}
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H05 explicit Value and all inline callbacks */
export function H05() {
  return <Form<typeof schema, Profile> jsonSchema={schema} defaultValue={initial}
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H06 nullable object tuple and all inline callbacks */
export function H06() {
  return <Form jsonSchema={nullableSchema} 
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H07 deprecated nullable flag and all inline callbacks */
export function H07() {
  return <Form jsonSchema={nullableFlagSchema} 
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H08 children-only contextual value inference */
export function H08() {
  return <Form jsonSchema={schema} defaultValue={initial}>{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H09 formatError callback carries a node value */
export function H09() {
  return <Form jsonSchema={schema} defaultValue={initial} formatError={(error, node, context) => {
    inspect('formatError', error);
    inspect('formatNodeValue', node.value);
    inspect('formatContext', context);
    const acceptedValue: string | number | boolean | unknown[] | Record<string, unknown> | null | undefined = node.value;
    inspect('formatValueSink', acceptedValue);
    return 'invalid';
  }} />;
}

/** @audit handlers H10 literal-only schema callbacks */
export function H10() {
  return <Form jsonSchema={literalSchema} 
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H11 inline oneOf callbacks */
export function H11() {
  return <Form jsonSchema={branchSchema} 
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H12 single-member type array callbacks */
export function H12() {
  return <Form jsonSchema={singleTypeArraySchema} 
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H13 nullable scalar explicit Value callbacks */
export function H13() {
  return <Form<typeof nullableStringSchema, string | null> jsonSchema={nullableStringSchema} defaultValue={null}
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
    onStateChange={state => inspect('state', state)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H14 satisfies JSONSchema without as const and all inline callbacks */
export function H14() {
  return <Form jsonSchema={contextualSchema}
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H15 satisfies JSONSchema without as const and a concrete default */
export function H15() {
  return <Form jsonSchema={contextualSchema} defaultValue={initial}
    onChange={value => inspect('change', value)}
    onSubmit={value => inspect('submit', value)}
    onValidate={errors => inspect('validate', errors)}
  >{props => {
    inspect('childValue', props.value);
    inspect('childDefault', props.defaultValue);
    return null;
  }}</Form>;
}

/** @audit handlers H16 validation error array mutation */
export function H16() {
  return <Form jsonSchema={schema} onValidate={errors => {
    inspect('validate', errors);
    errors.push({ dataPath: '/name', message: 'invalid' });
  }} />;
}

/** @audit handlers H17 validation details passed to a concrete string sink */
export function H17() {
  return <Form jsonSchema={schema} onValidate={errors => {
    inspect('validationDetail', errors[0].details?.actual);
    const actual: string = errors[0].details?.actual;
    inspect('stringSink', actual);
  }} />;
}

/** @audit handlers H18 state callback reads and updates a numeric flag */
export function H18() {
  return <Form jsonSchema={schema} onStateChange={state => {
    inspect('state', state);
    inspect('stateFlag', state[1]);
    state[1] = false;
  }} />;
}
