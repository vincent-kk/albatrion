# objectBehavior 계약

## Requirements

- D3b-1의 안정 형상은 root runtime의 지연 WeakMap이며 폼 전체 reset·폐기에서 해제하고 부분 reset에서는 유지한다. 결과 객체의 키 개수는 노드가 아닌 값 identity를 키로 하는 공통 named memo이다. 조립의 증명 조건·키 순서·값과 참조 안정성은 보존한다(SURFACE-065).

- 최초 합성이 다음 조건을 모두 만족하면 classic loop 한 번으로 값 객체, names, stable shape, 키 수를 만들어 낸다. 조건은 local과 undeclaredValues가 없고, propertyOrder가 비었고, entries와 children의 길이·순서·이름이 같은 경우다. 조건이 맞지 않으면 기존 순서 합성으로 처리하며, undefined 방출과 예약 키의 의미, 같은 값의 참조 재사용은 그대로 보존한다. 속도 면에서는 자식 수에 비례하는 직접 검사와 쓰기만 하고, 적격 호출에서 Map/Set 구축과 중복 조회를 없앤다. 메모리 면에서는 기존 결과, names, stable shape를 유지하면서 일시 Map/Set 두 객체와 그 원소 저장을 없앤다. 불일치가 드러나기 전에 만들어 둔 일시 결과와 names는 보유하지 않는다(batch2 3-object-assembly).

- 의존 방향은 `blueprint·record·behaviors 공유 보조 < objectBehavior < behaviors 뿌리 < FieldNode`이다. `branch/`와 `terminal/`은 내부 organ이다. 둘 다 이 종류 안에서만 소비하므로 경계 예외가 없다(NODE-009·016).
- 두 전략은 청사진이 정하는 고정 선택이다. 이 행에서는 렌더 입력을 검사하지 않는다(NODE-028·042).

- 활성 이름 수가 전체 childEntries 수의1/8 이하이고 기존 childOrderIndex가 준비되어 활성 이름을 모두 포함하면 각 이름의 첫 template 위치로 활성 이름만 정렬하여 선언 전순서를 얻습니다. 실제 활성 template의 위치를 쓰지 않으므로 동명 이종 분기에도 첫 이름 순서를 유지합니다. 증인이 없거나 누락되면 기존 전체 선언 순회로 후퇴하고 preferred·extras·정수 이름·undefined·NaN·참조 안정성을 유지합니다. 적격 호출의 전체 선언 순회 O(선언 수)를 활성 이름 O(활성 수 log 활성 수)로 바꾸며 임시 순위 배열만 만듭니다. 밀집 활성 호스트는 순위 조회·배열·정렬 없이 기존 선언 순회를 사용하며, 파생 레코드의 읽기 전용 조회는 빈 레코드를 만들지 않습니다. 추가 상주 구조는0입니다.

## API Contracts

- 형상, 스키마, extras가 모두 같은 객체의 값을 갱신할 때는 재계산된 직계 자식만 검사한다. 키 집합이 같으면 얕은 사본 한 번으로 패치한다. 사본을 만드는 시간을 뺀 나머지는 O(재계산 자식 수)이고, 사본 시간과 메모리는 O(객체 키 수)이며, 같은 값이면 기존 참조를 반환한다. 합성 결과의 키 수를 약한 캐시에 두기 때문에 빈 객체 투영 여부는 O(1)로 판정한다. 키가 생기거나 사라지면 기존의 전순서 재구성을 사용한다(SETTLE-042, 63C-03, 65C-04, 82C-01).

- 진입점은 `objectBehavior: { branch: Behavior; terminal: Behavior }`를 이름으로 내보낸다. 두 행은 공통 여덟 칸 순서(`arrange`는 공유 거부 칸, 36C-01)를 따르고, `type: 'object'`로 같으며 전략만 각각 `'branch'`와 `'terminal'`로 다르다. 행 파일에는 전략별 행 객체만 정의하고, 길어진 칸과 전략별 보조는 해당 organ에 둔다.
- branch의 `interpret`는 평범한 객체 값을 자식과 `undeclaredValues`로 나눠 줄 입력으로 취급하며 호스트 `raw`에는 저장하지 않는다. 종류가 잘못된 `null`이나 수 같은 값은 호스트 `raw`에 그대로 보존한다. `declareChildren`은 청사진이 선언한 자식 목록(정적 선언과 게이트 선언 모두)을 돌려줄 뿐 자식을 생성하지 않는다. 게이트로 활성 자식을 거르는 일은 `settle`의 호스트 바퀴가 맡는다(NODE-006, LANDING-062). `assemble`은 활성 자식의 `emit`과 선언 밖 `undeclaredValues`를 합쳐 `local`을 만들고, 자식이 없으면 `{}`를 만든다(VALUE-002·034, NODE-043).
- branch의 키 순서는 유효 스키마의 `options.propertyOrder`, 각 이름의 첫 선언 전순서, `undeclaredValues` 삽입 순서 차례로 정해진다. 키 집합이 같으면 `Object.is`로 비교해 바뀐 자식만 얕게 패치하고, 집합이 바뀌면 해당 호스트의 키 수만큼 새 객체를 만든다. 이전 `local`·활성 자식·선언 항목·`propertyOrder`가 없는 extras 전용 최초 합성은 중간 이름 집합 없이 `undeclaredValues`의 own-key 순서로 결과에 직접 쓰며 동일한 stable-shape 기록을 남긴다. `NaN`을 포함해 값이 같은 자식은 부모의 `local`과 `emit` 참조를 유지한다(SETTLE-043). `project`는 순서를 보존하고, 빈 `local`에는 `omitEmpty`에 따른 방출 생략을 적용한다. `raw`가 객체가 아니면 그 `raw`를 받은 그대로 방출하되 자식의 방출만 뺀다. 그 아래의 자식은 편집 상태로 계산한다(SETTLE-042, VALUE-033·034·036, WRITE-013·096, 39C-01).
- terminal에는 자식 선언이 없고, `interpret`·`assemble`·`project`가 통째로 받은 객체 참조를 유지한다. 내부 키는 정규화하지 않는다. `Merge`가 객체 호스트에 대한 부분 쓰기인지 통째 값 쓰기인지는 정착의 쓰기 종류가 판정한다(NODE-005·006, VALUE-037, WRITE-079).
- `utils/` organ은 두 전략이 함께 쓰는 `omitEmptyObject`와 객체 값 동등성 보조를 소유한다. `omitEmptyObject`는 입력을 바꾸지 않는 투영 계산이며 다른 종류에 재수출하지 않는다(NODE-009, LANDING-082).
- 객체 합성의 안전한 키 쓰기는 정착의 선언 밖 값 복사와 공유하므로 최저 공통 소유자인 engine의 utils 구획에서 가져온다. `__proto__`의 own property 보호와 그 밖의 키의 일반 대입은 같은 보조가 맡는다.

## Acceptance Criteria

### object-branch — 형상과 키 순서

- 현재 형상의 자식만 합성하고, 빈 host의 `local`은 `{}`이며, 선언 키와 `undeclaredValues` 키의 결정적 순서가 유지된다(VALUE-034, SETTLE-042).

### object-active-order — 기존 이름 순서 증인

- 활성 이름이 선언의1/8 이하이고 완전한 기존 색인이 있으면 dormant 선언을 방문하지 않습니다. 밀집 활성 호스트는 순위를 조회하지 않으며 색인이 없는 호스트의 합성은 빈 파생 레코드를 만들지 않습니다. 첫 이름 전순서와 preferred·extras·예약 이름·정수 키·undefined·NaN·같은 값 참조를 유지하며 색인 부재·이름 누락 때에는 기존 전체 순회를 수행합니다.

### object-terminal — 통째 참조

- terminal은 자식이 없고, 내부를 정규화하거나 복사하지 않으며, 방출이 원본 참조를 유지한다(NODE-005, VALUE-037).

## Last Updated

2026-10-30
