// CLI measurement entry; patches exist only in esbuild's memory, and services close by EOF.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { performance, PerformanceObserver } from 'node:perf_hooks';
import inspector from 'node:inspector';

const script = fileURLToPath(import.meta.url), artifacts = path.dirname(script);
const directory = path.dirname(artifacts), pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const scratch = path.join(bundles, 'profile103');
const require = createRequire(path.join(repo, 'package.json')), ts = require('typescript');
process.env.NODE_PATH = path.join(repo, 'node_modules');
require('node:module').Module._initPaths();
const HEAD = 'ee97495c93349edb42b726cccae8b1fb020542ef';
const started = Date.now();
assert.equal(execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), HEAD);
const [command, ...args] = process.argv.slice(2);
const tag = [command, ...args].join('_').replace(/[^\w-]/g, '_');
const bundle = variant => path.join(bundles, `shape103-${variant}.cjs`);
const hash = value => createHash('sha256').update(value).digest('hex');

/** Write bounded measurement evidence, separate from executable build output. */
function save(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000, name);
  fs.mkdirSync(artifacts, { recursive: true });
  fs.writeFileSync(path.join(artifacts, name + '.json'), text);
}
process.once('exit', status => save(`process-${tag}`, { HEAD, command, args, status, signal: null,
  started, ended: Date.now(), elapsedMs: Date.now() - started, pid: process.pid, driverSha256: hash(fs.readFileSync(script)) }));

/** Require unique substitutions in the already committed production harness. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before);
  return source.replace(before, after);
}

/** Apply reviewed unified source hunks in memory, requiring exact context. */
function readCandidate() {
  const result = new Map();
  const text = fs.readFileSync(path.join(directory, 'profile-102-work/production-freeze-candidate.patch'), 'utf8');
  for (const section of text.split(/(?=^diff --git )/m).filter(Boolean)) {
    const relative = section.match(/^\+\+\+ b\/(.+)$/m)?.[1];
    if (!relative?.startsWith('packages/canard/schema-form/src/core/blueprint/') || !relative.endsWith('.ts') || relative.includes('/__tests__/')) continue;
    const file = path.join(repo, relative);
    let content = section.includes('new file mode') ? '' : fs.readFileSync(file, 'utf8');
    for (const block of section.split(/^@@ .*@@.*\n/m).slice(1)) {
      const lines = block.split('\n').filter(line => /^[ +\-]/.test(line));
      const old = lines.filter(line => line[0] !== '+').map(line => line.slice(1)).join('\n') + (lines.some(line => line[0] !== '+') ? '\n' : '');
      const next = lines.filter(line => line[0] !== '-').map(line => line.slice(1)).join('\n') + '\n';
      if (!old) content += next;
      else {
        assert.equal(content.split(old).length, 2, `Patch context mismatch: ${relative}\n${old.slice(0,180)}`);
        content = content.replace(old, next);
      }
    }
    result.set(file, content);
  }
  return result;
}
const candidate = readCandidate();

/** Wrap selected property initializers while preserving every surrounding source byte. */
function wrapProperty(file,content,key,wrapper) {
  const tree=ts.createSourceFile(file,content,ts.ScriptTarget.Latest,true),edits=[];
  const visit=node=>{
    if(ts.isPropertyAssignment(node)&&node.name.getText(tree)===key)
      edits.push({begin:node.initializer.getStart(tree),end:node.initializer.end});
    ts.forEachChild(node,visit);
  };visit(tree);
  assert(edits.length>0,`${file}: ${key}`);
  for(const {begin,end} of edits.toSorted((a,b)=>b.begin-a.begin))content=content.slice(0,begin)+wrapper(content.slice(begin,end))+content.slice(end);
  return content;
}

/** Keep shared gates uniform from creation; all bound memberships receive the same protection. */
function uniformGates(file,content) {
  let source=candidate.get(file)??content;
  if(file.endsWith('/analyze/collectDeclarations.ts')){
    source="import { freezeBlueprintValue } from '../freezeBlueprintValues/utils/freezeBlueprintValue';\n"+source;
    source=once(source,'order: [...input.order],','order: freezeBlueprintValue([...input.order]),');
    source=once(source,'    gates,\n    declares:', '    gates: freezeBlueprintValue(gates),\n    declares:');
  }
  if(file.endsWith('/analyze/populateNodeChildren.ts')){
    source="import { freezeBlueprintValue } from '../freezeBlueprintValues/utils/freezeBlueprintValue';\n"+source;
    source=wrapProperty(file,source,'gates',value=>value.startsWith('declaration.gates.map(')?`freezeBlueprintValue(${value})`:value);
  }
  return source;
}

/** Uniformly freeze retained membership arrays, leaving exclusively owned records development-only. */
function uniformArrays(file,content){
  let source=uniformGates(file,content);
  if(file.endsWith('/freezeBlueprintDeclarations.ts'))
    source=once(source,'if (DEVELOPMENT) freezeBlueprintValue(declarations);','freezeBlueprintValue(declarations);');
  if(file.endsWith('/freezeBlueprintValues.ts')){
    source=source.replace(/    if \(DEVELOPMENT\) \{\n      freezeBlueprintValue\(fragment.declares\);([\s\S]*?)      freezeBlueprintValue\(fragment\);\n    \}/,
      `    freezeBlueprintValue(fragment.declares);\n    freezeBlueprintValue(fragment.overlays);\n    freezeBlueprintValue(fragment.inheritedOverlays);\n    freezeBlueprintValue(fragment.children);\n    if (DEVELOPMENT) freezeBlueprintValue(fragment);`);
    source=once(source,`    if (DEVELOPMENT) {\n      if (node.fields) freezeBlueprintValue(node.fields);\n      if (node.prefixItems) freezeBlueprintValue(node.prefixItems);\n      freezeBlueprintValue(entries);\n      freezeBlueprintValue(node);\n    }`,
      `    if (node.fields) freezeBlueprintValue(node.fields);\n    if (node.prefixItems) freezeBlueprintValue(node.prefixItems);\n    freezeBlueprintValue(entries);\n    if (DEVELOPMENT) freezeBlueprintValue(node);`);
    const begin=source.indexOf('  if (DEVELOPMENT) {\n    for (let index = 0; index < context.declarations.length;');
    assert(begin>0);
    source=source.slice(0,begin)+`  if (DEVELOPMENT) for (let index=0;index<context.declarations.length;index++) freezeBlueprintValue(context.declarations[index]);
  for (let index=0;index<result.expressions.length;index++) {
    const expression=result.expressions[index];
    freezeBlueprintValue(expression.dependencies);
    if (DEVELOPMENT) freezeBlueprintValue(expression);
  }
  const ids=Object.values(result.dependencies);
  for(let index=0;index<ids.length;index++)freezeBlueprintValue(ids[index]);
  freezeBlueprintValue(result.expressions);
  freezeBlueprintValue(result.dependencies);
  freezeBlueprintValue(context.nodes);
  freezeBlueprintValue(context.fragments);
  if(DEVELOPMENT){freezeBlueprintValue(context.capabilities);freezeBlueprintValue(result);}
};\n`;
  }
  if(file.endsWith('/itemEntry/getItemEntry.ts'))source=once(source,'if (DEVELOPMENT) Object.freeze(declarations);','Object.freeze(declarations);');
  return source;
}

/** Own mutable memberships per record; freeze public and shared metadata at their producer. */
function ownedInline(file,content){
  let source=candidate.get(file)??content;
  if(file.endsWith('/analyze/createBlueprintGate.ts'))return once(content,'  ...gate,','  ...gate,\n  ...(gate.appliesWhen === undefined ? {} : { appliesWhen: Object.freeze([...gate.appliesWhen]) }),');
  if(['/analyze/collectGateEvaluationReads.ts','/analyze/readDiscriminatorBranches.ts'].some(suffix=>file.endsWith(suffix)))return content;
  if(file.endsWith('/blueprint/blueprint.ts')){
    source=once(source,'  freezeBlueprintValues(context, result);','  if (process.env.NODE_ENV !== "production") freezeBlueprintValues(context, result);');
    source=once(source,' : EMPTY_EXPRESSIONS;', ' : [];');
    source=once(source,'dependencies: context.dependencies ?? EMPTY_DEPENDENCIES,','dependencies: context.dependencies ?? Object.create(null),');
  }
  if(file.endsWith('/analyze/collectDeclarations.ts')){
    source=once(source,'gates: fragment.gates,','gates: [...fragment.gates],');
    source=once(source,'order: fragment.order,','order: [...fragment.order],');
  }
  if(file.endsWith('/analyze/buildNodes.ts')){
    source=once(source,"nonNull.length > 1 ? nonNull : (nonNull[0] ?? 'null');","nonNull.length > 1 ? Object.freeze(nonNull) : (nonNull[0] ?? 'null');");
    source=once(source,'      true,\n    );','      false,\n    );');
    source=once(source,'? { ...declaration, validationOnly: true } : declaration;', '? { ...declaration, gates: [...declaration.gates], order: [...declaration.order], validationOnly: true } : declaration;');
  }
  if(file.endsWith('/analyze/populateNodeChildren.ts')){
    source=once(source,'          ...declaration,\n          name,','          ...declaration,\n          order: [...declaration.order],\n          name,');
  }
  if(file.endsWith('/analyze/populateVirtualNodes.ts')){
    source=once(source,'host.childEntries.filter((edge) => edge.name === field),','host.childEntries.filter((edge) => edge.name === field).map((edge) => ({...edge, declarations: edge.declarations.map((declaration) => ({...declaration, gates: [...declaration.gates], order: [...declaration.order]}))})),');
    source=once(source,'        declarations: node.declarations,','        declarations: node.declarations.map((declaration) => ({...declaration, gates: [...declaration.gates], order: [...declaration.order]})),');
  }
  if(file.endsWith('/itemEntry/getItemEntry.ts'))source=once(source,'        ...declaration,\n        name,','        ...declaration,\n        gates: [...declaration.gates],\n        order: [...declaration.order],\n        name,');
  if(file.endsWith('/effectiveSchema/utils/mergeSchemaContributions.ts')){
    source=once(source,`const FALSE_EFFECTIVE_SCHEMA: EffectiveSchema = freezeBlueprintValue({\n  schema: false,\n  typeConflict: false,\n});`, '');
    source=once(source,'if (declaration.schema === false) return FALSE_EFFECTIVE_SCHEMA;',
      'if (declaration.schema === false) return process.env.NODE_ENV !== "production" ? Object.freeze({ schema: false, typeConflict: false }) : { schema: false, typeConflict: false };');
  }
  if(file.endsWith('/freezeBlueprintValue.ts'))source=`export const freezeBlueprintValue = <Value extends object>(value: Value): Value => Object.freeze(value);\n`;
  if(file.endsWith('/freezeEffectiveSchema.ts'))source=`import type { EffectiveSchema } from '../../../type';
import { OwnedSchemaValues } from './OwnedSchemaValues';
const DEVELOPMENT=process.env.NODE_ENV!=='production';
export const freezeEffectiveSchema=(result:EffectiveSchema):EffectiveSchema=>{
  const schema=result.schema;
  if(typeof schema==='object'){
    const required=schema.required, allOf=schema.allOf, enumeration=schema.enum, controls=schema.controls;
    const options=schema.options,presentation=schema.presentation,type=schema.type;
    if(required&&typeof required==='object'&&OwnedSchemaValues.has(required))Object.freeze(required);
    if(allOf&&typeof allOf==='object'&&OwnedSchemaValues.has(allOf))Object.freeze(allOf);
    if(enumeration&&typeof enumeration==='object'&&OwnedSchemaValues.has(enumeration))Object.freeze(enumeration);
    if(controls&&typeof controls==='object'&&OwnedSchemaValues.has(controls))Object.freeze(controls);
    if(options&&typeof options==='object'&&OwnedSchemaValues.has(options))Object.freeze(options);
    if(presentation&&typeof presentation==='object'&&OwnedSchemaValues.has(presentation))Object.freeze(presentation);
    if(type&&typeof type==='object'&&OwnedSchemaValues.has(type))Object.freeze(type);
    if(Array.isArray(allOf))for(let index=0;index<allOf.length;index++){
      const clause=allOf[index];
      if(clause&&typeof clause==='object'&&OwnedSchemaValues.has(clause))Object.freeze(clause);
    }
    Object.freeze(schema);
  }
  if(DEVELOPMENT)Object.freeze(result);
  return result;
};\n`;
  return source;
}

/** Erase only Object.freeze call wrappers, keeping arguments and their evaluation. */
function removeFreezes(file, content) {
  const tree = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true), edits = [];
  const visit = node => {
    if (ts.isCallExpression(node) && node.expression.getText(tree) === 'Object.freeze') {
      assert.equal(node.arguments.length, 1);
      edits.push([node.getStart(tree), node.arguments[0].getStart(tree), '('], [node.arguments[0].end, node.end, ')']);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  for (const [begin, end, replacement] of edits.toSorted((a,b) => b[0]-a[0])) {
    const blank = content.slice(begin,end).replace(/[^\n]/g,' ');
    content = content.slice(0,begin) + replacement + blank.slice(1) + content.slice(end);
  }
  return content;
}

/** Return the source policy for one measurement variant, without touching product files. */
function sourceFor(file, content, variant) {
  variant=variant.replace(/-probe$/,'');
  const development=variant.endsWith('-dev');
  variant=variant.replace(/-dev$/,'');
  if (variant === 'head' || variant === 'control') return content;
  if (variant === 'unfrozen' && file.startsWith(path.join(pkg, 'src/core/blueprint/'))) return removeFreezes(file, content);
  if (variant === 'unfrozen') return content;
  if (variant === 'candidate') return candidate.get(file) ?? content;
  if (variant === 'uniform-gates') return uniformGates(file,content);
  if (variant === 'uniform-arrays') return uniformArrays(file,content);
  if (variant === 'owned-inline') {
    let source=ownedInline(file,content);
    if(development&&file.endsWith('/freezeBlueprintDeclarations.ts'))source=once(source,'      freezeBlueprintValue(gates);','      freezeBlueprintValue(declaration.order);\n      freezeBlueprintValue(gates);');
    if(development&&file.endsWith('/freezeBlueprintValue.ts'))source=once(candidate.get(file),'    Object.freeze(value);','    if (!Object.isFrozen(value)) Object.freeze(value);');
    if(development&&file.endsWith('/freezeEffectiveSchema.ts'))source=source.replace(/Object.freeze\((\w+)\);/g,'if (!Object.isFrozen($1)) Object.freeze($1);');
    return source;
  }
  throw new Error('Unknown variant ' + variant);
}
globalThis.__shape103Virtual = candidate;
globalThis.__shape103Source = sourceFor;

let canonical = fs.readFileSync(path.join(directory, 'tools/profile-99c01.mjs'), 'utf8');
canonical = canonical.slice(0, canonical.indexOf('const [command, ...args] = process.argv.slice(2);'));
canonical = once(canonical, 'const script = fileURLToPath(import.meta.url);', 'const script = ' + JSON.stringify(path.join(directory, 'tools/profile-99c01.mjs')) + ';');
canonical = once(canonical, "const work = path.join(output, '.profile-99c01-work');", 'const work = ' + JSON.stringify(bundles) + ';');
canonical = once(canonical, "const head = '4ae9dced58bcbc05c05ff5907fca463af024c7b6';", 'const head = ' + JSON.stringify(HEAD) + ';');
canonical = once(canonical, "  const edits = variant === 'head' || variant === 'old' ? [] :\n    JSON.parse(fs.readFileSync(path.join(output, 'profile-99c01/profile-99c01-ablations.json'), 'utf8')).find(item => item.id === variant)?.edits;", '  const edits = [];');
canonical = once(canonical, 'fs.existsSync(file) && fs.statSync(file).isFile()', 'globalThis.__shape103Virtual.has(file) || fs.existsSync(file) && fs.statSync(file).isFile()');
canonical = once(canonical, "ablateSource(file, fs.readFileSync(file, 'utf8'), edits)", "globalThis.__shape103Source(file, globalThis.__shape103Virtual.get(file) && !fs.existsSync(file) ? globalThis.__shape103Virtual.get(file) : fs.readFileSync(file,'utf8'), variant)");
canonical = once(canonical, 'outfile: path.join(work, `${variant}.cjs`)', 'outfile: path.join(work, `shape103-${variant}.cjs`)');
canonical = once(canonical, "builder.onResolve({ filter: /^@\\/schema-form\\// },", "builder.onResolve({ filter: /^\\./ }, ({path: name, importer}) => {\n          const base = path.resolve(path.dirname(importer),name);\n          const virtual = [base,base+'.ts',base+'/index.ts'].find(file=>globalThis.__shape103Virtual.has(file));\n          if(virtual) return {path:virtual};\n        });\n        builder.onResolve({ filter: /^@\\/schema-form\\// },");
canonical = once(canonical, 'stdin: { contents: `export {nodeFromJSONSchema}',
  'stdin: { contents: `export {blueprint} from ' + JSON.stringify(path.join(pkg,'src/core/blueprint/blueprint.ts')) + ';\n' +
  'export {mergeEffectiveSchema} from ' + JSON.stringify(path.join(pkg,'src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts')) + ';\n' +
  'export {nodeFromJSONSchema}');
canonical += '\nexport { buildAsync, fixtureFor, create, observe, environment };\n';
if(command==='build'&&args[0].endsWith('-probe'))canonical=once(canonical,'stdin: { contents: `export {blueprint}',
  'stdin: { contents: `export {getItemEntry} from '+JSON.stringify(path.join(pkg,'src/core/blueprint/utils/itemEntry/getItemEntry.ts'))+';\nexport {blueprint}');
if(command==='build'&&args[0].endsWith('-dev'))canonical=once(canonical,`define: { 'process.env.NODE_ENV': '"production"' }`,`define: { 'process.env.NODE_ENV': '"development"' }`);
const api = await import('data:text/javascript;base64,' + Buffer.from(canonical).toString('base64'));

/** Use the canonical 64 checkpoints and timed check-queue sentinel. */
async function measured(operation) {
  const begin = performance.now(), root = operation();
  for (let i=0;i<64;i++) await Promise.resolve();
  const end = await new Promise(resolve => setImmediate(() => resolve(performance.now())));
  return {root,begin,end,ms:end-begin};
}
const median = values => values.toSorted((a,b)=>a-b)[Math.ceil(values.length/2)-1];

/** Bring a retained update form through its authored interaction history. */
async function prepare(engine, fixture) {
  const root = api.create(engine,fixture,'head');
  await measured(()=>{});
  for(const interaction of fixture.interactions) { root.find(interaction.path).setValue(interaction.value); await measured(()=>{}); }
  return root;
}

/** Fresh-process 95C-01 forced-GC pairs, alternating order on every sample. */
async function paired(variant,name,mode,run) {
  assert(globalThis.gc);
  const engines = {head:require(bundle('head')),variant:require(bundle(variant))};
  const fixture=api.fixtureFor(engines.head,name), interaction=fixture.interactions[0];
  const input=interaction?.value;
  const values=name.startsWith('oneOf-')?['kind_4','kind_0']:typeof input==='string'?[input+'-later',input+'-again']:typeof input==='number'?[input+1,input]:[!input,input];
  const roots=mode==='later'?{head:await prepare(engines.head,fixture),variant:await prepare(engines.variant,fixture)}:{};
  const targets=mode==='later'?{head:roots.head.find(interaction.path),variant:roots.variant.find(interaction.path)}:{};
  const timings={head:[],variant:[]},last={},windows=[],gc=[],before=[],after=[];
  const observer=new PerformanceObserver(list=>{for(const entry of list.getEntries())gc.push({start:entry.startTime,ms:entry.duration,kind:entry.detail.kind});});
  observer.observe({entryTypes:['gc']});
  for(let i=0;i<101;i++)before.push((await measured(()=>{})).ms);
  for(let index=-20;index<101;index++){
    assert(Date.now()-started<420000,'Split before eight minutes');
    const order=(index+run-1)%2===0?['head','variant']:['variant','head'];
    for(const version of order){
      const schema=mode==='mount'?structuredClone(fixture.workspace):undefined;
      globalThis.gc();await new Promise(resolve=>setImmediate(resolve));
      const sample=await measured(()=>mode==='mount'?api.create(engines[version],fixture,'head',schema):targets[version].setValue(values[(index+20)%2]));
      last[version]=mode==='mount'?sample.root:roots[version];
      if(index>=0){timings[version].push(sample.ms);windows.push({version,index,begin:sample.begin,end:sample.end});}
    }
  }
  for(let i=0;i<101;i++)after.push((await measured(()=>{})).ms);
  await new Promise(resolve=>setImmediate(resolve));observer.disconnect();
  const observation={head:api.observe(last.head),variant:api.observe(last.variant)};
  assert.deepEqual(observation.head,observation.variant);
  const empty=median([...before,...after]),headMs=median(timings.head)-empty,variantMs=median(timings.variant)-empty;
  const deltas=timings.head.map((ms,i)=>ms-timings.variant[i]);
  const row={HEAD,variant,name,mode,run,regime:'forced',freshProcess:true,warmup:20,samples:101,calls:{head:121,variant:121},
    bundleSha256:{head:hash(fs.readFileSync(bundle('head'))),variant:hash(fs.readFileSync(bundle(variant)))},
    headMs,variantMs,gainMs:headMs-variantMs,pairedMedianMs:median(deltas),empty,timingsMs:timings,pairedDeltasMs:deltas,
    emptyTimingsMs:{before,after},windows,gc,observation,environment:api.environment(),started,ended:Date.now(),elapsedMs:Date.now()-started};
  save(`time-${variant}-${name}-${mode}-r${run}`,row);
  console.log(JSON.stringify({variant,name,mode,run,headMs,variantMs,gainMs:row.gainMs,pairedMedianMs:row.pairedMedianMs,seconds:row.elapsedMs/1000}));
}

/** IC/deopt diagnostic follows the same workload; its clocks never support bounds. */
async function ic(variant,name) {
  assert(globalThis.gc);
  const engine=require(bundle(variant)),fixture=api.fixtureFor(engine,name),windows=[];
  let last;
  for(let index=-20;index<101;index++){
    assert(Date.now()-started<420000);
    const schema=structuredClone(fixture.workspace);
    globalThis.gc();await new Promise(resolve=>setImmediate(resolve));
    if(index===-20)console.log('PHASE warmup');
    if(index===0)console.log('PHASE samples');
    const result=await measured(()=>api.create(engine,fixture,'head',schema));last=result.root;
    windows.push({index,begin:result.begin,end:result.end});
  }
  save(`ic-workload-${variant}-${name}`,{HEAD,variant,name,warmup:20,samples:101,forcedGC:true,windows,observation:api.observe(last),elapsedMs:Date.now()-started});
  console.log('PHASE done '+JSON.stringify({variant,name,seconds:(Date.now()-started)/1000}));
  return last;
}

/** Verify observable schema/diagnostic equality and shallow owned/shared container protection. */
function verify(variant){
  const engines={head:require(bundle('head')),variant:require(bundle(variant))};
  const corpus=JSON.parse(fs.readFileSync(path.join(pkg,'src/core/blueprint/__tests__/fixtures/coldBindingHead.json'),'utf8'));
  const records=[],safety=[];
  const normalize=value=>JSON.parse(JSON.stringify(value,(key,item)=>key==='stack'?undefined:item));
  const collectAuthored=(value,held=new Set())=>{
    if(!value||typeof value!=='object'||held.has(value))return held;held.add(value);
    for(const child of Object.values(value))collectAuthored(child,held);return held;
  };
  const capture=(engine,authored,collect,check)=>{
    const diagnostics=[],schema=structuredClone(authored),borrowed=collectAuthored(schema);
    let blueprint;
    try{blueprint=engine.blueprint(schema,collect?{collect:value=>diagnostics.push(value)}:{});}
    catch(error){return normalize({error:{name:error.name,message:error.message,data:error},diagnostics});}
    const owners=new Set(),memberships=new Map(),issues=[],effective=[];
    const record=(owner,label)=>{
      if(!owner||owners.has(owner))return;owners.add(owner);
      for(const key of ['order','gates','declarations','childEntries','declares','overlays','inheritedOverlays','children','fields','prefixItems','evaluationReads','appliesWhen','dependencies']){
        const value=owner[key];if(!value||typeof value!=='object'||borrowed.has(value))continue;
        if(Array.isArray(value)){
          const list=memberships.get(value)??[];list.push(label+'.'+key);memberships.set(value,list);
          if(key==='gates'||key==='appliesWhen')for(const gate of value){record(gate,'gate');if(check&&!Object.isFrozen(gate))issues.push('shared gate record');}
          if(key==='declarations')for(const declaration of value)record(declaration,'declaration');
          if(key==='childEntries')for(const entry of value)record(entry,'entry');
        }
      }
    };
    for(const fragment of blueprint.fragments)record(fragment,'fragment:'+fragment.id);
    for(const node of blueprint.nodes){
      record(node,'node:'+node.id);
      if(check&&Array.isArray(node.schemaType)&&!Object.isFrozen(node.schemaType))issues.push('schemaType');
      const selections=[[],node.declarations.filter(d=>d.gates.length).map(d=>d.id),...node.declarations.filter(d=>d.gates.length).map(d=>[d.id])];
      for(const ids of selections){
        const value=engine.mergeEffectiveSchema(node,ids);assert.equal(engine.mergeEffectiveSchema(node,ids),value);
        effective.push({path:node.path,ids,value,keys:typeof value.schema==='object'?Object.keys(value.schema):[]});
        if(check&&typeof value.schema==='object'){
          if(!Object.isFrozen(value.schema))issues.push('public schema');
          for(const key of ['required','allOf','enum','controls','options','presentation','type']){
            const member=value.schema[key];
            if(member&&typeof member==='object'&&!borrowed.has(member)&&!Object.isFrozen(member))issues.push('public generated '+key);
          }
          for(const clause of value.schema.allOf??[])if(clause&&typeof clause==='object'&&!borrowed.has(clause)&&!Object.isFrozen(clause))issues.push('generated clause');
        }
      }
    }
    for(const expression of blueprint.expressions)record(expression,'expression');
    const shared=[...memberships].filter(([,labels])=>labels.length>1);
    if(check)for(const [value,labels]of shared)if(!Object.isFrozen(value))issues.push('shared membership:'+labels.join(','));
    assert.deepEqual(schema,authored,'borrowed input unchanged');
    if(check){
      safety.push({collect,nodes:blueprint.nodes.length,sharedMemberships:shared.length,issues});
      assert.deepEqual(issues,[],variant+' shallow safety');
    }
    return normalize({nodes:blueprint.nodes.map(n=>({id:n.id,path:n.path,schemaPath:n.schemaPath,kind:n.kind,schemaType:n.schemaType,nullable:n.nullable,strategy:n.strategy,
      declarations:n.declarations,entries:n.childEntries.map(e=>({name:e.name,nodeId:e.node.id,hostPath:e.hostPath,declarations:e.declarations}))})),fragments:blueprint.fragments,effective,diagnostics});
  };
  const check=variant!=='unfrozen';
  for(const sample of corpus.cases)for(const collect of [false,true]){
    const expected=capture(engines.head,sample.schema,collect,false),actual=capture(engines.variant,sample.schema,collect,check);
    assert.deepEqual(actual,expected,sample.label+' collect='+collect);records.push({label:sample.label,collect,error:!!actual.error,nodes:actual.nodes?.length??0});
  }
  save('verify-'+variant,{HEAD,variant,schemas:corpus.cases.length,captures:records.length,records,safety,equal:true,measurementOnly:true});
  console.log(JSON.stringify({variant,schemas:corpus.cases.length,captures:records.length,equal:true,safetyChecks:safety.length}));
}

/** Count native freezes independently from timing; module-load constants are excluded. */
async function counts(variant,name){
  const engine=require(bundle(variant)),fixture=api.fixtureFor(engine,name),values=new Map(),native=Object.freeze;
  let calls=0,primitiveCalls=0;
  Error.stackTraceLimit=30;
  Object.freeze=value=>{
    calls++;
    if(value&&(typeof value==='object'||typeof value==='function')){
      const entry=values.get(value);if(entry)entry.calls++;
      else values.set(value,{calls:1,stack:new Error().stack});
    }else primitiveCalls++;
    return native(value);
  };
  let root;try{root=api.create(engine,fixture,'head',structuredClone(fixture.workspace));await measured(()=>{});}finally{Object.freeze=native;}
  const sites={};for(const {stack,calls}of values.values()){
    const caller=stack.split('\n').find(line=>line.includes(`shape103-${variant}.cjs:`))?.trim()??'outside bundle';
    const item=sites[caller]??={distinct:0,calls:0};item.distinct++;item.calls+=calls;
  }
  const nodes=root.runtime.blueprint.nodes.length;
  const row={HEAD,variant,name,mode:variant.endsWith('-dev')?'development':'production',nodes,calls,distinct:values.size,aliasCalls:calls-primitiveCalls-values.size,primitiveCalls,freezesPerNode:values.size/nodes,sites};
  save(`count-${variant}-${name}`,row);console.log(JSON.stringify({...row,sites:undefined}));
}

/** Attribute a separate diagnostic CPU profile to the same timed verdict windows. */
async function cpu(variant,name){
  assert(globalThis.gc);
  const engine=require(bundle(variant)),fixture=api.fixtureFor(engine,name),windows=[];
  for(let i=0;i<20;i++){
    const schema=structuredClone(fixture.workspace);globalThis.gc();await new Promise(resolve=>setImmediate(resolve));
    await measured(()=>api.create(engine,fixture,'head',schema));
  }
  const session=new inspector.Session();session.connect();
  const post=(method,params={})=>new Promise((resolve,reject)=>session.post(method,params,(error,value)=>error?reject(error):resolve(value)));
  await post('Profiler.enable');await post('Profiler.setSamplingInterval',{interval:100});await post('Profiler.start');
  for(let i=0;i<101;i++){
    const schema=structuredClone(fixture.workspace);globalThis.gc();await new Promise(resolve=>setImmediate(resolve));
    const beginUs=Number(process.hrtime.bigint()/1000n);await measured(()=>api.create(engine,fixture,'head',schema));
    const endUs=Number(process.hrtime.bigint()/1000n);windows.push({beginUs,endUs});
  }
  const {profile}=await post('Profiler.stop');session.disconnect();
  fs.writeFileSync(path.join(scratch,`cpu-${variant}-${name}.cpuprofile`),JSON.stringify(profile));
  const {TraceMap,originalPositionFor}=require('@jridgewell/trace-mapping'),map=new TraceMap(JSON.parse(fs.readFileSync(bundle(variant)+'.map','utf8')));
  const nodes=new Map(profile.nodes.map(node=>[node.id,node])),parents=new Map(),rows=new Map();
  for(const node of profile.nodes)for(const child of node.children??[])parents.set(child,node.id);
  const frameFor=node=>{
    const frame=node.callFrame;let file=frame.url,line=frame.lineNumber+1,column=frame.columnNumber;
    if(frame.url.endsWith(`/shape103-${variant}.cjs`)){
      const source=originalPositionFor(map,{line,column:Math.max(0,column)});
      if(source.source){file=path.relative(repo,path.resolve(bundles,source.source));line=source.line;column=source.column;}
    }
    if(file.startsWith('data:'))file='(canonical adapter)';
    return {function:frame.functionName||'(anonymous)',file,line,column};
  };
  let stamp=profile.startTime,at=0,totalUs=0,samples=0;
  for(let i=0;i<profile.samples.length;i++){
    const previous=stamp;stamp+=profile.timeDeltas[i];
    while(at<windows.length&&windows[at].endUs<=previous)at++;
    if(at===windows.length)break;
    let weight=0;for(let j=at;j<windows.length&&windows[j].beginUs<stamp;j++)weight+=Math.max(0,Math.min(stamp,windows[j].endUs)-Math.max(previous,windows[j].beginUs));
    if(!weight)continue;totalUs+=weight;samples++;
    const seen=new Set();let depth=0;
    for(let id=profile.samples[i];id!==undefined;id=parents.get(id)){
      const frame=frameFor(nodes.get(id)),key=JSON.stringify(frame);
      if(seen.has(key)){depth++;continue;}seen.add(key);
      const row=rows.get(key)??{...frame,selfUs:0,totalUs:0};rows.set(key,row);row.totalUs+=weight;if(depth===0)row.selfUs+=weight;depth++;
    }
  }
  const functions=[...rows.values()].map(row=>({...row,selfMsPerMount:row.selfUs/101000,totalMsPerMount:row.totalUs/101000,selfPct:row.selfUs/totalUs*100})).sort((a,b)=>b.selfUs-a.selfUs);
  assert(Math.abs(functions.reduce((sum,row)=>sum+row.selfUs,0)-totalUs)<.01);
  const result={HEAD,variant,name,warmup:20,samples:101,intervalUs:100,forcedGC:true,diagnosticOnly:true,totalUs,cpuSamples:samples,windows,functions};
  save(`cpu-${variant}-${name}`,result);
  console.log(JSON.stringify({variant,name,cpuSamples:samples,top:functions.slice(0,8).map(row=>[row.function,row.selfMsPerMount]),freeze:functions.filter(row=>/freezeBlueprint|freezeEffective/.test(row.function)).map(row=>[row.function,row.selfMsPerMount,row.totalMsPerMount])}));
}

if(command==='build'){
  const variant=args[0],result=await api.buildAsync(variant);save('build-'+variant,{HEAD,...result});
  fs.mkdirSync(scratch,{recursive:true});
  const sources={};
  for(const [file,source] of candidate)sources[path.relative(repo,file)]=sourceFor(file,fs.existsSync(file)?fs.readFileSync(file,'utf8'):source,variant);
  fs.writeFileSync(path.join(scratch,'sources-'+variant+'.json'),JSON.stringify(sources));
  console.log(JSON.stringify(result));
}else if(command==='launch-ic'){
  const [variant,name]=args;
  fs.mkdirSync(scratch,{recursive:true});
  const log=path.join(scratch,`ic-${variant}-${name}.log`),trace=path.join(scratch,`deopt-${variant}-${name}.log`);
  const fd=fs.openSync(trace,'w');
  const child=spawnSync(process.execPath,['--expose-gc','--log-ic','--log-maps','--log-maps-details','--no-logfile-per-isolate','--logfile='+log,'--trace-deopt','--trace-file-names',script,'ic',variant,name],
    {cwd:repo,env:{...process.env,NODE_ENV:'production',GIT_OPTIONAL_LOCKS:'0'},stdio:['ignore',fd,fd]});
  fs.closeSync(fd);
  assert.equal(child.signal,null);assert.equal(child.status,0,fs.readFileSync(trace,'utf8').split('\n').filter(line=>line.length<1000).slice(-15).join('\n'));
  console.log(JSON.stringify({variant,name,status:child.status,signal:child.signal,seconds:(Date.now()-started)/1000,logBytes:fs.statSync(log).size,deopts:fs.readFileSync(trace,'utf8').split('\n').filter(line=>line.includes('bailout')).length}));
}else if(command==='launch-probe'){
  const [variant,name]=args;
  fs.mkdirSync(scratch,{recursive:true});
  const log=path.join(scratch,`probe-ic-${variant}-${name}.log`),trace=path.join(scratch,`probe-${variant}-${name}.log`);
  const fd=fs.openSync(trace,'w');
  const child=spawnSync(process.execPath,['--expose-gc','--allow-natives-syntax','--log-ic','--log-maps','--log-maps-details','--no-logfile-per-isolate','--logfile='+log,script,'probe',variant,name],
    {cwd:repo,env:{...process.env,NODE_ENV:'production',GIT_OPTIONAL_LOCKS:'0'},stdio:['ignore',fd,fd]});
  fs.closeSync(fd);assert.equal(child.signal,null);assert.equal(child.status,0);
  console.log(JSON.stringify({variant,name,status:child.status,signal:child.signal,seconds:(Date.now()-started)/1000,probeBytes:fs.statSync(trace).size}));
}else if(command==='probe'){
  const [variant,name]=args,root=await ic(variant,name),b=root.runtime.blueprint;
  const node=b.nodes.find(node=>node.childEntries.length),entry=node.childEntries[0],raw=entry.node.declarations[0],bound=entry.declarations[0];
  const debug=new Function('value','%DebugPrint(value);');
  const rows=[['fragment.gates',b.fragments.find(fragment=>fragment.id===raw.fragmentId).gates,'analyze/collectDeclarations.ts:46'],
    ['raw.gates',raw.gates,'analyze/collectDeclarations.ts:46'],['bound.gates',bound.gates,'analyze/populateNodeChildren.ts:173'],
    ['raw.order',raw.order,'analyze/collectDeclarations.ts:67'],['bound.order',bound.order,'analyze/collectDeclarations.ts:67'],
    ['raw.declaration',raw,'analyze/collectDeclarations.ts:77'],['bound.declaration',bound,'analyze/populateNodeChildren.ts:164'],
    ['node.declarations',entry.node.declarations,'analyze/buildNodes.ts:72'],['entry.declarations',entry.declarations,'analyze/populateNodeChildren.ts:163'],
    ['public.schema',entry.node.effectiveSchema??root.find('/'+entry.name)?.jsonSchema,'effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:42']];
  for(const [kind,value,creation]of rows)if(value&&typeof value==='object'){
    console.log('PROBE '+JSON.stringify({kind,creation,frozen:Object.isFrozen(value),keys:Object.keys(value)}));debug(value);
  }
}else if(command==='pair')await paired(args[0],args[1],args[2],Number(args[3]));
else if(command==='ic')await ic(args[0],args[1]);
else if(command==='verify')verify(args[0]);
else if(command==='count')await counts(args[0],args[1]);
else if(command==='cpu')await cpu(args[0],args[1]);
else if(command==='lazy'){
  const variant=args[0],engine=require(bundle(variant+'-probe'));
  const authored={type:'array',items:{type:'object',properties:{value:{type:'string',default:'x'}}}};
  const b=engine.blueprint(authored),first=engine.getItemEntry(b.root,0),second=engine.getItemEntry(b.root,1);
  assert.equal(engine.getItemEntry(b.root,0),first);assert.equal(first.node,second.node);
  assert.deepEqual(first.declarations.map(d=>d.order),second.declarations.map(d=>d.order));
  const copied=variant==='owned-inline';
  if(copied){assert.notEqual(first.declarations[0].order,second.declarations[0].order);assert.notEqual(first.declarations[0].gates,second.declarations[0].gates);}
  else {assert(Object.isFrozen(first.declarations[0].order));assert(Object.isFrozen(first.declarations[0].gates));}
  assert.deepEqual(authored,{type:'array',items:{type:'object',properties:{value:{type:'string',default:'x'}}}});
  save('lazy-'+variant,{variant,slotCacheSameReference:true,templateSameReference:true,membershipsOwned:copied,sharedProtected:!copied,authoredUnchanged:true});
  console.log(JSON.stringify({variant,lazy:true,slotCacheSameReference:true,membershipsOwned:copied}));
}
else throw new Error('Unknown command '+command);
