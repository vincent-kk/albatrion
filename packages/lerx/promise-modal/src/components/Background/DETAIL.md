# Background

## Requirements

배경 프레임은 모달 콘텐츠와 분리하여 backdrop 표시와 클릭 동작을 처리합니다.

## API Contracts

- 보이는 모달은 closeOnBackdropClick 또는 dimmed가 true이면 포인터를 차단합니다. 클릭 취소는 closeOnBackdropClick이 true일 때만 수행하므로 어두운 비취소 모달 뒤의 페이지가 클릭되지 않습니다.

- 사용자 배경 프레임에 group·subtype·settled를 전달하여 같은 모달 메타데이터를 읽게 합니다.
- 모달이 없으면 null을 반환하며 사용자 배경 설정과 기본 배경을 선택합니다.
- 배경 클릭은 현재 모달이 visible이고 closeOnBackdropClick이 켜져 있을 때만 닫기로 연결합니다.

## Acceptance Criteria

### background-contract — 관찰 가능한 동작

- 배경 닫기 옵션이 꺼져 있으면 클릭해도 모달을 닫지 않습니다.
- 배경 프레임은 모달 콘텐츠를 대신 렌더하거나 직접 모달 상태를 변경하지 않습니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
