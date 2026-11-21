import { appendSegment } from '@/schema-form/helpers/jsonPointer';

/**
 * Identify the gate declared directly on this schema rather than inherited from another location.
 * @param gatePath - Canonical authored pointer of the gate.
 * @param schemaPath - Canonical authored pointer of the candidate owner.
 * @returns Whether the gate is the owner's controls.active.
 */
export const isOwnActiveGate = (gatePath: string, schemaPath: string): boolean =>
  gatePath === appendSegment(appendSegment(schemaPath, 'controls'), 'active');
