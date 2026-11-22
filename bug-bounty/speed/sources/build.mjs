import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const [name, root, sha] = process.argv.slice(2);
const dir = new URL('.', import.meta.url).pathname;
const src = root + '/packages/canard/schema-form/src';
const template = readFileSync(dir + 'benchmark.tsx', 'utf8');
let entry = template.replaceAll('/Users/Vincent/Workspace/albatrion/bb5-form3/packages/canard/schema-form/src', src);
if (!existsSync(src + '/providers/hooks/contextSnapshot/utils/areContextsEqual.ts')) {
  entry = entry.replace(/^import \{ areContextsEqual \} from .*;$/m, "import { equals as areContextsEqual } from '@winglet/common-utils/object';");
}
if (!existsSync(src + '/core/engine/blueprint/utils/expressions/replaceExpressionPaths.ts')) {
  entry = entry.replace(/^import \{ replaceExpressionPaths \} from .*;$/m,
    "import { JSON_POINTER_PATH_REGEX } from '" + src + "/core/engine/blueprint/utils/expressions/regex';\n" +
    "const replaceExpressionPaths = (text, replace) => text.replace(JSON_POINTER_PATH_REGEX, replace);");
}
const aliasRows = `
  if (row.startsWith('aliased-')) {
    const entry = {type:'object',properties:{
      a:{type:'string',default:'a'},
      b:{type:'string',controls:{derived:'(../a) + "!"'}},
    }};
    const schema = {type:'object',$defs:{entry},properties:{x:{$ref:'#/$defs/entry'},y:{$ref:'#/$defs/entry'}}};
    const mount = () => nodeFromJSONSchema({jsonSchema:schema});
    if (row === 'aliased-mount') return {run:()=>sink=mount(),count:450};
    const root = mount(), x = root.find('/x/a'), y = root.find('/y/a');
    return {run:i=>(row === 'aliased-alternating' && (i & 1) ? y : x).setValue(String(i)),count:2000};
  }
  if (row === 'find-nodes-single') {
    const root = nodeFromJSONSchema({jsonSchema:derived,defaultValue:{a:1},validationMode:ValidationMode.None});
    return {run:()=>sink=root.findNodes('/b'),count:120000};
  }
  if (row.startsWith('whole-array-client-')) {
    let publish, mounts = 0;
    const capture = input => { if (input) mounts++; };
    const Whole = ({defaultValue,onChange}) => {
      publish = onChange;
      return <input ref={capture} defaultValue={JSON.stringify(defaultValue)}/>;
    };
    const schema={type:'object',properties:{list:{type:'array',items:{type:'string'}}}};
    const ref=React.createRef(), host=document.createElement('div');
    document.body.append(host);
    const client=createRoot(host);
    flushSync(()=>client.render(<Form ref={ref} jsonSchema={schema} defaultValue={{list:['a','b']}}
      fieldInputMap={{'/list':Whole}} validationMode={ValidationMode.None}/>));
    const list=ref.current.findNode('/list');
    if (!publish) throw new Error('Whole-array input did not mount');
    const mixed = row === 'whole-array-client-mixed-batch';
    const composing = row === 'whole-array-client-composition';
    return {run:i=>{
      const input = composing ? host.querySelector('input') : undefined;
      const events = input && input.ownerDocument.defaultView;
      if (input) flushSync(()=>input.dispatchEvent(new events.CompositionEvent('compositionstart',{bubbles:true})));
      flushSync(()=>{
        if (mixed) list.batch(()=>{publish(['own'+i,'b']);list.find('0').setValue('external'+i);});
        else if (row==='whole-array-client-own-write') publish([String(i),'b']);
        else list.setValue([String(i),'b']);
      });
      if (input) flushSync(()=>input.dispatchEvent(new events.CompositionEvent('compositionend',{bubbles:true})));
    }, observe:()=>({mounts,value:list.value,shown:host.querySelector('input').value}),
    count:350,cleanup:()=>{flushSync(()=>client.unmount());host.remove();}};
  }
  if (row === 'relay-array-content' || row === 'relay-array-identity') {
    const list=nodeFromJSONSchema({jsonSchema:{type:'array',items:{type:'string'}},
      defaultValue:['a','b'],validationMode:ValidationMode.None});
    const value=list.value;
    const relay=(input,option)=>list.setValue(input,option);
    return {run:()=>relayFieldNodeInput(list,row==='relay-array-identity' ? value : ['a','b'],
      SetValueOption.Overwrite,relay),count:5000};
  }
  if (row.startsWith('validate-explicit') || row.startsWith('validate-writeback')) {
    let root, visits = 0;
    const writeback = row.startsWith('validate-writeback');
    const toggleError = row.endsWith('-errors');
    const issue = {dataPath:'',keyword:'writeback',message:'writeback'};
    const validator = {
      compile: () => () => {
        if (writeback) root.setValue('same');
        return toggleError && (visits++ & 1) === 0 ? [issue] : [];
      },
      compileGuard: () => () => true,
    };
    root = nodeFromJSONSchema({jsonSchema:{type:'string'},defaultValue:'same',validator,
      validationMode:ValidationMode.OnRequest,deferMountValidation:true});
    return {run:()=>root.validate(),count:3000,observe:()=>root.errors?.map(issue=>issue.keyword)};
  }
  if (row === 'context-error') {
    const a = new Error('same'), b = new Error('same');
    return {run:()=>sink=areContextsEqual(a,b),count:80000};
  }
  if (row === 'context-cycle' && ${sha !== '1c77ced57'}) {
    const a = {}, b = {}; a.self = a; b.self = b;
    return {run:()=>sink=areContextsEqual(a,b),count:80000};
  }
`;
entry = entry.replace("  if (row.startsWith('plain-'))", aliasRows + "  if (row.startsWith('plain-'))");
for (const subdir of [name, name + '-control']) mkdirSync(dir + subdir, {recursive:true});
const outfile = dir + name + '/benchmark.cjs';
await build({stdin:{contents:entry,sourcefile:'benchmark.tsx',resolveDir:dir,loader:'tsx'},outfile,bundle:true,jsx:'automatic',target:'es2020',tsconfigRaw:{compilerOptions:{jsx:'react-jsx',useDefineForClassFields:false,experimentalDecorators:true}},platform:'node',format:'cjs',packages:'external',alias:{'@/schema-form':src},define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'});
const digest = createHash('sha256').update(readFileSync(outfile)).digest('hex');
writeFileSync(dir + name + '/manifest.json',JSON.stringify({sha,sha256:digest,sourceRoot:root}));
for (const file of ['benchmark.cjs','manifest.json']) copyFileSync(dir + name + '/' + file, dir + name + '-control/' + file);
