# 입력 응답성 단계 마감 결과

2026-10-31. 단계 기준은 `5d1348ed16054efa1ec431945eb00472f4eef7f1`, 제품 끝은 `814d21ad4181805a5ed37c9b64e73bd43d9ed00a`(#506)입니다. 이 마감은 기록만 더합니다. **동기 정착을 유지하며 불필요한 마운트 컴파일과 virtualization의 SSR 결함을 고쳤습니다. D1 구현·가상화 기본값·IR-5 수정의 최종 수락은 소유자 대기입니다.**

## 요청과 확인한 비용

소유자 원문(2026-10-30): "좋아. 근데 한가지가  좀 걸리는군.. 동기식 엔진으로 바꾼건 좋으나 그때문에 입력 안정성이 깨져서 블로킹 되는 문제가 발생할 수 있다. 이는 분명 손실이라, 이를 개선하는 설계와 방법이 필요하지 않을지 검토해보자."

[IR-0](ir-0-results.md)에서 일반 flat 입력 handler 중앙값은 L 0.600→E 0.450ms였고 키 처리 관문은 모두 통과했습니다. 동기 엔진 때문에 키 입력 렌더가 0.16.1보다 느려져 블로킹한다는 가설은 이 범위에서 확인되지 않았습니다. 다만 ET p95가 모든 행에서 L 이하라는 뜻은 아닙니다. flat ET p95는 L 2.900·E 4.600ms이며, 중량 검증은 뒤의 IR-2에서 별도로 실패했습니다.

실제 비용은 None 모드에서도 수행하던 마운트 전체 컴파일(flat 36.6·nested 77.5ms, IR-1에서 고침), 가상화 없는 구조 변경(모든 레인이 50ms 초과), 대형 폼 검증과 O(2000) 레이아웃·React 조정(IR-2), 가상화의 SSR/hydration 불일치(IR-4에서 핀, IR-5에서 고침)였습니다. 엔진의 동기 정착·동기 루트 onChange·명시 validate/submit의 즉시 검증은 유지합니다.

## 단계별 편입 범위

아래 제목은 `git log 5d1348ed1..814d21ad4`의 squash 제목 그대로입니다. 제품 끝까지 7커밋·7개 PR이며 마감 문서 커밋과 PR은 별도입니다.

| PR | squash | 제목 | 최종 효과 |
| --- | --- | --- | --- |
| #500 | `91c422e0e` | perf(schema-form): IR-0 — real-browser input-responsiveness baseline, stage plan and records (#500) | 기준선·측정 장치·계획, 제품 변경 없음 |
| #501 | `317f215dc` | perf(schema-form): IR-1 — lazy validator compile, development guard precompile only for if gates; per-task mount budget measured and not adopted (#501) | Part A만 채택, Part B는 제거 |
| #502 | `bd06bce81` | fix(schema-form): IR-1b — repair the strict production test gate: Vitest testTransformMode key anchored at src, development-only freeze of control template ids (#502) | 엄격 production 관문 복구 |
| #503 | `e01cfcd7b` | perf(schema-form): IR-2 — heavy-validation typing measurement and keystroke cost attribution; D1 trigger recorded with tail-event disclosure (#503) | 측정·원인 귀속, 제품 변경 없음 |
| #504 | `c49c0dc66` | perf(schema-form-ajv8-plugin): IR-3 — synchronous-first compile measured, not adopted by the pre-registered rule (#504) | 사전 규칙으로 미채택, 제품 변경 없음 |
| #505 | `be1a79867` | docs(schema-form): IR-4 — large-form guidance and the virtualization SSR hydration defect pinned with it.fails (#505) | 대형 폼 지침·SSR 결함 시험, 제품 구현 변경 없음 |
| #506 | `814d21ad4` | fix(schema-form): IR-5 — hydration-safe virtualization: server and hydration renders match, no post-hydration re-render, reveal ledger for real input mounts (#506) | SSR DOM 보존·추가 렌더 제거·실제 입력 commit의 노출 원장 |

공개 export는 추가·제거 0, 루트 공개 이름 97개 유지입니다. IR-5의 공개 도달 선언 308개는 export·type·signature 의미 차이 0이며 props JSDoc 한 곳만 주석 바이트가 다릅니다. 사설 구현의 주석 변경까지 모두 한 곳뿐이라는 뜻은 아닙니다.

## 입력 처리와 검증 도착

시간은 ms입니다. ET p95는 표본별 p95들의 nearest-rank p95이며 10페이지에서는 그 최댓값입니다. ET는 16ms 문턱으로 선택된 관측이고 handler capture→bubble 벽시계와 합치지 않습니다. 검증 도착은 input capture→첫 onValidate입니다. 정상 입력에서 같은 오류 결과의 미배달은 검증 미실행이나 무한 지연이 아닙니다. 창 사이 절대값 비율은 계산하지 않습니다.

| 창·행 | L 처리 p95 | 채택 제품 처리 p95 | L 도착 p95 | 채택 제품 도착 p95 | 처리 ≤16.67 / 비연타 도착 ≤33.4 |
| --- | ---: | ---: | ---: | ---: | --- |
| IR-0 일반 flat-500 | 2.900 | E 4.600 | 동일 결과 미배달 200/200 | 동일 결과 미배달 200/200 | pass / 대상 아님 |
| IR-0 일반 nested-d5-f4 | 6.400 | E 6.900 | 동일 결과 미배달 200/200 | 동일 결과 미배달 200/200 | pass / 대상 아님 |
| IR-0 flat-500 검증 없음 | 2.800 | E 4.700 | — | — | pass / 대상 아님 |
| IR-0 소비자 plain state | 2.700 | E 5.100 | — | — | pass / 대상 아님 |
| IR-0 소비자 startTransition | 2.700 | E 4.600 | — | — | pass / 대상 아님 |
| IR-0 replace-200 중 타이핑 | 1.600 | E 4.000 | — | — | pass / 대상 아님 |
| IR-0 flat-500 비연타 | 9.500 | E 10.500 | 11.400 | E 4.000 | pass / pass |
| IR-0 nested-d5-f4 비연타 | 6.200 | E 13.700 | 15.600 | E 4.900 | pass / pass |
| IR-0 flat-500 연타 | 3.000 | E 5.500 | 8.200 | E 1.300 | pass / 도착 보고 전용 |
| IR-0 nested-d5-f4 연타 | 2.200 | E 13.700 | 13.300 | E 1.900 | pass / 도착 보고 전용 |
| IR-1 quiet 일반 flat-500 | 2.800 | A 4.700 | 미배달 200/200 | 미배달 200/200 | pass / 대상 아님 |
| IR-1 quiet flat-500 비연타 | 6.500 | A 9.600 | 9.500 | A 3.800 | pass / pass |
| IR-1 quiet flat-500 연타 | 2.700 | A 4.800 | 9.800 | A 1.200 | pass / 도착 보고 전용 |
| IR-1 quiet replace-200 off | 1.600 | A 0.900 | — | — | pass / 대상 아님 |
| IR-1 quiet replace-200 on | 1.600 | A 4.200 | — | — | pass / 대상 아님 |
| IR-2 array-1000 비연타 | 9.100 | E1 11.700 | 23.000 | E1 3.000 | pass / pass |
| IR-2 nested-d5-f4 비연타 | 8.400 | E1 13.500 | 14.500 | E1 6.500 | pass / pass |
| IR-2 flat-2000 비연타 | 12.500 | E1 19.100 | 18.900 | E1 7.000 | **fail** / pass |
| IR-2 array-1000 연타 | 7.600 | E1 9.500 | 14.900 | E1 1.500 | 처리·도착 모두 보고 전용 |
| IR-2 nested-d5-f4 연타 | 2.200 | E1 13.400 | 12.800 | E1 3.600 | 처리·도착 모두 보고 전용 |
| IR-2 flat-2000 연타 | 5.600 | E1 6.700 | 14.400 | E1 2.700 | 처리·도착 모두 보고 전용 |

근거: [IR-0 전체 표](ir-0-results.md#상호작용별-결과), [IR-1 채택 A 최종 관문](ir-1-results.md#채택-제품-a의-최종-관문--le0-대조), [IR-2 사전 관문과 꼬리 공개](ir-2-results.md#사전-등록-관문). A와 E1은 각 창의 고정 제품이며 최종 IR-5 제품의 키 처리를 새로 측정한 값이 아닙니다.

IR-1의 quiet는 시작 전 30초 관찰 통과를 뜻합니다. 창 내부 200페이지 중 27페이지에서 외부 PID 30% 초과가 있었고, 부하 페이지를 뺀 보조 분석에서도 replace off는 L/E0/A/AB 55.9/61.1/61.5/63.5ms로 실패합니다. 정식 표본은 버리지 않았습니다.

IR-2 flat-2000의 19.1ms는 관측 172건의 최댓값이며 전체 200키 중 16.67ms 초과는 2개(17.1·19.1ms)입니다. 모은 관측 172건의 p95는 14.4ms, 페이지별 p95 중앙값은 15.7ms입니다. 사전 등록 규칙은 유지하여 D1 발동으로 기록합니다. CPU 성능 상태 효과와 ET 검열·최대 통계를 함께 공개하며 발동을 검증 단독 원인이나 D1 효과의 증거로 읽지 않습니다.

## 마운트 첫 화면과 전체 노출

검증 None, production React 19.2.6·실제 Chromium입니다. 아래 IR-1은 같은 상대 창의 L/E0/A입니다. 각 셀은 eager painted / all revealed 중앙값(ms)이며 off에서는 같습니다. AB는 미채택이므로 최종 표에 섞지 않습니다.

| 폼·가상화 | L | E0 | 채택 A | 판정·의미 |
| --- | ---: | ---: | ---: | --- |
| flat-500 off | 54.650 / 54.650 | 83.550 / 83.550 | 51.750 / 51.750 | wall A/L 짝 비율 0.952, 원인 고침 pass |
| flat-500 on | 30.250 / 170.800 | 62.300 / 203.650 | 31.600 / 174.250 | 첫 화면 단축·전체 노출 증가, 보고 |
| nested-d5-f4 off | 101.200 / 101.200 | 159.150 / 159.150 | 89.250 / 89.250 | wall A/L 짝 비율 0.883, 원인 고침 pass |
| nested-d5-f4 on | 101.350 / 101.350 | 159.350 / 159.350 | 89.700 / 89.700 | 작은 가지라 기존 게이트가 지연하지 않음 |
| array-1000 off | 253.450 / 253.450 | 214.150 / 214.150 | 201.350 / 201.350 | 보고 |
| array-1000 on | 77.050 / 477.600 | 72.350 / 476.400 | 59.200 / 473.100 | 첫 화면 단축·전체 노출 증가, 보고 |

첫 화면 ≤16.67ms 목표는 on 세 폼 모두 미달이며 보고 목표이지 고정 관문이 아닙니다. [IR-1 원표](ir-1-results.md#상대-창-마운트--l--e0--a--ab)의 off wall 중앙값은 flat L/E0/A 55.000/83.800/51.950ms, nested 101.800/159.500/89.800ms입니다.

IR-5의 **round 3 최종 제품**은 별도 E4/E5 같은 창입니다. off 관문은 wall, on 관문은 eager painted의 레인별 중앙값 비율 E5/E4 ≤1.02입니다. 아래 eager/all은 [156페이지 원시](raw/ir-5-round3/mount-pages.json.gz) 중 공식 samples 120개의 중앙값을 다시 계산했습니다. 예열 36개는 제외했습니다.

| 폼·가상화 | E4 eager / all ms | E5 eager / all ms | 관문 E4→E5 ms | E5/E4 | 판정 |
| --- | ---: | ---: | ---: | ---: | --- |
| flat-500 off | 50.350 / 50.350 | 51.000 / 51.000 | wall 50.550→51.150 | 1.011869 | pass |
| flat-500 on | 31.550 / 171.950 | 31.450 / 173.150 | eager 31.550→31.450 | 0.996830 | pass |
| nested-d5-f4 off | 87.550 / 87.550 | 88.950 / 88.950 | wall 88.000→89.400 | 1.015909 | pass |
| nested-d5-f4 on | 87.650 / 87.650 | 88.750 / 88.750 | eager 87.650→88.750 | 1.012550 | pass |
| array-1000 off | 196.200 / 196.200 | 198.750 / 198.750 | wall 199.650→201.900 | 1.011270 | pass |
| array-1000 on | 58.800 / 449.800 | 57.850 / 443.400 | eager 58.800→57.850 | 0.983844 | pass |

근거: [IR-5 최종 비용과 판정](ir-5-results.md#round-3-최종-제품의-마운트-비용), [공식 집계](raw/ir-5-round3/round3-complete.json), [빌드 동일성](raw/ir-5-round3/build-identity.json). E4=`be1a79867`, E5 측정 소스=`f7ab4800e`이며 최종 제품 소스와 동일합니다. 이전 round 2 flat on 1.027687 FAIL·bootstrap 구간·당시 예외 인계 결정은 다른 제품의 보존 이력입니다. 현재 여섯 행의 pass로 과거 실패를 지우지 않습니다.

## 구조 변경 프레임

| 창·행 | L | E0 | 채택 A | AB(미채택) | ≤50ms 판정 |
| --- | ---: | ---: | ---: | ---: | --- |
| IR-1 quiet replace-200 off | 55.900 | 61.600 | 62.300 | 64.800 | 전부 fail |
| IR-1 quiet replace-200 on | <50, 검출 0 | <50, 검출 0 | <50, 검출 0 | <50, 검출 0 | 전부 pass |
| IR-1 상대 switch-oneOf-20 off | <50, 검출 0 | <50, 검출 0 | <50, 검출 0 | <50, 검출 0 | 전부 pass |
| IR-1 상대 switch-oneOf-20 on | <50, 검출 0 | <50, 검출 0 | <50, 검출 0 | <50, 검출 0 | 전부 pass |

LoAF API는 50ms 이상만 전달하므로 미검출을 정확한 0ms로 쓰지 않습니다. off는 manager null로 Part B가 작동하지 않으며 on은 A부터 이미 통과했습니다. switch는 승인된 부하 속 통과 유지 규칙에 따라 quiet 재측정하지 않았습니다. 근거는 [IR-1 최종 관문과 정정](ir-1-results.md#f2f3f5--파생-기록과-표-정정)입니다.

## 엄격 production 관문

| 항목 | 기준 | 수리 뒤·최종 | 판정 |
| --- | --- | --- | --- |
| `test:production` | 19통과·2실패 | IR-1b 21/21, IR-5 round 3도 21/21 | pass |
| detached production 시험 | Node 모듈이 browser stub으로 변환, execFileSync 실패 | 유효 `testTransformMode`, production ts SSR·tsx web, src 절대 접두사 | pass |
| oneOf-20 distinct freeze | 117 > 기존 상한 111 | 111, 상한·시험 유지 | pass |
| production freeze 네 행 | 1706/502/117/5 | 1706/502/111/5 | pass |
| test 환경 freeze 네 행 | 27642/10022/1564/63 | 동일 | 기존 동작 유지 |

[IR-1b](production-gate-repair.md)는 ids 공표 뒤 모든 소비자가 읽기 전용임을 확인하고 개발 모드만 동결했습니다. react18은 ts·tsx 모두 web 변환을 유지합니다. 과거 `test --run --project production`의 “production 21”은 NODE_ENV=test였으므로 엄격 production 통과로 소급하지 않습니다. 기존 기록은 보존하며 실제 script를 쓴 새 관문과 구별합니다.

## hydration과 최종 제품 검증

| 검증 | IR-4/수정 전 | IR-5 round 3 | 판정 |
| --- | --- | --- | --- |
| React 18/19 on, 입력 40개 | 서버40→입력20·placeholder20, 서버 input 재사용0 | 서버40·placeholder0 유지, DOM identity·값 보존, recoverable error0 | pass |
| off 대조군 | 서버 input40 보존 | 유지 | pass |
| 일반 / StrictMode hydration 슬롯·입력 렌더 수 | round 1의 1→2 / 2→4 | 1→1 / 2→2 | 추가 렌더0 |
| 사용자 입력 내부 Suspense | React 18에서 조기 갱신으로 client rendering | React 18/19 일반 성공, 내부 Probe 실제 commit1 | pass |
| hydration 뒤 배열 push | 기존40개를 보존해야 함 | 기존40 보존·새 /40만 지연, 노드 값41개 | pass |
| CSR 첫 게이팅 | 입력20·placeholder20 | 유지 | pass |
| 숨긴 항목의 뒤늦은 최초 입력 | round 2는 wrapper commit을 실제 노출로 오기록 | CSR·hydration 두 회귀에서 표시 뒤 placeholder 유지 | pass |
| 항목당 layout effect | 기존 2회 | 기존 기대 유지, 새 effect 없음 | pass |
| hydration / 슬롯 렌더 수 / layout-count 한정 시험 | 수정 전 실패 확인 | 각 React 프로젝트 12+2+1, 합계30 일반 성공 | pass |

근거: [IR-5 round 3](ir-5-results.md#round-3--실제-입력-commit만-원장에-기록), [최종 관문 집계](raw/ir-5-round3/gate-results.json). IO 부재 경고는 브라우저에서만 출력하여 서버 경고를 제거했습니다. 하이드레이션 자체는 추가 갱신을 만들지 않지만 React 18에서 아직 hydrate하지 않은 내부 Suspense 경계로 들어가는 이후 갱신은 client rendering으로 전환할 수 있습니다.

최종 제품의 기존 순차 실행은 unit4012·render783·react18 783·verify4839·Storybook251·엄격 production21, lint·typecheck·build 모두 통과입니다(unit/verify todo1). 이 마감에서 제품 시험을 새로 실행한 수치가 아닙니다. FCA는 기준 대비 새 finding·diagnostic0만 통과했고 기존 순환·검증 위반·열거 불확정이 남아 절대 FAIL·indeterminate입니다.

## 측정 후 채택하지 않은 설계

| 설계 | 근거 | 최종 상태 |
| --- | --- | --- |
| IR-1 Part B 작업당 마운트 예산 | 컨테이너 지연의 focus/select 소실, eager 노출 원장 부재, 가변 예산의 렌더 스냅숏 불일치, threshold/eagerCount 의미 변경. nested on eager 89.7→33.8ms이나 array eager59.2→68.5·all473.1→1154.8ms. off 실패·on 통과는 A와 같음 | 순방향 제거, Part A만 채택 |
| IR-3 AJV8 sync-first | flat-2000 오류 변환 포함 중앙값85.084→37.667µs(−55.73%)는 통과, 정상35.000→37.625µs(+7.50%)는 사전 +5% 상한 실패 | Step0 미채택, Step1 제품·Step2 브라우저 없음 |
| D1 validation-after-paint | IR-2 처리19.1>16.67로 발동했으나 검증 귀속은 p95 약1/4, 예상14.6~15.8ms는 구현 측정 아님. 도착은 약34ms 추정 위험 | 이번 단계 미구현 권고, **소유자 대기** |

Part B의 세 독립 보고는 코디네이터가 제공한 로컬 원문을 대조하여 아래에 요지를 보존합니다. 코드·측정의 최종 처리 근거는 [IR-1 미채택과 후속 정정](ir-1-results.md#part-b-미채택--독립-관문-후-최종-결정-2026-10-31)에 있습니다. 보고서의 수정 제안은 채택 제품으로 혼동하지 않습니다.

| 독립 보고 | 당시 판정·발견 | 최종 처리 |
| --- | --- | --- |
| Opus 제품 코드, 대상 5b8c7df92 | 실패: P1 1·P2 2. cx02가 render/react18 양쪽에서 실패, focus/select 소실·defer-once·옵션 의미 문제 | Part B 제거, 최종 양 프로젝트·Storybook cx02 통과 |
| codex 제품 교차 검토, 같은 대상 | P2 3: eager 영구 노출, 렌더 중 가변 예산, guard-free 개발 None의 컴파일 | Part B 제거, 개발 if 게이트 있을 때만 준비하도록 Part A 보완 |
| Opus 측정·기록, 같은 대상 | 조건부 통과: P2 2·P3 4. 재계산 수치 불일치0, quiet 내부 부하·파생 재현 누락·맥락·출처 정정 요구 | F1~F6 보충·파생 CLI·출처 증명·최종 정적 관문으로 반영 |

전체 단계의 제품 변경마다 Opus verifier 관문, #501·#506에 codex 교차 검토를 거쳤다는 점은 **코디네이터가 보고한 운영 사실**입니다. 저장소에는 모든 독립 판정 원문이 있지는 않아 각 최종 PASS 원문 전량을 이 마감이 재검증했다고 주장하지 않습니다. 수치·관문은 각 결과 문서와 보존 원시를 근거로 합니다. 설계 배정 전 코디네이터 자신의 초안도 두 번 거절되어 개정했습니다: IR-2 v1의 P1은 컴파일 실패의 onError 보고 소실이고 [D1 v2](../../plan/input-responsiveness/design.md#d1-정정--2026-10-31)에 정정했습니다. IR-5 초안의 P1 두 건은 코디네이터 보고이며, Provider 문맥 갱신의 React 18 Suspense 문제와 채택안 변경은 [IR-5 설계 정정](ir-5-results.md#결함과-설계-검증자의-정정)에 보존되어 있습니다. P1 두 건의 판정 원문 전량은 저장소에서 미확인입니다.

## 소유자 대기

| 결정 | 코디네이터 권고 | 근거·영향 |
| --- | --- | --- |
| D1을 구현할지 | 이번 단계에서는 만들지 않음 | [IR-2 원인 분해·위험](ir-2-results.md#d1-예측과-검증-도착-위험): 발동은 200키 중2개, CPU 상태 효과, 검증 약1/4. 처리 여유0.9~2.1ms를 위해 도착33.4ms 관문을 위험하게 함. mount compile 실패 rejected→sink 표면도 결정 필요 |
| virtualization 기본값 | off 유지 | [IR-1 기본값 자료](ir-1-results.md#기본값-결정-자료)와 [IR-5 최종 비용](ir-5-results.md#round-3-최종-제품의-마운트-비용): SSR blocker는 제거됐지만 reveal 전 검색·스크린 리더·자동완성 대상에서 필드가 빠지고 all-revealed 비용이 증가. 자동완성 재탐색 품질은 미측정 |
| IR-5 수정의 단계 편입을 최종 수락할지 | 수정 유지 권고 | 코디네이터 권고로 구현·단계 가지에 병합했으며 [IR-5 범위](ir-5-results.md#범위와-소유자-결정)에 별도 소유자 미응답을 명시. 루트 PR 병합 전 거절 가능 |

초기 요청·설계의 D1 확정 표현은 초기 순서의 기록이며 현재 구현 여부를 닫는 답변으로 사용하지 않습니다. 원문과 맥락은 [465 소유자 기록](../../reviews/round-465-owner-answers.md), 현행 판단은 [465 닫기](../../reviews/round-465-closing.md)에 있습니다. 버전 번호와 단계 루트 PR 병합은 reviews 운영 원칙1에 따라 Vincent가 직접 합니다.

## 이월할 미결 항목

| 항목 | 근거·다음 판단 |
| --- | --- |
| array-1000 첫 프레임 | [IR-1 backfill](ir-1-results.md#backfill-매개변수-비교): A57.6ms, 후보56.0~59.1ms. 전량 노드 구성·eager 창 비용과 backfill을 분리해야 함 |
| count-only / 시간 제한 reveal | 같은 비교: 25/4 유지, 50/8은 flat 전체 노출2.35배. 50/4 또는 시간 기반 loop 미측정 |
| if-schema guard의 전체 컴파일(G) | [IR-1 미결](ir-1-results.md#미결-항목), [설계 v2](../../plan/input-responsiveness/design.md#d1-정정--2026-10-31): None에서도 가드가 전체 컴파일, compileGuard/release가 compile보다 앞서는 공개 플러그인 순서 계약 필요 |
| 루트 재렌더의 수천 자식 reconcile | [IR-2 렌더 수](ir-2-results.md#관문-통계와-렌더-수): memo 자식2000개 조정 약0.35ms·부모 문맥 탐색 약0.16ms(활성 CPU). UpdateValue 구독 제거는 value prop의 낡은 화면 위험이 있어 tearing-safe 설계 필요 |
| CPU 성능 상태 공변량 | [IR-2 탐침](ir-2-results.md#연타와-비연타--cpu-성능-상태-탐침): 주파수 저하와 느린 코어 이동을 분리하지 못함. harness 탐침 공변량 후보 |
| 대형 입력의 layout containment | [IR-4 지침](ir-4-results.md#part-b--바꾼-사용자에이전트-문서): 명시적 크기+contain:strict의 진단상 이득, 소비자 CSS 선택. 임의 폼의 일반 효과는 미검증 |
| hydration 때 준비만 한 자식의 나중 최초 렌더 | [IR-5 기존 제한](ir-5-results.md#미결--이-단계에서-수정하지-않는-기존-결함): 자식별 실제 최초 마운트 gate와 hydration 감지 필요 |
| AJV8 sync-first 재평가 | [IR-3](ir-3-results.md#사전-등록-결정): 현재 미채택 유지. 후속 사전 등록은 typing-mix 절대 규칙으로 정상 +2.625µs와 오류 −47.417µs의 교환을 판단; 재측정으로 원 판정을 뒤집지 않음 |
| 과거 “production 21” | [IR-1b 구분](production-gate-repair.md#기존-기록의-production-구분): NODE_ENV=test 기록은 엄격 관문과 다름. 옛 줄을 고치지 않고 보충 근거 유지 |

codex가 찾은 아래 **기존 결함 다섯**은 [IR-5의 파일:행 표](ir-5-results.md#미결--이-단계에서-수정하지-않는-기존-결함)의 주소를 그대로 인계합니다. 그 표의 여섯 번째가 위의 hydration 준비 제한입니다. 여기서는 수정·추가 재현을 수행하지 않습니다.

| 기존 결함 | IR-5에 보존된 파일:행 | 후속안 |
| --- | --- | --- |
| 폐기 렌더의 gate 결정 잔존 | `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:141` | 렌더별 사본, commit에서만 보유 cache 반영 |
| 제거된 가지·장기 배열의 캐시 증가 | `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:79`, `:141`, 삭제 경로 부재 | 살아 있는 자식 pruning 또는 단조 key+WeakMap |
| 상태 보존 Fast Refresh의 옛 closure | `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:88`, `packages/winglet/react-utils/src/hooks/useLazyConstant.ts:67` | 개발 세대별 갱신 또는 최신 commit 값을 읽는 안정 컴포넌트 |
| push와 같은 batch의 focus/select 소실 | `src/components/FieldProxy/components/DeferredFieldProxy/DeferredFieldProxy.tsx:46`, `src/core/engine/write/utils/entry/dispatchRequest.ts:31`, `src/hooks/fieldNode/useFieldNodeSubscribe.ts:57` | 미소비 명령 catch-up 또는 commit까지 지연 |
| 렌더 중 공유 ref 쓰기 | `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:111`, `packages/winglet/react-utils/src/hooks/useReference.ts:92`, `src/components/FieldProxy/components/FieldInputSlot/FieldInputSlot.tsx:87` | 이벤트가 읽는 ref를 commit 시 갱신 |

## 원시 재현 실행

제품 끝 `814d21ad4`에서 실행한 지정 명령 여섯 개 모두 exit0입니다. 아래는 보존 원시의 재집계이며 새 브라우저 성능 창이 아닙니다. 마감 문서는 수치 입력을 바꾸지 않습니다.

| 저장소 루트 명령 | 실제 결과 |
| --- | --- |
| `yarn workspace @aileron/benchmark-form check:browser-results` | `IR0_RAW_REPRODUCED samples=510` (S170은 보존만, 본표 L/E340) |
| `yarn workspace @aileron/benchmark-form check:browser-results --stage=ir-1` | `IR1_RAW_REPRODUCED samples=520` |
| `yarn workspace @aileron/benchmark-form check:browser-results --stage=ir-1 --suite=backfill` | `IR1_RAW_REPRODUCED samples=120` |
| `yarn workspace @aileron/benchmark-form check:browser-results --stage=ir-1 --suite=quiet-gates` | `IR1_RAW_REPRODUCED samples=200` |
| `yarn workspace @aileron/benchmark-form check:browser-results --stage=ir-1 --derived` | `IR1_RAW_REPRODUCED samples=520`; `IR1_DERIVED_REPRODUCED gates=10 spread=4 backfill=12` |
| `yarn workspace @aileron/benchmark-form check:browser-results --stage=ir-2` | `IR2_SUITE_REPRODUCED suite=main samples=180`; `IR2_RAW_REPRODUCED samples=180` |

IR-2의 `--audit-base=<SHA>`는 특정 PR의 제품 차분을 검사하는 명시적 옵션이며 기본 원시 재현과 분리되어 있습니다. 뒤 단계 제품 변경 때문에 이전 SHA와 HEAD가 달라지는 것을 기본 실행 실패로 오인하지 않습니다. 동결 번들 해시와 inputs 출처 검사는 유지합니다. 현재 IR-0/1 기본 실행은 diff 기반 경로 감사를 수행하지 않으며 해당 감사는 명시적 `--audit-base=<SHA>` 뒤로 이동했습니다.

IR-3의 새 측정 명령은 `node --import tsx packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-3/step0/measure.mjs step0-reproduction.json`입니다. 이는 새 CPU 창이므로 이 문서 마감에서는 실행하지 않았습니다. IR-1b·IR-4·IR-5 시험 재실행 명령과 각 당시 결과는 각 결과 문서에 있으며 이 마감의 새 제품 관문으로 주장하지 않습니다.

## 원장 검사와 마감 범위

편집 전 동일 head에서 [원장 검사 절차](../../ledger/checks/README.md)의 전체 검사를 실행했습니다. baseline은 verbatim1415/327/불일치0, sup3563/불일치0/해석실패0, ref1415/문제0, owner712/미인용0, sentence17영역 missing0·bad classifications0, tokens2387/잔여399, plan80/문제1, doc-coverage미인용66/그 밖 문제0입니다.

기존 plan-links 문제1은 `plan/input-responsiveness/design.md`의 이미 분할된 ERROR-038 인용입니다. 이 마감이 추가하기 전부터 발생했고 브리프대로 기존 줄을 고치지 않습니다. 과거 checks README의 계획77개에서80개가 된 것은 이미 편입된 입력 응답성 계획 세 문서입니다. 최종 추가분 검사 결과와 증거는 아래에 덧붙입니다.

이 문서 마감은 제품 소스·시험·공개 선언·버전·빌드 산출물을 바꾸지 않으므로 제품 전체 lint/typecheck/test/build와 FCA scan을 새로 실행하지 않습니다. 기존 제품 관문은 위에 실행 SHA와 범위를 구별하여 인용했습니다. 최종 커밋의 architecture 밖 schema-form diff0, 기존 줄 보존, 전체 마감 diff의 기계 경로 감사, 원장 추가분 검사를 확인하고 branch를 push합니다. PR 개설·독립 마감 관문·루트 PR 준비는 코디네이터가 맡으며 버전·루트 병합은 소유자 몫입니다.

판정: 기록 마감, 소유자 대기 항목 세 개 유지.


## 마감 뒤 재현 도구 수리 — 2026-10-31

제품 끝에서의 위 여섯 통과 뒤 원장 추가분을 포함하여 기본 재현을 재실행하자, 변경 파일 전체를 읽는 경로 감사가 기존 `ledger/checks/owner-answers.tsv`의 과거 인용 때문에 exit1을 반환했습니다. 숫자 재현 결함이 아니라 diff에 포함된 파일의 과거 줄을 새 내용으로 검사하던 결합입니다. 같은 스레드의 코디네이터 승인으로 benchmark-form 도구만 수정했습니다. 이 절은 앞의 “기록만” 범위를 도구 수리까지 보충하며 schema-form 제품·버전·공개 선언은 그대로입니다.

IR-0/1의 checkResults와 IR-2 helper에 있던 고정 base의 변경 파일·untracked 전체 감사는 기본 실행에서 제거하고 공용 checkAddedMachinePaths를 명시적 `--audit-base=<SHA>`에서만 호출합니다. 기존 텍스트는 git diff의 추가 hunk 줄만, 새 파일은 전체, gzip 원시는 압축 해제한 전체를 검사합니다. 기본 실행의 표본·교대 순서·키·배달·summary/pairs·생성 표와 동결 번들 출처 검사는 그대로입니다. IR-2의 제품 차분 감사도 같은 명시 옵션 안에 유지합니다. 새 옵션은 원시를 덮어쓰거나 제품을 바꾸지 않습니다.

기존 owner TSV의 기계 경로는 **40회, 16행**입니다. 제품 끝 기준 행 번호는 **426, 450, 453, 455, 456, 458, 465, 468, 507, 513, 531, 614, 618, 640, 653, 677**입니다. landing에는 같은 과거 인용 계열의 경로42회가 있고 이번 추가 전후 계수가 같습니다. 경로 자체를 이 문서에 다시 복사하지 않습니다. 두 파일의 옛 줄은 운영 원칙10에 따라 유지했고 새 추가줄의 기계 경로는0입니다.

실패 우선 근거는 도구 수정 전 기본 CLI의 위 exit1과 새 helper 부재의 시험 수집 실패입니다. 회귀 시험은 과거 경로를 유지한 안전한 추가가 통과하고, 새 tracked 줄·untracked 파일·binary gzip 내부의 경로는 모두 거절되어야 합니다. 실행 결과와 최종 감사는 아래 검사 표에 이어 적습니다.


### 최종 마감 검사 결과

[검사 요약](raw/closing/ledger-checks.json)·[원장 전체 출력](raw/closing/ledger-logs.json.gz)·[최종 재현 실행](raw/closing/reproduction-runs.json)·[최종 마운트 중앙값 재계산](raw/closing/mount-final-medians.json)을 보존합니다. 아래 도구 검증은 승인 수리 뒤의 새 실행이며 각 yarn 명령은 독립 호출했습니다.

| 검사 | 최종 결과 | 범위·변화 |
| --- | --- | --- |
| 지정 기본 원시 재현6명령 | 전부 exit0, 510/520/120/200/파생10·4·12/180 | 도구 수리 뒤에도 기존 수치·표본 동일 |
| `yarn workspace @aileron/benchmark-form check:browser-results --audit-base=814d21ad4181805a5ed37c9b64e73bd43d9ed00a` | `BROWSER_CHANGES_AUDIT_OK ... newMachinePaths=0`, exit0 | 현재 diff 추가줄·untracked·gzip 전체 |
| `yarn workspace @aileron/benchmark-form test` | 5파일·34시험 통과·실패0 | 새 audit 회귀4개 포함 |
| `yarn workspace @aileron/benchmark-form lint` | exit0 | 전체 지정 benchmark 소스·fixtures·browser |
| `yarn workspace @aileron/benchmark-form typecheck:browser` | exit0 | browser·입력 픽스처 |
| 지정 재귀 의존 build | exit0 | 작업대 준비용, 추적 산출물 변경0. schema-form runtime hash는 IR-5 최종과 동일 |
| verbatim-check | 항목1415·조각327·불일치0 | baseline과 같음 |
| sup-check | 보충·충돌3582·불일치0·해석실패0 | +19 = 소유자8·결정11 |
| ref-check | 항목1415·문제0 | 같음 |
| owner-cited | 답720·인용720·미인용0 | +8 원문 전량 |
| sentence-check | 17영역 모두 missing0·bad classifications0 | 같음 |
| tokens | 목록2387·잔여398 | baseline399에서 L+소수값의 옛 L0 토큰 어휘상 일치1개. 의미적 해소를 주장하지 않음 |
| plan-links | 계획80·문제1 | 기존 design의 분할된 ERROR-038 참조1건 유지, 새 문제0 |
| doc-coverage | 미인용66·그 밖 문제0 | 기존과 같음 |
| 제품·기록·경로 | schema-form architecture 밖 diff0, 기존 줄 보존, 새 경로0 | 마감 추가분만 변경, 삭제·버전 변경 없음 |

모든 검사 CLI의 exit는0이지만 plan-links의 기존 문제1·doc-coverage의 기존 미인용66·토큰 잔여398을 전체 깨끗한 통과로 바꾸지 않습니다. **새 추가분의 오류 증가는0**입니다. 기록을 분할하지 않아 expand-split-pointers는 실행 대상이 아닙니다. 465C-10과 앞 요약의 토큰399는 편집 전 기준이며 위 표가 실제 최종입니다. IR-2 기본 명령은 이제 diff 기반 경로감사 marker를 출력하지 않고 원시 재현만 수행합니다. IR2_PATH_AUDIT_OK 출력은 수리 전 실행에만 있었으며 현재 기본 재현 표에서는 제외했습니다.

schema-form 제품 전체 시험을 재실행한 것으로 쓰지 않으며, 새로 실행한 준비 build와 benchmark 관문만 위에 구별했습니다. 독립 마감 관문은 코디네이터가 수행합니다.


### 독립 마감 관문 수정 뒤 전체 원장 재검사 — 2026-10-31

architecture README에 465라운드 마감 상태·제품 끝·단계 가지·소유자 대기 세 항목과 권고·근거 링크를 덧붙였습니다. 원장에는 README의 상태 두 문장을 줄 번호로 그대로 인용했습니다. 원시 재현 표와 IR-0/1 도구 설명은 현재 기본 실행에 맞추었고, 소유자 표의 출처 설명만 대화 전사임을 명시했습니다. 소유자 원문 여덟 개는 변경하지 않았으며 다음 라운드 문장은 닫기 끝에 한 번만 남겼습니다.

수정 뒤 원장 검사 절차 1절의 전체 명령을 실행했습니다. bundle 재생성·17영역 sentence-check·tokens inventory/check를 포함하며 분할 항목이 없어 expand-split-pointers는 해당하지 않습니다. [수정 뒤 검사 요약](raw/closing/ledger-checks-gate-fixes.json)과 [수정 뒤 전체 출력](raw/closing/ledger-logs-gate-fixes.json.gz)을 기존 증거와 별도로 보존합니다.

| 검사 | 관문 수정 뒤 결과 | 직전 마감 대비 변화 |
| --- | --- | --- |
| verbatim-check | 항목1415·조각327·불일치0 | 같음 |
| sup-check | 보충·충돌3584·불일치0·해석실패0 | 3582+README 상태2문장 인용 |
| ref-check | 항목1415·문제0 | 같음 |
| owner-cited | 답720·인용720·미인용0 | 원문8개 변경 없음 |
| sentence-check | 17영역 모두 missing0·bad classifications0 | 같음 |
| tokens | 목록2389·잔여398 | README 제품SHA·단계 가지2토큰 추가, 모두 상태 인용으로 포괄 |
| plan-links | 계획80·문제1 | 기존 분할된 ERROR-038 인용만 유지, 새 문제0 |
| doc-coverage | 미인용66·그 밖 문제0 | 기존과 같음 |

새 인용·원문·계획 문제는0이며 tokens 잔여398을 유지합니다. 제품 끝 대비 architecture numstat에서 이 PR 전부터 존재한 파일의 삭제 줄은0입니다. 문서만 바뀌었으므로 직전 제품·benchmark 관문의 증거는 해당 입력에 한해 유효하며 새 제품 시험으로 주장하지 않습니다.
