# FormCore — 폼 뿌리 조립

## Purpose

Provider 고정 중첩과 `FormHandle`, 폼별 라이프사이클 예약 및 포커스 요청 수명을 조립하고, 인스턴스 보고기와 루트 오류 경계로 감싼 폼 본체를 부모 `Form`에 제공합니다.

Provider 조립과 현재 루트 핸들, 제출 및 Form 오류 공개 수명을 소유합니다.

## Conventions

- [DETAIL](DETAIL.md)의 제출 판정·실패·정책 수명을 유지합니다.
- 노드 로드는 RootNodeContext, 오류 기록 서비스는 FormErrorContext가 소유합니다. 같은 상태를 복제하지 않습니다.

## Boundaries

### Always do

- 보고기를 루트 오류 경계 바깥에 두어 fallback이 보고 수명을 끝내지 않게 합니다.
- Provider 의존 순서와 현재 schema·node 쌍을 유지하여 설정과 트리가 엇갈리지 않게 합니다.
- 비동기 판정의 UI 게시와 시작 snapshot Promise의 정착을 구별합니다.

- 라이프사이클 처리기·폼 보고기·호스트 보고기의 실패가 입력 렌더 트리로 번지지 않게 격리합니다.

### Ask first

- 제출 거부·공개·focus 조건, Provider 순서 또는 공개 핸들 형을 바꿀 때

### Never do

- 노드를 직접 생성하거나 형제 Form 조각을 조립하지 않습니다.
- 검증 판정을 실행 실패로 보고하거나 중단된 render를 committed 설정으로 사용하지 않습니다.
