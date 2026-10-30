// Invoked without performance samples to check the one-member declaration gate.
import assert from 'node:assert/strict';

import { verifyDeclarationException } from './verifyDeclarationException.mjs';

const baseline =
  'FormErrorCode\tvalue+type\t{ readonly Existing: "EXISTING"; }';
const addition =
  ' readonly ReservedPropertyName: "JSON_SCHEMA_ERROR.RESERVED_PROPERTY_NAME";';
const candidate = baseline.replace(' }', addition + ' }');
assert.equal(
  verifyDeclarationException(baseline, candidate).name,
  'ReservedPropertyName',
);
assert.throws(() => verifyDeclarationException(baseline, baseline));
assert.throws(() =>
  verifyDeclarationException(
    baseline,
    candidate.replace('EXISTING', 'CHANGED'),
  ),
);
assert.throws(() =>
  verifyDeclarationException(
    baseline,
    candidate.replace('JSON_SCHEMA_ERROR.RESERVED_PROPERTY_NAME', 'WRONG'),
  ),
);
assert.throws(() =>
  verifyDeclarationException(
    baseline,
    candidate + 'type Unexpected = string;\n',
  ),
);
console.log('B8_WINDOW_TOOLS_OK');
