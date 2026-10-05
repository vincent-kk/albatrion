// Diagnostic artifact builder; reads captured samples and source, never changes product behavior.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory=path.dirname(fileURLToPath(import.meta.url));
const output=path.resolve(directory,'..');
const pkg=path.resolve(output,'../../..');
const repo=path.resolve(pkg,'../../..');
assert.equal(fs.realpathSync(repo),'/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const expectedHead='f8aaa4ed23245450f967878cd96477fa5bae8f96';
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}).trim(),expectedHead);
const read=name=>JSON.parse(fs.readFileSync(path.join(output,name),'utf8'));
const defaultInput=fs.existsSync(path.join(output,'diagnosis-94c03-final2-measurement-summary.json'))
  ? 'diagnosis-94c03-final2-measurement-summary.json' : 'diagnosis-94c03-summary.json';
const summary=read(process.env.REPORT94_INPUT??defaultInput);
const prior=read('verdict-93c01-summary.json');
const alias=fs.existsSync(path.join(output,'diagnosis-94c03-alias-verification-summary.json'))
  ? read('diagnosis-94c03-alias-verification-summary.json') : summary.diagnosis.aliasVerification;
const catalog=new Map(summary.catalog.map(site=>[site.id,site]));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const source=file=>path.join(pkg,'src',file);
const number=(value,places=2)=>value.toFixed(places);
const percent=value=>number(value*100,1)+'%';
const row=(fixture,version,mode)=>summary.rows.find(item=>item.fixture===fixture&&item.version===version&&item.mode===mode);
const census=(fixture,mode='update',version='new')=>summary.censuses.find(item=>item.fixture===fixture&&item.version===version&&item.mode===mode);
const sites=(data,name,phase)=>data.sites.filter(site=>catalog.get(site[0]).name===name&&(!phase||site[1]===phase));
const ids=(name,file)=>summary.catalog.filter(site=>site.name===name&&(!file||site.file.endsWith(file)));
const count=(data,name,file)=>ids(name,file).reduce((sum,site)=>sum+(data.counts[site.id]?.median??0),0);
const loop=(data,file,line)=>summary.catalog.filter(site=>site.kind==='loop'&&site.file.endsWith(file)&&site.line===line)
  .reduce((sum,site)=>sum+(data.counts[site.id]?.median??0),0);
const nodeVisits=(data,name)=>Object.fromEntries(ids(name).flatMap(site=>Object.entries(data.nodeVisits[site.id]?.paths??{})));
const phaseOrder=['mark','compute','derive','transition','commit','delivery'];
const branchless=['sample-0','sample-1','sample-2','sample-3','nested-d3-f4','nested-d5-f4','array-100','computed-visible-derived'];
const branches=['oneOf-5','oneOf-10','oneOf-20','oneOf-40'];
const mounts=[...branchless.filter(name=>name!=='array-100'),'flat-500','oneOf-20','oneOf-40'];
const contextKeys=['changedRaw','dirtyPaths','shapeDirtyPaths','changedNodes','entered','exited','pendingExits','perished',
  'selectedDeclarationIds','automaticLog','stateDirtyNodes','dependencyOwnerPaths'];

// Inclusive groups contain disjoint roots only; nested parents must not be added twice.
const aggregate=(data,selection,inclusive=true)=>{
  const index=inclusive?15:6,correctedIndex=inclusive?18:9,callsIndex=inclusive?11:2;
  const picked=data.sites.filter(site=>selection(catalog.get(site[0]),site[1]));
  const raw=picked.reduce((sum,site)=>sum+site[index],0);
  const corrected=picked.reduce((sum,site)=>sum+site[correctedIndex],0);
  const calls=picked.reduce((sum,site)=>sum+site[callsIndex],0);
  return {fixture:data.fixture,version:data.version,mode:data.mode,inclusive,calls,
    perCallInstrumentationMs:data.calibration.perCallMs.median,rawMeanMs:raw,correctedMeanMs:corrected,
    correctedMeanShare:corrected/data.total.correctedMs.mean,sites:picked.map(site=>({id:site[0],phase:site[1]}))};
};
const namedGroup=(fixture,mode,names,phase)=>aggregate(row(fixture,'new',mode),(site,p)=>names.includes(site.name)&&(!phase||phase===p));
const emptyNames=['runDeriveRounds','transitionSettlement','finalizeExits','snapshotExitedPolicies',
  'commitDeriveRules','commitExitPolicyValues','finalizeDeriveTrace'];
const groups=[];
for(const fixture of branchless.filter(name=>name!=='computed-visible-derived')) {
  groups.push({id:'A-empty',...namedGroup(fixture,'update',emptyNames)});
  groups.push({id:'A-context',...namedGroup(fixture,'update',['getSettlementScratch','createSettlementContext','releaseSettlementScratch'])});
  groups.push({id:'A-dispatch-own',...aggregate(row(fixture,'new','update'),site=>
    ['dispatchSetValue','enterSchemaNodeChain','writeSchemaNode','finishSettlement','exitSchemaNodeChain'].includes(site.name),false)});
}
groups.push({id:'A-derive-rounds',...namedGroup('computed-visible-derived','update',['runDeriveRounds'])});
groups.push({id:'A-derive-evaluation',...namedGroup('computed-visible-derived','update',['evaluateDeriveRound'])});
groups.push({id:'A-derive-dependencies',...namedGroup('computed-visible-derived','update',['registerRecalculation','collectDeriveSourcePaths'])});
for(const fixture of [...branches,'if-then','if-then-guarded']) {
  for(const [id,names]of [['B-registration',['registerRecalculation']],['B-gates',['evaluateGate']],
    ['B-table-and-gates',['selectChildren','selectNodeSchema']],['B-control-layers',['getControlLayers']],
    ['B-pending-reads',['flushPendingGateReads']]])groups.push({id,...namedGroup(fixture,'update',names)});
  groups.push({id:'B-transition-controls',...namedGroup(fixture,'update',['getControlLayers'],'transition')});
  const table=namedGroup(fixture,'update',['selectChildren','selectNodeSchema']);
  const gates=namedGroup(fixture,'update',['evaluateGate']);
  const pending=namedGroup(fixture,'update',['flushPendingGateReads']);
  groups.push({id:'B-table-residual',...table,calls:table.calls-gates.calls-pending.calls,
    rawMeanMs:table.rawMeanMs-gates.rawMeanMs-pending.rawMeanMs,
    correctedMeanMs:table.correctedMeanMs-gates.correctedMeanMs-pending.correctedMeanMs,
    correctedMeanShare:(table.correctedMeanMs-gates.correctedMeanMs-pending.correctedMeanMs)/row(fixture,'new','update').total.correctedMs.mean,
    subtraction:'selectChildren+selectNodeSchema inclusive minus contained gate and pending-read inclusive groups'});
}
for(const fixture of mounts) {
  groups.push({id:'C-output-slots',...namedGroup(fixture,'mount',['assembleStaticFirstNode'])});
  groups.push({id:'C-runtime-merge',...namedGroup(fixture,'mount',['mergeEffectiveSchema'],'creation')});
  groups.push({id:'C-keyword-families',...namedGroup(fixture,'mount',['applyConstraintKeywords'])});
  groups.push({id:'C-gate-read-parse',...namedGroup(fixture,'mount',['collectGateEvaluationReads'])});
  groups.push({id:'C-revisions',...aggregate(row(fixture,'new','mount'),site=>site.name==='constructor'&&site.file.endsWith('/SchemaNodeRevisionLedger.ts'))});
  const creation=namedGroup(fixture,'mount',['createSchemaNode'],'creation');
  const merge=namedGroup(fixture,'mount',['mergeEffectiveSchema'],'creation');
  groups.push({id:'C-node-record',...creation,calls:creation.calls-merge.calls,
    rawMeanMs:creation.rawMeanMs-merge.rawMeanMs,correctedMeanMs:creation.correctedMeanMs-merge.correctedMeanMs,
    correctedMeanShare:(creation.correctedMeanMs-merge.correctedMeanMs)/row(fixture,'new','mount').total.correctedMs.mean,
    subtraction:'createSchemaNode inclusive minus contained runtime mergeEffectiveSchema inclusive'});
  groups.push({id:'C-fixed-mount-own',...aggregate(row(fixture,'new','mount'),site=>
    ['nodeFromJSONSchema','schemaNodeFactory','dispatchMount','enterSchemaNodeChain','exitSchemaNodeChain','runDeliveryWaves',
      'requireRuntimeSchemaNode','buildSchemaNodeTree','finishStaticFirstLoad','initialiseErrorReporter'].includes(site.name),false)});
}
const group=(id,fixture)=>groups.find(item=>item.id===id&&item.fixture===fixture);
const ref=(file,line)=>'`src/'+file+':'+line+'`';
const ledger=(file,id)=>{
  const contents=fs.readFileSync(path.join(pkg,'architecture/ledger',file+'.md'),'utf8').split('\n');
  const line=contents.findIndex(text=>text.startsWith('### '+id+' '))+1;
  assert(line>0,id);
  return {id,file:'architecture/ledger/'+file+'.md',line};
};
const touched={
  branch:[ledger('blueprint','BLUEPRINT-007'),ledger('settle','SETTLE-018'),ledger('settle','SETTLE-020'),ledger('settle','SETTLE-044')],
  delivery:[ledger('event','EVENT-001'),ledger('event','EVENT-007'),ledger('event','EVENT-024'),ledger('settle','SETTLE-006')],
  output:[ledger('value','VALUE-002'),ledger('value','VALUE-013'),ledger('settle','SETTLE-003'),ledger('node','NODE-006')],
  deferredAnalysis:[ledger('blueprint','BLUEPRINT-001'),ledger('blueprint','BLUEPRINT-012'),ledger('blueprint','BLUEPRINT-016'),ledger('node','NODE-029')],
};
const findings=[
  {id:'A1',section:'가',class:'a',title:'기능 없는 단계의 빈 진입·종료',source:[['core/settle/utils/settlement/finishSettlement.ts',33],
    ['core/settle/utils/transition/finalizeExits.ts',20],['core/settle/utils/commit/commitDeriveRules.ts',19]],group:'A-empty',
    spec:'정적 rule 부재 및 entered/exited/perished/array 작업 부재를 증명한 경로에서 빈 helper 호출을 생략한다. 논리적인 phase 순서, commit#, 오류·trace, state와 revision 갱신은 유지한다.',
    estimate:'완전한 빈 그룹의 40–75%를 제거한다고 가정하면 갱신당 약 2.5–6.2 µs; 측정 상한 6.1–8.2 µs. 구현으로 입증한 절감값은 아니다.',ledgerChanges:[]},
  {id:'A2',section:'가',class:'a',title:'context 복사와 사용하지 않은 scratch 정리',source:[['core/settle/utils/settlement/createSettlementContext.ts',22],
    ['core/settle/utils/write/getSettlementScratch.ts',11],['core/settle/utils/write/releaseSettlementScratch.ts',9]],group:'A-context',
    spec:'readonly capability 참조와 호출별 mutable 상태를 분리하고 실제 사용한 작업군만 정리한다. 중첩·재진입 호출의 독립 scratch와 DirtyPathSet의 부모 색인은 보존한다.',
    estimate:'sample-0 측정 묶음의 약 30–60%, 약 2–4 µs. 전체 mark 52%를 없앨 수 있다는 뜻이 아니다.',ledgerChanges:[]},
  {id:'A3',section:'가',class:'a',title:'derived 의존성 등록과 delta 중복',source:[['core/settle/utils/derivation/runDeriveRounds.ts',82],
    ['core/settle/utils/derivation/collectDeriveSourcePaths.ts',10],['core/settle/utils/write/registerRecalculation.ts',19],
    ['core/settle/utils/compute/selectChildren.ts',94]],group:'A-derive-dependencies',
    spec:'누적 changedRaw는 롤백·오류 기록용으로 보존하고, 아직 전파하지 않은 delta만 역색인에 질의한다. 새 자동 쓰기/투영 세대가 생기면 다시 전파한다. derived-only target의 선행 output 계산 생략은 다른 control/gate 독자가 없다는 증명에 한정한다. 마지막 수렴 확인 round와 edge/rank 의미는 유지한다.',
    estimate:'의존성 묶음 약 22 µs 중 15–35%인 약 3–8 µs; target 선행 계산을 추가로 줄이는 몫은 별도 검증 전에는 합산하지 않는다.',ledgerChanges:[]},
  {id:'A5',section:'가',class:'a',title:'단일 scalar 쓰기의 dispatch·chain 호출 준비',source:[['core/dispatch/utils/entry/dispatchSetValue.ts',18],
    ['core/settle/utils/write/writeSchemaNode.ts',59],['core/settle/utils/settlement/finishSettlement.ts',22]],group:'A-dispatch-own',
    spec:'정적 기능 부재·종류가 맞는 terminal 쓰기·구조 변화 없음이 입증된 경로에 한정해 호출 준비를 단순화한다. raw 쓰기, 변경 조상의 output, logical mark→compute→derive→transition→commit 순서, trace/오류·budget 및 listener-independent revision/payload는 그대로 실행한다. chain 재진입 또는 기능 존재 시 일반 경로에 남긴다.',
    estimate:'sample-0의 facade/chain own 잔여 약 29 µs(29.5%)가 넓은 상한이다. guard·budget·onChange 등 필수 작업을 포함하므로 미세 helper 배분의 편향까지 고려해 실제 절감은 0–10 µs의 가설로 둔다. A1/A2와 다른 own span이지만 전체 최적화 절감은 함께 재측정하기 전 합산하지 않는다.',ledgerChanges:[]},
  {id:'A4',section:'가',class:'b',title:'구독자 없을 때 revision/payload를 생략하는 설계',source:[['core/settle/utils/commit/markCommitDeliveries.ts',25],
    ['core/record/utils/SchemaNodeRevisionLedger.ts',18]],spec:'subscriber-only revision/payload 생성을 채택하려면 통지 대상 집합 및 마지막 통지 값의 독자 없는 경우도 계약을 바꿔야 한다. 65C-03에서 이미 기각된 설계로, 이 진단은 재채택하지 않는다.',
    savingCap:'branchless 후속 갱신의 delivery 전체 약 15–21%가 아주 느슨한 상한이며 실제 revision 생성만의 절감은 이보다 작다. commit 전체는 제거할 수 없다.',ledgerChanges:touched.delivery},
  {id:'B1',section:'나',class:'a',title:'dormant leaf의 역의존성·읽기 계획',source:[['core/settle/utils/write/getDependencyIndex.ts',61],
    ['core/settle/utils/write/registerRecalculation.ts',20],['core/settle/utils/gates/flushPendingGateReads.ts',101]],group:'B-registration',
    spec:'공유 fragment gate의 의존성 owner를 실제 평가 host 또는 최저공통조상 L로 색인한다. 독립 leaf controls/derived watch와 wildcard 경로는 그대로 둔다. 읽기 계획은 같은 bound path의 최초 flush 순서를 유지하며 중복 occurrence를 접는다.',
    estimate:'oneOf-40 등록 102 µs 중 branch-5 대비 추가 약 79 µs가 상한. 그 60–90% 제거 가정 시 약 47–71 µs(약 4–6%); pending-read 계획 절감은 겹침을 분리해 재검증한다.',ledgerChanges:[]},
  {id:'B2',section:'나',class:'a',title:'controls 목적별 색인과 활성 ID 배열 재사용',source:[['core/settle/utils/controls/getControlLayers.ts',66],
    ['core/settle/utils/controls/getControlLayers.ts',80],['core/settle/utils/compute/selectNodeSchema.ts',49]],group:'B-control-layers',
    spec:'control key별 정적 contribution 목록을 만들고 선택된 ID에 대해서만 조회한다. node/fragment/children의 우선순위, committed fallback과 상대 경로는 보존한다. active.map 결과를 한 번 만들어 selectedDeclarationIds와 merge에 함께 쓴다.',
    estimate:'getControlLayers의 branch-40−5 추가 비용 중 50–80%가 조건부 추정치. active.map 절감은 함수 자체 시간보다 작으며 독립 span이 없으므로 0–1 µs의 가설로만 기록한다.',ledgerChanges:[]},
  {id:'B3',section:'나',class:'b',title:'전체 fragment 게이트 휠과 선택 테이블',source:[['core/settle/utils/compute/computeNode.ts',118],
    ['core/settle/utils/compute/selectNodeSchema.ts',21],['core/settle/utils/compute/selectChildren.ts',160]],group:'B-table-and-gates',
    spec:'인식 가능한 discriminator/pure read signature를 가진 fragment에 대한 선택 인덱스 또는 선택적 gate 휠을 새 계약으로 제시해야 한다. generic 조건은 같은 /kind 변경으로 모두 영향을 받을 수 있다. 직전 active set을 출발점으로 쓰는 안은 양의 순환·이력 의존 반례를 다시 판정해야 한다. 이 대안에만 추가로 적용되는 원장은 SETTLE-018/044이다.',
    savingCap:'oneOf-40 selectChildren+selectNodeSchema 묶음 약 64%가 전체 제거를 가정한 상한. 그 안의 gate 평가 약 29%는 중복 집계하지 않는다. 8B 중 6B 재평가를 접을 수 있다는 추가 증명하에서는 gate 몫의 75%, 전체 약 22%가 더 좁은 상한이다. 선택적 재평가 자체는 BLUEPRINT-007/SETTLE-020 변경 대상이며, 직전 active set 출발까지 채택하면 SETTLE-018/044도 추가로 바뀐다.',
    ledgerChanges:touched.branch.filter(item=>['BLUEPRINT-007','SETTLE-020'].includes(item.id)),
    conditionalLedgerChanges:touched.branch.filter(item=>['SETTLE-018','SETTLE-044'].includes(item.id))},
  {id:'B4',section:'나',class:'a',title:'같은 bound read의 pending-output flush 계획',source:[['core/settle/utils/gates/flushPendingGateReads.ts',74],
    ['core/settle/utils/gates/flushPendingGateReads.ts',101]],group:'B-pending-reads',
    spec:'READ_PLAN에서 동일한 bound read의 첫 등장 순서를 유지하는 정적 path 목록을 만든다. 같은 flush 호출 중 output을 다시 바꾸지 않는 구간만 접고, 재귀 template·opaque guard·서로 다른 relative host 및 새 projection 세대는 기존 경로에 남긴다. 최초로 관측되는 output의 publication 순서는 유지한다.',
    estimate:'oneOf-40 묶음 94.2 µs(8.0%) 중 branch-5 대비 추가 90.9 µs의 50–80% 제거 가정: 약 45–73 µs(4–6%). B3의 부모 선택 테이블 몫과 겹치므로 구조안 상한에 더하지 않는다.',ledgerChanges:[]},
  {id:'B5',section:'나',class:'a',title:'fragment 테이블의 선택·inactive metadata 준비',source:[['core/settle/utils/compute/selectChildren.ts',146],
    ['core/settle/utils/compute/selectChildren.ts',171]],group:'B-table-residual',
    spec:'gate wheel의 현재 평가와 publication 순서는 그대로 두고, 정적 contribution/entry 관계를 한 번 색인해 gate 이후의 활성 필드 조합 및 실제 raw/latent/live 값이 있는 inactive 필드 처리만 준비한다. authored key 순서와 null·extras·배열 동작을 보존하며 재귀/opaque/복합 control은 기존 경로에 남긴다.',
    estimate:'gate와 pending-read를 뺀 선택 묶음은 oneOf-40 약 313 µs(26.6%)가 느슨한 상한. 그 15–30%를 줄이는 보수적 가정은 약 47–94 µs(4–8%). gate 평가 감소는 B3로 별도 취급하고 이 추정에는 넣지 않는다.',ledgerChanges:[]},
  {id:'C1',section:'다',class:'a',title:'정적·runtime effective schema의 중복 병합',source:[['core/blueprint/utils/analyze/buildNodes.ts',87],
    ['core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts',41],['core/SchemaNode/utils/schemaNodeFactory.ts',46]],group:'C-runtime-merge',
    spec:'ungated이며 정렬된 contribution ID, isAtomic/collect 옵션, 오류·warning 결과가 동등한 경우에만 분석 시 결과를 runtime 생성에 전달한다. 모드별 오류 발생 시점과 동일 활성 집합의 참조 안정성은 보존한다. 조건을 증명하지 못한 node는 기존 경로를 사용한다.',
    estimate:'조건 입증으로 runtime 병합의 40–70%를 재사용한다면 nested-d5 약 1.6–2.7 ms(7–12%), flat-500 약 0.5–1.0 ms(6–11%). 상한은 해당 생성 중 병합 묶음 전체이며 분석 전체가 아니다.',ledgerChanges:[]},
  {id:'C2',section:'다',class:'a',title:'없는 constraint family와 반복 gate 문자열 분석',source:[['core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts',43],
    ['core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts',57],['core/blueprint/utils/analyze/collectGateEvaluationReads.ts',13]],group:'C-keyword-families',
    spec:'기여 스키마에 관련 키워드가 없을 때만 boolean/range/enum/const family를 건너뛴다. draft별 boolean bounds, sticky conflict, enum/type 교차 오류는 그대로 유지한다. gate 문자열의 path 토큰 IR은 compileBlueprintExpressions와 공유하되 절대/상대 경로·구문 의미를 보존한다.',
    estimate:'constraint 묶음의 30–60% 절감 가정: nested-d5 약 0.4–0.8 ms(2–3%), flat-500 약 0.14–0.28 ms(2–3%). oneOf-20 read 토큰 분석 0.336 ms의 30–60%를 줄이면 별도로 약 0.10–0.20 ms(3–6%); IR 공유 조건의 검증이 필요하다.',ledgerChanges:[]},
  {id:'C3',section:'다',class:'b',title:'local/emit 출력 계산을 읽기 시점으로 미루는 설계',source:[['core/settle/utils/load/assembleStaticFirstNode.ts',17],
    ['core/dispatch/utils/chain/exitSchemaNodeChain.ts',102]],group:'C-output-slots',
    spec:'assemble/project 2N 슬롯을 줄이려면 commit 때 output을 준비한다는 계약과 읽기 무계산 원칙을 바꿔야 한다. root onChange가 전체 emit을 읽는 현재 표본에서는 지연 출력이 다시 전부 materialize되어 절감 0이 될 수도 있다.',
    savingCap:'nested-d5·flat-500의 실제 assemble/project+wrapper 묶음 약 5%가 상한. compute 단계 전체 약 16%는 DFS/호출 제어까지 포함한 더 느슨한 상한으로, 2N 자체에 전부 귀속하지 않는다.',ledgerChanges:touched.output},
  {id:'C4',section:'다',class:'b',title:'비활성 fragment 분석의 지연',source:[['core/blueprint/utils/analyze/buildNodes.ts',43],
    ['core/blueprint/utils/analyze/collectDeclarations.ts',27]],spec:'비활성 branch의 정적 분석을 첫 활성화 시점으로 옮기려면 authored schema의 form 생성 시 분석 및 정적 충돌 오류의 발생 시점을 바꿔야 한다.',
    savingCap:'oneOf-20 전체 analysis 약 33%가 이론상 상한이며 도달 가능한 절감은 더 작다. ungated 오류 검증과 공통 경로 분석을 유지하면 전체 분석을 제거할 수 없다.',ledgerChanges:touched.deferredAnalysis},
  {id:'C5',section:'다',class:'a',title:'작은 폼의 per-tree 고정 준비',source:[['core/SchemaNode/utils/schemaNodeFactory.ts',63],
    ['core/dispatch/utils/chain/enterSchemaNodeChain.ts',17],['core/settle/utils/load/finishStaticFirstLoad.ts',19]],group:'C-fixed-mount-own',
    spec:'정적 feature 부재가 입증된 빈 error/exit/derive 작업군의 준비만 첫 사용까지 미루거나 readonly capability를 공유한다. root runtime, commit/revision, error budget 및 재진입 독립성은 유지한다.',
    estimate:'sample-0 고정 own 묶음 63.2 µs(15.4%)의 10–25% 감소를 가정한 약 6–16 µs. 넓은 폼의 입력 크기 의존 작업까지 같은 비율로 없앨 수 있다는 추정은 하지 않는다.',ledgerChanges:[]},
  {id:'C6',section:'다',class:'a',title:'필수 N개 record 생성과 경로 준비',source:[['core/SchemaNode/utils/schemaNodeFactory.ts',36],
    ['core/SchemaNode/SchemaNode.ts',71]],group:'C-node-record',
    spec:'각 노드의 독립 record·identity·depth·parent 관계는 유지한다. 정적 child name에 escape가 불필요함을 입증한 경로의 regex/중간 문자열 준비만 줄인다. 배열·재귀 occurrence 및 ~ 또는 /가 있는 이름은 기존 escaping을 유지한다.',
    estimate:'N개 identity allocation을 없애는 절감은 0으로 둔다. 준비 경로 own 비용의 5–15%를 줄이는 가설은 nested-d5 약 0.06–0.19 ms(0.3–0.8%), flat-500 약 0.02–0.06 ms(0.2–0.7%)이다. 이 작은 후보가 creation 22–24% 전체를 없애지는 않는다.',ledgerChanges:[]},
];
for(const finding of findings)for(const[file,line]of finding.source)assert(fs.readFileSync(source(file),'utf8').split('\n')[line-1]!==undefined);

const branchAxis=[...branches,'if-then','if-then-guarded'].map(fixture=>{
  const c=census(fixture),n=row(fixture,'new','update');
  return {fixture,branches:fixture.startsWith('oneOf-')?Number(fixture.split('-')[1]):null,
    computeNodes:count(c,'computeNode'),gateEvaluations:count(c,'evaluateGate'),selectNodeSchema:count(c,'selectNodeSchema'),selectChildren:count(c,'selectChildren'),
    dependencyOwnerLoop:loop(c,'registerRecalculation.ts',20),dirtyLoop:loop(c,'registerRecalculation.ts',27),
    gateCollectionLoop:loop(c,'computeNode.ts',82),fragmentEntryLoop:loop(c,'selectChildren.ts',146),fragmentGateLoop:loop(c,'selectChildren.ts',160),
    pendingReadOccurrences:loop(c,'flushPendingGateReads.ts',101),controlNodeDeclarations:loop(c,'getControlLayers.ts',66),controlParentDeclarations:loop(c,'getControlLayers.ts',80),
    transitionRounds:loop(c,'transitionSettlement.ts',52),entryFillLoop:loop(c,'transitionSettlement.ts',61),writtenInputLoop:loop(c,'transitionSettlement.ts',120),
    enteredNodes:count(c,'createSchemaNode'),derivationRounds:count(c,'evaluateDeriveRound'),gateEvaluationBySchemaPath:c.gateEvaluations,
    correctedMeanMs:n.total.correctedMs.mean};
});
const mountAxis=mounts.map(fixture=>{
  const c=census(fixture,'mount'),n=row(fixture,'new','mount');
  return {fixture,createdNodes:count(c,'createSchemaNode'),blueprintNodeBuilds:count(c,'buildNodes'),declarationCollections:count(c,'collectDeclarations'),
    staticFirstNodes:count(c,'assembleStaticFirstNode'),genericComputeNodes:count(c,'computeNode'),deriveRounds:count(c,'evaluateDeriveRound'),
    assemblyCalls:summary.catalog.filter(site=>!site.file.startsWith('release/')&&site.name.startsWith('assemble')&&site.name!=='assembleStaticFirstNode').reduce((sum,site)=>sum+(c.counts[site.id]?.median??0),0),
    projectionCalls:summary.catalog.filter(site=>!site.file.startsWith('release/')&&site.name.startsWith('project')).reduce((sum,site)=>sum+(c.counts[site.id]?.median??0),0),
    keywordApplications:count(c,'applyConstraintKeywords'),dfsIterations:loop(c,'loadStaticFirstTree.ts',56),phases:n.phases};
});

const metric=values=>{
  const sorted=values.toSorted((a,b)=>a-b);
  return {median:sorted[Math.ceil(sorted.length*.5)-1],p99:sorted[Math.ceil(sorted.length*.99)-1],mean:values.reduce((a,b)=>a+b,0)/values.length,min:sorted[0],max:sorted.at(-1)};
};
const near=(a,b)=>assert(Math.abs(a-b)<=Math.max(2e-7,Math.abs(b)*2e-8),`${a} != ${b}`);
const checks={timingFiles:0,timingNumberLeaves:0,phaseSampleRows:0,samplesPerVersionOperation:303,phaseCorrectionReproduced:true,
  sourceHashesUnchanged:true,headUnchanged:true,aliasOutputsChecked:alias.checks.length,siteCountsReconcile:true,phaseMeanSharesSumToOne:true,
  productChanges:false,gitWrites:false,installs:false,agentsSpawned:false,naturalMeasurementExit:true,
  artifactScope:'Only verification/07-switch diagnostic files; product source and Git state are unchanged.'};
for(const entry of summary.timingFiles) {
  const bytes=fs.readFileSync(path.join(output,entry.file));assert(bytes.byteLength<=5_000_000);assert.equal(bytes.byteLength,entry.bytes);assert.equal(hash(bytes),entry.sha256);
  const content=JSON.parse(bytes);const numbers=value=>{
    if(Array.isArray(value)){for(const item of value)numbers(item);}
    else if(value&&typeof value==='object'){for(const item of Object.values(value))numbers(item);}
    else {assert.equal(typeof value,'number');assert(Number.isFinite(value));checks.timingNumberLeaves++;}
  };numbers(content);
  for(const version of ['old','new'])for(const mode of ['mount','update']) {
    const data=content[version+'-'+mode],r=row(entry.file.split('-final2-')[1].replace('-timings.json',''),version,mode);
    assert(r);assert.equal(data.activeMs.length,303);
    const calibration=metric(data.emptySpanPerCallMs);near(calibration.median,r.calibration.perCallMs.median);
    for(const [phase,raw]of Object.entries(data.phases)) {
      assert.equal(raw.length,303);const p=r.phases[phase];assert.equal(p.calls.min,p.calls.max);
      const corrected=raw.map(value=>value-p.calls.median*calibration.median);
      for(const key of ['median','mean','p99']){near(metric(raw)[key],p.rawMs[key]);near(metric(corrected)[key],p.correctedMs[key]);}
      checks.phaseSampleRows++;
    }
    for(let index=0;index<303;index++) {
      near(Object.values(data.phases).reduce((sum,values)=>sum+values[index],0),data.activeMs[index]);
      near(data.activeMs[index]-r.total.calls.median*calibration.median,data.correctedActiveMs[index]);
    }
    const phaseCalls=Object.values(r.phases).reduce((sum,p)=>sum+p.calls.median,0);assert.equal(phaseCalls,r.total.calls.median);
    const siteCalls=r.sites.reduce((sum,site)=>sum+site[2],0);assert.equal(siteCalls,r.total.calls.median);
    near(Object.values(r.phases).reduce((sum,p)=>sum+p.correctedMeanShare,0),1);
    near(r.total.correctedMs.median,metric(data.correctedActiveMs).median);
    const counterpart=row(r.fixture,version==='old'?'new':'old',mode);assert.deepEqual(r.semanticHashes,counterpart.semanticHashes);
  }
  checks.timingFiles++;
}
checks.timingFilesTotalBytes=summary.timingFiles.reduce((sum,entry)=>sum+entry.bytes,0);
assert(checks.timingFilesTotalBytes<=5_000_000);
for(const[file,expected]of Object.entries(summary.sourceHashes))if(!file.startsWith('release/'))assert.equal(hash(fs.readFileSync(path.join(repo,file))),expected);
assert.equal(execFileSync('git',['diff','--name-only','HEAD','--','packages/canard/schema-form/src'],{cwd:repo,encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}).trim(),'');

const totalsTable=(fixtures,mode)=>[
  '| 폼 | old 원/보정 µs | old C / 빈 span ns | HEAD 원/보정 µs | HEAD C / 빈 span ns | 보정 배율 |',
  '|---|---:|---:|---:|---:|---:|',
  ...fixtures.map(f=>{const o=row(f,'old',mode),n=row(f,'new',mode);return `| ${f} | ${number(o.total.rawMs.median*1000)}/${number(o.total.correctedMs.median*1000)} | ${o.total.calls.median} / ${number(o.calibration.perCallMs.median*1e6,1)} | ${number(n.total.rawMs.median*1000)}/${number(n.total.correctedMs.median*1000)} | ${n.total.calls.median} / ${number(n.calibration.perCallMs.median*1e6,1)} | ${number(n.total.correctedMs.median/o.total.correctedMs.median)}× |`;})].join('\n');
const phasesTable=(fixtures,mode,phaseNames)=>[
  '| 폼 / 단계 | old 원→보정 µs; C; ns/call | HEAD 원→보정 µs; C; ns/call | HEAD 보정 평균 몫 |',
  '|---|---:|---:|---:|',
  ...fixtures.flatMap(f=>phaseNames.filter(p=>row(f,'old',mode).phases[p].calls.median||row(f,'new',mode).phases[p].calls.median).map(p=>{
    const o=row(f,'old',mode).phases[p],n=row(f,'new',mode).phases[p];const value=x=>`${number(x.rawMs.median*1000)}→${number(x.correctedMs.median*1000)}; ${x.calls.median}; ${number(x.perCallInstrumentationMs*1e6,1)}`;
    return `| ${f} / ${p} | ${value(o)} | ${value(n)} | ${percent(n.correctedMeanShare)} |`; }))].join('\n');
const groupTable=items=>[
  '| 묶음 / 폼 | 원→보정 평균 µs | C(own) 또는 C_sub / ns/call | 보정 평균 몫 |',
  '|---|---:|---:|---:|',...items.map(g=>`| ${g.id} / ${g.fixture} | ${number(g.rawMeanMs*1000)}→${number(g.correctedMeanMs*1000)} | ${g.calls} / ${number(g.perCallInstrumentationMs*1e6,1)} | ${percent(g.correctedMeanShare)} |`)].join('\n');
const findingsTable=section=>[
  '| ID / 분류 | 위치·진단 | 수정 명세 또는 바꿀 설계 | 예상 절감·상한 / 원장 변경 |',
  '|---|---|---|---|',...findings.filter(f=>f.section===section).map(f=>`| ${f.id} / (${f.class}) | ${f.title}<br>${f.source.map(([p,l])=>ref(p,l)).join('<br>')} | ${f.spec} | ${f.estimate??f.savingCap}${f.ledgerChanges.length?'<br>'+f.ledgerChanges.map(x=>'`'+x.id+'` (`'+x.file+':'+x.line+'`)').join(', '):'<br>원장 변경 없음'} |`)].join('\n');
const originalMounts=prior.officialRows.filter(item=>item.lane==='core'&&item.validation==='off'&&item.mode==='mount'&&mounts.includes(item.fixture));
const priorUpdate=prior.updateSplitRows.filter(item=>item.lane==='core'&&item.validation==='off'&&item.mode==='update-later'&&branchless.includes(item.fixture));
const originalOneOf=originalMounts.find(item=>item.fixture==='oneOf-40');
const priorPhase=(version)=>{const v=originalOneOf[version],p=v.phases.analysis,k=v.instrumentation.perCallMs.median;return `${number(p.time.median,3)}→${number(p.time.median-p.calls.median*k,3)} ms; C=${p.calls.median}; ${number(k*1e6,1)} ns/call`;};
const smallFixed=group('C-fixed-mount-own','sample-0'),deepOutput=group('C-output-slots','nested-d5-f4'),flatOutput=group('C-output-slots','flat-500');
const branchGate=group('B-gates','oneOf-40'),branchTables=group('B-table-and-gates','oneOf-40');
const controlLow=group('B-control-layers','oneOf-5'),controlHigh=group('B-control-layers','oneOf-40');
summary.diagnosis={decision:'94C-03; diagnostic evidence only, no implementation or acceptance promotion',aliasVerification:alias,
  readingSources:[
    {path:'architecture/reviews/round-94-closing.md',ref:'origin/1.0.0-beta',items:['94C-01','94C-03']},
    {path:'architecture/reviews/round-65-closing.md',items:['65C-01','65C-03']},
    {path:'architecture/reviews/round-87-owner-answers.md',ref:'origin/1.0.0-beta'},
    {path:'architecture/reviews/round-91-owner-answers.md',ref:'origin/1.0.0-beta'},
    {path:'architecture/verification/07-switch/verdict-93c01.md'},
    {path:'architecture/verification/07-switch/verdict-93c01-summary.json',corrected:true},
    {path:'architecture/verification/07-switch/branchless-phase-diagnosis.md'},
    {path:'architecture/verification/07-switch/remeasure-86c02.md'}],
  groups,findings,branchAxis,mountAxis,
  priorCorrectedReference:originalMounts.map(item=>({fixture:item.fixture,ratio:item.correctedRatio,oldCorrectedMs:item.old.corrected.median,newCorrectedMs:item.new.corrected.median})),
  priorLaterReference:priorUpdate.map(item=>({fixture:item.fixture,ratio:item.correctedRatio})),
  branchCriteria:{criterion1:'not satisfied: branch-growing register/table/gate work plus controls scans during exit settlement',
    criterion2:'not satisfied: repeated shared gate evaluation, dormant owner/flush plan expansion, full controls scans and empty phase bookkeeping',
    criterion3:'ratios and remaining costs disclosed; no branch-form multiplier acceptance claimed'},
  attribution:{phases:'Exclusive times; nested compute/mark operations inside derive or transition remain attributed to their containing stage. Delivery preparation inside commit is attributed to delivery.',
    mark:'Dispatch/chain entry, raw mutation, dependency marking, finish/cleanup call scaffolding. The mark bucket is therefore not a pure pre-compute timeline interval.',
    oldCommit:'Legacy has no separately owned commit function; zero is observed absence, not a claim that legacy delivery needs no value/revision work.',
    output:'assemble/project are inside compute/derive/transition; a zero standalone output bucket does not mean no output work.',
    recursiveInclusive:'Recursive buildNodes/populateNodeChildren inclusive durations overlap and must not be summed. Group caps use disjoint roots.'},
  limits:[
    'No host-wide process isolation guarantee: pre-existing idle sessions were observed; none was killed. Only this task launched measurements and no agent was spawned.',
    'Instrumented old lane uses canonical source from the 0.16.0 release tag, not the published alias bytecode. Installed BF alias matched all 30 mount/update outputs; this does not establish timing or bytecode identity.',
    'Empty-span correction does not undo instrumentation-driven JIT/inlining/cache changes; dense mount instrumentation exceeds half of several raw totals.',
    'No React rendering, user subscribers, general AJV validation, end-to-end timer waiting, or production-mode claims.',
    'if-then without a guard does not exercise guard transitions; guarded supplement is not syntax-equivalent in 0.16.0.',
    'Estimated savings are conditional models and inclusive upper bounds; no optimized behavior or speedup was implemented or measured.',
    'Official corrected 93C-01 ratios remain authoritative as referenced by 94C-01, with its scheduling-blocked end-to-end qualification.'],
  artifactChecks:checks,
  scripts:{measurement:'tools/measure-diagnosis-94c03.mjs',report:'tools/report-diagnosis-94c03.mjs'},
};

const report=`# 94C-03: 후속 갱신·분기 수·마운트의 비용 진단

## (가) 한 번의 갱신이 내는 고정 비용

후속 갱신의 작은 폼 배율은 이번 상세 계측에서 3.52–3.62×, 중첩·배열은 2.65–2.90×, computed-visible-derived는 4.53×입니다. 작은 폼의 mark는 약 50–52%, delivery는 약 15–17%입니다. 단일 raw 쓰기와 조상 output 갱신 외에도 빈 phase 진입, context/chain 준비, 사용하지 않은 작업군 정리가 반복됩니다. 다만 빈 feature helper만의 몫은 약 6–8%로, mark 전체를 지울 수 있다는 근거는 없습니다.

**근거와 측정 범위.** 94C-03 및 94C-01은 \`git show origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/round-94-closing.md\`로 읽었습니다. 65C-01의 phase별 상수/구조 분리, round 87의 최소 순회·서브트리 독립성, round 91의 untouched branch 비용·중복 작업 기준을 적용했습니다. corrected \`verdict-93c01.md\`와 summary, \`branchless-phase-diagnosis.md\`, \`remeasure-86c02.md\`를 교차 참조했습니다. 후자의 관측을 현재 코드의 호출 수로 재확인했으며 첫 갱신이나 여러 interaction의 평균으로 후속 단일 쓰기를 대체하지 않았습니다.

worktree는 \`${repo}\`, HEAD는 \`${expectedHead}\`입니다. Node ${summary.environment.node}, V8 ${summary.environment.v8}, ${summary.environment.cpu}, ${summary.environment.platform}/${summary.environment.arch}의 단일 프로세스에서 각 폼·버전별 warmup 24회 후 101쌍×3회차를 실행했습니다. 매 쌍 old/new를 교대하고 회차마다 선후를 반전했습니다. BF 원 interaction을 끝낸 후 한 번 더 실제 값을 바꿨습니다. oneOf는 분기 수와 무관하게 \`kind_0 → kind_4\`입니다. 개발 모드, 일반 validation off, 빈 onChange, 구독자 없음입니다. 명시적 GC는 계측 밖입니다. 타이밍과 census는 별도 순차 실행했고 census는 5개 새 트리로 확인했습니다. esbuild 서비스도 계측 전에 stdin을 닫아 스스로 종료시켰습니다. 새 에이전트·설치·Git 쓰기·제품 소스 변경은 없습니다. 기존 호스트의 idle 세션은 종료시키지 않았으므로 호스트 전체 프로세스 배타성은 보증하지 않습니다.

old는 설치된 BF \`@canard/schema-form_0.16.0\` alias의 0.16.0에 대응하는 release tag \`${alias.releaseSourceCommit}\`의 정본 TypeScript를 메모리에서 계측·번들한 경로입니다. 현재 \`src/__legacy__\`가 이 release와 같다고 가정하지 않았습니다. alias 실제 CJS의 내부 factory도 메모리에서 연결해 30개 mount/later 결과가 source lane 및 HEAD와 같은 hash임을 확인했습니다. 이는 표본 의미 동등성 증거이며 alias bytecode와 계측 lane의 타이밍 동등성 증거는 아닙니다. 제품 파일에는 계측을 넣지 않았습니다.

**계측 편향.** 각 fixture/version/operation의 실제 site 빈도로 빈 span을 replay하고, noop 바탕 비용과 교대 비교한 한 호출 비용 \`k\`를 구했습니다. 각 sample의 보정은 \`원시간 − C×k\`입니다. 아래 모든 단계 값은 호출 수 C와 ns/call을 함께 적었습니다. C는 계측 span 수이고 computeNode 등 의미 있는 함수 호출 수와 다릅니다. 원/보정 시간은 중앙값이며 몫은 합이 100%가 되는 보정 산술평균 기준입니다. median끼리 더하지 않습니다. 0 미만 보정은 잘라내지 않았습니다. parent의 절감 상한은 자기 C가 아니라 자손을 포함한 C_sub로 보정했습니다. recursive inclusive 부모나 gate와 그 부모 선택 테이블의 시간을 합산하지 않습니다.

동기 함수 span과 bounded drain에서 실제 실행된 old callback의 active 시간을 합했고 timer 대기는 제외했습니다. plain 동기 제어군은 old의 비동기 작업을 제외하므로 공식 종단 배율로 쓰지 않았습니다. 계측은 JIT/inlining/cache를 바꿀 수 있으며 빈 span 보정으로 되돌릴 수 없습니다. 특히 nested-d5 mount의 HEAD는 ${row('nested-d5-f4','new','mount').total.calls.median.toLocaleString('en-US')} spans여서 원 평균 ${number(row('nested-d5-f4','new','mount').total.rawMs.mean)} ms 중 보정 공제가 ${number(row('nested-d5-f4','new','mount').total.rawMs.mean-row('nested-d5-f4','new','mount').total.correctedMs.mean)} ms입니다. 따라서 이 phase 합계는 93C-01 공식 corrected 표 및 94C-01의 종단 계측 미해결 상태를 대체하지 않습니다.

**후속 단일 쓰기 합계.**

${totalsTable(branchless,'update')}

**mark → compute → derive → transition → commit → delivery.** mark에는 entry/chain, raw 쓰기, dependency marking 및 호출 외곽의 finish/cleanup이 들어갑니다. 그러므로 순수하게 compute 이전 시간만을 뜻하지 않습니다. derive/transition 안에서 일어난 compute·mark는 상위 phase에 남겼습니다. delivery 준비는 commit 내부에서 실행돼도 delivery로 분리했습니다. old에 독립 commit 함수가 없어서 commit C=0입니다. output 슬롯은 compute 등에 포함되므로 standalone output=0을 출력 작업 없음으로 읽으면 안 됩니다.

${phasesTable(branchless,'update',phaseOrder)}

**필수 쓰기와 형태에 비례하는 작업.** \`writeSchemaNode.ts:71\`의 markWrite는 외부 입력 한 번, \`computeNode.ts:43\`의 ungated 경로는 변경된 자식과 그 조상만 계산합니다. computeNode 호출 수는 sample-0/1/2/3에서 2/3/3/3, nested-d3/d5에서 4/6, array-100에서 4입니다. nested-d5 전체 1,365개 및 array의 100개 원소를 후속 쓰기마다 순회하지 않았습니다. registerRecalculation의 dirty loop(\`src/core/settle/utils/write/registerRecalculation.ts:27\`)도 2/3/3/3/4/6/4회로 쓰기 경로 깊이에 비례합니다. immutable 부모 output을 갱신하기 위해 이 조상 작업은 필요합니다. 넓은 객체의 copy는 크기에 비례할 수 있으며 flat-500의 후속 갱신은 오히려 old보다 작아(0.38×) 이를 작은 폼 고정비와 구분해야 합니다.

빈 derive·transition·exit·derive commit helper는 기능이 없는 모든 표본에서도 각각 한 번 실행됩니다. 아래 A-empty는 자손 C를 합한 분리된 helper들의 묶음입니다. scratch는 첫 사용/중첩 호출 때만 새로 만들고 이후 재사용합니다(\`getSettlementScratch.ts:11\`). 24개 scratch 컨테이너가 후속 쓰기마다 새로 만들어지는 것은 아니며, \`releaseSettlementScratch.ts:9\`에서 21회 clear와 3회 배열 길이 초기화가 무조건 실행됩니다. 사용하지 않은 containers를 정리하는 상수 비용과 사용한 DirtyPathSet의 색인 정리는 구분해야 합니다.

${groupTable(groups.filter(g=>['A-empty','A-context','A-dispatch-own'].includes(g.id)))}

sample-0의 enterSchemaNodeChain/exitSchemaNodeChain은 각각 한 번, 자손 포함 C=4/7, 보정 평균 9.89/6.40 µs(10.0%/6.5%)입니다. 빈 span 비용은 두 함수 모두 ${number(row('sample-0','new','update').calibration.perCallMs.median*1e6,1)} ns/call입니다. 쓰기 writable 확인, 오류 수집, budget과 root onChange 전달을 포함하므로 전체를 unused bookkeeping으로 분류하지 않습니다. A2는 이 전체 몫을 절감값에 넣지 않았습니다. onChange가 빈 함수라도 현행 payload/revision 계약상 준비 비용은 필수입니다.

**derived 4.53×의 분해.** evaluateDeriveRound는 2회입니다. 첫 회가 target에 자동 쓰기를 만들고, 둘째 회가 새 쓰기가 없음을 확인합니다. 둘째 회 전체가 낭비라는 증거는 없으며 이를 제거하면 edge 소비·rank·수렴 계약(\`SETTLE-004\`)을 훼손할 수 있습니다. registerRecalculation은 2회, collectDeriveSourcePaths는 2회, getDependencyIndex는 4회, DependencyIndex.affected는 6회입니다. index constructor는 0회로 캐시를 새로 만드는 비용이 아닙니다. changedRaw를 누적으로 질의해 loop가 3회(source, 이후 source+target)가 되고 dirty loop는 5회입니다. computeNode도 5회로 root 2, source 1, target 2회입니다. target의 자동 쓰기 전 선행 계산은 잠재적인 중복이지만 다른 control/gate 독자가 없음을 증명해야 생략할 수 있습니다. root의 정적 shape 확인과 선택(\`selectChildren.ts:94,102\`)은 각각 8개 항목을 방문해 단일 쓰기 수가 아니라 고정된 네 자식 폭에 비례합니다.

${groupTable(groups.filter(g=>g.id.startsWith('A-derive')))}

round 전체 33.9%와 의존성 11.9%는 겹칩니다. 의존성 묶음 중 두 번째 등록과 두 번 source 질의가 derive 내부에 있으므로 이 둘을 더해 45.8%라고 하지 않습니다. commitDeriveRules의 baseline/edge 상태도 둘째 round와 의미가 달라 중복이라는 이유로 삭제할 수 없습니다.

**발견의 분류와 수정 명세.** 아래 절감 범위는 아직 구현하지 않은 가정이며 상한을 넘는 절감을 약속하지 않습니다. (a)는 원장 계약을 유지하는 후보, (b)는 설계 및 명시한 원장을 바꿔야 하는 후보입니다.

${findingsTable('가')}

## (나) 분기 수에 따른 정착 비용

한 번의 oneOf 쓰기에서 computeNode=5, 실제 새 노드=3, 퇴장=3, transitionSettlement round=1은 분기 수와 무관합니다. 그런데 mark와 compute는 증가합니다. gate 평가가 8B(루트 스키마 2B + 자식 선언 6B), 선택 테이블 항목이 6B+4, 역의존성 owner가 3B+1입니다. untouched branch의 gate도 각 8회 평가됩니다. 실제 노드 생성이나 더 많은 derive round가 원인이 아닙니다.

${totalsTable([...branches,'if-then','if-then-guarded'],'update')}

${phasesTable([...branches,'if-then','if-then-guarded'],'update',['creation',...phaseOrder,'validation'])}

**한 갱신의 의미 있는 호출·루프 횟수.** 호출 census는 시간 계측 없이 별도 수집했고 해당 loop 값은 5개 트리에서 일정했습니다. contexts의 min/max는 한 호출 내부 여러 시점의 크기 차이도 포함하므로 호출 수의 변동으로 읽으면 안 됩니다.

| 폼 | computeNode | gate | select schema / children | 역 owner / dirty | fragment table / child gate | pending read occurrence | control node / parent 선언 | transition round / entry / input |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
${branchAxis.map(a=>`| ${a.fixture} | ${a.computeNodes} | ${a.gateEvaluations} | ${a.selectNodeSchema}/${a.selectChildren} | ${a.dependencyOwnerLoop}/${a.dirtyLoop} | ${a.fragmentEntryLoop}/${a.fragmentGateLoop} | ${a.pendingReadOccurrences} | ${a.controlNodeDeclarations}/${a.controlParentDeclarations} | ${a.transitionRounds}/${a.entryFillLoop}/${a.writtenInputLoop} |`).join('\n')}

위치: 역 owner/dirty는 \`src/core/settle/utils/write/registerRecalculation.ts:20,27\`, fragment table/gate는 \`src/core/settle/utils/compute/selectChildren.ts:146,160\`, root gate 수집은 \`src/core/settle/utils/compute/computeNode.ts:78,82,94\`입니다. computeNode의 entries는 3B+2, child gate 수집은 3B입니다. \`src/core/settle/utils/write/getDependencyIndex.ts:61–70\`가 공유 fragment gate를 dormant leaf owner에도 등록해 dirty paths가 많아집니다. \`src/core/settle/utils/gates/flushPendingGateReads.ts:101\`의 occurrence는 2→107회, 이 fixture에서는 3B−13입니다. \`dirtyChildren.ts:18\` 순회도 40→355회입니다. 이는 전체 live tree를 순회한 결과가 아니라 authored fragment/의존성 테이블 크기에 따른 작업입니다.

\`transitionSettlement.ts:61,66,120\` 자체의 entry=3, depth=2, writtenInputs=4는 일정합니다. 그러나 transition에 포함된 finalizeExits가 exit 정책을 읽을 때 \`getControlLayers.ts:66,80\`에서 node 선언은 27→132(3B+12), parent 선언은 54→369(9B+9)회 훑습니다. 따라서 transition 본체 루프만 일정하다고 round 91 기준 (1)을 충족했다고 할 수 없습니다. (1)은 전체 전환 정착에 대해 **미충족**이고, 내부 exit control 수집에도 잔여 축이 있습니다. getControlLayers의 transition 전용 호출 수는 9로 일정해도 그 안의 loop는 커집니다.

${groupTable(groups.filter(g=>g.id.startsWith('B-')&&branches.includes(g.fixture)))}

oneOf-40에서 gate 자체는 ${percent(branchGate.correctedMeanShare)}, selectChildren+selectNodeSchema는 ${percent(branchTables.correctedMeanShare)}입니다. gate가 후자의 자손이므로 둘을 합산하지 않습니다. 후속 update의 compute ${percent(row('oneOf-40','new','update').phases.compute.correctedMeanShare)}를 전부 gate로 설명하는 것도 틀립니다. table 순회, 선택·inactive bookkeeping, output 조립이 남습니다. control 수집 전체의 B=5→40 추가 보정 평균은 ${number((controlHigh.correctedMeanMs-controlLow.correctedMeanMs)*1000)} µs이며, 그 50–80%를 줄인다는 B2 가정은 약 ${number((controlHigh.correctedMeanMs-controlLow.correctedMeanMs)*500)}–${number((controlHigh.correctedMeanMs-controlLow.correctedMeanMs)*800)} µs입니다.

**round 91 기준 (2), phase별 검사.**

| phase | oneOf-5..40 | if/then | 판정 및 분류 |
|---|---|---|---|
| mark | 공유 gate를 leaf owner로 확장: 16→121 owner, 17→122 dirty; index constructor는 0 | owner 확장은 0, context/scratch 준비는 동일 | B1/A2 (a); 불필요한 작업군·전파 후보가 남아 있어 충족 아님 |
| compute | 같은 fragment gate를 root와 3개 child 선언에서 각 wheel 재평가, 8B회; active.map은 selectNodeSchema 호출마다 두 번 | 원 fixture gate=2, guard 보충=4; guard는 각 현재 투영을 읽어야 함 | B2/B4/B5 (a), B3 (b); map 중복은 명확하나 gate를 생략하려면 규약 또는 동등 입력 증명이 필요 |
| derive | rule 없는 데도 runDeriveRounds/getDeriveState 각 1회, 실제 round는 0 | 동일 | A1 (a); 빈 phase scaffolding이 남음 |
| transition | entry/exit 각각 3은 필수; exit control가 모든 parent 선언을 반복 스캔 | actual entry/exit=0인 보충 표본에서도 phase·exit helper 진입 | B2/A1 (a); 아직 untouched branch 축 존재 |
| commit | selected ID 복사·revision·commit#·exit memo는 현행 계약. 빈 derive/exit helper는 분리 가능 | guard 보충도 state/schema commit 필요 | A1 (a), reader 없는 payload를 없애려면 A4 (b); 전체 commit를 unused로 판단하지 않음 |
| delivery | 실제 값/revision 대상 수는 분기 수에 무관; no listener여도 payload가 필요 | 동일, guard 조건과 값 의미는 별개 | 현행 계약의 필수 작업; 생략은 A4 (b) |

원 \`if-then\` 표본에는 validator가 없어 \`if\` guard가 없고 then이 비활성입니다. 이 표본만으로 조건 전환을 검증했다는 결론을 내리지 않았습니다. 보충 \`if-then-guarded\`는 이미 설치된 AJV guard를 제공했고 일반 validationMode는 0입니다. guard 비용은 validation으로 분리했습니다. guard가 4회 실행되는 동안 선택된 schema/현재 output이 바뀔 수 있으므로 입력 서명과 투영 세대가 같다는 증명 없이 캐시하지 않습니다. 0.16.0의 if/then 처리와 완전한 구문·전환 의미 동등성도 주장하지 않습니다. 보충 mount의 새 AJV compile 비용은 약 90%여서 원 mount 표와 섞지 않았습니다.

기준 (2) 역시 **미충족**입니다. 배율 개선안으로 기준 (1)/(2)를 대신하지 않았습니다. 아래 B3는 구조 질의이며 아직 선택·구현하지 않았습니다. untouched의 의미는 게이트 진릿값이 그대로인 branch입니다. 공통 /kind 변경은 모든 generic 조건의 의존성을 건드릴 수 있어, 일반식에 무조건 O(1)을 약속할 수 없습니다.

${findingsTable('나')}

## (다) 남아 있는 마운트 간극

기존 93C-01 corrected 수치는 nested-d5 3.76×, flat-500 2.25×, 작은 표본 1.52–2.23×, derived 2.92×입니다. 이를 새 상세 계측 결과로 덮어쓰지 않습니다. 아래 공식 기준열과 이번 diagnostic 열은 phase boundary·span 밀도·컴파일 형태가 달라 다른 절대 시간이며, 새로운 합격 판정은 없습니다.

| 폼 | 기존 corrected 배율 | 이번 상세 보정 배율 | HEAD analysis / creation / compute / commit 평균 몫 |
|---|---:|---:|---:|
${originalMounts.map(a=>{const n=row(a.fixture,'new','mount'),o=row(a.fixture,'old','mount');return `| ${a.fixture} | ${number(a.correctedRatio)}× | ${number(n.total.correctedMs.median/o.total.correctedMs.median)}× | ${['analysis','creation','compute','commit'].map(p=>percent(n.phases[p].correctedMeanShare)).join(' / ')} |`;}).join('\n')}

${totalsTable(mounts,'mount')}

${phasesTable(mounts,'mount',['analysis','creation','mark','compute','derive','transition','commit','delivery','other'])}

**2N과 실제 생성·분석을 구분한 census.**

| 폼 | runtime 생성 | blueprint build / collect declarations | static first 노드 | assemble / project | DFS loop | generic compute / derive round | constraint 적용 |
|---|---:|---:|---:|---:|---:|---:|---:|
${mountAxis.map(a=>`| ${a.fixture} | ${a.createdNodes} | ${a.blueprintNodeBuilds}/${a.declarationCollections} | ${a.staticFirstNodes} | ${a.assemblyCalls}/${a.projectionCalls} | ${a.dfsIterations} | ${a.genericComputeNodes}/${a.deriveRounds} | ${a.keywordApplications} |`).join('\n')}

static first가 가능한 nested-d5/flat-500은 N=1,365/501 노드를 각 한 번 만들고 각 노드의 assemble와 project를 한 번씩 호출합니다. 그래서 2N은 인터페이스 슬롯 횟수이며 독립된 두 번의 전체 DFS라는 뜻이 아닙니다. \`src/core/settle/utils/load/loadStaticFirstTree.ts:56\`의 한 stack 루프가 entry/postorder를 다루며 반복은 2N−1회입니다. generic computeNode 및 registerRecalculation은 0회입니다. 따라서 현재 정적 폼을 예전의 두 generic settle로 설명할 수 없습니다. \`src/core/settle/utils/load/assembleStaticFirstNode.ts:17–38\`의 출력 슬롯+wrapper는 nested-d5 ${percent(deepOutput.correctedMeanShare)}, flat-500 ${percent(flatOutput.correctedMeanShare)}이고 전체 compute는 각각 ${percent(row('nested-d5-f4','new','mount').phases.compute.correctedMeanShare)}/${percent(row('flat-500','new','mount').phases.compute.correctedMeanShare)}입니다. 나머지 compute에는 DFS 상태·호출·값 존재 여부 제어가 들어갑니다. 필수 output 연산 하나하나와 wrapper의 세부 보정은 summary에 남겼으며 극소 helper의 음수 값을 다른 큰 함수에 귀속하지 않았습니다.

생성 단계 22–24%의 대부분은 record allocation만이 아닙니다. \`schemaNodeFactory.ts:46\`의 runtime effective schema 병합을 빼면 record 생성+경로/전략 준비는 nested-d5 ${percent(group('C-node-record','nested-d5-f4').correctedMeanShare)}, flat-500 ${percent(group('C-node-record','flat-500').correctedMeanShare)}입니다. revision ledger 생성은 commit에서 별도로 각각 ${percent(group('C-revisions','nested-d5-f4').correctedMeanShare)}/${percent(group('C-revisions','flat-500').correctedMeanShare)}입니다. 이는 리스너가 없어도 필요한 EVENT 계약이며 노드 constructor와 합쳐 creation 몫을 과장하지 않았습니다.

static 분석과 runtime 생성 각각 N번씩 effective schema를 구성해 applyConstraintKeywords는 2N회입니다. memo가 옵션·mode와 node identity로 분리되고 buildNodes가 정적 분석용 node 사본을 쓰기 때문에 ungated 형태에서도 두 번째 비용이 남습니다. static과 runtime의 contribution·오류 의미가 같은지 증명해야 C1이 (a)로 남을 수 있습니다. applyConstraintKeywords 자기 시간만 보면 보정 몫이 비정상적으로 커 보이지만 자손의 계측 종료 비용을 포함한 exclusive 잔여가 그 부모에 잡힙니다. 이 함수의 상한은 C_sub로 보정한 inclusive 묶음으로 구했습니다. 따라서 keyword family에 마운트 절반을 절감할 수 있다고 주장하지 않습니다.

${groupTable(groups.filter(g=>['C-output-slots','C-runtime-merge','C-node-record','C-keyword-families','C-revisions','C-fixed-mount-own'].includes(g.id)&&['sample-0','nested-d5-f4','flat-500'].includes(g.fixture)))}

**작은 폼도 내는 고정 준비비.** sample-0은 노드가 3개뿐이어도 per-tree runtime/PathKeyedMap·Set, chain budget/error 상태, dispatchMount, static-first finish와 root onChange 전달을 한 번씩 준비합니다. \`src/core/SchemaNode/utils/schemaNodeFactory.ts:63\`, \`src/core/dispatch/utils/chain/enterSchemaNodeChain.ts:17\`, \`src/core/settle/utils/load/finishStaticFirstLoad.ts:19\`가 위치입니다. 겹치지 않는 own span 준비 묶음 C-fixed-mount-own은 C=${smallFixed.calls}, 빈 span ${number(smallFixed.perCallInstrumentationMs*1e6,1)} ns/call, 원→보정 평균 ${number(smallFixed.rawMeanMs*1000)}→${number(smallFixed.correctedMeanMs*1000)} µs(${percent(smallFixed.correctedMeanShare)})입니다. 실제 할당 객체 수와는 다르며, 반복 호출 횟수 1이 고정이라는 뜻이지 실행 시간이 모든 N에서 완전히 같다는 뜻은 아닙니다. 넓은 폼의 root emit/멤버 준비 등 입력 크기의 영향도 있습니다. runtime 오브젝트를 통째로 없애는 안은 오류·budget·revision 계약과 양립하지 않습니다. A2와 같은 부분적인 지연 준비만 (a) 후보이며 이 고정 묶음의 10–25% 정도(약 ${number(smallFixed.correctedMeanMs*1000*.1)}–${number(smallFixed.correctedMeanMs*1000*.25)} µs)를 보수적인 가설로 기록합니다.

**derived·oneOf의 분석.** derived mount는 runtime 노드 5개, generic compute 15회, derive round 4회입니다. static first=0으로 defaults/derived convergence가 필요해서 정적 폼의 2N 경로와 별개입니다. analysis 약 23%, derive 약 16%, compute 약 13%로, 노드 수 5개만으로 2.92×의 잔여를 설명하지 않습니다. 후속 derived의 두 round와 mount의 네 round를 혼동하지 않았습니다.

oneOf-20은 blueprint build 63, declaration collection 83이지만 runtime 노드는 6개만 생성합니다. 모든 dormant branch의 실제 노드를 만드는 것이 원인이 아닙니다. 기존 원표 oneOf-40 mount analysis의 0.17→1.17 ms에 대응하는 93C-01 phase는 old ${priorPhase('old')}, HEAD ${priorPhase('new')}입니다(화살표는 원 중앙값→대표 k로 산정한 근사 보정값이며, 기존 summary가 회차별 phase 보정 통계를 제공하지 않으므로 공식 보정 phase 값은 아닙니다). 현재 oneOf-20 상세 analysis는 1.34 ms 중앙값이고 C=1,659, 빈 span ${number(row('oneOf-20','new','mount').calibration.perCallMs.median*1e6,1)} ns/call, 원→보정 ${number(row('oneOf-20','new','mount').phases.analysis.rawMs.median,3)}→${number(row('oneOf-20','new','mount').phases.analysis.correctedMs.median,3)} ms, 평균 몫 33.0%입니다. \`collectGateEvaluationReads.ts:13\`는 20회 호출되어 read path 정규식 재분석만 보정 평균 약 0.336 ms(전체 9.4%)입니다. 호출 C=20, 빈 span 비용은 같은 ${number(row('oneOf-20','new','mount').calibration.perCallMs.median*1e6,1)} ns/call, 원 평균 ${number(group('C-gate-read-parse','oneOf-20').rawMeanMs,3)} ms입니다. lexical IR 공유는 (a), 비활성 fragment 분석 자체를 뒤로 미루는 안은 (b)입니다.

${findingsTable('다')}

**산출물·검증.** 이 보고서의 단계별 median/p99/mean, 함수·loop census, source file:line, node path 방문, calibrated 비용과 inclusive C_sub, 모든 음수 보정 및 가정별 절감 상한은 \`diagnosis-94c03-summary.json\`에 있습니다. \`siteColumns\`가 packed site 배열의 열 순서이며 raw timing 파일에는 숫자 시간 samples만 있습니다. ${checks.timingFiles}개 timing 파일은 각각 5 MB 이하, ${checks.phaseSampleRows}개 phase sample 행의 보정식·phase 합계·303 samples·site C 합계·semantic hash를 재계산했습니다. HEAD와 제품 소스 SHA-256을 다시 확인했습니다. 최초 smoke/실패한 출력 및 임시 summary는 최종 산출물에서 제외합니다. 스크립트는 \`tools/measure-diagnosis-94c03.mjs\` 및 \`tools/report-diagnosis-94c03.mjs\`입니다. 재현 명령은 \`DIAG94_STEM=diagnosis-94c03-final2 node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/tools/measure-diagnosis-94c03.mjs\`이며 출력 파일이 존재하면 덮어쓰지 않고 실패하므로 재실행은 별도 DIAG94_STEM을 사용하고 report 스크립트의 REPORT94_INPUT에 그 measurement-summary 파일명을 지정해야 합니다. 현재 파일로 report만 재생성할 때는 최종 summary를 읽으므로 임시 summary가 필요 없습니다. 이 진단은 (a)/(b)의 구현·원장 수정·합격 승격을 수행하지 않았습니다.
`;
summary.diagnosis.reportBytes=Buffer.byteLength(report);
summary.diagnosis.scriptsSha256=Object.fromEntries(['measure-diagnosis-94c03.mjs','report-diagnosis-94c03.mjs'].map(file=>[file,hash(fs.readFileSync(path.join(directory,file)))]));
const json=JSON.stringify(summary)+'\n';assert(Buffer.byteLength(json)<=5_000_000);
assert.equal((report.match(/^## /gm)??[]).length,3);
fs.writeFileSync(path.join(output,'diagnosis-94c03.md'),report);
fs.writeFileSync(path.join(output,'diagnosis-94c03-summary.json'),json);
console.log(JSON.stringify({reportBytes:Buffer.byteLength(report),summaryBytes:Buffer.byteLength(json),checks,
  selectedShares:{empty:group('A-empty','sample-0').correctedMeanShare,derive:group('A-derive-rounds','computed-visible-derived').correctedMeanShare,
    gates:branchGate.correctedMeanShare,tables:branchTables.correctedMeanShare,mountOutput:deepOutput.correctedMeanShare}}));
