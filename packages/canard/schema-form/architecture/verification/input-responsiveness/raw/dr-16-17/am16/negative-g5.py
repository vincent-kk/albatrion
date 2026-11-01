from pathlib import Path
import json,subprocess,hashlib
p=Path(__file__).parent
def run():
 return subprocess.run(['python3',str(p/'check.py'),'G5'],capture_output=True,text=True)
positive=run()
assert positive.returncode==0 and 'AM16_FULL_OK' in positive.stdout,positive.stderr
records=[]
def reject(name,file,change):
 path=p/file;before=path.read_bytes()
 try:
  path.write_text(change(before.decode()))
  r=run()
  assert r.returncode!=0 and 'AM16_FULL_OK' not in r.stdout,name
  records.append({'name':name,'exit':r.returncode,'markerAbsent':True})
 finally:
  path.write_bytes(before)
  assert hashlib.sha256(path.read_bytes()).digest()==hashlib.sha256(before).digest()
def row_change(text,field,value):
 data=json.loads(text)
 data[3][field]=value(data[3][field])
 return json.dumps(data)
reject('wrong per-command source digest','gate-executions.json',lambda text:row_change(text,'sourceBefore',lambda d:{**d,'digest':'0'*64}))
reject('wrong command project','gate-executions.json',lambda text:row_change(text,'cmd',lambda cmd:cmd.replace('--project unit','--project render')))
reject('overlapping command times','gate-executions.json',lambda text:row_change(text,'started',lambda _:0))
def corrupt_manifest(text):
 data=json.loads(text);data[next(iter(data))]='0'*64;return json.dumps(data)
reject('wrong declaration/build input hash','dist-inputs.json',corrupt_manifest)
final=run()
assert final.returncode==0 and 'AM16_FULL_OK' in final.stdout,final.stderr
(p/'checker-negative-g5.json').write_text(json.dumps(records,indent=2))
print('SOURCE_BOUND_CHECKER_NEGATIVE_OK cases='+str(len(records)))
