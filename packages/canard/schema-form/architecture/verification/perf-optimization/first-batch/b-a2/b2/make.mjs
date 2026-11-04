// Invoked by node make.mjs; this file is verification tooling.
// Standalone scratch builder: copies, AST instrumentation, trace and source audit.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { SB, P, sources, expectedSha, sha, currentExports, runtime } from '../config.mjs';
import { timerSource } from './timers.mjs';

const B2 = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url), ts = require('typescript');
const bytes = fs.readFileSync(sources.current), source = bytes.toString('utf8');
if (sha(bytes) !== expectedSha.current) throw new Error('Unexpected current source SHA');
fs.mkdirSync(path.join(B2, 'out'), { recursive: true });
fs.writeFileSync(path.join(B2, 'current-source.mjs'), bytes);
const ast = ts.createSourceFile('bundle.mjs', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const labels = [], edits = [], functions = [], seen = new Set();
const loc = (node) => { const p = ast.getLineAndCharacterOfPosition(node.getStart(ast)); return { line: p.line + 1, column: p.character + 1 }; };
const oneLine = (text) => text.replace(/\s+/g, ' ').slice(0, 180);
function addLabel(name, kind, owner, node, detail = '') {
  const id = labels.length;
  labels.push({ id, name, kind, owner, ...loc(node), detail });
  return id;
}
function surround(node, before, after, rank = 0) {
  edits.push({ at: node.getStart(ast), text: before, open: true, span: node.end - node.getStart(ast), rank });
  edits.push({ at: node.end, text: after, open: false, span: node.end - node.getStart(ast), rank });
}
function className(node) {
  for (let p = node.parent; p; p = p.parent) if (ts.isClassExpression(p) || ts.isClassDeclaration(p)) {
    if (ts.isVariableDeclaration(p.parent)) return p.parent.name.getText(ast);
    return p.name?.getText(ast) ?? 'anonymous-class';
  }
}
function functionName(node, owner) {
  const parent = node.parent;
  if (ts.isConstructorDeclaration(node)) return className(node) + '.constructor';
  if (ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) return (className(node) ?? owner ?? 'object') + '.' + (ts.isGetAccessorDeclaration(node) ? 'get ' : ts.isSetAccessorDeclaration(node) ? 'set ' : '') + node.name.getText(ast);
  if (node.name) return (owner ? owner + '.' : '') + node.name.getText(ast);
  if (ts.isVariableDeclaration(parent)) return (owner ? owner + '.' : '') + parent.name.getText(ast);
  if (ts.isPropertyAssignment(parent)) {
    let prefix = owner;
    if (!prefix && ts.isObjectLiteralExpression(parent.parent) && ts.isVariableDeclaration(parent.parent.parent)) prefix = parent.parent.parent.name.getText(ast);
    return (prefix ? prefix + '.' : '') + parent.name.getText(ast);
  }
  return (owner ?? 'module') + ':callback@' + loc(node).line + ':' + loc(node).column;
}
const isFunction = (n) => ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) || ts.isConstructorDeclaration(n) || ts.isGetAccessorDeclaration(n) || ts.isSetAccessorDeclaration(n);
const isLoop = (n) => ts.isForStatement(n) || ts.isForOfStatement(n) || ts.isForInStatement(n) || ts.isWhileStatement(n) || ts.isDoStatement(n);
function containsSuspension(node) {
  let found = false;
  function visit(child) {
    if (child !== node && isFunction(child)) return;
    if (ts.isAwaitExpression(child) || ts.isYieldExpression(child)) { found = true; return; }
    ts.forEachChild(child, visit);
  }
  visit(node);
  return found;
}
function instrument(node, owner, inGenerator = false) {
  let current = owner, skip = inGenerator;
  if (isFunction(node) && node.body) {
    current = functionName(node, owner);
    if (seen.has(current)) current += '@' + loc(node).line + ':' + loc(node).column;
    seen.add(current);
    const generator = Boolean(node.asteriskToken), id = addLabel(current, 'function', current, node, generator ? 'Generator creation/iteration is reported at its call sites; body spans may suspend.' : 'Outermost inclusive time; exclusive time and all-call count.');
    functions.push({ id, name: current, node, generator, calls: [] });
    skip = generator;
    if (!generator && (ts.isArrowFunction(node) || ts.isFunctionExpression(node))) surround(node, `__b2Wrap(${id}, ${JSON.stringify(current)}, `, ')', 100);
    else if (!generator && ts.isBlock(node.body)) {
      let start = node.body.getStart(ast) + 1;
      if (ts.isConstructorDeclaration(node)) {
        const first = node.body.statements[0];
        if (first && ts.isExpressionStatement(first) && ts.isCallExpression(first.expression) && first.expression.expression.kind === ts.SyntaxKind.SuperKeyword) start = first.end;
      }
      edits.push({ at: start, text: `\nconst __b2f${id} = __b2Enter(${id}, ${JSON.stringify(current)}); try {`, open: true, span: node.body.end - start, rank: 100 });
      edits.push({ at: node.body.end - 1, text: `} finally { __b2Exit(__b2f${id}); }\n`, open: false, span: node.body.end - start, rank: 100 });
    }
  }
  if (current && (ts.isCallExpression(node) || ts.isNewExpression(node))) {
    const expr = node.expression.getText(ast), ownerFunction = functions.findLast((f) => f.name === current);
    ownerFunction?.calls.push({ expression: oneLine(expr), ...loc(node), constructor: ts.isNewExpression(node) });
    // Named local calls already have a callee timer. Dynamic/built-in calls get
    // their own call site so receiver binding and argument evaluation stay intact.
    const local = ts.isIdentifier(node.expression) && [...functions].some((f) => f.name === expr);
    const declaredLocal = ts.isIdentifier(node.expression) && new RegExp(`(?:const|var|let|function) ${expr.replace(/[$]/g, '\\$')}(?:[ (=;])`).test(source);
    const defaultSpec = current === 'markWrite' && expr === 'staticSpec' && node.parent && ts.isParameter(node.parent);
    if (!skip && !containsSuspension(node) && defaultSpec) {
      const known = addLabel('markWrite.default staticSpec [already-interpreted child]', 'call-site', current, node, 'Default argument evaluated although known input bypasses interpretation.'), other = addLabel('markWrite.default staticSpec [target/unknown]', 'call-site', current, node);
      surround(node, `__b2DefaultSpec(${known}, ${other}, () => (`, '))');
    } else if (!skip && !containsSuspension(node) && expr !== 'super' && (ts.isNewExpression(node) || !local && !declaredLocal)) {
      const id = addLabel(`${current} :: ${ts.isNewExpression(node) ? 'new ' : ''}${oneLine(expr)} @${loc(node).line}`, 'call-site', current, node, node.questionDotToken ? 'Optional call-expression evaluation count; receiver may be absent.' : 'Includes receiver/arguments and nested callees.');
      surround(node, `__b2Expr(${id}, () => (`, '))');
    }
  }
  if (current && !skip && isLoop(node)) {
    const id = addLabel(`${current} :: loop @${loc(node).line} ${oneLine(node.getText(ast).split('{')[0])}`, 'loop-iteration', current, node, 'One count per executed loop body, not a separate pass.');
    const body = node.statement;
    if (ts.isBlock(body)) {
      edits.push({ at: body.getStart(ast) + 1, text: `const __b2l${id} = __b2Enter(${id}); try {`, open: true, span: body.end - body.getStart(ast), rank: 0 });
      edits.push({ at: body.end - 1, text: `} finally { __b2Exit(__b2l${id}); }`, open: false, span: body.end - body.getStart(ast), rank: 0 });
    } else surround(body, `{ const __b2l${id} = __b2Enter(${id}); try {`, `} finally { __b2Exit(__b2l${id}); } }`, 50);
  }
  if (current && !skip && !containsSuspension(node) && (ts.isObjectLiteralExpression(node) || ts.isArrayLiteralExpression(node))) {
    const id = addLabel(`${current} :: ${ts.isObjectLiteralExpression(node) ? 'object allocation' : 'array allocation'} @${loc(node).line} ${oneLine(node.getText(ast))}`, 'allocation', current, node);
    surround(node, `__b2Expr(${id}, () => (`, '))');
  }
  if (current && !skip && !containsSuspension(node) && ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
    const id = addLabel(`${current} :: write ${oneLine(node.left.getText(ast))} @${loc(node).line}`, 'field-write', current, node);
    surround(node, `__b2Expr(${id}, () => (`, '))');
  }
  ts.forEachChild(node, (child) => instrument(child, current, skip));
}
instrument(ast, undefined);
// At a shared boundary close inner regions, then open outer regions. Apply all
// text at one offset as a group so nested wrappers do not reverse by accident.
const byOffset = new Map();
for (const edit of edits) { const list = byOffset.get(edit.at) ?? []; list.push(edit); byOffset.set(edit.at, list); }
let output = source;
for (const [at, list] of [...byOffset].sort((a, b) => b[0] - a[0])) {
  list.sort((a, b) => a.open !== b.open ? a.open ? 1 : -1 : a.open ? b.span - a.span || b.rank - a.rank : a.span - b.span || a.rank - b.rank);
  output = output.slice(0, at) + list.map((edit) => edit.text).join('') + output.slice(at);
}
const expose = '\nexport { ' + [...currentExports, 'subscribeFieldNode', 'readFieldNodeRevision'].join(', ') + ' };\n';
const checked = ts.createSourceFile('instrumented.mjs', output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
if (checked.parseDiagnostics.length) throw new Error(ts.flattenDiagnosticMessageText(checked.parseDiagnostics[0].messageText, '\n') + ' at ' + checked.parseDiagnostics[0].start);
fs.writeFileSync(path.join(B2, 'current-baseline.mjs'), source + expose);
fs.writeFileSync(path.join(B2, 'current-profiling.mjs'), timerSource + output + expose + '\nexport { __benchStart, __benchStop };\n');
// A second instrumented copy measures the proved redundant lookup without the
// thousands of nested timers used by the exhaustive diagnostic copy.
const markFunction = functions.find((fn) => fn.name === 'markWrite');
const defaultExpression = markFunction.node.parameters[3].initializer.getText(ast);
const defaultKnown = labels.find((row) => row.name === 'markWrite.default staticSpec [already-interpreted child]');
const defaultOther = labels.find((row) => row.name === 'markWrite.default staticSpec [target/unknown]');
const rawMark = markFunction.node.getText(ast);
if (rawMark.split(defaultExpression).length !== 2) throw new Error('Ambiguous focused default-spec replacement');
const focusedMark = rawMark.replace(defaultExpression, `__b2DefaultSpec(${defaultKnown.id}, ${defaultOther.id}, () => (${defaultExpression}))`);
const focused = source.slice(0, markFunction.node.getStart(ast)) + `__b2Wrap(${markFunction.id}, "markWrite", ${focusedMark})` + source.slice(markFunction.node.end);
fs.writeFileSync(path.join(B2, 'current-focused.mjs'), timerSource + focused + expose + '\nexport { __benchStart, __benchStop };\n');

// Read all matching engine source, retaining comments and full files referenced
// by names in the bundle. This is a trace artifact, not a product-source edit.
function filesUnder(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? filesUnder(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const engineFiles = filesUnder(path.join(P, 'src/core/engine')).filter((f) => f.endsWith('.ts') && !f.includes('/__tests__/') && !f.includes('/__benchmarks__/'));
const sourceFiles = engineFiles.map((file) => ({ file: file.slice(P.length + 1), text: fs.readFileSync(file, 'utf8') }));
const sourceIndex = {};
for (const item of sourceFiles) {
  const a = ts.createSourceFile(item.file, item.text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  function index(node) {
    if ((ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name && ts.isIdentifier(node.name)) {
      const name = node.name.text, p = a.getLineAndCharacterOfPosition(node.getStart(a));
      (sourceIndex[name] ??= []).push({ file: item.file, line: p.line + 1 });
    }
    ts.forEachChild(node, index);
  }
  index(a);
}
for (const row of labels) row.source = sourceIndex[row.owner?.split(/[.: ]/)[0]] ?? [];
const trace = functions.map(({ id, name, calls, generator }) => ({ id, name, calls, generator, source: sourceIndex[name.split(/[.: ]/)[0]] ?? [], bundleLine: labels[id].line }));
fs.writeFileSync(path.join(B2, 'labels.json'), JSON.stringify(labels, null, 2) + '\n');
fs.writeFileSync(path.join(B2, 'trace.json'), JSON.stringify(trace, null, 2) + '\n');
const used = new Set(trace.flatMap((fn) => fn.source.map((s) => s.file)));
fs.writeFileSync(path.join(B2, 'source-audit.md'), '# Engine source read for B2\n\n' + sourceFiles.filter((f) => used.has(f.file)).map((f) => '## ' + f.file + '\n\n```ts\n' + f.text + '\n```').join('\n\n'));
const record = { kind: 'b2-builder', runtime: runtime(), engineSha256: sha(bytes), files: ['current-source.mjs', 'current-baseline.mjs', 'current-profiling.mjs', 'current-focused.mjs'].map((file) => ({ file, sha256: sha(fs.readFileSync(path.join(B2, file))) })), labels: labels.length, functions: functions.length, sourceFilesRead: sourceFiles.length, sourceFilesArchived: used.size, allBundleFunctionsInstrumented: true, generatorBodyException: 'Suspending generator bodies and await-containing expression splits are excluded; their call sites/function entry remain covered where synchronous. None is exercised by BN all-keys.', focused: 'Only markWrite entry and its default staticSpec expression; no nested timers inside staticSpec.', hotSpots: ['markWrite', 'computeStableNode', 'markCommitDeliveries'], adjacentStage: 'registerRecalculation' };
fs.writeFileSync(path.join(B2, 'build.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record));
