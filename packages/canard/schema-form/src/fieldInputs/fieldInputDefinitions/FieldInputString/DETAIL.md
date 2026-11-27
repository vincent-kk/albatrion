# FieldInputString 계약

## Requirements

기본 문자열 입력의 표시는 브라우저 DOM에 맡깁니다. union의 형 해석까지 일반 문자열 입력에 넣으면 모든 문자열 입력이 불필요한 초안 상태를 갖게 됩니다.

## API Contracts

- 빈 값과 진단의 공통 정책은 [상위 계약](../../DETAIL.md)에 둡니다.
- 비제어 입력을 기본으로 두며, 형제 union 입력에는 진입점으로 같은 컴포넌트를 제공합니다. union은 `inputProps`로 제어 값과 이벤트를 대체하므로, 공통 문자열 입력에 union 전용 상태를 더하지 않습니다.
- Refresh와 조합 중 DOM 수명은 [FieldInputBridge 계약](../../../components/FieldProxy/components/FieldInputBridge/DETAIL.md)에 둡니다. 이 입력의 이벤트 처리만으로 조합 중 미전송을 보장하지 않습니다.

## Acceptance Criteria

### REACT-027 — 표시를 수리하려고 노드에 쓰지 않습니다

- 받은 기본값을 표시하는 일이 형 변환이나 빈 값의 자동 저장을 일으키지 않습니다. 표현과 노드 값의 소유권을 섞지 않아야 외부 쓰기를 사용자의 수정으로 처리하지 않습니다.

### string-drafts — 특수 초안은 호출자가 소유합니다

- 일반 변경 처리기는 DOM 문자열을 전달하며 별도의 조합 판정 상태를 두지 않습니다. union의 조합 차단·흐림 복귀는 [union 계약](../FieldInputUnion/DETAIL.md)에 따라 호출자가 제공합니다.

## Last Updated

비제어 표시와 이벤트 대체의 경계 또는 일반 문자열과 union의 초안 책임이 바뀔 때 갱신합니다.
