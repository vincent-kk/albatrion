// Explicit measurement entry; engine variants exist only in esbuild's onLoad buffer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script);
const directory = path.dirname(artifacts);
const repo = path.resolve(directory, '../../../../../..');
const HEAD = '5c530e05414df1c7a09e0b5307b04910a0864c90';
const started = Date.now();
const save = (file, value) => {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000);
  fs.writeFileSync(path.join(artifacts, file), text);
};
const [command, ...args] = process.argv.slice(2);

if (command === '--official-worker') {
  const original = path.join(directory, 'tools/measure-verdict-95c01.mjs');
  let source = fs.readFileSync(original, 'utf8');
  source = source.replace('const directory = path.dirname(fileURLToPath(import.meta.url));',
    'const directory = ' + JSON.stringify(path.dirname(original)) + ';');
  source = source.replace("const expectedHead = '4d2e54533dc8feaccb4742be9dd322e46d20be58';", 'const expectedHead = ' + JSON.stringify(HEAD) + ';');
  source = source.replace('const warmup = 12, sampleCount = 101;', 'const warmup = 20, sampleCount = 101;');
  source = source.replace('hash(fs.readFileSync(fileURLToPath(import.meta.url)))', 'hash(fs.readFileSync(' + JSON.stringify(original) + '))');
  process.argv.splice(2, 1);
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
} else if (command === '--official') {
  for (const fixture of args) for (const run of [1, 2, 3])
    for (const version of run === 2 ? ['new', 'old'] : ['old', 'new']) {
      assert(Date.now() - started < 360_000, 'Split batches below eight minutes');
      const begin = Date.now();
      const result = spawnSync(process.execPath, ['--expose-gc', script, '--official-worker', fixture, 'off', String(run), version],
        { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
      assert.equal(result.signal, null); assert.equal(result.status, 0, result.stderr);
      const record = JSON.parse(result.stdout);
      record.summary.workerExit = { code: result.status, signal: result.signal, natural: true, elapsedMs: Date.now() - begin };
      record.summary.measurement107 = { originalTool: originalToolEvidence(), adaptations: ['HEAD', 'warmup 20', 'data-module path relocation'], productionFlag: false };
      save(`official-${fixture}-r${run}-${version}.json`, record);
      console.log(JSON.stringify({ fixture, run, version, elapsedMs: Date.now() - begin }));
    }
} else {
  let source = fs.readFileSync(path.join(directory, 'profile-105-rebound/measure.mjs'), 'utf8');
  source = source.replace('const script = fileURLToPath(import.meta.url);', 'const script = ' + JSON.stringify(script) + ';');
  source = source.replace("const HEAD = 'a958b37cbf7d7cd897565a06278ee141fd402816';", 'const HEAD = ' + JSON.stringify(HEAD) + ';');
  source = source.replaceAll('profile105-', 'profile107-');
  source = source.replace("try { await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')); }",
    'source = (' + adapt107.toString() + ')(source);\ntry { await import(\'data:text/javascript;base64,\'+Buffer.from(source).toString(\'base64\')); }');
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
assert(Date.now() - started < 480_000);

function originalToolEvidence() {
  return createHash('sha256').update(fs.readFileSync(path.join(directory, 'tools/measure-verdict-95c01.mjs'))).digest('hex');
}

/** Preserve the canonical clocks/builder and update only explicit analysis ablations. */
function adapt107(source) {
  source = source.replace('function transform(file,source,variant) {', 'function transform105(file,source,variant) {');
  source += `\n${transform.toString()}\n`;
  return source;

  function transform(file, source, variant) {
    if (variant === 'head' || variant === 'control' || variant === 'control-after' || variant === 'control-final') return source;
    if (variant === 'template-replay' && file.endsWith('/getTemplateKey.ts')) return tapeBody(source, file, 'getTemplateKey');
    if (variant === 'encode-native' && file.endsWith('/getTemplateKey.ts')) return bodyTransform(source, file, 'encodeLeaf', () => '{const key=JSON.stringify(value);return {key,boundKey:JSON.stringify(key).slice(1,-1)};}');
    if (variant === 'build-own-replay' && file.endsWith('/buildNodes.ts')) {
      return bodyTransform(source, file, 'buildNodes', original => {
        const end = original.indexOf('  context.templates.set(boundKey, nodes);');
        assert(end > 0);
        const prefix = original.slice(1, end);
        return `{
          const state=globalThis.__bound102,tapeKey='buildOwn',at=state.cursors[tapeKey]??0;
          state.cursors[tapeKey]=at+1;const tape=state.tapes[tapeKey]??=[];
          let key,boundKey,nodes;
          if(state.replay){const held=tape[at];if(!held)throw new Error('Build own tape exhausted');
            key=held.key;boundKey=held.boundKey;
            for(const fragment of held.fragments)context.fragments.push({...fragment,children:[...fragment.children]});
            if(inputs[0].fragment&&held.fragments[0])inputs[0].fragment.children.push(held.fragments[0].id);
            context.declarationId=held.nextId;Object.assign(context.capabilities,held.capabilities);
            nodes=held.nodes.map((node,index)=>{const fresh={...node,id:context.nodes.length,childEntries:[]};context.nodes.push(fresh);if(held.effective[index])DEFAULT_NO_ACTIVE.set(fresh,held.effective[index]);return fresh;});
          }else{const begin=context.fragments.length;
            const captured=(()=>{${prefix}return {key,boundKey,nodes};})();
            ({key,boundKey,nodes}=captured);
            tape[at]={...captured,nodes:nodes.map(node=>({...node,childEntries:[]})),effective:nodes.map(node=>DEFAULT_NO_ACTIVE.get(node)),fragments:context.fragments.slice(begin).map(f=>({...f,children:[...f.children]})),nextId:context.declarationId,capabilities:{...context.capabilities}};
          }
          ${original.slice(end)}`;
      });
    }
    if (variant === 'child-input-literal' && file.endsWith('/populateNodeChildren.ts')) {
      const before = '          ...base,\n          schema: child as SchemaInput[\'schema\'],';
      assert.equal(source.split(before).length, 3);
      return source.replace(before, '          context:base.context,gates:base.gates,inherited:base.inherited,hostPath:base.hostPath,fragment:base.fragment,role:base.role,\n          schema: child as SchemaInput[\'schema\'],');
    }
    if (variant === 'child-own-replay' && file.endsWith('/populateNodeChildren.ts')) {
      source = once(source, '      const properties = Object.entries(schema.properties);',
        "      const state=globalThis.__bound102,tapeKey='childInputs',at=state.cursors[tapeKey]??0;state.cursors[tapeKey]=at+1;const tape=state.tapes[tapeKey]??=[];\n      const held=state.replay?tape[at]:(tape[at]={properties:Object.entries(schema.properties),inputs:[],paths:[]});\n      const properties=held.properties;");
      const a = source.indexOf('        const input: SchemaInput = {'), b = source.indexOf('        appendChildEntries(', a);
      assert(a >= 0 && b > a);
      const block = source.slice(a, b);
      return source.slice(0, a) + `        let input,path;
        if(state.replay){input=held.inputs[index];input.fragment=context.fragments[input.fragment.id];path=held.paths[index];}
        else{const captured=(()=>{${block}return {input,path};})();input=captured.input;path=captured.path;held.inputs[index]=input;held.paths[index]=path;}
      ` + source.slice(b);
    }
    if (variant === 'child-own-replay' && file.endsWith('/appendChildEntries.ts')) {
      return bodyTransform(source, file, 'appendChildEntries', original => `{
        const state=globalThis.__bound102,key='bindings',at=state.cursors[key]??0;state.cursors[key]=at+1;const tape=state.tapes[key]??=[];
        if(state.replay){for(let i=0;i<children.length;i++)node.childEntries.push({...tape[at][i],node:children[i]});return;}
        const begin=node.childEntries.length;(()=>${original})();tape[at]=node.childEntries.slice(begin);
      }`);
    }
    if (variant === 'assembly-first-empty-hints' && file.endsWith('/assembleObject.ts')) {
      return bodyTransform(source, file, 'assembleObject', original => `{
        if(node.local===undefined&&node.extras===undefined&&getStaticChoices(node.schema).propertyKeys.length===0){
          const entries=node.blueprintNode.childEntries;let eligible=entries.length===children.length;
          for(let i=0;eligible&&i<children.length;i++)if(children[i].name!==entries[i].name)eligible=false;
          if(eligible){const result={},names=[];for(let i=0;i<children.length;i++){const child=children[i];if(child.emit!==undefined){names.push(child.name);writeObjectKey(result,child.name,child.emit);}}
            STABLE_SHAPES.set(node,{children,schema:node.schema,extras:node.extras,names});objectKeyCounts.set(result,names.length);return result;}
        }
        return(()=>${original})();
      }`);
    }
    if (variant === 'choices-replay' && file.endsWith('/getStaticChoices.ts')) return tapeBody(source, file, 'getStaticChoices');
    if (variant === 'entries-replay' && file.endsWith('/getStaticObjectEntries.ts')) return tapeBody(source, file, 'getStaticObjectEntries');
    if (variant === 'watched-tokens' && file.endsWith('/getDependencyIndex.ts')) {
      source = bodyTransform(source, file, 'add', original => `{
        let memo=WATCH_TOKENS107.get(this);if(!memo)WATCH_TOKENS107.set(this,memo=new Map());
        const tokens=(value)=>{let parts=memo.get(value);if(!parts)memo.set(value,parts=value.split('/'));return parts;};
        ${original.slice(1, -1).replaceAll("watchedPath.split('/')", 'tokens(watchedPath)')}
      }`, 'DependencyIndex');
      return source + '\nconst WATCH_TOKENS107=new WeakMap();\n';
    }
    if (variant === 'types-replay' && file.endsWith('/resolveNodeTypes.ts')) return tapeBody(source, file, 'resolveNodeTypes');
    if (variant === 'declarations-replay' && file.endsWith('/collectDeclarations.ts')) {
      return bodyTransform(source, file, 'collectDeclarations', original => `{
        const state=globalThis.__bound102;
        if(state.collectDepth)return(()=>${original})();
        const key='declarations',at=state.cursors[key]??0;state.cursors[key]=at+1;const tape=state.tapes[key]??=[];
        if(state.replay){const held=tape[at];if(!held)throw new Error('Declaration tape exhausted');
          for(const fragment of held.fragments)context.fragments.push({...fragment,children:[...fragment.children]});
          if(input.fragment&&held.fragments[0])input.fragment.children.push(held.fragments[0].id);
          context.declarationId=held.nextId;Object.assign(context.capabilities,held.capabilities);
          if(held.owners)context.declarationOwners=held.owners;if(held.branches)context.discriminatorBranches=held.branches;
          for(const declaration of held.declarations)result.push(declaration);return result;}
        const begin=context.fragments.length,before=result.length;state.collectDepth=1;
        const output=(()=>${original})();state.collectDepth=0;
        tape[at]={declarations:result.slice(before),fragments:context.fragments.slice(begin).map(f=>({...f,children:[...f.children]})),nextId:context.declarationId,capabilities:{...context.capabilities},owners:context.declarationOwners,branches:context.discriminatorBranches};return output;
      }`);
    }
    if (variant === 'membership-once' && file.endsWith('/buildNodes.ts')) {
      const a = source.indexOf('    const ownedDeclarations = [];'), b = source.indexOf('    const node: MutableNode', a);
      assert(a >= 0 && b > a);
      const block = source.slice(a, b), loop = block.slice(block.indexOf('    for (let item'));
      return source.slice(0, a) + "    const direct=group.declarations.length===1&&group.declarations[0].context==='conjunction';\n    const ownedDeclarations=direct?group.declarations:[];const conjunctions=direct?group.declarations:[];\n    if(!direct){\n" + loop + '    }\n' + source.slice(b);
    }
    if (variant === 'key-single-json' && file.endsWith('/getTemplateKey.ts')) {
      return bodyTransform(source, file, 'getTemplateKey', original => `{
        if(inputs.length===1&&inputs[0].gates.length===0){const input=inputs[0],schema=readSchemaObject(input.schema);
          const location=typeof schema.$ref==='string'&&Object.keys(schema).length===1?resolveReference(context,schema.$ref,input.schemaPath).schemaPath:input.schemaPath;
          const key=JSON.stringify([[location,input.context,[]]]);return {key,boundKey:JSON.stringify([key,[[]]])};}
        return(()=>${original})();
      }`);
    }
    if (variant === 'choices-default' && file.endsWith('/getStaticChoices.ts')) {
      source += '\nconst DEFAULT_CHOICES107=Object.freeze({omitEmpty:true,omitTrailing:false,trim:false,propertyKeys:NO_KEYS});\n';
      return once(source, '  const choices: StaticChoices = Object.freeze({', '  if(!hints){CHOICES.set(effective,DEFAULT_CHOICES107);return DEFAULT_CHOICES107;}\n  const choices: StaticChoices = Object.freeze({');
    }
    if (variant === 'key-single-json' || variant === 'membership-once' || variant === 'choices-default' || variant === 'encode-native' ||
        variant === 'build-own-replay' || variant === 'child-input-literal' || variant === 'child-own-replay' || variant === 'assembly-first-empty-hints' ||
        variant === 'choices-replay' || variant === 'entries-replay' || variant === 'types-replay' || variant === 'declarations-replay' || variant === 'template-replay' || variant === 'watched-tokens') return source;
    return transform105(file, source, variant);
  }
}
