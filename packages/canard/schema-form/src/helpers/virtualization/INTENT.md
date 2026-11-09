# virtualization

## Purpose

완전한 노드 트리를 유지하면서 React 하위 트리의 마운트만 미루는 경계입니다. 첫 화면의 작업을 나누되 입력 상태·검증·제출의 의미를 바꾸지 않습니다. 전체 노출 비용과 채택 조건은 [DETAIL](./DETAIL.md)이 소유합니다.

## Conventions

- React 런타임 의존은 사용자 Placeholder의 오류 경계와 전용 보고 훅에 한정합니다. 일반 필드 렌더링을 끌어들이면 helpers와 소비층의 의존 방향이 뒤집힙니다.
- 옵션 의미는 [옵션 해석](./resolveVirtualizationOptions/DETAIL.md), 자원·입력 컨테이너·렌더 경로의 노출 기록은 [매니저](./VirtualizationManager/DETAIL.md)가 소유하며 집계 진입점에 복제하지 않습니다.

## Boundaries

### Always do

- 브라우저 API가 없어도 전체 렌더링 경로로 돌아갈 수 있게 합니다. 서버나 미지원 환경을 가상화 때문에 사용할 수 없게 만들지 않습니다.
- 노출을 되돌려 포커스·선택을 잃지 않도록 매니저의 노드 identity 기록과 소비층의 실제 마운트 수명을 구별합니다.

### Ask first

- 기본 활성화 여부나 가지별 선택을 작업 전체의 예산으로 바꾸는 경우. 접근성·전체 노출 비용·재시도 결정성에 영향을 줍니다.
- 옵션 의미나 idle 분할 정책을 바꾸는 경우

### Never do

- Placeholder 방어와 전용 보고 훅 이외의 React·providers·components 런타임을 가져오지 않습니다.
- reveal 취소나 역방향 전환 로직을 추가하지 않는다.
- 노드 값이나 상태를 변경하지 않는다(이 모듈은 렌더 타이밍만 다룬다).
