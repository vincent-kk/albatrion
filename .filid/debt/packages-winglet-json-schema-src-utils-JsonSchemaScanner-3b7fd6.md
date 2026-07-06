---
id: packages-winglet-json-schema-src-utils-JsonSchemaScanner-3b7fd6
fractal_path: packages/winglet/json-schema/src/utils/JsonSchemaScanner
file_path: packages/winglet/json-schema/src/utils/JsonSchemaScanner/__tests__/JsonSchemaScanner.test.ts
created_at: 2026-07-06
review_branch: fix/json-schema-scanner-hardening
original_fix_id: FIX-003
severity: MEDIUM
weight: 1
touch_count: 0
last_review_commit: null
rule_violated: 3+12 rule (test file, total > 15) — A.3
metric_value: 17 cases (> 15)
---

# 기술 부채: JsonSchemaScanner.test.ts exceeds 3+12 rule (17 > 15, pre-existing)
## 원래 수정 요청
async describe block(6 cases)를 형제 파일 JsonSchemaScannerAsync.spec.ts로 이동하면 신규 파일 생성 없이 15 미만으로 해소. test_metrics(check-312)가 상시 violations:[]를 반환하는 도구 결함으로 자동 게이트가 없어 방치 시 무기한 확대 위험.
## 개발자 소명
사전 존재 초과(브랜치 신규 케이스 +0; diff의 +1줄은 referenceSkipped assertion 필드일 뿐). surgical-changes 원칙상 사전 존재 conformance 스위트 분할은 본 하드닝 PR 범위 밖. engineering-architect 페르소나도 '이번 PR 범위 밖, debt 등록'으로 판정.
## 정제된 ADR
Context: JsonSchemaScanner.test.ts는 17 케이스로 3+12 규칙(≤15)을 초과하나, 이번 브랜치는 케이스를 추가하지 않았고 파일도 최근 수정되어 promote 안정성 게이트(90일) 미달. Decision: 본 PR에서 코드 변경 없이 debt로 등록하여 추적. Consequences: 향후 별도 정리 작업에서 async describe 블록을 JsonSchemaScannerAsync.spec.ts로 이동해 해소. test_metrics(check-312) 도구 결함이 병행 수정되면 자동 게이트도 복구됨.
