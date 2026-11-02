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
