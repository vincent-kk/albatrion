// Narrowing is looser than instanceof: record fields are checked, not class identity.
import type { FieldNodeRecord } from '@/schema-form/core/engine';
import type { FieldNode } from '@/schema-form/core/surface';

/** Runtime record shape shared by core scenario runners and engine tests. */
export interface TestFieldNode extends FieldNodeRecord<TestFieldNode> {}

/** Public node operations together with the runtime record used by core tests. */
export type TestPublicFieldNode = FieldNode & TestFieldNode;

/**
 * Narrows a test value by the presence of runtime record fields.
 * @param value - Candidate returned by a public node lookup or factory.
 * @returns Whether the candidate exposes the record fields used by engine tests.
 */
export function isTestFieldNode(value: unknown): value is TestFieldNode {
  return (
    value !== null &&
    typeof value === 'object' &&
    'behavior' in value &&
    'runtime' in value &&
    'schema' in value &&
    'rootNode' in value &&
    'raw' in value
  );
}
