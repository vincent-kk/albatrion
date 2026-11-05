# Application cache contract

## Requirements

소비자 객체를 키로 하는 청사진 재사용은 바인딩이 소유하고, 저장소는 core 생성 인자로 주입합니다. core가 전역 앱 상태를 읽으면 같은 엔진 입력의 의미가 등록소의 수명에 종속되므로 이 의존 방향을 뒤집지 않습니다.

## API Contracts

도메인의 값과 항목 외피는 개발 모드에서 얕게 동결하며 작성 키는 동결하지 않습니다. 청사진 변형 목록은 교체하여 갱신합니다. 이 불변성은 목록의 소속에 대한 계약이며, 경고 수집처럼 항목 내부에서 지연 준비하는 메타데이터까지 깊은 불변이라는 뜻은 아닙니다.

전체 초기화와 도메인 생성기는 바인딩·시험의 내부 계약입니다. 공개 재구성 통로와 로드의 선택은 [RootNodeContext](../../providers/RootNodeContext/DETAIL.md)가 소유합니다.

## Acceptance Criteria

### SURFACE-063 — 무효화는 이미 사용 중인 값을 변경하지 않습니다

같은 키의 resolve는 무효화 전까지 같은 항목과 생성 세대를 반환합니다. invalidate는 한 키를 제거하고 clear는 저장소를 교체하며 이후 resolve만 새 항목을 만듭니다. 이미 반환한 값은 그대로 남겨 다른 폼의 갱신 때문에 살아 있는 트리가 바뀌지 않게 합니다.

### domain-identity — 약한 키와 생성 세대를 구별합니다

키의 가비지 수거와 명시적 clear는 별개이며 clear만 생성 세대를 올립니다. 등록소는 도메인을 보유하고 소비자 키를 열거·보유하지 않아, 전역 관리 편의를 위해 스키마 수명을 늘리지 않습니다.

### BLUEPRINT-052 — 구조 비교 없이 같은 작성 객체를 재사용합니다

작성 스키마와 isTerminal·isAtomic 술어의 참조가 모두 같을 때만 청사진을 공유합니다. 직렬화 키는 계산 비용을 더하고 렌더러 함수의 정체성을 잃으므로 쓰지 않습니다. 구조가 같은 별도 객체의 통합이나 캐시 적중만으로 노드 생성 비용까지 사라진다는 보장은 하지 않습니다.

### blueprint-consumers — 공유 때문에 소비자의 진단을 생략하지 않습니다

재사용하는 청사진도 별도 경고 수집자에게 진단을 전달해야 둘째 폼의 작성 오류가 숨지 않습니다. 수집자별 재생과 약한 수신자 보유의 실행 계약은 [blueprint](../../core/engine/blueprint/DETAIL.md)가 소유합니다.

### form-rebuild — 무효화와 트리 교체는 별개의 책임입니다

캐시가 무효화되어도 살아 있는 루트는 기존 청사진을 계속 참조합니다. reset의 스키마·검증기 비교와 rebuild의 강제 교체 조건은 [RootNodeContext](../../providers/RootNodeContext/DETAIL.md)에 두어, 다른 폼의 rebuild가 이 폼의 reset 의미를 바꾸지 않게 합니다.

### cache-ownership — 다른 수명의 상태를 도메인에 합치지 않습니다

검증 자원은 참조 계수·해제 대기·실패 메모를 갱신하므로 값 불변·resolve 멱등 도메인에 맞지 않으며 [validation](../../core/engine/validation/DETAIL.md)이 소유합니다. 플러그인 구성은 재계산할 메모가 아니므로 [plugin](../plugin/DETAIL.md)에 남깁니다.

엔진 파생·값 메모·모드의 배치는 [engine](../../core/engine/DETAIL.md), 트리 수명 메모의 보유·초기화는 [record](../../core/engine/record/DETAIL.md)가 소유합니다. 이 도메인의 clear를 서로 다른 수명의 전역 초기화로 확대하지 않습니다.

## Last Updated

객체 키의 재사용 조건, 도메인의 불변성·세대·무효화 또는 캐시 소유 경계가 바뀔 때 갱신합니다.
