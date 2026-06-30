import { type ChangeEvent, type FC, useLayoutEffect, useRef } from 'react';

import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * User-interaction fidelity with real DOM events (userEvent).
 *
 * This suite drives custom FormTypeInputs (supplied through
 * `formTypeInputDefinitions`, matched by schema `format`) and asserts BOTH the
 * rendered DOM AND the node tree after each interaction. The cases mirror
 * stories/22.StringUsecase and stories/24.ControlledUsecase:
 *
 *  - `options.trim` trims `node.value` on blur (StringNode subscribes to the
 *    `Blurred` event the wrapper publishes). The trim re-emits with the DEFAULT
 *    option set — which carries NO `Refresh` bit. So a CONTROLLED input (reads
 *    `value={node.value}`) reflects the trim after the UpdateValue re-render,
 *    while an UNCONTROLLED input (seeded once via `defaultValue`) keeps the
 *    user-typed whitespace in the DOM even though the tree is trimmed. That
 *    DOM/tree divergence is the documented uncontrolled-refresh contract
 *    (GAP-9), not a bug — pinned here on purpose.
 *  - Caret preservation: a formatter that inserts characters (card dashes) or
 *    removes them (textarea blank-line normalisation) must leave `selectionStart`
 *    at the logical caret, not strand it at 0 / past the inserted glyph.
 *  - `handle.focus(path)` / `handle.select(path)` publish RequestFocus /
 *    RequestSelect; `useFormTypeInputControl` resolves the FIRST
 *    `input, textarea, button` in the field wrapper. So focus lands on the text
 *    input of a multi-input FormTypeInput, works on a button-only FormTypeInput,
 *    and `select` degrades gracefully where the resolved element has no
 *    `select()` method.
 */

// ---------------------------------------------------------------------------
// Custom FormTypeInputs (supplied via formTypeInputDefinitions, matched by
// schema `format`). Every input stamps `id={props.path}` so the harness
// field/value helpers can address it.
// ---------------------------------------------------------------------------

const ControlledStringInput: FC<FormTypeInputProps<string>> = (props) => (
  <input
    id={props.path}
    type="text"
    value={props.value ?? ''}
    onChange={(e) => props.onChange(e.target.value)}
  />
);

const UncontrolledStringInput: FC<FormTypeInputProps<string>> = (props) => (
  <input
    id={props.path}
    type="text"
    defaultValue={props.defaultValue ?? ''}
    onChange={(e) => props.onChange(e.target.value)}
  />
);

const formatCard = (raw: string): string =>
  raw
    .replace(/[^0-9]/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1-');

/** Controlled card input that reinstates the caret after dash insertion. */
const CardFormatterInput: FC<FormTypeInputProps<string>> = (props) => {
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (caret.current != null && ref.current) {
      ref.current.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  });
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const selectionStart = el.selectionStart ?? el.value.length;
    const digitsBefore = el.value
      .slice(0, selectionStart)
      .replace(/[^0-9]/g, '').length;
    const next = formatCard(el.value);
    let pos = 0;
    let seen = 0;
    while (pos < next.length && seen < digitsBefore) {
      const code = next.charCodeAt(pos);
      if (code >= 48 && code <= 57) seen++;
      pos++;
    }
    if (next[pos] === '-') pos++;
    caret.current = pos;
    props.onChange(next);
  };
  return (
    <input
      id={props.path}
      ref={ref}
      type="text"
      value={props.value ?? ''}
      onChange={handleChange}
    />
  );
};

const normalizeMemo = (raw: string): string => raw.replace(/\n{3,}/g, '\n\n');

/** Controlled textarea that squashes 3+ blank lines and keeps the caret. */
const TextareaFormatterInput: FC<FormTypeInputProps<string>> = (props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (caret.current != null && ref.current) {
      ref.current.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  });
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    const selectionStart = el.selectionStart ?? el.value.length;
    caret.current = normalizeMemo(el.value.slice(0, selectionStart)).length;
    props.onChange(normalizeMemo(el.value));
  };
  return (
    <textarea
      id={props.path}
      ref={ref}
      value={props.value ?? ''}
      onChange={handleChange}
    />
  );
};

/** Two text inputs in one FormTypeInput; the area input carries `id={path}`. */
const PhoneMultiInput: FC<FormTypeInputProps<string>> = (props) => {
  const digits = (props.value ?? '').replace(/[^0-9]/g, '');
  const area = digits.slice(0, 3);
  const line = digits.slice(3, 7);
  return (
    <div>
      <input
        id={props.path}
        type="text"
        value={area}
        onChange={(e) =>
          props.onChange(
            `${e.target.value.replace(/[^0-9]/g, '').slice(0, 3)}-${line}`.replace(
              /-$/,
              '',
            ),
          )
        }
      />
      <span>-</span>
      <input
        id={`${props.path}::line`}
        type="text"
        value={line}
        onChange={(e) =>
          props.onChange(
            `${area}-${e.target.value.replace(/[^0-9]/g, '').slice(0, 4)}`.replace(
              /^-/,
              '',
            ),
          )
        }
      />
    </div>
  );
};

/** Button-only FormTypeInput: focus works, select has no selectable element. */
const ButtonOnlyInput: FC<FormTypeInputProps<string>> = (props) => (
  <button
    id={props.path}
    type="button"
    onClick={() => props.onChange('clicked')}
  >
    action
  </button>
);

/** input + button: the text input is the first focusable element. */
const MixedInputButton: FC<FormTypeInputProps<string>> = (props) => (
  <div>
    <input
      id={props.path}
      type="text"
      value={props.value ?? ''}
      onChange={(e) => props.onChange(e.target.value)}
    />
    <button type="button" onClick={() => props.onChange('btn')}>
      go
    </button>
  </div>
);

const defs: FormTypeInputDefinition[] = [
  { test: { format: 'ctrl' }, Component: ControlledStringInput },
  { test: { format: 'unctrl' }, Component: UncontrolledStringInput },
  { test: { format: 'card' }, Component: CardFormatterInput },
  { test: { format: 'memo' }, Component: TextareaFormatterInput },
  { test: { format: 'phone' }, Component: PhoneMultiInput },
  { test: { format: 'btn' }, Component: ButtonOnlyInput },
  { test: { format: 'mixed' }, Component: MixedInputButton },
];

// ---------------------------------------------------------------------------
// Schemas (compact, one field each — mirroring the stories)
// ---------------------------------------------------------------------------

const trimControlledSchema = {
  type: 'object',
  properties: {
    text: { type: 'string', format: 'ctrl', options: { trim: true } },
  },
} satisfies JsonSchema;

const trimUncontrolledSchema = {
  type: 'object',
  properties: {
    text: { type: 'string', format: 'unctrl', options: { trim: true } },
  },
} satisfies JsonSchema;

const noTrimControlledSchema = {
  type: 'object',
  properties: { text: { type: 'string', format: 'ctrl' } },
} satisfies JsonSchema;

const noTrimUncontrolledSchema = {
  type: 'object',
  properties: { text: { type: 'string', format: 'unctrl' } },
} satisfies JsonSchema;

const cardSchema = {
  type: 'object',
  properties: { card: { type: 'string', format: 'card' } },
} satisfies JsonSchema;

const memoSchema = {
  type: 'object',
  properties: { memo: { type: 'string', format: 'memo' } },
} satisfies JsonSchema;

const focusSchema = {
  type: 'object',
  properties: { text: { type: 'string', format: 'ctrl' } },
} satisfies JsonSchema;

const phoneSchema = {
  type: 'object',
  properties: { phone: { type: 'string', format: 'phone' } },
} satisfies JsonSchema;

const buttonSchema = {
  type: 'object',
  properties: { action: { type: 'string', format: 'btn' } },
} satisfies JsonSchema;

const mixedSchema = {
  type: 'object',
  properties: { mixed: { type: 'string', format: 'mixed' } },
} satisfies JsonSchema;

// ---------------------------------------------------------------------------

describe('controlled-interaction: trim on blur (options.trim)', () => {
  it('trims a controlled input on blur in BOTH the tree and the DOM', async () => {
    const form = await renderForm(trimControlledSchema, {
      formTypeInputDefinitions: defs,
    });

    await form.type('/text', '  abc  ');
    expect(form.value('/text')).toBe('  abc  ');
    expect(form.node('/text')?.value).toBe('  abc  ');

    await form.user.tab();
    await form.flush();

    // Tree trimmed AND controlled DOM reflects it (UpdateValue re-render).
    expect(form.node('/text')?.value).toBe('abc');
    expect(form.getValue()?.text).toBe('abc');
    expect(form.value('/text')).toBe('abc');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('trims the tree on blur but the UNCONTROLLED DOM keeps the typed whitespace', async () => {
    const form = await renderForm(trimUncontrolledSchema, {
      formTypeInputDefinitions: defs,
    });

    await form.type('/text', '  abc  ');
    expect(form.value('/text')).toBe('  abc  ');
    expect(form.node('/text')?.value).toBe('  abc  ');

    await form.user.tab();
    await form.flush();

    // Trim emits without Refresh → uncontrolled input is NOT remounted.
    expect(form.node('/text')?.value).toBe('abc');
    expect(form.getValue()?.text).toBe('abc');
    expect(form.value('/text')).toBe('  abc  ');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('leaves whitespace intact on blur when trim is off (controlled)', async () => {
    const form = await renderForm(noTrimControlledSchema, {
      formTypeInputDefinitions: defs,
    });

    await form.type('/text', '  abc  ');
    await form.user.tab();
    await form.flush();

    expect(form.node('/text')?.value).toBe('  abc  ');
    expect(form.value('/text')).toBe('  abc  ');
  });

  it('leaves whitespace intact on blur when trim is off (uncontrolled)', async () => {
    const form = await renderForm(noTrimUncontrolledSchema, {
      formTypeInputDefinitions: defs,
    });

    await form.type('/text', '  abc  ');
    await form.user.tab();
    await form.flush();

    expect(form.node('/text')?.value).toBe('  abc  ');
    expect(form.value('/text')).toBe('  abc  ');
  });
});

describe('controlled-interaction: caret preservation while formatting', () => {
  it('keeps the caret past an auto-inserted card dash', async () => {
    const form = await renderForm(cardSchema, {
      formTypeInputDefinitions: defs,
    });

    await form.type('/card', '12345');

    // formatter inserted a dash after the 4th digit.
    expect(form.value('/card')).toBe('1234-5');
    expect(form.node('/card')?.value).toBe('1234-5');
    // caret advanced past the inserted dash (index 6), not stranded at 4 / 0.
    expect((form.field('/card') as HTMLInputElement).selectionStart).toBe(6);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('normalises 3+ blank lines in a textarea while keeping the caret at the end', async () => {
    const form = await renderForm(memoSchema, {
      formTypeInputDefinitions: defs,
    });

    await form.type('/memo', 'a{Enter}{Enter}{Enter}{Enter}b');

    // 4 consecutive newlines collapsed to 2.
    expect(form.value('/memo')).toBe('a\n\nb');
    expect(form.node('/memo')?.value).toBe('a\n\nb');
    // caret rests at the logical end of the normalised text (length 4).
    expect(
      (form.field('/memo') as unknown as HTMLTextAreaElement).selectionStart,
    ).toBe(4);
    expect(form.caughtErrors()).toEqual([]);
  });
});

describe('controlled-interaction: imperative focus / select', () => {
  const drive = async (fn: () => void): Promise<void> => {
    await act(async () => {
      fn();
      await new Promise((r) => setTimeout(r, 0));
    });
  };

  it('handle.focus drives document.activeElement to a single text input', async () => {
    const form = await renderForm(focusSchema, {
      formTypeInputDefinitions: defs,
      defaultValue: { text: 'hello' },
    });

    expect(form.value('/text')).toBe('hello');
    await drive(() => form.handle.focus('/text'));

    expect(document.activeElement).toBe(form.field('/text'));
    expect(form.caughtErrors()).toEqual([]);
  });

  it('handle.select selects the full text of a single input', async () => {
    const form = await renderForm(focusSchema, {
      formTypeInputDefinitions: defs,
      defaultValue: { text: 'hello' },
    });

    await drive(() => form.handle.select('/text'));

    const el = form.field('/text') as HTMLInputElement;
    expect(el.selectionStart).toBe(0);
    expect(el.selectionEnd).toBe('hello'.length);
  });

  it('focus on a multi-input FormTypeInput resolves to the first text input', async () => {
    const form = await renderForm(phoneSchema, {
      formTypeInputDefinitions: defs,
      defaultValue: { phone: '010-1234' },
    });

    // first input (area) carries id={path} and shows the 3-digit area code.
    expect(form.value('/phone')).toBe('010');
    await drive(() => form.handle.focus('/phone'));

    expect(document.activeElement).toBe(form.field('/phone'));
    expect(document.activeElement?.tagName).toBe('INPUT');
  });

  it('select on a multi-input FormTypeInput selects the first text input', async () => {
    const form = await renderForm(phoneSchema, {
      formTypeInputDefinitions: defs,
      defaultValue: { phone: '010-1234' },
    });

    await drive(() => form.handle.select('/phone'));

    const el = form.field('/phone') as HTMLInputElement;
    expect(el.selectionStart).toBe(0);
    expect(el.selectionEnd).toBe('010'.length);
  });

  it('focus works on a button-only FormTypeInput', async () => {
    const form = await renderForm(buttonSchema, {
      formTypeInputDefinitions: defs,
    });

    await drive(() => form.handle.focus('/action'));

    expect(document.activeElement).toBe(form.field('/action'));
    expect(document.activeElement?.tagName).toBe('BUTTON');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('select degrades gracefully on a button-only FormTypeInput', async () => {
    const form = await renderForm(buttonSchema, {
      formTypeInputDefinitions: defs,
    });

    // resolved element is a <button> with no select() — must not throw.
    await drive(() => form.handle.select('/action'));

    expect(form.exists('/action')).toBe(true);
    expect(form.node('/action')?.value).toBeUndefined();
    expect(form.caughtErrors()).toEqual([]);
  });

  it('focus on a mixed (input + button) FormTypeInput lands on the text input', async () => {
    const form = await renderForm(mixedSchema, {
      formTypeInputDefinitions: defs,
      defaultValue: { mixed: 'hi' },
    });

    await drive(() => form.handle.focus('/mixed'));

    expect(document.activeElement).toBe(form.field('/mixed'));
    expect(document.activeElement?.tagName).toBe('INPUT');
  });
});
