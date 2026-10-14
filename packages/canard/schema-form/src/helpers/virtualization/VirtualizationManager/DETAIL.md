# VirtualizationManager

## Requirements

폼 단위로 관찰, 대기열, 노출 기록을 관리하고 중복 노출을 방지합니다.
`__tests__/VirtualizationManager.test.ts`는 이 소유 구획 안에서 내부 조율을 검증하며, Vitest render·react18 프로젝트가 DOM 환경에서 실행합니다.

## API Contracts

- 이 fractal은 진단 문자열 포맷터 `formatVirtualizationDisabledWarning`을 `utils/`에 소유하며, 상자 원소는 `helpers/error` 진입점에서 가져옵니다.
- 옵션과 backfill 값의 계약은 resolveVirtualizationOptions 진입점에서 소비합니다. 부모의 집계 진입점이나 호환 타입 파일은 거꾸로 참조하지 않습니다.
- create는 비활성이거나 관찰 API가 없으면 null을 반환합니다. forBranch와 forChild는 설정에 맞는 대상일 때만 매니저를 반환합니다.
- 노출이 일어나면 등록을 삭제하고 unobserve한 뒤 콜백을 실행합니다. idle backfill은 지정된 모드에서만 시작합니다.
- Placeholder 경계는 폼마다 한 번 감싸고, 전용 보고 훅으로 DeferredFieldProxy가 제공하는 경로 문맥을 읽습니다. 경로 문맥은 이 Placeholder 용도로만 유지하며, 일반 필드는 path를 명시적으로 전달합니다(ERROR-090·114, 121C-01 F-A). Placeholder의 fiber와 보고 비용은 바뀌지 않습니다.

- 유휴 예약 보조 `scheduleIdle`은 `utils/`에 있습니다. 뿌리에는 문서, 진입점, 형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### virtualization-manager-contract — 관찰 가능한 동작

- register·unregister·disconnect를 반복해도 등록과 자원이 중복되지 않으며, disconnect 후에 다시 등록할 수 있습니다.
- 노출 기록은 단방향으로 유지되고, idle 구간 하나에서 처리하는 양과 시간 예산을 제한합니다.

## Last Updated

2026-10-14 — 정돈-1; ERROR-090·114, 121C-01 F-A; 정돈-2(2026-10-14).
