# RootNodeContext

## Requirements

루트 트리를 생성하고 검증·상태·변경 콜백과 외부 오류를 연결합니다.

## API Contracts

- 스키마와 기본값 의존성에 맞춰 루트 생성 결과를 재사용하거나 재생성합니다.
- 살아 있는 노드 판정은 호출 시점의 binding 루트를 읽고 첫 commit에서 아직 binding이 준비되지 않았으면 Context 루트를 사용하여 자식 layout effect의 초기 입력 쓰기를 허용합니다. 재생성 reset 후에는 새 binding 루트로 옛 노드의 늦은 쓰기를 차단합니다(WRITE-046).
- `reset(option?)`의 자동 쓰기 억제 비트를 같은 트리의 reload와 재생성 트리의 mount에 전달합니다. 호출 옵션은 호출 직후 로드와 validator·props 커밋 재대조에서 Form 기본값보다 우선하며, 재대조 reset도 원래 호출 옵션을 유지하고 다른 비트는 무시합니다(WRITE-015·044, LANDING-039).
- 구독 설정 후 onReady를 호출하고, 외부 오류는 전체 목록을 루트에 적용한 뒤 경로별 비루트 노드에도 전달합니다. 같은 스키마와 재생성 reset은 현재 트리에 두 적용을 동기로 다시 수행하므로 `getErrors()`는 루트 외부 오류 + 검증 목록을 읽습니다(WRITE-045, SURFACE-053, VALIDATE-043, 69C-03, 79C-01).
- 외부 오류의 dataPath는 현재·이전 목록에서 각각 한 번만 읽어 경로별로 묶고 원래 순서로 적용합니다. 이전 목록에만 남은 경로는 빈 오류로 지우며 누락 노드는 건너뜁니다(79C-01).

## Acceptance Criteria

### root-node-context-contract — 관찰 가능한 동작

- Provider 정리 시 등록한 이벤트 구독을 해제합니다.
- 검증과 상태 이벤트는 대응 콜백으로 전달되며 변환하지 않은 외부 오류를 바로 주입하지 않습니다.

## Last Updated

2026-10-03
