from pathlib import Path
import json,hashlib,subprocess,re,gzip,sys
ROOT=Path.cwd()
OUT=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).parent
BASE='d68072d1ac7c2d01854bc22b82fecae8598a5db4'
STAGE='61457653ae19dfb1f11b97e29355fa3cd6af8f24'
def read(name):return json.loads((OUT/name).read_text())
def rows(reports):
 return [(project,f,c) for project,d in reports.items() for f in d['testResults'] for c in f.get('assertionResults',[])]
def case(rows,spec,project='unit'):
 found=[c for p,f,c in rows if p==project and f['name'].endswith(spec['file']) and c['fullName']==spec['title']]
 assert len(found)==1,(spec['id'],project,len(found))
 return found[0]
def G1():
 c=read('criteria.json');d=read('red.json');p=read('red-provenance.json')
 assert p['exit']==1 and not d['success']
 assert p['logHash']==hashlib.sha256((OUT/'red.log').read_bytes()).hexdigest()
 for f,h in p['testHashes'].items():assert hashlib.sha256((ROOT/'packages/canard/schema-form'/f).read_bytes()).hexdigest()==h
 assert p['base']==BASE and p['criteriaHash']==hashlib.sha256((OUT/'criteria.json').read_bytes()).hexdigest()
 for f,h in p['productionHashes'].items():
  assert h==hashlib.sha256(subprocess.check_output(['git','show',BASE+':'+f],cwd=ROOT)).hexdigest(),f
 r=rows({'unit':d})
 for spec in c['newCases']:
  actual=case(r,spec)
  assert actual['status']==spec['base'],(spec['id'],actual['status'],spec['base'])
  if actual['status']=='failed':assert re.search(spec['failurePattern'],'\n'.join(actual['failureMessages']),re.S),spec['id']
 assert d['numFailedTests']==sum(s['base']=='failed' for s in c['newCases'])
 assert all(s['status'] in ['passed','failed'] for _,_,s in r)
def G2():
 c=read('criteria.json');d=read('green.json');r=rows(d)
 assert set(d)=={'unit','render','react18'}
 assert all(p['success'] and p['numFailedTests']==0 for p in d.values())
 for spec in c['newCases']:assert case(r,spec)['status']=='passed',spec['id']
 for spec in c['legacyCases']:
  assert case(r,spec,spec['project'])['status']==spec['expected'],spec['title']
def G3():
 c=read('criteria.json');ms=read('mutations.json')
 assert {m['id'] for m in ms}=={m['id'] for m in c['mutations']}
 for req in c['mutations']:
  m=next(m for m in ms if m['id']==req['id'])
  assert m['beforeHashes']==m['restoredHashes'] and m['beforeHashes']!=m['changedHashes']
  rs={p:read(f) for p,f in m['reports'].items()}
  failed={s['fullName'] for _,_,s in rows(rs) if s['status']=='failed'}
  assert set(req['failedTitles'])<=failed,(req['id'],failed)
  if req.get('onlyFailedTitles'):assert failed==set(req['failedTitles']),req['id']
 snap=read('source-snapshot.json')
 defs={d['id']:d for d in read('mutation-definitions.json')}
 for m in ms:
  assert all(x!=0 for x in m['exits'].values())
  assert set(m['exits'])==set(m['reports'])
  expected={f:v['sha256'] for f,v in snap.items()}
  assert m['beforeHashes']==expected
  changed=dict(expected);definition=defs[m['id']]
  changed[definition['path']]=hashlib.sha256((definition['after'].rstrip()+chr(10)).encode()).hexdigest()
  assert changed==m['changedHashes']
 source_matches()
 G2()
def git(*args):
 return subprocess.check_output(['git',*args],cwd=ROOT,text=True)
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def source_matches():
 snap=read('source-snapshot.json')
 for path,d in snap.items():
  assert hashlib.sha256(d['text'].encode()).hexdigest()==d['sha256'],path
  assert digest(ROOT/path)==d['sha256'],path
 return {p:d['sha256'] for p,d in snap.items()}
def normalized_log(text,base,final):
 return text.replace(str(base),'<ledger-output>').replace(str(final),'<ledger-output>')
def G4():
 from collections import Counter
 pkg=ROOT/'packages/canard/schema-form'
 rel='packages/canard/schema-form/architecture/reviews/defect-round.md'
 before=git('show',BASE+':'+rel).splitlines()
 current=(ROOT/rel).read_text().splitlines()
 expected=[l.replace('소유자의 후속 답변에 따라','코디네이터 판정에 따라') for l in before]
 assert current[:len(before)]==expected
 assert [current[i-1] for i in [82,85]]==[before[i-1] for i in [82,85]]
 assert '소유자의 후속 답변에 따라' not in '\n'.join(current)
 for rel in ['src/core/DETAIL.md','src/errors/DETAIL.md']:
  old=git('show',STAGE+':packages/canard/schema-form/'+rel)
  ref=next(l for l in old.splitlines() if l.startswith('계약 기준:'))
  actual=(pkg/rel).read_text()
  assert '## Last Updated\n\n2026-11-02\n\n'+ref in actual,rel
 plan=read('sup-plan.json')
 assert len(plan)==2 and {x['code'] for x in plan}=={'DR16C-02','DR17C-02'}
 expected_lines={}
 for item in plan:
  line=current[item['line']-1]
  assert line.startswith('  - 【추론】 ')
  decision=line.strip()[2:]
  supplement='  > 편집자 결정('+item['code']+'): "'+decision+'" (`reviews/defect-round.md:'+str(item['line'])+'`)'
  for target in item['targets']:
   file,code=target.split(':')
   content=(pkg/'architecture'/file).read_text()
   start=content.index('### '+code+' ')
   end=content.find('\n### ',start+1)
   assert supplement in content[start:end if end>=0 else None]
   expected_lines.setdefault(file,[]).append(supplement)
 for file,lines in expected_lines.items():
  text=(pkg/'architecture'/file).read_text()
  for line,count in Counter(lines).items():assert text.count(line)==count
  restored='\n'.join(l for l in text.split('\n') if l not in lines)
  assert restored==git('show',BASE+':packages/canard/schema-form/architecture/'+file),file
 detail=(pkg/'src/providers/FormErrorContext/DETAIL.md').read_text()
 assert 'Unable to inspect captured failure' in detail and '바깥 실패의 code·message·details는 기존대로 보존' in detail
 assert '1,000,000' in detail
 olddir=OUT/'baseline/ledger-base';newdir=OUT/'ledger-final'
 a,b=read('ledger-final/summary.json'),read('baseline/ledger-base/summary.json')
 assert len(a)==len(b)==26 and [x['check'] for x in a]==[x['check'] for x in b]
 for old,new in zip(b,a):
  assert old['exit']==new['exit']==0,new['check']
  oldlog=normalized_log((olddir/(old['check']+'.log')).read_text(),olddir,newdir)
  newlog=normalized_log((newdir/(new['check']+'.log')).read_text(),olddir,newdir)
  if new['check']=='sup':
   x=re.search(r'quotes (\d+), not verbatim at cited lines 0, unparsed 0',oldlog)
   y=re.search(r'quotes (\d+), not verbatim at cited lines 0, unparsed 0',newlog)
   assert x and y and int(y[1])-int(x[1])==10
  else:assert oldlog==newlog,new['check']
 for kind in ['scan','validate','verification']:
  old=read('baseline/fca-base-'+kind+'.json');new=read('fca-final-'+kind+'.json')
  def normalized(items,root):
   return Counter(json.dumps(x,sort_keys=True,ensure_ascii=False).replace(root,'<checkout>') for x in items)
  def findings(d):
   if kind=='scan':return []
   return d['data']['result']['violations'] if kind=='validate' else d['data']['violations']
  assert not (normalized(findings(new),new['projectRoot'])-normalized(findings(old),old['projectRoot'])),kind
  assert not (normalized(new['diagnostics'],new['projectRoot'])-normalized(old['diagnostics'],old['projectRoot'])),kind
 hashes=[read('fca-final-'+k+'.json')['summary']['snapshotHash'] for k in ['scan','validate','verification']]
 assert len(set(hashes))==1
def G5():
 from collections import Counter
 inputs=read('source-inputs.json')
 input_digest=digest(OUT/'source-inputs.json')
 assert len(inputs)>1000
 required=list(read('source-snapshot.json'))+['packages/canard/schema-form/'+c['file'] for c in read('criteria.json')['newCases']]
 assert all(p in inputs for p in required)
 for path,h in inputs.items():assert digest(ROOT/path)==h,path
 execs=read('gate-executions.json')
 names=['lint','typecheck','build','unit','render','react18','storybook','production','verify-unit','verify-render','import-model']
 assert len(execs)==len(names)
 previous=0
 for name,row in zip(names,execs):
  assert row['exit']==0 and row['log']=='gates/'+name+'.log',name
  before,after=row['sourceBefore'],row['sourceAfter']
  assert before['digest']==after['digest']==input_digest,name
  assert before['count']==after['count']==len(inputs),name
  assert previous<=before['observedAt']<=row['started']<=row['ended']<=after['observedAt'],name
  previous=after['observedAt']
  prefix='yarn workspace @canard/schema-form '
  if name=='lint':expected=prefix+'lint --max-warnings 0'
  elif name in ['typecheck','build']:expected=prefix+name
  elif name=='production':expected=prefix+'test:production --reporter=json --outputFile=<scratch>/gates/production.json'
  elif name=='import-model':expected=prefix+'test --run --project unit src/__tests__/importModel.test.ts --reporter=dot --reporter=json --outputFile=<scratch>/gates/import-model.json'
  else:expected=prefix+'test --run --project '+name+' --reporter=dot --reporter=json --outputFile=<scratch>/gates/'+name+'.json'
  assert row['cmd'].replace(str(OUT),'<scratch>')==expected,name
  if name in names[3:]:
   d=read('gates/'+name+'.json')
   assert row['started']<=d['startTime']<=row['ended'],name
   assert d['success'] and d['numFailedTests']==0 and d['numPassedTests']>0
   counts=Counter(c['status'] for f in d['testResults'] for c in f.get('assertionResults',[]))
   assert counts['passed']==d['numPassedTests'] and counts['failed']==0
   assert counts['todo']==d['numTodoTests'] and counts['pending']+counts['skipped']==d['numPendingTests']
   assert sum(counts.values())==d['numTotalTests']
   assert all(f['status']!='failed' for f in d['testResults'])
 assert not (OUT/'gates/lint.log').read_text().strip()
 build=(OUT/'gates/build.log').read_text()
 assert 'DEVELOPMENT_FLAG_OK' in build and build.count('GATE_SELECTION_DIST_OK')==3
 for line in build.splitlines():
  if line.startswith('GATE_SELECTION_DIST_OK '):
   marker=json.loads(line.split(' ',1)[1])
   p=ROOT/'packages/canard/schema-form/dist'/marker['name']
   assert digest(p)==marker['sha256'] and p.stat().st_size==marker['bytes']
 candidate=ROOT/'packages/canard/schema-form'
 baseline=OUT.parent/'baseline/packages/canard/schema-form'
 for path,h in read('dist-inputs.json').items():assert digest(ROOT/path)==h,path
 for path,h in read('baseline-dist-inputs.json').items():assert digest(baseline/'dist'/path)==h,path
 checker=OUT/'declaration-tool/check-evaluated-public-declarations.mjs'
 command=['node',str(checker),str(baseline),str(candidate),str(OUT/'public-declarations-live.json')]
 start=__import__('time').time()
 result=subprocess.run(command,capture_output=True,text=True)
 assert result.returncode==0 and 'IR6_EVALUATED_DECLARATIONS_OK' in result.stdout,result.stderr
 d=read('public-declarations-live.json')
 assert d['rootExportsEqual'] and not d['semanticDifferences']['added'] and not d['semanticDifferences']['removed']
 assert not d['unsafeRuntimeExposures'] and not d['unresolvedAliases']
 tool_hashes={str(p.relative_to(checker.parent)):digest(p) for p in checker.parent.rglob('*.mjs')}
 record={'command':command,'exit':result.returncode,'started':start,'ended':__import__('time').time(),'stdout':result.stdout,'toolHashes':tool_hashes,'sourceDigest':input_digest,'candidateManifestHash':digest(OUT/'dist-inputs.json'),'baselineManifestHash':digest(OUT/'baseline-dist-inputs.json'),'resultHash':digest(OUT/'public-declarations-live.json')}
 (OUT/'declaration-execution.json').write_text(json.dumps(record,indent=2))
 source_matches()

def G6():
 assert git('show',STAGE+':packages/canard/schema-form/package.json').encode()==(ROOT/'packages/canard/schema-form/package.json').read_bytes()
 diff=git('diff','--unified=0','--no-color',BASE)
 assert not [l for l in diff.splitlines() if l.startswith('+') and not l.startswith('+++') and re.search(r'/(?:Users|private|home)/',l)]
 changes=git('diff','--name-status',BASE).splitlines()
 untracked=git('ls-files','--others','--exclude-standard').splitlines()
 paths=[line.split('\t')[-1] for line in changes]+untracked
 assert all('/dist/' not in p for p in paths)
 added=[line.split('\t')[-1] for line in changes if line.startswith('A\t')]+untracked
 for path in paths:
  p=ROOT/path
  if p.is_file() and (path in added or path.endswith('.gz')):
   data=gzip.decompress(p.read_bytes()) if path.endswith('.gz') else p.read_bytes()
   assert not re.search(rb'/(?:Users|private|home)/',data),path
 source_matches()
 head=git('rev-parse','HEAD').strip()
 assert head!=BASE and subprocess.run(['git','merge-base','--is-ancestor',BASE,head],cwd=ROOT).returncode==0
 identity=git('var','GIT_AUTHOR_IDENT').rsplit('>',1)[0]+'>'
 for commit in git('rev-list',BASE+'..HEAD').splitlines():
  assert git('show','-s','--format=%an <%ae>',commit).strip()==identity
  message=git('show','-s','--format=%B',commit)
  assert not re.search(r'(?im)^(?:co-authored-by|.*session.*):',message)
 assert not git('status','--porcelain')
 body=(OUT.parent.parent/'460-briefs/dr-16-17-pr-body.md').read_text()
 links=re.findall(r'\]\((https?://[^)]+)\)',body)
 assert links and all(x.startswith('https://github.com/vincent-kk/albatrion/blob/'+head+'/') for x in links)


gate=sys.argv[1]
globals()[gate]()
print({'G1':'AM16_RED_OK','G2':'AM16_GREEN_OK','G3':'AM16_MUTATIONS_OK','G4':'AM16_RECORDS_OK','G5':'AM16_FULL_OK','G6':'AM16_HANDOFF_OK'}[gate])
