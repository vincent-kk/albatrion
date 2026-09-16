# VirtualizationManager

## Requirements

폼 단위로 관찰·대기열·노출 기록을 관리하고 중복 노출을 방지합니다.

## API Contracts

- 옵션과 backfill 값의 계약은 resolveVirtualizationOptions 진입점에서 소비하며 부모의 집계 진입점이나 호환 타입 파일을 역참조하지 않습니다.
- create는 비활성 또는 관찰 API 부재 시 null입니다. forBranch와 forChild는 설정에 맞는 대상일 때만 매니저를 반환합니다.
- 노출은 등록 삭제와 unobserve 후 콜백 실행으로 이어집니다. idle backfill은 지정된 모드에서만 시작합니다.

## Acceptance Criteria

### virtualization-manager-contract — 관찰 가능한 동작

- register·unregister·disconnect를 반복해도 등록과 자원이 중복되지 않으며 disconnect 후 다시 등록할 수 있습니다.
- 노출 기록은 단방향으로 유지되고 idle 한 구간의 처리량과 시간 예산을 제한합니다.

## Last Updated

2026-09-16
