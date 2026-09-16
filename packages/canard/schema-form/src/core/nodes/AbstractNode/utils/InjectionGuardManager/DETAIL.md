# InjectionGuardManager

## Requirements

한 주입 구간에서 같은 노드 경로를 다시 주입하지 않도록 루트 단위로 기록합니다.

## API Contracts

- 주입 전 has로 확인하고 시작한 경로는 add로 기록합니다. 자식은 루트의 동일한 매니저를 사용합니다.
- 경로 해제는 macrotask로 예약하며 이미 예약되었다면 중복 예약하지 않습니다.

## Acceptance Criteria

### injection-guard-manager-contract — 관찰 가능한 동작

- 해제 전 같은 경로를 다시 확인하면 이미 주입한 것으로 판정합니다.
- 예약된 해제 이후에는 다음 주입 구간에서 그 경로를 다시 사용할 수 있습니다.

## Last Updated

2026-09-16
