import {
  SetValueOption,
  buildFieldNodeTree,
  mountFieldNode,
} from '@/schema-form/core/surface';
import type { JSONSchema } from '@/schema-form/types';

/**
 * Build a deterministic string tree with four children per branch.
 * @param depth - Number of object levels above each leaf
 * @returns Authored schema with a stable initial value
 */
const nestedSchema = (depth: number): JSONSchema =>
  depth === 0
    ? { type: 'string', default: 'leaf' }
    : {
        type: 'object',
        properties: Object.fromEntries(
          Array.from({ length: 4 }, (_, index) => [
            `n${index}`,
            nestedSchema(depth - 1),
          ]),
        ),
      };

/** Wait for both the current delivery wave and its deferred root notification. */
const drain = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * Record the approved common eleven-write history using the public node surface.
 * @param fixture - Flat, nested or conditional fixture selected for characterization
 * @returns Ordered listener payloads, options, root notifications and final values
 */
export const observeDirtyPostOrderWrites = async (
  fixture: 'flat-100' | 'nested-d4' | 'oneOf-10',
): Promise<string[]> => {
  const schema: JSONSchema =
    fixture === 'nested-d4'
      ? nestedSchema(4)
      : fixture === 'flat-100'
        ? {
            type: 'object',
            properties: Object.fromEntries(
              Array.from({ length: 100 }, (_, index) => [
                `field_${String(index).padStart(3, '0')}`,
                { type: 'string', default: `value_${index}` },
              ]),
            ),
          }
        : {
            type: 'object',
            properties: {
              common: { type: 'string', default: 'shared' },
              kind: { type: 'string', default: 'kind_0' },
            },
            oneOf: Array.from({ length: 10 }, (_, index) => ({
              controls: { active: `./kind === 'kind_${index}'` },
              properties: {
                [`payload_${index}_a`]: {
                  type: 'string',
                  default: `a_${index}`,
                },
                [`payload_${index}_b`]: { type: 'number', default: index },
                [`payload_${index}_c`]: {
                  type: 'boolean',
                  default: index % 2 === 0,
                },
              },
            })),
          };
  const log: string[] = [];
  const root = buildFieldNodeTree({
    jsonSchema: schema,
    validationMode: 0,
    onChange: (value) => log.push(`onChange ${JSON.stringify(value)}`),
  });
  mountFieldNode(root, undefined, undefined, { deferValidation: false });
  await drain();
  log.length = 0;
  const initial = structuredClone(root.value);
  const nodes = [root];
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    node.subscribe((event) =>
      log.push(
        `${node.path} ${event.type} ${JSON.stringify(event.payload ?? null)} ${JSON.stringify(event.options ?? null)}`,
      ),
    );
    for (const child of node.children ?? []) nodes.push(child);
  }
  const first =
    fixture === 'nested-d4'
      ? '/n0/n0/n0/n0'
      : fixture === 'flat-100'
        ? '/field_000'
        : '/common';
  const second =
    fixture === 'nested-d4'
      ? '/n3/n3/n3/n3'
      : fixture === 'flat-100'
        ? '/field_099'
        : '/payload_0_a';
  const partial =
    fixture === 'nested-d4'
      ? { n0: { n0: { n0: { n0: 'partial' } } } }
      : fixture === 'flat-100'
        ? { field_000: 'partial' }
        : { common: 'partial', kind: 'kind_0' };
  const writes = [
    () =>
      root.setValue(
        JSON.parse(JSON.stringify(initial), (key, value: unknown) =>
          key === 'kind'
            ? value
            : typeof value === 'string'
              ? `${value}-changed`
              : typeof value === 'number'
                ? value + 100
                : typeof value === 'boolean'
                  ? !value
                  : value,
        ),
      ),
    () => root.setValue(structuredClone(root.value)),
    () => root.setValue(partial),
    () => root.find(first)!.setValue('leaf'),
    () =>
      root
        .find(fixture === 'nested-d4' ? '/n0' : first)!
        .setValue(
          fixture === 'nested-d4'
            ? { n0: { n0: { n0: 'subtree' } } }
            : 'subtree',
        ),
    () => root.setValue(partial, SetValueOption.Merge),
    () => root.setValue(structuredClone(initial)),
    () => root.find(first)!.setValue(root.find(first)!.value),
    () => {
      root.find(first)!.setValue('multi-first');
      root.find(second)!.setValue('multi-second');
    },
    () => root.setValue(partial, SetValueOption.Merge),
    () => root.setValue(structuredClone(initial)),
  ];
  for (let index = 0; index < writes.length; index++) {
    log.push(`write ${index + 1}`);
    writes[index]();
    await drain();
    log.push(`value ${JSON.stringify(root.value)}`);
  }
  return log;
};
