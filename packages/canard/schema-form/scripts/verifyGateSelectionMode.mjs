import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const helpers = [
  'verifyGateSelection',
  'verifyTableGate',
  'verifyUnvisitedGateStep',
  'finishGateTableRound',
  'watchGateSelectionDirty',
];
for (const name of ['index.mjs', 'index.node.mjs', 'index.cjs']) {
  const bytes = readFileSync(new URL('../dist/' + name, import.meta.url));
  const ast = ts.createSourceFile(
    name,
    bytes.toString(),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  assert.equal(ast.parseDiagnostics.length, 0, name + ': parseable artifact');
  const declarations = ast.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations]);
  const control = declarations.find(
    (declaration) =>
      ts.isIdentifier(declaration.name) && declaration.name.text === 'modes',
  );
  assert.ok(
    control && ts.isObjectLiteralExpression(control.initializer),
    name + ': real retained mode switch',
  );
  const mode = control.initializer.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      property.name.getText(ast) === 'gateSelection',
  );
  assert.ok(
    mode && ts.isStringLiteral(mode.initializer),
    name + ': explicit literal default',
  );
  assert.equal(mode.initializer.text, 'table', name + ': shipped default');
  const slots = control.initializer.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      property.name.getText(ast) === 'slots',
  );
  assert.equal(slots, undefined, name + ': no retired source-mode switch');
  const retired = [
    'captureExitedRaw',
    'setLatentRaw',
    'writeLatentRaw',
    'restoreLatentState',
    'updateInactiveValuesMemo',
    'createSlotShadowSession',
  ];
  assert.equal(
    declarations.some(
      (declaration) =>
        ts.isIdentifier(declaration.name) &&
        retired.includes(declaration.name.text),
    ),
    false,
    name + ': retired general source path is absent',
  );
  const retained = declarations.filter(
    (declaration) =>
      ts.isIdentifier(declaration.name) &&
      helpers.includes(declaration.name.text),
  );
  assert.equal(
    retained.length,
    helpers.length,
    name + ': mutable product switch retains verification helpers',
  );
  console.log(
    'GATE_SELECTION_DIST_OK ' +
      JSON.stringify({
        name,
        mode: mode.initializer.text,
        sourceModel: 'retained-slots',
        bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        verifyHelpers: retained.length,
        verifyHelperDeclarationBytes: retained.reduce(
          (sum, declaration) =>
            sum + Buffer.byteLength(declaration.getText(ast)),
          0,
        ),
      }),
  );
}
