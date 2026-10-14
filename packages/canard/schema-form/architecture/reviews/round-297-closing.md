# 297라운드 닫기 — 정돈-1 PR #374 병합(ae502f7bd), 정돈-2 투입

2026-10-14. fixy08이 정돈-1(브리프 `plan/tidy-structure/brief-tidy-1.md`, 편집자 결정 292C-02)을 codex로 구현해 PR #374를 열었고(여섯 커밋: 문서 먼저 → 빨간 단언 → warning INTENT → 포맷터 정리 → nodeFromJSONSchema 하향 → verifier 지적 정리), 원장 관리자가 대조한 뒤 squash 병합했다. 296라운드 소유자 지시대로 정돈-2 브리프를 즉시 fixy08에게 넘겼다.

### 297C-01 PR #374(정돈-1)를 ae502f7bd로 1.0.0-beta에 squash 병합했다 — 동작 불변, 공개 표면 이름 92개 동일

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 fixy08 게이트: typecheck 0, lint 0, build, 공개 표면 열거 92개 차이 0·dist/index.d.ts diff 0, 옛 이름 게이트 빈 출력, unit·render·react18 3823 통과·0 실패·todo 1(3870 − 옛 it 59 + 옮긴 it 11 + 새 index 시험 1), test:production 20, storybook 251, 플러그인 일곱(130·135·334·3·18·18·7), documents en·ko, aileron 두 패키지 새 tsc 오류 0, loadCoreBenchmark 동작·bench find-node 실행. verifier 셋(삭제 이름의 제품 소비자 0, 옮긴 import 전부 고침, 문서가 코드보다 먼저) PASS. 원장 관리자의 대조: 파일 102개, `src/index.ts`·`.claude`·settings·`architecture` 변경 0, 세션 줄 0, surface·core index에서 `nodeFromJSONSchema` 0, 새 자리 `core/surface/utils/nodeFromJSONSchema.ts`, `helpers/error`는 `formatValidationError`와 공유 보조 둘(`utils/createDivider.ts`·`utils/getErrorMessage.ts`)만 남음. 삭제: 포맷터 27개(파일 15)·고아 보조 9·시험 it 50 삭제·9 이동. 공개 표면 열거 스크립트(`enumerate-surface.mjs`, fixy08 scratchpad)를 정돈 PR 전부의 표준 게이트로 삼는다(292C-02).
- 근거: PR #374 본문; fixy08 보고; 원장 관리자 diff 대조(`git diff origin/1.0.0-beta...origin/feat/schema-form-tidy-1`).
- 다음: 정돈-2(`plan/tidy-structure/brief-tidy-2.md`)를 fixy08에게 넘겼다(296라운드 지시). fairy08의 export 재검사(와일드카드 재수출 추적)가 정돈-2 §3.5의 기준 목록이다. 정돈-1이 남긴 것: `getErrorMessage` 동명 파일 둘(이름 함정, 정돈-2에서 하나를 개명), core 밖 시험 셋과 blueprint 시험의 surface organ 직접 import(surface DETAIL 면제로 임시, 정돈-2 F6), `core/DETAIL.md` 서명 블록 드리프트(JSONSchema↔AuthoredSchema, 이 PR 전부터), `PKG/CLAUDE.md:51`(소유자 승인 뒤 원장 관리자가 고침).
