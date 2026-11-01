# 465라운드 닫기 — 입력 응답성의 비용 분리, 지연 컴파일·hydration 수정과 소유자 대기

2026-10-31. 소유자 원문 여덟 개는 `reviews/round-465-owner-answers.md`에 맥락과 날짜를 보존합니다. 기준 `5d1348ed1` 뒤 PR #500–506의 일곱 squash 커밋을 대조했고 제품 끝은 `814d21ad4`입니다. 이 마감은 문서·원장만 추가하며 D1 구현·virtualization 기본값·IR-5 수정 수락을 소유자 확정으로 바꾸지 않습니다.

## 편집자 결정

- **465C-01 (IR-0 — 동기 엔진의 입력 블로킹 가설과 실제 비용의 분리)**
  - 【추론】 소유자의 입력 안정성 우려와 구체 설계 요청·권고 물음(`reviews/round-465-owner-answers.md:7-9`)에 대해 실제 production Chromium 기준선을 먼저 세웠다. 일반 flat handler 중앙값 L0.600/E0.450ms와 전체 키 처리 관문 통과는 동기 렌더 블로킹 가설을 뒷받침하지 않지만 ET p95 L2.900/E4.600ms까지 모든 통계가 개선됐다는 뜻은 아니다. 실제 손실은 마운트 전체 컴파일, 가상화 없는 구조 변경, 대형 폼의 검증·레이아웃·루트 reconcile로 나누며 동기 정착·루트 onChange·즉시 validate/submit은 유지한다. 근거는 `verification/input-responsiveness/ir-0-results.md`와 `verification/input-responsiveness/closing-results.md`의 영역별 표다.
- **465C-02 (IR-1 — Part A만 채택, Part B 제거와 개발 가드 한정)**
  - 【추론】 소유자의 순서 조정과 계약 시험 두 개 변경 허용(`reviews/round-465-owner-answers.md:11-12`)은 진단·D3와 lazy compile을 함께 검증하는 범위이지 일반 권한 부여가 아니다. 보유에서 컴파일을 제거하는 Part A로 flat/nested off wall A/L 짝 비율0.952/0.883을 얻었고 개발 guard-free None은 전체 컴파일을 건너뛴다. if 게이트의 전체 컴파일은 남는다. Part B는 컨테이너 focus/select 소실·defer-once·렌더 스냅숏·옵션 의미 문제와 array all473.1→1154.8ms 회귀 때문에 제거했다. 세 독립 보고의 요지와 최종 처리, A의 관문은 `verification/input-responsiveness/closing-results.md`와 `verification/input-responsiveness/ir-1-results.md`에 보존한다.
- **465C-03 (측정 창 — 호스트 비선점·같은 창 상대 비교·꼬리 공개)**
  - 【추론】 소유자의 상대 비교 제안(`reviews/round-465-owner-answers.md:13`)에 따라 호스트·Spotlight·WindowServer를 건드리지 않고 같은 창 L/E0/A/AB를 교차했다. 정숙 IR-0 L 환산과 잠정 최대 통계를 구별하고, 관찰 성공 뒤 승인한 다섯 행만 다시 측정했다. 시작 관찰 통과를 창 전체 무부하로 읽지 않으며 IR-1 quiet의 부하27/200페이지를 공개한다. IR-2 flat19.1ms는200키 중 초과2개와 ET 관측172개의 최댓값이고 모은 관측 p95는14.4ms다. CPU 성능 상태·ET 검열을 밝히되 사전 집계와 발동 판정은 바꾸지 않는다(`verification/input-responsiveness/ir-1-results.md`, `verification/input-responsiveness/ir-2-results.md`).
- **465C-04 (IR-1b — 실제 production 관문 복구와 과거 기록의 구분)**
  - 【추론】 `verification/input-responsiveness/production-gate-repair.md`대로 유효하고 src에 고정한 testTransformMode와 개발 전용 ids 동결로 엄격 test:production을19/21에서21/21로 복구했다. oneOf-20 distinct freeze는117→111이며 기존 상한111·시험은 유지했다. react18은 ts/tsx web 변환을 유지한다. 과거 project production의21통과는 NODE_ENV=test이므로 실제 production 통과로 소급하지 않고 옛 기록에 이 근거를 보충한다. 최종 IR-5도 엄격21/21이다.
- **465C-05 (IR-2·D1 — 기계적 발동 유지, 이번 단계 구현은 소유자 대기)**
  - 【추론】 `verification/input-responsiveness/ir-2-results.md`의 비연타 E1 처리/도착 p95는 array11.7/3.0·nested13.5/6.5·flat19.1/7.0ms로 flat이16.67ms를 넘어 D1은 발동했다. 진단의 검증 실행·배달·두 번째 커밋은 p95 약4분의1이며 D1 처리 예상14.6~15.8ms의 여유는0.9~2.1ms, 도착은 약34ms로33.4ms 관문을 넘을 위험이 있다. 발동은 인과 효과나 구현 승인이 아니므로 이번 단계 미구현을 권고하고 소유자 답을 기다린다. D1 v2·G는 준비된 미구현 설계이며 mount compile 실패의 rejected→sink와 공개 플러그인 순서 계약도 미결이다(`plan/input-responsiveness/design.md`).
- **465C-06 (IR-3 — AJV8 sync-first 사전 규칙 미채택)**
  - 【추론】 `verification/input-responsiveness/ir-3-results.md`에서 flat 오류 변환 포함85.084→37.667µs는−55.73%로 통과했으나 정상35.000→37.625µs는+7.50%로 사전+5% 상한을 넘었다. Step0에서 미채택하고 제품 구현·브라우저 Step2를 시작하지 않았다. 후속 typing-mix 절대 규칙 검토는 별도 사전 등록이며 이번 판정을 재측정으로 뒤집지 않는다.
- **465C-07 (IR-4·IR-5 — SSR 결함과 실제 입력 commit의 노출 원장)**
  - 【추론】 `verification/input-responsiveness/ir-4-results.md`는 SSR40입력이 hydration 뒤20입력·20placeholder·서버 input재사용0이 되는 결함을 핀했다. `verification/input-responsiveness/ir-5-results.md` round3은 Provider 유지·서버 스냅숏·기존 commit ref·실제 입력 슬롯의 노출 기록으로 DOM과 값을 보존한다. 일반1→1·StrictMode2→2, React18/19 내부 Suspense Probe commit1, 기존 항목당 layout effect2, 숨김 CSR/hydration 회귀를 통과했다. 최종 E5/E4 여섯 비용 비율은1.011869·0.996830·1.015909·1.012550·1.011270·0.983844로1.02이내다. 이전 round2 FAIL과 bootstrap은 다른 제품의 이력으로 남긴다. IR-5는 코디네이터 권고로 단계 가지에 들어갔으며 소유자는 루트 병합 전에 거절할 수 있다.
- **465C-08 (가상화 기본값 — SSR 수정 이후에도 off 권고, 소유자 대기)**
  - 【추론】 IR-1 replace off는 L/E0/A/AB 최장55.9/61.6/62.3/64.8ms로 모두50ms를 넘고 on은 모두 검출0으로 통과한다. 그러나 채택 A flat의 eager/all은 off51.75/51.75→on31.6/174.25ms, array는201.35/201.35→59.2/473.1ms이며 reveal 전 필드는 검색·스크린 리더·자동완성에서 빠진다. IR-5가 SSR blocker를 제거해도 이 교환은 남으므로 기본 off 유지를 권고하고 소유자 답을 기다린다. 자동완성 품질을 측정한 것으로 확대하지 않는다(`verification/input-responsiveness/ir-1-results.md`, `verification/input-responsiveness/ir-5-results.md`).
- **465C-09 (독립 검증과 마감 재현 — 운영 사실·실행 증거의 구분)**
  - 【추론】 검증 집중과 Opus 인계 지시(`reviews/round-465-owner-answers.md:10`, `reviews/round-465-owner-answers.md:14`)에 따라 제품 변경별 Opus 관문과 #501/#506 codex 교차 검토, 배정 전 초안 두 번의 거절·수정은 코디네이터가 보고한 운영 사실로 남긴다. 모든 최종 판정 원문을 저장소에서 확인한 것으로 쓰지 않는다. 마감 작업의 새 실행은 IR-0 510·IR-1 main520/backfill120/quiet200·파생10/4/12·IR-2 180의 원시 재현 여섯 명령과 원장·문서 감사다. 제품 끝의 순차 시험은 해당 결과 문서의 기존 증거이며 FCA 전체 FAIL/indeterminate를 새 finding0과 혼동하지 않는다(`verification/input-responsiveness/closing-results.md`).
- **465C-10 (기록 마감·소유자 권한·미결 인계)**
  - 【추론】 제품 끝814d21ad4 위 마감 문서 가지는 docs/schema-form-input-responsiveness-closing이고 단계 가지는 feat/schema-form-input-responsiveness, 루트 PR base는 feat/schema-form-08-review-and-perf다. 버전과 루트 병합은 reviews 운영 원칙1대로 Vincent가 직접 한다. D1·가상화 기본값·IR-5 수락은 소유자 대기이며 array 첫 프레임·reveal loop·G·루트 reconcile·CPU 공변량·hydration 준비 자식·기존 결함 다섯·AJV typing-mix·과거 production 구분을 인계한다. 제품 차분0·기존 줄 보존·기계 경로0·새 원장 오류0을 확인하되 기존 plan-links의 분할된 오류 항목 인용1건·tokens잔여399·doc미인용66은 그대로 공개한다. 마감 PR·루트 PR은 코디네이터가 준비하며 작업대 일곱의 삭제는 소유자에게 맡긴다(`verification/input-responsiveness/closing-results.md`, `reviews/README.md`).

## 근거와 남은 것

- 수치 정본은 각 IR 결과와 원시, 마감 종합은 `verification/input-responsiveness/closing-results.md`입니다. 기존 계획·라운드·원장 문장을 지우거나 다시 쓰지 않습니다.
- 소유자 결정 세 개는 별도이며 제품 끝의 비용 통과가 소유자 수락을 대신하지 않습니다. 이후 버전·루트 병합·작업대 삭제는 실행하지 않았습니다.
- 원장 검사에서 새 추가분의 불일치·미인용을 고치며 기존 문제는 범위 밖으로 남깁니다. 추가된 결정 줄은 보충 인용 뒤 고치지 않습니다.

## 마감 재현 도구 보충 — 코디네이터 승인, 2026-10-31

- **465C-11 (기본 원시 재현과 현재 diff 감사의 분리)**
  - 【추론】 마감 뒤 기본 재현은 새 원장 행이 아니라 같은 파일의 과거 기계 경로 때문에 실패했다. 코디네이터가 같은 스레드에서 도구 수정을 승인하여 IR-0/1/2의 HEAD·diff 의존 경로 감사를 명시적 --audit-base=<SHA> 뒤로 옮기고, 기본 실행은 동결 원시·번들 출처·집계 재현을 유지한다. 명시적 감사는 기존 텍스트의 추가 줄과 새 파일·압축 원시 전체를 검사하며 IR-2의 명시적 제품 차분 감사도 유지한다. 기존 owner-answers.tsv의 경로40개가 있는16행과 landing의42개는 고치지 않는다. 상세 행 번호·실패 우선·검출력·lint/typecheck·재현 결과는 `verification/input-responsiveness/closing-results.md`에 보존한다. schema-form 제품 차분은0이며 이 도구 변경은 제품 성능 개선으로 세지 않는다.

465C-10의 토큰399는 편집 전 기준값입니다. 최종은398이며 새 인용의 L과 소수값이 붙은 표기를 토큰 도구가 옛 L0 식별자로 읽은 한 건이 줄었습니다. 옛 문서의 의미적 커버리지를 새로 증명한 것으로 보지 않습니다. 그 밖 기존 plan-links 문제1·doc미인용66은 그대로입니다.

다음 라운드 번호는 466이다.
