import { afterEach, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import ts from 'typescript';
const root=resolve(import.meta.dirname,'../../../../../..');
const roots:string[]=[];
afterEach(()=>{for(const dir of roots.splice(0))rmSync(dir,{recursive:true,force:true});});
it('all ESM public subpaths type-check in Node16, NodeNext and Bundler without React types',()=>{
 const scratch=mkdtempSync(join(tmpdir(),'r6-release-slats-types-'));roots.push(scratch);symlinkSync(join(root,'node_modules'),join(scratch,'node_modules'),'dir');
 const file=join(scratch,'consumer.mts');writeFileSync(file,"export * as root from '@slats/agents-assets-sync';\nexport * as build from '@slats/agents-assets-sync/buildHashes';\nimport type pkg from '@slats/agents-assets-sync/package.json';\ntype Name=typeof pkg.name;\n");
 const issues=[];
 for(const [name,module,moduleResolution] of [['Node16',ts.ModuleKind.Node16,ts.ModuleResolutionKind.Node16],['NodeNext',ts.ModuleKind.NodeNext,ts.ModuleResolutionKind.NodeNext],['Bundler',ts.ModuleKind.ESNext,ts.ModuleResolutionKind.Bundler]] as const){
  const options={strict:true,noEmit:true,skipLibCheck:false,target:ts.ScriptTarget.ES2022,module,moduleResolution,types:['node'],resolveJsonModule:true,esModuleInterop:true};
  const program=ts.createProgram([file],options);const diagnostics=ts.getPreEmitDiagnostics(program);for(const diagnostic of diagnostics)issues.push(name+': '+ts.flattenDiagnosticMessageText(diagnostic.messageText,'\n'));
 }
 expect(issues,JSON.stringify(issues)).toEqual([]);
},120000);
