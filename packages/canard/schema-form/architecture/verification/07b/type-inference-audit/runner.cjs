#!/usr/bin/env node
'use strict';

/**
 * Compile identical consumer probes against the published legacy entry and the new source entry.
 * The @audit comments identify cases; inspect(label, expression) identifies types to print.
 * This script never emits TypeScript artifacts, writes files, or executes the imported Form.
 */
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const ts = require('typescript');

const auditDirectory = __dirname;
const packageDirectory = path.resolve(auditDirectory, '../../../..');
const worktree = path.resolve(packageDirectory, '../../..');
const legacySpecifier = '@canard/schema-form_0.16.0';
const newSpecifier = '../../../../src/index';
const configFile = ts.readConfigFile(path.join(auditDirectory, 'tsconfig.json'), ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, auditDirectory);
if (config.errors.length) throw new Error(config.errors.map(error =>
  ts.flattenDiagnosticMessageText(error.messageText, '\n')).join('\n'));

const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias;
const relative = file => path.relative(worktree, file).split(path.sep).join('/');
const normalize = text => text.split(worktree + path.sep).join('');
const location = node => {
  const source = node.getSourceFile();
  return relative(source.fileName) + ':' +
    (source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1);
};

/** Return public symbol declarations, following the entry's re-export aliases. */
function publicDefinitions(program, checker, entryFile) {
  const source = program.getSourceFile(entryFile);
  if (!source) throw new Error('Public entry was not compiled: ' + entryFile);
  const module = checker.getSymbolAtLocation(source);
  if (!module) throw new Error('Public entry is not a module: ' + entryFile);
  const exports = checker.getExportsOfModule(module);
  const result = {};
  for (const name of ['Form', 'FormProps', 'FormHandle', 'FormChildrenProps', 'InferValueType', 'InferSchemaNode']) {
    let symbol = exports.find(item => item.name === name);
    if (!symbol) throw new Error('Missing public export: ' + name);
    while (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    result[name] = (symbol.declarations || []).map(location);
    if (name === 'FormProps' || name === 'FormHandle' || name === 'FormChildrenProps') {
      const type = checker.getDeclaredTypeOfSymbol(symbol);
      for (const property of checker.getPropertiesOfType(type)) {
        if (/^(defaultValue|value|on[A-Z]|children|formatError|getValue|setValue|node)/.test(property.name)) {
          result[name + '.' + property.name] = (property.declarations || []).map(location);
        }
      }
    }
  }
  return result;
}

/** Compile one version and record contextual props, observed values, and actual compiler diagnostics. */
function compile(version) {
  const host = ts.createCompilerHost(config.options);
  const originalRead = host.readFile.bind(host);
  host.readFile = file => {
    const source = originalRead(file);
    if (version !== 'new' || !/\.tsx?$/.test(file) || !file.startsWith(auditDirectory + path.sep)) {
      return source;
    }
    return source.split("'" + legacySpecifier + "'").join("'" + newSpecifier + "'");
  };
  const entry = ts.resolveModuleName(
    version === 'new' ? newSpecifier : legacySpecifier,
    path.join(auditDirectory, 'default.probes.tsx'), config.options, host,
  ).resolvedModule;
  if (!entry) throw new Error('Cannot resolve ' + version + ' public entry');
  const program = ts.createProgram(config.fileNames, config.options, host);
  const checker = program.getTypeChecker();
  const rows = [];
  const observations = type => normalize(checker.typeToString(type, undefined, flags));
  for (const file of config.fileNames.filter(file => file.endsWith('.probes.tsx'))) {
    const source = program.getSourceFile(file);
    for (const declaration of source.statements) {
      if (!ts.isFunctionDeclaration(declaration)) continue;
      const match = declaration.getFullText(source).match(/@audit (default|handlers|ref|generic) ([DHRG]\d+) ([^\n*]+)/);
      if (!match) continue;
      const row = { path: match[1], case: match[2], title: match[3].trim(),
        file: relative(file), line: source.getLineAndCharacterOfPosition(declaration.getStart(source)).line + 1,
        observations: {}, diagnostics: [] };
      function visit(node) {
        if (ts.isCallExpression(node) && node.expression.getText(source) === 'inspect') {
          if (node.arguments.length !== 2 || !ts.isStringLiteral(node.arguments[0])) {
            throw new Error('Invalid inspect marker at ' + location(node));
          }
          row.observations[node.arguments[0].text] = observations(checker.getTypeAtLocation(node.arguments[1]));
        }
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          if (node.tagName.getText(source) === 'Form') {
            const signature = checker.getResolvedSignature(node);
            if (!signature) throw new Error('Cannot resolve Form signature at ' + location(node));
            const props = checker.getTypeOfSymbolAtLocation(signature.parameters[0], node);
            const defaultValue = props.getProperty('defaultValue');
            row.observations.checkedDefault = observations(checker.getTypeOfSymbolAtLocation(defaultValue, node));
            const attribute = node.attributes.properties.find(property =>
              ts.isJsxAttribute(property) && property.name.getText(source) === 'defaultValue');
            if (attribute && attribute.initializer) {
              const expression = ts.isJsxExpression(attribute.initializer)
                ? attribute.initializer.expression : attribute.initializer;
              if (expression) {
                row.observations.inputDefault = observations(checker.getTypeAtLocation(expression));
              }
            }
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(declaration);
      rows.push({ row, declaration, source });
    }
  }
  const infrastructureDiagnostics = [];
  for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
    const value = { code: diagnostic.code, message: normalize(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')) };
    if (diagnostic.file) {
      value.file = relative(diagnostic.file.fileName);
      value.line = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0).line + 1;
    }
    const target = rows.find(({ source, declaration }) =>
      diagnostic.file === source && diagnostic.start >= declaration.getFullStart() && diagnostic.start < declaration.getEnd());
    if (target) target.row.diagnostics.push(value);
    else infrastructureDiagnostics.push(value);
  }
  const callbackProps = Object.keys(publicDefinitions(program, checker, entry.resolvedFileName))
    .filter(name => /^FormProps\.(on[A-Z]|children|formatError)/.test(name));
  return { entry: relative(entry.resolvedFileName),
    definitions: publicDefinitions(program, checker, entry.resolvedFileName), callbackProps,
    infrastructureDiagnostics,
    cases: rows.map(({ row }) => ({ ...row, accepted: row.diagnostics.length === 0 })) };
}

const legacy = compile('legacy');
const current = compile('new');
if (legacy.cases.length !== current.cases.length) throw new Error('Case counts diverged');
const cases = legacy.cases.map((old, index) => {
  const fresh = current.cases[index];
  if (old.case !== fresh.case) throw new Error('Case order diverged');
  const observedChanges = [...Object.keys(old.observations), ...Object.keys(fresh.observations)]
    .filter((key, index, all) => all.indexOf(key) === index)
    .filter(key => old.observations[key] !== fresh.observations[key]);
  return { case: old.case, path: old.path, title: old.title, file: old.file, line: old.line,
    legacy: { observations: old.observations, accepted: old.accepted, diagnostics: old.diagnostics },
    new: { observations: fresh.observations, accepted: fresh.accepted, diagnostics: fresh.diagnostics },
    changedObservations: observedChanges, acceptanceChanged: old.accepted !== fresh.accepted };
});
const packageManifest = JSON.parse(fs.readFileSync(path.join(worktree,
  'node_modules/@canard/schema-form_0.16.0/package.json'), 'utf8'));
const dependencyEntries = Object.fromEntries(['legacy', 'new'].map(version => {
  const containingFile = version === 'legacy'
    ? path.join(worktree, 'node_modules/@canard/schema-form_0.16.0/dist/types/value.d.ts')
    : path.join(packageDirectory, 'src/types/value.ts');
  const dependency = ts.resolveModuleName('@winglet/json-schema',
    containingFile, config.options, ts.sys).resolvedModule;
  if (!dependency) throw new Error('Cannot resolve @winglet/json-schema for ' + version);
  return [version, relative(dependency.resolvedFileName)];
}));
const data = {
  environment: { typescript: ts.version, reactTypes: JSON.parse(fs.readFileSync(path.join(worktree,
    'node_modules/@types/react/package.json'), 'utf8')).version,
    legacyVersion: packageManifest.version,
    head: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: worktree, encoding: 'utf8', timeout: 60000 }).trim(),
    legacyEntry: legacy.entry, newEntry: current.entry, dependencyEntries,
    compilerOptions: config.options,
    caseCounts: Object.fromEntries(['default', 'handlers', 'ref', 'generic'].map(group =>
      [group, cases.filter(item => item.path === group).length])),
    changedCases: cases.filter(item => item.changedObservations.length || item.acceptanceChanged).length },
  definitions: { legacy: legacy.definitions, new: current.definitions },
  callbackProps: { legacy: legacy.callbackProps, new: current.callbackProps },
  infrastructureDiagnostics: { legacy: legacy.infrastructureDiagnostics, new: current.infrastructureDiagnostics },
  cases,
};
data.resultDigest = crypto.createHash('sha256').update(JSON.stringify(cases)).digest('hex');
process.stdout.write(JSON.stringify(data, null, 2) + '\n');
if (legacy.infrastructureDiagnostics.length || current.infrastructureDiagnostics.length) process.exitCode = 1;
