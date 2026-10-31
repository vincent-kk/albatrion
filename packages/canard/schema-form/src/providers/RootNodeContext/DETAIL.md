# RootNodeContext

## Requirements

루트 트리를 생성하고 검증·상태·변경 콜백과 외부 오류를 연결합니다.

## API Contracts

- U3: render의 useFieldRendererContext().checkShowError()를 layout effect가 캡처하여 Always 여부를 결정한다. 최초 OnChange 마운트가 Always이면 쓰기 요청 여부와 관계없이 root.validate를 layout에서 바로 시작하여 queued write를 stamp로 무효화하고 현재 pending을 정착시킨다. 동기 검증은 첫 프레임에 오류를 표시한다. 다른 모드는 일회성 화면 뒤 슬롯을 유지한다. inline·deferred는 같은 컴파일 실패 필터를 사용하며 Always의 최초 compile 실패는 rejected 한 번이다.
- V6: reconnect의 모든 buffered record는 각자 try/catch하여 onError 실패를 reportErrorToHost로 보내고 다음 기록·owed 재예약을 계속한다.
- V7: !ready load를 rebuild 또는 루트 교체 reset으로 대체하면 옛 records를 새 load의 기록 앞에 옮기며 각 기록의 원래 root를 보관한다. 전달 시 그 root를 reporter.root로 먼저 설정하고 원래 순서로 한 번 전달한다. 숨김 동안에는 새 load에서도 보류하고, flushRootLoad의 첫 commit reported 가드는 유지한다.

- OnChange 최초 마운트 검증은 준비 layout effect가 다음 화면 뒤 슬롯에 예약한다. if 게이트가 없는 스키마의 전체 컴파일과 첫 검증도 그 슬롯에서 수행하며, if 게이트의 렌더 중 컴파일은 유지한다. 명시적 validate와 제출의 즉시 실행은 유지한다(IR-6).
- 예약 슬롯에서 `store.load !== load`이면 교체된 이전 로드를 검증하지 않는다. 실행 시점의 `load.root`가 없으면 종료한다. load.ready가 거짓이면 선택적 `mountValidationOwed`를 세우고, 같은 load의 다음 layout effect가 먼저 false로 소비한 뒤 한 슬롯만 다시 예약한다. 오직 !ready인 슬롯만 true로 쓰므로 한 load의 마운트 슬롯은 최대 하나이다. cleanup은 슬롯을 취소하지 않으며 StrictMode 재실행은 중복 예약하지 않는다. 실제 unmount 뒤에는 owed를 소비하지 않는다(IR-6).
- 마운트 슬롯은 실행 시 hasFieldNodeValidationRequest(root)가 참이면 root.validate를 호출하지 않는다. 쓰기 요청이 최신 커밋을 자체 판정하며 명시적 루트 검증도 마운트 의무를 충족한다. 비루트 검증의 0 스탬프만으로는 의무가 끝나지 않는다. 아무 요청도 없는 마운트는 한 번 검증한다. 컴파일 실패는 한 번 보고하며, 마운트 슬롯이 첫 검증을 실행하면 rejected, 쓰기 검증이 먼저 요청되어 마운트를 건너뛰면 sink이다. helper는 SchemaFormError의 FormErrorCode.ValidatorCompileFailed를 다시 capture하지 않고 다른 실패는 기존 rejected capture를 유지한다(IR-6 R2·R3).
- 마운트 슬롯 전에 쓰기 검증이 요청되면 마운트를 건너뛰고 쓰기 경로가 최신 커밋을 판정한다. 같은 스키마 reset은 동일 load를 보존하며, 루트 교체 reset은 폐기된 옛 루트의 슬롯을 무효화한다(IR-6).
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

- 이미 prepared인 load의 layout effect가 복원되면, !ready 동안 load.records에 모인 모든 기록을 순서대로 비우고 load.reporter.root를 먼저 설정하여 reporter.report로 전달한다. 이는 owed 재예약보다 앞서며 첫 commit의 flushRootLoad·reported 가드는 유지한다. 숨김 중 쓰기 컴파일 실패도 복원 뒤 onError에 한 번 도착한다(IR-6 R1, A4 대체).
- 한 프레임 안에서 쓰기 뒤 unmount하면 은퇴한 트리의 검증이 한 번 실행될 수 있다. 구독자에게 판정은 도착하지 않으며 실패는 ready가 아니므로 호스트 싱크에만 도착한다. cleanup 취소는 Suspense·Activity 숨김도 취소하므로 한 실행을 줄이기 위한 suspend/resume 기계를 추가하지 않는다(IR-6 R5).

## Acceptance Criteria

### root-node-context-contract — 관찰 가능한 동작

- 최초 프레임 전에는 마운트 판정이 없으며, effect 정리 뒤 복원된 load는 미완료 마운트 검증을 한 번 수행한다. 실제 unmount 뒤에는 검증·오류 보고가 없다(IR-6).
- Provider 정리 시 등록한 이벤트 구독을 해제합니다.
- 검증과 상태 이벤트는 대응 콜백으로 전달되며 외부 오류는 경로별로 묶어 주입합니다.

## Last Updated

2026-10-13
