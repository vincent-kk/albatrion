from pathlib import Path
import json,subprocess,hashlib
p=Path(__file__).parent
cases=[]
def reject(name,file,change):
 path=p/file;before=path.read_bytes()
 try:
  path.write_text(change(before.decode()))
  r=subprocess.run(['python3',str(p/'check.py'),'G4'],capture_output=True,text=True)
  assert r.returncode!=0 and 'AM16_RECORDS_OK' not in r.stdout,name
  cases.append({'name':name,'exit':r.returncode,'markerAbsent':True})
 finally:
  path.write_bytes(before)
  assert hashlib.sha256(path.read_bytes()).digest()==hashlib.sha256(before).digest()
reject('raw FCA new diagnostic','fca-final-scan.json',lambda text:json.dumps({**json.loads(text),'diagnostics':json.loads(text)['diagnostics']+[{'code':'am16-negative-control','path':'<checkout>','message':'must reject'}]}))
reject('raw supplement count mismatch','ledger-final/sup.log',lambda text:text.replace('quotes 3650','quotes 3649'))
(p/'checker-negative.json').write_text(json.dumps(cases,indent=2))
print('RAW_CHECKER_NEGATIVE_OK cases='+str(len(cases)))
