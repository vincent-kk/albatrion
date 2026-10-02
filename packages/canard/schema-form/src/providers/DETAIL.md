# providers

## Requirements

폼 설정을 역할별 Context로 전달하고 Provider 간 의존 순서를 유지합니다.

## API Contracts

- 폼 수준 설정은 선택적 외부 설정보다 우선합니다.
- 노드 생성·입력 제어·렌더링·가상화의 각 소비자는 해당 Context 계약으로 값을 얻습니다.
- `RootNodeContext`의 트리는 렌더 중 `useMemo`에서 `nodeFromJSONSchema`로 작성·마운트합니다. 작성 루트 identity를 유지하며 선택 검증기, 맥락, 폼 쓰기 정책, 터미널·원자 판정 함수와 버퍼형 보고기를 전달하고 `deferMountValidation`을 켭니다. `<Form>`의 첫 마운트와 재생성 reset은 같은 core 생성 통로를 사용합니다(REACT-003·007, VALIDATE-044, 70C-01).
- 준비 이펙트는 layout effect이며 커밋된 로드의 준비 깃발을 켜고 버퍼 기록을 `onError`로 한 번 전달한 뒤 마운트 검증을 요청합니다. 로드 뒤 `OnChange` 비트가 켜져 있으면 한 번 요청하며, 검증 루트는 `retainValidationRoot`로 보유하고 cleanup에서 `releaseValidationRoot`로 해제합니다. 버려진 렌더의 기록은 전달하지 않고, StrictMode의 이펙트 정리가 로드의 전달 완료 표지를 되돌리지 않습니다(ERROR-026, REACT-007, LANDING-041, 69C-05).
- 준비 전 `onChange`·`onDiagnosticsChange`는 버립니다. 준비 뒤 `onStateChange`는 `root.globalState`를 읽고, `onValidate`는 루트 `UpdateGlobalError`, `onDiagnosticsChange`는 루트 `UpdateDiagnostics`를 따라 전달합니다(EVENT-062, REACT-007, LANDING-075).
- `errors` 속성은 전체 목록을 루트에 적용하고 경로 키로 각 비루트 노드에도 외부 오류를 적용합니다. 폼 reset이 비운 명령형 외부 오류·검증 결과 뒤에 같은 호출 안에서 두 적용을 현재 트리에 다시 수행합니다. 재생성 뒤에도 옛 노드 객체를 키로 사용하지 않습니다. `FormHandle.getErrors()`는 루트에 적용한 전체 외부 오류 + 검증 목록을 읽습니다(WRITE-045, SURFACE-053, VALIDATE-043, 69C-03, 79C-01).
- reset은 호출 시점의 커밋된 속성으로 동기 로드합니다. `helpers/`의 스키마 비교는 같은 객체 또는 JSON 부분의 키 순서까지 깊은 같음과 JSON 밖 값의 참조 같음으로 판정합니다. 같은 스키마는 호출 안에서 `reloadSchemaNodeForm`으로 트리·노드 identity를 유지하고, 다른 스키마는 호출 안에서 `buildSchemaNodeTree` → `adoptSchemaNodeTree` → `mountSchemaNode`를 마쳐 옛 트리를 폐기하고 핸들을 새 루트로 바꿉니다(WRITE-042·043·046, 69C-02, 실행 ADR D7).
- 두 reset 경로 모두 dirty·touched·첨부 파일 맵을 비우고 `showError`를 속성 값으로 돌리며 진단을 새 로드로 확정합니다. 같은 처리기의 속성 갱신은 예약된 렌더의 커밋에서 재대조하여 실제로 달라졌으면 독립된 reset 진입으로 다시 로드하고, 언마운트된 폼의 재대조는 버립니다(WRITE-044·045).

## Acceptance Criteria

### providers-contract — 관찰 가능한 동작

- 여러 폼의 설정과 워크스페이스 데이터가 Provider 경계를 넘어 섞이지 않습니다.
- Provider 정리 시 각 계층이 만든 구독과 가상화 자원을 해제합니다.
- 준비 전 변경·진단 콜백이 발생하지 않고 커밋된 로드의 오류만 한 번 보고됩니다. 마운트 검증과 검증 루트의 보유·해제는 준비 이펙트 수명을 따릅니다(ERROR-026, REACT-007, 69C-05).
- reset 호출이 돌아올 때 현재 루트의 로드·오류 재적용·핸들 교체가 끝나며, 같은 스키마의 트리 identity와 다른 스키마의 폐기 계약을 구별합니다(WRITE-042–046, 69C-02·03).

## Last Updated

계약 기준: ERROR-026, REACT-007, WRITE-042–046, 69C-02·03·05, 70C-01.
