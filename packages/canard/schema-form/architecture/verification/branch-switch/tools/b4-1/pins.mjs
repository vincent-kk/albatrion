// Audit existing assertions and enumerate every storage-oracle exception from source.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const packageDir = path.resolve(
  fileURLToPath(new URL('../../../../../', import.meta.url)),
);
const repository = path.resolve(packageDir, '../../..');
const relativePackage = path.relative(repository, packageDir);
const baseline = process.argv[2];
assert.ok(baseline, 'Provide the immutable baseline commit');
const tracked = execFileSync(
  'git',
  [
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '--',
    relativePackage + '/src',
  ],
  { cwd: repository, encoding: 'utf8' },
)
  .trim()
  .split('\n')
  .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
  .filter((file) => {
    if (fs.existsSync(path.join(repository, file))) return true;
    assert.ok(
      !/\.(?:test|spec)\.[jt]sx?$/.test(file),
      'Existing verification file removed: ' + file,
    );
    return false;
  });
const configFile = ts.readConfigFile(
  path.join(packageDir, 'tsconfig.json'),
  ts.sys.readFile,
);
const config = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  packageDir,
);
const reverse = new Map(),
  pins = [],
  assertionChecks = [];
const printer = ts.createPrinter({ removeComments: true });
const assertions = (text, file) => {
  const tree = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const result = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      /^(?:expect|assert)(?:\.|\()/.test(node.getText(tree))
    )
      result.push(printer.printNode(ts.EmitHint.Expression, node, tree));
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return result;
};
for (const file of tracked) {
  const absolute = path.join(repository, file),
    text = fs.readFileSync(absolute, 'utf8');
  for (const entry of ts.preProcessFile(text).importedFiles) {
    const resolved = ts.resolveModuleName(
      entry.fileName,
      absolute,
      config.options,
      ts.sys,
    ).resolvedModule?.resolvedFileName;
    if (!resolved?.startsWith(packageDir + path.sep)) continue;
    const consumers = reverse.get(resolved) ?? [];
    consumers.push(absolute);
    reverse.set(resolved, consumers);
  }
  const calls = [
    ...text.matchAll(/\b(pinLatentBaseline|pinSlotShipping)\(\)/g),
  ];
  if (calls.length)
    pins.push({
      file: path.relative(packageDir, absolute),
      off: calls.filter((call) => call[1] === 'pinLatentBaseline').length,
      on: calls.filter((call) => call[1] === 'pinSlotShipping').length,
    });
  if (!/\.(?:test|spec)\.[jt]sx?$/.test(file)) continue;
  let old;
  try {
    old = execFileSync('git', ['show', baseline + ':' + file], {
      cwd: repository,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    continue;
  }
  const before = assertions(old, file),
    after = assertions(text, file);
  let position = 0;
  for (const expression of before) {
    const next = after.indexOf(expression, position);
    assert.ok(
      next >= 0,
      'Existing assertion changed or removed: ' + file + '\n' + expression,
    );
    position = next + 1;
  }
  assertionChecks.push({
    file: path.relative(packageDir, absolute),
    existingAssertions: before.length,
  });
}
const fixture = path.join(
  packageDir,
  'src/core/engine/__tests__/fixtures/createTestTree.ts',
);
const visited = new Set([fixture]),
  queue = [fixture];
for (const source of queue)
  for (const consumer of reverse.get(source) ?? [])
    if (!visited.has(consumer)) {
      visited.add(consumer);
      queue.push(consumer);
    }
const indirect = queue
  .filter((file) => /\.(?:test|spec)\.[jt]sx?$/.test(file))
  .map((file) => path.relative(packageDir, file))
  .sort();
console.log(
  JSON.stringify(
    {
      baseline,
      pins,
      plainFixture: {
        file: path.relative(packageDir, fixture),
        mode: 'off',
        directTestFiles: (reverse.get(fixture) ?? []).filter((file) =>
          /\.(?:test|spec)\.[jt]sx?$/.test(file),
        ).length,
        transitiveTestFiles: indirect.length,
        files: indirect,
        migration:
          'B4-2 migrates the plain fixture to on and replaces latent-store assertions and pins with slot contracts',
      },
      assertionAudit: {
        files: assertionChecks.length,
        existingAssertions: assertionChecks.reduce(
          (sum, check) => sum + check.existingAssertions,
          0,
        ),
        preserved: true,
      },
      limitation:
        'AST-printed expect/assert calls are preserved in source order; this does not prove behavior by itself',
    },
    null,
    2,
  ),
);
