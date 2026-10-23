// Invoked by run-d.mjs in a fresh GC-enabled Node or Bun child to collect D observations.
// Child-only B2 fixture: no observers/subscriptions or per-node classification tags survive GC.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {option,outputPath,save,runtime,identity,json} from './config.mjs';
const engine=option('engine','current'),count=Number(option('count',process.argv.includes('--smoke')?32:1000)),prefix=option('prefix',`out/D-${engine}-${count}`);
if(!['current','legacy'].includes(engine)||!Number.isInteger(count)||count<1)throw new Error('Invalid D fixture');
const M=await import(pathToFileURL(outputPath(engine+'-baseline.mjs')).href);
const bun=typeof Bun!=='undefined',jsc=bun?await import('bun:jsc'):undefined,v8=bun?undefined:await import('node:v8');
const drain=async()=>{for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));};
function collect(){if(bun)Bun.gc(true);else {if(!globalThis.gc)throw new Error('Use Node --expose-gc');globalThis.gc();globalThis.gc();}}
function flat(){return {schema:{type:'object',properties:Object.fromEntries(Array.from({length:count},(_,i)=>['field_'+i,{type:'number'}]))},value:Object.fromEntries(Array.from({length:count},(_,i)=>['field_'+i,i]))};}
function captureStats(phase){collect();const data={phase,runtime:runtime(),heapUsed:process.memoryUsage().heapUsed,...(bun?{jsc:jsc.heapStats()}:{heapStatistics:v8.getHeapStatistics()})};save(prefix+'-'+phase+'-stats.json',JSON.stringify(data));}
function buildBlueprint(){const {schema}=flat();globalThis.__CD_BLUEPRINT=engine==='current'?M.blueprint(schema):schema;}
function mount(){const {value}=flat();if(engine==='current'){const root=M.fieldNodeFactory(globalThis.__CD_BLUEPRINT,{diagnostics:{status:'stable'},loadSnapshot:undefined,latentRaw:new M.PathKeyedMap('pair'),misfitPaths:new M.PathKeyedSet(),inactiveValuesMemo:new M.PathKeyedMap('path')});M.loadFieldNodeAtMount(root,value,M.SetValueOption.Overwrite);M.flushQueuedEvents(root);globalThis.__CD_TREE=root;}else globalThis.__CD_TREE=M.nodeFromJSONSchema({jsonSchema:globalThis.__CD_BLUEPRINT,defaultValue:value,onChange:()=>{}});}
function fixtureCounts(){
  const root=globalThis.__CD_TREE,stack=[root],nodes=[],states=new Set(),emptyStates=new Set(),structures=new Set(),emptyStructures={plain:0,nullPrototype:0,other:0},structurePrototypes={plain:0,nullPrototype:0,other:0},behaviors=new Set();let stateReferences=0,nullStructureSlots=0;
  while(stack.length){const n=stack.pop();nodes.push(n);const state=engine==='current'?n.interactionState:n.state;if(state&&typeof state==='object'){states.add(state);stateReferences++;if(Reflect.ownKeys(state).length===0)emptyStates.add(state);}if(n.behavior)behaviors.add(n.behavior);const structure=engine==='current'?n.structure:n.__strategy__?.__childNodeMap__;if(structure==null)nullStructureSlots++;if(structure&&typeof structure==='object'&&!structures.has(structure)){structures.add(structure);const prototype=Object.getPrototypeOf(structure),key=prototype===null?'nullPrototype':prototype===Object.prototype?'plain':'other';structurePrototypes[key]++;const empty=structure instanceof Map||structure instanceof Set?structure.size===0:Reflect.ownKeys(structure).length===0;if(empty)emptyStructures[key]++;}for(const c of n.children??[])stack.push(c.node??c);}
  if(nodes.length!==count+1)throw new Error(`D node count ${nodes.length}, expected ${count+1}`);
  if(Object.keys(root.value).length!==count||root.find('/field_'+(count-1))?.value!==count-1)throw new Error('D values not settled');
  if(engine==='current'&&((root.runtime.deliveries?.size??0)||(root.runtime.queuedNonSettleEvents?.size??0)))throw new Error('D delivery queues not drained');
  const recordKeys=Reflect.ownKeys(root);
  const rootLayout=JSON.stringify(recordKeys.map(String));
  return {nodes:nodes.length,interactionStateReferences:stateReferences,interactionStateObjects:states.size,identicalEmptyStateObjects:emptyStates.size,nonemptyStateObjects:states.size-emptyStates.size,structureContainers:structures.size,structurePrototypes,emptyStructures,nullStructureSlots,sharedBehaviorRows:engine==='current'?behaviors.size:null,recordOwnFieldCount:recordKeys.length,recordOwnFields:recordKeys.map(String),identicalOwnFieldOrder:nodes.every(n=>JSON.stringify(Reflect.ownKeys(n).map(String))===rootLayout),nodePrototypeCount:new Set(nodes.map(n=>Object.getPrototypeOf(n))).size,ownFunctionFieldReferences:nodes.reduce((sum,n)=>sum+Object.values(n).filter(v=>typeof v==='function').length,0)};
}
await drain();captureStats('baseline');buildBlueprint();await drain();captureStats('blueprint');
let blueprintSnapshot=null,snapshot=null;
if(!bun){blueprintSnapshot=outputPath(prefix+'-blueprint.heapsnapshot');v8.writeHeapSnapshot(blueprintSnapshot);}
mount();await drain();const counts=fixtureCounts();await drain();captureStats('tree');
if(!bun){snapshot=outputPath(prefix+'-tree.heapsnapshot');v8.writeHeapSnapshot(snapshot);}
const phases=Object.fromEntries(['baseline','blueprint','tree'].map(phase=>[phase,JSON.parse(fs.readFileSync(outputPath(prefix+'-'+phase+'-stats.json'),'utf8'))]));
console.log(json({kind:'D-worker',runtime:runtime(),engine,count,...counts,bundle:identity(engine+'-baseline.mjs'),blueprintSnapshot,snapshot,phases,blueprintNote:engine==='legacy'?'Legacy has no shared analysis API; authored schema is counted separately. Per-node schema/manager objects remain tree-owned.':'One blueprint built before mounting; held independently from the tree.',method:bun?'bun:jsc heapStats only; no dominator information':'V8 heap snapshots; global tree and blueprint anchors; offline dominators',smoke:process.argv.includes('--smoke')}));
