import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

/**
 * Prepare dormant branches through the same public setter used by the timing device.
 * @param count - Branch count whose inactive payloads remain in latent raw
 * @returns Public root and one source value per declared branch
 */
export const createInactiveMemoPublicTree = (count: number) => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: { kind: { type: 'string' } },
    oneOf: Array.from({ length: count }, (_, index) => ({
      controls: { active: `./kind === "kind_${index}"` },
      properties: { [`payload_${index}`]: { type: 'string' } },
    })),
  });
  root.setValue({
    kind: 'kind_0',
    ...Object.fromEntries(
      Array.from({ length: count }, (_, index) => [
        `payload_${index}`,
        `value_${index}`,
      ]),
    ),
  });
  return root;
};
