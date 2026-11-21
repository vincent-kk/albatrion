import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '../../../../../..');
const packages = readdirSync(join(root, 'packages')).flatMap(group => readdirSync(join(root, 'packages', group)).map(name => join(root, 'packages', group, name))).filter(dir => existsSync(join(dir, 'package.json'))).map(dir => ({dir, manifest: JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))})).filter(p => !p.manifest.private);
const leaves = (value: unknown): string[] => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.entries(value).filter(([key]) => key !== 'source').flatMap(([,v]) => leaves(v)) : [];
describe('published release artifacts', () => {
 it('all publish export targets exist, including declaration conditions and bins', () => {
  const missing = packages.flatMap(({dir,manifest}) => [...leaves(manifest.publishConfig?.exports ?? manifest.exports), ...Object.values(manifest.bin ?? {}) as string[]].filter(target => !existsSync(join(dir,target))).map(target => `${manifest.name}: ${target}`));
  expect(missing).toEqual([]);
 });
 it('every import/require address loads with matching public export names', () => {
  const script = `import {createRequire} from 'node:module';const req=createRequire(import.meta.url);req.extensions['.css']=()=>{};const p=JSON.parse(process.env.PROBE_PACKAGES);let issues=[];for(const m of p)for(const [key,value] of Object.entries(m.exports)){if(typeof value==='string'||!value.require&&!value.node?.require)continue;const a=m.name+(key==='.'?'':key.slice(1));try{const esm=await import(a);const cjs=req(a);const e=Object.keys(esm).sort();const c=Object.keys(cjs).sort();if(JSON.stringify(e)!==JSON.stringify(c))issues.push({a,e,c});}catch(error){issues.push({a,error:String(error)});}}console.log(JSON.stringify(issues));`;
  const out = execFileSync(process.execPath,['--input-type=module','-e',script], {cwd:root,encoding:'utf8',env:{...process.env,PROBE_PACKAGES:JSON.stringify(packages.map(p=>p.manifest))},maxBuffer:4e6});
  expect(JSON.parse(out), out).toEqual([]);
 },120000);
 it('all published import specifiers have equivalent ESM URL loading', () => {
  const script = `import {pathToFileURL} from 'node:url';import {createRequire} from 'node:module';const req=createRequire(import.meta.url);req.extensions['.css']=()=>{};const p=JSON.parse(process.env.PROBE_PACKAGES);let issues=[];for(const m of p)for(const [key,value] of Object.entries(m.exports)){if(typeof value==='string'||!value.import&&!value.node?.import)continue;const a=m.name+(key==='.'?'':key.slice(1));try{const url=import.meta.resolve(a);const one=await import(a);const two=await import(url);if(one!==two)issues.push(a);}catch(e){issues.push({a,error:String(e)});}}console.log(JSON.stringify(issues));`;
  const out=execFileSync(process.execPath,['--input-type=module','-e',script],{cwd:root,encoding:'utf8',env:{...process.env,PROBE_PACKAGES:JSON.stringify(packages.map(p=>p.manifest))},maxBuffer:4e6});
  expect(JSON.parse(out), out).toEqual([]);
 },120000);
});
