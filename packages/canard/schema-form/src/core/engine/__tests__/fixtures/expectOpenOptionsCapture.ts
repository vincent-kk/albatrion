import { expect } from 'vitest';

/**
 * Check the current open-option contract where pinned records expect rejection.
 * @param actual - Blueprint graph capture for the single string with unknown options
 * @returns Nothing; asserts acceptance, preserved metadata, and no diagnostic
 */
export const expectOpenOptionsCapture = (actual: unknown): void => {
  expect(actual).not.toHaveProperty('error');
  expect(actual).toMatchObject({
    graph: {
      nodes: [
        {
          kind: 'string',
          strategy: 'terminal',
          childEntries: [],
          declarations: [
            { schema: { type: 'string', options: { unknown: true } } },
          ],
        },
      ],
    },
    diagnostics: [],
  });
};
