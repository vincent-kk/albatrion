import assert from 'node:assert/strict';

import { buildFixture } from '../../../../design-optimization/tools/fixtures.mjs';
import { materialize } from '../../../../design-optimization/tools/helpers/materialize.mjs';

/**
 * Build and fully read one independent wide host, returning only its live root.
 * @param engine - One lane's immutable prepared engine
 * @param values - Eighty selections for the two- or eighty-bucket history
 * @returns The live form after its last active read; construction locals do not escape
 */
export function createWideBucketHeapForm(engine, values) {
  // common + kind + 998 passive fields give exactly 1,000 static root fields.
  const schema = buildFixture({ shape: 'oneOf', n: 80, siblings: 998 });
  assert.equal(Object.keys(schema.properties).length, 1000);
  assert.equal(schema.oneOf.length, 80);
  const root = engine.buildFieldNodeTree({ jsonSchema: schema, onChange() {} });
  engine.mountFieldNode(root, undefined, undefined, { deferValidation: false });
  materialize(root);
  const kind = root.find('/kind');
  assert.ok(kind);
  for (const value of values) {
    kind.setValue(value);
    materialize(root);
  }
  return root;
}
