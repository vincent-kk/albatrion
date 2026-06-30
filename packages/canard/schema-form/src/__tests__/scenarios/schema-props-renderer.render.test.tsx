import { type ReactNode } from 'react';

import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import type { FormTypeInputProps, FormTypeRendererProps } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Props plumbing + renderer variants (mirrors stories 23 / 33 / 18 and the
 * default FormTypeInput date-format family).
 *
 * Two seams are exercised here, both verified against src/:
 *   - `SchemaNodeProxy` spreads `{...node.jsonSchema.FormTypeRendererProps}`
 *     into the (Custom)FormTypeRenderer, so caption/highlightColor/padding and
 *     ReactNode helperText/description reach the renderer.
 *   - `SchemaNodeInput` spreads `{...node.jsonSchema.FormTypeInputProps}` into
 *     the FormTypeInput, so prefix/placeholder/maxLength reach the input.
 *
 * The default `FormGroupRenderer` does NOT read helperText/description, so the
 * ReactNode tests supply a `CustomFormTypeRenderer` that renders them (exactly
 * like story 33). Every test asserts BOTH the rendered DOM AND the node tree.
 */

// ---------------------------------------------------------------------------
// Custom renderer + input (read schema-level extra props, expose DOM hooks)
// ---------------------------------------------------------------------------

type RendererExtra = FormTypeRendererProps & {
  caption?: string;
  highlightColor?: string;
  padding?: number;
  helperText?: ReactNode;
  description?: ReactNode;
};

/** Reads jsonSchema.FormTypeRendererProps and renders them with DOM hooks. */
const TestRenderer = ({
  depth,
  path,
  name,
  Input,
  errorMessage,
  caption,
  highlightColor,
  padding,
  helperText,
  description,
}: RendererExtra) => {
  // Root just renders children (mirrors story 23/33 depth === 0 branch).
  if (depth === 0) return <Input />;
  return (
    <div
      data-testid={`renderer${path}`}
      data-highlight={highlightColor}
      data-padding={padding == null ? undefined : String(padding)}
    >
      <span data-testid={`name${path}`}>{name}</span>
      {description != null && (
        <div data-testid={`desc${path}`}>{description}</div>
      )}
      {caption != null && <div data-testid={`caption${path}`}>{caption}</div>}
      <Input />
      {helperText != null && (
        <div data-testid={`helper${path}`}>{helperText}</div>
      )}
      {errorMessage ? <em>{errorMessage}</em> : null}
    </div>
  );
};

type InputExtra = FormTypeInputProps<string> & {
  prefix?: string;
  placeholder?: string;
  maxLength?: number;
};

/** Reads jsonSchema.FormTypeInputProps; sets id={path} so the harness can read it. */
const FancyInput = ({
  path,
  value,
  onChange,
  prefix,
  placeholder,
  maxLength,
}: InputExtra) => (
  <div>
    {prefix ? <span data-testid={`prefix${path}`}>{prefix}</span> : null}
    <input
      id={path}
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// ---------------------------------------------------------------------------
// FormTypeRendererProps reach a CustomFormTypeRenderer (story 23)
// ---------------------------------------------------------------------------

describe('jsonSchema.FormTypeRendererProps -> CustomFormTypeRenderer', () => {
  it('passes caption / highlightColor / padding to the renderer (DOM + tree)', async () => {
    const schema = {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          default: 'hello',
          FormTypeRendererProps: {
            highlightColor: 'tomato',
            caption: 'renderer caption from schema',
            padding: 10,
          },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      CustomFormTypeRenderer: TestRenderer,
    });

    // DOM: the renderer rendered the schema-level props.
    expect(
      form.container.querySelector('[data-testid="caption/title"]'),
    ).toHaveTextContent('renderer caption from schema');
    expect(
      form.container.querySelector('[data-testid="renderer/title"]'),
    ).toHaveAttribute('data-highlight', 'tomato');
    expect(
      form.container.querySelector('[data-testid="renderer/title"]'),
    ).toHaveAttribute('data-padding', '10');
    expect(form.value('/title')).toBe('hello');

    // tree: the node carries the props on its schema and the seeded value.
    expect(form.node('/title')?.jsonSchema.FormTypeRendererProps?.caption).toBe(
      'renderer caption from schema',
    );
    expect(form.node('/title')?.value).toBe('hello');
  });

  it('gives each field its own renderer props and edits flow to the tree', async () => {
    const schema = {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          FormTypeRendererProps: {
            highlightColor: '#52c41a',
            caption: 'email cap',
          },
        },
        age: {
          type: 'number',
          FormTypeRendererProps: {
            highlightColor: '#faad14',
            caption: 'age cap',
          },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      CustomFormTypeRenderer: TestRenderer,
    });

    expect(
      form.container.querySelector('[data-testid="caption/email"]'),
    ).toHaveTextContent('email cap');
    expect(
      form.container.querySelector('[data-testid="renderer/email"]'),
    ).toHaveAttribute('data-highlight', '#52c41a');
    expect(
      form.container.querySelector('[data-testid="renderer/age"]'),
    ).toHaveAttribute('data-highlight', '#faad14');

    await form.type('/email', 'a@b.com');
    expect(form.value('/email')).toBe('a@b.com');
    expect(form.getValue()?.email).toBe('a@b.com');
  });
});

// ---------------------------------------------------------------------------
// FormTypeInputProps reach the FormTypeInput (story 23)
// ---------------------------------------------------------------------------

describe('jsonSchema.FormTypeInputProps -> FormTypeInput', () => {
  it('passes prefix / placeholder / maxLength to the input element (DOM + tree)', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          FormTypeInput: FancyInput,
          FormTypeInputProps: {
            prefix: 'USER',
            placeholder: 'enter name',
            maxLength: 20,
          },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    expect(
      form.container.querySelector('[data-testid="prefix/name"]'),
    ).toHaveTextContent('USER');
    const input = form.field('/name') as HTMLInputElement;
    expect(input).toHaveAttribute('placeholder', 'enter name');
    expect(input).toHaveAttribute('maxlength', '20');
    expect(form.exists('/name')).toBe(true);
  });

  it('routes user typing through the custom input to the node value', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          FormTypeInput: FancyInput,
          FormTypeInputProps: { prefix: 'X', placeholder: 'p' },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    await form.type('/name', 'vincent');
    expect(form.value('/name')).toBe('vincent');
    expect(form.node('/name')?.value).toBe('vincent');
    expect(form.getValue()?.name).toBe('vincent');
  });
});

// ---------------------------------------------------------------------------
// ReactNode helperText / description (story 33)
// ---------------------------------------------------------------------------

describe('ReactNode helperText / description render without corruption', () => {
  it('renders an icon + nested <a> helperText with href and text intact', async () => {
    const schema = {
      type: 'object',
      properties: {
        website: {
          type: 'string',
          FormTypeRendererProps: {
            helperText: (
              <span>
                ex:{' '}
                <a key="lnk" href="https://example.com">
                  https://example.com
                </a>
              </span>
            ),
            description: <strong>website url</strong>,
          },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      CustomFormTypeRenderer: TestRenderer,
    });

    const helper = form.container.querySelector(
      '[data-testid="helper/website"]',
    );
    expect(helper).toHaveTextContent('ex: https://example.com');
    const anchor = helper?.querySelector('a');
    expect(anchor).toHaveAttribute('href', 'https://example.com');
    expect(anchor).toHaveTextContent('https://example.com');
    expect(
      form.container.querySelector('[data-testid="desc/website"]'),
    ).toHaveTextContent('website url');

    // tree: editing the underlying field still works through the ReactNode wrapper.
    await form.type('/website', 'https://a.io');
    expect(form.node('/website')?.value).toBe('https://a.io');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('renders a styled-span description and a flex-icon helperText', async () => {
    const schema = {
      type: 'object',
      properties: {
        phone: {
          type: 'string',
          FormTypeRendererProps: {
            helperText: (
              <span style={{ display: 'flex', gap: 4 }}>
                phone <span style={{ color: '#666' }}>no hyphen</span>
              </span>
            ),
            description: <span style={{ color: '#0066cc' }}>contact</span>,
          },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      CustomFormTypeRenderer: TestRenderer,
    });

    const helper = form.container.querySelector('[data-testid="helper/phone"]');
    expect(helper).toHaveTextContent('phone no hyphen');
    expect(helper?.querySelector('span')).toBeInTheDocument();
    const desc = form.container.querySelector(
      '[data-testid="desc/phone"] span',
    );
    expect(desc).toHaveStyle({ color: '#0066cc' });
    expect(desc).toHaveTextContent('contact');
  });

  // Regression: an ancestor object carrying an extension prop used to strip
  // descendant FormTypeRendererProps/FormTypeInputProps from the child
  // node.jsonSchema (stripSchemaExtensions mutated its input in place). Fixed by
  // cloning the input before scanning. Mirrors story 33 NestedObjectWithReactNode.
  it('renders ReactNode props inside a nested object schema even when an ancestor carries extension props', async () => {
    const schema = {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          FormTypeRendererProps: { description: <h4>profile info</h4> },
          properties: {
            nickname: {
              type: 'string',
              FormTypeRendererProps: {
                helperText: <span>2-15 chars</span>,
                description: <strong>display name</strong>,
              },
            },
          },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      CustomFormTypeRenderer: TestRenderer,
    });

    // The parent branch keeps its own ReactNode description...
    expect(
      form.container.querySelector('[data-testid="desc/profile"]'),
    ).toHaveTextContent('profile info');
    // ...and the nested terminal's renderer props survive on node.jsonSchema
    // and reach the DOM (no longer stripped by the ancestor's extension prop).
    expect(
      form.node('/profile/nickname')?.jsonSchema.FormTypeRendererProps,
    ).toBeDefined();
    expect(
      form.container.querySelector('[data-testid="helper/profile/nickname"]'),
    ).toHaveTextContent('2-15 chars');
    expect(
      form.container.querySelector('[data-testid="desc/profile/nickname"]'),
    ).toHaveTextContent('display name');
  });

  it('still edits a nested field whose renderer props were stripped (tree stays correct)', async () => {
    const schema = {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          FormTypeRendererProps: { description: <h4>profile info</h4> },
          properties: {
            nickname: {
              type: 'string',
              FormTypeRendererProps: { helperText: <span>2-15 chars</span> },
            },
          },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      CustomFormTypeRenderer: TestRenderer,
    });

    // The nested field still renders an input and binds to the tree...
    expect(form.exists('/profile/nickname')).toBe(true);
    await form.type('/profile/nickname', 'neo');
    expect(form.node('/profile/nickname')?.value).toBe('neo');
    expect(form.getValue()?.profile?.nickname).toBe('neo');
    expect(form.caughtErrors()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// options.omitEmpty (story 18)
// ---------------------------------------------------------------------------

describe('options.omitEmpty controls empty-key retention', () => {
  it('omitEmpty:false keeps an emptied string key; default omits it (DOM + tree)', async () => {
    const schema = {
      type: 'object',
      properties: {
        kept: { type: 'string', options: { omitEmpty: false } },
        dropped: { type: 'string' },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    await form.type('/kept', 'a');
    await form.type('/dropped', 'b');
    expect(form.getValue()?.kept).toBe('a');
    expect(form.getValue()?.dropped).toBe('b');

    await form.clear('/kept');
    await form.clear('/dropped');

    // Both inputs remain in the DOM and are empty...
    expect(form.exists('/kept')).toBe(true);
    expect(form.exists('/dropped')).toBe(true);
    expect(form.value('/kept')).toBe('');
    expect(form.value('/dropped')).toBe('');

    // ...but only the omitEmpty:false key survives in the value.
    const value = form.getValue() ?? {};
    expect(value.kept).toBe('');
    expect('kept' in value).toBe(true);
    expect('dropped' in value).toBe(false);
  });

  it('omitEmpty:false keeps the number key present after clearing (default omits)', async () => {
    const schema = {
      type: 'object',
      properties: {
        keptNum: { type: 'number', options: { omitEmpty: false } },
        droppedNum: { type: 'number' },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    await form.type('/keptNum', '5');
    await form.type('/droppedNum', '7');
    expect(form.getValue()?.keptNum).toBe(5);
    expect(form.getValue()?.droppedNum).toBe(7);

    await form.clear('/keptNum');
    await form.clear('/droppedNum');

    expect(form.exists('/keptNum')).toBe(true);
    expect(form.value('/keptNum')).toBe('');

    const value = form.getValue() ?? {};
    expect('keptNum' in value).toBe(true);
    expect('droppedNum' in value).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Default FormTypeInput date-format family (FormTypeInputDateFormat)
// ---------------------------------------------------------------------------

describe('default date-format inputs render the correct native input type', () => {
  it('maps date / time / datetime-local / week / month to native input types (DOM + tree)', async () => {
    const schema = {
      type: 'object',
      properties: {
        d: { type: 'string', format: 'date' },
        t: { type: 'string', format: 'time' },
        dt: { type: 'string', format: 'datetime-local' },
        w: { type: 'string', format: 'week' },
        m: { type: 'string', format: 'month' },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    expect(form.field('/d')).toHaveAttribute('type', 'date');
    expect(form.field('/t')).toHaveAttribute('type', 'time');
    expect(form.field('/dt')).toHaveAttribute('type', 'datetime-local');
    expect(form.field('/w')).toHaveAttribute('type', 'week');
    expect(form.field('/m')).toHaveAttribute('type', 'month');

    // every node exists in the tree
    expect(form.exists('/d')).toBe(true);
    expect(form.exists('/m')).toBe(true);
    expect(form.node('/dt')?.schemaType).toBe('string');
  });

  it('reflects a programmatically set date value in the uncontrolled DOM input and the tree', async () => {
    const schema = {
      type: 'object',
      properties: {
        d: { type: 'string', format: 'date' },
        dt: { type: 'string', format: 'datetime-local' },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    await form.setValue({ d: '2024-01-15', dt: '2024-01-15T10:30' });

    expect(form.node('/d')?.value).toBe('2024-01-15');
    expect(form.node('/dt')?.value).toBe('2024-01-15T10:30');
    expect(form.value('/d')).toBe('2024-01-15');
    expect(form.value('/dt')).toBe('2024-01-15T10:30');
    expect(form.field('/d')).toHaveAttribute('type', 'date');
    expect(form.caughtErrors()).toEqual([]);
  });
});
