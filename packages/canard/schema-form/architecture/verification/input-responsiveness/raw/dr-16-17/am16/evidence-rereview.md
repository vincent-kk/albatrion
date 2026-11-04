# Amendment 16 증거 도구 독립 재검토

기존 `implementation-review.md`의 P2는 **부분 해소, 종결 보류**입니다. G4의 원문·원시 로그·FCA 대조와 G6의 직접 Git/파일 검사는 구현되었지만, G5가 실행 당시의 소스와 명령을 해당 결과에 결합하지 않는 문제가 남습니다. RootNodeContext 라우팅 fixture 수정에서는 추가 결함을 발견하지 못했습니다. 전체 게이트는 진행 중이므로 이 문서는 최종 실행 또는 병합 통과 판정이 아닙니다.

## 남은 발견 사항

### P2 — G5가 현재 소스 일치만 확인하고 각 실행의 소스를 확인하지 않습니다

- 위치: `check.py:132–156`, 특히 `:136–149`와 `:156`입니다. 검토한 검사기 SHA-256은 `ad551acc331c76cc6322949859e0f7d312ea0e413298916c37780b70457280fc`입니다.
- 승인된 `plan.md` R1은 G5가 순서 있는 command start/end/exit **및 source hashes**를 소비하도록 요구합니다. 현재 G5는 실행 행에서 `exit`, `log`, `started`, `ended`, `cmd`만 읽습니다. 소스 해시 필드를 읽거나 현재 snapshot과 비교하는 경로가 없습니다. 마지막 `source_matches()`는 현재 10개 제품 파일과 snapshot만 비교하며 반환된 해시 맵도 버립니다.
- 따라서 다른 소스에서 얻은 성공 결과·시간·exit를 두고 현재 소스만 snapshot에 맞춰도 이 조건은 통과할 수 있습니다. 현재 제품 소스 10개가 실제로 snapshot과 일치한다는 사실은 확인했지만, 그것으로 실행 시점의 소스가 입증되지는 않습니다. 이는 아직 생성되지 않은 `gate-executions.json`의 부재가 아니라 검사기 자체의 누락입니다.
- 명령의 정체성도 결합되지 않습니다. 행의 `log` 이름과 위치로 게이트를 구분하지만, `cmd`에는 `--testNamePattern` 및 일부 `src/` 문자열 부재만 요구합니다. 예를 들어 다른 프로젝트를 실행한 명령도 그 두 문자열이 없으면 해당 행의 명령 검사에서 거부되지 않습니다. 7개 프로젝트와 별도 importModel의 실행을 검증하려면 각 행의 실제 명령/프로젝트가 기대 게이트와 대응하는지도 확인해야 합니다.
- 선언 결과는 `public-declarations.json`의 `rootExportsEqual`, `semanticDifferences`, `unsafeRuntimeExposures`, `unresolvedAliases`를 확인하도록 개선됐습니다. 다만 현재 선언 산출물/소스와 그 비교 실행을 연결하는 입력 해시·실행 exit 검증은 없습니다. 과거 성공 선언 결과를 재사용하는 경우도 위와 같은 실행 증거 결합 문제에 포함됩니다.
- 필요한 조치: 주 작업자가 각 실행의 시작/종료 소스 해시를 보존하고, 누락·불일치 시 G5가 실패하도록 비교해야 합니다. 각 명령/프로젝트와 선언 비교의 실행 결과·입력 산출물도 고정해 주십시오. 검토자는 파일 변조, 게이트 실행 또는 제품 테스트를 하지 않았으므로 위 통과 가능성은 코드 경로 분석 결과입니다. 선행 알림은 코디네이터에게 `msg_9d030d0b30dd`로 전달했습니다.

## 해소된 부분과 직접 대조한 증거

- G1은 red exit, log 해시, 현재 6개 테스트 해시, criteria 해시 및 BASE Git 원문의 제품 해시를 읽습니다. 이들 해시는 독립적인 읽기/해시 계산에서 모두 일치했습니다. 최종 fixture가 반영된 red 원시 assertion은 21 failed/12 passed입니다.
- G3은 29개 mutation ID, 필수 실패 제목, 실행 exit, definition after bytes에서 계산한 changed hash, before/restored/current source를 연결합니다. 29개의 before/restored 해시와 definition 기반 changed 해시를 직접 대조해 불일치가 없었습니다. 현재 snapshot의 text/hash/실제 파일 10개도 일치했습니다. focused green 원시 assertion은 unit 79 passed, render 30 passed/3 skipped, react18 33 passed입니다. render의 세 제외 사례는 기존 명시 기준에 속합니다.
- G4는 `records.json` 또는 `fca-comparison.json`의 자체 선언을 소비하지 않습니다. 정본 기존 부분은 BASE 대비 귀속 문구 변경만 있으며 82/85행은 원문과 위치가 보존되어 있습니다. core/errors 계약 기준 문장은 STAGE 원문과 정확히 일치하고 `2026-11-02` 및 빈 줄 다음에 있습니다.
- sup-plan의 DR16C-02 93행과 DR17C-02 96행에 대응하는 5개 보충문이 각 원장 절에 정확히 있습니다. 보충문을 제거한 error/event 원장은 BASE Git 원문과 byte-equivalent text이며, 기존 인용은 유지되어 있습니다. G4의 Counter는 동일 DR17C-02 문구가 여러 대상에 들어가는 실제 횟수를 검사합니다.
- baseline checkout의 HEAD는 `61457653ae19dfb1f11b97e29355fa3cd6af8f24`입니다. 26개 baseline/final 원시 원장 로그를 직접 읽어 출력 디렉터리만 정규화했을 때 sup 이외 차이가 없고, final exit는 모두 0입니다. sup 원시 수치는 3640 → 3650이며 not-verbatim/unparsed는 모두 0입니다.
- FCA의 원시 validate findings 및 scan/validate/verification diagnostics를 root prefix만 정규화한 다중집합으로 대조했을 때 새 원소는 모두 0입니다. 세 final snapshotHash는 `e9de0c9d3fde1cba15283d6bd25237f0de6c0ee30e2c43dce4a14b1aaaf8162f`로 같습니다. 기존 indeterminate/violation을 전체 FCA PASS로 바꾸어 해석하지 않았습니다.
- `negative-checker.py`와 `checker-negative.json`에는 raw FCA diagnostic 추가와 sup count 변경의 두 대조가 각각 exit 1/marker absent로 기록되어 있습니다. 현재 FCA에는 주입 diagnostic이 없고 sup 로그는 3650으로 복구되어 있습니다. 이 검토에서 대조 조건을 재실행하지 않았습니다.
- G5는 순차 시간 범위, raw assertion 상태의 case 집계, 빈 lint 로그, build marker를 확인하도록 개선됐습니다. 이 개선과 위 실행 소스 결합 누락을 구별합니다.
- G6는 버전/manifest를 Git 원문과 비교하고, Git diff와 untracked 경로·추가 파일·decoded gzip을 읽으며 `/dist/` 변경을 거부합니다. configured author, ancestry, co-author/session 형태 메시지, clean tree 및 최종 HEAD로 고정한 PR Markdown 링크도 Git/파일로 직접 확인하는 코드입니다. package manifest의 현재 bytes가 STAGE와 같은 것은 별도로 확인했습니다. 최종 commit/clean tree/PR pin의 실행 통과는 판정하지 않았습니다.

## RootNodeContext fixture 수정

`src/providers/RootNodeContext/__tests__/handlerFailureBundles.test.ts`는 `FormErrorService`를 형제 `FormErrorContext` 진입점에서 type-only import하고, 그 인터페이스를 만족하는 mock을 구성합니다. 형제 내부 `createFormErrorService` 구현을 import하지 않습니다. mock의 report/reportInLoad가 target record에서 handler bundle을 던지므로 flush/reset의 실제 catch와 host routing 경로를 계속 검증합니다. target callback 1회, host 2회, X/Y identity와 순서 단언을 유지하며 전역 stub은 afterEach에서 복구합니다.

`import-model-fix.json`과 원시 로그는 importModel 2개 및 대상 fixture 3개, 합계 5개 통과를 보여 줍니다. 수정 뒤 `m17-flush-handler-raw-unit.json` 및 `m17-reset-handler-raw-unit.json`은 각각 자기 대상 사례 하나만 host 2회 대신 1회인 이유로 실패하며, 다른 두 사례는 이름 필터로 skipped입니다. 두 변이의 exit는 1이고 복구 해시가 snapshot과 같습니다. fixture 수정으로 제품 소스가 바뀌지 않았다는 설명도 현재 10개 소스 해시의 일치와 부합합니다.

## 범위와 제한

저장소 AGENTS.md/root·package CLAUDE.md, package AGENTS.md, 적용 `.claude/rules` 및 RootNodeContext INTENT를 읽었습니다. 제품/테스트/검사기 수정, 테스트·빌드·설치·fetch·commit, 게이트 실행은 하지 않았습니다. 이 외부 보고서만 작성했습니다. 원시 자료를 읽고 해시·카운터·텍스트 차이를 계산한 것은 기존 증거의 독립 대조이며 새로운 테스트 실행이 아닙니다.

검토 시 `am16/gate-executions.json` 및 handoff 산출물은 아직 없었습니다. 전체 게이트의 미래 산출물을 요구하거나 그 부재를 결함으로 세지 않았으며, 최종 성공 마커를 관측했다고 주장하지 않습니다. 남은 P2 수정과 필요한 증거 갱신은 주 작업자의 소유입니다.

주요 증거 SHA-256:

| 파일 | SHA-256 |
| --- | --- |
| criteria.json | `82dbb4ec6a556ca4db5a0b1b64be15db088231a994041cce908dedb37477add2` |
| red.json | `fce03ccd1dc80d941861b9cecc19a599eaa3b4c21eb7e66d0fa46935d599d345` |
| red-provenance.json | `e2dab2a505bb8244f8814676cfda4d7b8ef1d1d9abde8ec138ff24531e69f788` |
| green.json | `f83a70107e5518f4fe35563f91c5f72b633a53031e6db46a45d0928f216f8129` |
| mutations.json | `044756b9a34423031ff2ebe247cb4905a010fb61d9898432416687dbfdc5b46b` |
| source-snapshot.json | `3e88fd981cddc10f4c5ba7c16cf97d11cc581f545e100b1f96609ceb2b5efdaa` |
| public-declarations.json | `cc7d21abb70c8529573dfc251b26f0f9f035c9044480ec79f869786b96956abf` |
| import-model-fix.json | `0b547c4e5b029d9d320a9bf89309d7333069dd76bdf875087cd85beb873bb87a` |
