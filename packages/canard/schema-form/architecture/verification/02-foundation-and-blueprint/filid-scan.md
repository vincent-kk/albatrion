# 02 Filid PR 경계 검사

## 실행과 판정

- PR 경계에서 전체 프로젝트 `fractal_inspect scan`을 한 번 실행했습니다. 최초 스냅샷 `5ea0adf8b029b4785167b24c41962bc993fcd8efc9cb3089a6d8d8435adcdd0f`: 684노드, 최대 깊이 13/허용 14, 구조 지적 221건. 깊이 게이트는 통과했습니다.
- 최초 전 범위 `validate`는 221건, 통과 5,381건, 실패 98건이었습니다. 검증 파일 감사는 604파일, 그중 spec-document 10파일·108사례와 test-record 594파일·7,000사례를 읽고 지적 24건을 냈습니다.
- 이후 문서 수용 그룹 제목 7건을 고치고, `@winglet/common-utils` object가 merge 내부에 허용하는 직접 import 4건의 소비자 경로를 검사 가능한 glob으로 바로잡았습니다. `scan`은 반복하지 않았고, 전 범위 `validate`를 다시 실행했습니다. 최종 스냅샷 `32f420fca0dea5d50d44623afdb69ec57c69b7dbef3e895ae154fcf6f9ae7431`: 지적 210건, 통과 5,382건, 실패 97건, 전체 판정 `indeterminate`. 변경된 merge 경로의 경계 지적은 0건입니다.
- 최종 지적 분포: `intent-document-contract` 41, `detail-document-contract` 42, `entry-point-surface` 7, `module-entry-point` 1, `circular-dependency` 4, `zero-peer-file` 68, `external-import-boundary` 20, `spec-document-case-cap` 1, `test-record-case-cap` 24, `spec-fragmentation` 1, `spec-contract-link` 1. 의존성 증거 진단은 여전히 불확정이므로 전역 DAG·경계 무결성을 통과로 표시하지 않습니다.

## 이 PR이 건드린 경로의 남은 발견

| Filid 규칙 | 경로 | 사례 수와 처리 |
| --- | --- | --- |
| `test-record-case-cap` | `src/__legacy__/helpers/jsonSchema/__tests__/processAllOfSchema.test.ts` | 58건. 레거시 원형을 보존하며 이 PR에서 분할하지 않습니다. |
| `test-record-case-cap` | `src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/__tests__/processSchemaType.test.ts` | 33건. 같은 레거시 보존 조건입니다. |
| `test-record-case-cap` | `src/__legacy__/helpers/jsonSchema/processAllOfSchema/utils/__tests__/validateCompatibility.test.ts` | 43건. 같은 레거시 보존 조건입니다. |
| `test-record-case-cap` | `src/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/__tests__/getConditionIndexFactory.test.ts` | 33건. 이 PR의 변경은 import 한 줄 교체이며 시험 사례는 늘리지 않았습니다. |
| `test-record-case-cap` | `src/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/__tests__/getDerivedValueFactory.test.ts` | 41건. 이 PR의 변경은 import 한 줄 교체이며 시험 사례는 늘리지 않았습니다. |

표의 경로는 모두 `packages/canard/schema-form/` 기준입니다. 나머지 205건은 이 PR의 변경 경로 바깥입니다. 레거시 삭제와 기존 시험의 사례별 분할은 해당 소유 단계에서 처리할 발견으로 넘깁니다. 사례를 없애 상한에 맞추지 않습니다.

Filid 도구의 원시 결과는 로컬의 임시 산출물 `fractal_inspect/392fba14e7173bf661e9996631c72b522ed3774e816acb6a8b592098e8a7882c.json`(최초 validate), `fractal_inspect/6cdb6cf6389b5c7f185bbf13d615f6b058f3fcd000488b02b73a100af2dd7eff.json`(검증 파일), `fractal_inspect/0bc38b8d6953a96eb6876b6b0dbb4a260958ae098e6c91c14545ff20cec83b78.json`(최종 validate)에 있습니다. 위 수치와 변경 경로 발견은 이 문서에 보존합니다.
