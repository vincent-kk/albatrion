# G 구현 검증 — 가드 읽기와 전체 컴파일 분리

기준은1202dd53b이며 제품 런타임이 같은1c44a823b의 사전 측정 build를 재사용할 수 있습니다. 계약 선행8a8bbb03a 뒤 구현f750262ea를 만들었습니다. 전체 수용 측정의 사전등록9관문이 모두 통과하여 ACCEPT로 수용했습니다.

## 기준 red와 특성화

- 기준 동작에서 red4개가 모두 지정 이유로 실패했습니다. None if-schema의 전체 compile3회, OnChange settle 중1회, guard read1회, 같은 id의B 가드 준비 중2번째 전체 compile을 각각 검출했습니다.
- 같은 id 시험은 A를 보유하고 전체 검증한 뒤 B의 가드를 읽고 A를 해제합니다. B의 최초 전체 수요 전에 compile 수가1이어야 한다는 단언도 포함하므로 기준의 조기 컴파일을 검출하며, M4에서는 최종 B 판정이 실패합니다.
- 새 특성화8개는 mount·같은 schema reset·root 교체 reset·rebuild·validator 교체의 gate/effective minLength와 판정, 슬롯 sink·onError1회, 명시validate 거부·submit 거부를 기준에서 통과했습니다. 기존 compile-failure6·same-id7·retry3·shipped-plugin retry3도 기준에서 통과하여 기준 특성화는27개입니다. 제출 helper의 onFailure 전달1개도 기준에서 추가 통과하여 총28개입니다.
- 구현 후 validation unit80개와 새 render10개, 변이 복원 뒤 합계90개가 통과했습니다.

## 기존 시험의 수요 명시

| 시험 | 바꾼 이유와 보존한 의도 |
| --- | --- |
| validation.retain-guard | 보유·가드 읽기는 전체compile0이며 가드1회와 최근 해제를 보존합니다. |
| validation.guard | 동일 사본은 entry.copy에서 읽고 첫 전체 수요를 별도로 실행해 guard·compile·release의 객체 정체성을 보존합니다. |
| validation.cache | 항목 생성0회와 compiled=false, 첫 수요1회·같은 copy 및 캐시 공유를 검증합니다. |
| validation.lifetime | 단순 읽기0회와 참조 수를 확인하고 등록 수명 시험은 전체 수요를 명시해8개 상한·사본 release를 보존합니다. |
| validation.retry | 충돌을 일으킨 첫 전체 시도를 명시한 뒤 기존 한 번 재시도·거부 정체성·guard 참조·실패 정리를 유지합니다. |
| validation.plugin-retry | 생성 직후 failure 없음과 첫 수요 실패를 분리하고 실제3종 플러그인의 같은 copy 재시도를 유지합니다. |
| validation.same-id | 등록과 실패가 필요한 지점에 전체 수요를 명시하며 release가 대체compile보다 앞서는 순서와 duplicate 분류를 유지합니다. |

추가 compile 수·mock copy 검색에서 inflight·load-slot·after-paint 시험을 확인했습니다. 전체 src 재검색에서 engine의 validation-guard-integration 시험도 개발 가드 준비 직후 전체compile1회를 고정한 것을 확인해0회로 갱신하며 가드2회의 의도는 유지합니다. migration/form-lifecycle·Form.policies·inflight·load-slot·after-paint는 전체 수요 뒤 결과를 검사하므로 원래 단언을 보존합니다. VALIDATE-019·021·045도 루트 독립 등록·미컴파일 해제와 연결되어 추가 보충했습니다.

## 변이

| 변이 | 지정 실패 | 복원 |
| --- | ---: | --- |
| M1 생성에서 전체compile 복원 | None mount1개 | 바이트 일치 |
| M2 guard read에서 전체compile | guard read1개 | 바이트 일치 |
| M3 assert의 최초compile 생략 | validation.run7개 | 바이트 일치 |
| M4 최초compile 직전 same-id 퇴출 생략 | same-id 중간 해제1개 | 바이트 일치 |

배포 AJV6·7·8 runtime은 변경하지 않았습니다. 새 계약 시험은 자족 가드 선행·root definitions $ref 선행·미등록 release 무호출과 후속 전체 판정이며 AJV6 3개·AJV7 3개·AJV8 세 방언9개입니다. Storybook 예제는 등록한 루트의 pointer $ref를 직접 컴파일합니다.

## 환경

설치 없이 기존 의존성을 재사용했습니다. 초기 루트 node_modules 단일 링크가 상위 작업 공간의 구형 schema-form 선언을 가져와 typecheck가 실패하여 의존성별 링크와 이 작업 트리의 workspace 링크로 분리했습니다. 기존 winglet4종과 plugin3종 산출물을 ignored 디렉터리에 복사하고 package-local AJV8·7 링크 및 현재 schema-form 선언을 복구한 뒤 같은 typecheck가 통과했습니다. package.json·lockfile은 바꾸지 않았습니다.

## 전체 관문과 수용 준비

전체 관문은 순차 실행했고 동시에 두 Vitest 실행을 시작하지 않았습니다. schema-form lint 오류·경고0, typecheck, 정식 build와 DEVELOPMENT_FLAG_OK·GATE_SELECTION_DIST_OK가 통과했습니다. 테스트 기대값 보강 뒤 최종 lint·typecheck도 다시 통과했습니다. 생성 dist는 ignored 산출물이고 추적 중인 bundle·adapter 변경이 없어 별도 build 커밋 대상은 없습니다.

| 프로젝트 | 통과 | 기존 skip |
| --- | ---: | ---: |
| unit | 4253 | 0 |
| render | 1035 | 7 |
| react18 | 1033 | 9 |
| verify-unit | 4297 | 0 |
| verify-render | 1035 | 7 |
| production | 21 | 0 |
| storybook | 254 | 0 |

importModel2개, AJV6 133개·AJV7 138개·AJV8 343개 및 소비자 schema-form-scenarios45개가 통과했습니다. 세 플러그인의 lint 오류·경고0 및 각 typecheck도 통과했습니다.

추가 전역 검색에서 개발 사전 준비의 전체compile1회를 고정한 engine 통합 시험을 수정했습니다. 최초 unit4252통과·해당1실패를 보존하고 전체 재실행4253통과를 확인했습니다. Storybook 첫 실행은 실제 공유 node_modules의 setup-file이 Vite 제공 범위 밖이라101파일 수집 실패·실행0이었습니다. 저장소 설정을 바꾸지 않고 원래 Vite 설정을 읽는 scratch wrapper의 server.fs.allow에 작업 트리와 공유 의존성 디렉터리만 허용한 뒤 대상5개·전체254개가 통과했습니다.

원장26검사는 기준1202dd53b와 최종 모두 결정 인용 불일치0·보충 인용 불일치0·unparsed0·ref problems0입니다. 소유자 인용은782/782→786/786, uncited0 유지입니다. 기존 문서 미인용66 유지, 기존 tokens 누락397·plan 문제1은 변함없습니다. baseline archive의 새 git 저장소는 처음에 과거 원문 fallback 객체가 없어23/13의 허위 불일치를 냈고, 기존 object 저장소의 read-only alternates를 연결하여0/0으로 복구했습니다. 문서를 고친 결과가 아닙니다.

FCA는 같은 snapshot으로 scan·전체6범위 validate·verification을 각각 실행했습니다. 기준/최종 구조 finding566·failed26·skipped308, verification finding30을 보존하고 새 finding0·새 diagnostic0입니다. snapshot은 기준15660a391a940a6cc6769dbbf6e44b72e0538291cf753b7568ff0e61c54f4c90, 최종321725c7afa224b6901f567744fdc62ba54e2a715bb838f15e52b63b0c6eaef5입니다. facts는 기준3171/3171·최종3178/3178 exact이며 unsupported514는 양쪽 동일합니다. 절대 판정은 기존 위반과 indeterminate 축을 가진 FAIL이고 변경 비교에서 새 항목이 없는 것입니다.

버전은 추적 manifest23개 모두 기준과 같습니다. 기계 경로 감사는 architecture 전체와 변경 파일의 plain·escaped 문자열 및 gzip 해제 내용을 포함하며0 hit를 요구합니다. 원본 전체를 scratch에 유지하고 저장소 raw126개는 경로만 정규화한 gzip과 해시 manifest로 보존합니다. 감사 범위6483개·gzip3549개에서0 hit였습니다.

## 수용 측정 준비와 파일럿 이력

네 셀에 각 build warmup1회·보존3회의 파일럿만 실행했습니다(48페이지·보존36·warmup12). 원본 재집계,22809개 frozen hash, overlap 없음 검사가 통과했습니다. if/None paint104.5→70.2ms, if/OnChange paint107.5→70.0ms·첫 verdict123.5→110.9ms는 파일럿 관찰일 뿐 수용 결과가 아닙니다. guard-free OnChange pilot은 control gap2.300ms가 band1.122ms를 넘어 invalid로 보존했고 재실행하지 않았습니다.

정식 셀은 mount-if-flat-500-none·mount-if-flat-500-validate·mount-flat-500-none·mount-flat-500-validate, 각 build20회입니다. time to first verdict는 root.render 직전 mount.startedAt부터 Form 첫 onValidate callback 진입까지이며 fallback은 없습니다. None10%·16.7ms·control gap2배 초과 절감, OnChange10%·16.7ms 절감, 첫 verdict 기준+16.7ms 이내, guard-free 회귀 max(0.5ms,3%) 이내를 모두 만족해야 수용합니다. control 유효 폭은 max(0.3ms,3%)이며 전체 그룹 한 번 재시도 뒤 재무효 VOID입니다.

기준은1202dd53b이며 runtime/build/fixture 범위에서1c44a823b와 다른 것은 union 시험뿐이라 기존1c44a823b 기준 제품을 명시된 허가에 따라 재사용합니다. 후보 제품은 구현f750262ea에서 만들고 최종 문서·시험 커밋과 runtime/build 입력 동일성을 확인해 측정 후보19798fed1로 repin을 완료했습니다. 실행 가능한 harness와 full 명령은 scratch prep 보고서와 PR 본문에 두며 전체 수용 측정은 아래 결과대로 완료되어 ACCEPT입니다.

## 전체 수용 측정 — ACCEPT

측정 후보19798fed1c01161a49741250e6eedd816f55ff4d, 제품 소스f750262ea73c4d82d048a06d89d14aa7d5022936, 기준1202dd53b677ccefdf84fbe360f377426bf6ea98입니다. summary.json의 원본 수치와 사전등록 규칙에 따라 코디네이터가 ACCEPT를 결정했습니다. 네 그룹 모두 첫 시도에 유효했고 아래9관문이 모두 true이며 재시도·VOID·overlap은 없습니다. 파일럿의 invalid control 기록은 보존하되 최종 판정은 이번 전체 실행을 따릅니다.

| 셀 | 시도 | build | metric | n | median | p95 |
| --- | ---: | --- | --- | ---: | ---: | ---: |
| mount-if-flat-500-none | 1 | baseline | firstPaintedMs | 20 | 105.55000001192093 | 110 |
| mount-if-flat-500-none | 1 | baseline | longestMountTask | 20 | 104.0 | 109 |
| mount-if-flat-500-none | 1 | candidate | firstPaintedMs | 20 | 69.80000001192093 | 73.60000002384186 |
| mount-if-flat-500-none | 1 | candidate | longestMountTask | 20 | 68.5 | 72 |
| mount-if-flat-500-none | 1 | control | firstPaintedMs | 20 | 104.65000003576279 | 106.40000009536743 |
| mount-if-flat-500-none | 1 | control | longestMountTask | 20 | 104.0 | 105 |
| mount-if-flat-500-validate | 1 | baseline | firstPaintedMs | 20 | 105.3999999165535 | 115.19999992847443 |
| mount-if-flat-500-validate | 1 | baseline | longestMountTask | 20 | 104.0 | 114 |
| mount-if-flat-500-validate | 1 | baseline | firstVerdictMs | 20 | 121.54999995231628 | 131.5 |
| mount-if-flat-500-validate | 1 | candidate | firstPaintedMs | 20 | 70.25 | 73.10000002384186 |
| mount-if-flat-500-validate | 1 | candidate | longestMountTask | 20 | 69.0 | 72 |
| mount-if-flat-500-validate | 1 | candidate | firstVerdictMs | 20 | 110.64999997615814 | 115.5 |
| mount-if-flat-500-validate | 1 | control | firstPaintedMs | 20 | 106.5 | 109.89999997615814 |
| mount-if-flat-500-validate | 1 | control | longestMountTask | 20 | 105.0 | 109 |
| mount-if-flat-500-validate | 1 | control | firstVerdictMs | 20 | 122.69999998807907 | 127 |
| mount-flat-500-none | 1 | baseline | firstPaintedMs | 20 | 38.55000001192093 | 40.10000002384186 |
| mount-flat-500-none | 1 | baseline | longestMountTask | 20 | 0.0 | 0 |
| mount-flat-500-none | 1 | candidate | firstPaintedMs | 20 | 37.89999997615814 | 40.799999952316284 |
| mount-flat-500-none | 1 | candidate | longestMountTask | 20 | 0.0 | 0 |
| mount-flat-500-none | 1 | control | firstPaintedMs | 20 | 38.59999990463257 | 41.300000071525574 |
| mount-flat-500-none | 1 | control | longestMountTask | 20 | 0.0 | 0 |
| mount-flat-500-validate | 1 | baseline | firstPaintedMs | 20 | 38.249999940395355 | 40.700000047683716 |
| mount-flat-500-validate | 1 | baseline | longestMountTask | 20 | 0.0 | 0 |
| mount-flat-500-validate | 1 | baseline | firstVerdictMs | 20 | 88.69999998807907 | 92.5 |
| mount-flat-500-validate | 1 | candidate | firstPaintedMs | 20 | 37.94999998807907 | 41.800000071525574 |
| mount-flat-500-validate | 1 | candidate | longestMountTask | 20 | 0.0 | 0 |
| mount-flat-500-validate | 1 | candidate | firstVerdictMs | 20 | 88.89999997615814 | 91.89999997615814 |
| mount-flat-500-validate | 1 | control | firstPaintedMs | 20 | 38.0 | 41.39999997615814 |
| mount-flat-500-validate | 1 | control | longestMountTask | 20 | 0.0 | 0 |
| mount-flat-500-validate | 1 | control | firstVerdictMs | 20 | 89.19999992847443 | 93.29999995231628 |

| 셀 | 시도 | controlGap | controlBand | valid | savingMs | savingFraction | medianRegressionMs | firstVerdictRegressionMs | guardFreeRegressionBand | void |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| mount-if-flat-500-none | 1 | 0.8999999761581421 | 3.166500000357628 | true | 35.75 | 0.33870203691105977 | -35.75 | null | 3.166500000357628 | false |
| mount-if-flat-500-validate | 1 | 1.1000000834465027 | 3.1619999974966047 | true | 35.1499999165535 | 0.3334914605728861 | -35.1499999165535 | -10.899999976158142 | 3.1619999974966047 | false |
| mount-flat-500-none | 1 | 0.049999892711639404 | 1.1565000003576278 | true | 0.6500000357627869 | 0.016861220118334252 | -0.6500000357627869 | null | 1.1565000003576278 | false |
| mount-flat-500-validate | 1 | 0.24999994039535522 | 1.1474999982118606 | true | 0.2999999523162842 | 0.007843136020490759 | -0.2999999523162842 | 0.19999998807907104 | 1.1474999982118606 | false |

| 사전등록 관문 | 결과 |
| --- | --- |
| allControlGroupsValid | true |
| ifNoneAtLeast10Percent | true |
| ifNoneAtLeast16_7Ms | true |
| ifNoneMoreThanTwiceControlGap | true |
| ifOnChangeAtLeast10Percent | true |
| ifOnChangeAtLeast16_7Ms | true |
| ifOnChangeFirstVerdictWithin16_7Ms | true |
| mount-flat-500-noneWithinAmendedRegressionBand | true |
| mount-flat-500-validateWithinAmendedRegressionBand | true |

| 실행 그룹 | exitCode | seconds | competitorsBefore | competitorsDuring |
| --- | ---: | ---: | --- | --- |
| mount-if-flat-500-none-attempt1 | 0 | 79.61197471618652 | [] | [] |
| mount-if-flat-500-validate-attempt1 | 0 | 79.57786393165588 | [] | [] |
| mount-flat-500-none-attempt1 | 0 | 79.8342809677124 | [] | [] |
| mount-flat-500-validate-attempt1 | 0 | 80.00886082649231 | [] | [] |

전체 runner seconds는319.0329804420471, success는true, decision은accept입니다. 각 build의 보존 회수는20, warmup은3이며 최초 판정은 mount 시작부터 Form 첫 onValidate 진입까지입니다. 기준 제품과 control은 동일 바이트이고1c44a823b 제품을 재사용합니다. 수용 규칙은 파일럿·전체 실행 뒤 바꾸지 않았습니다.


## Amendment 2·2a — 중복 id 가드 실패 복구와 최종 재검증

2026-11-03. 계약7ed29468c→수정d6f3e2d66→실제 슬롯 시험0b0784869 순서로 추가했습니다. 수정 전 제품은19798fed1과 같으며 기존 전체 측정 ACCEPT는 그 이전 후보의 기록입니다. 최종 제품의 재수용·입력 회귀 전체 측정은 후속 실행으로 남깁니다.

같은 id의A가 살아 있을 때B 가드가 등록 실패한 뒤A를 해제하면, 기준은 전체 컴파일 재시도 성공에서 중복 가드 실패를 지웠지만 지연 후보는 첫 전체 컴파일 성공에서 지우지 않아 다음 쓰기가 GUARD_FAILED를 던졌습니다. clearDuplicateGuardFailures를 최초 컴파일의try 안 성공 직후와 기존 재시도 성공에서 함께 호출합니다. 정규식에 맞는Error 가드 실패만 제거하고 일반 실패와 성공한 가드는 유지하며 전체 컴파일 실패는 아무것도 지우지 않습니다. app/cache의 writer 목록과validation DETAIL,471C-05 및 VALIDATE-046·ERROR-041·201 보충을 선행 기록했습니다.

배포 AJV6·7·8은 같은 id 충돌에서 같은 설정의 별도 인스턴스를 사용하므로 이 충돌을 피합니다. 회귀는 실제AJV addSchema/removeSchema 등록을 모델링하며 충돌 때 던지는 검증기를 사용합니다. render 회귀는 수정 전 OnChange1실패·None/OnRequest2통과, 기준3통과, 수정 후3통과입니다. OnRequest 한계는 교체 뒤 첫 명시 validate 및 지연 로드 슬롯 전에 확인한 것이며, 로드 슬롯도 전체 컴파일 수요입니다. None 및 그 수요 전의 중복 가드 실패는 기존 한계로 유지합니다. 단위2개와 기존 재시도3개가 통과했고, 실제 스케줄러를 쓰는 최종 회귀에서도 M5가 다시 GUARD_FAILED를 검출했습니다.

M1–M6은 각각1·1·7·1·1·1개를 실패시켰고 제품 소스 바이트를 모두 복원했습니다. 원본red·green·기준 실행과 변이 증거는 raw/fix-*에 보존했습니다.

### 등록 경쟁 차이와 무작위 비교

소유 중인A를 먼저마운트하고 같은id C를None으로 별도마운트하여 등록실패 상태로retain한 뒤 A를B로교체하면, 기준은 live C의참조수가 retry를막아거부하고 후보는해제된A를퇴출한 첫compile에서B가등록하여판정합니다. 실제등록을 얻는루트만 달라지며 C를컴파일하면다시충돌하므로 IR-8의 동시mounted충돌규칙은유지됩니다. 코디네이터가 설명가능한차이로수용한471C-06을 VALIDATE-046·ERROR-201에 새보충으로추가했고 기존보충은수정하지않았습니다.

등록에충실한 주입만사용하여 원래15개·실패10개 시드를 양쪽에서새로실행했고 각각 이 설명가능한2개만남았습니다. 이전transient 주입의75개 차이는 실제충돌없는실패를만든하니스증상으로원본을보존했습니다. 이후발견된 stale guard결함과 혼동하지않습니다.

| 환경 | 시드 범위 | 쌍 | 역할별 스냅숏 | 설명 가능한 차이 | 미분류 |
|---|---|---:|---:|---:|---:|
| render-plain | 1192230912–1192232911 | 2000 | 64990 | 3 | 0 |
| render-strict | 1192296448–1192298447 | 2000 | 64765 | 7 | 0 |
| react18-plain | 1192361984–1192363983 | 2000 | 64692 | 5 | 0 |
| react18-strict | 1192427520–1192429519 | 2000 | 64121 | 6 | 0 |

총8000쌍·16000역할 실행·역할별258568스냅숏의 입력동작 전체가 같았습니다.21개관측차이는 모두471C-06이며 첫원인과이후모든단계의차이를scratch에보존했습니다. React18단일프로세스가약3.5GiB로증가한 미완료실행을보존하고, 같은250시드경계8묶음을양쪽에적용하여각2000쌍을완료했습니다. 생성기·주입소스는같고 동시에Vitest를둘실행하지않았습니다. 무작위자료와측정준비도구는커밋하지않았습니다.

### 정식 관문과 최종 측정 준비

정식 build·산출물검증·typecheck·lint오류경고0과 세플러그인의lint경고0·typecheck가통과했습니다.

| 관문 | 통과 | 기존 skip |
|---|---:|---:|
| unit | 4255 | 0 |
| render | 1038 | 7 |
| react18 | 1036 | 9 |
| verify-unit | 4299 | 0 |
| verify-render | 1038 | 7 |
| production | 21 | 0 |
| storybook | 254 | 0 |
| import-model | 2 | 0 |
| ajv6-tests | 133 | 0 |
| ajv7-tests | 138 | 0 |
| ajv8-tests | 343 | 0 |
| scenarios | 45 | 0 |

원장26검사 새불일치0·인용오류0·기존문서미인용66유지·소유자786/786,버전23개불변입니다. FCA사실저장소가새epoch로무효화된최초진단을보존하고3181개를재추출하여모두exact로등록했습니다. 기준대비새finding0·diagnostic0이며 기존구조566·실패26 및verification30과indeterminate는남아절대PASS로표시하지않습니다.

최종측정준비는 기존4mount셀과flat/if-flat의typing·first-key4셀을한번의quietfullrun으로측정합니다. pilot은셀별한번,retained72·warmup24·총96페이지,경쟁0이며 조건부typing의control한그룹이invalid로남아재시도하지않았습니다. 첫키는native keydown event.timeStamp부터대응input의다음rAF까지,per-write longest-frame은input부터100ms에겹친raw rAF간격의최댓값입니다. typing handler와frame회귀는max(0.05ms,기준5%),first-key는max(0.5ms,기준5%),control은각gated지표의max(0.3ms,기준3%)이며정식무효group은한번재시도후재무효VOID입니다. mount9관문은기존규칙을유지합니다.

전체20회 재수용·입력회귀 matrix는 실행하지 않았고 최종HEAD의문서·시험전용차이를검증해측정제품에고정합니다. 한개의정식명령과정의·pilot원본·해시는외부prep보고서로인계하며 push·게시·병합·버전변경은하지않습니다.


## 최종 제품의 전체 재수용·입력 회귀 측정 — ACCEPT

기준 `1202dd53b677ccefdf84fbe360f377426bf6ea98`, 측정 후보 `08980e4c5266b11d86ada29c969fa4125e254022`, 제품 소스 `d6f3e2d6604bd5362d4cdf4585eb8ff732aae733`입니다. mount 재수용과 typing 회귀 검사를 모두 사전등록 규칙에 따라 ACCEPT로 결정했습니다. 여덟 그룹 모두 첫 시도에 유효했고 재시도·VOID·경쟁 실행은 없었습니다. build당 셀별 warmup3·보존20이며 입력 셀의 handler·frame 분포는 보존20페이지의400개 쓰기를 pooling합니다. 아래 숫자는 summary.json의 값을 반올림 없이 옮겼습니다.

### 전체 분포

| 셀 | 지표 (ms) | build | n | median | p95 |
|---|---|---|---:|---:|---:|
| mount-if-flat-500-none | firstPaintedMs | baseline | 20 | 104.39999997615814 | 107.5 |
| mount-if-flat-500-none | longestMountTask | baseline | 20 | 103.0 | 106 |
| mount-if-flat-500-none | firstPaintedMs | candidate | 20 | 69.44999998807907 | 71 |
| mount-if-flat-500-none | longestMountTask | candidate | 20 | 68.0 | 70 |
| mount-if-flat-500-none | firstPaintedMs | control | 20 | 104.40000009536743 | 106.30000007152557 |
| mount-if-flat-500-none | longestMountTask | control | 20 | 103.0 | 105 |
| mount-if-flat-500-validate | firstPaintedMs | baseline | 20 | 103.70000004768372 | 105.5 |
| mount-if-flat-500-validate | longestMountTask | baseline | 20 | 102.5 | 104 |
| mount-if-flat-500-validate | firstVerdictMs | baseline | 20 | 120.04999995231628 | 121.69999992847443 |
| mount-if-flat-500-validate | firstPaintedMs | candidate | 20 | 68.94999998807907 | 72 |
| mount-if-flat-500-validate | longestMountTask | candidate | 20 | 68.0 | 71 |
| mount-if-flat-500-validate | firstVerdictMs | candidate | 20 | 109.6499999165535 | 111.80000007152557 |
| mount-if-flat-500-validate | firstPaintedMs | control | 20 | 104.55000001192093 | 107.39999997615814 |
| mount-if-flat-500-validate | longestMountTask | control | 20 | 103.0 | 106 |
| mount-if-flat-500-validate | firstVerdictMs | control | 20 | 120.29999995231628 | 123.80000007152557 |
| mount-flat-500-none | firstPaintedMs | baseline | 20 | 37.300000071525574 | 39.700000047683716 |
| mount-flat-500-none | longestMountTask | baseline | 20 | 0.0 | 0 |
| mount-flat-500-none | firstPaintedMs | candidate | 20 | 37.35000002384186 | 38.300000071525574 |
| mount-flat-500-none | longestMountTask | candidate | 20 | 0.0 | 0 |
| mount-flat-500-none | firstPaintedMs | control | 20 | 37.500000059604645 | 39.89999997615814 |
| mount-flat-500-none | longestMountTask | control | 20 | 0.0 | 0 |
| mount-flat-500-validate | firstPaintedMs | baseline | 20 | 37.30000001192093 | 39.60000002384186 |
| mount-flat-500-validate | longestMountTask | baseline | 20 | 0.0 | 0 |
| mount-flat-500-validate | firstVerdictMs | baseline | 20 | 87.00000005960464 | 90.20000004768372 |
| mount-flat-500-validate | firstPaintedMs | candidate | 20 | 37.44999998807907 | 38.299999952316284 |
| mount-flat-500-validate | longestMountTask | candidate | 20 | 0.0 | 0 |
| mount-flat-500-validate | firstVerdictMs | candidate | 20 | 87.55000001192093 | 89.5 |
| mount-flat-500-validate | firstPaintedMs | control | 20 | 37.55000001192093 | 39.5 |
| mount-flat-500-validate | longestMountTask | control | 20 | 0.0 | 0 |
| mount-flat-500-validate | firstVerdictMs | control | 20 | 87.69999998807907 | 91.39999997615814 |
| type-flat-500-validate-nonburst | handlerMs | baseline | 400 | 0.8999999761581421 | 2.100000023841858 |
| type-flat-500-validate-nonburst | longestFrameMs | baseline | 400 | 9.200000000000045 | 10.299999999999955 |
| type-flat-500-validate-nonburst | handlerMs | candidate | 400 | 0.8999999761581421 | 1.6999999284744263 |
| type-flat-500-validate-nonburst | longestFrameMs | candidate | 400 | 9.299999999999955 | 10.299999999999955 |
| type-flat-500-validate-nonburst | handlerMs | control | 400 | 0.8000000715255737 | 1.7000000476837158 |
| type-flat-500-validate-nonburst | longestFrameMs | control | 400 | 9.200000000000045 | 10.299999999999955 |
| first-key-flat-500-validate | firstKeyToPaintMs | baseline | 20 | 4.399999976158142 | 5 |
| first-key-flat-500-validate | firstKeyToPaintMs | candidate | 20 | 4.550000011920929 | 7.100000023841858 |
| first-key-flat-500-validate | firstKeyToPaintMs | control | 20 | 4.5 | 7.699999928474426 |
| type-if-flat-500-validate-nonburst | handlerMs | baseline | 400 | 0.8500000238418579 | 1.8000000715255737 |
| type-if-flat-500-validate-nonburst | longestFrameMs | baseline | 400 | 9.199999999999932 | 10.299999999999955 |
| type-if-flat-500-validate-nonburst | handlerMs | candidate | 400 | 0.7999999523162842 | 1.899999976158142 |
| type-if-flat-500-validate-nonburst | longestFrameMs | candidate | 400 | 9.300000000000068 | 10.299999999999955 |
| type-if-flat-500-validate-nonburst | handlerMs | control | 400 | 0.8000000715255737 | 1.899999976158142 |
| type-if-flat-500-validate-nonburst | longestFrameMs | control | 400 | 9.200000000000045 | 10.299999999999955 |
| first-key-if-flat-500-validate | firstKeyToPaintMs | baseline | 20 | 3.5 | 7.900000095367432 |
| first-key-if-flat-500-validate | firstKeyToPaintMs | candidate | 20 | 3.549999952316284 | 6.100000023841858 |
| first-key-if-flat-500-validate | firstKeyToPaintMs | control | 20 | 3.3000000715255737 | 5 |

### 셀별 control·차이·관문

차이는 candidate−baseline입니다. savingMs·savingFraction만 baseline−candidate 방향이며, 아래 경로는 각 셀의 첫 attempt 객체 안을 가리킵니다. 모든 숫자는 summary.json 원본 정밀도입니다.

| 셀 | 경로 | 값 |
|---|---|---|
| mount-if-flat-500-none | attempt | 1 |
| mount-if-flat-500-none | controlGap | 1.1920928955078125e-07 |
| mount-if-flat-500-none | controlBand | 3.1319999992847443 |
| mount-if-flat-500-none | valid | true |
| mount-if-flat-500-none | savingMs | 34.94999998807907 |
| mount-if-flat-500-none | savingFraction | 0.33477011490479514 |
| mount-if-flat-500-none | medianRegressionMs | -34.94999998807907 |
| mount-if-flat-500-none | firstVerdictRegressionMs | null |
| mount-if-flat-500-none | guardFreeRegressionBand | 3.1319999992847443 |
| mount-if-flat-500-none | void | false |
| mount-if-flat-500-validate | attempt | 1 |
| mount-if-flat-500-validate | controlGap | 0.8499999642372131 |
| mount-if-flat-500-validate | controlBand | 3.1110000014305115 |
| mount-if-flat-500-validate | valid | true |
| mount-if-flat-500-validate | savingMs | 34.750000059604645 |
| mount-if-flat-500-validate | savingFraction | 0.33510125403689267 |
| mount-if-flat-500-validate | medianRegressionMs | -34.750000059604645 |
| mount-if-flat-500-validate | firstVerdictRegressionMs | -10.400000035762787 |
| mount-if-flat-500-validate | guardFreeRegressionBand | 3.1110000014305115 |
| mount-if-flat-500-validate | void | false |
| mount-flat-500-none | attempt | 1 |
| mount-flat-500-none | controlGap | 0.19999998807907104 |
| mount-flat-500-none | controlBand | 1.1190000021457671 |
| mount-flat-500-none | valid | true |
| mount-flat-500-none | savingMs | -0.04999995231628418 |
| mount-flat-500-none | savingFraction | -0.0013404812927722651 |
| mount-flat-500-none | medianRegressionMs | 0.04999995231628418 |
| mount-flat-500-none | firstVerdictRegressionMs | null |
| mount-flat-500-none | guardFreeRegressionBand | 1.1190000021457671 |
| mount-flat-500-none | void | false |
| mount-flat-500-validate | attempt | 1 |
| mount-flat-500-validate | controlGap | 0.25 |
| mount-flat-500-validate | controlBand | 1.119000000357628 |
| mount-flat-500-validate | valid | true |
| mount-flat-500-validate | savingMs | -0.1499999761581421 |
| mount-flat-500-validate | savingFraction | -0.0040214470807024855 |
| mount-flat-500-validate | medianRegressionMs | 0.1499999761581421 |
| mount-flat-500-validate | firstVerdictRegressionMs | 0.5499999523162842 |
| mount-flat-500-validate | guardFreeRegressionBand | 1.119000000357628 |
| mount-flat-500-validate | void | false |
| type-flat-500-validate-nonburst | attempt | 1 |
| type-flat-500-validate-nonburst | controls.handlerMs.gap | 0.09999990463256836 |
| type-flat-500-validate-nonburst | controls.handlerMs.band | 0.3 |
| type-flat-500-validate-nonburst | controls.handlerMs.valid | true |
| type-flat-500-validate-nonburst | controls.longestFrameMs.gap | 0.0 |
| type-flat-500-validate-nonburst | controls.longestFrameMs.band | 0.3 |
| type-flat-500-validate-nonburst | controls.longestFrameMs.valid | true |
| type-flat-500-validate-nonburst | valid | true |
| type-flat-500-validate-nonburst | gates.handlerMs | true |
| type-flat-500-validate-nonburst | gates.longestFrameMs | true |
| type-flat-500-validate-nonburst | regressionMs.handlerMs | 0.0 |
| type-flat-500-validate-nonburst | regressionMs.longestFrameMs | 0.09999999999990905 |
| type-flat-500-validate-nonburst | regressionBands.handlerMs | 0.05 |
| type-flat-500-validate-nonburst | regressionBands.longestFrameMs | 0.4600000000000023 |
| type-flat-500-validate-nonburst | void | false |
| first-key-flat-500-validate | attempt | 1 |
| first-key-flat-500-validate | controls.firstKeyToPaintMs.gap | 0.10000002384185791 |
| first-key-flat-500-validate | controls.firstKeyToPaintMs.band | 0.3 |
| first-key-flat-500-validate | controls.firstKeyToPaintMs.valid | true |
| first-key-flat-500-validate | valid | true |
| first-key-flat-500-validate | gates.firstKeyToPaintMs | true |
| first-key-flat-500-validate | regressionMs.firstKeyToPaintMs | 0.15000003576278687 |
| first-key-flat-500-validate | regressionBands.firstKeyToPaintMs | 0.5 |
| first-key-flat-500-validate | void | false |
| type-if-flat-500-validate-nonburst | attempt | 1 |
| type-if-flat-500-validate-nonburst | controls.handlerMs.gap | 0.04999995231628418 |
| type-if-flat-500-validate-nonburst | controls.handlerMs.band | 0.3 |
| type-if-flat-500-validate-nonburst | controls.handlerMs.valid | true |
| type-if-flat-500-validate-nonburst | controls.longestFrameMs.gap | 1.1368683772161603e-13 |
| type-if-flat-500-validate-nonburst | controls.longestFrameMs.band | 0.3 |
| type-if-flat-500-validate-nonburst | controls.longestFrameMs.valid | true |
| type-if-flat-500-validate-nonburst | valid | true |
| type-if-flat-500-validate-nonburst | gates.handlerMs | true |
| type-if-flat-500-validate-nonburst | gates.longestFrameMs | true |
| type-if-flat-500-validate-nonburst | regressionMs.handlerMs | -0.05000007152557373 |
| type-if-flat-500-validate-nonburst | regressionMs.longestFrameMs | 0.10000000000013642 |
| type-if-flat-500-validate-nonburst | regressionBands.handlerMs | 0.05 |
| type-if-flat-500-validate-nonburst | regressionBands.longestFrameMs | 0.45999999999999663 |
| type-if-flat-500-validate-nonburst | void | false |
| first-key-if-flat-500-validate | attempt | 1 |
| first-key-if-flat-500-validate | controls.firstKeyToPaintMs.gap | 0.19999992847442627 |
| first-key-if-flat-500-validate | controls.firstKeyToPaintMs.band | 0.3 |
| first-key-if-flat-500-validate | controls.firstKeyToPaintMs.valid | true |
| first-key-if-flat-500-validate | valid | true |
| first-key-if-flat-500-validate | gates.firstKeyToPaintMs | true |
| first-key-if-flat-500-validate | regressionMs.firstKeyToPaintMs | 0.04999995231628418 |
| first-key-if-flat-500-validate | regressionBands.firstKeyToPaintMs | 0.5 |
| first-key-if-flat-500-validate | void | false |

### 전체 판정

| 관문 | 결과 |
|---|---|
| allControlGroupsValid | true |
| ifNoneAtLeast10Percent | true |
| ifNoneAtLeast16_7Ms | true |
| ifNoneMoreThanTwiceControlGap | true |
| ifOnChangeAtLeast10Percent | true |
| ifOnChangeAtLeast16_7Ms | true |
| ifOnChangeFirstVerdictWithin16_7Ms | true |
| mount-flat-500-noneWithinAmendedRegressionBand | true |
| mount-flat-500-validateWithinAmendedRegressionBand | true |
| type-flat-500-validate-nonburst.handlerMs | true |
| type-flat-500-validate-nonburst.longestFrameMs | true |
| first-key-flat-500-validate.firstKeyToPaintMs | true |
| type-if-flat-500-validate-nonburst.handlerMs | true |
| type-if-flat-500-validate-nonburst.longestFrameMs | true |
| first-key-if-flat-500-validate.firstKeyToPaintMs | true |
| mode | "full" |
| mountDecision | "accept" |
| typingDecision | "ACCEPT" |
| decision | "ACCEPT" |
| seconds | 730.8632652759552 |
| success | true |

### 첫 paint 뒤로 이동한 비용

다음 수치는 summary의 중앙값끼리 뺀 값이 아니라 raw의 각 보존 페이지에서 계산한 별도 파생치입니다. paint→첫 Form.onValidate 경과창과 동기 validator 작업 wall time을 구분합니다.

| build | n | paint→verdict median (ms) | paint→verdict p95 (ms) | 전체 compile median (ms) | 첫 paint 뒤 validator 작업 합계 median (ms) |
|---|---:|---:|---:|---:|---:|
| baseline | 20 | 16.0 | 16.5 | 32.44999998807907 | 1.899999976158142 |
| candidate | 20 | 40.55000001192093 | 41.700000047683716 | 24.69999998807907 | 26.55000001192093 |
| control | 20 | 16.0 | 17.399999976158142 | 32.799999952316284 | 1.899999976158142 |

OnChange의 paint→verdict 경과창은16.0→40.55000001192093ms로 늘었고 그 구간의 validator 작업 합계는1.899999976158142→26.55000001192093ms입니다. 첫 paint와 mount 시작 기준 첫 verdict는 모두 빨라졌으며 전체 컴파일이 paint 뒤 슬롯으로 이동한 교환관계입니다. None은 명시 validate·submit에서도 전체 검증과 전체 컴파일을 생략합니다. OnRequest·OnChange는 로드 슬롯 또는 더 이른 명시 수요에서 한 번 컴파일합니다. 가드 컴파일은 분기 선택·표시를 위해 mount 정착에 동기로 남습니다.

정식20회 결과가 이전 pilot의 invalid control 그룹을 대신하는 최종 판정이며 pilot 원본은 보존합니다. 원시 full-01 JSON20개와 파생치의 기계 경로를 정규화한 압축본 및 해시를 artifacts.json에 추가했습니다. 제품·시험·버전은 바꾸지 않고 최종 기록만 추가하며 push·게시·병합은 하지 않습니다.
