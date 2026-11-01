# RootNodeContext

## Requirements

루트 트리를 생성하고 검증·상태·변경 콜백과 외부 오류를 연결합니다.

## API Contracts

- H: 해석된 policy와 load.root에 keyed인 no-cleanup layout effect 하나가 commitFieldNodeRevealPolicy를 호출한다. 초기 정책은 저장만 하고 이전 committed value와 Object.is가 다르면 그 이전 값과 generation을 이력에 append한다. rebuild·schema·validator 교체의 새 root에도 commit하며 숨김 cleanup은 committed policy를 지우지 않는다.
- 자동 로드 컴파일 실패는 공통 슬롯에서 origin validate로 한 번 보고하고 호스트에 한 번 보내며 명시적 검증의 프로미스 거부는 유지한다.
- P3-10: 첫 layout commit을 마친(prepared) 현행 load는 Provider effect 연결 여부와 관계없이 모든 폼 수준 콜백을 보이는 폼과 같은 순서·내용으로 engine chain 끝에 전달합니다. 한 번도 준비되지 않은 load는 변경·상태·진단을 버리고 기록만 첫 commit까지 보관합니다. reset으로 은퇴한 load는 hasConsumer()가 false이며 기록을 버려 소비자에게 다시 전달하지 않습니다. Provider는 은퇴 뒤의 engine 기록에 호스트 보고를 추가하지 않고 기존 reportOwnerlessError를 유지합니다. 루트 교체 뒤 정착한 옛 검증은 stamp·폐기로 소비자에 도달하지 않고, 슬롯은 예약할 때 붙잡은 load.retired로 host 보고도 생략합니다. 같은 스키마 reset과 unmount는 load가 은퇴하지 않아 늦은 슬롯 실패를 onError와 host에 한 번씩 전달합니다.

- R-f/R-g: reset의 각 build-time 기록은 handler별로 격리하고 실패를 reportErrorToHost로 보낸 뒤 나머지 기록·binding 교체를 계속합니다. 준비 전 기록만 새 load 앞에 옮기고 원래 root·warning scope를 보존합니다. mount 기록이 build 기록보다 먼저 전달됩니다(L4).

- W4: 로드 검증 helper는 engine이 이미 보고한 실패를 다시 capture하지 않는다. compile 실패를 제외한 원래 슬롯 판정 거부를 host에 한 번 전달하며 MultipleErrors의 원소는 첫 원인부터 handler 오류까지 순서대로 보낸다.
- W5: buffered record의 원래 root를 reporter.root에 보존하고 현재 load.root에도 observeFieldNodeReports guard를 적용해 onError가 현행 폼에 쓸 수 없게 한다.
- 표시 정책은 로드 검증 예약을 바꾸지 않으며 Always 전용 ref·effect는 없다.
- 로드 슬롯 전에 쓰기 요청이나 명시적 루트 검증이 있으면 컴파일 후 슬롯 판정은 생략한다. 하위 명시적 검증은 로드 판정을 대체하지 않는다.
- Always의 첫 오류 표시도 다음 프레임 뒤 슬롯까지 늦어지며 조상 layout 쓰기는 같은 요청 스탬프 규칙을 따른다.

- Always(`true`, `ShowError.Always` 또는 해당 비트를 포함한 mask)를 포함해 최초 마운트·동일 스키마 reset·루트 교체 reset·rebuild·검증기 교체는 하나의 로드 검증 진입점을 다음 프레임 뒤 슬롯에서 실행합니다. `None`은 컴파일하지 않고, `OnRequest`만이면 컴파일만 하며, `OnChange`는 컴파일 후 현재 로드 시작 이후 쓰기 검증 요청이나 명시적 루트 검증이 없을 때 첫 판정을 냅니다. 자동 로드 컴파일 실패는 새 트리를 유지하고 로드마다 `origin: 'validate'` 한 번과 호스트 보고 한 번이며 reset·rebuild는 그 실패로 던지지 않습니다. `validate()`·제출은 슬롯을 거치지 않고 즉시 시작하며, 검증기 실패로 거부하면 기록의 origin은 `validate`이고 degraded 제출 거부는 origin `submit`입니다. `if` 게이트의 구성·렌더 중 컴파일은 유지합니다. 첫 판정 전 빈 목록은 unknown으로 다루거나 `validate()`를 기다립니다. 명시적 반환과 제출 값은 호출 시점 snapshot이며 하위 검증은 전체 pending 요청을 보존합니다.
- V6: prepared 현행 load의 hidden 기록은 chain 끝에 바로 전달합니다. reset의 build 기록은 각각 try/catch하여 handler 실패 뒤에도 다음 기록과 binding 교체를 계속합니다.
- V7: never-prepared load가 reset으로 교체될 때 batch try/catch 뒤에 records를 새 load 앞에 옮깁니다. reset 사슬에서 새로 생긴 기록까지 원래 root·warning scope로 한 번 전달하며 이전 load의 전체 기록이 새 build 기록보다 앞섭니다. 교체 load는 prepared와 함께 reported를 확정하여 pendingLoad가 caller에게 던진 오류를 다시 flush하지 않습니다. next.error는 caller throw를 위해 보존합니다. 이미 준비된 load는 숨김 중에도 buffer하지 않습니다. 첫 commit의 reported 가드는 유지합니다. 교체된 never-prepared load의 생성 실패도 reset 끝에 한 번 capture·호스트 보고합니다.

- 최초 마운트·모든 reset·rebuild·검증기 교체는 scheduleLoadValidation 하나를 사용한다. 최초 예약은 !load.prepared 안에 있어 StrictMode replay에서 중복되지 않는다.
- 예약 슬롯은 현행 load·root와 loadValidation 토큰을 모두 확인한다. 같은 load의 다음 reset도 이전 토큰을 버린다. cleanup·숨김은 취소하지 않는다.
- startFieldNodeLoadValidation이 컴파일·실패 보고·현재 로드 이후 요청 조회를 담당하며 true일 때만 validateLoadRoot를 호출한다.
- Provider의 mount·같은 스키마 reload·교체 mount는 모두 deferValidation을 켜 엔진 사슬의 자동 요청을 미룬다. reset 구독 교체 뒤 공통 슬롯을 예약한다.
- BLUEPRINT-052 / SURFACE-063: createRootLoad injects the app-owned schema identity cache with stable renderer predicates. Explicit rebuild invalidates the committed schema and forces the existing replacement-load path with the same reset option. Ordinary reset preserves its existing root, even after another form invalidates the shared cache (round-447 coordinator clarification).

- 스키마와 기본값 의존성에 맞춰 루트 생성 결과를 재사용하거나 재생성합니다.
- `onValidate`는 보고된 오류 목록이 바뀔 때만 부릅니다. 같은 목록 참조는 연속으로 두 번 보고하지 않으며(246C-01), 직전 보고가 빈 목록이면 검증 모드와 경로(reset 안팎)에 관계없이 이어지는 빈 집계는 다시 보고하지 않습니다(245C-01).
- reset의 빈 목록 보충 보고에서 소비자 `onValidate`가 던져도 로드 오류가 있으면 그 오류를 우선 던집니다. 첫 보고 전 OnRequest 재생성 reset은 빈 목록을 보고하지 않습니다(246C-01).
- 모든 검증 모드에서 reset 후 루트의 집계 오류가 비어 있고 마지막 `onValidate` 보고가 비어 있지 않았으면 빈 목록을 한 번 보고하며, 마지막 보고가 이미 비어 있거나 새 집계 오류가 남아 있으면 추가 보고하지 않습니다(243C-01).
- 살아 있는 노드 판정은 호출 시점의 binding 루트를 읽고 첫 commit에서 아직 binding이 준비되지 않았으면 Context 루트를 사용하여 자식 layout effect의 초기 입력 쓰기를 허용합니다. 재생성 reset 후에는 새 binding 루트로 옛 노드의 늦은 쓰기를 차단합니다(WRITE-046).
- `reset(option?)`의 자동 쓰기 억제 비트를 같은 트리의 reload와 재생성 트리의 mount에 전달합니다. 호출 옵션은 호출 직후 로드와 validator·props 커밋 재대조에서 Form 기본값보다 우선하며, 재대조 reset도 원래 호출 옵션을 유지하고 다른 비트는 무시합니다(WRITE-015·044, LANDING-039).
- 외부 오류는 전체 목록을 루트에 적용한 뒤 경로별 비루트 노드에도 전달합니다. 같은 스키마와 재생성 reset은 현재 트리에 두 적용을 동기로 다시 수행하므로 `getErrors()`는 루트 외부 오류 + 검증 목록을 읽습니다(WRITE-045, SURFACE-053, VALIDATE-043, 69C-03, 79C-01).
- errors effect는 같은 commit의 validator 교체·pending reset 재대조가 끝난 store.load.root에 적용하며 reset의 applyFormErrors는 load origin을 명시합니다. 외부 오류의 dataPath는 현재·이전 목록에서 각각 한 번만 읽어 `find()`로 찾은 노드의 표준 경로별로 묶고(`#/field`·`field`는 `/field`로) 원래 순서로 적용합니다. 이전 목록에만 남은 경로는 빈 오류로 지우며 누락 노드는 건너뜁니다(79C-01).
- 배열이 아닌 `errors` prop과 이전 목록은 0.16.0과 같이 빈 목록으로 받습니다. `null`·객체 입력은 예외 없이 루트의 외부 오류를 비우고 비루트 노드에는 아무것도 전달하지 않습니다(178C-01).

- Context 객체(`RootNodeContext`·`RootBindingContext`)와 Provider는 `components/`, 훅(`useRootNodeContext`·`useLiveNode`)은 `hooks/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

- 첫 commit은 기존 구독 해제 → 구독 → prepared → flushRootLoad → applyFormErrors → 로드 검증 슬롯 예약 순서입니다. 그 전에 reset으로 교체된 load는 prepared만 설정하고 나머지는 생략합니다. reset이 현행 load를 구독했으므로 show·StrictMode replay는 재구독하지 않습니다.

### Hidden delivery limits

- L1: React는 숨김과 실제 unmount를 구분하지 않습니다. 실제 unmount 뒤에도 prepared와 루트 구독은 유지되며 보유한 핸들·노드의 쓰기, reset·rebuild·validate·submit과 예약 슬롯은 콜백을 전달합니다. mounted 트리의 검증 루트 참조 수는 cleanup에서 해제합니다. unmount 뒤 reset으로 만든 새 루트는 retain하지 않아 캐시 축출 뒤 재컴파일할 수 있습니다.
- L2: 숨김 중 onChange·onStateChange·onValidate·onDiagnosticsChange는 마지막 연결 commit의 콜백을 사용하고 prop 갱신은 show에 반영됩니다. onError는 insertion effect로 최신입니다. 숨김 중 Form ref는 null이므로 이전에 보유한 핸들·노드를 사용합니다.
- L3: 필드 layout effect의 렌더 경고와 쓰기는 show에 도착합니다. prepared load의 show 쓰기는 즉시 전달하지만 최초 mount의 준비 전 쓰기는 REACT-007에 따라 버립니다. 개발 StrictMode replay도 React가 hide/show로 모델링하므로 비멱등 자식 layout 쓰기가 replay에서 전달되며 production 렌더는 영향을 받지 않습니다.
- L4: 루트 교체 reset의 기록은 binding을 새 루트로 바꾸기 전에 전달하므로 onError 안의 handle.node는 옛 루트입니다. mount-time 기록이 build-time 기록보다 먼저 도착합니다.

- 루트 교체 reset의 옛 load는 batch try/catch 뒤 은퇴한다. adoption은 컴파일하지 않으며 새 트리를 유지한다. 다음 프레임 뒤 슬롯의 컴파일 실패는 onError origin validate 한 번과 host 한 번이다. never-prepared build 오류 이관·handler 격리 규칙은 유지한다.

### onError origin

reset·rebuild·검증기 교체는 batchFieldNodeLoad로 load 사슬을 엽니다. 중첩 시 바깥 사슬의 origin을 보존합니다. 최초 applyFormErrors는 load, errors prop 변경은 write입니다. 내부 recordScopes는 공개 origin이 아닌 원래 root·warning scope를 추적합니다.

## Acceptance Criteria

### root-node-context-contract — 관찰 가능한 동작

- Always를 포함한 모든 모드는 최초 프레임 전 로드 판정이 없으며 숨김·unmount 뒤에도 슬롯을 실행한다. OnRequest-only는 컴파일만 하고 None은 생략한다.
- Provider cleanup은 검증 루트 retain을 해제하며 load 구독은 reset 교체 또는 GC까지 유지합니다.
- 검증과 상태 이벤트는 대응 콜백으로 전달되며 외부 오류는 경로별로 묶어 주입합니다.

## Last Updated

2026-10-13
