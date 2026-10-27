import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

/**
 * Seed dormant payloads through the timing device's public replacement path.
 * @param count - Number of mutually exclusive authored branches
 * @returns Public root whose first branch is live and other payloads are latent
 */
export const createInactiveLazyTree = (count = 8) => {
  const tree = makeFieldNodeTree({
    type: 'object',
    properties: { kind: { type: 'string' } },
    oneOf: Array.from({ length: count }, (_, index) => ({
      controls: { active: `./kind === "kind_${index}"` },
      properties: { [`payload_${index}`]: { type: 'string' } },
    })),
  });
  tree.root.setValue({
    kind: 'kind_0',
    ...Object.fromEntries(
      Array.from({ length: count }, (_, index) => [
        `payload_${index}`,
        `value_${index}`,
      ]),
    ),
  });
  return tree;
};
