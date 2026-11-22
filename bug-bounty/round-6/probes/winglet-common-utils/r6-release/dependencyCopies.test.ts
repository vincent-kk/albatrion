// Loaded by Vitest; subprocesses model an application with its own installed AJV copy.
import { expect, it } from 'vitest';
import { cpSync, readFileSync, mkdtempSync, mkdirSync, symlinkSync, writeFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const root=resolve(process.cwd(),'../../..');
for(const [pkg,entry,dialect,ajvEntry] of [
 ['schema-form-ajv6-plugin','.','http://json-schema.org/draft-07/schema#','lib/ajv.js'],
 ['schema-form-ajv7-plugin','.','http://json-schema.org/draft-07/schema#','dist/ajv.js'],
 ['schema-form-ajv8-plugin','.','http://json-schema.org/draft-07/schema#','dist/ajv.js'],
 ['schema-form-ajv8-plugin','./2019','https://json-schema.org/draft/2019-09/schema','dist/2019.js'],
 ['schema-form-ajv8-plugin','./2020','https://json-schema.org/draft/2020-12/schema','dist/2020.js'],
]) for(const format of ['import','require']) it(`${pkg}${entry}: ${format} accepts an application-owned AJV installation`,()=>{
 const scratch=mkdtempSync(join(tmpdir(),'r6-release-ajv-'));
 try {
  const path=join(root,'packages/canard',pkg);
  const require=createRequire(join(path,'package.json'));
  const ajvRoot=dirname(require.resolve('ajv/package.json'));
  const manifest=JSON.parse(readFileSync(join(path,'package.json'),'utf8'));
  const branch=manifest.exports[entry][format];
  const target=join(path,typeof branch==='string'?branch:branch.default);
  const installed=join(scratch,'node_modules/ajv');mkdirSync(dirname(installed),{recursive:true});cpSync(ajvRoot,installed,{recursive:true});
  const dependencies=JSON.parse(readFileSync(join(ajvRoot,'package.json'),'utf8')).dependencies;
  for(const name of Object.keys(dependencies)) {
   const dependencyRoot=dirname(require.resolve(name+'/package.json'));
   const link=join(scratch,'node_modules',name);mkdirSync(dirname(link),{recursive:true});symlinkSync(dependencyRoot,link,'dir');
  }
  const script=`
   import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';
   const require=createRequire(import.meta.url);
   const raw=require('./node_modules/ajv/${ajvEntry}');const Ajv=raw.default??raw;
   const plugin=${format==='require'?`require(${JSON.stringify(target)})`:`await import(pathToFileURL(${JSON.stringify(target)}).href)`};
   const app=new Ajv({strict:false,allErrors:true});
   const external={$id:'https://example.test/application',type:'string',minLength:3};
   app.addSchema(external);const native=app.getSchema(external.$id);native('x');const previousErrors=native.errors;
   const factory=plugin.createValidator(app);
   const root={$schema:${JSON.stringify(dialect)},$id:'https://example.test/form',type:'object',properties:{value:{$ref:external.$id+'#'}}};
   const validate=factory.compile(root);
   const issues=await validate({value:'x'});const ok=await validate({value:'valid'});
   const guard=factory.compileGuard({type:'object',properties:{flag:{const:true}}},'');
   const guardResult=guard({flag:true});
   factory.release(root);
   const result={issueCount:issues?.length,ok,nativeKept:app.getSchema(external.$id)===native,errorsKept:native.errors===previousErrors,rootPrivate:app.getSchema(root.$id)===undefined,guardResult};
   console.log(JSON.stringify(result));
  `;
  const runner=join(scratch,'app.mjs');writeFileSync(runner,script);
  const result=spawnSync(process.execPath,['--no-experimental-require-module',runner],{encoding:'utf8',timeout:90000});
  expect({status:result.status,stderr:result.stderr,stdout:result.stdout.trim()}).toEqual({status:0,stderr:'',stdout:JSON.stringify({issueCount:1,ok:null,nativeKept:true,errorsKept:true,rootPrivate:true,guardResult:true})});
 } finally {rmSync(scratch,{recursive:true,force:true});}
},120000);
