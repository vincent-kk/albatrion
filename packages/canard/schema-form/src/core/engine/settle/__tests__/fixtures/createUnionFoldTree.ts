import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import type { BlueprintSchema } from '../../../blueprint';

/** Authored same-name variants and the mechanism selecting their declarations. */
interface UnionFoldOptions {
  /** Explicit discriminator branches replace the independent active gates. */
  discriminator?: boolean;
  /** Earlier fold's declaration; defaults to string/number. */
  left?: BlueprintSchema;
  /** Later fold's declaration; defaults to string/boolean. */
  right?: BlueprintSchema;
}

/**
 * Build two same-name union folds with independent gates or explicit tags.
 * @param options - Per-fold declarations and the branch selection mechanism
 * @returns Unmounted plain-record tree with the real blueprint and runtime
 */
export const createUnionFoldTree = (options: UnionFoldOptions = {}) =>
  createTestTree({
    type: 'object',
    properties: {
      left: { type: 'boolean' },
      right: { type: 'boolean' },
      tag: { type: 'string' },
      source: { type: 'string' },
      clear: { type: 'boolean' },
    },
    ...(options.discriminator
      ? {
          controls: { discriminator: 'tag' },
          oneOf: [
            {
              properties: {
                tag: { type: 'string', const: 'left' },
                shared: options.left ?? { type: ['string', 'number'] },
              },
            },
            {
              properties: {
                tag: { type: 'string', const: 'right' },
                shared: options.right ?? { type: ['string', 'boolean'] },
              },
            },
          ],
        }
      : {
          allOf: [
            {
              controls: { active: './left' },
              properties: {
                shared: options.left ?? { type: ['string', 'number'] },
              },
            },
            {
              controls: { active: './right' },
              properties: {
                shared: options.right ?? { type: ['string', 'boolean'] },
              },
            },
          ],
        }),
  });
