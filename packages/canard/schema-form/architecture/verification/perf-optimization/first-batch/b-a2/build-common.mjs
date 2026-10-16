// Imported by make-current.mjs and make-legacy.mjs to create measurement copies outside product sources.
// Loaded by the three builders; only SB receives copies, manifests and dependency links.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SB, W, sources, expectedSha, sha, currentExports, legacyExports, runtime, sourceVersion } from './config.mjs';

export function prepare(engine) {
  const bytes = fs.readFileSync(sources[engine]);
  const digest = sha(bytes);
  if (digest !== expectedSha[engine]) throw new Error(`Unexpected ${engine} source SHA: ${digest}`);
  const link = path.join(SB, 'node_modules');
  if (!fs.existsSync(link)) fs.symlinkSync(path.join(W, 'node_modules'), link, 'dir');
  if (fs.realpathSync(link) !== fs.realpathSync(path.join(W, 'node_modules'))) throw new Error('Unexpected SB/node_modules target');
  fs.mkdirSync(path.join(SB, 'out'), { recursive: true });
  write(`${engine}-source.mjs`, bytes);
  return bytes.toString('utf8');
}
export function write(filename, bytes) {
  if (path.basename(filename) !== filename) throw new Error('Bundle filename must stay directly inside SB');
  fs.writeFileSync(path.join(SB, filename), bytes);
}
export function expose(src, engine) {
  const names = engine === 'current' ? currentExports : legacyExports;
  for (const name of names) if (!new RegExp(`^(?:const|let|var|function|class) ${name}(?:[ (=;])`, 'm').test(src)) throw new Error(`Missing export target ${name}`);
  return `${src}\nexport { ${names.join(', ')} };\n`;
}
export function once(src, pattern, replacement) {
  const count = src.split(pattern).length - 1;
  if (count !== 1) throw new Error(`Expected exactly one patch match; found ${count}: ${pattern.slice(0, 100)}`);
  return src.replace(pattern, () => replacement);
}
export function emit(engine, files, extra = {}) {
  const record = { kind: 'builder', runtime: runtime(), engine, version: sourceVersion(engine), engineSha256: sha(fs.readFileSync(sources[engine])), files: files.map((file) => ({ file, sha256: sha(fs.readFileSync(path.join(SB, file))) })), ...extra };
  fs.writeFileSync(path.join(SB, `${engine}-${extra.variantBuilder ? 'variants' : 'instrumentation'}.json`), JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify(record));
}

// Each name has an outermost inclusive timer and an all-call count. Stage intervals
// are disjoint: the innermost instrumented stage owns each interval. Envelope-only
// wrappers leave unassigned time in "other". Inclusive function times never add up.
export const timerSource = `
let __benchEnabled = false, __benchStack = [], __benchCalls = [], __benchIntervals = [], __benchSegments = [], __benchLast = 0, __benchStartAt = 0;
const __benchDepth = Object.create(null);
const __benchOwner = () => { for (let i = __benchStack.length - 1; i >= 0; i--) if (__benchStack[i].stage !== 'envelope') return __benchStack[i].stage; return 'other'; };
const __benchAdvance = (at) => { __benchSegments.push([__benchLast, at, __benchOwner()]); __benchLast = at; };
const __benchWrap = (name, stage, raw) => function(...args) {
  if (!__benchEnabled) return Reflect.apply(raw, this, args);
  const at = performance.now(); __benchAdvance(at); __benchCalls.push([name, at]);
  const outer = !__benchDepth[name]; __benchDepth[name] = (__benchDepth[name] || 0) + 1;
  const interval = outer ? [name, at, Infinity] : undefined;
  if (interval) __benchIntervals.push(interval);
  __benchStack.push({ name, stage });
  try { return Reflect.apply(raw, this, args); }
  finally { const end = performance.now(); __benchAdvance(end); __benchStack.pop(); __benchDepth[name]--; if (interval) interval[2] = end; }
};
const __benchStart = (at = performance.now()) => {
  if (__benchStack.length) throw new Error('Cannot reset timers during an instrumented call');
  __benchCalls = []; __benchIntervals = []; __benchSegments = [];
  for (const key of Object.keys(__benchDepth)) delete __benchDepth[key];
  __benchStartAt = __benchLast = at; __benchEnabled = true;
};
const __benchStop = (cutoff = performance.now()) => {
  __benchAdvance(performance.now()); __benchEnabled = false;
  const ms = Object.create(null), calls = Object.create(null), stagesMs = Object.create(null);
  for (const [name, start, end] of __benchIntervals) if (start <= cutoff) ms[name] = (ms[name] || 0) + Math.max(0, Math.min(end, cutoff) - start);
  for (const [name, at] of __benchCalls) if (at <= cutoff) calls[name] = (calls[name] || 0) + 1;
  for (const [start, end, stage] of __benchSegments) if (start <= cutoff) stagesMs[stage] = (stagesMs[stage] || 0) + Math.max(0, Math.min(end, cutoff) - start);
  return { ms, calls, stagesMs, capturedMs: cutoff - __benchStartAt };
};
`;

export function instrumentCurrent(src, stageMap) {
  const missing = [], names = [];
  let result = src;
  for (const [stage, list] of Object.entries(stageMap)) for (const name of list) {
    const pattern = new RegExp(`^const ${name} = `, 'gm');
    const matches = [...result.matchAll(pattern)];
    if (!matches.length) { missing.push(name); continue; }
    if (matches.length !== 1) throw new Error(`Ambiguous const ${name}`);
    const at = matches[0].index;
    result = result.slice(0, at) + result.slice(at).replace(new RegExp(`^const ${name} = `), `const ${name} = __benchWrap(${JSON.stringify(name)}, ${JSON.stringify(stage)}, (...args) => ${name}__raw(...args));\nconst ${name}__raw = `);
    names.push(name);
  }
  return { source: timerSource + result + '\nexport { __benchStart, __benchStop };\n', missing, names };
}

export function instrumentLegacy(src, stageMap) {
  const require = createRequire(import.meta.url);
  const ts = require('typescript');
  const ast = ts.createSourceFile('legacy.mjs', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const found = new Map(), inserts = [];
  const walk = (node, owner) => {
    let nextOwner = owner;
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isClassExpression(node.initializer)) nextOwner = node.name.getText(ast);
    if (ts.isMethodDeclaration(node) && owner) found.set(`${owner}.${node.name.getText(ast)}`, node);
    if (owner === 'BranchStrategy' && ts.isVariableDeclaration(node) && node.name.getText(ast) === 'handleChangeFactory') {
      const inner = node.initializer?.body;
      if (!inner || !ts.isArrowFunction(inner) || !ts.isBlock(inner.body)) throw new Error('Unexpected handleChangeFactory callback shape');
      found.set('BranchStrategy.handleChangeFactory.callback', inner);
    }
    ts.forEachChild(node, (child) => walk(child, nextOwner));
  };
  walk(ast, undefined);
  const missing = [], names = [], wraps = [];
  for (const [stage, list] of Object.entries(stageMap)) for (const name of list) {
    if (!name.includes('.')) {
      if (!new RegExp(`^const ${name} = `, 'm').test(src)) { missing.push(name); continue; }
      names.push(name);
      continue;
    }
    if (!found.has(name)) { missing.push(name); continue; }
    names.push(name);
    if (name === 'BranchStrategy.handleChangeFactory.callback') {
      const node = found.get(name);
      inserts.push({ at: node.getStart(ast), text: `__benchWrap(${JSON.stringify(name)}, ${JSON.stringify(stage)}, ` }, { at: node.end, text: ')' });
    } else {
      const split = name.lastIndexOf('.'), owner = name.slice(0, split), method = name.slice(split + 1);
      wraps.push(`${owner}.prototype[${JSON.stringify(method)}] = __benchWrap(${JSON.stringify(name)}, ${JSON.stringify(stage)}, ${owner}.prototype[${JSON.stringify(method)}]);`);
    }
  }
  // AST offsets refer to the original bytes: apply the callback insertion first.
  let callbackSrc = src;
  for (const edit of inserts.sort((a, b) => b.at - a.at)) callbackSrc = callbackSrc.slice(0, edit.at) + edit.text + callbackSrc.slice(edit.at);
  for (const [stage, list] of Object.entries(stageMap)) for (const name of list) if (!name.includes('.') && names.includes(name)) callbackSrc = once(callbackSrc, `const ${name} = `, `const ${name} = __benchWrap(${JSON.stringify(name)}, ${JSON.stringify(stage)}, (...args) => ${name}__raw(...args));\nconst ${name}__raw = `);
  return { source: timerSource + callbackSrc + '\n' + wraps.join('\n') + '\nexport { __benchStart, __benchStop };\n', missing, names };
}
