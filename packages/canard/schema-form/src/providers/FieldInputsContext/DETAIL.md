# FieldInputsContext

## Requirements

입력 맵·정의의 정규화와 구성 실패 보관을 소유합니다. 입력 선택과 사용자 컴포넌트 실행은 [FieldInputBridge](../../components/FieldProxy/components/FieldInputBridge/DETAIL.md)에 맡겨 설정 오류와 렌더 오류를 섞지 않습니다.

## API Contracts

맵과 정의는 각 불변 참조를 독립적으로 정규화합니다. 잘못된 새 맵은 마지막 committed 유효 맵을 유지하고 구성 오류를 [RootNodeContext](../RootNodeContext/DETAIL.md)로 전달합니다. 렌더 중 onError를 호출하거나 오류 맵을 조용히 다른 입력으로 대체하지 않습니다. 최초 잘못된 맵에는 유효한 기존 설정이 없으므로 로드 대체 화면을 유지합니다.

## Acceptance Criteria

### form-type-inputs-context-contract — 구성 실패와 선택 수명을 구별합니다

정규화되지 않은 정의는 공급하지 않으며 맵 컴파일의 FormTypeInputMap·load와 입력 실행의 RenderFailed·render를 구별합니다. 일반 모드와 StrictMode에서 구성 실패는 커밋된 로드의 한 기록으로 보고합니다.

맵·정의 교체는 노드 값·상태·외부 오류를 보존하고 입력만 다시 선택합니다. 선택된 원본 입력과 조상 입력이 모두 같으면 DOM을 유지하지만 부모 입력이 바뀌면 내부 자식의 DOM·미커밋 draft도 다시 만듭니다. 참조 교체가 모든 draft 보존을 보장한다고 설명하지 않습니다. 실제 선택 우선순위와 입력 채널 수명은 FieldInputBridge가 소유합니다.

## Last Updated

정규화 실패의 보존·전달 또는 입력 설정 갱신 수명이 바뀌면 갱신합니다.
