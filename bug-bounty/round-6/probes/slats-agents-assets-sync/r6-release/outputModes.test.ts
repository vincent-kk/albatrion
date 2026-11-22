// Loaded by Vitest; the installed bin must apply identical plans in both output modes.
import { expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const bin=resolve(process.cwd(),'bin/inject-agents-settings.mjs');
function files(root:string, here=root):Record<string,string> {
 const output:Record<string,string>={};
 for(const e of readdirSync(here,{withFileTypes:true})) {
  if(e.name==='node_modules'||e.name==='.git')continue;
  const path=join(here,e.name);
  if(e.isDirectory())Object.assign(output,files(root,path));
  else output[relative(root,path)]=readFileSync(path,'utf8');
 }
 return output;
}
for(const [label,name,body] of [
 ['LF','plain.md','# Policy\nUse meaningful names.\n'],
 ['BOM-CRLF','plain.md','\uFEFF# Policy\r\nUse meaningful names.\r\n'],
 ['NFC','caf\u00e9.md','# Policy\nUse meaningful names.\n'],
 ['NFD','cafe\u0301.md','# Policy\nUse meaningful names.\n'],
 ['percent-name','rule%20name.md','# Policy\nUse meaningful names.\n'],
] as const) it(`${label}: plain and JSON writes and second-run idempotence agree`,()=>{
 const scratch=mkdtempSync(join(tmpdir(),'r6-release-cli-'));
 try {
  const states=[];
  for(const mode of ['plain','json']) {
   const root=join(scratch,mode);const pkg=join(root,'node_modules/release-fixture');
   mkdirSync(join(pkg,'agents/rules'),{recursive:true});mkdirSync(join(pkg,'agents/skills/release-skill'),{recursive:true});mkdirSync(join(root,'.git'));
   writeFileSync(join(root,'AGENTS.md'),'# Existing guidance\n');
   writeFileSync(join(pkg,'package.json'),JSON.stringify({name:'release-fixture',version:'1.0.0',agents:{assetPath:'agents'}}));
   writeFileSync(join(pkg,'agents/rules',name),body);
   writeFileSync(join(pkg,'agents/skills/release-skill/SKILL.md'),'---\nname: release-skill\ndescription: Test fixture.\n---\n# Fixture\n');
   const args=[bin,'--package=release-fixture','--agent=codex','--scope=project','--root',root,'--no-interactive',...(mode==='json'?['--json']:[])];
   const run=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:30000,env:{...process.env,NO_COLOR:'1'}});
   expect({status:run.status,stderr:run.stderr},run.stdout).toEqual({status:0,stderr:''});
   if(mode==='json') {const report=JSON.parse(run.stdout);expect(report.exitCode).toBe(0);expect(report.units).toHaveLength(1);expect(report.errors).toEqual([]);}
   expect(existsSync(join(root,'.agents/skills/release-skill/SKILL.md'))).toBe(true);
   const first=files(root);
   expect(first['AGENTS.md']).toContain(body.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').trim());
   const again=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:30000,env:{...process.env,NO_COLOR:'1'}});
   expect(again.status,again.stderr).toBe(0);expect(files(root)).toEqual(first);
   states.push(first);
  }
  expect(states[0]).toEqual(states[1]);
 } finally {rmSync(scratch,{recursive:true,force:true});}
},120000);

for(const args of [[],['--unknown-flag'],['--package=missing-fixture','--agent=codex','--scope=project'],['--package=invalid/name','--agent=codex','--scope=project']]) it(`invalid request ${args.join(' ')} has the same verdict and structured JSON`,()=>{
 const scratch=mkdtempSync(join(tmpdir(),'r6-release-error-'));
 try {
  mkdirSync(join(scratch,'.git'));const results=[];
  for(const mode of ['plain','json']) {
   const run=spawnSync(process.execPath,[bin,...args,'--root',scratch,'--no-interactive',...(mode==='json'?['--json']:[])],{cwd:scratch,encoding:'utf8',timeout:30000});
   results.push(run.status);
   if(mode==='json'){const report=JSON.parse(run.stdout);expect(report.exitCode).toBe(run.status);expect(report.errors.length+report.failures.length).toBeGreaterThan(0);}
  }
  expect(results).toEqual([2,2]);expect(files(scratch)).toEqual({});
 } finally {rmSync(scratch,{recursive:true,force:true});}
},120000);
