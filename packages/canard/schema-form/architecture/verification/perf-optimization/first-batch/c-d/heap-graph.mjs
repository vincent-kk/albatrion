// Imported by classify-heap.mjs to analyze strong retainers and immediate dominators offline.
// Offline V8 strong-edge dominators and disjoint, retainer-path-based byte attribution.
import fs from 'node:fs';
export class HeapGraph {
  constructor(snapshot) {
    const {meta}=snapshot.snapshot;this.nf=meta.node_fields;this.ef=meta.edge_fields;this.ns=this.nf.length;this.es=this.ef.length;this.nodes=snapshot.nodes;this.edges=snapshot.edges;this.strings=snapshot.strings;this.nt=meta.node_types[0];this.et=meta.edge_types[0];this.n=this.nodes.length/this.ns;
    this.ni=Object.fromEntries(this.nf.map((f,i)=>[f,i]));this.ei=Object.fromEntries(this.ef.map((f,i)=>[f,i]));
    this.start=new Uint32Array(this.n+1);for(let i=0;i<this.n;i++)this.start[i+1]=this.start[i]+this.nodes[i*this.ns+this.ni.edge_count]*this.es;
    this.ephemeronTableEdges=new Uint8Array(this.edges.length/this.es);this.ephemeronTableEdgesSkipped=0;
    // V8 emits both key->value and table->value "part of key" edges. Only the
    // key edge represents retention once the WeakMap is independently reachable.
    for(let i=0;i<this.n;i++)for(let e=this.start[i];e<this.start[i+1];e+=this.es){if(this.edgeType(e)!=='internal')continue;const key=this.edgeName(e).match(/part of key \(.*?@(\d+)\) -> value/);if(key&&Number(key[1])!==this.id(i)){this.ephemeronTableEdges[e/this.es]=1;this.ephemeronTableEdgesSkipped++;}}
  }
  static read(file){return new HeapGraph(JSON.parse(fs.readFileSync(file,'utf8')));}
  type(i){return this.nt[this.nodes[i*this.ns+this.ni.type]];}
  name(i){return this.strings[this.nodes[i*this.ns+this.ni.name]];}
  size(i){return this.nodes[i*this.ns+this.ni.self_size];}
  id(i){return this.nodes[i*this.ns+this.ni.id];}
  edgeType(e){return this.et[this.edges[e+this.ei.type]];}
  edgeName(e){const type=this.edgeType(e),index=this.edges[e+this.ei.name_or_index];return type==='element'||type==='hidden'?String(index):this.strings[index];}
  target(e){return this.edges[e+this.ei.to_node]/this.ns;}
  strong(e){return this.edgeType(e)!=='weak'&&!this.ephemeronTableEdges[e/this.es];}
  anchor(name){const targets=new Set();for(let i=0;i<this.n;i++)for(let e=this.start[i];e<this.start[i+1];e+=this.es)if(this.edgeType(e)==='property'&&this.edgeName(e)===name)targets.add(this.target(e));if(targets.size!==1)throw new Error('Expected unique global anchor '+name+', got '+targets.size);return [...targets][0];}
  dominators() {
    const n=this.n,seen=new Uint8Array(n),cursor=new Uint32Array(this.start),stack=new Uint32Array(n),post=[];let depth=0;stack[0]=0;seen[0]=1;
    while(depth>=0){const v=stack[depth];let pushed=false;while(cursor[v]<this.start[v+1]){const e=cursor[v];cursor[v]+=this.es;if(!this.strong(e))continue;const w=this.target(e);if(!seen[w]){seen[w]=1;stack[++depth]=w;pushed=true;break;}}if(!pushed){post.push(v);depth--;}}
    const rpo=post.reverse(),rank=new Int32Array(n).fill(-1);rpo.forEach((v,i)=>rank[v]=i);
    const counts=new Uint32Array(n);let total=0;
    for(const v of rpo)for(let e=this.start[v];e<this.start[v+1];e+=this.es)if(this.strong(e)){counts[this.target(e)]++;total++;}
    const ps=new Uint32Array(n+1);for(let i=0;i<n;i++)ps[i+1]=ps[i]+counts[i];
    const fill=new Uint32Array(ps),pred=new Uint32Array(total);
    for(const v of rpo)for(let e=this.start[v];e<this.start[v+1];e+=this.es)if(this.strong(e)){const w=this.target(e);pred[fill[w]++]=v;}
    const idom=new Int32Array(n).fill(-1);idom[0]=0;
    const intersect=(a,b)=>{while(a!==b){while(rank[a]>rank[b])a=idom[a];while(rank[b]>rank[a])b=idom[b];}return a;};
    let changed=true,iterations=0;
    while(changed){changed=false;iterations++;if(iterations>1000)throw new Error('Dominator convergence failure');for(let k=1;k<rpo.length;k++){const v=rpo[k];let parent=-1;for(let i=ps[v];i<ps[v+1];i++){const p=pred[i];if(idom[p]!==-1)parent=parent===-1?p:intersect(parent,p);}if(parent!==-1&&idom[v]!==parent){idom[v]=parent;changed=true;}}}
    const retained=new Float64Array(n);for(let i=0;i<n;i++)retained[i]=this.size(i);for(let i=rpo.length-1;i>0;i--){const v=rpo[i];retained[idom[v]]+=retained[v];}
    this.idom=idom;this.rpo=rpo;this.retained=retained;return {reachable:rpo.length,strongEdges:total,iterations,ephemeronTableEdgesSkipped:this.ephemeronTableEdgesSkipped};
  }
  ownedBy(root){const owned=new Uint8Array(this.n);owned[root]=1;for(const v of this.rpo)if(v!==root&&v!==0)owned[v]=owned[this.idom[v]];return owned;}
  paths(root,owned){const parent=new Int32Array(this.n).fill(-1),parentEdge=new Int32Array(this.n).fill(-1),queue=[root];parent[root]=root;for(let i=0;i<queue.length;i++){const v=queue[i];for(let e=this.start[v];e<this.start[v+1];e+=this.es){if(!this.strong(e))continue;const w=this.target(e);if(!owned[w]||parent[w]!==-1)continue;parent[w]=v;parentEdge[w]=e;queue.push(w);}}return {parent,parentEdge};}
}
const isNode=(g,i,engine)=>g.type(i)==='object'&&(engine==='current'?g.name(i)==='FieldNode':/^(Object|Number|String|Boolean|Array|Null|Virtual)Node$/.test(g.name(i)));
const mapName=/^(Map|Set|WeakMap|WeakSet|PathKeyedMap|PathKeyedSet|PathStoreIndex)$/;
const valueFields={storedRaw:'raw',raw:'raw',local:'local',emit:'emit',loadSnapshot:'load snapshot',storedUndeclaredValues:'undeclaredValues',undeclaredValues:'undeclaredValues',__value__:'local',__draft__:'legacy draft',__initialValue__:'load snapshot',__restoreValue__:'load snapshot'};
export function classifyGraph(g,engine,nodes) {
  const graph=g.dominators(),root=g.anchor('__CD_TREE'),owned=g.ownedBy(root),seeds=new Map(),valueLabels=new Map();let recordCount=0;
  function seed(i,category,priority){const old=seeds.get(i);if(owned[i]&&(!old||old.priority<priority))seeds.set(i,{category,priority});}
  for(const i of g.rpo){if(!owned[i])continue;
    if(g.type(i)==='closure')seed(i,'closures',80);
    if(g.type(i)==='object'&&mapName.test(g.name(i)))seed(i,'runtime maps/sets',70);
    if(engine==='legacy'&&g.type(i)==='object'&&/Manager$|Strategy$/.test(g.name(i)))seed(i,'legacy managers/strategies',30);
    const node=isNode(g,i,engine);if(node){seed(i,'node record fields',100);recordCount++;}
    for(let e=g.start[i];e<g.start[i+1];e+=g.es){if(!g.strong(e))continue;const key=g.edgeName(e),target=g.target(e);if(!owned[target])continue;
      if(node&&g.edgeType(e)==='internal'&&key==='properties')seed(target,'node record fields',100);
      if(g.edgeType(e)!=='property')continue;
      if((node&&key==='interactionState')||(engine==='legacy'&&node&&key==='__state__'))seed(target,'interaction state objects',90);
      if(key==='structure'||key==='storedChildren'||(engine==='legacy'&&['__children__','__childNodeMap__','__propertyChildren__','__subnodes__'].includes(key)))seed(target,'structure containers',60);
      if(node&&key==='schema')seed(target,'effective schema per occurrence',55);
      if(key==='runtime'&&node)seed(target,'other runtime',20);
      if(/^(revisionLedger|delivery|pendingDelivery|pendingRevision|pendingNonSettleDelivery|queued|deliveries|revisionNodes)/.test(key)||(engine==='legacy'&&['__eventManager__','__ledger__'].includes(key)))seed(target,'event/revision records',65);
      if(valueFields[key]&&(node||key==='loadSnapshot'||engine==='legacy')){const labels=valueLabels.get(target)??new Set();labels.add(valueFields[key]);valueLabels.set(target,labels);}
    }
  }
  for(const [i,labels]of valueLabels)seed(i,'value: '+[...labels].sort().join(' + '),85);
  const {parent,parentEdge}=g.paths(root,owned),categories=new Array(g.n),pathCategory=new Array(g.n);
  // The shortest strong retainer path is a fallback when a value has several dominators.
  const queue=[root];pathCategory[root]=seeds.get(root)?.category??'other tree-owned';
  for(let k=0;k<queue.length;k++){const v=queue[k];for(let e=g.start[v];e<g.start[v+1];e+=g.es){const w=g.target(e);if(parent[w]===v&&parentEdge[w]===e){const inherited=pathCategory[v]==='node record fields'?'other tree-owned':pathCategory[v];pathCategory[w]=seeds.get(w)?.category??inherited;queue.push(w);}}}
  const buckets={};
  const retainerPath=i=>{const parts=[];let current=i;for(let k=0;k<12&&current!==root;k++){const e=parentEdge[current];if(e<0)break;parts.push(g.edgeName(e));current=parent[current];}return '__CD_TREE'+(current!==root?'.…':'')+'.'+parts.reverse().join('.');};
  for(const i of g.rpo){if(!owned[i])continue;const dominating=g.idom[i];const inherited=i===root?'other tree-owned':categories[dominating];const category=seeds.get(i)?.category??(inherited&&inherited!=='node record fields'?inherited:pathCategory[i])??'other tree-owned';categories[i]=category;
    const b=buckets[category]??={bytes:0,objects:0,byType:{},examples:[]};b.bytes+=g.size(i);b.objects++;const type=g.type(i)+':'+g.name(i),t=b.byType[type]??={bytes:0,objects:0};t.bytes+=g.size(i);t.objects++;
    if(b.examples.length<4&&g.type(i)!=='hidden')b.examples.push({heapId:g.id(i),name:g.name(i),type:g.type(i),shallowBytes:g.size(i),retainedBytes:g.retained[i],path:retainerPath(i)});
  }
  const total=Object.values(buckets).reduce((sum,b)=>sum+b.bytes,0);
  if(total!==g.retained[root])throw new Error('Category bytes do not reconcile');
  if(recordCount!==nodes)throw new Error(`Only ${recordCount}/${nodes} node records dominated by tree anchor`);
  for(const b of Object.values(buckets)){b.bytesPerNode=b.bytes/nodes;b.byType=Object.fromEntries(Object.entries(b.byType).sort((a,b)=>b[1].bytes-a[1].bytes).slice(0,12));}
  return {method:'Immediate dominators excluding weak and WeakMap table-to-value ephemeron edges, retaining key-to-value edges; disjoint shallow-byte sums classified by field seeds, dominators and shortest strong retainer paths. No sums of overlapping retained subtrees.',graph,treeHeapId:g.id(root),treeRetainedBytes:total,bytesPerNode:total/nodes,recordCount,categories:buckets,recordShallowBytes:[...g.rpo].filter(i=>owned[i]&&isNode(g,i,engine)).reduce((sum,i)=>sum+g.size(i),0),limitations:['Shared module/prototype/code objects and the independently anchored blueprint are outside tree retained size.','Key-to-value ephemeron edges assume their WeakMaps are independently reachable, as the module caches are in this fixture; this is an explicitly stated snapshot graph model.','A field containing a Smi/undefined has no separate heap allocation; its slot is charged to the node record. Aliased value containers are charged once.']};
}
export function blueprintBytes(file){const g=HeapGraph.read(file);const graph=g.dominators(),root=g.anchor('__CD_BLUEPRINT');return {retainedBytes:g.retained[root],heapId:g.id(root),graph};}
export function verifyDominators(){
  // Synthetic diamond plus a cycle: 0 -> 1 -> {2,3} -> 4; 4 -> 2; 0 -> 5 -> 3.
  const adjacency=[[1,5],[2,3],[4],[4],[2],[3]],nodes=[],edges=[];for(let i=0;i<adjacency.length;i++){nodes.push(0,0,i+1,10,adjacency[i].length);for(const to of adjacency[i])edges.push(0,0,to*5);}
  const g=new HeapGraph({snapshot:{meta:{node_fields:['type','name','id','self_size','edge_count'],edge_fields:['type','name_or_index','to_node'],node_types:[['object']],edge_types:[['property']]}},nodes,edges,strings:['x']});g.dominators();const expected=[0,0,0,0,0,0];if(g.idom.some((v,i)=>v!==expected[i]))throw new Error('Dominator diamond/cycle check failed: '+[...g.idom]);
  const chain=new HeapGraph({snapshot:{meta:{node_fields:['type','name','id','self_size','edge_count'],edge_fields:['type','name_or_index','to_node'],node_types:[['object']],edge_types:[['property']]}},nodes:[0,0,1,10,1,0,0,2,20,1,0,0,3,30,0],edges:[0,0,5,0,0,10],strings:['x']});chain.dominators();if(chain.idom[2]!==1||chain.retained[1]!==50)throw new Error('Dominator chain retained check failed');return 'pass: diamond, cycle, chain and retained-byte sum';
}
