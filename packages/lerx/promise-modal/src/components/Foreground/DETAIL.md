# Foreground

## Requirements

전경 프레임은 모달 타입과 사용자 설정에 맞는 콘텐츠를 조합합니다.

## API Contracts

- 모달이 없으면 null을 반환하고 사용자 컴포넌트를 우선하여 기본 UI로 폴백합니다.
- 상태 변경은 제공된 모달 동작 인터페이스를 통해 요청하며 프레임이 노드 내부 상태를 직접 쓰지 않습니다.

## Acceptance Criteria

### foreground-contract — 관찰 가능한 동작

- alert·confirm·prompt는 각 타입에 맞는 입력과 완료 동작을 표시합니다.
- 커스텀 UI가 없을 때도 fallback을 사용하여 콘텐츠를 렌더할 수 있습니다.

## Last Updated

2026-09-16
