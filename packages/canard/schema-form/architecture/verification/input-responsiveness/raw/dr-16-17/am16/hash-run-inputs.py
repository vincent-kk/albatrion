from pathlib import Path
import hashlib,json,sys,time
ROOT=Path.cwd()
PKG=ROOT/'packages/canard/schema-form'
mode=sys.argv[1]
if mode=='source':
 files=[p for p in (PKG/'src').rglob('*') if p.is_file()]
 for folder in ['scripts','.storybook']:
  files += [p for p in (PKG/folder).rglob('*') if p.is_file() and 'node_modules' not in p.parts]
 for rel in ['package.json','vite.config.ts','rolldown.config.mjs','tsconfig.json','tsconfig.declarations.json','eslint.config.js']:
  p=PKG/rel
  if p.is_file():files.append(p)
 for rel in ['yarn.lock','package.json','vitest.workspace.ts','.filid/config.json']:
  p=ROOT/rel
  if p.is_file():files.append(p)
else:
 base=PKG/'dist' if mode=='dist' else Path(mode)
 files=[p for p in base.rglob('*') if p.is_file() and (p.name.endswith('.d.ts') or p.name in ['index.mjs','index.node.mjs','index.cjs','agents-hashes.json'])]
data={str(p.relative_to(ROOT) if mode in ['source','dist'] else p.relative_to(base)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files)}
payload=json.dumps(data,sort_keys=True,separators=(',',':')).encode()
if len(sys.argv)>2:Path(sys.argv[2]).write_bytes(payload)
print(json.dumps({'digest':hashlib.sha256(payload).hexdigest(),'count':len(data),'observedAt':int(time.time()*1000)}))
