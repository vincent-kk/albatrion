// Loaded by Storybook CSF through the usage glob in .storybook/main.ts; each named export is one story.
import { useRef } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Form,
  type FormHandle,
  FormProvider,
  type JSONSchema,
} from '../../src';
import { ajvValidatorPlugin } from '../components/validator';

/**
 * A oneOf whose branches are switched by `controls.active` on each branch object.
 * The form reads only the gate; the validator never sees `controls`, so each branch also tags
 * `method` with `const` to keep validation choosing the same single branch.
 */
const paymentByActive = {
  type: 'object',
  properties: {
    method: { type: 'string', enum: ['card', 'bank', 'cash'], default: 'card' },
  },
  required: ['method'],
  oneOf: [
    {
      controls: { active: "./method === 'card'" },
      properties: {
        method: { const: 'card' },
        cardNumber: { type: 'string' },
        installments: { type: 'number', default: 1 },
      },
      required: ['cardNumber'],
    },
    {
      controls: { active: "./method === 'bank'" },
      properties: {
        method: { const: 'bank' },
        bankName: { type: 'string' },
        accountNumber: { type: 'string' },
      },
      required: ['accountNumber'],
    },
    {
      controls: { active: "./method === 'cash'" },
      properties: {
        method: { const: 'cash' },
        receiptPhone: { type: 'string' },
      },
    },
  ],
} satisfies JSONSchema;

/**
 * A oneOf whose branches are switched by `controls.discriminator` on the host.
 * Each branch's `const` tag on `method` is both the form's selector and the validator's constraint.
 */
const paymentByDiscriminator = {
  type: 'object',
  controls: { discriminator: 'method' },
  properties: {
    method: { type: 'string', enum: ['card', 'bank', 'cash'], default: 'card' },
  },
  required: ['method'],
  oneOf: [
    {
      properties: {
        method: { const: 'card' },
        cardNumber: { type: 'string' },
        installments: { type: 'number', default: 1 },
      },
      required: ['cardNumber'],
    },
    {
      properties: {
        method: { const: 'bank' },
        bankName: { type: 'string' },
        accountNumber: { type: 'string' },
      },
      required: ['accountNumber'],
    },
    {
      properties: {
        method: { const: 'cash' },
        receiptPhone: { type: 'string' },
      },
    },
  ],
} satisfies JSONSchema;

/**
 * No union: every field is declared once on the object, and `controls.fields` switches groups of
 * direct children by name. `active` is an existence gate, so an inactive group leaves the form value
 * like a union branch does. The validator never sees `controls`, so this shape is a form-only
 * branch: server-side validation of the same schema accepts any combination of these fields.
 */
const paymentByFieldsActive = {
  type: 'object',
  controls: {
    fields: [
      {
        targets: ['cardNumber', 'installments'],
        controls: { active: "./method === 'card'" },
      },
      {
        targets: ['bankName', 'accountNumber'],
        controls: { active: "./method === 'bank'" },
      },
      { targets: ['receiptPhone'], controls: { active: "./method === 'cash'" } },
    ],
  },
  properties: {
    method: { type: 'string', enum: ['card', 'bank', 'cash'], default: 'card' },
    cardNumber: { type: 'string' },
    installments: { type: 'number', default: 1 },
    bankName: { type: 'string' },
    accountNumber: { type: 'string' },
    receiptPhone: { type: 'string' },
  },
  required: ['method'],
} satisfies JSONSchema;

/**
 * A oneOf whose branches are told apart by if/then/else.
 * Each branch writes `else: false` so a branch whose guard fails is rejected instead of passing
 * vacuously, and lists the guard property in `if.required` so a missing `method` never satisfies it.
 */
const paymentByIfThenElse = {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      enum: ['card', 'bank', 'cash'],
      default: 'card',
    },
  },
  required: ['method'],
  oneOf: [
    {
      if: { properties: { method: { const: 'card' } }, required: ['method'] },
      then: {
        properties: {
          cardNumber: { type: 'string' },
          installments: { type: 'number', default: 1 },
        },
        required: ['cardNumber'],
      },
      else: false,
    },
    {
      if: { properties: { method: { const: 'bank' } }, required: ['method'] },
      then: {
        properties: {
          bankName: { type: 'string' },
          accountNumber: { type: 'string' },
        },
        required: ['accountNumber'],
      },
      else: false,
    },
    {
      if: { properties: { method: { const: 'cash' } }, required: ['method'] },
      then: {
        properties: {
          receiptPhone: { type: 'string' },
        },
      },
      else: false,
    },
  ],
} satisfies JSONSchema;

/**
 * An allOf listing independent if/then rules; every rule whose guard passes applies at the same time.
 * Rule 3 shows one guard applying two settings (a new field and making the host `phone` required),
 * and rule 6 shows one guard combining two properties.
 */
const shippingSchema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      enum: ['KR', 'US', 'JP'],
      default: 'KR',
    },
    membership: {
      type: 'string',
      enum: ['basic', 'premium'],
      default: 'basic',
    },
    amount: { type: 'number', default: 30000 },
    giftWrap: { type: 'boolean', default: false },
    phone: { type: 'string' },
  },
  allOf: [
    {
      if: { properties: { country: { const: 'US' } }, required: ['country'] },
      then: {
        properties: { state: { type: 'string' } },
        required: ['state'],
      },
    },
    {
      if: {
        properties: { country: { enum: ['KR', 'JP'] } },
        required: ['country'],
      },
      then: {
        properties: { postalCode: { type: 'string' } },
      },
    },
    {
      if: {
        properties: { membership: { const: 'premium' } },
        required: ['membership'],
      },
      then: {
        properties: {
          concierge: {
            type: 'string',
            default: 'Leave at the front desk',
          },
        },
        required: ['phone'],
      },
    },
    {
      if: { properties: { giftWrap: { const: true } }, required: ['giftWrap'] },
      then: {
        properties: { giftMessage: { type: 'string' } },
      },
    },
    {
      if: {
        properties: { amount: { minimum: 100000 } },
        required: ['amount'],
      },
      then: {
        properties: {
          insurance: { type: 'boolean', default: true },
        },
      },
    },
    {
      if: {
        properties: {
          membership: { const: 'premium' },
          amount: { minimum: 100000 },
        },
        required: ['membership', 'amount'],
      },
      then: {
        properties: {
          expressDelivery: {
            type: 'boolean',
            default: true,
          },
        },
      },
    },
  ],
} satisfies JSONSchema;

/** A named set of fields the example merges into the current value in one write. */
interface Preset {
  /** Button text, also the accessible name the play functions click. */
  readonly label: string;
  /** Fields merged over the current value through a `FormHandle.setValue` updater. */
  readonly value: Record<string, unknown>;
}

/** Props of the conditional-branch example page. */
interface ConditionalExampleProps {
  /** Schema rendered by the form and printed below it for reading. */
  readonly schema: JSONSchema;
  /** Whole values the page offers as one-click combinations. */
  readonly presets?: readonly Preset[];
}

/**
 * Render a form whose fields follow its if/then/else rules, the committed value, and the schema.
 * if guards are judged by the validator, so the page supplies one through FormProvider; without a
 * validator every then and else stays off.
 * @param props - The schema to demonstrate and optional value presets.
 * @returns The form, preset buttons, the current value and the schema text.
 */
function ConditionalExample({ schema, presets = [] }: ConditionalExampleProps) {
  const handle = useRef<FormHandle<JSONSchema, Record<string, unknown>>>(null);
  return (
    <FormProvider validatorFactory={ajvValidatorPlugin}>
      <Form ref={handle} jsonSchema={schema}>
        {({ value }) => (
          <>
            <Form.Field />
            {presets.length > 0 && (
              <p>
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      handle.current?.setValue((previous) => ({
                        ...previous,
                        ...preset.value,
                      }))
                    }
                  >
                    {preset.label}
                  </button>
                ))}{' '}
                <button type="button" onClick={() => handle.current?.reset()}>
                  Reset
                </button>
              </p>
            )}
            <h4>Current value</h4>
            <pre aria-label="Current value">
              {JSON.stringify(value, null, 2)}
            </pre>
          </>
        )}
      </Form>
      <details>
        <summary>Schema</summary>
        <pre>{JSON.stringify(schema, null, 2)}</pre>
      </details>
    </FormProvider>
  );
}

/**
 * Find the built-in input of a field; inactive branch fields leave the DOM.
 * @param root - Story canvas element.
 * @param path - JSONPointer of the field, which built-in inputs use as their id.
 * @returns The mounted input, or null when the field is not rendered.
 */
const findField = (root: HTMLElement, path: string): HTMLElement | null =>
  root.querySelector<HTMLElement>(`[id="${path}"]`);

/**
 * Read whether a field is rendered.
 * @param root - Story canvas element.
 * @param path - JSONPointer of the field.
 * @returns True when the field's input is mounted.
 */
const hasField = (root: HTMLElement, path: string): boolean =>
  findField(root, path) !== null;

/**
 * Get a field's input for an interaction step.
 * @param root - Story canvas element.
 * @param path - JSONPointer of the field.
 * @returns The mounted input; throws when the field is not rendered.
 */
const getField = (root: HTMLElement, path: string): HTMLElement => {
  const element = findField(root, path);
  if (element === null) throw new Error(`Field ${path} is not rendered`);
  return element;
};

/**
 * Read the committed value printed by the example.
 * @param root - Story canvas element.
 * @returns The parsed `Current value` readout.
 */
const readValue = (root: HTMLElement): unknown =>
  JSON.parse(within(root).getByLabelText('Current value').textContent ?? '');

/**
 * Switch the payment example card → bank → card and check that only the selected group is rendered
 * and kept in the value, and that a returning group shows what was typed before.
 * @param root - Story canvas element of any payment schema in this file.
 * @returns Resolves after the round trip; rejects on the first failed expectation.
 */
const playPaymentRoundTrip = async (root: HTMLElement): Promise<void> => {
  await waitFor(() => expect(hasField(root, '/cardNumber')).toBe(true));
  await expect(hasField(root, '/accountNumber')).toBe(false);
  await expect(readValue(root)).toEqual({ method: 'card', installments: 1 });

  await userEvent.type(getField(root, '/cardNumber'), '4111');
  await userEvent.selectOptions(getField(root, '/method'), 'bank');
  await waitFor(() => expect(hasField(root, '/accountNumber')).toBe(true));
  await expect(hasField(root, '/cardNumber')).toBe(false);
  await expect(readValue(root)).toEqual({ method: 'bank' });

  await userEvent.type(getField(root, '/accountNumber'), '1002');
  await expect(readValue(root)).toEqual({
    method: 'bank',
    accountNumber: '1002',
  });

  await userEvent.selectOptions(getField(root, '/method'), 'card');
  await waitFor(() =>
    expect(readValue(root)).toEqual({
      method: 'card',
      cardNumber: '4111',
      installments: 1,
    }),
  );
  await expect(hasField(root, '/accountNumber')).toBe(false);
};

export default {
  title: 'Usage/Conditional branches',
  component: ConditionalExample,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'The same payment form written five ways, plus one allOf example. Pick by who must see the branch:',
          '',
          '- `OneOfByActive`: `controls.active` on each oneOf branch. A form expression; add `const` tags so the validator picks the same branch.',
          '- `OneOfByDiscriminator`: `controls.discriminator` on the host and `const` tags in the branches. One tag serves both the form and the validator.',
          '- `OneOfByIfThenElse`: standard `if`/`then`/`else: false` in each branch. Pure JSON Schema, so a server validates the same branches; needs a validator in the form.',
          '- `FieldsByActive`: no union; `controls.fields` switches groups of fields by name. Form-only: the validator accepts any field combination.',
          '- `AllOfMultipleIfThen`: independent `if`/`then` rules in allOf, several of which can apply at once.',
          '',
          'In every variant an inactive group leaves the form value, and its typed values return when it becomes active again.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof ConditionalExample>;
type Story = StoryObj<typeof ConditionalExample>;

/** oneOf branches gated by `controls.active` on each branch object. */
export const OneOfByActive: Story = {
  args: { schema: paymentByActive },
  play: ({ canvasElement }) => playPaymentRoundTrip(canvasElement),
};

/** oneOf branches selected by `controls.discriminator: 'method'` and per-branch `const` tags. */
export const OneOfByDiscriminator: Story = {
  args: { schema: paymentByDiscriminator },
  play: ({ canvasElement }) => playPaymentRoundTrip(canvasElement),
};

/** oneOf branches selected by `if`/`then`/`else: false`, judged by the validator. */
export const OneOfByIfThenElse: Story = {
  args: { schema: paymentByIfThenElse },
  play: ({ canvasElement }) => playPaymentRoundTrip(canvasElement),
};

/** Groups of direct children switched by `controls.fields[].controls.active`, without a union. */
export const FieldsByActive: Story = {
  args: { schema: paymentByFieldsActive },
  play: ({ canvasElement }) => playPaymentRoundTrip(canvasElement),
};

/**
 * allOf with several if/then rules. Every rule whose guard passes applies together: `Apply every
 * rule` turns on five rules at once, and premium membership both adds a field and requires `phone`.
 */
export const AllOfMultipleIfThen: Story = {
  args: {
    schema: shippingSchema,
    presets: [
      {
        label: 'Premium US order',
        value: { country: 'US', membership: 'premium', amount: 30000 },
      },
      {
        label: 'Apply every rule',
        value: {
          country: 'US',
          membership: 'premium',
          amount: 150000,
          giftWrap: true,
        },
      },
    ],
  },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const conditional = [
      '/state',
      '/concierge',
      '/giftMessage',
      '/insurance',
      '/expressDelivery',
    ];
    await waitFor(() =>
      expect(hasField(canvasElement, '/postalCode')).toBe(true),
    );
    for (const path of conditional)
      await expect(hasField(canvasElement, path)).toBe(false);

    await userEvent.click(getField(canvasElement, '/giftWrap'));
    await waitFor(() =>
      expect(hasField(canvasElement, '/giftMessage')).toBe(true),
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Premium US order' }),
    );
    await waitFor(() => expect(hasField(canvasElement, '/state')).toBe(true));
    await expect(hasField(canvasElement, '/concierge')).toBe(true);
    await expect(hasField(canvasElement, '/postalCode')).toBe(false);
    await expect(hasField(canvasElement, '/insurance')).toBe(false);
    await expect(hasField(canvasElement, '/expressDelivery')).toBe(false);
    await expect(
      canvasElement.querySelector('label[for="/phone"]'),
    ).toHaveTextContent('*');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Apply every rule' }),
    );
    await waitFor(() =>
      expect(hasField(canvasElement, '/expressDelivery')).toBe(true),
    );
    for (const path of conditional)
      await expect(hasField(canvasElement, path)).toBe(true);
    await expect(readValue(canvasElement)).toEqual({
      country: 'US',
      membership: 'premium',
      amount: 150000,
      giftWrap: true,
      concierge: 'Leave at the front desk',
      insurance: true,
      expressDelivery: true,
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(() =>
      expect(hasField(canvasElement, '/postalCode')).toBe(true),
    );
    for (const path of conditional)
      await expect(hasField(canvasElement, path)).toBe(false);
  },
};
