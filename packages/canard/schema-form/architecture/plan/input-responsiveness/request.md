# 입력 응답성 — 요청과 단계

2026-10-30. 기준 가지는 `feat/schema-form-input-responsiveness`, 기준 커밋은 `5d1348ed16054efa1ec431945eb00472f4eef7f1`입니다. 단계 이름은 입력 응답성(input-responsiveness)이며 IR-0은 측정·기록만 수행합니다.

| 단계 | 범위 |
| --- | --- |
| IR-0 | 실제 브라우저 입력 응답성 기준선 |
| IR-1 | 다음 화면 뒤 검증 슬롯 |
| IR-2 | 작업당 마운트 예산과 virtualization 기본값 결정 |
| IR-3 | 문서와 계약 |
| IR-4 | 마감 |

## 소유자 원문 — 2026-10-30

아래는 발화 순서 그대로입니다.

1. "좋아. 근데 한가지가  좀 걸리는군.. 동기식 엔진으로 바꾼건 좋으나 그때문에 입력 안정성이 깨져서 블로킹 되는 문제가 발생할 수 있다. 이는 분명 손실이라, 이를 개선하는 설계와 방법이 필요하지 않을지 검토해보자."
2. "해당 설계를 구체화해보겠어? 동기식의 안정성과 입력 경험 감소를 둘 다 해결할 수 있는 적절한 설계를 제안해봐"
3. "어떤걸 권장하지?"
4. "그래 시작하지. 너는 되도록 검증에 집중하도록"

세 번째 물음에 코디네이터는 검증 시점을 다음 화면 뒤로 옮기고 `microtask` 옵션을 두지 않으며, 루트 `onChange`는 동기로 유지하고, `virtualization` 기본값은 IR-0 뒤 정할 것을 권고했습니다. 네 번째 발화는 이 권고에 따라 단계를 시작한 답변입니다.

## 결정

| 번호 | 상태 | 내용 |
| --- | --- | --- |
| 1 | 확정 | 검증은 다음 화면 뒤로 옮기며 옛 시점의 옵션을 두지 않습니다. |
| 2 | IR-0 뒤로 보류 | virtualization 기본 켬 여부는 측정 뒤 결정합니다. |
| 3 | 확정 | 루트 onChange를 동기로 유지합니다. |

## IR-0 측정 보완

코디네이터는 정상 입력에서 같은 오류 결과의 배달이 억제되는 경우를 확인하고, 실제 AJV pattern으로 키마다 유효성을 바꾸는 보조 픽스처를 승인했습니다. 100ms 간격의 비연타는 검증 도착 관문에, 무지연 20키 연타는 보고에 사용합니다. 원래 정상 입력 행은 유지하고 레인별 미배달 수를 기록합니다. 단계 라운드 기록은 마감 담당자가 작성합니다.

## IR-1 범위 조정 — 2026-10-30

코디네이터가 마운트 둔화 원인 진단과 D3를 D1보다 먼저 수행하자고 제안하자 소유자는 "제안한 방법으로 하세요. 순서를 지키는것에 얼매일 필뇨 없습미다"라고 답했습니다. 이어 조건과 원리에 따라 작업자가 판단할 권한에 대해 "음 허용한다. 조건과 원리를 기반으로 판단하도록 하라"라고 답했습니다. 이 단계는 검증 루트 eager compile 원인 고침(D0)과 작업당 마운트 예산(D3), 실제 브라우저 재측정을 먼저 수행하며 D1은 이후 단계로 남깁니다.

## 상대 비교 측정 규칙 — 소유자 원문, 2026-10-30

"흠. 네가 선점하면 안되는건가... 기존 값을 절대값비교하지 않고, 기존과 수정을 교차검증하면 오차를 줄일 수 있지 않을까? 상대값 비교를 하면 말이지. 엔탈피처럼"

정숙 관찰의 반복 거절에 대해 소유자는 같은 창에서 기존·수정 레인을 교차 측정하는 상대 비교를 제안했습니다. 코디네이터는 30초 관찰 3회 거절 뒤 L/E0/A/AB를 표본별 순환하는 상대 비교 창을 즉시 시작하고, 같은 창 L 대비 짝 차이·비율 중앙값과 IR-0의 정숙 L을 사용한 환산 관문을 적용하도록 확정했습니다. 최대값·p95와 이에 의존한 구조 변경 최장 프레임·키 처리 관문은 잠정이며, 백그라운드 정숙 관찰이 뒤늦게 성공하면 해당 행만 다시 측정합니다. 외부 CPU를 표본마다 보존하고 Spotlight와 30% 선은 유지합니다.

## IR-1 결과 — 2026-10-30

| 단계 | 결과                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 남은 결정                                                                                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IR-1 | 보유의 eager compile 제거와 작업당 eagerCount 20, StrictMode 반복 판정 재사용을 구현했습니다. backfill은 비교 후 25/4로 유지했습니다. 상대 main 520·backfill 120·정숙 재측정 200표본을 보존했습니다. A의 flat/nested off 마운트는 같은 창 L보다 빠르고, 키 처리·비연타 검증은 정숙 관문을 통과했습니다. replace-200 off 최장 프레임은 모든 레인에서 실패(L/E0/A/AB 55.9/61.6/62.3/64.8ms), on은 모든 레인에서 ≥50ms 검출 0입니다. 코디네이터 지시에 따라 더 튜닝하지 않고 실패를 기록해 인계합니다. | virtualization 기본값은 그대로 off이며 결정 자료를 코디네이터를 통해 소유자에게 넘깁니다. D1과 if 가드의 전체 컴파일, 대형 배열 첫 프레임·backfill 후속 비교는 남깁니다. |

## IR-1 독립 관문 후 정정과 최종 범위 (2026-10-31)

IR-1은 Part A만 채택하고 Part B는 중첩 focus/select·defer-once·렌더 스냅숏·옵션 의미 결함과 관문 효과 부재, array 노출 비용 회귀로 미채택합니다. 기존 AB 원시와 표는 미채택 측정 시도로 보존하며 순방향 커밋으로 제품에서 제거했습니다. 개발 모드의 guard-free None 폼 준비만 제한적으로 보완하고 생산 동작은 측정 A와 같음을 확인합니다.

맥락 정정: 2026-10-30의 "음 허용한다. 조건과 원리를 기반으로 판단하도록 하라"는 일반적인 권한 부여가 아니라 지연 컴파일 고침이 계약 시험 두 개를 바꾸며 D3와 IR-1에 함께 묶이는 것을 허용한 답변입니다. "흠. 네가 선점하면 안되는건가... 기존 값을 절대값비교하지 않고, 기존과 수정을 교차검증하면 오차를 줄일 수 있지 않을까? 상대값 비교를 하면 말이지. 엔탈피처럼"에 대해 코디네이터는 호스트를 선점하지 않고 같은 창 상대 비교로 진행하는 방침을 답했습니다. 기존 인용 원문은 변경하지 않습니다.

소유자 원문(2026-10-30): "이후 작업은 opus가 이어받도록. 판단에 대해서는 맡기겠지만, 스스로를 맹신하지 말도록. 이후는 롱턴 작업을 진행하도록 하라". 코디네이터 모델이 변경되었고 이후 설계 단계는 디스패치 전에 독립 검증자가 실제 코드와 대조하며, 모든 단계 결과는 병합 전에 독립 관문을 통과하도록 정했습니다.


## IR-1b — production 관문 수리 (2026-10-31)

| 단계 | 편입 이유 | 결과 |
| --- | --- | --- |
| IR-1b | 입력 응답성 단계가 의존하는 엄격 production 관문이 기존 transform 설정 결함과 oneOf-20 freeze 117 > 111로 실패하고 있어 단계 안에서 수리했습니다. | 기존 상한·시험을 유지하며 엄격 production 21/21을 복구했습니다. 환경별 확인·탐침·전체 관문은 [수리 결과](../../verification/input-responsiveness/production-gate-repair.md)에 기록하며 병합 전 독립 검증을 거칩니다. |


## IR-2 결과 — 2026-10-31

| 단계 | 결과 | 남은 결정 |
| --- | --- | --- |
| IR-2 | 제품 317f215dc와 공개 0.16.1의 중량 검증 타이핑 6행·기본 검증 마운트 3행을 같은 창에서 측정했습니다. 시작 전 30초 관찰을 첫 시도에 통과했고 3예열·10새페이지, 총 180표본을 무중단으로 보존했습니다. 비연타 E1 처리/검증 도착 p95는 array-1000 11.7/3.0ms, nested-d5-f4 13.5/6.5ms, flat-2000 19.1/7.0ms입니다. flat 처리 19.1>16.67로 사전 등록 D1 규칙이 발동하며 도착 세 행은 모두 33.4ms 이내입니다. 연타·마운트는 보고 전용이고 D1·G 제품 구현은 없습니다. 원시·모든 표·CPU 귀속은 check:browser-results --stage=ir-2로 재현합니다. | D1 v2의 후속 구현과 mount compile 실패의 rejected→sink 표면, G의 공개 플러그인 순서 계약 변경은 소유자·코디네이터에게 넘깁니다. 창 내부 부하와 전체 표는 [IR-2 결과](../../verification/input-responsiveness/ir-2-results.md)에 보존했습니다. |


## IR-3 AJV8 동기 우선 사전 측정 결과 — 2026-10-31

기존 상단 단계표의 문서·계약 단계명은 보존하며, 이 항목은 별도 디스패치된 AJV8 동기 우선 컴파일 측정입니다. 플러그인 로컬 AJV 8.17.1과 IR-2 세 스키마를 셀별 1,000회 예열·5,250호출로 비교했습니다. flat-2000의 오류 변환 포함 중앙값은 async 85.084µs → sync 37.667µs(−55.73%)였지만 정상은 35.000µs → 37.625µs(+7.50%)로 사전 등록 상한 +5%를 넘었습니다. 따라서 **not adopted(미채택)**로 Step 0에서 중단했습니다. 제품·버전 변경, Step 1 구현과 Step 2 브라우저 재측정은 없습니다. 전체 표·원시·재현 방법과 관문 실행 상태는 [IR-3 결과](../../verification/input-responsiveness/ir-3-results.md)에 보존하며 독립 검증 후 소유자 판단을 기다립니다.

## IR-4 대형 폼 지침과 SSR 확인 — 2026-10-31

README·영어/한국어 SPECIFICATION·에이전트 arrays-and-scale 지식에 IR-1의 virtualization 조건·첫 화면과 전체 노출 비용, IR-2의 검증 OnRequest·입력 containment, IR-0의 소비자 startTransition 수치를 연결했습니다. 제품 소스는 바꾸지 않았습니다. React 18/19 모두 IO 부재 SSR의 입력 40개가 IO 활성 hydration 뒤 입력 20개와 placeholder 20개로 바뀌고 서버 input 재사용 0개인 mismatch를 확인했습니다. on 결함 시험은 패키지 관례에 따라 이유가 포함된 it.fails로 실행하며, off 대조군은 일반 통과 시험으로 보존했습니다. 결함을 고칠 때까지 서버 렌더링 페이지에서는 virtualization을 켜지 않습니다. 상세 관측·미결 항목 IR4-SSR-01·관문은 [IR-4 결과](../../verification/input-responsiveness/ir-4-results.md)에 기록합니다.

D1을 이번 단계에서 구현하지 않고 virtualization 기본값을 off로 유지하는 **코디네이터 권고**를 따랐습니다. 두 사안은 아직 소유자 결정이 열려 있으며 이 문서 추가는 소유자 확정이나 기본값 변경이 아닙니다. 병합 전 코디네이터의 독립 검증을 거칩니다.

## IR-5 하이드레이션 보존 가상화 — 2026-10-31

| 단계 | 결과 | 남은 결정·위험 |
| --- | --- | --- |
| IR-5 | Provider를 유지하고 서버 스냅숏·기존 commit effect의 hydration ref·실제 입력 슬롯 자신의 노출 원장으로 SSR과 React 18 내부 Suspense를 수정했습니다. 일반/StrictMode 슬롯·사용자 입력 렌더는 1→1/2→2, Suspense 내부 Probe는 실제 commit 1회이며 기존 항목당 두 layout effect 계약을 유지합니다. 숨긴 배열 항목은 CSR·hydration 모두 실제 입력 commit 전 원장에 기록되지 않아 remount 뒤 처음 표시할 때 placeholder를 유지합니다. round 3 마운트 여섯 행 E5/E4는 flat off/on 1.011869/0.996830, nested off/on 1.015909/1.012550, array off/on 1.011270/0.983844로 모두 사전 등록 1.02 이내입니다. 최종 unit4012·render/react18 각783·verify4839·Storybook251·엄격 production21 및 lint·typecheck·build가 통과했고 공개 도달 선언308개 의미차이0(props JSDoc만 주석 차이)·FCA 새 finding/diagnostic0·측정 runtime 일치를 확인했습니다. 최종 순차 관문은 [IR-5 기록](../../verification/input-responsiveness/ir-5-results.md)에 보존합니다. | 하이드레이션 때 준비만 하고 사용자 브랜치가 나중에 처음 렌더한 자식은 게이팅을 생략하는 기존 제한을 문서화했으며 후속 수정은 남깁니다. React 18에서 아직 하이드레이션되지 않은 내부 Suspense 경계로 들어가는 이후 갱신은 클라이언트 렌더링으로 전환할 수 있습니다. 소유자의 이번 단계 수정 여부와 D1·기본 off 결정은 별도입니다. 이전 제품의 flat-500 on FAIL·bootstrap·당시 예외 인계 결정과 원시는 superseded 이력으로 유지하며 현재 비용 판정은 round 3 제품의 새 창으로 합니다. |


## 단계 마감 — 2026-10-31

제품 끝은 `814d21ad4`(#506), 단계 가지는 `feat/schema-form-input-responsiveness`입니다. IR-0부터 IR-5·IR-1b까지 일곱 PR을 편입했고 이 마감은 기록만 추가합니다. 동기 정착·루트 onChange는 유지하고 lazy validator compile·개발 if 게이트 한정 준비·엄격 production 관문 수리·hydration-safe virtualization을 반영했습니다. 작업당 마운트 예산 Part B와 AJV8 sync-first는 미채택이며 D1은 구현하지 않았습니다.

제품 끝에서 지정 원시 재현 여섯 명령을 모두 실행해 IR-0 510표본, IR-1 main520·backfill120·quiet200, derived gates10·spread4·backfill12, IR-2 180표본을 재현했습니다. 새 성능 창을 열거나 최종 제품의 모든 키 입력을 다시 측정한 것은 아닙니다. IR-5 round3 최종 비용 여섯 행은 모두 E5/E4≤1.02이며 이전 round2 FAIL은 다른 제품의 보존 이력입니다.

D1 구현 여부·virtualization 기본 off·IR-5 수정의 최종 수락은 **소유자 대기**입니다. 초기 순서표와 D1 확정 문구는 과거 기록으로 유지하고 현행 상태는 이 절로 보충합니다. 소유자 원문 여덟 개와 맥락은 [465라운드](../../reviews/round-465-owner-answers.md), 종합 표·관문·미결·재현 결과는 [마감 결과](../../verification/input-responsiveness/closing-results.md)에 있습니다. 버전 번호와 단계 루트 PR 병합은 소유자가 직접 하며 이 문서 작업에서 실행하지 않습니다.


마감 뒤 코디네이터 승인 보충(2026-10-31): 원장 옛 인용의 기계 경로를 보존하면서 재현 CLI가 이후 head에서도 실행되도록 benchmark-form의 diff 의존 경로 감사를 명시적 `--audit-base=<SHA>` 옵션으로 옮겼습니다. 기본 원시·해시·표 재현은 유지하고 benchmark 시험·lint·browser typecheck와 여섯 재현 명령을 검증합니다. schema-form 제품 변경은0이며 [마감 결과](../../verification/input-responsiveness/closing-results.md#마감-뒤-재현-도구-수리--2026-10-31)에 승인·기존 경로 행 번호와 결과를 보충합니다.


## IR-6 — D1 구현 결정 (2026-10-31)

| 단계 | 범위 | 소유자 결정 |
| --- | --- | --- |
| IR-6 | 쓰기·OnChange 마운트 검증을 다음 화면 뒤 한 슬롯으로 합치고, 하위 트리 validate가 전체 폼의 대기·진행 판정을 취소하지 않도록 수정합니다. | D1을 지금 구현합니다. 버전은 유지하고 virtualization 기본 off·IR-5 수정 유지를 수락합니다. 루트 PR #508은 D1 편입 뒤 소유자가 병합합니다. |

아래 9–12번은 2026-10-31의 원문과 맥락을 그대로 보존합니다. 11번 발화의 줄바꿈도 원문입니다.

9. (after the coordinator opened root PR #508 and asked whether to confirm the three open decisions as recommended) "최종 상태를 설명해줘. 지연 평가 기능이 어떻게 들어간거지? 발생한 회귀나 문제는 없었어?"
10. (after the coordinator explained the final state, the lazy validator compile and the absence of measured regressions) "음... 이거 우리가 해결하려고 했던 문제가 그거 아녔니 그.. 동기식 입력이다보니 사용자 입력이 브라우저를 블록하는 문제? 그건 해결을 한거야?"
11. (after the coordinator answered that the synchronous keystroke path itself was not changed, that validation still runs inside the keystroke task, and asked whether to build D1) "잠깐 잠깐. 내가 결정해야 하는 내용을 다시 정리해서 알려줘.
어떤걸 한거고 뭐가 남은거지? 그리고 validation 동작이 무거우니까 검증을 동기적으로 하는걸 빼서 입력 사이클(bulk 든 뭐든 여러 웨이브에 걸친 입력)이 끝난 다음 1번만 검증하도록 하는거 아니었나? 잘못 이해하는 부분 있다면 설멸해다오."
12. (answer to the four listed decisions: 1 build D1 now (recommended); 2 keep the virtualization default off with documentation (recommended); 3 keep the IR-5 hydration fix (recommended); 4 root PR #508 merge and version are the owner's, recommended to merge after D1 lands) "지금 구현하죠. 버전은 바꾸지 않고 나머진 모두 권장대로 수락합니다."
   Decisions derived from it: D1 is built in this stage; the version number stays unchanged; the virtualization default stays off; the IR-5 fix is accepted; root PR #508 is merged by the owner after D1 lands (rule 1 unchanged).


## IR-6 연속 입력 주기 결정 (2026-10-31)

13. (while the IR-6 worker was implementing D1) "지금 설계에 대해 설명해다오"
14. (after the coordinator explained the D1 design) "근데 유효성검사 자체는 ajv같은 외부 검증기가 담당하잖아? 말하자면 그런건가? 지금은 검증기가 마이크로테스크 뒤에 돌아서 전체 블록타임을 잡아먹는데 이젠 이걸 명시적으로 한프레임(혹은 이전 이벤트루프타임)을 미뤄서 이걸 구분하겠다는건가? 뭔가 상수 타이머 100ms 을 대기하고 하는 디바운스 구조는 아니겠지?"
15. (after the coordinator answered that D1 schedules after the next frame and the 100 ms timer is only a hidden-tab safety net) "이해했어. 근데 ajv 전체검증은 비동기 아닌가? 동기는 분기전환 전용이고.
그리고 근데 그럼 0.16.1 판에서 했던 방식이 나은거 아니야? 이전버전에서도 시간 갭을 둔건 아니고 마이크로태스크 종료만 기다리고 검증했던거같은데
그거랑 다른건가?"
16. (after the coordinator showed that the AJV8 plugin's asynchronous validator runs its checks synchronously at call time, and that 0.16.1 cancels and re-arms a setTimeout macrotask) "한가지만 좀 질문을 하고싶은데...
연속입력(구판에서 입력이 굶는 경우) 케이스는 사실상 사용자 입력보단 드레그나 스크롤, 아니면 프로그래믹한 입력 케이스 아닌가? 디바운스가 아니라 프레임 이월이니까. 그럼 굶는다기보단 실행을 지연하는거 아닌가. 그걸 다 평가하는것 보단 입력 버스트가 끝난 다음에 한번 검증하는게 유리하지 않나...? 검증이 비싼 작업이니까"
17. (after the coordinator proposed three options and recommended leading plus trailing with a 200 ms cap) "선행은 지금과 동일하게, 다음 프레임 검증 보장이고,
후행 보상은 그 이후 1프레임 기다리고 다음 프레임(입력 후 2프레임)에 검증을 한다, 다음 프레임에 업데이트가 있으면 검증 이월, 최대 200ms 지나면 1번은 검증 보장

이게 맞나?"
18. (answer to: apply the rule — leading after the next frame, carry over while input continues, one trailing run after a quiet frame, a cap measured from the last run — in this fix round?) "상한을 500ms로, 이외에는 적용. 코드를 잘 응결시켜서 해당 코드가 다른 도메인코드와 섞이지 않고 원리와 기능이 집중되도록 하세요."
   Decisions derived from it: the continuous-input cadence is built in IR-6 with a 500 ms cap measured from the last automatic run; its timing policy lives in one cohesive unit that holds no validation-domain code.
19. (after the coordinator's UX evaluation: false stale-error flash when the display condition turns on in the same keystroke, mount pop-in with showError true, and the 500 ms cap being above the 100 ms perception threshold, with 150 ms offered) "흠 150ms 로 하는건 좀 연산부담이 있지 않겠나? 어차피 디바운스 설정같은건 fieldInput 에서 하는거니까 이건 실시간성 느낌 보장이 나은가 그럼 100ms로 해도 될거같은데...
나머지 버그나 ux 문제는 해소하도록. 거짓 에러 깜빡임은 눈에 많이 띈다"
   Decisions derived from it: the cadence cap becomes 100 ms (debouncing belongs to FieldInput components; the engine guarantees a real-time feel); the false error flash, the mount pop-in and the other open bugs and UX problems are fixed in IR-6.


## IR-6 추가 소유자 결정 — 2026-10-31

18b. (chronologically between 18 and 19; asked after the cadence decision) "현재 스팩이 ux상 문제가 없는지 평가해봐. 1-2 프레임 정도 오류평가나 표시가 밀리는건 오류는 아니라고 본다. 인간의 인지상 말이지."
20. (while the round-4 fixes were under review) "새로 발견된 문제나 수정중인 문제가 있나?"
21. (after the coordinator described round 5, which kept error-visibility memory in React with reference counts) "잠깐, 오류의 표시는 리엑트에 두지 않았으면 하는데. 노드는 사라져서 그런건가? 에러의 표시여부를 결정하는 데이터가 현재 없나?"
22. (sent right after 21) "그리고 비동기 검증이 도는 중 새 값이 들어오면 이전 값으로 판정되는건 문제가 있는거 아닌가? 마지막에 들어온 값으로 판정이 되어야 할거같은데??"
23. (answer to: rebuild round 5 with the error-visibility decision in the engine and validate() re-validating to the newest value — 1 both (recommended), 2 engine only, 3 other) "둘다 진행합니다."
   Decisions derived from it: the error-visibility continuity data moves into the engine (node state at the last verdict) and displays decide from node data only; explicit validate() resolves with a verdict for the value current when it resolves (bounded re-validation); the design is checked by an independent verifier before dispatch.
24. (after the coordinator summarized amendment 8, including Z: validate() re-runs until its verdict matches the newest value) "근데, validate 를 실행하는 경우(onRequest)인거지? 그럼 실행시점의 값이 맞..는거 아닌가? 이걸 재시도까지 하는게 맞아? 검증은 값을 바꾸지 않을텐데"
   Outcome: the coordinator checked submitForm.ts (it captures outputValue before awaiting validate() and submits that same value) and withdrew Z; explicit validate() keeps call-time snapshot semantics, displays already take only the newest verdict.
25. (after the coordinator withdrew Z and corrected its earlier claim about submit) "그래. 기본적으로 계약을 따라야지. 다른 곳에 또 이런 실수가 있진 않을까 좀 걱정되네."
   Action: the coordinator started a read-only audit of every IR-6 behaviour change and recorded limitation against the package contracts (spec ledger, SPECIFICATION, README, public JSDoc, INTENT/DETAIL, ADRs).
26. (after the coordinator reported the contract audit and its decisions, including a planned setTimeout fallback because the slot "requires MessageChannel or setImmediate") "잠깐. 설명이 명확히 이해가 안되는군.
좀 더 자세히 설명해다오. 그리고,  MessageChannel 이나 setImmediate 가 있어야 하는 요구 에 대해선 무슨 의미지? 써야되면 common-utils 에서 가져다 써. 이미 레거시에서는 여기서 쓰고있었어"
   Outcome: the coordinator confirmed that 0.16.1 shipped `scheduleMacrotask` from `@winglet/common-utils/scheduler`, withdrew the fallback (amendment 8 R-e) and keeps the common-utils scheduler unchanged; the audit's "new requirement" finding was wrong and had been relayed unchecked.
27. (after the coordinator's detailed explanation, whose commit-only example used a first blur setting touched, and whose item 5 kept the child-errors hook counting hidden children as a pre-existing behaviour) "2번에서 touched 는 한번 만지면 true 고 따로 clear 를 하지 않으면 사라지지 않는데? 이건 한번이라도 만졌느냐를 보는 플래그지, 포커스 상태를 의미하는건 아닌데. 뭔가 잘못 구현된거 아닌가? 확인해봐 
5번에서, 숨겨진 자식(hidden)이면 당연히 포함되어야 하고, 비활성 자식(inactive)이면 값 자체가 빠져서 오류가 없을거라 생각하는데? 어떤 상태를 말하는거지?"
   Outcome: touched is implemented as the owner describes (set once after the first blur, a repeated set is a no-op, cleared only by clearState or reset); the coordinator's example was wrong, because interaction-state writes do not advance the commit number at all; the real trigger is a context content change. Hidden children counting in the hook is the intended contract; codex round 4's finding is not a defect.

28. (after the round-5 dispatch; the coordinator then traced the engine itself and wrote engine-mental-model.md) "작업 지시를 모두 한 다음에, 모든 구현과 계획, 원장에 대해서 재검토를 진행하라.
touched 예시 오류나 동작을 잘못 파악하는 것,
설계와 원칙, 핵심 원리, 멘탈모델 등 전반에 걸쳐서 네가 스스로의 이해를 증진하라.
지금처럼 일부만 파악하거나 스팩을 못따라가거나, 스팩을 구현이 못따라가는건 큰 문제이다. 
네가 먼저 다 파악을 해둬야 구현자나 설계자, 검증자 질의에 대해 흔들리지 않는다. 

/seiri:trace-structure"
   Action: the coordinator traced the write, settlement, interaction-state, validation, scheduling, React display and record paths at 07c4d5d93 and recorded them with citations; R-a was widened to the discarded mount verdict (a gap already present at facd72a71).
29. (after the coordinator noted that the FieldNodeState.Dirty JSDoc says "Value diverged from its initial/default state" while only user input sets it) "dirty는 수정 발생을 했는가 라는 의미야 값의 동일성을 표현하는 것은 아니야. 주석이 잘못된거같네. 근데 이 dirty가 셋팅되는 조건은 좀 궁금하네. 직접 수정 뿐만 아니라 setValue나 injectTo 같은 파생값 변경도 dirty가 셋팅되나? 그래야될거같긴 한데... 초기값을 바꾼적이 없는 경우에만 false인 거고... 

초기값과 다른가를 평가하는 상태는 changed 나 differenced 같은 상태가 신설되어야 할거같네. 필요할까? 어때? 상태이름은 적절한걸로 바꿔도 된다"
   Coordinator's answer recorded with it: dirty is set only by the user-input paths (FieldInputSlot handleChange); setValue, array verbs, fill, derived, injectTo, unsetValue, exit clearing and trim never set it (WRITE-083; VALUE-022 owner C6); 0.16.1 behaved the same; recommended keeping that contract, fixing the JSDoc, and adding a value-versus-baseline property as a computed read in a separate stage.
30. (answer to: keep dirty as user-input only, fix the JSDoc in round 5, and design the baseline-difference property in a separate stage after #508?) "그래 그렇게 하자. 지금 단계와 분리해서 작업하도록 예약해줘. 또한 혹시 상태값을 다른 이름으로 바꾸는게 필요할지도 검토해봐. 그냥 관용적으로 썼던거라 지금처럼 완전 변환을 할때 바꾸지 아니면 못바꿀거라. 

그리고 이제 충분히 전체 설계를 파악한거지?"
   Decisions derived from it: dirty keeps its contract; its JSDoc (and Touched's) is corrected in IR-6 round 5; a separate stage after #508 designs the baseline-difference property and reviews the state names, and must land before the next release (the version and the release stay the owner's).
