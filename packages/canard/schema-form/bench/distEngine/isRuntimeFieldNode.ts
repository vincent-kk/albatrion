import type { TestFieldNode } from '../../src/core/__tests__/fixtures/testFieldNode';

/** Check the same record fields as the test guard without executing source modules. */
export function isRuntimeFieldNode(value: unknown): value is TestFieldNode {
  return (
    value !== null &&
    typeof value === 'object' &&
    'behavior' in value &&
    'runtime' in value &&
    '__schema__' in value &&
    'rootNode' in value &&
    'source' in value
  );
}
