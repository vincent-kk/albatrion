// Invoked by node run-d.mjs; this file is verification tooling.
// Node and Bun parent runner; each engine/size gets a fresh GC-enabled child.
import {spawnSync} from 'node:child_process';
import {SC,NODE,settings,option,reverse,runtime,save,json} from './config.mjs';
const config=settings(false),sizes=option('sizes',config.smoke?'32,128':'1000,8000').split(',').map(Number),selected=option('engine','both');
if(sizes.length!==2||sizes.some(n=>!Number.isInteger(n)||n<1)||sizes[0]===sizes[1])throw new Error('D requires two distinct positive sizes');
const bun=typeof Bun!=='undefined',rows=[];
function child(executable,args){const r=spawnSync(executable,args,{cwd:SC,encoding:'utf8',env:{...process.env,NODE_ENV:'production'},maxBuffer:32*1024*1024});if(r.status!==0)throw new Error(args[0]+': '+r.stderr);return JSON.parse(r.stdout);}
for(const engine of reverse(selected==='both'?['current','legacy']:[selected]))for(const count of reverse(sizes)){
  const prefix=option('prefix','out/D')+'-'+runtime().name+'-'+engine+'-'+count;
  const worker=child(process.execPath,[...(!bun?['--expose-gc']:[]),'d-worker.mjs','--engine='+engine,'--count='+count,'--prefix='+prefix,...(config.smoke?['--smoke']:[])]);
  let classification=null;
  if(!bun)classification=child(NODE,['--expose-gc','--max-old-space-size=8192','classify-heap.mjs','--snapshot='+worker.snapshot,'--blueprint-snapshot='+worker.blueprintSnapshot,'--engine='+engine,'--nodes='+worker.nodes,...(config.smoke?['--smoke']:[])]);
  rows.push({engine,count,nodes:worker.nodes,worker,classification});
}
const slopes=[];
for(const engine of selected==='both'?['current','legacy']:[selected]){
  const [a,b]=rows.filter(r=>r.engine===engine).sort((a,b)=>a.nodes-b.nodes),dn=b.nodes-a.nodes;
  if(!bun){const names=[...new Set([a,b].flatMap(r=>Object.keys(r.classification.categories)))],treeSlope=(b.classification.treeRetainedBytes-a.classification.treeRetainedBytes)/dn,blueprintSlope=(b.classification.blueprint.retainedBytes-a.classification.blueprint.retainedBytes)/dn;slopes.push({engine,deltaNodes:dn,treeBytesPerNode:treeSlope,treeFixedBytes:a.classification.treeRetainedBytes-treeSlope*a.nodes,blueprintBytesPerSchemaNode:blueprintSlope,blueprintFixedBytes:a.classification.blueprint.retainedBytes-blueprintSlope*a.nodes,categories:Object.fromEntries(names.map(name=>[name,((b.classification.categories[name]?.bytes??0)-(a.classification.categories[name]?.bytes??0))/dn]))});}
  else {
    const net=(r,key,type)=>{const t=r.worker.phases.tree.jsc[key],p=r.worker.phases.blueprint.jsc[key];return t&&p?(t[type]??0)-(p[type]??0):null;};
    const counts=[a,b].flatMap(r=>Object.values(r.worker.phases).flatMap(p=>Object.keys(p.jsc.objectTypeCounts??{})));
    const types=[...new Set(counts)].sort();const sizeKey=['objectTypeSizes','objectTypeBytes'].find(k=>a.worker.phases.tree.jsc[k]&&b.worker.phases.tree.jsc[k]);
    const blueprintNet=(r,key,type)=>(r.worker.phases.blueprint.jsc[key]?.[type]??0)-(r.worker.phases.baseline.jsc[key]?.[type]??0);
    slopes.push({engine,deltaNodes:dn,types:Object.fromEntries(types.map(type=>[type,{countSlope:((net(b,'objectTypeCounts',type)??0)-(net(a,'objectTypeCounts',type)??0))/dn,byteSlope:sizeKey?((net(b,sizeKey,type)??0)-(net(a,sizeKey,type)??0))/dn:null}])),blueprintTypes:Object.fromEntries(types.map(type=>[type,{countSlope:(blueprintNet(b,'objectTypeCounts',type)-blueprintNet(a,'objectTypeCounts',type))/dn,byteSlope:sizeKey?(blueprintNet(b,sizeKey,type)-blueprintNet(a,sizeKey,type))/dn:null}])),heapSizeSlope:((b.worker.phases.tree.jsc.heapSize-b.worker.phases.blueprint.jsc.heapSize)-(a.worker.phases.tree.jsc.heapSize-a.worker.phases.blueprint.jsc.heapSize))/dn,blueprintHeapSizeSlope:((b.worker.phases.blueprint.jsc.heapSize-b.worker.phases.baseline.jsc.heapSize)-(a.worker.phases.blueprint.jsc.heapSize-a.worker.phases.baseline.jsc.heapSize))/dn,sizeKey:sizeKey??null,limitations:'heapStats has no dominator/retainer paths. Per-type sizes are reported only if the runtime exposes them; otherwise byte cells are empty, never estimated from counts.'});
  }
}
console.log(json({kind:'D-heap',runtime:runtime(),nodeEnv:process.env.NODE_ENV,config,sizes,rows,slopes,bunNotRun:!bun,referenceNote:'Legacy shares its authored schema but exposes no blueprint API. Unmappable current-only categories stay empty in the table with reasons.'}));
