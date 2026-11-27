import type { BlueprintSchema } from '../../../../blueprint';

/**
 * Build a leaf-only union whose inactive defaults and state keys remain observable.
 * @param defaultKind - Discriminator filled by the load transition when input omits it
 * @returns A fresh eligible host, without shared mutable authored schema objects
 */
export const createLoadUnionSchema = (defaultKind = 'a'): BlueprintSchema => ({
  type: 'object',
  properties: {
    common: {
      type: 'string',
      default: 'shared',
      controls: { visible: "../kind === 'a'", readOnly: "../kind === 'b'" },
    },
    kind: { type: 'string', default: defaultKind },
  },
  oneOf: [
    {
      controls: { active: "./kind === 'a'" },
      properties: { pa: { type: 'number', default: 1 } },
    },
    {
      controls: { active: "./kind === 'b'" },
      properties: { pb: { type: 'number', default: 2 } },
    },
  ],
});
