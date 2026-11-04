# 259라운드 — Vincent의 답 (SchemaNode → FieldNode 확정; components/Field의 이름 셋; 이름 먼저, 구조 다음; 레거시 제외)

2026-10-14. 258라운드의 이름 논의 셋에 원장 관리자가 코드 사실(클래스는 factory 안에서만 생성, 클래스 값 소비자 0; components/SchemaNode는 React 칸 셋; 치환 규모 src 515파일·4,423곳, 문서 119곳, 바깥 15파일, 공개 이름 열)과 의견을 냈고 소유자가 원장 세션에서 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| FieldNode·이름 셋·순서·범위 | SchemaNode → FieldNode로 갈지, components/Field의 세 이름을 받을지, 이름 먼저 구조 다음으로 할지 | "FieldNode로 가자. 이름 셋도 제안대로. 이름 먼저, 구조 다음.  \n관련된 이름과 문서를 모두 바꿔야 한다. 레거시는 건들이지 말고." | 확정: 아래 259C-01 대응표; 07b-5(이름)를 07b-4 뒤에, C 재배치는 그 뒤; `src/__legacy__`는 제외 |

### 259C-01 대응표 — `SchemaNode` 계열 → `FieldNode` 계열(별칭 없음), components/SchemaNode → components/Field

| 옛 이름 | 새 이름 | 비고 |
| --- | --- | --- |
| `SchemaNode`(형·클래스) | `FieldNode` | 형 별칭(core/SchemaNode/type.ts:264)과 클래스(SchemaNode.ts) 모두 |
| `core/SchemaNode/` | `core/FieldNode/` | C 재배치 때 `core/surface`로 다시 옮김 |
| `schemaNodeFactory`·`createSchemaNode` | `fieldNodeFactory`·`createFieldNode` | factory가 공개 계약의 주류(258라운드 논의 1) |
| `buildSchemaNodeTree`·`mountSchemaNode`·`adoptSchemaNodeTree`·`reloadSchemaNodeForm`·`writeSchemaNodeInput`·`finishSchemaNodeInput`·`readSchemaNodeInteractionReset`·`observeSchemaNodeReports`·`interpretSchemaNodeDraft` | `SchemaNode` → `FieldNode` 치환 | 바인딩 전용 이름 열 |
| `isSchemaNode`·`InferSchemaNode`·`SchemaNodeEventType`·`SchemaNodeRequestType`·`SchemaNodeState`·`SchemaNodeSubscribeOptions`·`SchemaNodeType` | `isFieldNode`·`InferFieldNode`·`FieldNodeEventType`·`FieldNodeRequestType`·`FieldNodeState`·`FieldNodeSubscribeOptions`·`FieldNodeType` | 공개 index 형·함수 |
| `useSchemaNodeSubscribe`·`useSchemaNodeTracker`·`useSchemaNode`(내부) | `useFieldNodeSubscribe`·`useFieldNodeTracker`·`useFieldNode` | 공개 훅 둘, 내부 훅 하나 |
| 그 밖의 `*SchemaNode*`·`*schemaNode*` 식별자 | `*FieldNode*`·`*fieldNode*` | 규칙적 치환; 표 밖 이름은 같은 규칙 |
| `components/SchemaNode/` | `components/Field/` | 진입점·INTENT·DETAIL 함께 |
| `SchemaNodeProxy`(·Props) | `FieldProxy`(·Props) | 노드 한 칸을 FieldRenderer 틀로 그림 |
| `SchemaNodeInput`·`SchemaNodeInputWrapper` | `FieldInputSlot`·`FieldInputSlotWrapper` | 공개 형 `FieldInput`과 겹치지 않게 "Slot" |
| `DeferrableNodeProxy` | `DeferredFieldProxy` | 가상화 지연 마운트 |
| `nodeFromJSONSchema` | 그대로 | 이름에 SchemaNode가 없음 |

범위: `packages/canard/schema-form`(src·docs·README·CLAUDE.md·docs/agents 자산·스토리), 플러그인 일곱, aileron 소비자, 문서 사이트(documents), 저장소 루트 CLAUDE.md의 관련 문구. 제외: `src/__legacy__`(소유자 "레거시는 건들이지 말고"), `architecture/`(원장·검증 기록은 역사라 그대로), benchmark-form 결과 보관본, DOM 속성 이름(`data-path`·`data-deferred` 등)과 이벤트·요청 문자열 값(식별자만 바꾸고 계약 문자열은 유지). 절차: 07b-5 = fairy07이 읽기 전용 사용처 목록(파일·식별자·공개 이름·문서) 작성 → fixy07이 07b-4 뒤 07b-2 ②와 같은 방식(핵심 → 플러그인·소비자 → 문서, 게이트, 옛 이름 grep 0, verifier 쌍 비교)으로 치환 → PR → 병합 → C 재배치 계획.

다음 라운드 번호는 260이다.
