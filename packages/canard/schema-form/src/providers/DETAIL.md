# providers

## Requirements

폼 설정을 역할별 Context로 전달하고 Provider 간 의존 순서를 유지합니다.

## API Contracts

- 폼 수준 설정은 선택적 외부 설정보다 우선합니다.
- 노드 생성·입력 제어·렌더링·가상화의 각 소비자는 해당 Context 계약으로 값을 얻습니다.
- `RootNodeContext`의 초기 트리는 렌더 중 `useMemo`에서 `RootNodeContext/utils/createRootLoad.ts`의 `buildFieldNodeTree`·`mountFieldNode` 통로로 작성·마운트합니다. 작성 루트 identity를 유지하며 선택 검증기, 맥락, 폼 쓰기 정책, 터미널·원자 판정 함수와 버퍼형 보고기를 전달하고 마운트의 `deferValidation`을 켭니다. `<Form>`의 첫 마운트와 재생성 reset은 같은 core 생성 통로를 사용합니다(REACT-003·007, VALIDATE-044, 70C-01).
- 준비 layout effect는 첫 commit에만 루트를 구독하고 prepared를 설정하여 버퍼 기록을 `onError`로 한 번 전달한 뒤 공통 로드 검증 슬롯을 예약합니다. 슬롯이 모드별 컴파일·판정을 결정하며, 검증 루트는 `retainValidationRoot`로 보유하고 cleanup에서 `releaseValidationRoot`로 해제합니다. 버려진 렌더의 기록은 전달하지 않고, StrictMode의 이펙트 정리가 로드의 전달 완료 표지를 되돌리지 않습니다(ERROR-026, REACT-007, LANDING-041, 69C-05).
- Always(`true`, `ShowError.Always` 또는 해당 비트를 포함한 mask)를 포함해 최초 마운트·동일 스키마 reset·루트 교체 reset·rebuild·검증기 교체는 하나의 로드 검증 진입점을 다음 프레임 뒤 슬롯에서 실행합니다. `None`은 컴파일하지 않고, `OnRequest`만이면 컴파일만 하며, `OnChange`는 컴파일 후 현재 로드 시작 이후 쓰기 검증 요청이나 명시적 루트 검증이 없을 때 첫 판정을 냅니다. 자동 로드 컴파일 실패는 새 트리를 유지하고 로드마다 `origin: 'validate'` 한 번과 호스트 보고 한 번이며 reset·rebuild는 그 실패로 던지지 않습니다. `validate()`·제출은 즉시 시작하고 실패하면 거부하며 기록의 origin은 `validate`입니다. `if` 게이트의 구성·렌더 중 컴파일은 유지합니다. 첫 판정 전 빈 목록은 unknown으로 다루거나 `validate()`를 기다립니다. 명시적 반환과 제출 값은 호출 시점 snapshot이며 하위 검증은 전체 pending 요청을 보존합니다.
- 준비 전 변경·상태·진단은 버리고 준비된 현행 load는 숨김·unmount 뒤에도 모든 폼 콜백을 chain 끝에 전달합니다. 준비 뒤 `onStateChange`는 `root.globalState`를 읽고, `onValidate`는 루트 `UpdateGlobalError`를 따르되 같은 목록 참조는 연속으로 두 번 보고하지 않으며(246C-01), 직전 보고가 빈 목록이면 이어지는 빈 집계를 다시 보고하지 않고(245C-01), `onDiagnosticsChange`는 루트 `UpdateDiagnostics`를 따라 전달합니다(EVENT-062, REACT-007, LANDING-075).
- `errors` 속성은 전체 목록을 루트에 적용하고 경로 키로 각 비루트 노드에도 외부 오류를 적용합니다. 폼 reset이 비운 명령형 외부 오류·검증 결과 뒤에 같은 호출 안에서 두 적용을 현재 트리에 다시 수행합니다. 재생성 뒤에도 옛 노드 객체를 키로 사용하지 않습니다. `FormHandle.getErrors()`는 루트에 적용한 전체 외부 오류 + 검증 목록을 읽습니다(WRITE-045, SURFACE-053, VALIDATE-043, 69C-03, 79C-01).
- reset은 호출 시점의 커밋된 속성으로 동기 로드합니다. `helpers/`의 스키마 비교는 같은 객체 또는 JSON 부분의 키 순서까지 깊은 같음과 JSON 밖 값의 참조 같음으로 판정합니다. 같은 스키마는 호출 안에서 `reloadFieldNodeForm`으로 트리·노드 identity를 유지하고, 다른 스키마는 호출 안에서 `buildFieldNodeTree` → `adoptFieldNodeTree` → `mountFieldNode`를 마쳐 옛 트리를 폐기하고 핸들을 새 루트로 바꿉니다(WRITE-042·043·046, 69C-02, 실행 ADR D7).
- 두 reset 경로 모두 dirty·touched·첨부 파일 맵을 비우고 `showError`를 속성 값으로 돌리며 진단을 새 로드로 확정합니다. 같은 처리기의 속성 갱신은 예약된 렌더의 커밋에서 재대조하여 실제로 달라졌으면 독립된 reset 진입으로 다시 로드하고, 언마운트된 폼의 재대조는 버립니다(WRITE-044·045).

- 각 Context 모듈은 Context 객체와 Provider를 역할 칸 components, 소비 훅을 hooks, 그 밖의 보조를 utils에 두고 진입점 index가 이름으로 내보냅니다(원장 결정 D3). 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### providers-contract — 관찰 가능한 동작

- 여러 폼의 설정과 워크스페이스 데이터가 Provider 경계를 넘어 섞이지 않습니다.
- Provider 정리 시 검증 루트 참조와 가상화 자원을 해제합니다. 루트 구독은 reset 교체 또는 GC까지 유지합니다.
- 준비 전 변경·진단 콜백이 발생하지 않고 커밋된 로드의 오류만 한 번 보고됩니다. 첫 로드 검증은 첫 commit에 한 번, reset 검증은 로드마다 공통 슬롯에 예약되어 숨김·unmount와 관계없이 실행되고, 검증 루트의 보유·해제는 준비 이펙트 수명을 따릅니다(ERROR-026, REACT-007, 69C-05).
- reset 호출이 돌아올 때 현재 루트의 로드·오류 재적용·핸들 교체가 끝나며, 같은 스키마의 트리 identity와 다른 스키마의 폐기 계약을 구별합니다(WRITE-042–046, 69C-02·03).

## Last Updated

2026-10-30. 계약 기준: ERROR-026, REACT-007, WRITE-042–046, 69C-02·03·05, 70C-01, 정돈-1(2026-10-14).
