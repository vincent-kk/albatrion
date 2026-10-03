# 16라운드 원자료 — 오늘의 `reset`과 로드의 차이 (debugger, 2026-09-24)

소유자 답 2("로드로 충분한지 검토")를 위한 조사다. 코드 판독과 렌더 시험 3파일 39건 실행(`reset.pristine`, `state-management`, `refresh.uncontrolled-value`, 모두 통과)으로 확인했다. 경로는 `packages/canard/schema-form/` 기준.

## 1. 오늘의 동작

- 진입: `reset: update`(`src/components/Form/Form.tsx:151`). 콜백이 `ready=false`, `emittedValueRef=NOT_EMITTED`, `attachedFilesMap.clear()` 뒤 `version+1`(`Form.tsx:84-88`). 호출 즉시 반영되지 않는다.
- 다시 마운트: `<RootNodeContextProvider key={version}>` 아래 전부(`Form.tsx:185-200`) — `<form>`, `SchemaNodeProxy`, 사용자 `children`.
- 다시 만드는 것: 스키마 `preprocessSchema(clone())`와 `clone(defaultValue)`(`useMemorize([version])`, `Form.tsx:90-94`. 그래서 reset 사이의 prop 변경은 무시되고 reset 때 반영된다), 노드 트리(`RootNodeContextProvider.tsx:84-118`), 검증기 컴파일(`ValidationManager.ts:199-203`. ajv8 플러그인은 매번 새 객체 `{...jsonSchema,$async:true}`로 컴파일해 `_cache`를 빗나가고 모듈 전역 Ajv에 쌓인다, `createValidatorFactory.ts:19-22`), 식 컴파일(노드마다 `new Function`, `createDynamicFunction.ts:41`).
- 가상화: 매니저는 유지되나 `revealedNodes: WeakSet<SchemaNode>`가 옛 노드를 키로 하므로 지연 필드가 모두 다시 숨는다(`VirtualizationManager.ts:55,82`).
- 구독과 참조: 소비자가 든 `handle.node`, `findNode` 결과, 외부 `subscribe`가 옛 트리를 가리킨다. `reset()` 직후 effect 전까지 핸들이 옛 트리를 가리켜 그 사이의 `setValue`는 사라지고 `submit`은 아무것도 하지 않는다(`Form.tsx:115,142-167`; `renderForm.tsx:490-495`가 `act`+`setTimeout(0)`으로 감싼다).
- `dirty`·`touched`는 새 노드라 비지만 `onStateChange`는 불리지 않는다(판독). 검증은 검증 모드와 무관하게 한 번(`Form.tsx:139`). 명령형 외부 오류는 사라지고 `errors` prop은 다시 적용된다. `showError`는 유지된다(`Form.tsx:101`).
- 비제어 DOM과 사용자 `FormTypeInput`의 내부 상태, 렌더러와 `children`의 상태는 다시 마운트로 초기화되고, 포커스는 잃는다.
- `defaultValue`는 reset 시점의 현재 prop이다(`reset.pristine:164-187`).
- `onChange`: reset 중에는 버리고, 뒤에 한 번(값이 같아도) 낸다(`Form.tsx:103-108,138`).
- 배열 아이템은 새 노드와 새 키(`BranchStrategy.ts:381`).
- 루트 에러 바운더리 fallback 상태에서는 `reset()`으로 복구할 수 없다(`Form.tsx:311-312`, 판독).
- 다시 마운트 없이 값을 되돌리는 경로 `node.resetSubtree()`가 있다(생성 시 값으로, `AbstractNode.ts:1138-1144`). 브랜치도 Refresh를 내 객체 입력 아래 서브트리가 다시 마운트된다(`ObjectNode/.../BranchStrategy.ts:198-199`, `SchemaNodeInput.tsx:94-95,121`).

## 2. 사용처

- 시험: `reset.pristine`(14건: 평면·중첩 복원, dirty/touched, `defaultValue` prop 복원, oneOf 잔여 없음, 터미널 입력의 mountOrdinal 증가 `:267-309`, 반복 reset 멱등), `state-management:367-418`(`reset`·`clearState`·`resetSubtree`의 차이), `refresh.uncontrolled-value:109-125`, `renderProp.value:126-140`, `array.omit-trailing.injection:62-70`.
- 스토리: `stories/20.Reset.stories.tsx`는 **스키마·`defaultValue` prop을 바꾼 뒤 reset으로 반영**하는 예 넷("Click Reset to apply new schema"). 그 밖의 스토리 스무 곳 남짓은 시드 값으로 돌아가는 버튼.
- 문서: `README.md:131,1484,1525-1542`, `docs/QUICK_REFERENCE.md:218`, `docs/agents/.../validation-and-state.md:61`.
- `key` 패턴: `stories/40.Virtualization.stories.tsx:176`(`<Form key={epoch}>`로 가상화 재생), `reviews/raw-round5-consumer.md:46`(레코드 전환에 `key` 또는 "prop 갱신 + `reset()`"). 시험·README·docs에는 없다.
- `key`만 초기화하는 것: `showError`·refs, 첨부 파일 맵 인스턴스, 가상화 매니저, provider, 에러 바운더리 fallback. `reset()`만의 것: 부모 재렌더 없는 명령형 호출.

## 3. 로드와의 차이

로드(전체 교체와 정착 한 번, 트리·캐시 유지)로 되는 것: 값 복원, 트리·전처리·검증기·식 컴파일의 유지(오늘 대비 이득), 가상화 기록 유지, provider 유지, 노드 참조와 구독 유지, 검증 결과(스탬프), `diagnostics`, 동기성(옛 핸들 틈이 없다).

더할 장치가 필요한 것: `dirty`·`touched`(같은 진입에서 비우고 `onStateChange` 한 번), 외부 오류(prop 재적용, 명령형 오류의 규칙), 비제어 DOM과 사용자 `FormTypeInput` 상태(터미널 입력의 Refresh. 오늘의 브랜치 Refresh는 서브트리 전체라 범위를 줄여야 한다), 렌더러·`children`의 상태(노드 명령 `remount`), 첨부 파일 맵과 `showError`(Form 층).

로드로 안 되는 것: **스키마 prop의 변경 반영**(트리와 청사진을 새로 만들어야 한다), 에러 바운더리 복구(`key`).

## 4. 권고의 요지와 열린 결정

권고: `reset()`은 루트 로드 한 번(한 진입, 동기). V는 현재 `defaultValue` prop. 트리·노드 identity·청사진·식·가드 캐시·검증기 등록·유효 스키마 메모·가상화 기록·provider를 유지. 같은 진입에서 `dirty`·`touched`·첨부 파일 내용·`diagnostics`를 비운다. Refresh는 터미널 입력에만. 렌더러·`children`·provider·`<form>`은 다시 마운트하지 않는다. 더 강한 연산은 새 이름 없이 `<Form key>`(전체 재생성)와 노드 명령 `remount`.

열린 결정: V의 출처(현재 prop 또는 생성 시 값), 스키마 prop이 바뀐 뒤의 reset, Refresh 범위(모든 터미널 또는 바뀐 것만), 명령형 외부 오류, `showError`, 값이 같을 때의 `onChange`와 `OnRequest`에서의 검증, 배열 통째 교체의 identity(PR-5), `reset(option?)`의 옵션.

확인하지 못한 가설: reset 뒤 `onStateChange` 누락(H1), 입력 직후 같은 틱의 reset에서 옛 값 방출(H2), 루트 `$id` 스키마의 reset에서 Ajv "already exists"로 fallback 검증기 전락(H3), reset마다 Ajv `_cache` 증가(H4), 바운더리 fallback 중 `ref`가 `null`(H5).
