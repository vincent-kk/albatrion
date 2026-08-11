import type { JsonSchema } from '@/schema-form/types';

/** Composition keyword a branch level uses to declare its conditional subschemas. */
export type CompositionScope = 'oneOf' | 'anyOf';

/** One outer/inner composition pairing exercised by the nested-composition suites. */
export type CompositionCase = [
  outer: CompositionScope,
  inner: CompositionScope,
];

/**
 * Builds the two-level conditional schema the nested-composition suites share.
 *
 * The outer level gates a `config` object on `enabled === true`; the inner level
 * switches `config`'s extra properties on `config.mode`. Both levels take their
 * composition keyword from the arguments so one schema shape covers all four
 * `oneOf`/`anyOf` pairings.
 *
 * @param outerScope - composition keyword for the `enabled` gate
 * @param innerScope - composition keyword for the `config.mode` branch
 * @returns the assembled JSON Schema
 */
export const createSchema = (
  outerScope: CompositionScope,
  innerScope: CompositionScope,
): JsonSchema => ({
  type: 'object',
  properties: {
    enabled: { type: 'boolean', default: true },
  },
  [outerScope]: [
    {
      '&if': './enabled === true',
      properties: {
        config: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['standard', 'express'],
              default: 'standard',
            },
          },
          [innerScope]: [
            {
              '&if': "./mode === 'standard'",
              properties: {
                cost: { type: 'number', default: 5.99 },
                days: { type: 'number', default: 7 },
              },
            },
            {
              '&if': "./mode === 'express'",
              properties: {
                expressCost: { type: 'number', default: 15.99 },
                hours: { type: 'number', default: 24 },
              },
            },
          ],
        },
      },
    },
  ],
});

/** Fully defaulted value when the inner branch settles on `standard`. */
export const standardDefault = {
  enabled: true,
  config: { mode: 'standard', cost: 5.99, days: 7 },
};

/** Fully defaulted value when the inner branch settles on `express`. */
export const expressDefault = {
  enabled: true,
  config: { mode: 'express', expressCost: 15.99, hours: 24 },
};
