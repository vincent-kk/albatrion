# 312라운드 닫기 — 정돈-3 PR #378 병합(eeb1bd374): 구조 이동 끝, 소유자 구조 리뷰(5단계) 시작 가능; 정돈-E 투입

2026-10-14. fixy08이 309·310라운드 방식(이동은 직접, 긴 절차는 PR 직전 한 번)으로 정돈-3을 마쳐 PR #378(커밋 20개, 끝 346ee5750)을 열었고, 원장 관리자가 직접 확인과 verifier 독립 검증 뒤 스쿼시 병합했다. 311라운드대로 이 병합이 소유자가 볼 수 있는 단계의 시작점이다.

### 312C-01 #378을 병합한다 — 공개 표면 92개 동일, 시험 3826 통과, 이동은 이력을 유지, filid 면제 한 줄 제거

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 직접 확인: 병합 상태 CLEAN, 금지 경로 변경 0, 세션·공동 저자 줄 0, `.filid/config.json` 변경은 schema-form의 zero-peer-file 면제 한 줄 삭제뿐, 루트 `src/index.ts`는 모듈 경로(`./rolled`·`./hooks`)만 바뀌고 이름과 순서 동일. verifier: 빌드 뒤 열거 92개 이름이 정돈-2 기준과 동일(추가 0·삭제 0, 옮긴 선언 경로 14곳을 정규화하면 형 문자열 차이 0, dist에 미해결 별칭·`__tests__`·`__benchmarks__` 없음); unit은 첫 실행에서 `global-errors.timing.test.ts:95`의 벽시계 단언 하나(48.4 ms 대 40 ms, 병렬 부하)가 실패하고 재실행 통과, render·react18 통과, 합계 3826 통과·실패 0·할 일 1; lint 0(범위가 `core/__benchmarks__`까지 늘어남); 이름 바꿈 147건 중 유사도 90% 미만 21건은 문서 3·import 경로만 14·자기 경로 수정 1과 비이동 편집 둘; 삭제는 `types/rolled/index.ts` 하나이고 대응은 `src/rolled/index.ts`(이름 21개, 옛 와일드카드 집합과 정확히 같음), `types/index.ts` 58·`errors/index.ts` 69도 옛 집합과 동일; 가드 시험 둘(importModel·dependencyDirection)과 옮긴 시험 여섯이 unit 목록에 있고 시험 파일 수 609·벤치 11은 기준과 같다. 비이동 편집 둘은 `getControlExpression.ts`(구조적 `{ expressions }` 입력으로 일반화, 캐시가 색인을 저장; `Blueprint.expressions`가 readonly라 런타임 동일)와 `getCommittedDeclarationKey.ts`(`kind`를 `string`으로 넓힘, 형만)이며 B1(engine organ은 자식 fractal의 형을 import하지 않음)의 결과다. 병합 결과 1.0.0-beta는 eeb1bd374.
- 근거: PR #378(fixy08, 결정 D1–D6과 선택 여섯); verifier 보고(2026-10-14); `plan/tidy-structure/brief-tidy-3.md`; `reviews/round-309-owner-answers.md`, `round-310-owner-answers.md`.
- 다음: 소유자에게 구조 리뷰 시작을 알린다. fixy08은 정돈-E(브리프 `brief-tidy-E.md`, 305C-01 반영)를 시작한다.

### 312C-02 정돈-3의 결정 여섯과 선택 여섯을 적는다 — 모두 모델 안의 자리 바꿈이다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 D1 승격된 fractal(`hooks`·`types`·`rolled`)은 구현을 역할 구획(`hooks/hooks`·`types/types`·`rolled/types`)에 둔다. D2 `hooks/index.ts`가 새로 생기고(이름 7개) 루트 index는 모듈 경로만 바뀐다. D3 `FieldNode.ts`는 surface의 동명 구현이 아니라 `core/surface/classes/`로. D4 `.mjs` 11개(13이 아님)는 `bench/scripts/`. D5 형제 fractal 사이의 형 전용 순환(`FieldInputSlot`↔`FieldProxy`, 기준 트리에도 있음)은 고치지 않고 보고만 — 구조 리뷰 항목. D6 `types/rolled`는 `types`와 이름 18개가 겹쳐 `src/rolled`로(형제, D 예외 없음). 선택: (a) `getCommittedDeclarationKey`·`getControlExpression`은 구조적 입력(B1); (b) `errors/index.ts`는 와일드카드 대신 이름 목록(filid entry-points 0을 위해; 72→정돈-E가 61개 코드 이름을 object enum으로 대체); (c) bench 면제 셋은 `**/bench/legacy-compare/**`로 좁혀 유지(독립 레거시 스크립트 넷이 내부를 읽음); (d) core 안의 벤치는 core 자기 index 대신 `core/engine`·`core/surface` 관문을 읽음(자기 index는 U); (e) `round-87-measure.mjs`는 고정 커밋을 다시 빌드하므로 기준에서도 지금도 돌지 않음(경로는 고침) — 속도 계획에서 제외; (f) verifier가 derive 이동 뒤 `dependencyDirection.test.ts`와 lint의 no-any 블록이 derive를 빼먹은 것을 찾아 고침(금지 import에 붉어짐 확인). 원장 관리자가 더한 셋(속도 계획 사전 점검에서): vitest 벤치 include는 glob이 아니라 일곱의 이름 목록 유지, 독립 스크립트 넷은 모두 `bench/legacy-compare/`, 독립 스크립트 셋의 자기 경로 문자열 수정(typecheck·lint가 못 잡는 종류라 시작 확인은 자식 프로세스 경로를 지나게).
- 근거: fixy08 결정 보고(2026-10-14)와 PR #378 본문; fairy08 `perf-precheck.md`; `fca-import-model.md` §2 B1·B4·B5.
- 다음: 없음.
