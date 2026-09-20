import { type ReactNode, useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  type JSONSchemaError,
  registerPlugin,
} from '../src';
import { nodeFromJSONSchema } from '../src/core';
import StoryLayout from './components/StoryLayout';
import { plugin as validatorPlugin } from './components/validator';

registerPlugin(validatorPlugin);

export default {
  title: 'Form/43. NullBranchPattern',
};

/**
 * The standard JSON Schema way to let a nullable object with `oneOf` validate
 * as `null`: one `{ type: 'null' }` branch, and object branches that declare
 * `type: 'object'`. Every story mirrors an automated test — the `equivalent:`
 * comment names the covering file#case. What to look at is written above each
 * form.
 */

type Branches = NonNullable<JSONSchema['oneOf']>;

/** Object branches that narrow the nullable parent to `object`; `kind` selects the one shown. */
const objectBranches: Branches = [
  {
    type: 'object',
    '&if': "./kind === 'a'",
    properties: { aValue: { type: 'string', minLength: 3 } },
  },
  {
    type: 'object',
    '&if': "./kind === 'b'",
    properties: { bValue: { type: 'string' } },
  },
];

/**
 * Wraps `target` — the object under demonstration — in a root form schema.
 * @param target - Schema of the object the story is about
 */
const formOf = (target: JSONSchema): JSONSchema => ({
  type: 'object',
  properties: { target },
});

/**
 * A nullable object with a `kind` selector and the given composition.
 * @param scope - Composition keyword carrying the branches
 * @param branches - The branches, null branch included
 */
const nullableTarget = (
  scope: 'oneOf' | 'anyOf',
  branches: Branches,
): JSONSchema =>
  formOf({
    type: ['object', 'null'],
    properties: { kind: { type: 'string', enum: ['a', 'b'], default: 'a' } },
    [scope]: branches,
  });

/**
 * One form with its value and error panels and the buttons that move the object between `null` and a value.
 * @param jsonSchema - Root schema; the object under demonstration is `/target`
 * @param defaultValue - Value the form starts from
 * @param expectation - What the viewer should see, shown above the form
 */
const Demo = ({
  jsonSchema,
  defaultValue,
  expectation,
}: {
  jsonSchema: JSONSchema;
  defaultValue?: Record<string, unknown>;
  expectation: ReactNode;
}) => {
  const formHandle = useRef<FormHandle<JSONSchema>>(null);
  const [value, setValue] = useState<unknown>(defaultValue ?? {});
  const [errors, setErrors] = useState<JSONSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <p>{expectation}</p>
      <Form
        ref={formHandle}
        jsonSchema={jsonSchema}
        defaultValue={defaultValue}
        onChange={setValue}
        onValidate={setErrors}
        showError
      />
      <button onClick={() => formHandle.current?.setValue({ target: null })}>
        setValue(&#123; target: null &#125;)
      </button>
      <button onClick={() => formHandle.current?.reset()}>reset()</button>
      <button onClick={() => formHandle.current?.validate()}>validate()</button>
    </StoryLayout>
  );
};

// equivalent: nullable.object-null-branch.render.test.tsx — "null branch first" #1-2, "promotes a null…", "validates after the object is assigned null…"
export const NullBranchFirst = () => (
  <Demo
    jsonSchema={nullableTarget('oneOf', [{ type: 'null' }, ...objectBranches])}
    defaultValue={{ target: null }}
    expectation={
      <>
        Starts as <code>target: null</code> with no errors, and the blank form
        of branch a is shown. Typing into aValue promotes the object; the null
        button brings <code>null</code> back without errors; reset() returns to
        the seeded <code>null</code>. Switching kind to b shows bValue.
      </>
    }
  />
);

// equivalent: nullable.object-null-branch.render.test.tsx — "null branch last" #1-3
export const NullBranchLast = () => (
  <Demo
    jsonSchema={nullableTarget('oneOf', [...objectBranches, { type: 'null' }])}
    defaultValue={{ target: null }}
    expectation={
      <>
        Same behavior as NullBranchFirst: where the null branch sits does not
        matter, and it never becomes the shown branch.
      </>
    }
  />
);

// equivalent: nullable.object-null-branch.render.test.tsx — "validates null and an object value with anyOf as well"
export const NullBranchWithAnyOf = () => (
  <Demo
    jsonSchema={nullableTarget('anyOf', [{ type: 'null' }, ...objectBranches])}
    defaultValue={{ target: null }}
    expectation={
      <>
        <code>anyOf</code> with the same branches: <code>null</code> and an
        object value both validate.
      </>
    }
  />
);

// equivalent: nullable.object-null-branch.render.test.tsx — "routes a constraint violation inside an object branch to that field"
export const BranchMismatchIsReported = () => (
  <Demo
    jsonSchema={nullableTarget('oneOf', [{ type: 'null' }, ...objectBranches])}
    defaultValue={{ target: { kind: 'a', aValue: 'x' } }}
    expectation={
      <>
        aValue is shorter than 3, so the object fails its <code>oneOf</code>.
        Press validate() or edit aValue: the error panel lists every branch that
        did not match: aValue&apos;s <code>minLength</code>, the null
        branch&apos;s &quot;must be null&quot; on <code>/target</code>, and the{' '}
        <code>oneOf</code> error. Make aValue 3 characters long and all three
        disappear.
      </>
    }
  />
);

// equivalent: ObjectNode.composition.nullUnreachableWarning.test.ts — "type 없는 분기는 모두 null에 맞으므로 경고해야 함"
export const NullUnreachableWarning = () => (
  <Demo
    jsonSchema={nullableTarget('oneOf', [
      { '&if': "./kind === 'a'", properties: { aValue: { type: 'string' } } },
      { '&if': "./kind === 'b'", properties: { bValue: { type: 'string' } } },
    ])}
    defaultValue={{ target: null }}
    expectation={
      <>
        No null branch, and branches without <code>type</code>: both match{' '}
        <code>null</code>, so <code>oneOf</code> rejects it. Press validate():
        the error panel shows the <code>oneOf</code> error for the seeded{' '}
        <code>null</code>, and the browser console prints{' '}
        <code>NULLABLE_ONE_OF_NULL_UNREACHABLE</code> once (development builds
        only).
      </>
    }
  />
);

/**
 * The message the node tree throws for `jsonSchema`, or `undefined` when it builds.
 * `Form` isolates a failed build behind its own fallback text, so the story builds the tree once more to show why.
 * @param jsonSchema - Root schema to build
 */
const buildFailureOf = (jsonSchema: JSONSchema) => {
  try {
    nodeFromJSONSchema({ jsonSchema, onChange: () => {} });
    return undefined;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
};

// equivalent: ObjectNode.composition.typeNarrowing.test.ts — "부모를 넓히거나 다른 타입을 말하는 분기는 거부되어야 함: 'object' × 'null'"
export const NarrowingNeedsNullableParent = () => {
  const jsonSchema = formOf({
    type: 'object',
    properties: { kind: { type: 'string', enum: ['a', 'b'], default: 'a' } },
    oneOf: [{ type: 'null' }, ...objectBranches],
  });
  return (
    <StoryLayout jsonSchema={jsonSchema}>
      <p>
        The parent is not nullable, so a <code>null</code> branch widens it. The
        form is not built — it shows its fallback text — and the error below
        explains why.
      </p>
      <Form jsonSchema={jsonSchema} />
      <pre style={{ whiteSpace: 'pre-wrap' }}>{buildFailureOf(jsonSchema)}</pre>
    </StoryLayout>
  );
};
