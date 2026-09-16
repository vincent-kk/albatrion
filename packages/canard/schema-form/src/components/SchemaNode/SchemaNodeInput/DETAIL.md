# SchemaNodeInput

## Requirements

선택된 입력 컴포넌트를 노드의 값·상태·명령 체계에 연결합니다.

## API Contracts

- 입력 선택은 인라인 지정, 입력 맵, 내부 정의, 외부 정의, 플러그인 fallback의 우선순위를 유지합니다.
- 사용자 변경은 외부 오류를 지우고 Dirty 상태를 설정한 뒤 전달합니다. 읽기 전용 또는 disabled 상태에서는 변경을 차단합니다.

## Acceptance Criteria

### schema-node-input-contract — 관찰 가능한 동작

- 언마운트하면 해당 경로의 첨부 파일 상태를 제거합니다.
- refresh는 입력 버전을 갱신하고 focus/select는 해당 입력의 DOM 명령으로 연결됩니다.

## Last Updated

2026-09-16
