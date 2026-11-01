# B2-P1 독립 검토 보고서 (Part 2: Reversion, Contract Tests, Verification Artifacts)

- **검토 커밋 범위**: `a8e61d155..89db58205` (base: `a8e61d155`, head: `89db58205`)
- **대상 패키지**: `packages/canard/schema-form`
- **작업 브랜치**: `perf/schema-form-b2-p1-inactive-memo`
- **저장소 소유자**: Vincent
- **검토자**: Antigravity (독립 읽기 전용 검토자)

---

## 1. 종합 판정표

| 항목 | 판정 | 근거 |
| :--- | :---: | :--- |
| **1.1 변경 범위(Scope) 및 제품 코드 동등성** | PASS | `git diff --stat a8e61d155..89db58205` 확인 결과 결과 문서(`b2-p1-results.md` +219)와 계약 테스트(`settle.inactive-memo-contract.test.ts` +169) 2개 파일만 추가됨.<br>`git diff a8e61d155..89db58205 -- packages/canard/schema-form/src ':!**/__tests__/**'` 결과 출력 0건으로 제품 트리는 기준판(`a8e61d155`)과 완전히 동일함.<br>`candidate2/revert-proof.json:2-8` 및 `b2-p1-results.md:19-22, 212`에서 네 가지 dist 산출물(`index.node.mjs`, `index.mjs`, `index.cjs`, `index.d.ts`)의 SHA-256 바이트 일치 확인. |
| **1.2 계약 테스트의 공개 동작 고정 완전성** | PASS | `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.inactive-memo-contract.test.ts:5-168`의 5개 단언 사례가 다음 공개 동작만을 엄밀하게 검증함:<br>① 중첩 호스트 재진입 시 순서 및 값 불변성 (`:5-43`)<br>② 배열 요소 나감, remove(0) 인덱스 이동, clear 일괄 정리 순서 (`:45-72`)<br>③ 동일 경로 상이 종류 후보 보존 및 `unsetOnInactive` 정리 (`:74-100`)<br>④ `load`, `resetSubtree`, 재구성 트리 간 비활성 발행 격리 (`:102-130`)<br>⑤ 분기 전환 시 비접촉 호스트 목록/항목의 identity 유지(`quiet.inactiveValues === held`, `item === held[0]`), 동결 상태(`Object.isFrozen`) 및 참조 안정성 (`:132-168`). |
| **1.3 계약 테스트의 기준판 호환성 및 구현 독립성** | PASS | `yarn vitest run src/core/engine/settle/__tests__/settle.inactive-memo-contract.test.ts` 실행 결과 5개 테스트 전체 통과 (38ms 소요). `{scratch}/b2-p1-20261027/reverted-contract.log:12-16`에서도 기준판 통과 확인.<br>테스트는 오직 루트의 공개 메서드(`setValue`, `find`, `remove`, `clear`, `resetSubtree`) 및 `inactiveValues` 게터만 사용하며, 미채택된 증분 구현 내부(델타 장부, 섀도우 검증 모드 등)에 일절 의존하지 않음. |
| **1.4 계약 테스트의 임포트 규칙 및 주석 규율** | PASS | 테스트 임포트는 `vitest` 및 저장소 공통 픽스처인 `@/schema-form/core/__tests__/makeFieldNodeTree`만 직접 참조 (`settle.inactive-memo-contract.test.ts:1-3`).<br>파일 전체 169행에 걸쳐 과거 시제, 커밋 해시 언급, 날짜 표기 등의 이력 주석이 전무함 (주석 0행). `git diff --check` 결과 공백 오류 0건. |
| **1.5 후보 1 주요 수치 원자료 재현성** | PASS | PR 본문 및 결과 문서의 후보 1 주요 수치 전체가 원자료와 완전 일치함:<br>• oneOf-80 메모 A 19.583 → B 19.333 µs (`{scratch}/b2-p1-20261027/judgement.json:stages`)<br>• oneOf-80 A 358.042 / B 514.917 / A′ 475.375 µs, 폭 209.417 µs (`judgement.json:rows`)<br>• payload-12 A 898.875 / B 778.000 / A′ 955.166 µs, 폭 180.875 µs (`judgement.json:rows`)<br>• TEST-073 siblings-100 vs A −15.71% (p=2.0e−8) (`test073-primary.log:1`)<br>• TEST-073 oneOf-80 vs A′ −18.14% (p=1.9e−14) (`test073-both.log:1`) |
| **1.6 후보 2 주요 수치 원자료 재현성** | PASS | PR 본문 및 결과 문서의 후보 2 주요 수치 전체가 원자료와 완전 일치함:<br>• 메모 A 17.750 → B 24.042 µs, 목록 갱신 10.353 µs (`{scratch}/b2-p1-20261027/candidate2/judgement.json:stages`)<br>• 메모 할당 22,694.88 → 24,691.12 B/쓰기 (`candidate2/judgement.json:stages`)<br>• oneOf-80 A 469.208 / B 507.125 / A′ 324.667 µs, 폭 233.749 µs (`candidate2/judgement.json:rows`)<br>• payload-12 A 940.583 / B 832.459 / A′ 869.500 µs, 폭 274.084 µs (`candidate2/judgement.json:rows`)<br>• TEST-073 exit 2: single-flat vs A −23.70% (p=2.3e−14), leaf-gate vs A −19.15% (p=4.9e−7) (`candidate2/test073-primary.log:7-8`)<br>• Node 힙 통과 (A 최대 1889.593 ≥ B 중앙 1439.427 B/node), Bun 보고용 초과 (B 중앙 2226.390 > A 최대 2224.794 B/node) (`candidate2/judgement.json:heap`). |
| **1.7 정숙 창(Quiet Window) 및 외란 기록** | PASS | `b2-p1-results.md:27, 119`에 시작/종료 CPU 점검 표본 기록 명시.<br>• 후보 1 사전 점검 중지(photoanalysisd 77.675%, mds_stores 74.144%) 및 시작점(`10:34:43.808Z`) / 종료점(`10:38:26.611Z`) 기록 (`{scratch}/b2-p1-20261027/quiet-attempts.json`, `quiet-end.json`).<br>• 후보 1 oneOf-80 A/A′ 차이(358.042 대 475.375 µs)에 따른 창 외란 의심 정직 기술 (`:106-107`).<br>• 후보 2 시작점(`11:24:28.470Z`) 및 종료점(`11:28:10.391Z`) 기록 (`candidate2/quiet-since.txt`, `candidate2/quiet-end.json`). |
| **1.8 결론 및 후속 가설 도출의 타당성** | PASS | "공개 동결 배열을 매 쓰기마다 즉시 유지하는 설계는 영향 호스트 목록 길이에 비례하는 $O(L)$ 복사를 피할 수 없다"는 결론(`b2-p1-results.md:3, 70, 215-217`)은 후보 2의 실측 데이터(하위 목록 갱신 10.353 µs, 총 메모 24.042 µs, 할당량 증가)로부터 직접 도출됨.<br>후속 가설로 쓰기 시점에는 dirty만 기록하고 첫 공개 읽기 시 배열을 생성하는 지연 실체화(lazy materialization, B2-P1b)를 명확히 제시함. |
| **1.9 불확실성 섹션 완전성** | PASS | `packages/canard/schema-form/architecture/verification/branch-switch/b2-p1-results.md:102-107`에 `## 확실하지 않음` 섹션이 온전히 존재함.<br>Storybook 병렬/직렬 브라우저 연결 종료 현상과 후보 2 샤드 실행 결과, 후보 1의 A/A′ 격차와 정숙 창 연속 무부하 미보증 한계를 충실히 기술함. |
| **1.10 PR 체크리스트 G7 항목 분석** | PASS | PR 본문 61행의 `- [ ] 후보 2 TEST-073은 canonical 회귀로 실패했습니다. 최적화는 남기지 않습니다.` 항목은 성능 관문 7(TEST-073 처리량 회귀 검사) 실패 사실을 나타냄.<br>본 PR은 최적화를 채택하는 PR이 아니라, **사전 고정된 관문 실패로 인해 가설을 기각(미채택)하고 제품 코드를 기준판으로 되돌린 사실을 기록하는 문서 및 계약 테스트 PR**이므로, G7이 미체크(fail)된 상태는 본 PR을 차단(block)하지 않으며 오히려 사실에 부합하는 올바른 기록임. |

---

## 2. 결함 및 개선 권고사항 (Defects Ranked by Severity)

본 검토 범위(`a8e61d155..89db58205`) 내에서 제품 코드 불일치, 원자료 왜곡, 계약 테스트 결함은 **0건**입니다.

- **심각도 상 (Critical/High)**: 해당 없음 (0건)
- **심각도 중 (Medium)**: 해당 없음 (0건)
- **심각도 하 (Low / 안내)**:
  - PR 본문 64행의 `- [ ] 2부 antigravity 검토와 최종 PR 생성은 코디네이터에게 인계합니다.` 항목은 독립 검토 2부가 본 보고서로 완료됨에 따라 코디네이터가 PR 승인 및 머지 단계에서 체크(`[x]`) 처리할 수 있습니다.

---

## 3. 최종 판정

최종 판정: PASS
