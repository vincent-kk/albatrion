// CLI worker: one fixture/version/run; clocks and Node scheduling belong to this harness.
// Official samples precede all scheduler wrapping; engine source is bundled unchanged in memory.
import assert from 'node:assert/strict';
import { createHook } from 'node:async_hooks';
import { PerformanceObserver } from 'node:perf_hooks';
import { instrumentCount } from './profile-111-count-instrument.mjs';
const countMode=process.argv.includes('--count');
const splitMode=process.argv.includes('--split');
let active=null;
const groups={}, spans=[], resources=new Map(), gcEntries=[];
globalThis.__111sites=[];
globalThis.__111instrument=instrumentCount;
globalThis.__111count=site=>{if(active){const counts=active.functions[active.phase];counts[site]=(counts[site]??0)+1;}};
const asyncHook=createHook({init(id,type,trigger){if(active){active.created[type]=(active.created[type]??0)+1;resources.set(id,{type,stack:type==='PROMISE'?'':new Error().stack});}},before(id){if(active?.phase==='tail'){const r=resources.get(id);const type=r?.type??'unknown';active.tailCallbacks[type]=(active.tailCallbacks[type]??0)+1;if(type!=='PROMISE')active.callbackOrigins.push({type,stack:r?.stack});}},destroy(id){resources.delete(id);}});
const observer=new PerformanceObserver(list=>{for(const entry of list.getEntries())gcEntries.push({start:entry.startTime,end:entry.startTime+entry.duration,duration:entry.duration,kind:entry.detail.kind,flags:entry.detail.flags});});
import childProcess, { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const directory = "/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools";
const { endpointDifference95c01 } = await import(pathToFileURL(path.join(directory, 'endpointDifference95c01.mjs')));
const output = path.resolve(directory, '..');
const pkg = path.resolve(output, '../../..');
const repo = path.resolve(pkg, '../../..');
const expectedHead = '4d2e54533dc8feaccb4742be9dd322e46d20be58';
const measurementHead = process.argv.find(value => value.startsWith('--head='))?.slice(7) ?? expectedHead;
assert.match(measurementHead, /^[a-f0-9]{40}$/);
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const immediate = globalThis.setImmediate;
const clock = () => performance.now();
const warmup = 12, sampleCount = 101;
const measurementWarmup = Number(process.argv.find(value => value.startsWith('--warmup='))?.slice(9) ?? warmup);
assert(Number.isInteger(measurementWarmup) && measurementWarmup >= 10);
// Validation's deferred error events schedule one further check-queue generation.
const sentinelPasses = process.argv[3] === 'on' || process.argv.includes('--nested-callback') ? 2 : 1;
const hash = value => createHash('sha256').update(value).digest('hex');
const round = value => Number(value.toFixed(6));
const metric = values => {
  const sorted = values.toSorted((a, b) => a - b);
  assert(sorted.length && sorted.every(Number.isFinite));
  return { median: sorted[Math.ceil(sorted.length * .5) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1], samples: sorted.length };
};

/** Drain generations produced by a call; the scheduling diagnostic checks the chosen bound. */
async function flushMicrotasks(turns = 64) {
  for (let turn = 0; turn < turns; turn++) await Promise.resolve();
}


/** Split the harness tail while counting engine calls without engine clocks. */
async function measure(operation, earlySentinel=false, mode='empty', index=-1) {
 const ctx={mode,index,phase:'sync',functions:{sync:{},micro:{},tail:{}},created:{},tailCallbacks:{},callbackOrigins:[]};
 if(countMode)active=ctx;
 const start=clock();
 const result=operation();
 const returned=clock();
 ctx.phase='micro';
 await flushMicrotasks();
 const microAt=clock();
 ctx.phase='tail';
 let enqueued;
 const enqueueStart=clock();
 const end=await new Promise(resolve=>{
  immediate(()=>{
   const at=clock();
   ctx.phase='after';
   resolve(at);
  });
  enqueued=clock();
 });
 active=null;
 if(index>=0){
  spans.push({mode,index,start,returned,microAt,enqueueStart,enqueued,end});
  if(countMode){
   const g=groups[mode]??={calls:0,functions:{sync:{},micro:{},tail:{}},created:{},tailCallbacks:{},callbackOrigins:[]};
   g.calls++;
   for(const phase of ['sync','micro','tail'])for(const [site,n]of Object.entries(ctx.functions[phase]))g.functions[phase][site]=(g.functions[phase][site]??0)+n;
   for(const key of ['created','tailCallbacks'])for(const [type,n]of Object.entries(ctx[key]))g[key][type]=(g[key][type]??0)+n;
   if(g.callbackOrigins.length<5)g.callbackOrigins.push(...ctx.callbackOrigins);
  }
 }
 return {result,timing:[round(microAt-start),round(end-start)]};
}

if (process.argv.includes('--self-check')) {
  const early = process.argv.includes('--early-sentinel');
  const nested = process.argv.includes('--nested-callback');
  for (const mode of ['mount', 'update']) {
    const events = [], pending = [];
    await measure(() => {
      queueMicrotask(() => {
        events.push('microtask');
        pending.push(new Promise(resolve => immediate(() => {
          events.push('batch-reset');
          queueMicrotask(() => { events.push('callback-microtask'); resolve(); });
        })));
        pending.push(new Promise(resolve => immediate(() => {
          events.push('onChange');
          if (nested) queueMicrotask(() => immediate(() => { events.push('validation-reset'); resolve(); }));
          else resolve();
        })));
      });
    }, early);
    const atSentinel = [...events];
    await Promise.all(pending);
    assert.deepEqual(atSentinel, ['microtask', 'batch-reset', 'callback-microtask', 'onChange',
      ...(nested ? ['validation-reset'] : [])], `${mode} FIFO`);
  }
  console.log('END_TO_END_95C01_OK');
} else {
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), measurementHead);
  const [fixtureName, validation, runText, version] = process.argv.slice(2);
  assert(/^(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40)|if-then)$/.test(fixtureName));
  assert(['off', 'on'].includes(validation) && ['old', 'new'].includes(version));
  const run = Number(runText);
  assert([1, 2, 3].includes(run));
  assert.equal(typeof globalThis.gc, 'function');
  assert(!Object.keys(process.env).some(key => /^PHASE_(SOURCE_REF|CANDIDATES)$/.test(key)), 'Source overrides forbidden');
  const originalPath = path.join(pkg, 'bench/branchless-phase-diagnosis.mjs');
  const original = fs.readFileSync(originalPath, 'utf8');
  const replaceOnce = (source, before, after) => {
    assert.equal(source.split(before).length, 2, `Adapter anchor: ${before}`);
    return source.replace(before, after);
  };
  let source = replaceOnce(original, "import { writeMeasurement } from './measurement-output.mjs';",
    `import { writeMeasurement } from ${JSON.stringify(pathToFileURL(path.join(pkg, 'bench/measurement-output.mjs')).href)};`);
  source = replaceOnce(source, "const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');", `const pkg = ${JSON.stringify(pkg)};`);
  source = replaceOnce(source, "const engines = { old: await bundle('old'), new: await bundle('new') };",
    `const engines = { ${version}: await bundle(${JSON.stringify(version)}) };`);
  source = replaceOnce(source, 'engines.new.equivalentFixtures.filter', `engines.${version}.equivalentFixtures.filter`);
  source = replaceOnce(source, "'src/__legacy__/core/nodeFromJSONSchema.ts'", "'release-core'");
  source = replaceOnce(source, "return relative.startsWith('core') && fs.existsSync(local) ? { path: local } : { path: found, namespace: 'release-binding' };",
    "return { path: found, namespace: 'release-binding' };");
  source = replaceOnce(source, "builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));",
    "builder.onResolve({ filter: /\\/release-core$/ }, () => oldResolve('core/nodeFromJSONSchema'));\n      builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));");
  source = replaceOnce(source, '(flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20))',
    '(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20|40))');
  source = replaceOnce(source, "builder.onLoad({ filter: /\\/schema-form\\/src\\/.*\\.tsx?$/ }, args => {",
    "builder.onLoad({ filter: /\\/benchmark-form\\/fixtures\\/equivalent\\/branches\\.ts$/ }, args => ({ contents: fs.readFileSync(args.path, 'utf8').replace('[5, 10, 20].map', '[5, 10, 20, 40].map'), loader: 'ts' }));\n      builder.onLoad({ filter: /\\/schema-form\\/src\\/.*\\.tsx?$/ }, args => {");
  source = replaceOnce(source, 'const module = { exports: {} };',
    `assertBundle(result.outputFiles[0].text); const module = { exports: {} };`);
  source = `import assert from 'node:assert/strict';\n${source}`;
  source = replaceOnce(source, 'async function bundle(version) {',
    `const bundleEvidence = []; function assertBundle(text) { assert(!/__phaseEnter|__phaseExit/.test(text)); bundleEvidence.push({ sha256: (${hash.toString()})(text), bytes: Buffer.byteLength(text), phaseHooks: 0 }); }\nasync function bundle(version) {`);
  if(countMode) source=replaceOnce(source,'if (!enabled) return source;','return globalThis.__111instrument(file, source, ts);');
  // createHash is injected into the adapter; the hash-only addition never changes bundled engine code.
  source = `import { createHash } from 'node:crypto';\n${source}`;
  source = replaceOnce(source, 'export { engines, fixtures, begin, finish, drain, React, flushSync, createRoot };',
    'export { engines, fixtures, valueOf, assertValue, validatorServices, req, bfReq, hooks, bundleEvidence, virtualSources };');
  process.argv.push('--probe-import', '--plain');
  process.env.PHASE_FIXTURES = fixtureName;
  const services = [], originalSpawn = childProcess.spawn;
  childProcess.spawn = function (file, args, options) {
    const child = originalSpawn(file, args, options);
    if (String(file).includes('esbuild')) services.push(child);
    return child;
  };
  const api = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  childProcess.spawn = originalSpawn;
  const serviceExits = [];
  for (const service of services) {
    service.ref();
    const ended = service.exitCode === null ? once(service, 'exit') : Promise.resolve([service.exitCode, null]);
    service.stdin.end();
    const [code, signal] = await ended;
    assert.equal(code, 0, `esbuild natural exit: ${signal}`);
    serviceExits.push({ code, signal, mechanism: 'stdin EOF' });
  }
  assert.equal(api.fixtures.length, 1);
  assert.equal(api.hooks.length, 0);
  const fixture = api.fixtures[0], engine = api.engines[version];
  const axis = /^oneOf-/.test(fixtureName) && validation === 'off';
  const modes = ['mount', 'update', 'update-first', 'update-later', ...(axis ? ['axis-update', 'axis-first', 'axis-later'] : [])];
  const timings = Object.fromEntries(modes.map(mode => [mode, []]));
  timings['empty-before'] = []; timings['empty-after'] = [];
  const callbackTimings = Object.fromEntries(modes.map(mode => [mode, []]));
  const ordering = Object.fromEntries(modes.map(mode => [mode, []]));
  const checks = Object.fromEntries(modes.map(mode => [mode, {}]));
  const started = new Date().toISOString();
  const noop = () => {};
  const canonical = value => JSON.stringify(value, (_key, item) => item && !Array.isArray(item) && typeof item === 'object'
    ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
  const capture = (mode, root) => {
    const digest = hash(canonical(api.valueOf(root)));
    checks[mode][digest] = (checks[mode][digest] ?? 0) + 1;
  };
  const later = interaction => /oneOf|if-then/.test(fixtureName) ? { ...interaction } :
    { ...interaction, value: typeof interaction.value === 'string' ? `${interaction.value}-later` :
      typeof interaction.value === 'number' ? interaction.value + 1 : !interaction.value };
  const createProps = () => ({ jsonSchema: structuredClone(version === 'old' ? fixture.legacy : fixture.workspace),
    validationMode: validation === 'on' ? 1 : 0, onChange: noop,
    ...(validation === 'on' ? api.validatorServices() : {}) });
  const write = (root, interaction) => {
    const node = root.find(interaction.path);
    assert(node, `Missing ${fixtureName} ${interaction.path}`);
    node.setValue(interaction.value);
  };
  const addTimes = records => records.reduce((total, record) => total.map((value, index) => round(value + record.timing[index])), [0, 0]);

  assert.equal(version,'new');assert.equal(validation,'off');
  if(countMode){asyncHook.enable();observer.observe({entryTypes:['gc']});}
  for(const stage of ['empty-before','operations','empty-after']){
   for(let index=-measurementWarmup;index<sampleCount;index++){
    globalThis.gc();
    const props=stage==='operations'?createProps():null;
    await new Promise(resolve=>immediate(resolve));
    if(stage!=='operations'){const r=await measure(noop,false,stage,index);if(index>=0)timings[stage].push(r.timing);continue;}
    const mounted=await measure(()=>engine.nodeFromJSONSchema(props),false,'mount',index);
    const root=mounted.result;
    if(index>=0){timings.mount.push(mounted.timing);capture('mount',root);}
    const updates=[];
    for(const interaction of fixture.interactions){
     const r=await measure(()=>write(root,interaction),false,updates.length===0?'update-first':'BF-later',index);
     updates.push(r);
     if(index>=0&&updates.length===1){timings['update-first'].push(r.timing);capture('update-first',root);}
    }
    api.assertValue(root,fixture);
    if(index>=0){timings.update.push(addTimes(updates));capture('update',root);}
    const repeated=await measure(()=>write(root,later(fixture.interactions[0])),false,'update-later',index);
    if(index>=0){timings['update-later'].push(repeated.timing);capture('update-later',root);}
   }
  }
  await flushMicrotasks(128);await new Promise(resolve=>immediate(resolve));
  if(countMode){asyncHook.disable();observer.disconnect();}
  assert.equal(process.getActiveResourcesInfo().filter(name=>['Timeout','Immediate','MessagePort','PROCESSWRAP'].includes(name)).length,0);

  const compactGroups=Object.fromEntries(Object.entries(groups).map(([mode,g])=>[mode,{...g,
   functions:undefined,functionTotals:Object.fromEntries(Object.entries(g.functions).map(([phase,counts])=>[phase,Object.values(counts).reduce((a,b)=>a+b,0)])),
   functionSites:Object.fromEntries(Object.entries(g.functions).map(([phase,counts])=>[phase,Object.keys(counts).length])),
   afterMicrotaskFunctions:g.functions.tail,microtaskFunctions:g.functions.micro,
   relevantSync:Object.fromEntries(Object.entries(g.functions.sync).filter(([site])=>/createChildNode|bind|arrangeSchema|applyArray|dispatchSetValue|writeSchemaNode|requestSchemaNodeValidation|runSchemaNodeValidation|exitSchemaNodeChain/i.test(site)))}]));
  console.log(JSON.stringify({kind:'meta',value:{fixture:fixtureName,run,version,validation,countMode,splitMode,
   environment:{head:measurementHead,node:process.version,v8:process.versions.v8,started,ended:new Date().toISOString()},
   warmup:measurementWarmup,sampleCount,serviceExits,checks,
   instrumentation:{clockCallsInsideEngine:0,sites:globalThis.__111sites.length,files:[...new Set(globalThis.__111sites.map(s=>s.split(':')[0]))].length},
   gcEntries:gcEntries.filter(entry=>spans.some(s=>entry.start<s.end&&entry.end>s.microAt))}}));
  for(const [kind,values] of Object.entries({groups:Object.entries(compactGroups),timings:Object.entries(timings),spans})){
   const size=kind==='spans'?20:1;
   for(let offset=0;offset<values.length;offset+=size){await new Promise(resolve=>setTimeout(resolve,300));console.log(JSON.stringify({kind,value:values.slice(offset,offset+size)}));}
  }
}

