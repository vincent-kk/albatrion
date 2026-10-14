// Measurement-only CLI; all engine transforms, bundles and maps stay in memory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import inspector from 'node:inspector';
import childProcess, { execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const script = fileURLToPath(import.meta.url), artifacts = path.dirname(script);
const D = path.dirname(artifacts), PKG = path.resolve(D, '../../..');
const REPO = path.resolve(PKG, '../../..');
const BUNDLES = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const HEAD = '3b38c7092272dc281c8997b76ea7d2e4dae91e57';
const started = Date.now(), startedISO = new Date().toISOString();
const req = createRequire(path.join(PKG, 'package.json'));
const ts = req('typescript');
const { TraceMap, originalPositionFor } = req('@jridgewell/trace-mapping');
const hash = value => createHash('sha256').update(value).digest('hex');
const q = (values, p) => values.toSorted((a,b) => a-b)[Math.ceil(values.length*p)-1];
const median = values => q(values, .5);
const metric = values => ({ n: values.length, median: median(values), p95: q(values,.95), p99:q(values,.99) });
const anchor = () => new Promise(resolve => setImmediate(resolve));
const drain = async () => { for(let i=0;i<64;i++) await Promise.resolve(); await anchor(); };
const canonical = value => JSON.stringify(value, (_key,item) => item && !Array.isArray(item) && typeof item==='object' ? Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))) : item);
assert.equal(execFileSync('git',['--no-optional-locks','rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).trim(),HEAD);
assert.equal(process.version,'v26.10.0');
assert.equal(process.env.TMPDIR, BUNDLES);
assert.equal(process.env.NODE_DISABLE_COMPILE_CACHE,'1');

function replaceOnce(source,before,after) {
  assert.equal(source.split(before).length,2, before);
  return source.replace(before,after);
}

// AST edits apply solely to the builder's onLoad buffer.
function bodyTransform(source,file,name,callback) {
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true), edits=[];
  const visit=node=>{
    const named=(ts.isFunctionDeclaration(node)||ts.isMethodDeclaration(node))&&node.name?.getText(ast)===name;
    const arrow=ts.isArrowFunction(node)&&ts.isVariableDeclaration(node.parent)&&node.parent.name.getText(ast)===name;
    if((named||arrow)&&node.body&&ts.isBlock(node.body))edits.push([node.body.getStart(ast),node.body.end,callback(source.slice(node.body.getStart(ast),node.body.end),node)]);
    ts.forEachChild(node,visit);
  };
  visit(ast); assert.equal(edits.length,1,file+':'+name);
  const [a,b,text]=edits[0]; return source.slice(0,a)+text+source.slice(b);
}

function transform(file, source, variant) {
  const active='globalThis.__ablate109?.active';
  const guarded=(name, replacement)=>bodyTransform(source,file,name,original=>`{if(${active}){${replacement}}return(()=>${original})();}`);
  if(variant==='event-mark'&&file.endsWith('/markSchemaNodeEvent.ts'))return guarded('markSchemaNodeEvent','return;');
  if(variant==='delivery-scan'&&file.endsWith('/markCommitDeliveries.ts'))return guarded('markCommitDeliveries','return;');
  if(variant==='assembly-replay'&&file.endsWith('/assembleObject.ts'))return bodyTransform(source,file,'assembleObject',original=>`{
    const state=globalThis.__ablate109;if(!state?.active)return(()=>${original})();
    const key=state.mode+'|'+node.path,at=state.cursors[key]??0;state.cursors[key]=at+1;
    if(state.replay){const tape=state.tapes[key];if(!tape||at>=tape.length)throw new Error('Assembly tape exhausted '+key);if(hint)hint.incremental=true;return tape[at];}
    const result=(()=>${original})();(state.tapes[key]??=[])[at]=result;return result;
  }`);
  if(variant==='output-replay'&&file.endsWith('/updateOutput.ts'))return bodyTransform(source,file,'updateOutput',original=>`{
    const state=globalThis.__ablate109;if(!state?.active)return(()=>${original})();
    const key=state.mode+'|output|'+node.path,at=state.cursors[key]??0;state.cursors[key]=at+1;
    if(state.replay){const tape=state.tapes[key];if(!tape||at>=tape.length)throw new Error('Output tape exhausted '+key);const held=tape[at];context.pendingOutputs?.delete(node);node.local=captureSchemaNodeChange(node,'local',held.local);node.emit=captureSchemaNodeChange(node,'emit',held.emit);if(held.changed)context.changedNodes.add(node);return held.changed;}
    const changed=(()=>${original})();(state.tapes[key]??=[])[at]={local:node.local,emit:node.emit,changed};return changed;
  }`);
  if(variant==='fixed-empty-latent'&&file.endsWith('/pruneLatentRaw.ts'))return guarded('pruneLatentRaw','return;');
  if(variant==='commit-bookkeeping'&&file.endsWith('/commitSettlement.ts'))return guarded('commitSettlement','const runtime=context.root.runtime;runtime.commitNumber=(runtime.commitNumber??0)+1;markCommitDeliveries(context);return;');
  if(variant==='recalculation'&&file.endsWith('/registerRecalculation.ts'))return guarded('registerRecalculation',`if(context.hasGates)throw new Error('Unsupported gate replay');context.dirtyPaths.beginPostOrder();for(const path of context.changedRaw){let current=path;context.dirtyPaths.add(current);while(current){current=current.slice(0,current.lastIndexOf('/'));context.dirtyPaths.add(current);}}return;`);
  if(variant==='scalar-mark'&&file.endsWith('/markWrite.ts'))return guarded('markWrite',`if(node.behavior.strategy==='branch'||context.kind==='load'||context.automatic)throw new Error('Unsupported scalar replay');context.writtenInputs.set(node,input);const value=node.behavior.interpret(input,spec);if(!sameValue(node.raw,value)){node.raw=value;context.changedRaw.add(node.path);context.changedNodes.add(node);}context.dirtyPaths.add(node.path);return;`);
  if(variant==='compute-shell'&&file.endsWith('/computeNode.ts'))return guarded('computeNode',`if(context.hasGates||context.shapeDirtyPaths.size)throw new Error('Unsupported compute shell');context.stateDirtyNodes.add(node);if(node.behavior.strategy==='branch'){const changed=dirtyChildren(node,context);for(let i=0;i<changed.length;i++)computeNode(changed[i],context);updateOutput(node,context,changed);}else updateOutput(node,context);context.dirtyPaths.delete(node.path);return;`);
  if(variant==='scratch-release'&&file.endsWith('/releaseSettlementScratch.ts')){
    source=guarded('releaseSettlementScratch','return;');return source+'\nglobalThis.__release109=releaseSettlementScratch;\n';
  }
  if(variant==='fixed-shell'&&file.endsWith('/writeSchemaNode.ts'))return guarded('writeSchemaNode',`const scratch=getSettlementScratch(node.rootNode.runtime);const context=createSettlementContext(node,kind,option,scratch,true);context.source=source;context.writeOrigins=writeOrigins;try{markWrite(node,input,context);registerRecalculation(context);computeNode(context.root,context);finishSettlement(context,scratch);}finally{releaseSettlementScratch(scratch);}return;`);
  if(variant==='fixed-shell'&&file.endsWith('/finishSettlement.ts'))return guarded('finishSettlement',`for(const path of context.changedRaw)scratch.explicitRaw.add(path);publishStateKeys(context);commitSettlement(context);return;`);
  return source;
}

async function load(fixtureName, variant='head', production=true, deferClose=false) {
  const original=path.join(PKG,'bench/branchless-phase-diagnosis.mjs');
  let source=fs.readFileSync(original,'utf8');
  source=replaceOnce(source,"import { writeMeasurement } from './measurement-output.mjs';",`import { writeMeasurement } from ${JSON.stringify(pathToFileURL(path.join(PKG,'bench/measurement-output.mjs')).href)};`);
  source=replaceOnce(source,"const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');",'const pkg = '+JSON.stringify(PKG)+';');
  source=replaceOnce(source,"const engines = { old: await bundle('old'), new: await bundle('new') };","const engines = { new: await bundle('new') };");
  source=replaceOnce(source,'(flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20))','(sample-[0-3]|flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20))');
  source=replaceOnce(source,'write: false, bundle: true, packages:',`write: false, sourcemap: 'external', outfile: ${JSON.stringify(path.join(BUNDLES,'profile109-'+variant+'.cjs'))}, bundle: true, packages:`);
  source=replaceOnce(source,'return { contents: instrument(args.path, source, trace),', 'return { contents: globalThis.__transform109(args.path, source),');
  source=replaceOnce(source,'const module = { exports: {} };','globalThis.__bundle109={text:result.outputFiles.find(f=>f.path.endsWith(".cjs")).text,map:JSON.parse(result.outputFiles.find(f=>f.path.endsWith(".map")).text)}; const module = { exports: {} };');
  source=replaceOnce(source,'result.outputFiles[0].text)(bfReq, module, module.exports);','globalThis.__bundle109.text + '+JSON.stringify('\n//# sourceURL='+path.join(BUNDLES,'profile109-'+variant+'.cjs'))+' )(bfReq, module, module.exports);');
  source=replaceOnce(source,'export { engines, fixtures, begin, finish, drain, React, flushSync, createRoot };','export { engines, fixtures, valueOf, assertValue, req, bfReq, hooks };');
  process.env.PHASE_FIXTURES=fixtureName;
  process.argv.push('--probe-import','--plain',...(production?['--production']:[]));
  globalThis.__transform109=(file,text)=>transform(file,text,variant);
  const services=[], originalSpawn=childProcess.spawn;
  childProcess.spawn=function(file,args,options){const child=originalSpawn(file,args,options);if(String(file).includes('esbuild'))services.push(child);return child;};
  let api;
  try { api=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')); }
  finally { childProcess.spawn=originalSpawn; }
  const serviceExits=[];
  if(!deferClose)for(const service of services){service.ref();const done=service.exitCode===null?once(service,'exit'):Promise.resolve([service.exitCode,null]);service.stdin.end();const [code,signal]=await done;assert.equal(code,0);assert.equal(signal,null);serviceExits.push({code,signal,mechanism:'stdin EOF'});}
  assert.equal(api.fixtures.length,1); assert.equal(api.hooks.length,0);
  const bundle=globalThis.__bundle109;
  assert(!/__phaseEnter|__phaseExit/.test(bundle.text));
  return {api,engine:api.engines.new,fixture:api.fixtures[0],bundle,serviceExits,services,bundleSha256:hash(bundle.text)};
}

const props = fixture => ({jsonSchema:structuredClone(fixture.workspace),validationMode:0,onChange:()=>{}});
const later = interaction => ({...interaction,value:typeof interaction.value==='string'?interaction.value+'-later':typeof interaction.value==='number'?interaction.value+1:!interaction.value});
function write(root, interaction) { const node=root.find(interaction.path); assert(node,interaction.path); node.setValue(interaction.value); }

// Diagnostic clocks expose synchronous completion, checkpoint completion and sentinel wait.
async function measured(operation) {
  const beginUs=Number(process.hrtime.bigint()/1000n),begin=performance.now();
  const result=operation(),syncUs=Number(process.hrtime.bigint()/1000n),sync=performance.now();
  for(let i=0;i<64;i++) await Promise.resolve();
  const microUs=Number(process.hrtime.bigint()/1000n),micro=performance.now();
  const end=await new Promise(resolve=>setImmediate(()=>resolve({end:performance.now(),endUs:Number(process.hrtime.bigint()/1000n)})));
  return {result,beginUs,syncUs,microUs,...end,timing:[micro-begin,end.end-begin],parts:[sync-begin,micro-sync,end.end-micro]};
}

async function measuredPlain(operation) {
  const beginUs=Number(process.hrtime.bigint()/1000n),begin=performance.now();const result=operation();const syncEndUs=Number(process.hrtime.bigint()/1000n);
  for(let i=0;i<64;i++)await Promise.resolve();
  const end=await new Promise(resolve=>setImmediate(()=>resolve({end:performance.now(),endUs:Number(process.hrtime.bigint()/1000n)})));
  return {result,beginUs,syncEndUs,...end,ms:end.end-begin};
}

function attribution(profile, windows, bundle, variant) {
  const map=new TraceMap(bundle.map),nodes=new Map(profile.nodes.map(n=>[n.id,n])),parents=new Map();
  for(const n of profile.nodes)for(const child of n.children??[])parents.set(child,n.id);
  const mapped=frame=>{
    let file=frame.url||'(V8)',line=frame.lineNumber+1,column=frame.columnNumber;
    if(file.endsWith('/profile109-'+variant+'.cjs')&&line>0){const s=originalPositionFor(map,{line:line-2,column:Math.max(0,column)});if(s.source){file=path.relative(REPO,path.resolve(BUNDLES,s.source));line=s.line;column=s.column;}}
    else if(file.startsWith('file://'))file=path.relative(REPO,fileURLToPath(file));
    else if(file.startsWith(REPO))file=path.relative(REPO,file);
    if(file.startsWith('data:'))file='(in-memory loader)';
    return {function:frame.functionName||'(anonymous)',file,line,column};
  };
  const stacks=new Map();for(const n of profile.nodes){const stack=[];for(let id=n.id;id!==undefined;id=parents.get(id))stack.push(mapped(nodes.get(id).callFrame));stacks.set(n.id,stack);}
  let stamp=profile.startTime,at=0,denominatorUs=0,samples=0;const rows=new Map();
  for(let i=0;i<profile.samples.length;i++){
    const previous=stamp;stamp+=profile.timeDeltas[i];while(at<windows.length&&windows[at].endUs<=previous)at++;if(!windows[at])break;
    let weight=0;for(let k=at;k<windows.length&&windows[k].beginUs<stamp;k++)weight+=Math.max(0,Math.min(stamp,windows[k].endUs)-Math.max(previous,windows[k].beginUs));
    if(!weight)continue;denominatorUs+=weight;samples++;const seen=new Set(),stack=stacks.get(profile.samples[i]);
    for(let j=0;j<stack.length;j++){const f=stack[j],key=f.function+'|'+f.file+':'+f.line+':'+f.column;if(seen.has(key))continue;seen.add(key);let row=rows.get(key);if(!row)rows.set(key,row={...f,selfUs:0,totalUs:0});row.totalUs+=weight;if(j===0)row.selfUs+=weight;}
  }
  const functions=[...rows.values()].map(r=>({...r,selfPct:r.selfUs/denominatorUs*100,totalPct:r.totalUs/denominatorUs*100})).sort((a,b)=>b.selfUs-a.selfUs);
  return {denominatorUs,samples,windowUs:windows.reduce((sum,w)=>sum+w.endUs-w.beginUs,0),selfConservationUs:functions.reduce((s,r)=>s+r.selfUs,0),functions};
}

async function profilerStart(interval=10) {
  const session=new inspector.Session();session.connect();
  const post=(method,params={})=>new Promise((resolve,reject)=>session.post(method,params,(e,result)=>e?reject(e):resolve(result)));
  await post('Profiler.enable');await post('Profiler.setSamplingInterval',{interval});await post('Profiler.start');
  return async()=>{const {profile}=await post('Profiler.stop');session.disconnect();return profile;};
}

async function cpu(fixtureName,mode,run) {
  const loaded=await load(fixtureName),{engine,fixture,api}=loaded;
  const prepare=async()=>{const root=engine.nodeFromJSONSchema(props(fixture));await drain();if(mode==='later'){for(const interaction of fixture.interactions){write(root,interaction);await drain();}}return root;};
  for(let i=0;i<20;i++){const root=await prepare();await measuredPlain(()=>write(root,mode==='first'?fixture.interactions[0]:later(fixture.interactions[0])));}
  // Root construction is outside profiling; first means the first write on each fresh root.
  const roots=[];for(let i=0;i<101;i++)roots.push(await prepare());
  const stop=await profilerStart(),windows=[];
  for(let i=0;i<101;i++){const sample=await measuredPlain(()=>write(roots[i],mode==='first'?fixture.interactions[0]:later(fixture.interactions[0])));windows.push({index:i,beginUs:sample.beginUs,endUs:sample.endUs,syncEndUs:sample.syncEndUs,ms:sample.ms});}
  const profile=await stop();
  return {...base(loaded),kind:'cpu',fixture:fixtureName,mode,run,warmup:20,samples:101,intervalUs:10,forcedGc:false,engineInstrumentation:false,preparedRoots:101,windows,cpu:attribution(profile,windows.map(w=>({...w,endUs:w.syncEndUs})),loaded.bundle,'head'),endpointCpu:attribution(profile,windows,loaded.bundle,'head'),profile,observedDigest:hash(canonical(api.valueOf(roots.at(-1))))};
}

async function diagnose(fixtureName,run,emptyPlacement='original') {
  assert.equal(typeof globalThis.gc,'function');
  const loaded=await load(fixtureName,'head',false),{engine,fixture,api}=loaded;
  const raw={empty:[],first:[],later:[],mount:[],shadow:[]},windows={sync:[],checkpoint:[],tail:[]};
  const empty=async()=>{globalThis.gc();await anchor();return measured(()=>{});};
  for(let i=-20;i<101;i++){const s=await empty();if(i>=0)raw.empty.push(s.timing);}
  const stop=emptyPlacement==='shadow-unprofiled'?null:await profilerStart();
  for(let i=-20;i<101;i++){
    globalThis.gc();const p=props(fixture);await anchor();const mount=await measured(()=>engine.nodeFromJSONSchema(p)),root=mount.result;
    if(i>=0){raw.mount.push(mount.timing);hash(canonical(api.valueOf(root)));}
    // Optional empty shadow keeps the preceding work and check-phase position, without engine work.
    if(emptyPlacement.startsWith('shadow')){const s=await measured(()=>{});if(i>=0)raw.shadow.push(s.timing);}
    for(let j=0;j<fixture.interactions.length;j++){
      const s=await measured(()=>write(root,fixture.interactions[j]));
      if(i>=0&&j===0){raw.first.push({timing:s.timing,parts:s.parts});windows.sync.push({beginUs:s.beginUs,endUs:s.syncUs});windows.checkpoint.push({beginUs:s.syncUs,endUs:s.microUs});windows.tail.push({beginUs:s.microUs,endUs:s.endUs});hash(canonical(api.valueOf(root)));}
    }
    api.assertValue(root,fixture);if(i>=0)hash(canonical(api.valueOf(root)));
    const s=await measured(()=>write(root,later(fixture.interactions[0])));if(i>=0)raw.later.push({timing:s.timing,parts:s.parts});
    assert(Date.now()-started<420000);
  }
  const profile=stop?await stop():null;for(let i=-20;i<101;i++){const s=await empty();if(i>=0)raw.empty.push(s.timing);}
  return {...base(loaded),kind:'endpoint-diagnostic',fixture:fixtureName,run,emptyPlacement,raw,cpuByPart:profile?Object.fromEntries(Object.entries(windows).map(([key,w])=>[key,attribution(profile,w,loaded.bundle,'head')])):null,profile,windows};
}

async function bound(fixtureName,variant,run) {
  assert.equal(typeof globalThis.gc,'function');
  const head=await load(fixtureName,'head',true,true),candidate=await load(fixtureName,variant),{fixture}=head;
  for(const service of head.services){service.ref();const done=service.exitCode===null?once(service,'exit'):Promise.resolve([service.exitCode,null]);service.stdin.end();const [code,signal]=await done;assert.equal(code,0);assert.equal(signal,null);head.serviceExits.push({code,signal,mechanism:'stdin EOF'});}
  const timings={head:{first:[],later:[]},variant:{first:[],later:[]}},digests={head:{first:{},later:{}},variant:{first:{},later:{}}};
  const state=globalThis.__ablate109={active:false,replay:false,tapes:{},cursors:{},mode:'first'};
  const empty=[];for(let i=-20;i<101;i++){globalThis.gc();await anchor();const t=await measuredPlain(()=>{});if(i>=0)empty.push(t.ms);}
  const update=async(version,index)=>{
    const loaded=version==='head'?head:candidate;
    state.active=false;globalThis.gc();const p=props(fixture);await anchor();const root=loaded.engine.nodeFromJSONSchema(p);await drain();hash(canonical(loaded.api.valueOf(root)));
    assert.equal(root.runtime.latentRaw.size,0);
    for(const mode of ['first','later']){
      const interaction=mode==='first'?fixture.interactions[0]:later(fixture.interactions[0]);
      state.mode=mode;state.cursors={};state.active=version==='variant';
      const t=await measuredPlain(()=>write(root,interaction));state.active=false;
      if(variant==='scratch-release'&&version==='variant')globalThis.__release109(root.runtime.settlementScratch);
      const digest=hash(canonical(loaded.api.valueOf(root)));
      if(index>=0){timings[version][mode].push(t.ms);digests[version][mode][digest]=(digests[version][mode][digest]??0)+1;}
      if(mode==='first'){for(const next of fixture.interactions.slice(1)){write(root,next);await drain();}loaded.api.assertValue(root,fixture);}
    }
    if(version==='variant'&&!state.replay)state.replay=true;
  };
  for(let i=-20;i<101;i++)for(const version of (i+run)%2===1?['head','variant']:['variant','head']){await update(version,i);assert(Date.now()-started<420000);}
  for(let i=-20;i<101;i++){globalThis.gc();await anchor();const t=await measuredPlain(()=>{});if(i>=0)empty.push(t.ms);}
  assert.deepEqual(digests.head,digests.variant,'Fixture values differ');
  const correction=median(empty);for(const version of ['head','variant'])for(const mode of ['first','later'])timings[version][mode]=timings[version][mode].map(v=>v-correction);
  return {...base(head),kind:'bound',fixture:fixtureName,variant,run,warmup:20,samples:101,freshProcess:true,forcedGcOutsideClock:true,order:'per-sample alternating',production:true,endpoint:'64 checkpoints + FIFO sentinel',candidateBundleSha256:candidate.bundleSha256,candidateServiceExits:candidate.serviceExits,timings,empty,correction,digests,tapeLengths:Object.fromEntries(Object.entries(state.tapes).map(([k,v])=>[k,v.length]))};
}

function base(loaded) { return {HEAD,node:process.version,v8:process.versions.v8,started:startedISO,ended:new Date().toISOString(),elapsedMs:Date.now()-started,pid:process.pid,bundleSha256:loaded.bundleSha256,serviceExits:loaded.serviceExits,driverSha256:hash(fs.readFileSync(script))}; }

function compactProfile(profile) {
  // Data-URL source bytes are already identified by hashes; preserve sample/frame coordinates.
  for(const node of profile.nodes)if(node.callFrame.url.startsWith('data:'))node.callFrame.url='(in-memory loader)';
  return profile;
}

const [command,...args]=process.argv.slice(2);
let result;
if(command==='--official') {
  const original=path.join(D,'tools/measure-verdict-95c01.mjs');let source=fs.readFileSync(original,'utf8');
  source=replaceOnce(source,'const directory = path.dirname(fileURLToPath(import.meta.url));','const directory = '+JSON.stringify(path.dirname(original))+';');
  source=replaceOnce(source,"const expectedHead = '4d2e54533dc8feaccb4742be9dd322e46d20be58';",'const expectedHead = '+JSON.stringify(HEAD)+';');
  source=replaceOnce(source,'const warmup = 12, sampleCount = 101;','const warmup = 20, sampleCount = 101;');
  source=replaceOnce(source,'hash(fs.readFileSync(fileURLToPath(import.meta.url)))','hash(fs.readFileSync('+JSON.stringify(original)+'))');
  process.argv.splice(2,1);await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
} else if(command==='--cpu') result=await cpu(args[0],args[1],Number(args[2]));
else if(command==='--diagnose') result=await diagnose(args[0],Number(args[1]),args[2]);
else if(command==='--bound') result=await bound(args[0],args[1],Number(args[2]));
else assert.fail('Use --official, --cpu or --diagnose');
assert(Date.now()-started<480000);
if(result){if(result.profile){const raw=JSON.stringify(compactProfile(result.profile));result.profileEvidence={encoding:'gzip+base64',rawBytes:Buffer.byteLength(raw),sha256:hash(raw),data:gzipSync(raw).toString('base64')};delete result.profile;}console.log(JSON.stringify(result));}
