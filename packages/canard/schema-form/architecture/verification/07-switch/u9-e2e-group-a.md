# U9 e2e group A 검증 보고서

- 기준: feat/schema-form-switch, HEAD 3cefe67d5; 지정된 stage-07 worktree에서만 작업했습니다.
- 최종 그룹 A: **13파일·101건, 98 통과 / 3 실패**, skip 없음. 실행 사례도 파일당 15건 이하입니다.
- git 쓰기·설치·엔진/바인딩 수정은 없습니다. 그룹 B 소유 e2e와 SCN 부류는 수정하지 않았습니다.

## 기준과 구현 범위

실행 계획 U9·§2.1, 렌더 처분표의 그룹 A 새 자리, log.md §5의 통지 이식 11행, round-68-closing.md의 68C-01·68C-09, TEST-011·020·023·024·LANDING-095를 확인했습니다. 요청된 architecture/reviews/round-77-closing.md와 round-78-closing.md는 이 worktree에 없어 읽지 못했습니다. 78C-01은 현재 처분표에 인용된 원장 ID와 해당 원장 문장으로 대조했습니다.

모든 Form은 renderForm.tsx 하니스를 사용합니다. 공유 장면은 SCN 순수 데이터와 playScenario(scenario, container)를 사용합니다. nullable·null 승격·빈 입력·조건 왕복·중첩 채움·분기 나감 데이터를 SCN에 추가했습니다. SCN의 schema-form import는 타입까지 0건이며 공통 단계 어휘를 넓히지 않았습니다.

기존 notify의 동일 값 재쓰기와 숫자 위젯이 받을 수 없는 잘못된 형 쓰기는 batch로 명령형 진입을 명시했습니다. 기대 배달·콜백·경고 값은 유지했습니다. 화면 clear/문자별 타이핑과 숫자 초안 거부를 원래 엔진 시나리오의 동작으로 오인하지 않기 위한 변경입니다.

소비자 계측 때문에 value override는 value-overrides, 바운더리/싱크는 settle-errors로 분리했습니다. StrictMode IO/idle/focus는 관찰기와 함께 deferred-mount, render-prop와 비함수 children은 proxy-refresh에 두었습니다. 원 처분 행은 아래에 연결했습니다.

## 기대값의 원장 문장

| 원장 | 단언의 근거 |
| --- | --- |
| TEST-011·021·023 | 하니스의 DOM 등록과 playScenario 단일 호출, 공유 데이터와 소비자 계측 분리 |
| TEST-005·처분표 legacy NullableFormScenarios | type 배열·null 및 기존 값 관찰을 새 e2e에 유지 |
| VALUE-036 보충, LANDING-139·200·196, REACT-027 | 로드 null은 자식 채움을 받음; 로드 아닌 null은 채움 없음; non-nullable 빈 입력은 undefined, nullable 비우기 조작은 null |
| LANDING-010·018·032·148 | allOf 조건 병합, 비활성 원본 유지/방출 제외, 분기 왕복 보존, 비활성 find는 null |
| LANDING-116·155, WRITE-071, NODE-005 | minItems와 채움 분리, 로드 기본값, 호출자 불변, 터미널 값 통째 유지 |
| EVENT-002·004·005·007·008 | 동기 정착/통지, batch 끝 한 번, 문서 순서, revision 일괄 갱신, 리스너 쓰기의 다음 파동 |
| LANDING-022·039·042·199·201 | 진입당 변경, 같은 스키마 reset의 노드 보존, 변경 입력만 Refresh, 입력 자신의 Overwrite는 자기 재마운트 없음 |
| TEST-020, LANDING-157·168, WRITE-083 | 마운트 통지 억제/오류 보고, 바운더리/싱크, reset·늦은 쓰기·전체 잠금, blur trim은 오류·dirty를 보존하는 자동 쓰기 |
| SURFACE-053·VALIDATE-043·ERROR-015 | getErrors는 루트 globalErrors에 위임; 모든 검증 에러는 폼 목록에 남음; 외부 오류도 검증 결과 층. 외부 오류 목록 단언의 추가 근거 |
| LANDING-087·115, VALIDATE-036·051 | 가상화 identity, 활성 조각의 오류 귀속, 작성 oneOf 판정, union 형 오류 귀속 |
| SETTLE-043 / 계획 I20 | 직전 커밋과 내용이 같은 복원은 UpdateValue/watch 유령 배달 없음 |

## 파일별 최종 결과

| 파일 | 통과 | 실패 | 합계 |
| --- | ---: | ---: | ---: |
| `deferred-mount.test.tsx` | 8 | 0 | 8 |
| `exit.test.tsx` | 4 | 0 | 4 |
| `fill.test.tsx` | 5 | 0 | 5 |
| `notify.test.tsx` | 14 | 0 | 14 |
| `proxy-refresh.test.tsx` | 9 | 0 | 9 |
| `schema-node-props-flow.test.tsx` | 6 | 3 | 9 |
| `settle-errors.test.tsx` | 15 | 0 | 15 |
| `settle.test.tsx` | 9 | 0 | 9 |
| `upload-file.test.tsx` | 5 | 0 | 5 |
| `validation.test.tsx` | 5 | 0 | 5 |
| `value-overrides.test.tsx` | 2 | 0 | 2 |
| `value-projection.test.tsx` | 6 | 0 | 6 |
| `value.test.tsx` | 10 | 0 | 10 |

## 사례·원장·출처

disposition은 render-disposition.md, spike log.md는 architecture/plan/07-switch/log.md입니다. U9/TEST-020은 별도로 요구된 신규 목록, U9/TEST-023은 기존 SCN 부류의 화면 실행 요구입니다.

### deferred-mount.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| TEST-020 getValue includes deferred field values without mount onChange | TEST-020 | `disposition L98: deferred-mount.render.test.tsx` | 통과 |
| LANDING-007 deferred fields follow controls visibility | LANDING-007 | `disposition L98: deferred-mount.render.test.tsx` | 통과 |
| LANDING-006 deferred branch placeholders follow controls active | LANDING-006 | `disposition L98: deferred-mount.render.test.tsx` | 통과 |
| LANDING-087 revealed fields stay eager after sibling removal | LANDING-087 | `disposition L98: deferred-mount.render.test.tsx` | 통과 |
| TEST-021 intersection reveals the settled field under StrictMode | TEST-021 | `disposition L99: deferred-mount.strict.render.test.tsx` | 통과 |
| TEST-021 StrictMode idle backfill completes without duplicate mount changes | TEST-021 | `disposition L99: deferred-mount.strict.render.test.tsx` | 통과 |
| TEST-021 deferred focus replays once under StrictMode | TEST-021 | `disposition L99: deferred-mount.strict.render.test.tsx` | 통과 |
| TEST-020 validation includes a deferred field before reveal | TEST-020 | `disposition L98: deferred-mount.render.test.tsx` | 통과 |

### exit.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| LANDING-018 exit.unset-inactive | LANDING-018 | `disposition L91: composition.oneOf.switch.render.test.tsx` | 통과 |
| LANDING-018 exit.retain-inactive | LANDING-018 | `disposition L91: composition.oneOf.switch.render.test.tsx` | 통과 |
| LANDING-032 branch roundtrip preserves user input and excludes inactive output | LANDING-032 | `disposition L91: composition.oneOf.switch.render.test.tsx` | 통과 |
| LANDING-148 reset leaves no inactive branch residue and find returns null | LANDING-148 | `disposition L115: reset.pristine.render.test.tsx` | 통과 |

### fill.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| TEST-023 fill.mount-default | TEST-023 | `disposition L97: default-value.render.test.tsx` | 통과 |
| TEST-023 fill.appearing-default | TEST-023 | `disposition L97: default-value.render.test.tsx` | 통과 |
| LANDING-116 nested schema and external defaults survive reset without minItems filling | LANDING-116 | `disposition L97: default-value.render.test.tsx` | 통과 |
| WRITE-071 caller defaultValue remains immutable without terminal child filling | WRITE-071 | `disposition L96: default-value.input-immutability.render.test.tsx` | 통과 |
| NODE-005 frozen terminal defaults render without child default filling | NODE-005 | `disposition L96: default-value.input-immutability.render.test.tsx` | 통과 |

### notify.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| EVENT-002 notify.delivery-order | EVENT-002 | `U9 / TEST-023: existing SCN notify` | 통과 |
| EVENT-002 notify.batch-change | EVENT-002 | `U9 / TEST-023: existing SCN notify` | 통과 |
| EVENT-002 notify.warning-record | EVENT-002 | `U9 / TEST-023: existing SCN notify` | 통과 |
| EVENT-002 한 React 클릭의 1,000개 쓰기가 한 커밋에서 모든 입력에 반영된다 | EVENT-002 | `spike log.md §5 L107: spikes/events/caret.spike.test.tsx / [A-3] 1,000 setValue calls in one click handler → commits and renders` | 통과 |
| EVENT-002 act 밖 네이티브 클릭의 1,000개 쓰기가 한 커밋으로 반영된다 | EVENT-002 | `spike log.md §5 L108: spikes/events/caret.spike.test.tsx / [A-3b] 1,000 setValue calls from a native click outside act → one commit` | 통과 |
| EVENT-004 batch의 1,000개 쓰기는 한 통지 순회와 한 React 커밋으로 반영된다 | EVENT-004 | `spike log.md §5 L109: spikes/events/caret.spike.test.tsx / [A-3c] 1,000 setValue calls inside store.batch → one dispatch, one commit` | 통과 |
| EVENT-008 리스너 되먹임의 두 파동 뒤 최종 값이 찢어짐과 snapshot 경고 없이 반영된다 | EVENT-008 | `spike log.md §5 L110: spikes/events/caret.spike.test.tsx / [A-4] listener writes another node during the wave → one commit, final values, no tearing` | 통과 |
| EVENT-007 10,000개 구독 필드의 루트 전체 쓰기 뒤 DOM에 이전 값이 남지 않는다 | EVENT-007 | `spike log.md §5 L128: spikes/work-loop/redteam4-events/current.test.tsx / commits and timing` | 통과 |
| EVENT-007 리스너가 다른 컴포넌트를 flushSync해도 배달 뒤 모든 필드가 최종 커밋 값을 보인다 | EVENT-007 | `spike log.md §5 L129: spikes/work-loop/redteam4-events/react.test.tsx / 1a. listener calls flushSync mid-wave (setState of another component)` | 통과 |
| EVENT-007 revision 일괄 증가 뒤 파동 중 flushSync에서도 1,000개 필드의 최종 DOM이 일치한다 | EVENT-007 | `spike log.md §5 L132: spikes/work-loop/redteam4-events/react.test.tsx / 1c. tearing with 1,000 nodes, flushSync mid-wave, bumpAllFirst=true` | 통과 |
| EVENT-002 flushSync 없는 한 핸들러의 1,000개 필드 변경은 한 React 커밋이다 | EVENT-002 | `spike log.md §5 L133: spikes/work-loop/redteam4-events/react.test.tsx / 1c-plain. 1,000 nodes, no flushSync: commits per handler` | 통과 |
| EVENT-005 루트 구독 부모와 필드 구독 자식이 같은 최종 값을 렌더한다 | EVENT-005 | `spike log.md §5 L134: spikes/work-loop/redteam4-events/react.test.tsx / parent tracks root, child tracks f0; consumer flushSync on root=false` | 통과 |
| EVENT-007 루트 리스너의 flushSync 뒤에도 자식 DOM이 최종 값과 일치한다 | EVENT-007 | `spike log.md §5 L135: spikes/work-loop/redteam4-events/react.test.tsx / parent tracks root, child tracks f0; consumer flushSync on root=true` | 통과 |
| EVENT-002 10,000개 동기 구독 필드의 한 핸들러 변경이 한 React 커밋으로 배달된다 | EVENT-002 | `spike log.md §5 L144: spikes/work-loop/redteam4-events/react.test.tsx / model: synchronous notify` | 통과 |

### proxy-refresh.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| LANDING-199 external replacement refreshes changed inputs and preserves unchanged inputs | LANDING-199 | `disposition L126: SchemaNodeProxy.refresh.test.tsx` | 통과 |
| EVENT-002 unchanged content produces no phantom UpdateValue delivery | EVENT-002 | `execution-plan §2.1 I20 / SETTLE-043; disposition SchemaNodeProxy.refresh.test.tsx` | 통과 |
| LANDING-042 a terminal object refreshes while the ordinary object wrapper remains | LANDING-042 | `disposition L126: SchemaNodeProxy.refresh.test.tsx` | 통과 |
| EVENT-073 refresh remounts the addressed input and retains its node | EVENT-073 | `disposition L126: SchemaNodeProxy.refresh.test.tsx` | 통과 |
| TEST-020 FormGroupRenderer consumes node.strategy for branch and terminal rendering | TEST-020 | `U9 / TEST-020: node.strategy` | 통과 |
| LANDING-039 render-prop output and nested input show the same settled value | LANDING-039 | `disposition L114: renderProp.value.render.test.tsx` | 통과 |
| LANDING-022 non-function children keep their element while subscriptions update | LANDING-022 | `disposition L114: renderProp.value.render.test.tsx` | 통과 |
| LANDING-199 derived target refreshes after source input without replacing the source | LANDING-199 | `disposition L126: SchemaNodeProxy.refresh.test.tsx` | 통과 |
| SETTLE-043 restoring source content makes no phantom watch or derived delivery | SETTLE-043 | `execution-plan §2.1 I20 / SETTLE-043; disposition SchemaNodeProxy.refresh.test.tsx` | 통과 |

### schema-node-props-flow.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| WRITE-083 input value dirty and external-error clearing commit together | WRITE-083 | `disposition L125: SchemaNodePropsFlow.test.tsx` | 통과 |
| LANDING-168 root readOnly rejects input value dirty and error changes | LANDING-168 | `disposition L125: SchemaNodePropsFlow.test.tsx` | 실패 |
| LANDING-168 root disabled rejects input callbacks | LANDING-168 | `disposition L125: SchemaNodePropsFlow.test.tsx` | 통과 |
| LANDING-201 input Overwrite retains its own DOM and caret | LANDING-201 | `disposition L125: SchemaNodePropsFlow.test.tsx` | 통과 |
| TEST-020 replaced input late onChange cannot mutate value dirty or external errors | TEST-020 | `disposition L125: SchemaNodePropsFlow.test.tsx` | 실패 |
| TEST-020 touched is delivered after blur | TEST-020 | `U9 / TEST-020: finishInput/trim, touched; WRITE-083` | 통과 |
| WRITE-083 finishInput trims only after blur and retains external errors and dirty | WRITE-083 | `U9 / TEST-020: finishInput/trim, touched; WRITE-083` | 실패 |
| WRITE-083 finishInput on an already trimmed value makes no value write | WRITE-083 | `U9 / TEST-020: finishInput/trim, touched; WRITE-083` | 통과 |
| WRITE-083 automatic write suppression disables trimming | WRITE-083 | `U9 / TEST-020: finishInput/trim, touched; WRITE-083` | 통과 |

### settle-errors.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| TEST-020 mount expression errors leave a visible degraded form and report once after commit | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 degraded imperative submission rejects without calling onSubmit | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 native degraded submit reaches onError and the ownerless sink | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 root boundary contains render failures and reports the component stack once | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 buffered load errors precede a root render failure | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 field boundary reports through the instance and preserves sibling inputs | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 onError throwing in componentDidCatch reaches the sink without a host boundary | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 validation verdicts do not call onError | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 host onSubmit exceptions go only to the ownerless sink | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 ownerless sink prefers reportError over console fallback | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 ownerless ErrorEvent cancellation prevents a second console report | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 ownerless sink uses console when ErrorEvent is unavailable | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 mount derive budget errors retain a visible form | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 mount injection-target errors retain a visible form | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |
| TEST-020 mount shared conflict renders a fallback instead of the conflicting form | TEST-020 | `U9 / TEST-020: mount errors, boundaries, onError, ownerless sink` | 통과 |

### settle.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| TEST-023 settle.gated-shape | TEST-023 | `disposition L78: harness.smoke.test.tsx` | 통과 |
| TEST-023 settle.form-reset-load | TEST-023 | `disposition L78: harness.smoke.test.tsx` | 통과 |
| LANDING-010 if-then-adult-roundtrip | LANDING-010 | `disposition L157: src/__legacy__/core/__tests__/IfThenElse.onChange.realReact.test.tsx` | 통과 |
| LANDING-010 if-then-rapid-toggle | LANDING-010 | `disposition L158: src/__legacy__/core/__tests__/IfThenElse.onChange.realReact.test.tsx` | 통과 |
| TEST-020 mount settlement exposes trimmed defaults without onChange | TEST-020 | `disposition L83: array.omit-trailing.injection.render.test.tsx` | 통과 |
| TEST-020 rendering and mounting settled defaults never calls onChange | TEST-020 | `U9 / TEST-020: mount, reset, touched` | 통과 |
| LANDING-157 reset clears interaction state and remounts terminal inputs | LANDING-157 | `disposition L115: reset.pristine.render.test.tsx` | 통과 |
| TEST-020 blur immediately followed by reset discards deferred touched | TEST-020 | `U9 / TEST-020: mount, reset, touched` | 통과 |
| TEST-020 blur immediately followed by clearState discards deferred touched | TEST-020 | `U9 / TEST-020: mount, reset, touched` | 통과 |

### upload-file.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| TEST-023 single file attachment is visible through the form handle | TEST-023 | `disposition L120: upload-file.render.test.tsx` | 통과 |
| TEST-023 multiple attachments retain their File identities | TEST-023 | `disposition L120: upload-file.render.test.tsx` | 통과 |
| LANDING-148 branch exit removes attachments and find returns null | LANDING-148 | `disposition L120: upload-file.render.test.tsx` | 통과 |
| TEST-020 reset clears the same attachment map and rejects late attachments | TEST-020 | `disposition L120: upload-file.render.test.tsx` | 통과 |
| LANDING-042 external replacement rejects attachments from the replaced input | LANDING-042 | `disposition L120: upload-file.render.test.tsx` | 통과 |

### validation.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| TEST-023 validation.if-only-oneof-invalid | TEST-023 | `U9 / TEST-023: existing SCN validation` | 통과 |
| TEST-023 validation.union-type-error-on-node | TEST-023 | `U9 / TEST-023: existing SCN validation` | 통과 |
| TEST-005 nullable-formats | TEST-005 | `disposition L167: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| LANDING-115 active conditional required and maxItems errors exclude inactive fragments | LANDING-115 | `disposition L122: validation.branch-marker.render.test.tsx` | 통과 |
| TEST-005 nullable price rejects values outside minimum and maximum | TEST-005 | `disposition L159: NullableFormScenarios.test.tsx` | 통과 |

### value-overrides.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| LANDING-035 removing the last Form.Input override updates the DOM | LANDING-035 | `disposition L111: override-props.render.test.tsx` | 통과 |
| LANDING-035 replacing a Form.Input override updates the DOM | LANDING-035 | `disposition L111: override-props.render.test.tsx` | 통과 |

### value-projection.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| TEST-023 value.root-output | TEST-023 | `U9 / TEST-023: existing SCN value` | 통과 |
| TEST-023 value.omit-empty-object | TEST-023 | `U9 / TEST-023: existing SCN value` | 통과 |
| VALUE-036 loaded null retains child defaults for later input promotion | VALUE-036 | `disposition L103: nullable.object-blank-state.render.test.tsx` | 통과 |
| LANDING-200 child input promotes caller null without sibling filling | LANDING-200 | `disposition L104: nullable.object-initial-null.render.test.tsx` | 통과 |
| REACT-027 clearing a nullable string sends null instead of an empty string | REACT-027 | `disposition L110: nullable.render.test.tsx` | 통과 |
| LANDING-196 non-nullable empty input sends undefined | LANDING-196 | `disposition: nullable.render.test.tsx; LANDING-196 / REACT-027` | 통과 |

### value.test.tsx

| 사례 제목 | 원장 | 출처 | 결과 |
| --- | --- | --- | --- |
| TEST-005 nullable-contact-fields | TEST-005 | `disposition L159: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| TEST-005 nullable-price-limits | TEST-005 | `disposition L160: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| TEST-005 nullable-boolean-null-false | TEST-005 | `disposition L161: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| TEST-005 nullable-nested-address | TEST-005 | `disposition L162: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| TEST-005 nullable-array-items | TEST-005 | `disposition L163: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| TEST-005 nullable-array-container | TEST-005 | `disposition L164: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| TEST-005 nullable-required-mix | TEST-005 | `disposition L166: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| TEST-005 nullable-deep-structure | TEST-005 | `disposition L168: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| TEST-005 nullable-job-application | TEST-005 | `disposition L169: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |
| TEST-005 pure-null-field | TEST-005 | `disposition L170: src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | 통과 |

## 실패 증거

3건을 실패 상태로 유지했습니다. 첫 실패 뒤 단언까지 실행됐다고 주장하지 않습니다.

| 파일 / 사례 / 원장 | 기대 | 관찰 |
| --- | --- | --- |
| schema-node-props-flow.test.tsx / LANDING-168 root readOnly rejects input value dirty and error changes | 잠금 입력 뒤 외부 오류를 보존하며 폼 목록에서도 읽힘 | 값 before·dirty 불변과 노드 외부 오류 보존은 통과하나 getErrors()는 []입니다. |
| schema-node-props-flow.test.tsx / TEST-020 replaced input late onChange cannot mutate value dirty or external errors | reset 뒤 늦은 입력이 값·dirty·외부 오류를 바꾸지 않고 폼 목록에도 오류 유지 | 값 loaded·dirty 미설정·노드 오류 보존은 통과하나 getErrors()는 []입니다. |
| schema-node-props-flow.test.tsx / WRITE-083 finishInput trims only after blur and retains external errors and dirty | blur 후 트림과 외부 오류 유지 | 트림·DOM 교체·노드 오류 보존은 통과하나 getErrors()는 []입니다. 뒤의 dirty 단언은 도달하지 않았습니다. |

외부 오류 3건의 기대 목록은 [{ dataPath: "", keyword: "external", message: "server" }]입니다. 잠금/늦은 입력/trim이 노드 오류를 지웠다는 보고가 아니라 노드 errors와 폼 globalErrors 표면의 차이입니다. 폼 목록 포함 기대는 SURFACE-053·VALIDATE-043·ERROR-015를 함께 해석한 것이므로 검토 시 이 경계를 확인해야 합니다. 현재 구현의 빈 목록에 맞춰 기대를 바꾸지 않았습니다.

재현: PKG에서 `npx vitest run --project render --reporter=verbose src/__tests__/e2e/schema-node-props-flow.test.tsx`.

## P-25 관찰

proxy-refresh의 EVENT-002 unchanged content produces no phantom UpdateValue delivery 및 SETTLE-043 restoring source content makes no phantom watch or derived delivery는 통과했습니다. batch 안의 same → temporary → same 복원 뒤 최종 값이 이전과 같고 UpdateValue·파생 값·watch 전달이 0이었습니다. notify의 동일 값 재쓰기 장면도 배달·onChange·검증 요청 0으로 통과했습니다. 이 범위에서 P-25는 재현되지 않았으며 제품 코드는 고치지 않았습니다.

## 명령과 검증 제한

| 위치 | 명령 | 결과 |
| --- | --- | --- |
| PKG | `npx vitest run --project render --reporter=dot src/__tests__/e2e` | 실행했습니다. JSON reporter를 더한 최종 전체 실행은 26파일·195건, 192 통과 / 3 실패였습니다. |
| PKG | 최종 전체 실행의 JSON에서 그룹 A 13파일 집계 | 최종 101건, 98 통과 / 3 실패. 전체 실행 57.80초. 위 사례 표의 근거입니다. |
| PKG | `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json` | exit 0 |
| PKG | `npx eslint "src/__tests__/**/*.{ts,tsx}"` | exit 0 |
| SCN | `npx vitest run --config vite.config.ts` | 21건, 17 통과 / 4 실패 |
| SCN | `npx tsc --noEmit --strict --composite false -p tsconfig.json` | exit 0 |

최종 전체 render에서 그룹 A 밖 94건은 모두 통과했습니다. 이전 실행에서는 controls-input과 derive에서 각 1건이 실패했지만 병렬 작업 중 바뀐 최종 결과와 구분합니다. 그룹 B 파일을 수정하지 않았습니다.

SCN 실패는 src/__tests__/families.test.ts의 union/derive/controls/array has executable steps with observable expectations 4건입니다. 구조 검사에서 true 대신 false를 받았습니다. 그룹 A의 value/settle/fill/exit/notify/validation 검사는 통과했습니다. 그룹 B 데이터와 공용 검사 파일을 수정하지 않았습니다.

원장 보충을 대조하여 바로잡은 시험 조건: VALUE-036 보충(18C-100)은 로드 null의 자식 채움을 허용합니다. 처음의 LANDING-139 사례가 이를 로드 아닌 null과 혼동했으므로 로드 채움과 호출자 null을 분리했습니다. REACT-027은 nullable 비우기를 null로 정의하므로 그 조작과 non-nullable 빈 입력(undefined)을 별도 사례로 검증합니다. 두 수정은 현재 구현을 근거로 하지 않고 해당 원장 문장을 근거로 했으며, 이전 초안의 두 nullable 실패를 제품 결함으로 보고하지 않습니다.

시험 작성 중 바로잡은 계측: state는 SchemaNodeState 숫자 키의 객체로 읽고 touched는 RAF 뒤 관찰합니다. GroupRenderer는 계약의 Input을 그립니다. 오류 전용 사례는 ValidationMode.None으로 VALIDATOR_MISSING 경고를 배제하여 원인 오류와 싱크 횟수를 검사합니다.

초기 대량 실행은 10,000개 개별 쓰기를 하니스가 루트 스냅숏으로 모두 보관하면서 메모리 부족으로 중단됐습니다. 원본 model: synchronous notify가 root.batch를 쓰므로 이식 코드에도 그 batch를 복구했습니다. 최종 두 10,000개 시험은 실제 입력을 모두 그린 채 통과했습니다. 입력 수나 커밋·DOM 기대를 줄이지 않았습니다.

보고 범위는 그룹 A jsdom e2e입니다. React 18·SSR/hydration·프로덕션 번들·Storybook 브라우저 게이트 전체 완료를 주장하지 않습니다. 최종 런타임 JSON 근거는 git 대상이 아닌 .seiri/tasks/u9-e2e-group-a/final-results.json에 있고 이 문서가 지속적인 기록입니다.
