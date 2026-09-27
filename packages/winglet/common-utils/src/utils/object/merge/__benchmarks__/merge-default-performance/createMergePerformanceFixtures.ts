import type { MergePerformanceFixture } from './type';

/**
 * Build a small-to-nested shape corpus without placing setup inside timed merges.
 * @returns Fresh fixture sources, target factories and observable scalar consumers.
 */
export const createMergePerformanceFixtures = (): MergePerformanceFixture[] => {
  const mediumSource = Object.fromEntries(
    Array.from({ length: 32 }, (_, index) => [`key${index}`, index + 1]),
  );
  const mediumTarget = Object.fromEntries(
    Array.from({ length: 32 }, (_, index) => [`key${index}`, -index]),
  );
  return [
    {
      name: 'small-2-keys',
      source: { a: 2, b: 3 },
      createTarget: () => ({ a: 1 }),
      consume: (result) => result.a + result.b,
    },
    {
      name: 'medium-32-keys',
      source: mediumSource,
      createTarget: () => ({ ...mediumTarget }),
      consume: (result) => result.key31,
    },
    {
      name: 'nested-settings-arrays',
      source: {
        settings: {
          theme: { color: 'blue', spacing: { small: 4, large: 16 } },
          flags: { a: true, b: false },
        },
        fields: [
          { name: 'a', rules: { min: 1 } },
          { name: 'b', rules: { max: 9 } },
        ],
        tags: ['new', 'overlay'],
      },
      createTarget: () => ({
        settings: {
          theme: { color: 'red', spacing: { small: 2, medium: 8 } },
          flags: { c: true },
        },
        fields: [{ name: 'old', rules: { required: true } }],
        tags: ['existing'],
      }),
      consume: (result) =>
        result.settings.theme.spacing.small +
        result.fields[1].rules.max +
        result.tags.length,
    },
    {
      name: 'array-200-elements',
      source: { items: Array.from({ length: 200 }, (_, index) => index) },
      createTarget: () => ({ items: [-1] }),
      consume: (result) => result.items[199],
    },
  ];
};
