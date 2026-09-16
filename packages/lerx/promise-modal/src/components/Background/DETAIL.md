# Background

## Requirements

배경 프레임은 모달 콘텐츠와 분리하여 backdrop 표시와 클릭 동작을 처리합니다.

## API Contracts

- 모달이 없으면 null을 반환하며 사용자 배경 설정과 기본 배경을 선택합니다.
- 배경 클릭은 현재 모달이 visible이고 closeOnBackdropClick이 켜져 있을 때만 닫기로 연결합니다.

## Acceptance Criteria

### background-contract — 관찰 가능한 동작

- 배경 닫기 옵션이 꺼져 있으면 클릭해도 모달을 닫지 않습니다.
- 배경 프레임은 모달 콘텐츠를 대신 렌더하거나 직접 모달 상태를 변경하지 않습니다.

## Last Updated

2026-09-16
