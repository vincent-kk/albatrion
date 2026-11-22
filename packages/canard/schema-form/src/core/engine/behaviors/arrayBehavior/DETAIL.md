# arrayBehavior 계약

## Requirements

배열의 위치는 데이터 주소입니다. branch는 값의 길이와 자리별 청사진으로 계산하고, terminal은 통째 배열을 유지합니다. 방출에서 빈자리를 제거해 뒤 원소를 당기거나 구조 계획에서 상태까지 확정하면 위치와 편집 수명이 어긋납니다.

## API Contracts

공통 행 경계는 [behaviors 계약](../DETAIL.md)을 따릅니다. arrange는 순수 계획을 돌려주며, 아이템 생성·이동·수명·스냅숏과 계획 적용 비용은 [arrangeFieldNodeItems 계약](../../settle/arrangeFieldNodeItems/DETAIL.md)이 소유합니다. 빈 루트의 공개 출력과 저장·로드 왕복의 비교 정책은 [settle 계약](../../settle/DETAIL.md)에 둡니다.

## Acceptance Criteria

### NODE-021 — 자리의 개수는 값에서 옵니다

branch의 비배열 원본에는 아이템이 없습니다. 객체 branch의 선언 기반 자식을 이 경우에도 남기는 규칙으로 일반화하지 않습니다. 비배열 원본은 그대로 방출해 null·수·객체가 빈 배열로 교정되지 않게 합니다. null 원본은 저장 값도 null로 합성합니다. 노드 value와 FieldInput의 value가 방출과 같은 null을 읽어야 "없음"과 "빈 목록"이 terminal 전략과 같은 방식으로 구별되기 때문입니다.

### array-branch — 선언 밖 자리도 보존합니다

자리별 선언 후보는 청사진 순서로 제공하고, 합성은 현재 살아 있는 아이템의 종류를 우선하며 부재 자리만 첫 후보를 따릅니다. 후보 수와 관계없이 한 위치의 런타임 아이템은 하나입니다. 청사진 없는 자리도 extras로 보존하여 items 제약 위반을 데이터 삭제나 구조 연산 거부로 바꾸지 않습니다.

### VALUE-034 — 방출 없는 아이템도 자리를 차지합니다

선언된 아이템의 방출이 없으면 객체 종류는 {}, 배열 종류는 [], 잎 종류는 null로 채웁니다. union은 객체를 담아도 잎이므로 생략된 union 아이템의 자리는 null입니다. 이것은 방출용 채움이며 원본이나 로드 스냅숏에 저장할 데이터가 아닙니다. 앞·가운데의 빈자리를 압축하면 JSON 배열의 색인이 바뀝니다.

잎 자리를 undefined가 아니라 null로 채우는 것은 폼이 보는 값을 전송값과 같게 하기 위해서입니다. JSON에는 undefined가 없어 JSON.stringify가 배열 안의 undefined를 null로 바꾸므로, undefined로 채우면 getValue·onChange·루트 검증이 보는 값과 실제 전송값이 달라집니다. null을 허용하지 않는 아이템 스키마는 undefined와 null을 똑같이 거부하므로(Ajv 8.17.1에서 둘 다 `must be string`) undefined로 채워도 검증 오류를 피하지 못합니다.

### array-projection — 꼬리 생략은 두 전략에서 같은 빈 값 판정을 씁니다

omitTrailingEmpty는 배열 값의 끝에서부터 null·undefined·''·빈 배열·자기 키 없는 평범한 객체(isEmptyPlainObject)가 이어지는 최대 꼬리를 자릅니다. branch는 합성된 배열에, terminal은 원본 배열에 같은 판정을 적용하며 아이템 스키마·nullable 여부를 보지 않고 실제 방출과 채움을 구별하지 않습니다. branch의 빈자리 채움({}·[]·null)도 모두 빈 값이므로 방출 없는 자리는 같은 판정으로 잘립니다. 그 뒤 omitEmpty를 적용하며 두 투영 모두 원본과 아이템 구조를 바꾸지 않습니다.

채움과 실제 null을 구별하지 않는 것은 저장·로드 뒤에는 둘을 구별할 수 없어, 구별하면 같은 화면 상태의 출력이 저장 전후로 달라지기 때문입니다. 이 옵션은 작성자가 배열마다 켜는 "꼬리의 빈 값은 잡음"이라는 선언이므로 nullable 아이템의 null도 자릅니다. 꼬리 null이 의미를 갖는 배열에서는 켜지 않습니다. 아이템이 omitEmpty를 꺼도 꼬리의 빈 값은 잘립니다.

판정은 각 자리의 값만 얕게 봅니다. branch의 자리는 아이템 투영을 거친 방출이므로, 기본 omitEmpty에서 `{ name: '' }` 행은 name이 빠져 빈 객체가 되고 잘립니다. terminal은 아이템 투영 없이 원본을 보므로 같은 `{ name: '' }`가 남고, 빈 행은 입력이 undefined나 {}로 내보내야 합니다. terminal에서 아이템 스키마대로 안쪽을 정리하면 아이템 노드의 일을 다시 구현하게 되므로 하지 않으며, 두 전략의 결과는 이 차이만큼 다를 수 있습니다. 빈 객체의 뜻은 [behaviors 계약의 empty-values](../DETAIL.md)를 따릅니다.

꼬리가 생략된 방출로 새로 마운트하면 아이템 수가 줄 수 있습니다. 방출 없는 문자열 아이템을 채운 null은 저장·로드 뒤 실제 null이어서 nullable이 아닌 아이템에서 misfit이 켜질 수 있습니다. 두 트리를 같게 하려고 원본 아이템을 지우거나 로드된 null을 undefined로 되돌리지 않습니다. nullable 허용은 그 null을 유효한 값으로 만드는 선택이고, omitTrailingEmpty는 nullable 여부와 상관없이 꼬리를 출력에서 빼는 선택입니다.

### array-terminal — 통째 원본과 자리별 합성을 섞지 않습니다

terminal은 자식 없이 통째 배열 참조를 유지하고, 유효한 구조 변경은 원본 사본의 계획으로 나타냅니다. branch의 종류별 빈자리 채움과 아이템 수명 로그를 terminal에 적용하지 않습니다. 내부 정규화 부재와 JSON 왕복의 한계는 [validation 계약](../../validation/DETAIL.md)을 따릅니다.

### array-arrange — 계획의 유효성은 기존 자리의 유무에 따릅니다

기존 아이템을 요구하는 update·remove·pop·clear는 잘못된 색인·빈 배열·비배열 원본에서 무동작입니다. push와 0번 insert는 새 아이템을 만들므로 비배열 원본을 대체할 계획을 허용합니다. insert는 현재 길이 N을 포함한 정수 범위 [0, N]을 받아 끝 삽입과 push를 일치시킵니다. minItems 채움이나 maxItems 거부를 이 계획에 넣으면 검증 제약이 입력 교정으로 바뀝니다.

### array-empty-declarations — 선언 부재와 비활성을 구별합니다

완성된 불변 청사진의 item·prefixItems·itemCandidates·prefixItemCandidates가 모두 undefined일 때만 길이와 무관한 공유 빈 선언을 사용합니다. 존재하는 빈 목록이나 비활성 후보는 이 증명이 아닙니다. 원본 스키마나 현재 활성 분기만 보고 생략하면 다른 게이트의 후보를 잃습니다. 일반 선언은 트리별 live host와 개수로 메모하여 같은 청사진을 쓰는 폼들이 서로의 결과를 교체하지 않게 합니다.

### array-assembly-cost — 비교 절감과 사본 비용을 구별합니다

안정 형상에서는 재계산된 자리만 비교하고 변경 시 배열 사본 하나를 만듭니다. 정착이 덧붙임·끝 자르기 증명을 준 경우도 이전 합성의 사본에 필요한 자리만 반영하며, 증명이 깨지면 전체 합성으로 돌아갑니다. 비교량 절감이 배열 복사의 O(N) 시간·메모리를 없애지는 않습니다. 같은 결과의 참조와 실제 아이템 종류를 보존해야 최적화가 게이트 전환의 값을 바꾸지 않습니다.

## Last Updated

자리별 종류·빈자리 채움·꼬리 투영·순수 구조 계획 또는 합성 증명이 바뀔 때 갱신합니다.
