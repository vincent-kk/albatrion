import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';

/** One edge scene for fragment ownership: its schema and the values mounted in turn. */
export interface FragmentOwnershipCase {
  /** Name reported with a failing comparison. */
  readonly label: string;
  /** Authored root whose fragments address children through owner markers. */
  readonly schema: BlueprintSchema;
  /** Values mounted one after another, so gated fragments are seen off and on. */
  readonly values: readonly unknown[];
}

/** Twelve fragments where only `#/allOf/11`, not its prefix `#/allOf/1`, owns `t`. */
const siblingPrefixFragments: BlueprintSchema[] = Array.from(
  { length: 12 },
  (_, index) =>
    index === 11
      ? {
          controls: { readOnly: './flag' },
          properties: { t: { type: 'string' } },
        }
      : {
          controls: { disabled: './flag' },
          properties: { u: { type: 'string' } },
        },
);

/** Edge scenes shared by the blueprint feature index and settle control layer tests. */
export const fragmentOwnershipSchemas: readonly FragmentOwnershipCase[] = [
  {
    label: 'property named properties',
    schema: {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        properties: {
          type: 'object',
          properties: { properties: { type: 'string' } },
        },
      },
      allOf: [
        {
          controls: { disabled: './flag' },
          properties: {
            properties: {
              type: 'object',
              allOf: [
                {
                  controls: { readOnly: true },
                  properties: { properties: { type: 'string' } },
                },
              ],
            },
          },
        },
      ],
    },
    values: [{ flag: true, properties: { properties: 'x' } }],
  },
  {
    label: 'nested fragments',
    schema: {
      type: 'object',
      properties: { flag: { type: 'boolean' }, a: { type: 'string' } },
      allOf: [
        {
          controls: { disabled: './flag' },
          allOf: [
            {
              controls: { readOnly: true },
              properties: { a: { type: 'string' } },
            },
          ],
          properties: { a: { type: 'string', allOf: [{ minLength: 1 }] } },
        },
      ],
    },
    values: [{ flag: true, a: 'x' }],
  },
  {
    label: 'sibling prefixes',
    schema: {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        t: { type: 'string' },
        u: { type: 'string' },
      },
      allOf: siblingPrefixFragments,
    },
    values: [{ flag: true, t: 'x', u: 'y' }],
  },
  {
    label: 'items fragment',
    schema: {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: { type: 'string' },
          allOf: [
            {
              controls: { disabled: true },
              items: { type: 'string', allOf: [{ minLength: 1 }] },
            },
          ],
        },
      },
    },
    values: [{ list: ['p', 'q'] }],
  },
  {
    label: 'prefixItems fragment',
    schema: {
      type: 'object',
      properties: {
        tuple: {
          type: 'array',
          prefixItems: [{ type: 'string' }, { type: 'number' }],
          allOf: [
            {
              controls: { disabled: true },
              prefixItems: [{ type: 'string' }, { type: 'number' }],
            },
          ],
        },
      },
    },
    values: [{ tuple: ['a', 1] }],
  },
  {
    label: 'additionalItems fragment',
    schema: {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          allOf: [
            {
              controls: { disabled: true },
              items: [{ type: 'string' }],
              additionalItems: { type: 'string', allOf: [{ minLength: 1 }] },
            },
          ],
        },
      },
    },
    values: [{ list: ['head', 'tail', 'rest'] }],
  },
  {
    label: 'unselected child declaration and ordered field groups',
    schema: {
      type: 'object',
      controls: { fields: [{ targets: ['t'], controls: { default: 'root' } }] },
      properties: { t: { type: 'string', controls: { default: 'base' } } },
      allOf: [
        {
          controls: {
            default: 'first fragment',
          },
          properties: {
            t: { type: 'string', controls: { default: 'first child' } },
          },
        },
        {
          controls: { default: 'last fragment' },
          properties: {
            t: { type: 'string', controls: { default: 'last child' } },
          },
        },
      ],
    },
    values: [{ t: 'retained' }],
  },
  {
    label: 'gated fragment',
    schema: {
      type: 'object',
      properties: { flag: { type: 'boolean' }, t: { type: 'string' } },
      allOf: [
        {
          controls: { active: './flag', disabled: true },
          properties: { t: { type: 'string' } },
        },
      ],
    },
    values: [
      { flag: false, t: 'x' },
      { flag: true, t: 'x' },
    ],
  },
];
