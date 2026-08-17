---
id: packages-canard-schema-form-src-helpers-jsonSchema-processAllOfSchema-utils-getMergeSchemaHandler-intersectSchema-f9438c
fractal_path: packages/canard/schema-form/src/helpers/jsonSchema/processAllOfSchema/utils/getMergeSchemaHandler/intersectSchema
file_path: packages/canard/schema-form/src/helpers/jsonSchema/processAllOfSchema/utils/getMergeSchemaHandler/intersectSchema/utils/__tests__
created_at: 2026-08-18
review_branch: claude/github-issue-331-223988
original_fix_id: FIX-096
severity: LOW
weight: 1
touch_count: 0
last_review_commit: null
rule_violated: max-depth (filid_fractal-boundaries §6, threshold 10)
metric_value: depth 12 (repo-root 기준; threshold 10)
---

# 기술 부채: intersectSchema/utils/__tests__ 경로 깊이 초과 — 승격 거절
## 원래 수정 요청
intersectSchema 전체를 상위 fractal로 승격하는 재배치로 utils(깊이 11)·utils/__tests__(깊이 12)를 임계값 10 이하로 낮출 것 (issue #331 D, /filid:cross-review PR #328 finding)
## 개발자 소명
FIX-095와 종속 관계 — __tests__는 utils 조직(organ)의 검증 디렉터리로, 부모 utils의 위치가 정해지면 함께 해소된다. 독립적으로 옮길 수 있는 단위가 아니다(filid_naming §4: 검증 파일은 대상 곁을 따른다).
## 정제된 ADR
결정: FIX-095와 동일한 거절 결정을 공유한다(독립 결정 아님). intersectSchema 승격 거절 근거는 FIX-095 debt 레코드(ea05cc) ADR 참조: 단일 소비자 정위치(code-placement §1), 소비자 없는 공개 계약 금지(public-contract §1), 현행 structure_validate 0건. 해제 조건: 부모 utils가 이동하면 자동 해소 — 별도 조치 불요.
