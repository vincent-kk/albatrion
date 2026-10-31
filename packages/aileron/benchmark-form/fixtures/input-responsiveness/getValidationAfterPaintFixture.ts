import type { ValidationAfterPaintFixture } from '../../browser-bench/interaction/validationAfterPaintTypes';
import { getHeavyValidationFixture } from './getHeavyValidationFixture';
import cases from './ir-6-cases.json';

/** Reuse IR-2 schemas and alternating verdicts for every pre-registered IR-6 row. */
export function getValidationAfterPaintFixture(
  id: string,
): ValidationAfterPaintFixture {
  if (!cases.includes(id)) throw new Error('Unknown IR-6 fixture: ' + id);
  const source = getHeavyValidationFixture(
    id.replace(/^first-key-/, 'type-').replace(/^stream-/, 'type-'),
  );
  const none = id.endsWith('-none');
  return {
    ...source,
    id,
    validation: !none,
    defaultValidation: source.mount && !none,
    firstKey: id.startsWith('first-key-'),
    streamFrames: id.startsWith('stream-') ? 60 : undefined,
  };
}
