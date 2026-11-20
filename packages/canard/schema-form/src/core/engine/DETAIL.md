# engine contract

## Requirements

NODE-016·045. 의존은 청사진·레코드·순수 동작과 탐색·검증·파생·정착·쓰기 방향으로 흐릅니다. 검증 결과는 주입된 콜백으로 되돌리며 타입 import로도 역방향 결합을 만들지 않습니다. surface는 engine 진입점을 사용하고 자식은 형제의 진입점을 직접 사용합니다. 여러 자식이 공유하는 순수 보조는 이 경계에 두고 자식의 구현 형을 가져오지 않도록 필요한 칸만 구조적으로 받습니다.

경로 문법은 [jsonPointer](../../helpers/jsonPointer/DETAIL.md)의 정본을 사용합니다. 주소 해석과 현재 형상 조회를 섞으면 배열 이동·재진입 뒤 같은 주소가 다른 발생을 가리키는 사실을 잃습니다. 정적 작성 색인은 질의 miss로 늘리지 않으며 runtime 문법 메모는 트리 수명과 한도를 따릅니다. 생성기 스키마 코퍼스의 정본은 여러 자식이 소비하는 engine 시험 fixture에 둡니다.

## API Contracts

저장 주소의 가상 확장은 공통 resolveStorageTargets가 소유합니다. 실제 노드는 자기 path를 사용하고 가상 그룹은 작성된 필드 순서대로 부모의 실제 저장 주소와 현재 노드를 제공합니다. reset의 로드 원천·배치 표시 충돌·updater 합성·검증 범위는 이 해석을 공유하여 가상 이름을 데이터 키로 사용하지 않습니다. 꺼진 필드도 튜플 위치와 저장 주소를 유지하되 현재 노드는 없을 수 있습니다. 실제 대상에는 확장 배열을 할당하지 않습니다.

### virtual-storage-model — 가상 튜플과 저장 주소의 상태 모형

가상 그룹은 데이터·원본·스냅숏을 소유하지 않습니다. 모형은 `(fields, host.child(name)?.storedValue, host.retainedSlotOrOverlay(name), root.loadSnapshotAt(storagePath))`의 투영입니다. 각 constituent는 활성(visible: false 포함), 조건 비활성, 현재 oneOf·if 분기 부재 중 하나이며 보유 원본 유무와 별개입니다. 그룹 자체의 활성 상태도 별개입니다.

#### 읽기와 쓰기

- value는 fields 길이의 튜플입니다. 활성 칸은 storedValue, 비활성·부재 칸은 undefined이며 순서를 압축하지 않습니다. children은 활성 constituent의 선언 순서 투영이므로 field 이름으로 칸과 연결합니다.
- setValue는 undefined 또는 정확한 길이의 배열을 받습니다. undefined는 모든 칸에 undefined를 준 것과 같고, sparse 배열의 빈 칸도 undefined입니다. null·비배열·짧거나 긴 배열은 INVALID_VIRTUAL_NODE_VALUES로 변경 전에 거부합니다. 배치의 거부는 앞선 표시를 취소하지 않습니다(EVENT-017).
- 각 칸은 **호출 진입 시점** constituent 상태로 분류합니다. undefined는 활성 칸을 비우고 비활성·부재 칸에서는 무시합니다. 같은 호출에서 gate가 켜져도 분류를 다시 하지 않습니다. 비활성·부재 칸의 non-undefined는 일반 비활성 선언 쓰기처럼 overlay에 보유하며 gate exit의 unset 정책과 별개입니다. 명시적으로 보유 값을 지우려면 살아 있는 호스트의 해당 이름에 undefined를 씁니다.
- Overwrite는 각 constituent의 전체 교체, Merge는 branch 객체 칸의 재귀 병합이며 그 밖의 칸은 일반 Merge 계약을 따릅니다. 튜플 자체의 길이를 Merge로 바꾸지는 않습니다.
- 같음은 VALUE-021(SameValueZero·배열·plain 객체 내용, 불투명 값 참조)입니다. 유효한 튜플이 직전 유효 뷰와 같으면 원본·overlay·스냅숏·상태·오류·배달·재검증을 바꾸지 않습니다. 배치의 유효 뷰는 직전 committed storedValue에 앞선 표시를 얹은 값이며 공개 value는 committed 값입니다. 그러므로 앞선 표시와 다른 오래된 group.value를 다시 쓰면 그 표시는 덮일 수 있습니다. updater는 EVENT-061의 유효 뷰를 한 번 받습니다. 배치 중 gate 표시만으로 미정착 활성 상태를 새로 계산하지 않습니다.

#### 초기화와 주소 범위

살아 있는 가상 그룹의 resetSubtree는 비활성·분기 부재 constituent까지 각 저장 주소에서 로드 스냅숏을 읽어 초기화합니다. 스냅숏이 생략한 값은 보유 원본을 지우며 재활성화의 새 수명에서 SETTLE-005의 default를 채웁니다. 살아 있는 constituent는 그 노드의 resetSubtree처럼 자기 주소 범위의 보유 원본을 먼저 지우므로, 그 안의 조건 비활성 자손이 보유한 값도 스냅숏이 생략하면 지워집니다. 그룹 reset 결과는 각 constituent를 자기 노드에서 reset한 결과와 같습니다. 떼어진 constituent 자체 참조 또는 떼어진 가상 그룹의 resetSubtree는 무동작입니다. FormHandle.reset과 native form reset은 같은 폼 로드 수명으로 실제 저장 주소를 재로드하며 가상 이름을 데이터 키로 쓰지 않습니다.

저장 주소 동사는 닫힌 목록 `value`, `setValue`, `resetSubtree`, `defaultValue`, `isDivergent`, `inactiveValues`, `validate`입니다. defaultValue는 constituent별 스냅숏 튜플(비활성 칸 포함), isDivergent는 constituent 저장 출력과 로드 기준의 차이 중 하나라도 있으면 true, inactiveValues는 constituent 범위의 보유 값 목록입니다. outputValue는 항상 undefined이며 실제 제출 값은 부모의 outputValue입니다.

#### 나머지 노드 표면과 오류

errors는 그룹에 직접 지정한 외부 오류와 해당 노드에 배정된 판정만 읽습니다. 실제 constituent 오류를 그룹이나 다른 활성 칸으로 옮기지 않습니다. setExternalErrors·clearExternalErrors는 그룹 자체의 명령형 오류를 교체·삭제하고 globalErrors에 반영하며 constituent에 복제하지 않습니다. validate는 fields 저장 주소 범위의 판정을 갱신합니다. 비활성·부재 constituent issue도 globalErrors에 남아 유효성에 참여하지만 그룹·활성 형제 errors에 배정하지 않습니다.

setState·state는 그룹 자신의 상호작용을, setSubtreeState·clearSubtreeState는 그룹과 현재 활성 constituent 하위 트리를 바꿉니다. 비활성 원본은 건드리지 않습니다. globalState·globalErrors는 폼 전체 목록이며 subscribe·revision·request는 그 노드의 배달·명령 의미를 유지합니다. onInactive는 해당 그룹 발생의 정상 keep gate exit에 등록되며 constituent의 resolver로 복제되지 않습니다. 배열 동사는 가상 그룹에 사용할 수 없어 종류 오류를 내며 실제 배열 constituent를 찾아 호출합니다. detached defaultValue·inactiveValues는 이탈 직전 투영을 보존하고 isDivergent는 일반 detached 계약처럼 false입니다. 쓰기·reset·상태·오류 명령은 기존 detached 계약을 따릅니다.

#### 선언·반응형 규칙과 토폴로지

virtual entry의 controls.active·visible·readOnly·disabled 및 일반 제어 선언은 일반 gate·상태 규칙을 따릅니다. controls.default·derived·injectTo가 가상 그룹에 쓰면 튜플을 setValue의 칸 분류와 같이 constituent 주소로 분배하고 그룹 주소에는 source·slot을 만들지 않습니다. 분류는 그 쓰기 시점의 constituent 상태를 따릅니다. 활성 칸은 교체하며 undefined로 비우고, 비활성·부재 칸의 non-undefined는 그 constituent 칸에 보유하며 undefined는 무시합니다. 그룹 자체가 비활성이어도 그룹 노드 없이 같은 constituent 주소로 분배합니다. 그러므로 정의된 칸의 결과는 같은 값을 constituent 주소에 직접 쓴 결과와 같습니다. 다른 필드의 식·watch·injectTo가 가상 경로를 읽으면 출력 트리에 그 키가 없어 undefined입니다. 반응형 규칙이 그룹 밖을 명시적으로 바꾸는 경우는 저장 격리의 예외입니다.

fields는 직계 실제 프로퍼티 이름만 허용합니다. 중복은 VIRTUAL_FIELDS_NOT_VALID, 다른 가상 그룹을 이름으로 참조하는 중첩 그룹은 VIRTUAL_FIELDS_NOT_IN_PROPERTIES로 생성 단계에 거부합니다. 빈 fields는 빈 튜플·빈 자식·빈 저장 범위로 허용합니다. 두 그룹이 constituent를 공유하면 마지막 실제 주소 쓰기가 이기며 reset도 겹친 실제 주소에만 적용하고 배달 순서는 일반 문서 순서입니다. 배열 item 안의 그룹은 item 신원·이동 주소·로드 스냅숏 정렬을 따르며 remove·clear 뒤 옛 그룹 쓰기는 무동작입니다. 부모 JSON 입력에 가상 이름을 넣으면 선언된 가상 키이므로 extras나 constituent 쓰기로 해석하지 않고 무시합니다.

#### 사건 뒤의 불변식

모든 사건 뒤 tuple 길이·이름 대응·활성 children 투영을 확인합니다. 그룹 밖 필드의 storedValue·보유 원본·노드 신원·상호작용·오류는 해당 constituent와 교차하는 선언된 반응형 규칙의 의존 폐쇄 밖에서 보존됩니다. 같은 유효 튜플 쓰기는 전체 모형 상태를 보존합니다. 그룹 reset 후 각 constituent를 활성화한 결과는 같은 constituents에 대한 부모 reset 후 활성화 결과 및 각 constituent 자체 reset 후 활성화 결과와 같습니다. 그룹에 대한 선언적 쓰기는 그룹의 활성 여부와 무관하게 같은 칸 분류의 setValue 분배와 같습니다. 순환 입력의 구조 동등성은 VALUE-021의 기존 비보장 범위이며 이 계약이 추가 보장하지 않습니다.

정착 사슬과 검증 snapshot의 얕은 입력 판정은 객체 참조와 원시 SameValueZero를 사용합니다. NaN의 자기 불일치를 새 입력으로 오인하면 무변경 쓰기가 콜백·검증을 되먹이므로 깊은 값 비교와 구별한 공유 판정을 사용합니다.

### SETTLE-043 — 값 변경의 공통 의미

VALUE-021. 원시는 SameValueZero로 비교하여 NaN끼리, -0과 0을 같은 값으로 봅니다. 배열은 길이·원소 순서, 평범한 객체는 prototype과 own 열거 키의 순서·값을 비교하고 다른 객체·함수는 참조로 봅니다. 같은 참조에는 내려가지 않습니다. 배달·감시·파생에서 서로 다른 같음 판정을 쓰면 같은 값을 새 변경으로 알리거나 에지를 반복 소비합니다. 호출자가 같은 객체를 제자리 변경한 사실과 순환 객체의 구조 동등성을 보장하지 않습니다.

깊은 비교의 지름길은 불변 입력의 공유를 전제로 합니다. 통째 교체한 컨테이너의 원소를 훑는 비용과 바뀌지 않은 원소 내부까지 내려가는 비용을 구별합니다. 참조 복원 시점·배달 후보는 [settle](settle/DETAIL.md), 에지 기준은 [derive](derive/DETAIL.md)가 소유합니다. 값 의미를 포기해 성능 선을 맞추지 않습니다(TEST-071).

### engine-derived-lifetimes — 파생 레코드와 생성 사실

청사진·호스트의 파생 슬롯은 각 소유자가 독립적으로 지연 준비합니다. 읽기만으로 모든 슬롯을 채우지 않고 미준비·null·false 결과를 구별하여 부적격 분석을 반복하지 않습니다. 불변 분석만 공유하고 살아 있는 값·노드·판정을 이 수명에 저장하지 않습니다. 생성 때 확정한 사실은 폐기 가능한 파생 저장소에 넣지 않아 모드 변경 뒤 청사진의 의미가 사라지지 않게 합니다(SURFACE-065).

모드의 실제 변경은 두 파생 저장소를 교체하므로 트리 생성 전에만 지정하고 시험·벤치는 finally에서 복원합니다. 상수·단조 ID는 캐시 초기화 대상이 아닙니다. 노드·트리 메모의 보유·reset·폐기는 [record](record/DETAIL.md), 소비자 요청 캐시는 [app/cache](../../app/cache/DETAIL.md)의 다른 수명입니다. 내부 모드와 초기화 통로를 패키지에 공개하지 않습니다.

### fragment-owner-paths — 조각 소유권의 공통 언어

CONTROLS-077. 조각이 직접 선언한 properties·prefixItems·items·additionalItems 경로를 하나의 공통 판정으로 읽습니다. 이름의 단순 접두 일치로 itemsList 같은 다른 이름을 소유 자식으로 오인하지 않습니다. 배열의 템플릿과 구체 위치 모두 같은 소유 의미를 사용하여 청사진의 색인·정착의 제어 층·파생의 대상이 갈라지지 않게 합니다. 실제 규칙 실행은 각 자식의 계약입니다.

### schema-options — 열린 작성 옵션의 형

AuthoredSchema의 options는 알려진 옵션 형에 소비자 Options 제네릭과 열린 any 인덱스를 교차합니다. 알려진 키를 any로 넓히지 않아 자동완성과 오타 방어를 유지하며 controls의 닫힌 형은 바꾸지 않습니다. 런타임 수용·검사 정책은 [buildNodes](blueprint/buildNodes/DETAIL.md)에 둡니다.

### validated-control-reads — 검증된 선언의 읽기

공유 제어 읽기는 collectDeclarations가 validateControlGroups를 마친 선언 및 그 선언에서 만든 유효 스키마만 받습니다. 얕은 형 보증과 예외는 [buildNodes의 읽기 계약](blueprint/buildNodes/DETAIL.md#reserved-read-trust--로드-검증을-통과한-읽기--validated-reads)을 따릅니다. Read 헬퍼는 검증된 선언과 그 유효 투영을 신뢰하며, 이 보증을 검증 전 선언이나 임의의 외부 스키마로 넓히지 않습니다. 타입 뷰는 복사나 보유 상태를 추가하지 않습니다.

입력 형은 선택적인 검증된 controls 봉투를 가진 구조 또는 boolean 스키마로 제한합니다. 프로퍼티를 직접 읽어 반환 형의 보증이 Reflect.get의 any에 의존하지 않게 하며, 호출자가 형을 단언해 검증 경계를 우회하지 않습니다.

### engine-shared-storage — 공동 보조의 비용과 경계

경로 키 저장소는 native Map·Set 의미를 유지하며 항목 수 K와 깊이 D에 따른 O(KD) 접두 참조·색인 비용으로 국소 조회를 지원합니다. 인스턴스 adoption이나 메서드 패치를 하지 않습니다. 기능 부재가 정적으로 증명된 경우만 공유 읽기 전용 빈 Map·Set을 사용합니다. 공유 동결 빈 배열은 identity sentinel을 제외하고 공용 EMPTY_ARRAY를 사용하여 변화 없는 읽기에 할당을 더하지 않습니다.

객체 합성과 extras 복사가 공유하는 안전한 키 쓰기는 이 경계에 두고 **proto**를 own property로 보존합니다. union fold를 포함하는 종류 정체성도 공통 보조로 계산하여 자식별 충돌 판정이 달라지지 않게 합니다. 별도 노드 고정 칸이나 영구 토큰 캐시를 더하지 않습니다.

### schema-keyword-positions — 스키마 위치의 단일 어휘

검증기 사본의 폼 그룹 제거와 terminal 하위 경고 조사는 같은 스키마 위치를 읽습니다. 그 위치는 `@winglet/json-schema/keyword`의 DEFAULT_KEYWORDS에서 종류별로 모듈 초기화 때 한 번 파생하며, 두 소비자가 목록을 따로 두지 않습니다. 따로 두면 한쪽 목록에서만 키워드가 빠져, 사본에서 지워지는 확장 키를 경고하지 않게 됩니다. 방언 표시는 쓰지 않고 모든 철자의 위치를 읽으며, 단일 위치의 배열은 튜플로 읽습니다. 이 표의 키워드가 바뀌면 이 패키지의 코드가 바뀌지 않아도 두 동작이 함께 바뀝니다.

### 포인터 문법의 제한된 호출 계측

- 다음 여덟 시험은 `helpers/jsonPointer`의 내부 모듈 하나를 `vi.mock`으로 감싸 호출 수를 센다. 호출 수는 jsonPointer index로 나가지 않는 내부 함수의 일이고, 감싸기는 import 간선을 만들지 않으므로 파일마다 하나의 내부 모듈만 선언한다. 패턴이 아니라 파일 목록이며, 여기에 없는 시험은 같은 방식으로 내부를 감쌀 수 없다.
  - `utils/paths/__tests__/pointerSyntaxCache.test.ts`: 런타임 문법 캐시의 적중이 `utils/parsePointerSegments`를 다시 부르지 않음을 센다.
  - `settle/__tests__/settle.pointer-path-work.test.ts`: mount 뒤 첫 실제 쓰기가 `utils/parsePointerSegments`를 부르지 않음을 센다.
  - `settle/__tests__/settle.pointer-slot-work.test.ts`: 슬롯 경로 작업이 `utils/parsePointerSegments`를 부르지 않음을 센다.
  - `settle/__tests__/settle.pointer-watch-work.test.ts`: watch 해석과 전달이 `utils/parsePointerSegments`를 부르지 않음을 센다.
  - `settle/utils/dependencies/__tests__/getDependencyIndex.live-paths.test.ts`: 살아 있는 배열 경로의 확장이 `utils/parsePointerSegments`를 부르지 않음을 센다.
  - `settle/utils/dependencies/__tests__/getDependencyIndex.pointer-work.test.ts`: 의존 색인의 조회와 캐시 재충전이 부르는 `utils/parsePointerSegments` 횟수를 센다.
  - `blueprint/__tests__/blueprint.owned-inline-path-work.test.ts`: 자식 생산자의 이름 이스케이프 횟수를 `utils/formatSegment` 감싸기로 센다.
  - `settle/utils/gates/__tests__/getGateBudgetCap.pointer-work.test.ts`: 같은 gate의 예산 분류가 `utils/parsePointerSegments`를 한 번만 부르고 준비된 예산을 재사용함을 센다.

## Acceptance Criteria

### fixed-first-load-validation — 구조 선택과 검증 시점을 구별합니다

구조를 고르는 guard는 필요한 자리에서 동기로 실행하고 전체 검증 컴파일은 요청 경계를 따릅니다. 최초 검증이 원래 작성 루트를 사용하며 오류·검증 파동은 일반 마운트와 같습니다. 실행·예약 상세는 [validation](validation/DETAIL.md)과 [validationScheduling](validationScheduling/DETAIL.md)이 소유합니다.

### literal-star-controls — 예약 이름의 정확한 대상

별표 이름과 wildcard를 혼동하지 않고 fields·주입·watch가 같은 이름을 같은 속성으로 해석합니다. 문법 판정의 정본을 실행 계층별로 복제하지 않습니다.

### branchless-observables — 최적화의 관측 동등성

같은 스키마의 일반 분석과 빠른 분석은 최초와 후속 쓰기의 트리·값·오류·경고·진단·리비전·배달이 같습니다. 기능 부재를 증명하지 못한 입력은 일반 경로를 사용합니다.

### engine-entry — 조합 경계는 구현을 복제하지 않습니다

필요한 이름만 명명 재수출하며 내부 helpers와 시험·벤치 모드가 패키지 표면으로 새지 않습니다. 내부 모드의 검증은 실제 존재하는 선택·술어·바퀴·파생 경로를 대상으로 하며 슬롯 보존을 끄는 별도 원본 모델을 가정하지 않습니다.

## Boundary Exemptions

### `blueprint/buildNodes/utils/declarations/collectSchemaCapabilities.ts` — 같은 입력의 일반 분석 대조

- **Consumers**: `__tests__/blueprint.branchless-differential.test.ts`
- **Direct import**: `allowed`
- **Reason**: 같은 스키마의 일반 분석을 강제하는 capability 감싸기는 공개 입력으로 표현할 수 없으므로 이 통합 시험만 vi.mock으로 자식 내부를 감쌉니다. 공개 수출을 넓히거나 다른 시험으로 예외를 확대하지 않습니다.

## Last Updated

공통 값 동등성·파생 수명·의존 경계·공유 보조의 비용이나 통합 검증 경계가 바뀔 때 갱신합니다.
