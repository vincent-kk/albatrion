// Imported by run-c.mjs, run-c-instrumented.mjs and run-c-differential.mjs for C measurement fixtures.
// Shared C fixtures; setup, drains, observations and correctness checks are outside timed writes.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { outputPath, settings, median, reverse, runtime, identity, sha, json } from './config.mjs';
export const drain = async () => { for(let i=0;i<6;i++) await new Promise(resolve=>setImmediate(resolve)); };
export const allNodes = root => { const list=[], stack=[root]; while(stack.length){ const node=stack.pop();list.push(node);stack.push(...(node.children??[]).map(child=>child.node??child).reverse()); } return list; };
export async function load(variant='baseline', instrumented=false) { const bundle='current-'+variant+(instrumented?'-instrumented':'')+'.mjs';return {M:await import(pathToFileURL(outputPath(bundle)).href),...identity(bundle),variant}; }
export function scenes(smoke=false) {
  const sizes = [{F:1,C:16},{F:4,C:16},{F:16,C:16},{F:64,C:16},{F:4,C:4},{F:4,C:64},{F:4,C:256}];
  return ['plain','latent','items','prefixItems','overlap'].flatMap(kind => sizes.flatMap(({F,C}) => (kind==='overlap' && F===1 ? [] : ['exit','control'].map(op=>({id:`${kind}-F${F}-C${C}-${op}`,kind,F,C,op})))));
}
export function fixture(spec) {
  const {F,C,kind}=spec;
  const number = () => ({type:'number'});
  const child = () => kind==='latent' ? {type:'object',properties:{gate:{type:'boolean'},held:{type:'number',controls:{active:'../gate',unsetOnInactive:false}}}} : number();
  // C includes the always-live control leaf on object hosts; exactly C children
  // are mounted on every host before the measured write.
  const objectChildren=C-1;
  const input = {flag:true,h:kind==='items'||kind==='prefixItems'?Array.from({length:C},(_,i)=>i):Object.fromEntries([['probe',0],...Array.from({length:objectChildren},(_,i)=>['k'+i,kind==='latent'?{gate:true,held:i}:i])])};
  const fragments = Array.from({length:F},(_,i)=>{
    const policyTarget = kind==='items'||kind==='prefixItems' ? './0' : './probe';
    const controls={active:'../flag',unsetOnInactive:policyTarget+((i+(spec.reversePolicy?1:0))%2?' < 0':' >= 0')};
    if(kind==='items') return {controls,items:number()};
    if(kind==='prefixItems') return {controls,prefixItems:Array.from({length:C},number)};
    const properties=Object.fromEntries(Array.from({length:objectChildren},(_,j)=>j).filter(j=>j%F===i%Math.min(F,objectChildren)).map(j=>['k'+j,child()]));
    if(kind==='overlap' && i<2) properties.k0=number();
    return {controls,properties};
  });
  const h={type:Array.isArray(input.h)?'array':'object',allOf:fragments};
  if(!Array.isArray(input.h)) h.properties={probe:number()};
  if(spec.fieldsPolicy!==undefined)h.controls={fields:[{targets:['k0'],controls:{unsetOnInactive:spec.fieldsPolicy}}]};
  if(spec.nodePolicy!==undefined)for(const fragment of fragments)if(fragment.properties?.k0)fragment.properties.k0.controls={unsetOnInactive:spec.nodePolicy};
  // Array controls write an existing item while flag remains true.
  const schema={type:'object',properties:{flag:{type:'boolean'},h}};
  return {schema,input};
}
export function make(M, schema, input, onChange) {
  const root=M.fieldNodeFactory(M.blueprint(schema),{diagnostics:{status:'stable'},loadSnapshot:undefined,latentRaw:new M.PathKeyedMap('pair'),misfitPaths:new M.PathKeyedSet(),inactiveValuesMemo:new M.PathKeyedMap('path'),unsetOnInactive:true,onChange});
  M.mountFieldNode(root,structuredClone(input),M.SetValueOption.Overwrite);
  return root;
}
export async function prepare(engine,spec,observe=false) {
  const {M}=engine,{schema,input}=fixture(spec), deliveries=[];
  const onChange=value=>{if(observe)deliveries.push({kind:'onChange',value:encode(value)});};
  const root=make(M,schema,input,onChange);
  if(root.find('/h').children.length!==spec.C)throw new Error('Host must have exactly C children: '+spec.id);
  await drain();
  // Round-369 steady lane: warm a tiny separate tree, then drain all queued delivery work.
  const warm=make(M,{type:'object',properties:{x:{type:'number'}}},{x:0});
  M.writeFieldNodeInput(warm.find('/x'),1,M.SetValueOption.Overwrite); await drain();
  if(spec.kind==='latent') {
    for(let i=0;i<spec.C;i++) { const gate=root.find('/h/k'+i+'/gate'); if(gate)M.writeFieldNodeInput(gate,false,M.SetValueOption.Overwrite); }
    if(root.runtime.latentRaw.size!==spec.C-1)throw new Error('Latent setup did not retain every descendant: '+spec.id);
    await drain();
  }
  const held=allNodes(root), known=new WeakSet();
  const subscribe=()=>{ for(const node of allNodes(root))if(!known.has(node)){known.add(node);held.push(...(!held.includes(node)?[node]:[]));if(observe)node.subscribe((...args)=>deliveries.push({kind:'event',path:node.path,args:encode(args)}));} };
  subscribe();deliveries.length=0;
  return {root,held,deliveries,subscribe,M};
}
export function encode(value,seen=new Map()) {
  if(value===undefined)return {$undefined:true};
  if(typeof value==='number'&&!Number.isFinite(value))return {$number:String(value)};
  if(typeof value==='function')return {$function:value.name};
  if(!value||typeof value!=='object')return value;
  if(value.blueprintNode&&value.runtime&&typeof value.path==='string')return {$node:value.path,kind:value.blueprintNode.kind,detached:value.detached};
  if(seen.has(value))return {$ref:seen.get(value)}; seen.set(value,seen.size);
  if(value instanceof Map)return {$map:[...value].map(([k,v])=>[encode(k,seen),encode(v,seen)])};
  if(value instanceof Set)return {$set:[...value].map(v=>encode(v,seen))};
  if(Array.isArray(value))return value.map(v=>encode(v,seen));
  return Object.fromEntries(Object.keys(value).sort().map(k=>[k,encode(value[k],seen)]));
}
export function snapshot(f) {
  const {root,held}=f;
  const live=allNodes(root);for(const node of live)if(!held.includes(node))held.push(node);
  return {values:encode(root.value),raw:encode(root.raw),inactiveValues:encode(root.inactiveValues),latent:encode([...root.runtime.latentRaw]),metadata:encode(root.runtime.latentRawMetadata),committedRules:encode(root.runtime.committedRuleValues),declarations:encode(root.runtime.committedDeclarationIds),deliveries:structuredClone(f.deliveries),nodes:held.map(node=>({path:node.path,kind:node.blueprintNode.kind,detached:node.detached,active:node.active,raw:encode(node.raw),local:encode(node.value),emit:encode(node.outputValue),state:encode(node.state),inactive:encode(node.inactiveValues),revision:node.revision(),revisionBits:Array.from({length:17},(_,i)=>node.revision(2**i)),exitPolicy:enginePolicy(node,f.M)}))};
}
function enginePolicy(node,M) {const groups=M.getControlLayers(node,new Map());return {clear:M.readExitLayerPolicy(groups,node.runtime.committedRuleValues,node.runtime.unsetOnInactive===true),groups:encode(groups),pendingDelivery:encode(node.pendingDelivery),pendingRevision:node.pendingRevision,revisionLedger:encode(node.revisionLedger)};}
export function invoke(engine,spec,f) { const node=f.root.find(spec.op==='exit'?'/flag':spec.kind==='items'||spec.kind==='prefixItems'?'/h/0':'/h/probe');if(!node)throw new Error('No write target '+spec.id);return engine.M.writeFieldNodeInput(node,spec.op==='exit'?false:-1,engine.M.SetValueOption.Overwrite); }
export function validate(spec,f) {
  if(f.root.value.flag!==(spec.op==='exit'?false:true))throw new Error('Flag mismatch '+spec.id);
  if(spec.op==='control'&&f.held.some(n=>n.detached))throw new Error('Control exited a node '+spec.id);
  if(spec.op==='exit'&&spec.kind!=='prefixItems'&&f.root.find('/h/'+(spec.kind==='items'?'0':'k0')))throw new Error('Expected child to leave '+spec.id);
  if(spec.op==='exit'&&spec.kind==='overlap'){const expectedKeep=spec.nodePolicy!==undefined?!spec.nodePolicy:spec.fieldsPolicy!==undefined?!spec.fieldsPolicy:true;if(f.root.runtime.latentRaw.has(JSON.stringify(['/h/k0','number']))!==expectedKeep)throw new Error('Overlap policy priority mismatch '+spec.id);}
  if((f.root.runtime.deliveries?.size??0)!==0)throw new Error('Delivery queue did not drain');
}
export async function measure(engine,spec,config) {
  const samples=[],metrics=[];
  for(let i=-config.warmups;i<config.samples;i++) {
    const f=await prepare(engine,spec);engine.M.__cdStart?.();
    const start=performance.now();invoke(engine,spec,f);const elapsed=performance.now()-start;
    const metric=engine.M.__cdStop?.();validate(spec,f);
    if(i>=0){samples.push(elapsed);if(metric)metrics.push(metric);}await drain();
  }
  const names=[...new Set(metrics.flatMap(m=>Object.keys(m)))];
  return {...spec,variant:engine.variant,bundle:engine.bundle,medianMs:median(samples),samplesMs:samples,status:'pass',functions:Object.fromEntries(names.map(name=>[name,{calls:median(metrics.map(m=>m[name]?.calls??0)),inclusiveUs:median(metrics.map(m=>(m[name]?.ms??0)*1000)),byCaller:Object.fromEntries([...new Set(metrics.flatMap(m=>Object.keys(m[name]?.byCaller??{})))].map(caller=>[caller,{calls:median(metrics.map(m=>m[name]?.byCaller[caller]?.calls??0)),inclusiveUs:median(metrics.map(m=>(m[name]?.byCaller[caller]?.ms??0)*1000))}]))}]))};
}
export async function runTiming(instrumented=false) {const config=settings(instrumented),rows=[],bundles=[],skipped=[];for(const variant of reverse(['baseline','direct'])){if(variant==='direct'&&!fs.existsSync(outputPath('current-direct'+(instrumented?'-instrumented':'')+'.mjs'))){const reason='SKIP direct ownership lane: counterfactual copy is intentionally excluded.';console.error(reason);skipped.push(reason);continue;}const engine=await load(variant,instrumented);bundles.push(identity(engine.bundle));for(const spec of reverse(scenes(config.smoke)))rows.push(await measure(engine,spec,config));}console.log(json({kind:instrumented?'C-instrumentation':'C-timing',runtime:runtime(),nodeEnv:process.env.NODE_ENV??null,config,lane:'steady',completion:'current call return; immediate assertions; deliveries drained',bundles,skipped,rows}));}
export { isDeepStrictEqual, sha, json };
