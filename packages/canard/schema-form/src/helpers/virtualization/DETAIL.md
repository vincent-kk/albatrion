# virtualization

## Requirements

가상화는 완전한 노드 트리 위에서 React 하위 트리의 마운트 시점만 조율합니다. 첫 화면에 필요한 일을 줄이는 선택이므로 전체 노드 구성·검증 비용을 없애거나 전체 마운트 시간을 줄인다는 약속으로 사용하지 않습니다.

## API Contracts

- 선택적 활성화와 옵션 의미는 [resolveVirtualizationOptions](./resolveVirtualizationOptions/DETAIL.md), 노출 기록·렌더 경로 공개·입력 컨테이너·idle 예산·Placeholder 경계는 [VirtualizationManager](./VirtualizationManager/DETAIL.md)가 소유합니다.
- DOM 제약과 명령 재실행은 [DeferredFieldProxy](../../components/FieldProxy/components/DeferredFieldProxy/DETAIL.md)가 소유합니다. 입력이 아직 없다는 사실을 완전한 UI로 오인하지 않도록 연결합니다.
- SSR·하이드레이션의 게이트 준비와 실제 입력 커밋은 [FieldInputBridge](../../components/FieldProxy/components/FieldInputBridge/DETAIL.md)의 계약입니다. 이 조율자에 hydration 상태나 React 수명 판정을 복제하지 않습니다.

## Acceptance Criteria

### virtualization-contract — 마운트 시점과 값의 의미를 분리합니다

미노출 필드도 노드 트리에 존재하므로 렌더를 미룬 이유로 값·검증·제출 대상을 줄이지 않습니다. UI 비용을 줄이려다 폼의 의미가 화면 위치에 종속되는 실패를 막습니다.

### IR-mount-cost — 첫 화면과 전체 노출의 비용을 구별합니다

placeholder와 관찰·등록·backfill도 작업을 추가합니다. 첫 화면을 빨리 보여도 전체 노출은 더 오래 걸릴 수 있고, 전량 노드 구성과 eager 마운트의 첫 프레임은 idle 분할로 제한되지 않습니다. 모든 폼에서 프레임 시간이나 전체 처리량이 개선된다고 일반화하지 않습니다.

### IR-branch-policy — 작업당 가변 예산으로 가지별 계약을 대체하지 않습니다

가지별 threshold·eagerCount의 의미를 유지합니다. 렌더 스냅숏 밖의 가변 작업 계수로 게이트를 정하면 폐기·재시도에서 같은 노드의 결정이 갈리고, 컨테이너 지연은 아직 구독하지 않은 하위 필드의 명령을 잃을 수 있습니다. 전역 개수 예산이나 시간 제한 reveal은 현재의 보장에 포함하지 않습니다.

## Last Updated

마운트 지연의 범위, 비용 판단, 가지별 선택 정책 또는 소비층과의 책임 경계가 바뀌면 갱신합니다.
