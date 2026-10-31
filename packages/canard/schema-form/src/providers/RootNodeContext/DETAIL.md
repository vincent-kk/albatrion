# RootNodeContext

## Requirements

루트 트리를 생성하고 검증·상태·변경 콜백과 외부 오류를 연결합니다.

## API Contracts

- OnChange 최초 마운트 검증은 준비 layout effect가 다음 화면 뒤 슬롯에 예약한다. if 게이트가 없는 스키마의 전체 컴파일과 첫 검증도 그 슬롯에서 수행하며, if 게이트의 렌더 중 컴파일은 유지한다. 명시적 validate와 제출의 즉시 실행은 유지한다(IR-6).
- 예약 슬롯에서 `store.load !== load`이면 교체된 이전 로드를 검증하지 않는다. 실행 시점의 `load.root`가 없으면 종료한다. load.ready가 거짓이면 선택적 `mountValidationOwed`를 세우고, 같은 load의 다음 layout effect가 먼저 false로 소비한 뒤 한 슬롯만 다시 예약한다. 오직 !ready인 슬롯만 true로 쓰므로 한 load의 마운트 슬롯은 최대 하나이다. cleanup은 슬롯을 취소하지 않으며 StrictMode 재실행은 중복 예약하지 않는다. 실제 unmount 뒤에는 owed를 소비하지 않는다(IR-6).
- 마운트 helper는 기존 root.validate를 호출하며 컴파일 실패는 engine의 런타임별 첫 보고만 남기도록 `SchemaFormError`의 `FormErrorCode.ValidatorCompileFailed`를 다시 capture하지 않는다. 마운트 컴파일 실패는 한 번 보고한다. 쓰기 실행의 거부가 마운트 슬롯 실행 전에 처리되면 표면은 `sink`이다(자식 입력의 layout 쓰기, jsdom 및 프레임 콜백마다 마이크로태스크 체크포인트가 있는 보이는 탭). 그 밖에는 `rejected`이며, 예약 시 숨은 브라우저 문서에서는 두 실행이 같은 MessageChannel 묶음에 들어가 마운트의 스탬프 증가가 쓰기 실패를 버리는 경우를 포함한다. 다른 실패는 기존 reporter의 `rejected` capture를 유지한다(IR-6).
- 마운트 슬롯 전에 쓰기가 끝나면 root.validate가 스탬프를 올려 대기 쓰기 검증을 버리고 최신 커밋을 판정한다. 같은 스키마 reset은 동일 load를 보존하며, 루트 교체 reset은 폐기된 옛 루트의 슬롯을 무효화한다(IR-6).
- BLUEPRINT-052 / SURFACE-063: createRootLoad injects the app-owned schema identity cache with stable renderer predicates. Explicit rebuild invalidates the committed schema and forces the existing replacement-load path with the same reset option. Ordinary reset preserves its existing root, even after another form invalidates the shared cache (round-447 coordinator clarification).

- 스키마와 기본값 의존성에 맞춰 루트 생성 결과를 재사용하거나 재생성합니다.
- `onValidate`는 보고된 오류 목록이 바뀔 때만 부릅니다. 같은 목록 참조는 연속으로 두 번 보고하지 않으며(246C-01), 직전 보고가 빈 목록이면 검증 모드와 경로(reset 안팎)에 관계없이 이어지는 빈 집계는 다시 보고하지 않습니다(245C-01).
- reset의 빈 목록 보충 보고에서 소비자 `onValidate`가 던져도 로드 오류가 있으면 그 오류를 우선 던집니다. 첫 보고 전 OnRequest 재생성 reset은 빈 목록을 보고하지 않습니다(246C-01).
- 모든 검증 모드에서 reset 후 루트의 집계 오류가 비어 있고 마지막 `onValidate` 보고가 비어 있지 않았으면 빈 목록을 한 번 보고하며, 마지막 보고가 이미 비어 있거나 새 집계 오류가 남아 있으면 추가 보고하지 않습니다(243C-01).
- 살아 있는 노드 판정은 호출 시점의 binding 루트를 읽고 첫 commit에서 아직 binding이 준비되지 않았으면 Context 루트를 사용하여 자식 layout effect의 초기 입력 쓰기를 허용합니다. 재생성 reset 후에는 새 binding 루트로 옛 노드의 늦은 쓰기를 차단합니다(WRITE-046).
- `reset(option?)`의 자동 쓰기 억제 비트를 같은 트리의 reload와 재생성 트리의 mount에 전달합니다. 호출 옵션은 호출 직후 로드와 validator·props 커밋 재대조에서 Form 기본값보다 우선하며, 재대조 reset도 원래 호출 옵션을 유지하고 다른 비트는 무시합니다(WRITE-015·044, LANDING-039).
- 구독 설정 후 onReady를 호출하고, 외부 오류는 전체 목록을 루트에 적용한 뒤 경로별 비루트 노드에도 전달합니다. 같은 스키마와 재생성 reset은 현재 트리에 두 적용을 동기로 다시 수행하므로 `getErrors()`는 루트 외부 오류 + 검증 목록을 읽습니다(WRITE-045, SURFACE-053, VALIDATE-043, 69C-03, 79C-01).
- 외부 오류의 dataPath는 현재·이전 목록에서 각각 한 번만 읽어 `find()`로 찾은 노드의 표준 경로별로 묶고(`#/field`·`field`는 `/field`로) 원래 순서로 적용합니다. 이전 목록에만 남은 경로는 빈 오류로 지우며 누락 노드는 건너뜁니다(79C-01).
- 배열이 아닌 `errors` prop과 이전 목록은 0.16.0과 같이 빈 목록으로 받습니다. `null`·객체 입력은 예외 없이 루트의 외부 오류를 비우고 비루트 노드에는 아무것도 전달하지 않습니다(178C-01).

- Context 객체(`RootNodeContext`·`RootBindingContext`)와 Provider는 `components/`, 훅(`useRootNodeContext`·`useLiveNode`)은 `hooks/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

- 기존 한계: 준비된 load의 layout effect가 Suspense·Activity로 정리되어 !ready인 동안 보고된 기록은 load.records에 버퍼링되지만 다시 전달되지 않는다. D1에서는 마운트 슬롯 전에 숨겨진 폼의 쓰기 컴파일 실패가 이 경로를 탈 수 있으며 reportValidationFailure의 호스트 싱크는 계속 받는다. 이 동작은 이번 범위에서 수정하지 않는다(IR-6 amendment 1 A4).

## Acceptance Criteria

### root-node-context-contract — 관찰 가능한 동작

- 최초 프레임 전에는 마운트 판정이 없으며, effect 정리 뒤 복원된 load는 미완료 마운트 검증을 한 번 수행한다. 실제 unmount 뒤에는 검증·오류 보고가 없다(IR-6).
- Provider 정리 시 등록한 이벤트 구독을 해제합니다.
- 검증과 상태 이벤트는 대응 콜백으로 전달되며 외부 오류는 경로별로 묶어 주입합니다.

## Last Updated

2026-10-13
