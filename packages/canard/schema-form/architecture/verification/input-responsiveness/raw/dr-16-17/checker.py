import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).parent
ROOT = Path.cwd()
LEDGER_BASE = "61457653ae19dfb1f11b97e29355fa3cd6af8f24"
BASE = '960bcd79a09c2d54a1f0e0585f3ba3544a287e34'

def read(name):
    return json.loads((OUT/name).read_text())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def assertions(reports):
    return [(project, result, case) for project, report in reports.items()
            for result in report['testResults'] for case in result.get('assertionResults', [])]

def match_case(rows, criterion, project):
    found = [(result, case) for name, result, case in rows if name == project
             and result['name'].endswith(criterion['file']) and case['fullName'] == criterion['title']]
    assert len(found) == 1, (criterion['id'], project, 'missing or duplicate case', len(found))
    return found[0]

def check_matrix(name, green):
    evidence = read(name)
    criteria = read('criteria.json')
    assert evidence['base'] == BASE
    assert evidence['criteriaHash'] == digest(OUT/'criteria.json')
    assert set(evidence['projects']) == {'unit', 'render', 'react18'}
    rows = assertions(evidence['projects'])
    ids = {c['id'] for c in criteria['cases']}
    assert set(criteria['requiredIds']) <= ids
    assert len(ids) == len(criteria['cases'])
    for criterion in criteria['cases']:
        for project in criterion['projects']:
            if not green and criterion['base'] == 'missing-new-symbol':
                files = [r for r in evidence['projects'][project]['testResults'] if r['name'].endswith(criterion['file'])]
                assert len(files) == 1 and files[0]['status'] == 'failed', criterion['id']
                assert 'forEachFailureLeaf' in files[0].get('message', ''), criterion['id']
                continue
            _, case = match_case(rows, criterion, project)
            expected = 'passed' if green or criterion['base'] == 'passed' else 'failed'
            assert case['status'] == expected, (criterion['id'], project, case['status'], expected)
            if expected == 'failed':
                message = '\n'.join(case.get('failureMessages', []))
                assert re.search(criterion['failurePattern'], message, re.S), (criterion['id'], message[:250])
    if green:
        assert all(d['success'] and d['numFailedTests'] == 0 for d in evidence['projects'].values())
    else:
        for file, actual in evidence['productionHashes'].items():
            expected = hashlib.sha256(subprocess.check_output(['git', 'show', BASE+':'+file], cwd=ROOT)).hexdigest()
            assert actual == expected, file

def gate_one():
    check_matrix('red.json', False)

def gate_two():
    check_matrix('green-restored.json', True)

def gate_three():
    criteria = read('criteria.json')
    mutations = read('mutations.json')
    assert {m['id'] for m in mutations} == {m['id'] for m in criteria['mutations']}
    for requirement in criteria['mutations']:
        mutation = next(m for m in mutations if m['id'] == requirement['id'])
        assert mutation['beforeHashes'] == mutation['restoredHashes']
        assert mutation['changedHashes'] != mutation['beforeHashes']
        reports = {p: read(f) for p, f in mutation['reports'].items()}
        failed = {case['fullName'] for _, _, case in assertions(reports) if case['status'] == 'failed'}
        assert set(requirement['failedTitles']) <= failed, (requirement['id'], failed)
        assert any(not result['success'] for result in reports.values()), requirement['id']
    gate_two()
    gate_review()

def gate_review():
    criteria = read("review-criteria.json")
    red = read("review-red.json")
    assert red["numFailedTests"] == 8 and red["numPassedTests"] == 2
    final = assertions(read("green-restored.json")["projects"])
    red_rows = assertions({"unit": red})
    for case in criteria["cases"]:
        assert match_case(red_rows, case, "unit")[1]["status"] == "failed"
        assert match_case(final, case, "unit")[1]["status"] == "passed"
    mutations = read("review-mutations.json")
    assert len(mutations) == 2
    for req in criteria["mutations"]:
        m = next(x for x in mutations if x["id"] == req["id"])
        assert m["beforeHashes"] == m["restoredHashes"] and m["beforeHashes"] != m["changedHashes"]
        failed = {c["fullName"] for _, _, c in assertions({x: read(f) for x, f in m["reports"].items()}) if c["status"] == "failed"}
        assert set(req["failedTitles"]) <= failed
    sinks = [c for _, _, c in final if c["fullName"].startswith("DR-17 review preserves sink exceptions")]
    assert len(sinks) == 2 and all(c["status"] == "passed" for c in sinks)

def gate_four():
    comparison = read('ledger-comparison.json')
    before, after = read('ledger-base/summary.json'), read('ledger-final/summary.json')
    assert len(before) == len(after) == 26
    assert {r['check'] for r in before} == {r['check'] for r in after}
    assert comparison['unexplainedRegressions'] == []
    for row in after:
        old = next(r for r in before if r['check'] == row['check'])
        assert row['exit'] == 0 or row['exit'] == old['exit'], row['check']
        assert (OUT/'ledger-final'/(row['check']+'.log')).exists()
    fca = read('fca-comparison.json')
    assert fca['baseCommit'] == LEDGER_BASE
    assert fca['newSemanticFindings'] == [] and fca['newDiagnostics'] == []
    records = read('record-evidence.json')
    assert records['supplementTargets'] == ['ERROR-008','ERROR-019','ERROR-028','EVENT-046']
    assert records['supInsertExit'] == 0 and records['ownerQuote75Verbatim']
    assert records['currentSpecFiles'] and records['writeRetentionReasonPresent']

def gate_five():
    evidence = read('handoff.json')
    assert evidence['base'] == LEDGER_BASE and evidence['versionUnchanged']
    assert evidence['addedMachinePathHits'] == []
    commit = subprocess.check_output(['git','show','-s','--format=%H%n%an <%ae>%n%B','HEAD'],cwd=ROOT,text=True)
    head, author, message = commit.split('\n', 2)
    assert author.startswith('Vincent Kelvin <')
    assert not re.search(r'(?im)^(?:co-authored-by|.*session.*):', message)
    body = (OUT.parent/'460-briefs/dr-16-17-pr-body.md').read_text()
    links = re.findall(r'\]\((https?://[^)]+)\)', body)
    assert links and all(url.startswith('https://github.com/vincent-kk/albatrion/blob/'+head+'/') for url in links)
    assert not subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True)

def gate_six():
    evidence = read('gate-executions.json')
    assert all(row['exit'] == 0 for row in evidence)
    projects = ['unit','render','react18','storybook','production','verify-unit','verify-render']
    for project in projects:
        d = read('gates/'+project+'.json')
        assert d['success'] and d['numFailedTests'] == 0 and d['numPassedTests'] > 0
        assert all(r['status'] != 'failed' for r in d['testResults'])
    model = read('gates/import-model.json')
    assert model['success'] and model['numFailedTests'] == 0
    build = (OUT/'gates/build.log').read_text()
    assert 'DEVELOPMENT_FLAG_OK' in build and build.count('GATE_SELECTION_DIST_OK') == 3
    assert not (OUT/'gates/lint.log').read_text().strip()

gate = sys.argv[1]
functions = {'G1':gate_one,'G2':gate_two,'G3':gate_three,'G4':gate_four,'G5':gate_five,'G6':gate_six}
markers = {'G1':'G1_RED_MATRIX_OK','G2':'G2_FOCUSED_GREEN_OK','G3':'G3_MUTATIONS_OK','G4':'G4_CONTRACT_RECORDS_OK','G5':'G5_HANDOFF_OK','G6':'G6_FULL_GATES_OK'}
functions[gate]()
print(markers[gate])
