// Loaded by B8 preparation; validates the owner's one-member declaration exception.
import assert from 'node:assert/strict';

/**
 * Require that resolved public declarations add only the approved error member.
 * @param {string} baseline Public built export descriptions before B8.
 * @param {string} candidate Public built export descriptions after B8.
 * @returns {object} The approved name and value; throws on any other difference.
 */
export function verifyDeclarationException(baseline, candidate) {
  const addition =
    ' readonly ReservedPropertyName: "JSON_SCHEMA_ERROR.RESERVED_PROPERTY_NAME";';
  assert.equal(
    candidate.split(addition).length,
    2,
    'Exactly one approved public member',
  );
  assert.equal(
    candidate.replace(addition, ''),
    baseline,
    'Only ReservedPropertyName may widen public declarations',
  );
  return {
    name: 'ReservedPropertyName',
    value: 'JSON_SCHEMA_ERROR.RESERVED_PROPERTY_NAME',
  };
}
