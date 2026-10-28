// Invoked after both builds; follows the distributed declarations rather than entry bytes alone.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { readPublicDeclarations } from '../b8/readPublicDeclarations.mjs';

const [baseline, candidate, output] = process.argv
  .slice(2)
  .map((value) => path.resolve(value));
assert.ok(baseline && candidate && output);
fs.mkdirSync(output, { recursive: true });
const descriptions = [baseline, candidate].map(readPublicDeclarations);
const tables = descriptions.map(
  (description) =>
    new Map(description.split('\n').map((line) => [line.split('\t')[0], line])),
);
const added = [...tables[1].keys()].filter((name) => !tables[0].has(name));
const removed = [...tables[0].keys()].filter((name) => !tables[1].has(name));
const changed = [...tables[0]]
  .filter(([name, line]) => tables[1].has(name) && tables[1].get(name) !== line)
  .map(([name]) => name);
assert.deepEqual(added, [
  'InactiveValue',
  'InactiveValueContext',
  'InactiveValueResolver',
]);
assert.deepEqual(removed, []);
assert.deepEqual(changed, ['FormWarningCode']);
assert.ok(
  tables[1]
    .get('FormWarningCode')
    .includes('INACTIVE_VALUE_WITH_UNSET_ON_INACTIVE'),
);
assert.ok(
  tables[1].get('FormWarningCode').includes('WRITE_IN_INACTIVE_RESOLVER'),
);
const members = [];
for (const packageDir of [baseline, candidate]) {
  const config = ts.readConfigFile(
    path.join(packageDir, 'tsconfig.json'),
    ts.sys.readFile,
  );
  assert.equal(config.error, undefined);
  const options = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    packageDir,
  );
  const entryPath = path.join(packageDir, 'dist/index.d.ts');
  const program = ts.createProgram([entryPath], {
    ...options.options,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entryPath);
  assert.ok(source);
  const module = checker.getSymbolAtLocation(source);
  assert.ok(module);
  const symbols = checker.getExportsOfModule(module);
  const publicType = (name) => {
    let symbol = symbols.find((candidate) => candidate.getName() === name);
    assert.ok(symbol);
    while (symbol.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol);
    return checker.getDeclaredTypeOfSymbol(symbol);
  };
  const node = publicType('FieldNode');
  const schema = publicType('JSONSchema');
  const controls = checker.getPropertyOfType(schema, 'controls');
  assert.ok(controls);
  const controlsType = checker.getNonNullableType(
    checker.getTypeOfSymbolAtLocation(controls, source),
  );
  const inactiveValue = checker.getPropertyOfType(
    controlsType,
    'inactiveValue',
  );
  const inactiveValueType = inactiveValue
    ? checker.getTypeOfSymbolAtLocation(inactiveValue, source)
    : undefined;
  if (inactiveValueType) {
    assert.ok(inactiveValueType.isUnion());
    assert.equal(
      inactiveValueType.types.filter((type) => type.getCallSignatures().length)
        .length,
      1,
    );
  }
  members.push({
    inactiveValueType: inactiveValueType
      ? checker.typeToString(
          inactiveValueType,
          source,
          ts.TypeFormatFlags.NoTruncation,
        )
      : null,
    node: checker
      .getPropertiesOfType(node)
      .map((symbol) => symbol.name)
      .sort(),
    controls: checker
      .getPropertiesOfType(controlsType)
      .map((symbol) => symbol.name)
      .sort(),
  });
}
const nodeMembers = members[1].node.filter(
  (name) => !members[0].node.includes(name),
);
const controlKeys = members[1].controls.filter(
  (name) => !members[0].controls.includes(name),
);
assert.deepEqual(nodeMembers, ['onInactive']);
assert.deepEqual(controlKeys, ['inactiveValue']);
for (let index = 0; index < descriptions.length; index++)
  fs.writeFileSync(
    path.join(output, index ? 'candidate.txt' : 'baseline.txt'),
    descriptions[index] + '\n',
  );
const report = {
  before: tables[0].size,
  after: tables[1].size,
  added,
  removed,
  changed,
  nodeMembers,
  controlKeys,
  warningMembers: [
    'InactiveValueWithUnsetOnInactive',
    'WriteInInactiveResolver',
  ],
  zeroDifferenceWaived: true,
};
fs.writeFileSync(
  path.join(output, 'difference.json'),
  JSON.stringify(report, null, 2) + '\n',
);
console.log('B12_DECLARATIONS_OK ' + JSON.stringify(report));
