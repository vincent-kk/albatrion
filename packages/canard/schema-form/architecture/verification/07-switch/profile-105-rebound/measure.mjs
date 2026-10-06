// Explicit measurement CLI; source transforms exist only in the esbuild onLoad memory buffer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script);
const directory = path.dirname(artifacts);
const base = path.join(directory, 'profile-102-work/measure.mjs');
const HEAD = 'a958b37cbf7d7cd897565a06278ee141fd402816';
let source = fs.readFileSync(base, 'utf8');
source = source.slice(0, source.lastIndexOf('const [command, ...args] = process.argv.slice(2);'));
source = source.replace('const script = fileURLToPath(import.meta.url);', 'const script = '+JSON.stringify(script)+';');
source = source.replace("const HEAD = '268832c7cb6eea67475b56ab5a78408a55ec47a3';", 'const HEAD = '+JSON.stringify(HEAD)+';');
source = source.replaceAll('profile102-', 'profile105-');
source = source.replace('function transform(file, source, variant) {', 'function inheritedTransform(file, source, variant) {');
source = source.replace('globalThis.__transform102 = transform;', 'globalThis.__transform102 = transform;');
source = source.replace('  const a=source.indexOf(\'      const declarations = child.declarations.map(\'),b=source.indexOf(\'      entries.push(\',a);',
  '  const a=source.indexOf("      const declarations = []"),b=source.indexOf("      const entry =",a);');
source = source.replace("  const expression=source.slice(a,b).trim().slice('const declarations = '.length,-1);", "  const expression='(()=>{'+source.slice(a,b)+'return declarations;})()';");
source = source.replace('      return held.result;}', '      if(input.fragment && held.fragments[0])input.fragment.children.push(held.fragments[0].id);return held.result;}');
source = source.replace('globalThis.__bound102.memo = new WeakMap(); globalThis.__bound102.strings = new Map(); globalThis.__bound102.cursors = {};',
  'globalThis.__bound102.memo = new WeakMap(); globalThis.__bound102.strings = new Map(); globalThis.__bound102.cursors = {};globalThis.__bound102.projections=new WeakMap();globalThis.__bound102.firstContexts=new WeakMap();');
source = source.replace('    if (index >= 0) { data[version].push(sample.ms);',
  '    if (index >= 0) { data[version].push(sample.ms);');
source = source.replace('observations: Object.fromEntries(Object.entries(last).map(([key, root]) => [key, api.observe(root)])),',
  'observations: Object.fromEntries(Object.entries(last).map(([key, root]) => [key, api.observe(root)])),bundleHashes:{head:createHash("sha256").update(fs.readFileSync(bundleFor("head"))).digest("hex"),variant:createHash("sha256").update(fs.readFileSync(bundleFor(variant))).digest("hex")},');
source = source.replace('  const session = new inspector.Session(); session.connect();',
  "  const preparedSchemas=Array.from({length:101},()=>structuredClone(version==='old'?fixture.legacy:fixture.workspace));\n  const session = new inspector.Session(); session.connect();");
source = source.replace("    const schema = structuredClone(version === 'old' ? fixture.legacy : fixture.workspace);\n    const sample = await measured", "    const schema = preparedSchemas[i];\n    const sample = await measured");
source = source.replace('counterInstrumentation: false, windows, cpu: result,', 'counterInstrumentation: false, clonePreparation: "101 schemas before Profiler.start", windows, cpu: result,');

source += String.raw`
/** Recheck both official endpoints before selecting the legacy verdict column. */
async function verdictPair105(name,run) {
  const engines={head:require(bundleFor('head')),old:require(bundleFor('old'))};
  const fixture=fixtureFor(engines.head,name),timings={head:[],old:[]},last={},windows=[],emptyBefore=[],emptyAfter=[];
  const measure=async operation=>{
    const begin=performance.now();const root=operation();
    for(let index=0;index<64;index++)await Promise.resolve();
    const micro=performance.now()-begin;
    const end=await new Promise(resolve=>setImmediate(()=>resolve(performance.now())));
    return {root,micro,terminal:end-begin,begin,end};
  };
  for(let index=0;index<101;index++){const result=await measure(()=>{});emptyBefore.push([result.micro,result.terminal]);}
  for(let index=-20;index<101;index++)for(const version of (index+20+run-1)%2===0?['head','old']:['old','head']) {
    assert(Date.now()-startedMs<420000);
    const schema=structuredClone(version==='old'?fixture.legacy:fixture.workspace);
    globalThis.gc();await new Promise(resolve=>setImmediate(resolve));
    const result=await measure(()=>api.create(engines[version],fixture,version,schema));last[version]=result.root;
    if(index>=0){timings[version].push([result.micro,result.terminal]);windows.push({version,index,begin:result.begin,end:result.end});}
  }
  for(let index=0;index<101;index++){const result=await measure(()=>{});emptyAfter.push([result.micro,result.terminal]);}
  const scheduler=require('@winglet/common-utils/scheduler'),originalSchedule=scheduler.scheduleMacrotaskSafe,originalCancel=scheduler.cancelMacrotaskSafe;
  let scope;const pending=new Map(),callbacks=[],ordering=[];
  scheduler.scheduleMacrotaskSafe=(callback,...args)=>{
    const owner=scope;assert(owner,'Scheduling outside diagnostic operation');owner.scheduled++;
    const token=originalSchedule(function(...values){owner.executed++;const begin=performance.now();try{return callback.apply(this,values);}finally{owner.ms+=performance.now()-begin;pending.delete(token);}},...args);pending.set(token,owner);return token;
  };
  scheduler.cancelMacrotaskSafe=token=>{const owner=pending.get(token);if(owner){owner.cancelled++;pending.delete(token);}return originalCancel(token);};
  const observe=async operation=>{
    scope={scheduled:0,executed:0,cancelled:0,ms:0};const record=scope;operation();
    for(let index=0;index<64;index++)await Promise.resolve();record.pendingAtMicro=pending.size;
    await new Promise(resolve=>setImmediate(resolve));record.pendingAtSentinel=pending.size;assert.equal(pending.size,0);
    const scheduled=record.scheduled,executed=record.executed;
    for(let index=0;index<128;index++)await Promise.resolve();await new Promise(resolve=>setImmediate(resolve));
    record.tailScheduled=record.scheduled-scheduled;record.tailExecuted=record.executed-executed;
    assert.equal(record.tailScheduled+record.tailExecuted,0);assert.equal(record.scheduled,record.executed+record.cancelled);scope=undefined;return record;
  };
  for(let index=-20;index<101;index++) {
    const schema=structuredClone(fixture.legacy);globalThis.gc();await new Promise(resolve=>setImmediate(resolve));
    const record=await observe(()=>api.create(engines.old,fixture,'old',schema));assert(record.executed>0&&record.pendingAtMicro>0);
    if(index>=0){callbacks.push(record.ms);ordering.push(record);}
  }
  const headBoundary=await observe(()=>api.create(engines.head,fixture,'head',structuredClone(fixture.workspace)));assert.equal(headBoundary.scheduled,0);
  scheduler.scheduleMacrotaskSafe=originalSchedule;scheduler.cancelMacrotaskSafe=originalCancel;
  const observed={head:api.observe(last.head),old:api.observe(last.old)};assert.equal(observed.head.sha256,observed.old.sha256);
  save(path.join(artifacts,'verdict-'+name+'-r'+run+'.json'),{HEAD,name,run,warmup:20,samples:101,freshProcess:true,forcedGCOutsideClock:true,firstOrder:run%2?'head':'old',timingsMs:timings,emptyTimingsMs:{before:emptyBefore,after:emptyAfter},callbackExecutionMs:callbacks,ordering,headBoundary,windows,observations:observed,bundleHashes:{head:createHash('sha256').update(fs.readFileSync(bundleFor('head'))).digest('hex'),old:createHash('sha256').update(fs.readFileSync(bundleFor('old'))).digest('hex')},environment:api.environment(),elapsedMs:Date.now()-startedMs});
  console.log(JSON.stringify({name,run,headTerminal:metric(timings.head.map(x=>x[1])).median,oldTerminal:metric(timings.old.map(x=>x[1])).median,callback:metric(callbacks).median,seconds:(Date.now()-startedMs)/1000}));
}

/** Supply an ungated single declaration directly to construction, preserving the binding producer. */
function childEnumerationOnce(source,file) {
  const a=source.indexOf('    for (let childIndex = 0; childIndex < children.length; childIndex++) {');
  const b=source.indexOf('  if (itemInputs.length)',a);
  assert(a>=0&&b>a);
  const binding=source.slice(a,b).replace(/\n  }\s*$/, '');
  const fast=String.raw\x60
    if(node.kind==='object' && node.declarations.length===1) {
      const declaration=node.declarations[0],schema=readSchemaObject(declaration.schema);
      if(declaration.context==='conjunction' && !declaration.gates.length && !schema.controls?.children?.length && schema.properties && typeof schema.properties==='object') {
        const entries=node.childEntries;
        const pairs=Object.entries(schema.properties);
        for(let propertyIndex=0;propertyIndex<pairs.length;propertyIndex++) {
          const [name,childSchema]=pairs[propertyIndex];
          const input={context:declaration.context,gates:[],inherited:declaration.inherited,hostPath:node.path,fragment:context.fragments[declaration.fragmentId],role:'declaration',schema:childSchema,schemaPath:declaration.schemaPath+'/properties/'+escapeSegment(name),order:[...declaration.order,0,propertyIndex]};
          const inputs=[input],path=node.path+'/'+escapeSegment(name),children=build(context,inputs,path);
          \x24{binding}
        }
        populateVirtualNodes(context,node);return;
      }
    }
  \x60;
  return bodyTransform(source,file,'populateNodeChildren',original=>'{'+fast+original.slice(1));
}

/** Context-local read ablation; optional lifetime guard admits load and the root's first input. */
function projectionReuse(source,file,limited) {
  return bodyTransform(source,file,'readProjectedValue',original=>\x60{
    const state=globalThis.__bound102;
    \x24{limited ? "let first=state.firstContexts.get(context.root);if(!first&&context.kind!=='load'){state.firstContexts.set(context.root,first=context);}if(context.kind!=='load'&&first!==context)return(()=>"+original+")();" : ''}
    if(context.pendingOutputs?.size)state.projections.delete(context);
    let memo=state.projections.get(context);if(!memo)state.projections.set(context,memo=new Map());
    if(memo.has(path))return memo.get(path);
    const value=(()=>\x24{original})();memo.set(path,value);return value;
  }\x60);
}

/** Compose only a single measured work family with the inherited, source-backed builder. */
function transform(file,source,variant) {
  if(variant==='gate-active-input-zero'&&file.endsWith('/evaluateGate.ts')) {
    source=once(source,"  const host = raw !== null && typeof raw === 'object' && !isArray(raw)","  const host = gate.kind==='active' ? undefined : raw !== null && typeof raw === 'object' && !isArray(raw)");
    return once(source,'  let input: Record<string, unknown> = { ...host };',"  let input: Record<string, unknown> = gate.kind==='active' ? undefined! : { ...host };");
  }
  if(variant==='index-declarations-needed'&&file.endsWith('/getDependencyIndex.ts'))return once(source,'const declarations = new Map<number, PropertyDeclaration>(blueprint.nodes.flatMap((node) =>', 'const declarations = new Map<number, PropertyDeclaration>((dependencies.length ? blueprint.nodes : []).flatMap((node) =>');
  if(variant==='fragment-empty-fast'&&file.endsWith('/collectDeclarations.ts'))return once(source,'  const stack = [...visiting, input.schemaPath];',"  if(typeof schema.$ref!=='string'&&schema.allOf===undefined&&schema.if===undefined&&schema.oneOf===undefined&&schema.anyOf===undefined)return result;\n  const stack = [...visiting, input.schemaPath];");
  if(variant==='template-key-classic'&&file.endsWith('/getTemplateKey.ts'))return bodyTransform(source,file,'getTemplateKey',()=>\x60{
    const tuples=[];
    for(let inputIndex=0;inputIndex<inputs.length;inputIndex++){
      const input=inputs[inputIndex],schema=readSchemaObject(input.schema);
      const location=typeof schema.$ref==='string'&&Object.keys(schema).length===1?resolveReference(context,schema.$ref,input.schemaPath).schemaPath:input.schemaPath;
      const gates=[];
      for(let gateIndex=0;gateIndex<input.gates.length;gateIndex++){
        const gate=input.gates[gateIndex],paths=[];
        for(let parentIndex=0;parentIndex<(gate.appliesWhen?.length??0);parentIndex++){const ownerPath=gate.appliesWhen[parentIndex].schemaPath;if(!paths.includes(ownerPath))paths.push(ownerPath);}
        const tag=gate.kind+':'+gate.schemaPath+':'+Boolean(gate.negated)+':'+paths.join(',');if(!gates.includes(tag))gates.push(tag);
      }
      tuples.push([location,input.context,gates]);
    }
    return JSON.stringify(tuples);
  }\x60);
  if(variant==='revision-dense-first'&&file.endsWith('/SchemaNodeRevisionLedger.ts')) {
    const first='previous === EMPTY_REVISION_LEDGER && mask === (SchemaNodeEventType.UpdateValue | SchemaNodeEventType.RequestRefresh)';
    source=once(source,'previous === EMPTY_REVISION_LEDGER ? [] :',"previous === EMPTY_REVISION_LEDGER ? ("+first+" ? [undefined,undefined,1,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,1] : []) :");
    return once(source,'let remaining = mask & KNOWN_BITS;\n    while (remaining) {\n      const bit = remaining & -remaining;\n      const index =','let remaining = '+first+' ? 0 : mask & KNOWN_BITS;\n    while (remaining) {\n      const bit = remaining & -remaining;\n      const index =');
  }
  if(variant==='path-key-once'&&file.endsWith('/buildNodes.ts'))return once(source,'  const boundKey = JSON.stringify([key, hostPaths]);',"  const boundKey = key+'|'+JSON.stringify(hostPaths);");
  if(variant==='node-membership-once'&&file.endsWith('/buildNodes.ts')) {
    const a=source.indexOf('    const ownedDeclarations = [];'),b=source.indexOf('    const node: MutableNode',a);assert(a>=0&&b>a);
    const block=source.slice(a,b);
    const loop=block.slice(block.indexOf('    for (let item'));
    return source.slice(0,a)+"    const direct=group.declarations.length===1&&group.declarations[0].context==='conjunction';\n    const ownedDeclarations=direct?group.declarations:[];const conjunctions=direct?group.declarations:[];\n    if(!direct){\n"+loop+'    }\n'+source.slice(b);
  }
  if((variant==='projected-once'||variant==='projected-first')&&/\/(markWrite|updateOutput|selectChildren)\.ts$/.test(file)) {
    const name=path.basename(file,'.ts');return bodyTransform(source,file,name,original=>'{globalThis.__bound102.projections.delete(context);'+original.slice(1));
  }
  if(variant==='gates-replay'&&file.endsWith('/evaluateGate.ts'))return tapeBody(source,file,'evaluateGate');
  if(variant==='blueprint-replay'&&file.endsWith('/blueprint.ts'))return tapeBody(source,file,'blueprint');
  if(variant==='assembly-replay'&&file.endsWith('/assembleObject.ts'))return tapeBody(source,file,'assembleObject');
  if(variant==='delivery-replay'&&file.endsWith('/commitStaticFirstNode.ts'))return bodyTransform(source,file,'commitStaticFirstNode',original=>\x60{
    const state=globalThis.__bound102,key='delivery',at=state.cursors[key]??0;state.cursors[key]=at+1;const tape=state.tapes[key]??=[];
    if(state.replay){const held=tape[at];if(!held)throw new Error('Delivery tape exhausted');node.pendingDelivery=held.pendingDelivery;node.revisionLedger=held.revisionLedger;node.deliveryInitialized=true;node.pendingRevision=0;return;}
    (()=>\x24{original})();tape[at]={pendingDelivery:node.pendingDelivery,revisionLedger:node.revisionLedger};
  }\x60);
  if(variant==='selection-lazy'&&file.endsWith('/selectChildren.ts')) {
    source=once(source,'      const active: typeof entry.declarations[number][] = [];\n      activeIds = [];','      let active: typeof entry.declarations[number][] | undefined;\n      let ids: number[] | undefined;');
    source=once(source,'        if (admitted) { active.push(declaration); activeIds.push(declaration.id); }','        if (admitted) { (active??=[]).push(declaration);(ids??=[]).push(declaration.id); }');
    source=once(source,'      declarations = active;','      declarations = active??NO_ACTIVE_IDS;activeIds=ids??NO_ACTIVE_IDS;');return source;
  }
  if(variant==='selection-replay'&&file.endsWith('/selectChildren.ts')) {
    const a=source.indexOf('    let threw = false;'),b=source.indexOf('    if (declarations.length === 0)',a);assert(a>=0&&b>a);
    const selected=source.slice(a,b);
    return source.slice(0,a)+\x60
    const state=globalThis.__bound102,selectionKey='selection',at=state.cursors[selectionKey]??0;state.cursors[selectionKey]=at+1;const tape=state.tapes[selectionKey]??=[];
    const held=state.replay?tape[at]:(tape[at]=(()=>{\x24{selected}return {threw,declarations,activeIds};})());
    if(!held)throw new Error('Selection tape exhausted');const {threw,declarations,activeIds}=held;
    \x60+source.slice(b);
  }
  if(variant==='flush-reads-zero'&&file.endsWith('/flushPendingGateReads.ts'))return bodyTransform(source,file,'flushPendingGateReads',()=>'{return;}');
  if(variant==='recalculation-replay'&&file.endsWith('/registerRecalculation.ts'))return bodyTransform(source,file,'registerRecalculation',original=>\x60{
    const state=globalThis.__bound102,key='recalculation',at=state.cursors[key]??0;state.cursors[key]=at+1;const tape=state.tapes[key]??=[];
    if(state.replay){const held=tape[at];if(!held)throw new Error('Recalculation tape exhausted');for(const field of ['dirtyPaths','dependencyOwnerPaths','shapeDirtyPaths'])for(const value of held[field])context[field].add(value);return;}
    (()=>\x24{original})();tape[at]={dirtyPaths:[...context.dirtyPaths],dependencyOwnerPaths:[...context.dependencyOwnerPaths],shapeDirtyPaths:[...context.shapeDirtyPaths]};
  }\x60);
  if(variant==='assembly-first-plain'&&file.endsWith('/assembleObject.ts'))return bodyTransform(source,file,'assembleObject',original=>\x60{
    if(node.local===undefined&&node.extras===undefined){
      const preferred=getStaticChoices(node.schema).propertyKeys;let eligible=preferred.length===children.length;
      for(let i=0;eligible&&i<children.length;i++)if(children[i].name!==preferred[i])eligible=false;
      if(eligible){const result={},names=[];for(let i=0;i<children.length;i++){const child=children[i];if(child.emit!==undefined){names.push(child.name);writeObjectKey(result,child.name,child.emit);}}STABLE_SHAPES.set(node,{children,schema:node.schema,extras:node.extras,names});objectKeyCounts.set(result,names.length);return result;}
    }
    return(()=>\x24{original})();
  }\x60);
  if(variant==='children-once'&&file.endsWith('/populateNodeChildren.ts'))return childEnumerationOnce(source,file);
  if(variant==='projected-once'&&file.endsWith('/readProjectedValue.ts'))return projectionReuse(source,file,false);
  if(variant==='projected-first'&&file.endsWith('/readProjectedValue.ts'))return projectionReuse(source,file,true);
  if(variant==='projected-tokens'&&file.endsWith('/readProjectedValue.ts')) {
    source=once(source,"  for (const encoded of path.slice(1).split('/')) {\n    const name = encoded.replace(/~1/g, '/').replace(/~0/g, '~');", "  let tokens=globalThis.__bound102.strings.get('tokens|'+path);if(!tokens){tokens=path.slice(1).split('/').map(encoded=>encoded.replace(/~1/g,'/').replace(/~0/g,'~'));globalThis.__bound102.strings.set('tokens|'+path,tokens);}\n  for (const name of tokens) {");
    return source;
  }
  if(variant==='freeze-remainder')return inheritedTransform(file,source,'freeze-zero');
  return inheritedTransform(file,source,variant);
}

const [command,...args]=process.argv.slice(2);
const fullTag=[command,...args].join('_').replace(/[^a-zA-Z0-9_-]/g,'_');
const tag=fullTag.length>180?fullTag.slice(0,140)+'-'+createHash('sha256').update(fullTag).digest('hex').slice(0,16):fullTag;
process.once('exit',status=>save(path.join(artifacts,'process-'+tag+'.json'),{HEAD,command,args,status,signal:null,started,ended:new Date().toISOString(),elapsedMs:Date.now()-startedMs,pid:process.pid,driverSha256:createHash('sha256').update(fs.readFileSync(script)).digest('hex')}));
if(command==='--build-worker') {
  const result=await api.buildAsync(args[0]);save(path.join(artifacts,'build-'+args[0]+'.json'),{HEAD,...result});console.log(JSON.stringify(result));
} else if(command==='--build') {
  for(const variant of args)child([script,'--build-worker',variant]);
} else if(command==='--verdict-worker')await verdictPair105(args[0],Number(args[1]));
else if(command==='--verdict')for(const name of fixtures)child(['--expose-gc',script,'--verdict-worker',name,args[0]]);
else if(command==='--count-worker')await counts(args[0],args[1]);
else if(command==='--counts')for(const version of ['head','old'])for(const name of args.length?args:fixtures)child([script,'--count-worker',version,name]);
else if(command==='--cpu-worker')await cpu(args[0],args[1],Number(args[2]));
else if(command==='--cpu') { const run=Number(args[0]??1);for(const version of ['head','old'])for(const name of args.slice(1).length?args.slice(1):fixtures.slice(0,3))child([script,'--cpu-worker',version,name,run]); }
else if(command==='--timer-worker')await timing(args[0],args[1],Number(args[2]),'forced');
else if(command==='--timers') {
  const [variant,run,...names]=args;
  for(const name of names.length?names:fixtures)child(['--expose-gc',script,'--timer-worker',variant,name,run,'forced']);
} else if(command==='--batch') {
  const [run,name,...variants]=args;
  for(const variant of variants)child(['--expose-gc',script,'--timer-worker',variant,name,run,'forced']);
} else if(command==='--matrix') {
  const [run,...variants]=args;
  for(const name of fixtures)for(const variant of variants)child(['--expose-gc',script,'--timer-worker',variant,name,run,'forced']);
} else throw new Error('Use --build, --counts, --cpu, --timers or --batch.');
assert(Date.now()-startedMs<480000);
`;
source = source.replaceAll('\\x60', '`').replaceAll('\\x24', '$');
try { await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')); }
catch(error) { console.error(error.name+': '+error.message); process.exitCode=1; }
