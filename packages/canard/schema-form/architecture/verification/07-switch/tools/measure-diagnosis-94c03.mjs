// Diagnostic entry: source is instrumented in memory; product files and Git remain read-only.
import assert from 'node:assert/strict';
import childProcess, { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(directory, '..');
const pkg = path.resolve(output, '../../..');
const repo = path.resolve(pkg, '../../..');
const bf = path.join(repo, 'packages/aileron/benchmark-form');
const req = createRequire(path.join(pkg, 'package.json'));
const bfReq = createRequire(path.join(bf, 'package.json'));
const { build } = req('esbuild');
const ts = req('typescript');
const Ajv = req('ajv/dist/2020').default;
const release = '@canard/schema-form@0.16.0';
const expectedHead = 'f8aaa4ed23245450f967878cd96477fa5bae8f96';
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
assert.equal(head, expectedHead);
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(typeof globalThis.gc, 'function');
const smoke = process.argv.includes('--smoke');
const warmup = smoke ? 3 : 24;
const sampleCount = smoke ? 7 : 101;
const rounds = smoke ? 1 : 3;
const fixtureFilter = process.env.DIAG94_FIXTURES?.split(',');
const stem = process.env.DIAG94_STEM ?? (smoke ? 'diagnosis-94c03-smoke' : 'diagnosis-94c03');
const phases = ['analysis', 'creation', 'mark', 'compute', 'derive', 'transition', 'commit', 'delivery', 'output', 'validation', 'other'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceHashes = {};
const releaseFiles = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', release,
  'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim().split('\n'));
const releaseSources = new Map();
const catalog = [];
const catalogIds = new Map();
const metric = values => {
  const sorted = values.toSorted((a, b) => a - b);
  assert(sorted.length && sorted.every(Number.isFinite));
  return { median: sorted[Math.ceil(sorted.length * .5) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1],
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    min: sorted[0], max: sorted.at(-1) };
};
const frequency = values => {
  const result = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
};
const compactTime = values => {
  const result = metric(values);
  return { median: result.median, mean: result.mean, p99: result.p99 };
};
const compactCount = values => {
  const result = metric(values);
  return { median: result.median, min: result.min, max: result.max };
};
const idFor = (file, line, name, kind, hint) => {
  const key = `${file}:${line}:${name}:${kind}`;
  if (!catalogIds.has(key)) {
    catalogIds.set(key, catalog.length);
    catalog.push({ id: catalog.length, file, line, name, kind, hint });
  }
  return catalogIds.get(key);
};

let scope;
const choosePhase = (hint, inherited) => {
  if (hint === 'inherit') return inherited ?? 'other';
  if (['mark', 'compute'].includes(hint) && ['derive', 'transition'].includes(inherited)) return inherited;
  if (hint === 'analysis' && inherited && !['other', 'analysis'].includes(inherited)) return inherited;
  return hint;
};
globalThis.__diag94Enter = (id, hint) => {
  if (!scope) return undefined;
  const phase = choosePhase(hint, scope.stack.at(-1)?.phase);
  const key = `${phase}:${id}`;
  const frame = { id, key, phase, child: 0, subtreeCalls: 1, start: scope.timed ? performance.now() : 0 };
  scope.stack.push(frame);
  if (!scope.timed) scope.counts[id] = (scope.counts[id] ?? 0) + 1;
  return frame;
};
globalThis.__diag94Exit = frame => {
  if (!frame) return;
  const elapsed = scope.timed ? performance.now() - frame.start : 0;
  assert.equal(scope.stack.pop(), frame);
  if (!scope.timed) return;
  const parent = scope.stack.at(-1);
  if (parent) { parent.child += elapsed; parent.subtreeCalls += frame.subtreeCalls; }
  const own = elapsed - frame.child;
  const detail = scope.sites[frame.key] ??= { id: frame.id, phase: frame.phase, ms: 0, inclusiveMs: 0, calls: 0, subtreeCalls: 0 };
  detail.ms += own;
  detail.inclusiveMs += elapsed;
  detail.subtreeCalls += frame.subtreeCalls;
  detail.calls++;
  scope.times[frame.phase] = (scope.times[frame.phase] ?? 0) + own;
  scope.calls[frame.phase] = (scope.calls[frame.phase] ?? 0) + 1;
};
globalThis.__diag94Count = (id, amount = 1) => {
  if (scope && !scope.timed) scope.counts[id] = (scope.counts[id] ?? 0) + amount;
};
globalThis.__diag94Node = (id, node, context) => {
  if (!scope || scope.timed) return;
  const record = scope.nodes[id] ??= {};
  const key = node?.path ?? '(no-path)';
  record[key] = (record[key] ?? 0) + 1;
  if (context) {
    const sizes = scope.contexts[id] ??= {};
    for (const name of ['changedRaw', 'dirtyPaths', 'shapeDirtyPaths', 'changedNodes', 'entered', 'exited',
      'pendingExits', 'perished', 'selectedDeclarationIds', 'automaticLog', 'stateDirtyNodes', 'dependencyOwnerPaths']) {
      const value = context[name];
      if (value) (sizes[name] ??= []).push(value.size ?? value.length ?? 0);
    }
  }
};
globalThis.__diag94Gate = gate => {
  if (scope && !scope.timed) scope.gates[gate.schemaPath] = (scope.gates[gate.schemaPath] ?? 0) + 1;
};

function hintFor(file, name) {
  if (file.startsWith('release/')) {
    if (file.includes('/helpers/jsonSchema/') || ['processSchema', 'resolveReferences'].includes(name)) return 'analysis';
    if (name === 'nodeFromJSONSchema') return 'other';
    if (file.includes('/ValidationManager/')) return 'validation';
    if (file.includes('/EventCascadeManager/') || ['publish', '__publishChildrenChange__', '__handleEmitChange__'].includes(name) ||
      file.endsWith('/afterMicrotask.ts') && name === 'callback') return 'delivery';
    if (name === 'constructor' || file.endsWith('/schemaNodeFactory.ts') && name === 'schemaNodeFactory') return 'creation';
    if (/ComputedPropertiesManager/.test(file) || /ComputedProperties/.test(name)) return 'derive';
    if (/OneOf|AnyOf|Branch|primeInitialBranch/.test(name)) return 'transition';
    if (['setValue', 'setDefaultValue', '__setDefaultValue__', '__initialize__', 'initialize'].includes(name)) return 'mark';
    if (/parseValue|processValue|propagate/.test(name) || file.includes('/core/parsers/')) return 'compute';
    if (['getValue', 'getRawValue', 'get value', 'get rawValue'].includes(name)) return 'output';
    return 'inherit';
  }
  if (name === 'nodeFromJSONSchema' || name === 'buildSchemaNodeTree' || name === 'mountSchemaNode') return 'other';
  if (['blueprint', 'preprocessSchema'].includes(name) || file.includes('/blueprint/utils/analyze/') ||
    file.includes('/helpers/jsonSchema/')) return 'analysis';
  if (name === 'createSchemaNode' || name === 'constructor' && file.includes('/SchemaNode/')) return 'creation';
  if (file.includes('/validation/')) return 'validation';
  if (file.includes('/record/utils/events/') || /flushSchemaNodeEvents|flushQueuedEvents|markSchemaNodeEvent|markCommitDeliveries/.test(name)) return 'delivery';
  if (name === 'captureSchemaNodeChange' || name === 'clearSchemaNodeChanges') return 'inherit';
  if (name === 'runDeriveRounds') return 'derive';
  if (file.includes('/settle/derive/') || file.includes('/settle/utils/derivation/')) return 'inherit';
  if (['transitionSettlement', 'finalizeExits'].includes(name)) return 'transition';
  if (file.includes('/settle/utils/transition/')) return 'inherit';
  if (file.includes('/settle/utils/commit/') || ['publishStateKeys', 'finalizeExits', 'commitStaticFirstNode', 'finishStaticFirstLoad', 'readStaticFirstWarning'].includes(name)) return 'commit';
  if (file.includes('/settle/utils/compute/') || file.includes('/settle/utils/load/')) return 'compute';
  if (file.includes('/settle/utils/write/') || file.includes('/settle/utils/settlement/') || name === 'setValue') return 'mark';
  if (/readSchemaNode(Value|LocalValue|RawValue)|get value|readSchemaNodeOutput/.test(name)) return 'output';
  return 'inherit';
}

/** Add spans and, in a separate untimed bundle, loop/function census hooks. */
function instrument(file, source, mode) {
  if (mode === 'plain') return source;
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [];
  function visit(node) {
    const callable = ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node) ||
      ts.isArrowFunction(node) || ts.isFunctionExpression(node);
    if (callable && node.body && ts.isBlock(node.body) && node.body.statements.length > 0 &&
      !node.modifiers?.some(item => item.kind === ts.SyntaxKind.AsyncKeyword)) {
      let name = node.name?.getText(ast) ?? '';
      if (ts.isConstructorDeclaration(node)) name = 'constructor';
      if (!name && ts.isVariableDeclaration(node.parent)) name = node.parent.name.getText(ast);
      // Anonymous callback bodies retain their caller's span; named functions have stable source anchors.
      if (name) {
        const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
        const hint = hintFor(file, name);
        const id = idFor(file, line, name, 'function', hint);
        edits.push([node.body.getStart(ast) + 1,
          `\nconst __diag94Frame = globalThis.__diag94Enter(${id}, ${JSON.stringify(hint)}); try {\n`]);
        edits.push([node.body.end - 1, '\n} finally { globalThis.__diag94Exit(__diag94Frame); }\n']);
        if (mode === 'count') {
          const params = node.parameters.map(x => x.name.getText(ast));
          const nodeParam = params.includes('node') ? 'node' : params.includes('root') ? 'root' : undefined;
          const contextParam = params.includes('context') ? 'context' : undefined;
          if (nodeParam || contextParam) edits.push([node.body.getStart(ast) + 1,
            `\nglobalThis.__diag94Node(${id}, ${nodeParam ?? 'undefined'}, ${contextParam ?? 'undefined'});\n`]);
          if (name === 'evaluateGate') edits.push([node.body.getStart(ast) + 1, '\nglobalThis.__diag94Gate(gate);\n']);
        }
      }
    }
    if (ts.isArrowFunction(node) && !ts.isBlock(node.body) && ts.isVariableDeclaration(node.parent) &&
      ['assembleRaw', 'projectIdentity', 'projectEmpty', 'projectNoEmit'].includes(node.parent.name.getText(ast))) {
      const name=node.parent.name.getText(ast),line=ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1;
      const id=idFor(file,line,name,'function','inherit');
      const params=node.parameters.map(item=>item.name.getText(ast));
      const nodeParam=params.includes('node')?'node':params.includes('_node')?'_node':undefined;
      const census=mode==='count' && nodeParam?`globalThis.__diag94Node(${id},${nodeParam});`:'';
      edits.push([node.body.getStart(ast),`{ const __diag94Frame=globalThis.__diag94Enter(${id},'inherit'); try { ${census} return (`]);
      edits.push([node.body.end,'); } finally { globalThis.__diag94Exit(__diag94Frame); } }']);
    }
    if (mode === 'count' && (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node) ||
      ts.isWhileStatement(node) || ts.isDoStatement(node))) {
      const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
      const id = idFor(file, line, node.getText(ast).split('\n')[0].slice(0,180), 'loop', 'count');
      if (ts.isBlock(node.statement)) edits.push([node.statement.getStart(ast) + 1, `\nglobalThis.__diag94Count(${id});\n`]);
      else {
        edits.push([node.statement.getStart(ast), `{ globalThis.__diag94Count(${id}); `]);
        edits.push([node.statement.end, ' }']);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const [at, text] of edits.sort((a,b) => b[0]-a[0])) source = source.slice(0,at)+text+source.slice(at);
  return source;
}

const localResolve = base => {
  const found = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
    .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
  assert(found, `No local source ${base}`); return found;
};
const oldResolve = relative => {
  const base = `packages/canard/schema-form/src/${relative}`;
  const found = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
    .find(file => releaseFiles.has(file));
  assert(found, `No 0.16.0 source ${relative}`); return { path: found, namespace: 'release-source' };
};
async function bundle(version, mode) {
  const result = await build({
    stdin: { contents: `export { nodeFromJSONSchema } from ${version === 'old' ? "'release-core'" : JSON.stringify(path.join(pkg,'src/core/nodeFromJSONSchema.ts'))};
      export { equivalentFixtures } from ${JSON.stringify(path.join(bf,'fixtures/equivalent/index.ts'))};`, resolveDir: bf, loader: 'ts' },
    write: false, bundle: true, packages: 'external', platform: 'node', format: 'cjs', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'diagnosis94-memory-only', setup(builder) {
      builder.onResolve({ filter: /^release-core$/ }, () => oldResolve('core/nodeFromJSONSchema'));
      builder.onResolve({ filter: /^@\/schema-form/ }, args => args.namespace === 'release-source'
        ? oldResolve(args.path.replace(/^@\/schema-form\/?/,''))
        : { path: localResolve(path.join(pkg,'src',args.path.replace(/^@\/schema-form\/?/,''))) });
      builder.onResolve({ filter: /.*/, namespace: 'release-source' }, args => args.path.startsWith('.')
        ? oldResolve(path.posix.normalize(path.posix.join(path.posix.dirname(args.importer),args.path)).slice('packages/canard/schema-form/src/'.length))
        : { path: args.path, external: true });
      builder.onLoad({ filter: /.*/, namespace: 'release-source' }, args => {
        if (!releaseSources.has(args.path)) releaseSources.set(args.path,
          execFileSync('git',['show',`${release}:${args.path}`],{cwd:repo,encoding:'utf8'}));
        const source=releaseSources.get(args.path), file=`release/${args.path}`;
        sourceHashes[file]=hash(source);
        return { contents: instrument(file,source,mode), loader: args.path.endsWith('tsx')?'tsx':'ts' };
      });
      builder.onLoad({ filter: /\/benchmark-form\/fixtures\/equivalent\/branches\.ts$/ }, args => ({
        contents: fs.readFileSync(args.path,'utf8').replace('[5, 10, 20].map','[5, 10, 20, 40].map'),loader:'ts' }));
      builder.onLoad({ filter: /\/schema-form\/src\/.*\.tsx?$/ }, args => {
        const source=fs.readFileSync(args.path,'utf8'),file=path.relative(repo,args.path);
        sourceHashes[file]=hash(source);
        return { contents: instrument(file,source,mode),loader:args.path.endsWith('tsx')?'tsx':'ts' };
      });
    } }],
  });
  const module={exports:{}};
  new Function('require','module','exports',result.outputFiles[0].text)(bfReq,module,module.exports);
  return module.exports;
}

const services=[];
const originalSpawn=childProcess.spawn;
childProcess.spawn=function(file,args,options) {
  const child=originalSpawn(file,args,options);
  if (String(file).includes('esbuild')) services.push(child);
  return child;
};
const engines={};
for (const mode of ['time','count','plain']) {
  engines[mode]={};
  for (const version of ['old','new']) engines[mode][version]=await bundle(version,mode);
}
childProcess.spawn=originalSpawn;
for (const service of services) {
  service.ref();
  const ended=service.exitCode===null?once(service,'exit'):Promise.resolve([service.exitCode]);
  service.stdin.end();
  const [code,signal]=await ended;
  assert.equal(code,0,`esbuild natural exit ${signal}`);
}

const names=['sample-0','sample-1','sample-2','sample-3','nested-d3-f4','nested-d5-f4','array-100',
  'computed-visible-derived','oneOf-5','oneOf-10','oneOf-20','oneOf-40','if-then','if-then-guarded','flat-500'];
let fixtures=engines.time.new.equivalentFixtures.filter(x=>names.includes(x.name));
const ifSchema={type:'object',properties:{kind:{type:'string',default:'a'},detail:{type:'string',default:'detail'}},
  if:{properties:{kind:{const:'b'}},required:['kind']},then:{properties:{detail:{minLength:3}}}};
fixtures.push({name:'if-then',legacy:ifSchema,workspace:structuredClone(ifSchema),
  interactions:[{kind:'set',path:'/kind',value:'b'},{kind:'set',path:'/kind',value:'a'}]});
fixtures.push({name:'if-then-guarded',legacy:structuredClone(ifSchema),workspace:structuredClone(ifSchema),
  interactions:[{kind:'set',path:'/kind',value:'b'},{kind:'set',path:'/kind',value:'a'}]});
fixtures.sort((a,b)=>names.indexOf(a.name)-names.indexOf(b.name));
if (fixtureFilter) fixtures=fixtures.filter(x=>fixtureFilter.includes(x.name));
else if (smoke) fixtures=fixtures.filter(x=>['sample-0','computed-visible-derived','oneOf-5','if-then','if-then-guarded'].includes(x.name));
assert(fixtures.length);
for (const fixture of fixtures) if (fixture.name.startsWith('oneOf-')) fixture.interactions[0].value='kind_4';
const valueOf=root=>typeof root.getValue==='function'?root.getValue():root.value;
const canonical=value=>JSON.stringify(value,(_key,item)=>item && !Array.isArray(item) && typeof item==='object'
  ? Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))) : item);
async function drain() {
  for(let tick=0;tick<64;tick++)await Promise.resolve();
  await new Promise(resolve=>setImmediate(resolve));
  await new Promise(resolve=>setTimeout(resolve,0));
  for(let tick=0;tick<64;tick++)await Promise.resolve();
  await new Promise(resolve=>setTimeout(resolve,0));
}
function begin(mode) {
  assert(!scope);
  scope={timed:mode==='time',stack:[],times:{},calls:{},sites:{},counts:{},nodes:{},contexts:{},gates:{}};
  return performance.now();
}
function end(start) {
  assert.equal(scope.stack.length,0);
  const result={...scope,wallMs:performance.now()-start};
  scope=undefined;
  result.activeMs=Object.values(result.times).reduce((a,b)=>a+b,0);
  return result;
}
const laterInteraction=fixture=>{
  const first=fixture.interactions[0];
  if (/oneOf|if-then/.test(fixture.name))return {...first};
  const value=typeof first.value==='string'?`${first.value}-later`:
    typeof first.value==='number'?first.value+1:!first.value;
  return {...first,value};
};
async function one(mode,version,fixture) {
  globalThis.gc();
  const schema=structuredClone(version==='old'?fixture.legacy:fixture.workspace);
  let validators={};
  if(fixture.name==='if-then-guarded') {
    const ajv=new Ajv({strict:false,allErrors:true,validateFormats:false});
    const span=(name,operation)=>{
      const id=idFor('harness:AJV',1,name,'function','validation');
      const frame=mode==='plain'?undefined:globalThis.__diag94Enter(id,'validation');
      try{return operation();}finally{globalThis.__diag94Exit(frame);}
    };
    const compile=definition=>span('compile',()=>{
      const validate=ajv.compile(definition);
      return value=>span('validate',()=>validate(value)?null:validate.errors.map(error=>({...error,dataPath:error.instancePath})));
    });
    validators={validatorFactory:compile,validator:{compile,compileGuard(definition,pointer){
      return span('compileGuard',()=>{
        if(!ajv.getSchema('diag94-root'))ajv.addSchema(definition,'diag94-root');
        const guard=ajv.compile({$ref:`diag94-root${pointer.startsWith('#')?pointer:'#'+pointer}`});
        return value=>span('guard',()=>guard(value));
      });
    }}};
  }
  const start=begin(mode);
  const root=engines[mode][version].nodeFromJSONSchema({jsonSchema:schema,validationMode:0,onChange(){},...validators});
  const syncMountMs=performance.now()-start;
  await drain();
  const mount=end(start);
  mount.synchronousMs=syncMountMs;
  mount.valueHash=hash(canonical(valueOf(root)));
  for(const interaction of fixture.interactions) {
    const node=root.find(interaction.path);assert(node);
    node.setValue(interaction.value);await drain();
  }
  const interaction=laterInteraction(fixture),node=root.find(interaction.path);assert(node);
  const updateStart=begin(mode);
  node.setValue(interaction.value);
  const syncUpdateMs=performance.now()-updateStart;
  await drain();
  const update=end(updateStart);
  update.synchronousMs=syncUpdateMs;
  const value=valueOf(root);
  const written=interaction.path.split('/').slice(1).reduce((value,key)=>value?.[key],value);
  assert.equal(written,interaction.value);
  if (fixture.name==='computed-visible-derived')assert.equal(value.target,value.source*2);
  update.valueHash=hash(canonical(value));
  return {mount,update};
}

/** Replay actual site frequencies around a no-op inside an enclosing span. */
function calibrate(records) {
  const representative=records[Math.floor(records.length/2)];
  const schedule=Object.values(representative.sites).flatMap(site=>
    Array.from({length:site.calls},()=>[site.id,site.phase]));
  assert(schedule.length);
  const repeat=Math.max(1,Math.ceil(4000/schedule.length));
  const calls=schedule.length*repeat;
  const costs=[], empty=[], baseline=[];
  const noop=()=>{};
  const outerId=idFor('harness',1,'empty-span-outer','calibration','other');
  function block(instrumented) {
    const start=begin('time'), outer=globalThis.__diag94Enter(outerId,'other');
    for(let cycle=0;cycle<repeat;cycle++)for(const [id,phase]of schedule) {
      if(instrumented){const frame=globalThis.__diag94Enter(id,phase);try{noop();}finally{globalThis.__diag94Exit(frame);}}
      else noop();
    }
    globalThis.__diag94Exit(outer);return end(start).activeMs;
  }
  for(let index=-24;index<101;index++) {
    const first=index%2===0;
    const a=block(first),b=block(!first);
    if(index>=0){const traced=first?a:b,bare=first?b:a;costs.push((traced-bare)/calls);empty.push(traced/calls);baseline.push(bare/calls);}
  }
  return {perCallMs:metric(costs),emptyActivePerCallMs:metric(empty),baselinePerCallMs:metric(baseline),
    callsPerBlock:calls,sitesPerRepresentative:schedule.length,samples:costs};
}
const summarize=(records,calibration)=>{
  const cost=calibration.perCallMs.median;
  const corrected=(ms,calls)=>ms-calls*cost;
  const siteKeys=[...new Set(records.flatMap(record=>Object.keys(record.sites)))];
  const sites=siteKeys.map(key=>{
    const first=records.find(record=>record.sites[key]).sites[key];
    const calls=records.map(record=>record.sites[key]?.calls??0),raw=records.map(record=>record.sites[key]?.ms??0);
    const subtreeCalls=records.map(record=>record.sites[key]?.subtreeCalls??0);
    const inclusive=records.map(record=>record.sites[key]?.inclusiveMs??0);
    return {id:first.id,phase:first.phase,calls:compactCount(calls),rawMs:compactTime(raw),
      correctedMs:compactTime(raw.map((ms,i)=>corrected(ms,calls[i]))),
      subtreeCalls:compactCount(subtreeCalls),inclusiveRawMs:compactTime(inclusive),
      inclusiveCorrectedMs:compactTime(inclusive.map((ms,i)=>corrected(ms,subtreeCalls[i])))};
  });
  const phaseRows=Object.fromEntries(phases.map(phase=>{
    const counts=records.map(record=>record.calls[phase]??0),raw=records.map(record=>record.times[phase]??0);
    return [phase,{calls:metric(counts),callFrequency:frequency(counts),perCallInstrumentationMs:cost,
      rawMs:metric(raw),correctedMs:metric(raw.map((ms,i)=>corrected(ms,counts[i])))}];
  }));
  const calls=records.map(record=>Object.values(record.calls).reduce((a,b)=>a+b,0));
  const total={calls:metric(calls),rawMs:metric(records.map(record=>record.activeMs)),
    correctedMs:metric(records.map((record,i)=>corrected(record.activeMs,calls[i]))),
    synchronousMs:metric(records.map(record=>record.synchronousMs)),wallIncludingTimerWaitMs:metric(records.map(record=>record.wallMs))};
  for(const row of Object.values(phaseRows))row.correctedMeanShare=row.correctedMs.mean/total.correctedMs.mean;
  return {samples:records.length,calibration:{...calibration,samples:undefined},total,phases:phaseRows,sites,
    semanticHashes:frequency(records.map(record=>record.valueHash))};
};

const started=new Date().toISOString(), rows=[], censuses=[], plainRows=[], timingFiles=[];
if (process.argv.includes('--verify-alias')) {
  const sourceFile=fs.existsSync(path.join(output,'diagnosis-94c03-final2-measurement-summary.json'))
    ? 'diagnosis-94c03-final2-measurement-summary.json' : 'diagnosis-94c03-summary.json';
  const source=JSON.parse(fs.readFileSync(path.join(output,sourceFile),'utf8'));
  const entry=bfReq.resolve('@canard/schema-form_0.16.0');
  const aliasBytes=fs.readFileSync(entry,'utf8');
  assert(aliasBytes.includes('const nodeFromJSONSchema ='));
  const aliasModule={exports:{}};
  new Function('require','module','exports',`${aliasBytes}\nexports.__diag94NodeFromJSONSchema=nodeFromJSONSchema;`)(
    createRequire(entry),aliasModule,aliasModule.exports);
  const packageFile=path.resolve(path.dirname(entry),'../package.json');
  const packageData=JSON.parse(fs.readFileSync(packageFile,'utf8'));
  assert.equal(packageData.version,'0.16.0');
  engines.plain.old={...engines.plain.old,nodeFromJSONSchema:aliasModule.exports.__diag94NodeFromJSONSchema};
  const checks=[];
  for(let index=0;index<fixtures.length;index++) {
    const fixture=fixtures[index], results={};
    for(const version of index%2?['new','old']:['old','new'])
      results[version]=await one('plain',version,fixture);
    for(const mode of ['mount','update']) {
      const expected=source.rows.find(row=>row.fixture===fixture.name&&row.version==='old'&&row.mode===mode);
      assert.equal(results.old[mode].valueHash,results.new[mode].valueHash);
      assert(expected.semanticHashes[results.old[mode].valueHash]);
      checks.push({fixture:fixture.name,mode,valueHash:results.old[mode].valueHash,matchedAliasSourceAndHead:true});
    }
  }
  for(const[file,original]of Object.entries(sourceHashes))if(!file.startsWith('release/'))
    assert.equal(hash(fs.readFileSync(path.join(repo,file))),original);
  const verification={entry:path.relative(repo,entry),packageVersion:packageData.version,
    aliasBytesSha256:hash(fs.readFileSync(entry)),releaseSourceCommit:execFileSync('git',['rev-parse',`${release}^{commit}`],
      {cwd:repo,encoding:'utf8'}).trim(),checks,naturalExit:true,
    limit:'Output equivalence for these fixtures only; not bytecode identity or end-to-end timing equivalence.'};
  fs.writeFileSync(path.join(output,'diagnosis-94c03-alias-verification-summary.json'),JSON.stringify(verification)+'\n',{flag:'wx'});
  console.log(`Verified installed BF 0.16.0 alias against source lane and HEAD: ${checks.length} outputs; natural exit.`);
} else {
for(const fixture of fixtures) {
  const records={old:{mount:[],update:[]},new:{mount:[],update:[]}};
  const perRound=[];
  for(let round=0;round<rounds;round++) {
    const local={old:{mount:[],update:[]},new:{mount:[],update:[]}};
    for(let index=-warmup;index<sampleCount;index++) {
      const order=(index+round)%2===0?['old','new']:['new','old'];
      const values={};
      for(const version of order) {
        values[version]=await one('time',version,fixture);
        if(index>=0)for(const mode of ['mount','update'])local[version][mode].push(values[version][mode]);
      }
      for(const mode of ['mount','update'])assert.equal(values.old[mode].valueHash,values.new[mode].valueHash,`${fixture.name} ${mode} semantic mismatch`);
    }
    for(const version of ['old','new'])for(const mode of ['mount','update'])records[version][mode].push(...local[version][mode]);
    perRound.push(Object.fromEntries(['old','new'].map(version=>[version,Object.fromEntries(['mount','update'].map(mode=>
      [mode,metric(local[version][mode].map(x=>x.activeMs))]))])));
    console.log(`${fixture.name}: alternating round ${round+1}/${rounds} complete`);
  }
  const timings={};
  for(const version of ['old','new'])for(const mode of ['mount','update']) {
    const calibration=calibrate(records[version][mode]),summary=summarize(records[version][mode],calibration);
    rows.push({fixture:fixture.name,version,mode,...summary});
    const raw=records[version][mode],key=`${version}-${mode}`;
    timings[key]={activeMs:raw.map(x=>x.activeMs),synchronousMs:raw.map(x=>x.synchronousMs),
      correctedActiveMs:raw.map(x=>x.activeMs-Object.values(x.calls).reduce((a,b)=>a+b,0)*calibration.perCallMs.median),
      phases:Object.fromEntries(phases.map(phase=>[phase,raw.map(x=>x.times[phase]??0)])),emptySpanPerCallMs:calibration.samples};
  }
  const counts={old:[],new:[]};
  for(let i=0;i<(smoke?1:5);i++)for(const version of i%2?['new','old']:['old','new'])
    counts[version].push(await one('count',version,fixture));
  for(const version of ['old','new'])for(const mode of ['mount','update']) {
    const raw=counts[version].map(x=>x[mode]);
    const ids=[...new Set(raw.flatMap(x=>Object.keys(x.counts)))];
    const nodeIds=[...new Set(raw.flatMap(x=>Object.keys(x.nodes)))];
    const contexts=Object.assign({},...raw.map(x=>x.contexts));
    censuses.push({fixture:fixture.name,version,mode,samples:raw.length,
      counts:Object.fromEntries(ids.map(id=>[id,{...compactCount(raw.map(x=>x.counts[id]??0)),frequency:frequency(raw.map(x=>x.counts[id]??0))}])),
      nodeVisits:Object.fromEntries(nodeIds.map(id=>{
        const visits=raw[0].nodes[id]??{},counts=Object.values(visits);
        return [id,{uniquePaths:counts.length,total:counts.reduce((a,b)=>a+b,0),perPathFrequency:frequency(counts),
          paths:mode==='update'?visits:undefined}];
      })),
      contexts:Object.fromEntries(Object.entries(contexts).map(([id,sizes])=>[id,Object.fromEntries(Object.entries(sizes).map(([name,values])=>[name,compactCount(values)]))])),
      gateEvaluations:raw[0].gates});
  }
  const plain={old:{mount:[],update:[]},new:{mount:[],update:[]}};
  for(let index=-warmup;index<(smoke?7:51);index++) {
    const values={};
    for(const version of index%2?['new','old']:['old','new']) {
      values[version]=await one('plain',version,fixture);
      if(index>=0)for(const mode of ['mount','update'])plain[version][mode].push(values[version][mode].synchronousMs);
    }
    for(const mode of ['mount','update'])assert.equal(values.old[mode].valueHash,values.new[mode].valueHash);
  }
  for(const version of ['old','new'])for(const mode of ['mount','update']) {
    plainRows.push({fixture:fixture.name,version,mode,synchronousOnlyMs:metric(plain[version][mode]),samples:plain[version][mode].length,
      limit:'Synchronous control excludes legacy asynchronous settlement and delivery; not an official end-to-end comparison.'});
    timings[`plain-${version}-${mode}-synchronousMs`]=plain[version][mode];
  }
  const file=`${stem}-${fixture.name}-timings.json`,bytes=JSON.stringify(timings)+'\n';
  assert(Buffer.byteLength(bytes)<=5_000_000);
  fs.writeFileSync(path.join(output,file),bytes,{flag:'wx'});
  timingFiles.push({file,bytes:Buffer.byteLength(bytes),sha256:hash(bytes),perRound});
  console.log(`${fixture.name}: calibration, census, plain control and timing file complete`);
}
for(const [file,original]of Object.entries(sourceHashes))if(!file.startsWith('release/'))
  assert.equal(hash(fs.readFileSync(path.join(repo,file))),original,`Product source changed ${file}`);
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),head);
const summary={environment:{head,release,node:process.version,v8:process.versions.v8,cpu:os.cpus()[0].model,
  platform:process.platform,arch:process.arch,worktree:repo,started,ended:new Date().toISOString(),
  warmup,samplesPerRound:sampleCount,rounds,sameProcess:true,alternatingOrder:'old/new at each paired sample; round parity reversed',
  mode:'development; validation off; empty onChange; no listeners',esbuildServicesEndedBeforeMeasurement:services.length,
  noAgentsSpawned:true,explicitGcOutsideTiming:true},
  method:{active:'Sum of synchronous exclusive function spans, including callbacks during bounded drain; timer waiting excluded.',
    correction:'For each fixture/version/operation: identical empty hooks at actual site frequency inside an enclosing span, alternating noop baseline; subtract calls × median per-call cost from each phase/site/sample.',
    biasLimits:'Empty-span correction does not reverse JIT/inlining/cache/shape effects. Negative corrected sites are retained as below resolution. This diagnosis does not supersede the corrected 93C-01 official table.',
    update:'Original BF interaction sequence completed outside timing; one subsequent actual write. oneOf always kind_0 to kind_4, independent of branch count.',
    counts:'Untimed separately instrumented loop census; five fresh trees per version, same operation as timed lane.',
    shares:'Additive corrected arithmetic-mean phase shares; median and p99 retained. Inclusive site bounds subtract subtree span calls, and overlapping inclusive sites must never be added.',
    ifThen:'Original no-validator fixture: if guard is unavailable and then stays inactive. Supplementary if-then-guarded supplies existing AJV guards with validation mode off; guard compilation/evaluation stays separate.',
    output:'Spans labelled output denote public value construction/read work; semantic captures occur outside timing.'},
  catalog,rows,censuses,plainRows,timingFiles,sourceHashes};
summary.siteColumns=['id','phase','callsMedian','callsMin','callsMax','rawMedianMs','rawMeanMs','rawP99Ms',
  'correctedMedianMs','correctedMeanMs','correctedP99Ms','subtreeCallsMedian','subtreeCallsMin','subtreeCallsMax',
  'inclusiveRawMedianMs','inclusiveRawMeanMs','inclusiveRawP99Ms','inclusiveCorrectedMedianMs','inclusiveCorrectedMeanMs','inclusiveCorrectedP99Ms'];
for(const row of rows)row.sites=row.sites.map(site=>[site.id,site.phase,site.calls.median,site.calls.min,site.calls.max,
  site.rawMs.median,site.rawMs.mean,site.rawMs.p99,site.correctedMs.median,site.correctedMs.mean,site.correctedMs.p99,
  site.subtreeCalls.median,site.subtreeCalls.min,site.subtreeCalls.max,site.inclusiveRawMs.median,site.inclusiveRawMs.mean,
  site.inclusiveRawMs.p99,site.inclusiveCorrectedMs.median,site.inclusiveCorrectedMs.mean,site.inclusiveCorrectedMs.p99]);
summary.method.summaryPrecision='Nine significant decimal digits in summary statistics only; timing samples retain original doubles.';
const bytes=JSON.stringify(summary,(_key,value)=>typeof value==='number'?Number(value.toPrecision(9)):value)+'\n';
assert(Buffer.byteLength(bytes)<=5_000_000);
fs.writeFileSync(path.join(output,`${stem}-measurement-summary.json`),bytes,{flag:'wx'});
console.log(`Completed ${stem}: ${rows.length} phase rows, ${Buffer.byteLength(bytes)} summary bytes; natural exit.`);
}
