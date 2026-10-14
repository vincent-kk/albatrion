// Invoked explicitly by the round-102 CLI; product edits exist only in esbuild memory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import inspector from 'node:inspector';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script);
const directory = path.dirname(artifacts);
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const HEAD = '268832c7cb6eea67475b56ab5a78408a55ec47a3';
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const require = createRequire(path.join(repo, 'package.json'));
process.env.NODE_PATH = path.join(repo, 'node_modules');
require('node:module').Module._initPaths();
const ts = require('typescript');
const { TraceMap, originalPositionFor } = require('@jridgewell/trace-mapping');
const started = new Date().toISOString(), startedMs = Date.now();
const fixtures = ['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0'];
const scaleFixtures = ['nested-d3-f4', 'nested-d4-f4', 'nested-d5-f4', 'flat-100', 'flat-500', 'flat-1000', 'oneOf-5', 'oneOf-10', 'oneOf-20', 'oneOf-40', 'sample-0'];
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), HEAD);

/** Persist bounded measurement artifacts; bundles are handled only by the scratch builder. */
function save(file, value) {
  assert(path.resolve(file).startsWith(artifacts + path.sep), file);
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000, file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** Match an exact source anchor before applying a memory-only substitution. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before.slice(0, 100));
  return source.replace(before, after);
}

/** Apply one named function-body transform while preserving its original source coordinates. */
function bodyTransform(source, file, name, callback, className) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const matches = [];
  const visit = node => {
    const label = node.name?.getText(tree) ?? node.parent?.name?.getText(tree);
    if (node.body && label === name && (!className || node.parent.name?.getText(tree) === className)) matches.push(node);
    ts.forEachChild(node, visit);
  };
  visit(tree);
  assert.equal(matches.length, 1, file + ':' + name);
  const node = matches[0], original = ts.isBlock(node.body) ? node.body.getText(tree) : `{ return ${node.body.getText(tree)}; }`;
  return source.slice(0, node.body.getStart(tree)) + callback(original, node) + source.slice(node.body.end);
}

/** Count function entries, loop iterations, freezes, path productions and string sizes; never timed. */
function instrument(source, file) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const relative = path.relative(repo, file), edits = [];
  const at = (node, kind, name) => `${kind}|${relative}:${tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1}|${name}`;
  const insert = (position, text, priority = 0) => edits.push({ position, text, priority });
  const hit = id => `globalThis.__work102.hit(${JSON.stringify(id)});`;
  const wrap = (node, id) => {
    insert(node.getStart(tree), `globalThis.__work102.value(${JSON.stringify(id)},(`, 1);
    insert(node.end, '))', -1);
  };
  const visit = (node, owner = '') => {
    if (ts.isTypeNode(node)) return;
    let current = owner;
    if (ts.isFunctionLike(node) && node.body) {
      let label = node.name?.getText(tree) ?? node.parent?.name?.getText(tree);
      if (ts.isConstructorDeclaration(node)) label = `${node.parent.name?.getText(tree) ?? 'class'}.constructor`;
      if (!label || label.length > 80) label = `${owner || 'anonymous'}.callback`;
      if ((ts.isMethodDeclaration(node) || ts.isGetAccessor(node) || ts.isSetAccessor(node)) && node.parent.name)
        label = `${node.parent.name.getText(tree)}.${label}${ts.isGetAccessor(node) ? '.get' : ts.isSetAccessor(node) ? '.set' : ''}`;
      current = label;
      const id = at(node, 'function', label);
      if (ts.isBlock(node.body)) {
        insert(node.body.getStart(tree) + 1, hit(id));
        if (label === 'readAllowedTypes' || label === 'extractSchemaInfo')
          insert(node.body.getStart(tree) + 1, `globalThis.__work102.schema(${JSON.stringify(label)},${label === 'readAllowedTypes' ? 'schema,schemaPath' : 'jsonSchema,undefined'});`, -2);
        if (label === 'collectDeclarations')
          insert(node.body.getStart(tree) + 1, 'globalThis.__work102.schema("collectDeclarations",input.schema,input.schemaPath);', -2);
        if (label === 'mergeSchemaContributions')
          insert(node.body.getStart(tree) + 1, 'globalThis.__work102.schema("mergeSchemaContributions",node,(options.mode??"runtime")+":"+declarations.map(item=>item.id).join(","));', -2);
        if (label === 'evaluateGate')
          insert(node.body.getStart(tree) + 1, 'globalThis.__work102.schema("evaluateGate",gate,owner.path+":"+(edgeName??""));', -2);
        if (label === 'readProjectedValue')
          insert(node.body.getStart(tree) + 1, 'globalThis.__work102.schema("readProjectedValue",context,path);', -2);
        if (label === 'resolveDependencyPath')
          insert(node.body.getStart(tree) + 1, 'globalThis.__work102.key("resolveDependencyPath",hostPath+"|"+dependency);', -2);
      } else {
        const identity = label === 'readSchemaObject' ? 'globalThis.__work102.schema("readSchemaObject",schema,undefined),' : '';
        insert(node.body.getStart(tree), `(globalThis.__work102.hit(${JSON.stringify(id)}),${identity}(`, 2);
        insert(node.body.end, '))', -2);
      }
    }
    if (ts.isIterationStatement(node, false)) {
      const id = at(node, 'loop', current);
      if (ts.isBlock(node.statement)) insert(node.statement.getStart(tree) + 1, hit(id));
      else {
        insert(node.statement.getStart(tree), '{' + hit(id), 3);
        insert(node.statement.end, '}', -3);
      }
    }
    if (ts.isCallExpression(node)) {
      const expression = node.expression.getText(tree);
      if (expression === 'Object.freeze') wrap(node, at(node, 'freeze', current));
      if (expression === 'joinSegment') wrap(node, at(node, 'path-string', current));
      if (/\.(join|split|slice|substring|stringify)$/.test(expression) && /path|pointer|dependency|key/i.test(node.getText(tree)))
        wrap(node, at(node, 'path-operation', current));
    }
    if (ts.isNewExpression(node) && node.expression.getText(tree) === 'Function') {
      insert(node.getStart(tree), `globalThis.__work102.dynamic(${JSON.stringify(at(node, 'dynamic-create', current))},(`, 1);
      insert(node.end, '))', -1);
    }
    if (ts.isTemplateExpression(node) && /path|pointer|dependency/i.test(node.getText(tree)))
      wrap(node, at(node, 'path-string', current));
    if (ts.isSpreadElement(node)) wrap(node.expression, at(node, 'array-spread', current));
    ts.forEachChild(node, child => visit(child, current));
  };
  visit(tree);
  for (const edit of edits.sort((a, b) => b.position - a.position || a.priority - b.priority))
    source = source.slice(0, edit.position) + edit.text + source.slice(edit.position);
  return source;
}

/** Intra-mount semantic memo or seed replay removes work, allowing deliberately inaccurate bounds. */
function memoBody(source, file, name, key) {
  return bodyTransform(source, file, name, original => `{ const memo=globalThis.__bound102.memo; const object=${key}; let entries=memo.get(object); if(entries?.has(${JSON.stringify(name)}))return entries.get(${JSON.stringify(name)}); const result=(()=>${original})(); if(!entries)memo.set(object,entries=new Map()); entries.set(${JSON.stringify(name)},result); return result; }`);
}

/** Replay a deterministic function's result by occurrence; capture happens in the first warmup. */
function tapeBody(source, file, name, className) {
  return bodyTransform(source, file, name, original => `{ const state=globalThis.__bound102,key=${JSON.stringify(name)};const index=state.cursors[key]??0;state.cursors[key]=index+1;const tape=state.tapes[key]??=[];if(state.replay){assertTape102(index<tape.length,key);return tape[index];}const result=(()=>${original})();tape[index]=result;return result; }`,className) + '\nconst assertTape102=(ok,key)=>{if(!ok)throw new Error("Tape exhausted: "+key);};\n';
}

/** Bind repeated dependency resolution to its two string inputs inside the current mount. */
function stringMemoBody(source, file, name, keys) {
  return bodyTransform(source, file, name, original => `{ const state=globalThis.__bound102;const key=${keys};const memo=state.strings??=new Map();if(memo.has(key))return memo.get(key);const result=(()=>${original})();memo.set(key,result);return result; }`);
}

/** Replay scalar path values only, skipping their depth-proportional construction in measured mounts. */
function replayPaths(source, file) {
  if (file.endsWith('/getTemplateKey.ts')) return tapeBody(source, file, 'getTemplateKey');
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true), edits = [];
  const visit = (node, inFunction = false) => {
    if (ts.isTypeNode(node)) return;
    const selected = ts.isTemplateExpression(node) && /path|pointer|dependency/i.test(node.getText(tree)) ||
      ts.isCallExpression(node) && node.expression.getText(tree) === 'JSON.stringify' && /key|path/i.test(node.getText(tree));
    if (selected && inFunction) {
      const key = JSON.stringify(path.relative(pkg, file) + ':' + node.getStart(tree));
      edits.push({ begin: node.getStart(tree), end: node.end, text: `(globalThis.__bound102.replay?globalThis.__bound102.take(${key}):globalThis.__bound102.capture(${key},(${node.getText(tree)})))` });
      return;
    }
    ts.forEachChild(node, child => visit(child, inFunction || Boolean(ts.isFunctionLike(node) && node.body)));
  };
  visit(tree);
  for (const edit of edits.sort((a,b)=>b.begin-a.begin)) source=source.slice(0,edit.begin)+edit.text+source.slice(edit.end);
  return source;
}

/** Capture outer declaration collection and its analysis state, then replay only that work family. */
function replayDeclarations(source, file) {
  return bodyTransform(source,file,'collectDeclarations',original=>`{
    const state=globalThis.__bound102;
    if(state.collectDepth)return(()=>${original})();
    const key='declarations',at=state.cursors[key]??0;state.cursors[key]=at+1;
    const tape=state.tapes[key]??=[];
    if(state.replay){const held=tape[at];if(!held)throw new Error('Declaration tape exhausted');
      for(const fragment of held.fragments)context.fragments.push(fragment);
      context.declarationId=held.nextId;Object.assign(context.capabilities,held.capabilities);
      if(held.owners)context.declarationOwners=held.owners;if(held.branches)context.discriminatorBranches=held.branches;
      return held.result;}
    const begin=context.fragments.length;state.collectDepth=1;const result=(()=>${original})();state.collectDepth=0;
    tape[at]={result,fragments:context.fragments.slice(begin),nextId:context.declarationId,capabilities:{...context.capabilities},owners:context.declarationOwners,branches:context.discriminatorBranches};return result;
  }`);
}

/** Replay child input enumeration/binding without replaying recursive node construction. */
function replayChildInputs(source) {
  const begin=source.indexOf('  const properties = '),end=source.indexOf('  const entries = ');
  assert(begin>=0&&end>begin);
  const prefix=source.slice(begin,end);
  const helper=`\nconst childInputs102=(context,node)=>{
    const state=globalThis.__bound102,key='childInputs',at=state.cursors[key]??0;state.cursors[key]=at+1;const tape=state.tapes[key]??=[];
    if(state.replay){const held=tape[at];if(!held)throw new Error('Child input tape exhausted');
      for(const inputs of held.properties.values())for(const input of inputs)if(input.fragment)input.fragment=context.fragments[input.fragment.id];
      for(const inputs of held.tuples.values())for(const input of inputs)if(input.fragment)input.fragment=context.fragments[input.fragment.id];
      for(const input of held.itemInputs)if(input.fragment)input.fragment=context.fragments[input.fragment.id];return held;}
    ${prefix}
    return tape[at]={properties,itemInputs,tuples};
  };\n`;
  source=source.slice(0,begin)+'  const {properties,itemInputs,tuples}=childInputs102(context,node);\n'+source.slice(end);
  const a=source.indexOf('      const declarations = child.declarations.map('),b=source.indexOf('      entries.push(',a);
  assert(a>=0&&b>a);
  const expression=source.slice(a,b).trim().slice('const declarations = '.length,-1);
  source=source.slice(0,a)+'      const declarations=boundDeclarations102(child,node,name,path,inputs);\n'+source.slice(b);
  return source+helper+`\nconst boundDeclarations102=(child,node,name,path,inputs)=>{
    const state=globalThis.__bound102,key='boundDeclarations',at=state.cursors[key]??0;state.cursors[key]=at+1;const tape=state.tapes[key]??=[];
    if(state.replay){if(!tape[at])throw new Error('Bound declarations exhausted');return tape[at];}return tape[at]=${expression};
  };\n`;
}

/** Flatten fragment declarations into one shared sink while keeping visit, ID and diagnostic order. */
function declarationSink(source,file) {
  source=once(source,'  ownerId?: number,','  ownerId?: number,\n  sink?: PropertyDeclaration[],');
  source=once(source,'  const result = [declaration];','  const result = sink ?? [];\n  result.push(declaration);');
  const tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true),edits=[];
  const visit=node=>{
    if(ts.isCallExpression(node)&&node.expression.getText(tree)==='collectDeclarations'){
      const parent=node.parent?.parent;
      if(ts.isCallExpression(parent)&&parent.expression.getText(tree)==='result.push')
        edits.push({begin:parent.getStart(tree),end:parent.end,text:`collectDeclarations(${node.arguments.map(arg=>arg.getText(tree)).join(',')},result)`});
    }
    ts.forEachChild(node,visit);
  };
  visit(tree);assert.equal(edits.length,2);
  for(const edit of edits.sort((a,b)=>b.begin-a.begin))source=source.slice(0,edit.begin)+edit.text+source.slice(edit.end);
  return source;
}

/** Transform only the selected work family; original/control profiles have no counting machinery. */
function transform(file, source, variant) {
  if (variant.includes('count')) return instrument(source, file);
  const rel = path.relative(pkg, file);
  if (variant === 'declarations-replay' && rel.endsWith('/collectDeclarations.ts')) return replayDeclarations(source,file);
  if (variant === 'children-replay' && rel.endsWith('/populateNodeChildren.ts')) return replayChildInputs(source);
  if (variant === 'path-strings-replay') return replayPaths(source,file);
  if (variant === 'allowed-once' && rel.endsWith('/readAllowedTypes.ts'))
    return memoBody(source, file, 'readAllowedTypes', 'schema');
  if (variant === 'schema-read-once' && rel.endsWith('/readSchemaObject.ts'))
    return memoBody(source, file, 'readSchemaObject', 'schema');
  if (variant === 'merge-once' && rel.endsWith('/mergeSchemaContributions.ts'))
    return memoBody(source, file, 'mergeSchemaContributions', 'node');
  if (variant === 'merge-selection-once' && rel.endsWith('/mergeSchemaContributions.ts'))
    return bodyTransform(source,file,'mergeSchemaContributions',original=>`{ const state=globalThis.__bound102;let memo=state.memo.get(node);if(!memo)state.memo.set(node,memo=new Map());const key=declarations.map(item=>item.id).join(',');if(memo.has(key))return memo.get(key);const result=(()=>${original})();memo.set(key,result);return result; }`);
  if (variant === 'merge-replay' && rel.endsWith('/mergeSchemaContributions.ts'))
    return tapeBody(source, file, 'mergeSchemaContributions');
  if (variant === 'types-replay' && rel.endsWith('/resolveNodeTypes.ts'))
    return tapeBody(source, file, 'resolveNodeTypes');
  if (variant === 'strategy-replay' && rel.endsWith('/resolveNodeStrategy.ts'))
    return tapeBody(source, file, 'resolveNodeStrategy');
  if (variant === 'template-replay' && rel.endsWith('/getTemplateKey.ts'))
    return tapeBody(source, file, 'getTemplateKey');
  if (variant === 'freeze-zero')
    return source.replace(/Object\.freeze\(/g, 'freezeIdentity102(') + '\nfunction freezeIdentity102(value){return value;}\n';
  if (variant === 'shape-once' && rel.endsWith('/validateShape.ts'))
    return once(source, 'for (const node of context.nodes) visitShape(context, node, complete, active);', 'visitShape(context, context.nodes[0], complete, active);');
  if (variant === 'child-targets-zero' && rel.endsWith('/validateChildTargets.ts'))
    return bodyTransform(source, file, 'validateChildTargets', () => '{ return; }');
  if (variant === 'dependency-replay' && rel.endsWith('/getDependencyIndex.ts'))
    return tapeBody(source, file, 'getDependencyIndex');
  if (variant === 'path-index-zero' && rel.endsWith('/PathKeyedMap.ts'))
    return once(source, 'if (!this.has(key)) this.pathIndex.add(key, getStoreKeyPaths(key, this.mode));', 'void key;');
  if (variant === 'gate-replay' && rel.endsWith('/resolveDependencyPath.ts'))
    return tapeBody(source, file, 'resolveDependencyPath');
  if (variant === 'dependency-paths-once' && rel.endsWith('/resolveDependencyPath.ts'))
    return stringMemoBody(source,file,'resolveDependencyPath',"hostPath+'\\u0000'+dependency");
  if (variant === 'gates-once' && rel.endsWith('/evaluateGate.ts'))
    return bodyTransform(source,file,'evaluateGate',original=>`{const state=globalThis.__bound102;let memo=state.memo.get(gate);if(!memo)state.memo.set(gate,memo=new Map());const key=owner.path+'|'+(edgeName??'');if(memo.has(key))return memo.get(key);const result=(()=>${original})();memo.set(key,result);return result;}`);
  if (variant === 'projected-once' && rel.endsWith('/readProjectedValue.ts'))
    return stringMemoBody(source,file,'readProjectedValue',"'projected|'+path");
  if (variant === 'registry-replay' && rel.endsWith('/getGateRegistry.ts'))
    return tapeBody(source,file,'locate','GateRegistry');
  if (variant === 'budget-replay' && rel.endsWith('/getGateBudgetCap.ts'))
    return bodyTransform(source,file,'getIndex',()=>`{return {decisionsByGate:{get:(gate)=>[gate.schemaPath]},transitionCap:(blueprint.schema.oneOf?.length??0)+1};}`);
  if (variant === 'constraint-present' && rel.endsWith('/applyConstraintKeywords.ts'))
    return bodyTransform(source,file,'applyConstraintKeywords',original=>`{if(!Object.keys(source).some(key=>['minimum','maximum','exclusiveMinimum','exclusiveMaximum','minLength','maxLength','minItems','maxItems','minProperties','maxProperties','multipleOf','enum','const'].includes(key)))return;return(()=>${original})();}`);
  if (variant === 'revision-initial-empty' && rel.endsWith('/SchemaNodeRevisionLedger.ts'))
    return once(source,'Array.from({ length: 17 }, (_, index) => previous[1 << index])','[]');
  if (variant === 'order-once' && rel.endsWith('/collectDeclarations.ts'))
    return once(source,'order: Object.freeze([...input.order]),','order: Object.freeze(input.order),');
  if (variant === 'declaration-sink' && rel.endsWith('/collectDeclarations.ts')) return declarationSink(source,file);
  return source;
}

// The committed round-99 builder is canonical; patch its paths and plugin in memory only.
let canonical = fs.readFileSync(path.join(directory, 'tools/profile-99c01.mjs'), 'utf8');
canonical = canonical.slice(0, canonical.indexOf('const [command, ...args] = process.argv.slice(2);'));
canonical = once(canonical, 'const script = fileURLToPath(import.meta.url);', 'const script = ' + JSON.stringify(path.join(directory, 'tools/profile-99c01.mjs')) + ';');
canonical = once(canonical, "const work = path.join(output, '.profile-99c01-work');", 'const work = ' + JSON.stringify(bundles) + ';');
canonical = once(canonical, "const head = '4ae9dced58bcbc05c05ff5907fca463af024c7b6';", 'const head = ' + JSON.stringify(HEAD) + ';');
canonical = once(canonical, "  const edits = variant === 'head' || variant === 'old' ? [] :\n    JSON.parse(fs.readFileSync(path.join(output, 'profile-99c01/profile-99c01-ablations.json'), 'utf8')).find(item => item.id === variant)?.edits;", '  const edits = [];');
canonical = once(canonical, "variant === 'old' ? 'src/__legacy__/core/nodeFromJSONSchema.ts'", "variant.includes('old') ? 'src/__legacy__/core/nodeFromJSONSchema.ts'");
canonical = once(canonical, "ablateSource(file, fs.readFileSync(file, 'utf8'), edits)", "globalThis.__transform102(file,fs.readFileSync(file,'utf8'),variant)");
canonical = once(canonical, 'outfile: path.join(work, `${variant}.cjs`)', 'outfile: path.join(work, `profile102-${variant}.cjs`)');
canonical += '\nexport { buildAsync, fixtureFor, create, observe, environment };\n';
globalThis.__transform102 = transform;
const api = await import('data:text/javascript;base64,' + Buffer.from(canonical).toString('base64'));

/** Extend only the size dial, preserving the benchmark-form authored fixture shape. */
function fixtureFor(engine, name) {
  const found = engine.equivalentFixtures.find(row => row.name === name);
  if (found && !name.startsWith('oneOf-')) return found;
  if (name.startsWith('oneOf-')) return api.fixtureFor(engine, name);
  let schema;
  if (/^fragment-(chain|flat)-\d+$/.test(name)) {
    const count=Number(name.match(/(\d+)$/)[1]);
    const chain=remaining=>remaining?{type:'string',default:'fragment',allOf:[chain(remaining-1)]}:{type:'string',default:'fragment'};
    schema=name.startsWith('fragment-chain-')?chain(count):{type:'string',default:'fragment',allOf:Array.from({length:count},()=>({type:'string'}))};
  } else if (name.startsWith('flat-')) {
    const count = Number(name.slice(5)), properties = {};
    for (let i = 0; i < count; i++) properties[`field_${String(i).padStart(3, '0')}`] = { type: 'string', default: `value_${i}` };
    schema = { type: 'object', properties };
  } else {
    const depth = Number(name.match(/^nested-d(\d+)-f4$/)?.[1]);
    assert(depth);
    const level = remaining => remaining ? { type: 'object', properties: Object.fromEntries(Array.from({ length: 4 }, (_, i) => [`n${i}`, level(remaining - 1)])) } : { type: 'string', default: 'leaf' };
    schema = level(depth);
  }
  return { name, workspace: schema, legacy: structuredClone(schema), interactions: [] };
}

const bundleFor = variant => path.join(bundles, `profile102-${variant}.cjs`);
const metric = values => {
  const sorted = values.toSorted((a, b) => a - b), q = p => sorted[Math.ceil(sorted.length * p) - 1];
  return { n: values.length, median: q(.5), p5: q(.05), p95: q(.95), p99: q(.99), mean: values.reduce((a, b) => a + b, 0) / values.length };
};

/** Capture the endpoint inside the check-queue sentinel after exactly 64 checkpoints. */
async function measured(operation) {
  const beginUs = Number(process.hrtime.bigint() / 1000n), begin = performance.now();
  const root = operation();
  for (let i = 0; i < 64; i++) await Promise.resolve();
  const ending = await new Promise(resolve => setImmediate(() => resolve({ end: performance.now(), endUs: Number(process.hrtime.bigint() / 1000n) })));
  return { root, ms: ending.end - begin, begin, beginUs, ...ending };
}

/** Count live runtime nodes outside clocks, keeping template and schema counts separate. */
function dimensions(root, fixture) {
  const live = [], pending = [root], seen = new Set();
  while (pending.length) {
    const node = pending.pop();
    if (!node || seen.has(node)) continue;
    seen.add(node); live.push(node);
    for (const child of node.children ?? []) pending.push(child.node ?? child);
  }
  const b = root.runtime?.blueprint ?? root.blueprint;
  let schemas = 0, depthSum = 0;
  const walk = (schema, depth) => {
    if (!schema || typeof schema !== 'object') return;
    if (schema.type !== undefined || schema.properties || schema.items || schema.oneOf) { schemas++; depthSum += depth; }
    for (const child of Object.values(schema.properties ?? {})) walk(child, depth + 1);
    for (const key of ['oneOf', 'anyOf', 'allOf', 'prefixItems']) for (const child of schema[key] ?? []) walk(child, depth + 1);
    if (schema.items && !Array.isArray(schema.items)) walk(schema.items, depth + 1);
  };
  walk(fixture.workspace, 0);
  return { liveNodes: live.length, blueprintNodes: b?.nodes.length, fragments: b?.fragments.length,
    schemaObjects: schemas, schemaDepthSum: depthSum, runtimeKeys: Object.keys(root).filter(key => /runtime|blueprint/.test(key)) };
}

/** Fresh count-only mount; external production utilities receive the same entry/loop counters. */
async function counts(version, name) {
  const counts = {}, sizes = {}, identities = {}, unique = {}, identityMaps = {};
  globalThis.__work102 = {
    hit(id) { counts[id] = (counts[id] ?? 0) + 1; },
    dynamic(id,fn) { this.hit(id); const counter=this; return function(...args){counter.hit(id.replace('dynamic-create|','dynamic-call|'));return Reflect.apply(fn,this,args);}; },
    value(id, value) { this.hit(id); if(id.startsWith('freeze|'))this.schema('freeze',value,undefined); if (typeof value === 'string' || Array.isArray(value)) sizes[id] = (sizes[id] ?? 0) + value.length; return value; },
    schema(kind, schema, schemaPath) {
      if (!schema || typeof schema !== 'object') return;
      const map = identityMaps[kind] ??= new WeakMap();
      let id = map.get(schema);
      if (id === undefined) { id = unique[kind] ?? 0; unique[kind] = id + 1; map.set(schema, id); }
      const key = `${kind}|${id}|${schemaPath ?? ''}`;
      identities[key] = (identities[key] ?? 0) + 1;
    },
    key(kind,key){const id=kind+'|'+key;identities[id]=(identities[id]??0)+1;},
  };
  const Module = require('node:module');
  const original = Module._extensions['.js'];
  Module._extensions['.js'] = (module, file) => {
    if (/\/packages\/winglet\/[^/]+\/dist\/.*\.(cjs|js)$/.test(file)) module._compile(instrument(fs.readFileSync(file, 'utf8'), file), file);
    else original(module, file);
  };
  const engine = require(bundleFor(version + '-count')), fixture = fixtureFor(engine, name);
  for (const key of Object.keys(counts)) delete counts[key];
  for (const key of Object.keys(sizes)) delete sizes[key];
  for (const target of [identities,unique,identityMaps])for(const key of Object.keys(target))delete target[key];
  const sample = await measured(() => api.create(engine, fixture, version, structuredClone(version === 'old' ? fixture.legacy : fixture.workspace)));
  const captured = { ...counts }, capturedSizes = { ...sizes };
  const observed = api.observe(sample.root), dims = dimensions(sample.root, fixture);
  dims.constructedNodes = Object.entries(captured).filter(([key]) => key.startsWith('function|') && (version === 'old' ? key.endsWith('|AbstractNode.constructor') : key.endsWith('|SchemaNode.constructor'))).reduce((sum, [, value]) => sum + value, 0);
  save(path.join(artifacts, `counts-${version}-${name}.json`), { HEAD, version, name, countingOnly: true, dimensions: dims, counts: captured, stringCharacters: capturedSizes, schemaIdentities: identities, uniqueSchemas: unique, observed });
  console.log(JSON.stringify({ version, name, dimensions: dims, sites: Object.keys(captured).length, outputHash: observed.sha256 }));
}

/** A fresh timer worker runs one forced pair or two contiguous steady blocks, twenty warmups each. */
async function timing(variant, name, run, regime) {
  const engines = { head: require(bundleFor('head')), variant: require(bundleFor(variant)) };
  const fixture = fixtureFor(engines.head, name), data = { head: [], variant: [] }, last = {}, windows = [], actualMounts = { head: 0, variant: 0 };
  globalThis.__bound102 = { memo: new WeakMap(), tapes: {}, cursors: {}, replay: false,
    take(key){const at=this.cursors[key]??0;this.cursors[key]=at+1;const tape=this.tapes[key];if(!tape||at>=tape.length)throw new Error('Path tape exhausted: '+key);return tape[at];},
    capture(key,value){const at=this.cursors[key]??0;this.cursors[key]=at+1;(this.tapes[key]??=[])[at]=value;return value;},
  };
  const emptyBefore = [], emptyAfter = [];
  for (let i = 0; i < 101; i++) emptyBefore.push((await measured(() => {})).ms);
  const mount = async (version, index) => {
    assert(Date.now() - startedMs < 420_000, 'Split worker before eight minutes');
    const schema = structuredClone(version === 'variant' && variant === 'old' ? fixture.legacy : fixture.workspace);
    globalThis.__bound102.memo = new WeakMap(); globalThis.__bound102.strings = new Map(); globalThis.__bound102.cursors = {};
    if (regime === 'forced') { globalThis.gc(); await new Promise(resolve => setImmediate(resolve)); }
    actualMounts[version]++;
    const sample = await measured(() => api.create(engines[version], fixture, version === 'variant' && variant === 'old' ? 'old' : 'head', schema));
    if (version === 'variant' && !globalThis.__bound102.replay) { assert.equal(index, -20); globalThis.__bound102.replay = true; }
    last[version] = sample.root;
    if (index >= 0) { data[version].push(sample.ms); windows.push({ version, index, beginUs: sample.beginUs, endUs: sample.endUs }); }
  };
  if (regime === 'forced') {
    assert(globalThis.gc);
    for (let i = -20; i < 101; i++) for (const version of i % 2 === (run % 2 ? 0 : 1) ? ['head', 'variant'] : ['variant', 'head']) await mount(version, i);
  } else {
    for (const version of run % 2 ? ['head', 'variant'] : ['variant', 'head']) for (let i = -20; i < 101; i++) await mount(version, i);
  }
  for (let i = 0; i < 101; i++) emptyAfter.push((await measured(() => {})).ms);
  const correction = metric([...emptyBefore, ...emptyAfter]).median;
  const metrics = Object.fromEntries(Object.entries(data).map(([key, values]) => [key, metric(values.map(value => value - correction))]));
  const tag = `${variant}-${name}-${regime}-r${run}`;
  assert.equal(actualMounts.head, 121); assert.equal(actualMounts.variant, 121);
  save(path.join(artifacts, tag + '.json'), { HEAD, variant, name, run, regime, freshProcess: true, warmup: 20, samples: 101, actualMounts, correction, metrics, boundMs: metrics.head.median - metrics.variant.median,
    pairedDeltasMs: regime === 'forced' ? data.head.map((ms, i) => ms - data.variant[i]) : undefined,
    ordinalDeltasMs: data.head.map((ms, i) => ms - data.variant[i]), timingsMs: data, windows, emptyTimingsMs: { before: emptyBefore, after: emptyAfter },
    observations: Object.fromEntries(Object.entries(last).map(([key, root]) => [key, api.observe(root)])),
    tapeLengths: Object.fromEntries(Object.entries(globalThis.__bound102.tapes).map(([key, tape]) => [key, tape.length])), environment: api.environment(), elapsedMs: Date.now() - startedMs });
  console.log(JSON.stringify({ tag, headMs: metrics.head.median, variantMs: metrics.variant.median, boundMs: metrics.head.median - metrics.variant.median, seconds: (Date.now() - startedMs) / 1000 }));
}

/** Weight original functions by V8 timeDeltas, preserving GC/program/idle and deduplicating recursive totals. */
function attribution(profile, windows, version) {
  const map = new TraceMap(JSON.parse(fs.readFileSync(bundleFor(version) + '.map', 'utf8'))), nodes = new Map(profile.nodes.map(node => [node.id, node])), parents = new Map();
  for (const node of profile.nodes) for (const child of node.children ?? []) parents.set(child, node.id);
  const mapped = frame => {
    let file = frame.url || '(V8)', line = frame.lineNumber + 1, column = frame.columnNumber;
    if (file.endsWith(`/profile102-${version}.cjs`) && line > 0) {
      const source = originalPositionFor(map, { line, column: Math.max(0, column) });
      if (source.source) { file = path.relative(repo, path.resolve(bundles, source.source)); line = source.line; column = source.column; }
    } else if (file.startsWith('file://')) file = path.relative(repo, fileURLToPath(file));
    else if (file.startsWith(repo)) file = path.relative(repo, file);
    if(file.startsWith('data:'))file='(round-99 canonical adapter)';
    return { function: frame.functionName || '(anonymous)', file, line, column };
  };
  const stacks = new Map();
  for (const node of profile.nodes) { const stack = []; for (let id = node.id; id !== undefined; id = parents.get(id)) stack.push(mapped(nodes.get(id).callFrame)); stacks.set(node.id, stack); }
  let stamp = profile.startTime, index = 0, denominatorUs = 0, samples = 0;
  const rows = new Map();
  for (let i = 0; i < profile.samples.length; i++) {
    const previous = stamp; stamp += profile.timeDeltas[i];
    while (index < windows.length && windows[index].endUs <= previous) index++;
    if (!windows[index]) break;
    let weight=0;
    for(let at=index;at<windows.length&&windows[at].beginUs<stamp;at++)
      weight+=Math.max(0,Math.min(stamp,windows[at].endUs)-Math.max(previous,windows[at].beginUs));
    if (!weight) continue;
    denominatorUs += weight; samples++;
    const seen = new Set(), stack = stacks.get(profile.samples[i]);
    for (let position = 0; position < stack.length; position++) {
      const frame = stack[position], key = `${frame.function}|${frame.file}:${frame.line}:${frame.column}`;
      if (seen.has(key)) continue;
      seen.add(key);
      let row = rows.get(key); if (!row) rows.set(key, row = { ...frame, selfUs: 0, totalUs: 0, selfSamples: 0, totalSamples: 0 });
      row.totalUs += weight; row.totalSamples++;
      if (position === 0) { row.selfUs += weight; row.selfSamples++; }
    }
  }
  const functions = [...rows.values()].map(row => ({ ...row, selfPct: row.selfUs / denominatorUs * 100, totalPct: row.totalUs / denominatorUs * 100, selfUsPerMount: row.selfUs / 101, totalUsPerMount: row.totalUs / 101 })).sort((a, b) => b.selfUs - a.selfUs);
  return { mounts: 101, intervalUs: 100, samples, denominatorUs, windowUs:windows.reduce((sum,row)=>sum+row.endUs-row.beginUs,0), functions, selfConservation: functions.reduce((sum, row) => sum + row.selfUs, 0) };
}

/** Original engine only: one fresh process, twenty warmups, then 101 uninterrupted no-GC mounts. */
async function cpu(version, name, run) {
  const engine = require(bundleFor(version)), fixture = fixtureFor(engine, name), windows = [];
  for (let i = 0; i < 20; i++) await measured(() => api.create(engine, fixture, version, structuredClone(version === 'old' ? fixture.legacy : fixture.workspace)));
  const session = new inspector.Session(); session.connect();
  const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params, (error, result) => error ? reject(error) : resolve(result)));
  await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 100 }); await post('Profiler.start');
  let last;
  for (let i = 0; i < 101; i++) {
    const schema = structuredClone(version === 'old' ? fixture.legacy : fixture.workspace);
    const sample = await measured(() => api.create(engine, fixture, version, schema)); last = sample.root;
    windows.push({ index: i, beginUs: sample.beginUs, endUs: sample.endUs, ms: sample.ms });
  }
  const { profile } = await post('Profiler.stop'); session.disconnect();
  const tag = `cpu-${version}-${name}-r${run}`;
  save(path.join(artifacts, tag + '.cpuprofile'), profile);
  const result = attribution(profile, windows, version);
  save(path.join(artifacts, tag + '.json'), { HEAD, version, name, run, warmup: 20, samples: 101, forcedGC: false, freshProcess: true, counterInstrumentation: false, windows, cpu: result, observed: api.observe(last), environment: api.environment(), elapsedMs: Date.now() - startedMs });
  console.log(JSON.stringify({ tag, samples: result.samples, selectedMs: result.denominatorUs / 1000, top: result.functions.slice(0,6).map(row => [row.function, row.selfPct]) }));
}

/** Sequential child invocation; processes exit by EOF/normal completion without kill signals. */
function child(args) {
  assert(Date.now() - startedMs < 410_000, 'Split command before eight minutes');
  const result = spawnSync(process.execPath, args, { cwd: repo, env: { ...process.env, NODE_ENV: 'production', GIT_OPTIONAL_LOCKS: '0' }, encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(result.signal, null, result.stderr); assert.equal(result.status, 0, result.stderr || result.stdout);
  console.log(result.stdout.trim());
}

const [command, ...args] = process.argv.slice(2);
const tag = [command, ...args].join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
process.once('exit', status => save(path.join(artifacts, `process-${tag}.json`), { HEAD, command, args, status, signal: null, started, ended: new Date().toISOString(), elapsedMs: Date.now() - startedMs, pid: process.pid, driverSha256: createHash('sha256').update(fs.readFileSync(script)).digest('hex') }));
if (command === '--build-worker') {
  const result = await api.buildAsync(args[0]); save(path.join(artifacts, `build-${args[0]}.json`), { HEAD, ...result }); console.log(JSON.stringify(result));
} else if (command === '--build') {
  for (const variant of args) child([script, '--build-worker', variant]);
} else if (command === '--count-worker') await counts(args[0], args[1]);
else if (command === '--counts') {
  for (const version of ['head','old']) for (const name of args.length ? args : scaleFixtures) child([script, '--count-worker', version, name]);
} else if (command === '--timer-worker') await timing(args[0], args[1], Number(args[2]), args[3]);
else if (command === '--timers') {
  const [variant, run, ...names] = args;
  for (const name of names.length ? names : fixtures) for (const regime of ['forced','steady']) child(['--expose-gc',script,'--timer-worker',variant,name,run,regime]);
} else if (command === '--cpu-worker') await cpu(args[0], args[1], Number(args[2]));
else if (command === '--cpu') {
  const [version, run, ...names] = args;
  for (const name of names.length ? names : fixtures) child([script,'--cpu-worker',version,name,run]);
} else if(command==='--reattribute') {
  let total=0;
  for(const version of ['head','old'])for(const name of fixtures)for(const run of [1,2,3]){
    const tag=`cpu-${version}-${name}-r${run}`,file=path.join(artifacts,tag+'.json');
    const record=JSON.parse(fs.readFileSync(file,'utf8')),profile=JSON.parse(fs.readFileSync(path.join(artifacts,tag+'.cpuprofile'),'utf8'));
    record.cpu=attribution(profile,record.windows,version);record.attributionRevision='all intersecting windows, weighted timeDeltas';save(file,record);total++;
  }
  console.log(JSON.stringify({reattributedProfiles:total}));
} else throw new Error('Use --build, --counts, --timers, --cpu; each accepts a bounded batch.');
assert(Date.now() - startedMs < 480_000);
