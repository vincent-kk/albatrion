---
id: packages-canard-schema-form-src-helpers-jsonSchema-processAllOfSchema-utils-getMergeSchemaHandler-intersectSchema-ea05cc
fractal_path: packages/canard/schema-form/src/helpers/jsonSchema/processAllOfSchema/utils/getMergeSchemaHandler/intersectSchema
file_path: packages/canard/schema-form/src/helpers/jsonSchema/processAllOfSchema/utils/getMergeSchemaHandler/intersectSchema/utils
created_at: 2026-08-18
review_branch: claude/github-issue-331-223988
original_fix_id: FIX-095
severity: LOW
weight: 1
touch_count: 0
last_review_commit: null
rule_violated: max-depth (filid_fractal-boundaries §6, threshold 10)
metric_value: depth 11 (repo-root 기준; threshold 10)
---

# 기술 부채: intersectSchema/utils 경로 깊이 초과 — 승격 거절
## 원래 수정 요청
intersectSchema 전체를 상위 fractal로 승격하는 재배치로 utils(깊이 11)·utils/__tests__(깊이 12)를 임계값 10 이하로 낮출 것 (issue #331 D, /filid:cross-review PR #328 finding)
## 개발자 소명
intersectSchema의 소비자는 getMergeSchemaHandler 하나뿐이며, 이 단일 소비 관계는 intersectSchema INTENT의 Never do('getMergeSchemaHandler 외부에서 intersect 함수를 직접 호출')로 경계 계약으로 고정되어 있다. filid_code-placement §1에 따라 단일 소비자 내부 유닛은 소유자 곁이 정위치이므로, 소비자들의 LCA보다 위로 올리는 승격은 근거 없는 재배치다.
## 정제된 ADR
결정: 승격 거절, 깊이는 fractal-boundaries §6의 toll로 지불. 근거: (1) 승격은 실제 소비 관계에 없는 공개 계약을 만들어 seiri_public-contract §1(소비자 없는 export 금지)과 충돌한다. (2) 이 서브트리의 깊이는 allOf 병합 분해가 정직하게 깊은 결과이며, 이동은 import 경로 churn 외의 이득이 없다. (3) 현행 structure_validate(max-depth, error)는 저장소 루트 기준 위반 0건을 보고한다(2026-08-18 실측). 해제 조건: intersectSchema에 두 번째 소비자가 생기면 그 시점 소비자들의 lowest common fractal로 이동한다.
