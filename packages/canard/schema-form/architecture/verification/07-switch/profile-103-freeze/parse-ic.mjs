// CLI parser for locally collected V8 CSV; map counts are lower bounds after a mega transition.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const artifacts=path.dirname(fileURLToPath(import.meta.url)),directory=path.dirname(artifacts);
const repo=path.resolve(directory,'../../../../../..');
const require=createRequire(path.join(repo,'package.json'));
const {TraceMap,originalPositionFor}=require('@jridgewell/trace-mapping');
const ts=require('typescript');
const bundles='/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const scratch=path.join(bundles,'profile103');
const [variant,name]=process.argv.slice(2);
const bundle=path.join(bundles,`shape103-${variant}.cjs`);
const sourceMap=new TraceMap(JSON.parse(fs.readFileSync(bundle+'.map','utf8')));
const sources=JSON.parse(fs.readFileSync(path.join(scratch,'sources-'+variant+'.json'),'utf8'));
const sourceTrees=new Map();
/** Inlined IC PCs belong to the caller; the mapped source selects the actual access function. */
function owner(file,line,column,fallback){
  let record=sourceTrees.get(file);
  if(!record){
    if(!sources[file]&&!fs.existsSync(path.join(repo,file)))return fallback;
    const content=sources[file]??fs.readFileSync(path.join(repo,file),'utf8');
    const tree=ts.createSourceFile(file,content,ts.ScriptTarget.Latest,true),functions=[];
    const visit=(node,outer)=>{
      const explicit=node.name?.getText(tree)??((ts.isArrowFunction(node)||ts.isFunctionExpression(node))?node.parent?.name?.getText(tree):undefined);
      const fn=node.body&&explicit?explicit:outer;
      if(node.body&&explicit)functions.push({start:node.getStart(tree),end:node.end,name:explicit});
      ts.forEachChild(node,child=>visit(child,fn));
    };visit(tree,undefined);record={tree,functions};sourceTrees.set(file,record);
  }
  const offset=record.tree.getPositionOfLineAndCharacter(line-1,column);
  const matches=record.functions.filter(fn=>fn.start<=offset&&fn.end>=offset).sort((a,b)=>(a.end-a.start)-(b.end-b.start));
  return matches[0]?.name??fallback;
}
const hot=['buildNodes','populateNodeChildren','collectDeclarations','selectChildren','computeNode','markWrite','assembleObject','readProjectedValue',
  'commit','commitRecord','commitNode','commitStaticFirstNode','loadStaticFirstTree','load','settle','visitShape','validateChildTargets',
  'getTemplateKey','mergeSingleStaticContribution','freezeBlueprintValues','freezeBlueprintDeclarations','freezeEffectiveSchema'];
const isHot=fn=>hot.includes(fn)||/commit/i.test(fn);
const codes=[],events=[],wanted=new Set(),maps=new Map();
const log=path.join(scratch,`ic-${variant}-${name}.log`);

/** Iterate lines without retaining startup script sources or unrelated maps. */
async function lines(callback) {
  const input=readline.createInterface({input:fs.createReadStream(log),crlfDelay:Infinity});
  for await(const line of input)callback(line);
}
await lines(line=>{
  if(line.startsWith('code-creation,')&&line.includes(`shape103-${variant}.cjs:`)){
    const p=line.split(',');
    const fn=p[6].slice(0,p[6].indexOf(' /private/'));
    const start=parseInt(p[4],16);
    codes.push({start,end:start+Number(p[5]),fn,time:Number(p[3]),tier:p[2],label:p[6]});
  }else if(/^(LoadIC|KeyedLoadIC|StoreIC|KeyedStoreIC|DefineNamedOwnIC|StoreInArrayLiteralIC),/.test(line)){
    const p=line.split(',');
    events.push({type:p[0],pc:parseInt(p[1],16),time:Number(p[2]),line:Number(p[3]),column:Number(p[4]),from:p[5],to:p[6],map:p[7],key:p[8],modifier:p[9],reason:p.slice(10).join(',')});
  }
});
codes.sort((a,b)=>a.start-b.start);
const sites=new Map(),unmatched={total:0,bundle:0};
for(const event of events){
  let lo=0,hi=codes.length;
  while(lo<hi){const middle=(lo+hi)>>1;if(codes[middle].start<=event.pc)lo=middle+1;else hi=middle;}
  const code=codes[lo-1];
  if(!code||event.pc>=code.end){unmatched.total++;continue;}
  unmatched.bundle++;
  const original=originalPositionFor(sourceMap,{line:event.line,column:Math.max(0,event.column-1)});
  if(!original.source)continue;
  const file=path.relative(repo,path.resolve(bundles,original.source));
  const fn=owner(file,original.line,original.column,code.fn);
  const dynamic=event.type==='KeyedLoadIC'||event.type==='KeyedStoreIC'||event.type==='StoreInArrayLiteralIC';
  const key=dynamic?'<dynamic>':event.key;
  const id=`${fn}|${file}:${original.line}:${original.column}|${event.type}|${key}`;
  let site=sites.get(id);
  if(!site)sites.set(id,site={id,function:fn,file,line:original.line,column:original.column,type:event.type,key,
    generatedLine:event.line,generatedColumn:event.column,maps:new Set(),keys:new Set(),transitions:[],eventCount:0,firstUs:event.time,lastUs:event.time});
  if(event.map!=='0x000000000000'){site.maps.add(event.map);wanted.add(event.map);}
  site.keys.add(event.key);site.eventCount++;
  if(!site.transitions.some(row=>row.from===event.from&&row.to===event.to&&row.map===event.map&&row.key===event.key))
    site.transitions.push({timeUs:event.time,from:event.from,to:event.to,map:event.map,key:event.key,modifier:event.modifier,reason:event.reason});
  site.lastUs=event.time;
}

/** Preserve descriptor distinctions relevant to freeze status and field representations. */
function mapInfo(address,detail){
  const text=detail.replaceAll('\\n','\n').replaceAll('\\x2C',',');
  const properties=[...text.matchAll(/\[\d+\]:.*?#([^\n]*?) \(([^\n]*?)\) @ ([^\n]*)/g)].map(match=>({key:match[1],descriptor:match[2],fieldType:match[3]}));
  const type=text.match(/ - type: (.+)/)?.[1],elementsKind=text.match(/ - elements kind: (.+)/)?.[1];
  const nonExtensible=/ - non-extensible/.test(text)||/FROZEN|SEALED|NONEXTENSIBLE/.test(elementsKind??'');
  const instanceSize=Number(text.match(/ - instance size: (\d+)/)?.[1]);
  const signature=JSON.stringify({type,elementsKind,instanceSize,nonExtensible,properties:properties.map(p=>[p.key,p.descriptor,p.fieldType.replace(/0x[0-9a-f]+/g,'MAP')])});
  return {address,type,elementsKind,instanceSize,nonExtensible,properties,signature};
}
await lines(line=>{
  if(line.startsWith('map-details,')){
    const a=line.indexOf(',',12),address=line.slice(line.indexOf(',',12)+1,line.indexOf(',',a+1));
    // The fields are map-details,timestamp,address,details.
    const p=line.split(',',4),key=p[2];
    if(wanted.has(key))maps.set(key,mapInfo(key,line.slice(line.indexOf(',',line.indexOf(',',line.indexOf(',')+1)+1)+1)));
  }
});
const rows=[...sites.values()].map(site=>{
  const transitions=site.transitions;
  const addresses=[...site.maps];
  const details=addresses.map(address=>maps.get(address)??{address,missing:true});
  const states=transitions.map(row=>row.to);
  const state=states.includes('N')?'mega':states.includes('P')?'poly':states.includes('1')?'mono':'other';
  return {...site,maps:addresses,keys:[...site.keys],mapCount:addresses.length,state,mapCountIsLowerBound:state==='mega',
    signatures:[...new Set(details.map(row=>row.signature).filter(Boolean))],
    elementsKinds:[...new Set(details.map(row=>row.elementsKind).filter(Boolean))],
    freezeMix:details.some(row=>row.nonExtensible===true)&&details.some(row=>row.nonExtensible===false)};
});
let phase='startup';const deopts=[];
for(const line of fs.readFileSync(path.join(scratch,`deopt-${variant}-${name}.log`),'utf8').split('\n')){
  if(line.startsWith('PHASE '))phase=line.split(' ')[1];
  if(line.includes('bailout')){
    const reason=line.match(/reason: (.*)\): begin\./)?.[1],fn=line.match(/<JSFunction ([^ <]*) /)?.[1];
    deopts.push({phase,function:fn,reason,product:line.includes(`shape103-${variant}.cjs`),bytecodeOffset:Number(line.match(/bytecode offset (\d+)/)?.[1]),trace:line});
  }
}
const functions=Object.fromEntries([...new Set([...hot,...rows.filter(row=>isHot(row.function)).map(row=>row.function)])].map(fn=>{
  const subset=rows.filter(row=>row.function===fn);
  return [fn,{loggedSites:subset.length,mono:subset.filter(row=>row.state==='mono').length,poly:subset.filter(row=>row.state==='poly').length,
    mega:subset.filter(row=>row.state==='mega').length,freezeMixSites:subset.filter(row=>row.freezeMix).length,
    deopts:deopts.filter(row=>row.product&&row.function===fn),sites:subset}];
}));
const output={variant,name,hotFunctions:hot,allBundleSites:rows.length,unmatched,functions,
  otherFreezeMixSites:rows.filter(row=>row.freezeMix&&!isHot(row.function)),maps:Object.fromEntries(maps),deopts,
  limitations:['IC records log transitions, not access frequency. No transition is not proof of non-execution.',
    'After N, logged map count is a lower bound. Maps are process-local; compare descriptor signatures, not addresses.',
    'Frozen/nonfrozen split can exist during construction even in HEAD. Phase and source receiver matter.']};
const text=JSON.stringify(output,null,2)+'\n';assert(Buffer.byteLength(text)<=5_000_000);
fs.writeFileSync(path.join(artifacts,`ic-${variant}-${name}.json`),text);
console.log(JSON.stringify({variant,name,bytes:Buffer.byteLength(text),sites:rows.length,hot:Object.fromEntries(Object.entries(functions).filter(([,v])=>v.loggedSites).map(([fn,v])=>[fn,{sites:v.loggedSites,mono:v.mono,poly:v.poly,mega:v.mega,mixed:v.freezeMixSites}])),productDeopts:deopts.filter(row=>row.product).map(row=>[row.phase,row.function,row.reason])}));
