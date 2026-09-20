import { type ReactNode, useRef, useState } from 'react';

import { Form, type FormHandle, type JSONSchema, registerPlugin } from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin as validatorPlugin } from './components/validator';

registerPlugin(validatorPlugin);

export default {
  title: 'Form/42. NullableContract',
};

/**
 * The null contract of nullable objects and arrays, one clause per story:
 * `null` means the node does not exist and `{}` / `[]` that it exists empty;
 * only an intended write changes which one it is; while `null` the value is
 * `null` and the children show the blank form; the promoted value equals what
 * a form that never was `null` holds. Every story mirrors an automated test —
 * the `equivalent:` comment names the covering file#case.
 */

/** A button of a story: its label and what it does to the form. */
type Action = {
  label: string;
  run: (form: FormHandle<JSONSchema>) => void;
};

const assignNull: Action = {
  label: 'setValue({ target: null })',
  run: (form) => form.setValue({ target: null }),
};

const reset: Action = { label: 'reset()', run: (form) => form.reset() };

/**
 * One form with its value panel and the buttons that act on it.
 * @param jsonSchema - Root schema; the node under demonstration is `/target`
 * @param defaultValue - Value the form starts from
 * @param expectation - What the viewer should see, shown above the form
 * @param actions - Buttons under the form
 */
const Demo = ({
  jsonSchema,
  defaultValue,
  expectation,
  actions = [assignNull, reset],
}: {
  jsonSchema: JSONSchema;
  defaultValue?: Record<string, unknown>;
  expectation: ReactNode;
  actions?: Action[];
}) => {
  const formHandle = useRef<FormHandle<JSONSchema>>(null);
  const [value, setValue] = useState<unknown>(defaultValue ?? {});
  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <p>{expectation}</p>
      <Form
        ref={formHandle}
        jsonSchema={jsonSchema}
        defaultValue={defaultValue}
        onChange={setValue}
      />
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => formHandle.current && action.run(formHandle.current)}
        >
          {action.label}
        </button>
      ))}
    </StoryLayout>
  );
};

const blankSchema: JSONSchema = {
  type: 'object',
  properties: {
    target: {
      type: ['object', 'null'],
      properties: {
        note: { type: 'string' },
        reason: { type: 'string', default: 'because' },
      },
    },
  },
};

// equivalent: nullable.object-blank-state.render.test.tsx#1-2 (null shows the blank form; promotion = blank form + the write)
export const NullShowsTheBlankForm = () => (
  <Demo
    jsonSchema={blankSchema}
    defaultValue={{ target: { note: 'typed', reason: 'edited' } }}
    expectation={
      <>
        Press the null button: the value becomes <code>target: null</code>, note
        empties and reason goes back to its schema default <code>because</code>{' '}
        — the inputs a form without a default value shows. Then type into note:
        the value becomes{' '}
        <code>&#123; note, reason: &apos;because&apos; &#125;</code>, never the
        old <code>edited</code>.
      </>
    }
  />
);

// equivalent: nullable.object-blank-state.render.test.tsx#3 (emptying a field keeps null, and is honored on promotion)
export const EmptyingAFieldKeepsNull = () => (
  <Demo
    jsonSchema={blankSchema}
    defaultValue={{ target: null }}
    expectation={
      <>
        Starts as <code>null</code>. Delete the text of reason: a write without
        a value does not bring the object into existence, so the value stays{' '}
        <code>null</code>. Then type into note: the value is{' '}
        <code>&#123; note &#125;</code> alone — the emptied reason is
        remembered.
      </>
    }
  />
);

// equivalent: nullable.object-initial-null.render.test.tsx#2 (promotion of a seeded null) + ObjectNode.branch.nullable.promotion.test.ts
export const PromotionMatchesAFormThatNeverWasNull = () => (
  <>
    <Demo
      jsonSchema={blankSchema}
      defaultValue={{ target: null }}
      expectation={
        <>
          Seeded with <code>null</code>. Type the same text into note here and
          in the form below.
        </>
      }
    />
    <Demo
      jsonSchema={blankSchema}
      expectation={
        <>
          No default value, never <code>null</code>. After the same typing both
          value panels are identical.
        </>
      }
    />
  </>
);

// equivalent: ObjectNode.branch.nullable.automaticWrite.test.ts — "null 상태에서 derived 의존값이 바뀌어도 null이 보존되어야 함", "밖에서 자식에 값을 쓰면 null이 풀려야 함"
export const FormProducedValuesNeverPromote = () => (
  <Demo
    jsonSchema={{
      type: 'object',
      properties: {
        quantity: { type: 'number', default: 2 },
        target: {
          type: ['object', 'null'],
          properties: {
            note: { type: 'string' },
            total: {
              type: 'number',
              computed: { derived: '(../../quantity || 0) * 10' },
            },
          },
        },
      },
    }}
    defaultValue={{ target: null }}
    expectation={
      <>
        total is derived from quantity. Change quantity: total&apos;s input
        follows, but the value stays <code>target: null</code> — a value the
        form produces by itself is not an intent. Type into note: now the object
        exists and carries the derived total.
      </>
    }
  />
);

// equivalent: nullable.object-pending-read.render.test.tsx — "keeps a null seed over a nested derived field after mount", "keeps null when a dependency is typed", "promotes to what a never-null form holds"
export const NestedDerivedFieldKeepsNull = () => (
  <Demo
    jsonSchema={{
      type: 'object',
      properties: {
        quantity: { type: 'number', default: 2 },
        target: {
          type: ['object', 'null'],
          properties: {
            inner: {
              type: 'object',
              properties: {
                note: { type: 'string' },
                total: {
                  type: 'number',
                  computed: { derived: '(../../../quantity || 0) * 10' },
                },
              },
            },
          },
        },
      },
    }}
    defaultValue={{ target: null }}
    expectation={
      <>
        total sits one object deeper than in the story above, so its derived
        write waits in inner for a batched commit while the form renders and
        reads inner&apos;s value. The value is <code>target: null</code> right
        after mount and stays so when quantity changes. Type into note: the
        object exists and carries the derived total.
      </>
    }
  />
);

// equivalent: nullable.object-initial-null.render.test.tsx — "with oneOf branches whose children carry defaults" #1-4
export const SeededNullWithBranchDefaults = () => (
  <Demo
    jsonSchema={{
      type: 'object',
      properties: {
        target: {
          type: ['object', 'null'],
          properties: {
            kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
          },
          oneOf: [
            {
              '&if': "./kind === 'a'",
              properties: { aValue: { type: 'string', default: 'A' } },
            },
            {
              '&if': "./kind === 'b'",
              properties: { bValue: { type: 'string', default: 'B' } },
            },
          ],
        },
      },
    }}
    defaultValue={{ target: null }}
    expectation={
      <>
        Branch a settles with its default <code>A</code> while the value stays{' '}
        <code>null</code>. Switching kind to b is a user write: the object is
        promoted to{' '}
        <code>&#123; kind: &apos;b&apos;, bValue: &apos;B&apos; &#125;</code>.
        reset() returns to the seeded <code>null</code>.
      </>
    }
  />
);

// equivalent: ObjectNode.branch.nullable.composition.test.ts — "null이 되면 어느 분기의 자식이든 null이 되기 전의 값을 잊어야 함"
export const BranchChildrenForgetPreNullValues = () => (
  <Demo
    jsonSchema={{
      type: 'object',
      properties: {
        target: {
          type: ['object', 'null'],
          properties: {
            kind: { type: 'string', enum: ['a', 'b'], default: 'b' },
          },
          oneOf: [
            {
              '&if': "./kind === 'a'",
              properties: { aValue: { type: 'string' } },
            },
            {
              '&if': "./kind === 'b'",
              properties: { bValue: { type: 'string', default: 'B' } },
            },
          ],
        },
      },
    }}
    defaultValue={{ target: { kind: 'b', bValue: 'seeded' } }}
    expectation={
      <>
        Starts with bValue <code>seeded</code>. Press the null button: bValue
        shows its schema default <code>B</code>, not <code>seeded</code>. Switch
        kind to a and back to b: the value holds{' '}
        <code>bValue: &apos;B&apos;</code> — the seeded value does not come
        back. reset() returns to the seed.
      </>
    }
  />
);

// equivalent: ObjectNode.branch.nullable.interface.test.ts (a non-nullable object assigned null)
export const NonNullableObjectNeverHoldsNull = () => (
  <Demo
    jsonSchema={{
      type: 'object',
      properties: {
        target: {
          type: 'object',
          properties: { note: { type: 'string' } },
        },
      },
    }}
    defaultValue={{ target: { note: 'typed' } }}
    expectation={
      <>
        target is not nullable. The null button empties it, and the value never
        shows <code>target: null</code>.
      </>
    }
  />
);

/**
 * Runs `act` on the array node at `/target`, when that is what the path holds.
 * @param act - What to do with the array node
 */
const onTargetArray =
  (act: (push: () => void, clear: () => void) => void) =>
  (form: FormHandle<JSONSchema>) => {
    const node = form.findNode('/target');
    if (node?.type === 'array')
      act(
        () => node.push(),
        () => node.clear(),
      );
  };

// equivalent: ArrayNode.nullable.consistency.test.ts — "null이 출력되고 아이템이 없어야 함", "clear()는 … null을 풀지 않아야 함", "push하면 …", "명시적으로 setValue([]) 하면 빈 배열이 되어야 함"
export const NullableArray = () => (
  <Demo
    jsonSchema={{
      type: 'object',
      properties: {
        target: {
          type: ['array', 'null'],
          items: { type: 'string' },
          minItems: 2,
          options: { omitEmpty: false },
        },
      },
    }}
    defaultValue={{ target: null }}
    expectation={
      <>
        Starts as <code>null</code> with no items, even though{' '}
        <code>minItems</code> is 2. clear() writes no value, so{' '}
        <code>null</code> stays. push() is an intent: the array now exists.{' '}
        <code>setValue([])</code> makes it exist and be empty — <code>[]</code>,
        not <code>null</code>. (<code>omitEmpty: false</code> keeps the empty
        array in the value; by default an empty array is left out.)
      </>
    }
    actions={[
      assignNull,
      { label: 'clear()', run: onTargetArray((_push, clear) => clear()) },
      { label: 'push()', run: onTargetArray((push) => push()) },
      {
        label: 'setValue({ target: [] })',
        run: (form) => form.setValue({ target: [] }),
      },
      reset,
    ]}
  />
);
