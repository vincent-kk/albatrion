# FieldInputBridge

## Purpose

FieldProxy 안에서 입력 컴포넌트의 선택·DOM 수명을 노드 값·상태·명령에 연결합니다. 입력 초안과 자식 프록시 수명을 구분하여 값 갱신이 캐럿과 자식을 불필요하게 지우지 않게 합니다.

## Conventions

- createFieldInputBridge는 노드를 붙잡은 컴포넌트를 반환하는 팩토리이며 React 컴포넌트 자체가 아닙니다.
- 입력 오류 경계는 해석 지점의 안정된 어댑터를 재사용합니다.

- `useFieldInputControl`은 적용 Refresh 세대와 입력 추적을, `useFieldLifecycle`은 유일한 입력 layout effect와 명령·예약 행동을 소유합니다. effect를 더하면 일반 입력 쓰기의 고정 비용이 깨집니다.

## Boundaries

### Always do

- 입력 틀만 담은 Context를 읽고 오류 정보는 요청한 입력의 useFieldErrors가 소유하게 합니다. 틀 내부 구조를 포함한 컨테이너 교체는 입력 수명을 새로 시작하되 브리지의 첨부 기록은 유지합니다.

- 사용자 값 쓰기에 Form·노드 잠금을 적용하고 입력 출처 통로로 전달합니다.
- 값·파일 callback은 현재 노드·선택·적용 세대를 검사하여 교체된 입력이 새 폼을 바꾸지 못하게 합니다. 제어를 선언한 입력은 Refresh로 교체되지 않으므로 적용 세대 검사 대상이 아닙니다.
- Refresh는 조합과 실제 자식 소유권을 존중하며, 숨김 재연결에서 현재 스냅숏을 확인합니다.
- unmount에서 입력의 첨부 파일과 미룬 touched 예약을 정리합니다.

- 비활성 중 실제 입력 commit도 단방향 노출 기록에 남기고, 옵션만 바뀌어 ChildComponent identity를 교체하지 않습니다.

### Ask first

- 입력 선택 우선순위·추적 마스크·입력 쓰기 옵션 또는 Refresh 범위를 바꾸는 경우.
- 자식 캐시·하이드레이션 수명을 바꾸는 경우.

### Never do

- 하이브리드 부모의 `<Child onChange>` 중계와 렌더러의 `<Input onChange>` 중계를 무시하지 않으며, 일반 공개 쓰기로 입력 출처를 우회하지 않습니다.
- Refresh만으로 입력 오류 경계를 다시 마운트하지 않습니다.
- 자식을 보존하려고 terminal 전략을 권하지 않습니다.
