# 16라운드 원자료 — 스토리북·코어 구조 인벤토리 (scout, 2026-09-24)

## A. 스토리북
| 패키지 | 스토리 파일 | 줄 수 |
|---|---|---|
| `@canard/schema-form` (`packages/canard/schema-form/.storybook`, `stories/`) | 49 | 33,533 |
| ajv6·ajv7·ajv8 플러그인 | 각 2 | 약 678 |
| antd5·antd6·antd-mobile·mui 플러그인 | 각 4 | 1,660–1,817 |
- 구조: 스토리마다 함수 안에서 `jsonSchema`를 `satisfies JSONSchema`로 인라인 선언, `useState`로 값, 공통 `StoryLayout`(`stories/components/StoryLayout`)이 스키마·값을 나란히 표시, `<Form jsonSchema onChange={setValue} />` 직접 마운트.
- `play` 함수는 `stories/07.FormRefHandle.stories.tsx` 한 파일 세 개뿐. `@storybook/test`도 그 파일뿐. `test-storybook` 스크립트 없음. addons는 `@chromatic-com/storybook`, `@storybook/addon-docs` 둘뿐(interaction·vitest addon 없음).
- 스토리와 테스트의 스키마 공유 없음. `src/__tests__/scenarios/*.render.test.tsx` 21파일이 주석으로 "Mirrors stories/30.AllOfSchemaUsecase"처럼 대응만 적고 스키마는 재작성.
- 스크립트: `storybook dev -p 6006`, `storybook build`, `start`(= build + storybook).

## B. 코어 구조 (`src`)
- 최상위: `app/`(constants, plugin), `components/`(Form, SchemaNode, FallbackComponents), `core/`(nodes, parsers, types), `errors/`, `formTypeDefinitions/`(11파일 656줄), `helpers/`(defaultValue, dynamicExpression, error, formTypeInputDefinition, jsonPointer, jsonSchema, virtualization, warning), `hooks/`(6파일 508줄), `providers/`(Context 일곱), `types/`(7파일 1,191줄, rolled 포함).
- 상속: 모든 노드가 `AbstractNode`(1,228줄) 하나를 직접 `extends`(단층). `ObjectNode` 110, `ArrayNode` 218, `BooleanNode` 94, `NumberNode` 134, `StringNode` 125, `NullNode` 90, `VirtualNode` 140, `ContextNode` 51. `BranchStrategy`·`TerminalStrategy`는 위임(`__strategy__` 필드): ObjectNode Branch 922·Terminal 159, ArrayNode Branch 512·Terminal 282.
- 노드 사이 같은 이름의 재정의: `__value__`(6), `__emitChange__`(6), `__parseValue__`(4), `__onChangeWithOmitEmpty__`(2).
- 이벤트: `core/types/event.ts`(155줄) `NodeEventType`; `EventCascadeManager`(마이크로태스크, `afterMicrotask.ts`; debounce 없음). 검증기: `app/plugin/PluginManager.ts`(110줄), `ValidatorFactory`는 타입. `stripSchemaExtensions`(53줄). `JSONSchemaScanner`는 `@winglet/json-schema`(357줄)를 `getResolveSchemaScanner.ts`(29줄)로 감쌈. 식: `helpers/dynamicExpression/convertExpression`(51줄)·`combineConditions`(21줄). 교차: `helpers/jsonSchema/processAllOfSchema/intersectSchema/*`(타입별 파일 + 세부 유틸).
- 공개 진입점 `src/index.ts`(89줄): 구성 요소 `Form`·`FormProvider`, 훅 5, 함수 14(`registerPlugin`, 오류 가드 4, 노드 가드 9), 값 5(`NodeState`, `ValidationMode`, `JSONPointer`, `VirtualizationBackfill`, `ShowError`), 타입 약 40 + `export type * from './types/rolled'`(이름 없는 재수출 하나).
